'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signIn } from '@/lib/auth-client';

export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const response = await signIn.email({
      email: String(formData.get('email')),
      password: String(formData.get('password')),
    });

    setIsSubmitting(false);

    if (response.error) {
      setError(response.error.message ?? 'Unable to sign in.');
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-4 py-10">
      <section className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">Sign in</h1>
          <p className="mt-2 text-sm text-muted-foreground">Access your Habitix workspace.</p>
        </div>

        {error ? (
          <p
            role="alert"
            className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </p>
        ) : null}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block space-y-1.5 text-sm font-medium">
            <span>Email</span>
            <Input name="email" type="email" autoComplete="email" required />
          </label>
          <label className="block space-y-1.5 text-sm font-medium">
            <span>Password</span>
            <Input name="password" type="password" autoComplete="current-password" required />
          </label>
          <Button className="w-full" size="lg" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          New to Habitix?{' '}
          <Link className="font-medium text-primary hover:underline" href="/sign-up">
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}
