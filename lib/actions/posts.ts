'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function createPost(
  clubId: string,
  content: string,
  postType: 'general' | 'progress' | 'announcement' = 'general',
  pageNumber?: number
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { error } = await supabase.from('posts').insert({
    club_id: clubId,
    author_id: user.id,
    content,
    post_type: postType,
    page_number: pageNumber ?? null,
  });

  if (error) return { error: 'Failed to create post' };
  revalidatePath(`/clubs/${clubId}`);
  return { data: true };
}

export async function addComment(postId: string, clubId: string, content: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { error } = await supabase.from('comments').insert({
    post_id: postId,
    author_id: user.id,
    content,
  });

  if (error) return { error: 'Failed to add comment' };
  revalidatePath(`/clubs/${clubId}`);
  return { data: true };
}

export async function deletePost(postId: string, clubId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)
    .eq('author_id', user.id);

  if (error) return { error: 'Failed to delete post' };
  revalidatePath(`/clubs/${clubId}`);
  return { data: true };
}
