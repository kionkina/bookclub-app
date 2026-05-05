'use client';

import { useState } from 'react';
import { updateMemberRole, removeMember } from '@/lib/actions/clubs';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  memberId: string;
  clubId: string;
  currentRole: 'admin' | 'member';
}

export function MemberActions({ memberId, clubId, currentRole }: Props) {
  const [open, setOpen] = useState(false);

  async function handleRoleToggle() {
    const newRole = currentRole === 'admin' ? 'member' : 'admin';
    const result = await updateMemberRole(clubId, memberId, newRole);
    if (result?.error) toast.error(result.error);
    else toast.success(`Role updated to ${newRole}`);
    setOpen(false);
  }

  async function handleRemove() {
    const result = await removeMember(clubId, memberId);
    if (result?.error) toast.error(result.error);
    else toast.success('Member removed');
    setOpen(false);
  }

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" onClick={() => setOpen(!open)}>
        <MoreHorizontal className="w-4 h-4" />
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 bg-background border rounded-lg shadow-lg py-1 min-w-[160px]">
            <button
              onClick={handleRoleToggle}
              className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
            >
              {currentRole === 'admin' ? 'Remove admin' : 'Make admin'}
            </button>
            <button
              onClick={handleRemove}
              className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-muted transition-colors"
            >
              Remove from club
            </button>
          </div>
        </>
      )}
    </div>
  );
}
