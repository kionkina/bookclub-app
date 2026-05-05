'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClub } from '@/lib/actions/clubs';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewClubPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await createClub(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
    // On success, createClub redirects — no need to handle here
  }

  return (
    <div className="px-4 pt-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/clubs" className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}>
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold">New Club</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Club name</Label>
          <Input id="name" name="name" placeholder="e.g. Tuesday Night Reads" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="description">Description <span className="text-muted-foreground font-normal">(optional)</span></Label>
          <Textarea
            id="description"
            name="description"
            placeholder="What's your club about?"
            rows={3}
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating...' : 'Create club'}
        </Button>
      </form>
    </div>
  );
}
