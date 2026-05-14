'use client';

import { useState } from 'react';
import Link from 'next/link';
import { updateClub, regenerateInviteToken } from '@/lib/actions/clubs';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Copy, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  club: {
    id: string;
    name: string;
    description: string | null;
    invite_token: string;
  };
}

export function SettingsForm({ club }: Props) {
  const [name, setName] = useState(club.name);
  const [description, setDescription] = useState(club.description ?? '');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(club.invite_token);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.set('name', name);
    formData.set('description', description);
    const result = await updateClub(club.id, formData);
    if (result?.error) toast.error(result.error);
    else toast.success('Club updated!');
    setLoading(false);
  }

  async function handleRegenerate() {
    const result = await regenerateInviteToken(club.id);
    if (result?.error) {
      toast.error(result.error);
    } else if (result?.data) {
      setToken(result.data.invite_token);
      toast.success('New invite link generated!');
    }
  }

  const inviteUrl =
    typeof window !== 'undefined' ? `${window.location.origin}/invite/${token}` : `/invite/${token}`;

  async function copyInvite() {
    await navigator.clipboard.writeText(inviteUrl);
    toast.success('Copied!');
  }

  return (
    <div className="px-4 pt-2 space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/clubs/${club.id}`}
          className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold">Club settings</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Club name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save changes'}
        </Button>
      </form>

      <div className="space-y-3 rounded-xl border p-4">
        <div>
          <p className="font-medium text-sm">Invite link</p>
          <p className="text-xs text-muted-foreground">
            Share this link to let people join your club
          </p>
        </div>
        <div className="flex gap-2">
          <Input value={inviteUrl} readOnly className="text-xs" />
          <Button variant="outline" size="icon" onClick={copyInvite}>
            <Copy className="w-4 h-4" />
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRegenerate}
          className="gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Generate new link
        </Button>
      </div>
    </div>
  );
}
