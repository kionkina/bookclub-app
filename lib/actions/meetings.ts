'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function createMeeting(
  clubId: string,
  title: string,
  description: string | null,
  location: string | null,
  dateOptions: string[]
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data: meeting, error: meetingError } = await supabase
    .from('meetings')
    .insert({
      club_id: clubId,
      title,
      description: description || null,
      location: location || null,
      created_by: user.id,
      status: 'polling',
    })
    .select()
    .single();

  if (meetingError || !meeting) return { error: 'Failed to create meeting' };

  if (dateOptions.length > 0) {
    await supabase.from('meeting_date_options').insert(
      dateOptions.map((d) => ({ meeting_id: meeting.id, proposed_at: d }))
    );
  }

  revalidatePath(`/clubs/${clubId}/meetings`);
  return { data: meeting };
}

export async function voteMeetingOption(
  optionId: string,
  clubId: string,
  available: boolean
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { error } = await supabase.from('meeting_votes').upsert(
    { option_id: optionId, user_id: user.id, available },
    { onConflict: 'option_id,user_id' }
  );

  if (error) return { error: 'Failed to record vote' };
  revalidatePath(`/clubs/${clubId}/meetings`);
  return { data: true };
}

export async function confirmMeetingDate(
  meetingId: string,
  optionId: string,
  clubId: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data: option } = await supabase
    .from('meeting_date_options')
    .select('proposed_at')
    .eq('id', optionId)
    .single();

  if (!option) return { error: 'Option not found' };

  const confirmedAt = option.proposed_at;

  // Reset all options then mark the winner
  await supabase
    .from('meeting_date_options')
    .update({ is_confirmed: false })
    .eq('meeting_id', meetingId);

  await supabase
    .from('meeting_date_options')
    .update({ is_confirmed: true })
    .eq('id', optionId);

  await supabase
    .from('meetings')
    .update({ status: 'confirmed', confirmed_at: confirmedAt, updated_at: new Date().toISOString() })
    .eq('id', meetingId);

  // Schedule SMS reminders: 24h and 1h before
  const confirmedDate = new Date(confirmedAt);
  const reminders = [
    {
      meeting_id: meetingId,
      scheduled_for: new Date(confirmedDate.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      reminder_offset: '24 hours',
      status: 'pending',
    },
    {
      meeting_id: meetingId,
      scheduled_for: new Date(confirmedDate.getTime() - 60 * 60 * 1000).toISOString(),
      reminder_offset: '1 hour',
      status: 'pending',
    },
  ];

  // Use service role to insert reminders (bypasses RLS)
  // This is intentional — reminders table has no client RLS
  // In production, this would be done via a separate secure endpoint
  // For now we rely on the fact that Server Actions run server-side
  const { createClient: createAdmin } = await import('@supabase/supabase-js').then(m => ({ createClient: m.createClient }));
  const adminSupabase = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  await adminSupabase.from('sms_reminders').upsert(reminders, { onConflict: 'meeting_id,reminder_offset' });

  revalidatePath(`/clubs/${clubId}/meetings`);
  return { data: true };
}

export async function cancelMeeting(meetingId: string, clubId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { error } = await supabase
    .from('meetings')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', meetingId);

  if (error) return { error: 'Failed to cancel meeting' };
  revalidatePath(`/clubs/${clubId}/meetings`);
  return { data: true };
}
