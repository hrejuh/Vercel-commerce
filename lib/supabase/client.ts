import { createClient, User } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or anon key');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setLoading(false);
    });

    return () => {
      authListener?.unsubscribe();
    };
  }, []);

  return { user, loading };
};


export const signUp = async (email?: string, password?: string) => {
  if (!email || !password) {
    return { data: null, error: { message: 'Email and password are required.'} };
  }
  return supabase.auth.signUp({ email, password });
};

export const signInWithPassword = async (email?: string, password?: string) => {
  if (!email || !password) {
    return { data: null, error: { message: 'Email and password are required.'} };
  }
  return supabase.auth.signInWithPassword({ email, password });
};

export const signOut = async () => {
  return supabase.auth.signOut();
};
