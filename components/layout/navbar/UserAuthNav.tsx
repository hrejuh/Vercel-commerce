'use client';

import Link from 'next/link';
import { useUser } from '@/lib/supabase/client';
import SignOutButton from '@/components/auth/SignOutButton';

export default function UserAuthNav() {
  const { user, loading } = useUser();

  if (loading) {
    return <div className="h-8 w-24 animate-pulse rounded bg-gray-200" />; // Placeholder for loading state
  }

  return (
    <div className="flex items-center gap-4">
      {user ? (
        <>
          <span className="text-sm text-gray-600 dark:text-neutral-400">{user.email}</span>
          <Link
            href="/orders"
            prefetch={true}
            className="text-sm text-gray-600 underline-offset-4 hover:text-black hover:underline dark:text-neutral-400 dark:hover:text-neutral-300"
          >
            My Orders
          </Link>
          <SignOutButton />
        </>
      ) : (
        <Link
          href="/auth"
          prefetch={true}
          className="text-neutral-500 underline-offset-4 hover:text-black hover:underline dark:text-neutral-400 dark:hover:text-neutral-300"
        >
          Sign In
        </Link>
      )}
    </div>
  );
}
