import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ClubLayoutClient } from './ClubLayoutClient';

export default async function ClubLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ clubId: string }>;
}) {
  const { clubId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: club } = await supabase
    .from('clubs')
    .select('id, name, description, invite_token')
    .eq('id', clubId)
    .single();

  if (!club) notFound();

  const { data: membership } = await supabase
    .from('club_members')
    .select('role')
    .eq('club_id', clubId)
    .eq('user_id', user!.id)
    .single();

  if (!membership) notFound();

  return (
    <ClubLayoutClient
      club={club}
      isAdmin={membership.role === 'admin'}
      clubId={clubId}
    >
      {children}
    </ClubLayoutClient>
  );
}
