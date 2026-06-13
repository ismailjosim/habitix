'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signUp } from '@/lib/auth-client';
import { BrandLogo } from '@/components/app/brand-logo';

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const response = await signUp.email({
      name: String(formData.get('name')),
      email: String(formData.get('email')),
      password: String(formData.get('password')),
    });

    setIsSubmitting(false);

    if (response.error) {
      setError(response.error.message ?? 'Unable to create account.');
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-4 py-10">
      <section className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
        <Link href="/" aria-label="Habitix home" className="mb-7 block w-fit">
          <BrandLogo priority className="h-12 w-auto max-w-52" />
        </Link>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">Create account</h1>
          <p className="mt-2 text-sm text-muted-foreground">Start with a student workspace.</p>
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
            <span>Name</span>
            <Input name="name" autoComplete="name" required />
          </label>
          <label className="block space-y-1.5 text-sm font-medium">
            <span>Email</span>
            <Input name="email" type="email" autoComplete="email" required />
          </label>
          <label className="block space-y-1.5 text-sm font-medium">
            <span>Password</span>
            <Input
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>
          <Button className="w-full" size="lg" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link className="font-medium text-primary hover:underline" href="/sign-in">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
