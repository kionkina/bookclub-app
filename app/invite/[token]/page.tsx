export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { buttonVariants } from '@/components/ui/button';
import { BookOpen, Users } from 'lucide-react';
import { JoinClubButton } from './JoinClubButton';

async function getClubByToken(token: string) {
  // Use service role to bypass RLS for invite preview
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data: club } = await supabase
    .from('clubs')
    .select('id, name, description')
    .eq('invite_token', token)
    .single();

  if (!club) return null;

  const { count } = await supabase
    .from('club_members')
    .select('*', { count: 'exact', head: true })
    .eq('club_id', club.id);

  return { ...club, memberCount: count ?? 0 };
}

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const club = await getClubByToken(token);

  if (!club) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <p className="font-medium">This invite link is invalid or has expired.</p>
        <Link href="/clubs" className={buttonVariants({ variant: 'link' })}>Go to my clubs</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{club.name}</h1>
          {club.description && (
            <p className="text-muted-foreground">{club.description}</p>
          )}
        </div>

        <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>{club.memberCount} {club.memberCount === 1 ? 'member' : 'members'}</span>
        </div>

        <JoinClubButton token={token} clubId={club.id} />
      </div>
    </div>
  );
}
