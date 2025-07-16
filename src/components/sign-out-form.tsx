'use client';
import { FormEvent } from 'react';
import { signOut } from '@/app/auth/auth';

export const SignOutForm = () => {
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await signOut({
      redirectTo: '/',
    });
  };

  return (
    <form 
      className="w-full" 
      onSubmit={handleSubmit}
    >
      <button
        type="submit"
        className="w-full text-left px-1 py-0.5 text-red-500"
      >
        Sign out
      </button>
    </form>
  );
};