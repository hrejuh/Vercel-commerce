// supabase/functions/create-order/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2' // Ensure correct version for Deno

// CORS headers to allow requests from your frontend domain
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Replace '*' with your specific frontend domain in production
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS', // Specify methods
};

// Initialize Supabase client. In a real deployment, SUPABASE_URL and SUPABASE_ANON_KEY
// should be set as environment variables in the Edge Function settings.
// For invoking RPCs that are SECURITY DEFINER, the service_role key is often used
// if the function needs to bypass RLS for certain operations before calling the RPC,
// or if the RPC itself doesn't handle all necessary permissions.
// However, if the RPC function is well-defined (like ours which is SECURITY DEFINER),
// and the client making the call to the Edge Function is authenticated,
// we can use the user's JWT to initialize the client for RLS checks on preliminary queries (like cart validation).
// The actual RPC call will then execute with definer's privileges.

async function getSupabaseClient(req: Request): Promise<SupabaseClient> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    // This scenario should ideally not happen if client always sends Auth header.
    // Fallback to anon key for client init, but user-specific checks will fail.
    // Or, if service_role is available and appropriate for this function's design:
    // return createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    // For now, let's assume we proceed with anon key and rely on user extraction later.
     console.warn("No Authorization header found, initializing client with anon key. User-specific checks might fail or rely on RPC logic.");
     return createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? ''
      );
  }
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '', // For client init, anon key is fine. User context comes from JWT.
    { global: { headers: { Authorization: authHeader } } }
  );
}


serve(async (req) => {
  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  let supabaseClient;
  try {
    supabaseClient = await getSupabaseClient(req);
  } catch (error) {
    console.error('Error initializing Supabase client:', error);
    return new Response(JSON.stringify({ error: 'Failed to initialize Supabase client.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Get the authenticated user
  const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

  if (userError || !user) {
    console.error('Authentication error:', userError?.message);
    return new Response(JSON.stringify({ error: 'User not authenticated' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let cartId: string | null = null;
  let shippingAddress: any = null;
  let billingAddress: any = null;
  let paymentDetails: any = null;

  try {
    const body = await req.json();
    cartId = body.cartId;
    shippingAddress = body.shippingAddress;
    billingAddress = body.billingAddress;
    paymentDetails = body.paymentDetails;
  } catch (error) {
    console.error('Invalid request body:', error.message);
    return new Response(JSON.stringify({ error: 'Invalid request body: ' + error.message }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (!cartId) {
    return new Response(JSON.stringify({ error: 'cartId is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Optional: Validate cart ownership and existence before calling RPC.
  // This adds an extra layer of security/validation within the Edge Function itself.
  const { data: cartData, error: cartValidationError } = await supabaseClient
    .from('carts')
    .select('id, user_id') // Select only necessary fields for validation
    .eq('id', cartId)
    .eq('user_id', user.id) // Ensure cart belongs to the authenticated user
    .single();

  if (cartValidationError || !cartData) {
    let errorMsg = 'Invalid cart or cart not accessible by user.';
    if (cartValidationError && cartValidationError.code === 'PGRST116') { // Not found
        errorMsg = 'Cart not found for the user.';
    }
    console.error('Cart validation failed:', cartValidationError?.message || errorMsg);
    return new Response(JSON.stringify({ error: errorMsg }), {
      status: 403, // Forbidden or Not Found
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Call the PostgreSQL function `create_new_order_transactional`
    // The Supabase client for RPC calls implicitly uses the user's context if the client was initialized with it,
    // or service_role if it was initialized with service_role_key.
    // Since our DB function is SECURITY DEFINER, it runs with owner privileges,
    // but p_user_id parameter is correctly passed from the authenticated user.
    const { data: rpcData, error: rpcError } = await supabaseClient.rpc('create_new_order_transactional', {
      p_user_id: user.id,
      p_cart_id: cartId,
      p_shipping_address: shippingAddress,
      p_billing_address: billingAddress,
      p_payment_details: paymentDetails,
    });

    if (rpcError) {
      console.error('Error calling create_new_order_transactional DB function:', rpcError);
      // Check for specific error messages if needed, e.g., from RAISE EXCEPTION in SQL
      if (rpcError.message.includes('Cart total amount must be positive')) {
         return new Response(JSON.stringify({ error: 'Cannot create order: Cart is empty or total is zero.' }), {
             status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
         });
      }
      // More specific error handling based on SQL function's potential errors
      if (rpcError.message.includes('Failed to create order due to an internal error')) {
         return new Response(JSON.stringify({ error: 'Order creation failed due to a database error.' }), {
           status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
         });
      }
      return new Response(JSON.stringify({ error: 'Failed to create order: ' + rpcError.message }), {
        status: 500, // Or a more specific status code if determinable
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // rpcData should contain the order_id returned by the function
    const orderId = rpcData;
    if (!orderId) {
        console.error('DB function create_new_order_transactional did not return an orderId.');
        return new Response(JSON.stringify({ error: 'Order created, but orderId was not returned.' }), {
           status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
         });
    }

    // Optional: Trigger other async operations like sending a confirmation email
    // await supabaseClient.functions.invoke('send-order-confirmation-email', { body: { orderId }});

    return new Response(JSON.stringify({ orderId }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (e) {
    // Catch-all for unexpected errors during the process
    console.error('Unexpected error in create-order Edge Function:', e.message);
    return new Response(JSON.stringify({ error: 'An unexpected error occurred: ' + e.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
})
