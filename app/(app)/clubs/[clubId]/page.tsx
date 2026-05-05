import { createClient } from '@/lib/supabase/server';
import { FeedList } from '@/components/feed/FeedList';
import { PostComposer } from '@/components/feed/PostComposer';
import type { Post } from '@/lib/types';

export default async function ClubFeedPage({
  params,
}: {
  params: Promise<{ clubId: string }>;
}) {
  const { clubId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: posts } = await supabase
    .from('posts')
    .select('*, profiles(id, display_name, avatar_url), comments(id, author_id, content, created_at, profiles(id, display_name, avatar_url))')
    .eq('club_id', clubId)
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div className="px-4 space-y-4">
      <PostComposer clubId={clubId} />
      <FeedList
        initialPosts={(posts as Post[]) ?? []}
        clubId={clubId}
        currentUserId={user!.id}
      />
    </div>
  );
}
