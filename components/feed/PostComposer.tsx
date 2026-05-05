'use client';

import { useState } from 'react';
import { createPost } from '@/lib/actions/posts';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Props {
  clubId: string;
}

export function PostComposer({ clubId }: Props) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);

    const result = await createPost(clubId, content.trim());
    if (result?.error) {
      toast.error(result.error);
    } else {
      setContent('');
      setOpen(false);
    }
    setLoading(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full text-left px-4 py-3 rounded-xl border bg-muted/40 text-muted-foreground text-sm hover:bg-muted/60 transition-colors"
      >
        Share something with the club…
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 rounded-xl border p-3">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
        rows={3}
        className="border-0 p-0 resize-none focus-visible:ring-0 shadow-none text-sm"
        autoFocus
      />
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => { setOpen(false); setContent(''); }}
        >
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={loading || !content.trim()}>
          {loading ? 'Posting...' : 'Post'}
        </Button>
      </div>
    </form>
  );
}
