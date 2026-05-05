'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import type { Post } from '@/lib/types';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { CommentThread } from './CommentThread';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  post: Post;
  clubId: string;
  currentUserId: string;
}

export function PostCard({ post, clubId, currentUserId }: Props) {
  const [showComments, setShowComments] = useState(false);
  const author = post.profiles;
  const name = author?.display_name || 'Member';
  const commentCount = post.comments?.length ?? 0;

  return (
    <div className={cn('rounded-xl border bg-card p-4 space-y-3', post.is_pinned && 'border-primary/40')}>
      <div className="flex items-start gap-3">
        <UserAvatar name={name} avatarUrl={author?.avatar_url} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">{name}</span>
            {post.post_type === 'progress' && (
              <Badge variant="secondary" className="text-xs gap-1">
                <BookOpen className="w-3 h-3" />
                page {post.page_number}
              </Badge>
            )}
            {post.post_type === 'announcement' && (
              <Badge className="text-xs">Announcement</Badge>
            )}
            <span className="text-xs text-muted-foreground ml-auto">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </span>
          </div>
          <p className="text-sm mt-1 whitespace-pre-wrap">{post.content}</p>
        </div>
      </div>

      <button
        onClick={() => setShowComments(!showComments)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <MessageSquare className="w-3.5 h-3.5" />
        {commentCount > 0 ? `${commentCount} comment${commentCount !== 1 ? 's' : ''}` : 'Add comment'}
      </button>

      {showComments && (
        <CommentThread
          postId={post.id}
          clubId={clubId}
          initialComments={post.comments ?? []}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
}
