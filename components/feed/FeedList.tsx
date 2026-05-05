'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Post } from '@/lib/types';
import { PostCard } from './PostCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { MessageCircle } from 'lucide-react';

interface Props {
  initialPosts: Post[];
  clubId: string;
  currentUserId: string;
}

export function FeedList({ initialPosts, clubId, currentUserId }: Props) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`posts:${clubId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts', filter: `club_id=eq.${clubId}` },
        async (payload) => {
          const { data } = await supabase
            .from('posts')
            .select('*, profiles(id, display_name, avatar_url), comments(id, author_id, content, created_at, profiles(id, display_name, avatar_url))')
            .eq('id', payload.new.id)
            .single();
          if (data) setPosts((prev) => [data as Post, ...prev]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [clubId]);

  if (posts.length === 0) {
    return (
      <EmptyState
        icon={<MessageCircle className="w-10 h-10" />}
        title="No posts yet"
        description="Be the first to share something with the club!"
      />
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          clubId={clubId}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
}
