'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { joinClub } from '@/lib/actions/clubs';
import { Button } from '@/components/ui/button';

interface Props {
  token: string;
  clubId: string;
}

export function JoinClubButton({ token, clubId }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Auto-join when landing back here after login redirect
  useEffect(() => {
    async function autoJoin() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setLoading(true);
      await joinClub(token);
      // joinClub redirects on success
      setLoading(false);
    }
    autoJoin();
  }, [token]);

  async function handleJoin() {
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push(`/login?next=/invite/${token}`);
      return;
    }

    await joinClub(token);
    setLoading(false);
  }

  return (
    <Button className="w-full" onClick={handleJoin} disabled={loading}>
      {loading ? 'Joining...' : 'Join club'}
    </Button>
  );
}
