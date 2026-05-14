'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import type { Meeting } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { DatePollGrid } from './DatePollGrid';
import { confirmMeetingDate, cancelMeeting } from '@/lib/actions/meetings';
import { toast } from 'sonner';

interface Props {
  meeting: Meeting;
  clubId: string;
  currentUserId: string;
  isAdmin: boolean;
}

const statusColors = {
  polling: 'secondary',
  confirmed: 'default',
  cancelled: 'destructive',
} as const;

const statusLabels = {
  polling: 'Voting open',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
};

export function MeetingCard({ meeting, clubId, currentUserId, isAdmin }: Props) {
  const [expanded, setExpanded] = useState(meeting.status === 'polling');

  const confirmedOption = meeting.meeting_date_options?.find((o) => o.is_confirmed);

  async function handleConfirm(optionId: string) {
    const result = await confirmMeetingDate(meeting.id, optionId, clubId);
    if (result?.error) toast.error(result.error);
    else toast.success('Meeting date confirmed!');
  }

  async function handleCancel() {
    const result = await cancelMeeting(meeting.id, clubId);
    if (result?.error) toast.error(result.error);
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold">{meeting.title}</h3>
              <Badge variant={statusColors[meeting.status]}>{statusLabels[meeting.status]}</Badge>
            </div>

            {confirmedOption && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                {format(new Date(confirmedOption.proposed_at), 'EEE, MMM d · h:mm a')}
              </div>
            )}

            {meeting.location && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="w-3.5 h-3.5" />
                {meeting.location}
              </div>
            )}

            {meeting.target_page != null && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <BookOpen className="w-3.5 h-3.5" />
                Read to pg {meeting.target_page}
              </div>
            )}
          </div>

          {meeting.meeting_date_options && meeting.meeting_date_options.length > 0 && (
            <button onClick={() => setExpanded(!expanded)} className="text-muted-foreground">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {expanded && meeting.status !== 'cancelled' && meeting.meeting_date_options && (
        <div className="border-t px-4 py-3 space-y-3">
          <DatePollGrid
            options={meeting.meeting_date_options}
            currentUserId={currentUserId}
            clubId={clubId}
            meetingStatus={meeting.status}
          />
          {isAdmin && meeting.status === 'polling' && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="text-destructive"
                onClick={handleCancel}
              >
                Cancel meeting
              </Button>
            </div>
          )}
          {isAdmin && meeting.status === 'polling' && meeting.meeting_date_options.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Confirm a date:</p>
              <div className="flex flex-wrap gap-2">
                {meeting.meeting_date_options.map((opt) => (
                  <Button
                    key={opt.id}
                    size="sm"
                    variant="outline"
                    onClick={() => handleConfirm(opt.id)}
                  >
                    {format(new Date(opt.proposed_at), 'MMM d, h:mm a')}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
