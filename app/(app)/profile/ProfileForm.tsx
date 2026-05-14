'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateProfile } from '@/lib/actions/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import type { Profile } from '@/lib/types';

interface Props {
  profile: Profile | null;
  email?: string;
  welcome?: boolean;
}

export function ProfileForm({ profile, email, welcome }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const result = await updateProfile(new FormData(e.currentTarget));
    if (result?.error) {
      toast.error(result.error);
      setLoading(false);
      return;
    }
    toast.success('Profile saved!');
    setLoading(false);
    if (welcome) router.push('/clubs');
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
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Your name"
          required
          minLength={1}
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
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+1 555 000 0000"
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? 'Saving...' : welcome ? 'Continue' : 'Save profile'}
      </Button>
    </form>
  );
}
