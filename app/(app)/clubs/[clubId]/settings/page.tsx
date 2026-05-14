import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SettingsForm } from './SettingsForm';

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ clubId: string }>;
}) {
  const { clubId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: membership } = await supabase
    .from('club_members')
    .select('role')
    .eq('club_id', clubId)
    .eq('user_id', user.id)
    .single();

  if (!membership) notFound();
  if (membership.role !== 'admin') redirect(`/clubs/${clubId}`);

  const { data: club } = await supabase
    .from('clubs')
    .select('id, name, description, invite_token')
    .eq('id', clubId)
    .single();

  if (!club) notFound();

  return <SettingsForm club={club} />;
}
