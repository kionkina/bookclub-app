'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { voteMeetingOption } from '@/lib/actions/meetings';
import type { MeetingDateOption } from '@/lib/types';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Props {
  options: MeetingDateOption[];
  currentUserId: string;
  clubId: string;
  meetingStatus: string;
}

export function DatePollGrid({ options, currentUserId, clubId, meetingStatus }: Props) {
  const [voting, setVoting] = useState<string | null>(null);

  async function handleVote(optionId: string, available: boolean) {
    setVoting(optionId);
    const result = await voteMeetingOption(optionId, clubId, available);
    if (result?.error) toast.error(result.error);
    setVoting(null);
  }

  return (
    <div className="space-y-2">
      {options.map((option) => {
        const yesVotes = option.meeting_votes?.filter((v) => v.available) ?? [];
        const noVotes = option.meeting_votes?.filter((v) => !v.available) ?? [];
        const myVote = option.meeting_votes?.find((v) => v.user_id === currentUserId);
        const isConfirmed = option.is_confirmed;

        return (
          <div
            key={option.id}
            className={cn(
              'flex items-center gap-3 p-2.5 rounded-lg border',
              isConfirmed && 'border-primary bg-primary/5'
            )}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">
                {format(new Date(option.proposed_at), 'EEE, MMM d · h:mm a')}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {yesVotes.length} yes · {noVotes.length} no
              </p>
            </div>

            {meetingStatus === 'polling' && (
              <div className="flex gap-1">
                <button
                  onClick={() => handleVote(option.id, true)}
                  disabled={voting === option.id}
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center border transition-colors',
                    myVote?.available === true
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'hover:bg-green-50 hover:border-green-300'
                  )}
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleVote(option.id, false)}
                  disabled={voting === option.id}
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center border transition-colors',
                    myVote?.available === false
                      ? 'bg-red-500 border-red-500 text-white'
                      : 'hover:bg-red-50 hover:border-red-300'
                  )}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
