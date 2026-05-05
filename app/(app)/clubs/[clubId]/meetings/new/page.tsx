'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createMeeting } from '@/lib/actions/meetings';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useParams, useRouter } from 'next/navigation';

export default function NewMeetingPage() {
  const params = useParams();
  const clubId = params.clubId as string;
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('Book Club Meeting');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [dateOptions, setDateOptions] = useState<string[]>(['']);

  function addOption() {
    setDateOptions([...dateOptions, '']);
  }

  function removeOption(i: number) {
    setDateOptions(dateOptions.filter((_, idx) => idx !== i));
  }

  function updateOption(i: number, val: string) {
    const updated = [...dateOptions];
    updated[i] = val;
    setDateOptions(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const validDates = dateOptions.filter((d) => d.trim());
    const result = await createMeeting(
      clubId,
      title.trim(),
      description.trim() || null,
      location.trim() || null,
      validDates
    );

    if (result?.error) {
      toast.error(result.error);
      setLoading(false);
    } else {
      toast.success('Meeting created!');
      router.push(`/clubs/${clubId}/meetings`);
    }
  }

  return (
    <div className="px-4 pt-2 space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/clubs/${clubId}/meetings`} className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}>
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold">Schedule meeting</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Notes <span className="text-muted-foreground font-normal">(optional)</span></Label>
          <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="location">Location <span className="text-muted-foreground font-normal">(optional)</span></Label>
          <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Sarah's place or a Zoom link" />
        </div>

        <div className="space-y-2">
          <Label>Proposed dates</Label>
          {dateOptions.map((date, i) => (
            <div key={i} className="flex gap-2">
              <Input
                type="datetime-local"
                value={date}
                onChange={(e) => updateOption(i, e.target.value)}
                className="flex-1"
              />
              {dateOptions.length > 1 && (
                <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(i)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addOption} className="gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            Add another date
          </Button>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating...' : 'Create meeting'}
        </Button>
      </form>
    </div>
  );
}
