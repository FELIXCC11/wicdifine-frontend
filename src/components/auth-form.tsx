import { FormEvent } from 'react';

import { Input } from './ui/input';
import { Label } from './ui/label';

export function AuthForm({
  action,
  children,
  defaultEmail = '',
}: {
  action: NonNullable<
    string | ((formData: FormData) => void | Promise<void>) | undefined
  >;
  children: React.ReactNode;
  defaultEmail?: string;
}) {
  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="email"
          className="text-gray-400 font-normal text-sm"
        >
          Email Address
        </Label>

        <Input
          id="email"
          name="email"
          className="bg-gray-900 border-gray-800 text-white h-11"
          type="email"
          placeholder="user@acme.com"
          autoComplete="email"
          required
          autoFocus
          defaultValue={defaultEmail}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label
          htmlFor="password"
          className="text-gray-400 font-normal text-sm"
        >
          Password
        </Label>

        <Input
          id="password"
          name="password"
          className="bg-gray-900 border-gray-800 text-white h-11"
          type="password"
          required
        />
      </div>

      {children}
    </form>
  );
}