'use client';

import { useState } from 'react';
import { updateProfile } from '@/lib/actions/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import type { Profile } from '@/lib/types';

interface Props {
  profile: Profile | null;
  email?: string;
}

export function ProfileForm({ profile, email }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const result = await updateProfile(new FormData(e.currentTarget));
    if (result?.error) toast.error(result.error);
    else toast.success('Profile saved!');
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {email && (
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input value={email} disabled />
        </div>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="display_name">Display name</Label>
        <Input
          id="display_name"
          name="display_name"
          defaultValue={profile?.display_name ?? ''}
          placeholder="Your name"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="phone">
          Phone number{' '}
          <span className="text-muted-foreground font-normal text-xs">
            — for SMS meeting reminders
          </span>
        </Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={profile?.phone ?? ''}
          placeholder="+1 555 000 0000"
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save profile'}
      </Button>
    </form>
  );
}
