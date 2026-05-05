'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { addComment } from '@/lib/actions/posts';
import { createClient } from '@/lib/supabase/client';
import type { Comment } from '@/lib/types';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Props {
  postId: string;
  clubId: string;
  initialComments: Comment[];
  currentUserId: string;
}

export function CommentThread({ postId, clubId, initialComments, currentUserId }: Props) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`comments:${postId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments', filter: `post_id=eq.${postId}` },
        async (payload) => {
          // Fetch the new comment with profile data
          const { data } = await supabase
            .from('comments')
            .select('*, profiles(id, display_name, avatar_url)')
            .eq('id', payload.new.id)
            .single();
          if (data) setComments((prev) => [...prev, data as Comment]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [postId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);

    const result = await addComment(postId, clubId, content.trim());
    if (result?.error) {
      toast.error(result.error);
    } else {
      setContent('');
    }
    setLoading(false);
  }

  return (
    <div className="space-y-2 pt-1 border-t">
      {comments.map((comment) => {
        const name = comment.profiles?.display_name || 'Member';
        return (
          <div key={comment.id} className="flex items-start gap-2">
            <UserAvatar name={name} avatarUrl={comment.profiles?.avatar_url} size="sm" />
            <div className="flex-1 bg-muted/50 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium">{name}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm mt-0.5">{comment.content}</p>
            </div>
          </div>
        );
      })}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a comment…"
          className="h-8 text-sm"
        />
        <Button type="submit" size="sm" variant="ghost" disabled={loading || !content.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
}
