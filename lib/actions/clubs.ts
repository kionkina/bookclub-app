'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function createClub(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const name = formData.get('name') as string;
  const description = formData.get('description') as string | null;

  if (!name?.trim()) return { error: 'Club name is required' };

  const { data: club, error: clubError } = await supabase
    .from('clubs')
    .insert({ name: name.trim(), description: description?.trim() || null, created_by: user.id })
    .select()
    .single();

  if (clubError || !club) return { error: clubError?.message ?? 'Failed to create club' };

  await supabase.from('club_members').insert({
    club_id: club.id,
    user_id: user.id,
    role: 'admin',
  });

  revalidatePath('/clubs');
  redirect(`/clubs/${club.id}`);
}

export async function joinClub(token: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data: club, error: clubError } = await supabase
    .from('clubs')
    .select('id')
    .eq('invite_token', token)
    .single();

  if (clubError || !club) return { error: 'Invalid invite link' };

  const { error: memberError } = await supabase.from('club_members').insert({
    club_id: club.id,
    user_id: user.id,
    role: 'member',
  });

  if (memberError) {
    if (memberError.code === '23505') {
      // Already a member — just redirect
      redirect(`/clubs/${club.id}`);
    }
    return { error: 'Failed to join club' };
  }

  revalidatePath('/clubs');
  redirect(`/clubs/${club.id}`);
}

export async function regenerateInviteToken(clubId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const isAdmin = await checkIsAdmin(supabase, clubId, user.id);
  if (!isAdmin) return { error: 'Forbidden' };

  const { data, error } = await supabase
    .from('clubs')
    .update({ invite_token: crypto.randomUUID().replace(/-/g, '').slice(0, 16) })
    .eq('id', clubId)
    .select('invite_token')
    .single();

  if (error) return { error: 'Failed to regenerate invite link' };
  revalidatePath(`/clubs/${clubId}/settings`);
  return { data };
}

export async function updateClub(clubId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const isAdmin = await checkIsAdmin(supabase, clubId, user.id);
  if (!isAdmin) return { error: 'Forbidden' };

  const name = formData.get('name') as string;
  const description = formData.get('description') as string | null;

  const { error } = await supabase
    .from('clubs')
    .update({ name: name.trim(), description: description?.trim() || null, updated_at: new Date().toISOString() })
    .eq('id', clubId);

  if (error) return { error: 'Failed to update club' };
  revalidatePath(`/clubs/${clubId}`);
  return { data: true };
}

export async function updateMemberRole(clubId: string, memberId: string, role: 'admin' | 'member') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const isAdmin = await checkIsAdmin(supabase, clubId, user.id);
  if (!isAdmin) return { error: 'Forbidden' };

  const { error } = await supabase
    .from('club_members')
    .update({ role })
    .eq('id', memberId)
    .eq('club_id', clubId);

  if (error) return { error: 'Failed to update role' };
  revalidatePath(`/clubs/${clubId}/members`);
  return { data: true };
}

export async function removeMember(clubId: string, memberId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const isAdmin = await checkIsAdmin(supabase, clubId, user.id);
  if (!isAdmin) return { error: 'Forbidden' };

  const { error } = await supabase
    .from('club_members')
    .delete()
    .eq('id', memberId)
    .eq('club_id', clubId);

  if (error) return { error: 'Failed to remove member' };
  revalidatePath(`/clubs/${clubId}/members`);
  return { data: true };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function checkIsAdmin(supabase: any, clubId: string, userId: string) {
  const { data } = await supabase
    .from('club_members')
    .select('role')
    .eq('club_id', clubId)
    .eq('user_id', userId)
    .single();
  return data?.role === 'admin';
}
