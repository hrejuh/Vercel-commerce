'use client';

import { useState } from 'react';
import SignIn from './SignIn';
import SignUp from './SignUp';

export default function AuthForm() {
  const [showSignIn, setShowSignIn] = useState(true);

  return (
    <div className="mx-auto w-full max-w-md space-y-8">
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {showSignIn ? 'Sign in to your account' : 'Create a new account'}
        </h2>
      </div>
      {showSignIn ? <SignIn /> : <SignUp />}
      <div className="mt-4 text-center">
        <button
          onClick={() => setShowSignIn(!showSignIn)}
          className="font-medium text-indigo-600 hover:text-indigo-500"
        >
          {showSignIn
            ? "Don't have an account? Sign Up"
            : 'Already have an account? Sign In'}
        </button>
      </div>
    </div>
  );
}
