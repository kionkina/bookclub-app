'use client';

import { useState } from 'react';
import { setCurrentBook } from '@/lib/actions/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface Props {
  clubId: string;
}

export function SetBookForm({ clubId }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [pages, setPages] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);

    const result = await setCurrentBook(
      clubId,
      title.trim(),
      author.trim() || null,
      pages ? parseInt(pages) : null
    );

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success('Book updated!');
      setOpen(false);
      setTitle('');
      setAuthor('');
      setPages('');
    }
    setLoading(false);
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Set current book
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border p-4 space-y-3">
      <div className="space-y-1">
        <Label htmlFor="book-title">Title</Label>
        <Input id="book-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Book title" required />
      </div>
      <div className="space-y-1">
        <Label htmlFor="book-author">Author <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <Input id="book-author" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Author name" />
      </div>
      <div className="space-y-1">
        <Label htmlFor="book-pages">Pages <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <Input id="book-pages" type="number" value={pages} onChange={(e) => setPages(e.target.value)} placeholder="e.g. 320" />
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
        <Button type="submit" size="sm" disabled={loading}>{loading ? 'Saving...' : 'Set book'}</Button>
      </div>
    </form>
  );
}
