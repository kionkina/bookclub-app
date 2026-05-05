'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function upsertReadingProgress(
  clubId: string,
  bookId: string,
  currentPage: number,
  totalPages: number | null,
  note?: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  // Upsert reading progress
  const { error: progressError } = await supabase.from('reading_progress').upsert(
    {
      club_id: clubId,
      book_id: bookId,
      user_id: user.id,
      current_page: currentPage,
      note: note || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'club_id,book_id,user_id' }
  );

  if (progressError) return { error: 'Failed to update progress' };

  // Get profile for post content
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single();

  const name = profile?.display_name || 'Someone';
  const pageText = totalPages ? `page ${currentPage} of ${totalPages}` : `page ${currentPage}`;
  const content = note
    ? `${name} is on ${pageText} — "${note}"`
    : `${name} is on ${pageText}`;

  // Create a progress post in the feed
  await supabase.from('posts').insert({
    club_id: clubId,
    author_id: user.id,
    content,
    post_type: 'progress',
    page_number: currentPage,
  });

  revalidatePath(`/clubs/${clubId}`);
  revalidatePath(`/clubs/${clubId}/book`);
  return { data: true };
}

export async function setCurrentBook(
  clubId: string,
  title: string,
  author: string | null,
  pageCount: number | null
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  // Move existing current book to past
  await supabase
    .from('books')
    .update({ status: 'past', finished_at: new Date().toISOString().split('T')[0] })
    .eq('club_id', clubId)
    .eq('status', 'current');

  const { error } = await supabase.from('books').insert({
    club_id: clubId,
    title,
    author: author || null,
    page_count: pageCount || null,
    status: 'current',
    started_at: new Date().toISOString().split('T')[0],
    created_by: user.id,
  });

  if (error) return { error: 'Failed to set book' };
  revalidatePath(`/clubs/${clubId}/book`);
  return { data: true };
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const display_name = formData.get('display_name') as string;
  const phone = formData.get('phone') as string | null;
  const timezone = formData.get('timezone') as string | null;

  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: display_name?.trim() || null,
      phone: phone?.trim() || null,
      timezone: timezone || 'UTC',
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) return { error: 'Failed to update profile' };
  revalidatePath('/profile');
  return { data: true };
}
