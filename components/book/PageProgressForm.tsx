'use client';

import { useState } from 'react';
import { upsertReadingProgress } from '@/lib/actions/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface Props {
  clubId: string;
  bookId: string;
  totalPages: number | null;
  currentPage: number;
}

export function PageProgressForm({ clubId, bookId, totalPages, currentPage }: Props) {
  const [page, setPage] = useState(currentPage.toString());
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const pageNum = parseInt(page);
    if (isNaN(pageNum) || pageNum < 0) return;
    setLoading(true);

    const result = await upsertReadingProgress(clubId, bookId, pageNum, totalPages, note.trim() || undefined);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success('Progress updated!');
      setNote('');
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-4 space-y-3">
      <h3 className="font-semibold text-sm">Update my progress</h3>
      <div className="flex gap-3 items-end">
        <div className="space-y-1 flex-1">
          <Label htmlFor="page" className="text-xs">Current page</Label>
          <div className="flex items-center gap-2">
            <Input
              id="page"
              type="number"
              min={0}
              max={totalPages ?? undefined}
              value={page}
              onChange={(e) => setPage(e.target.value)}
              className="w-24"
            />
            {totalPages && (
              <span className="text-sm text-muted-foreground">of {totalPages}</span>
            )}
          </div>
        </div>
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? '...' : 'Update'}
        </Button>
      </div>
      <div className="space-y-1">
        <Label htmlFor="note" className="text-xs">Note <span className="text-muted-foreground">(optional — will appear in feed)</span></Label>
        <Input
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Can't put it down!"
        />
      </div>
    </form>
  );
}
