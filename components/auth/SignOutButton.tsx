'use client';

import { signOut } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        console.error('Error signing out:', error.message);
      } else {
        console.log('Signed out successfully');
        router.push('/'); // Redirect to home page after sign out
        router.refresh(); // Refresh the current route to update UI
      }
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      className="rounded-md bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600"
    >
      Sign Out
    </button>
  );
}
