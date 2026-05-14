import { format } from 'date-fns';
import { Target } from 'lucide-react';

interface Props {
  targetPage: number;
  meetingDate: string;
  myPage: number;
}

export function NextMeetingTarget({ targetPage, meetingDate, myPage }: Props) {
  const remaining = Math.max(targetPage - myPage, 0);
  const onTrack = myPage >= targetPage;

  return (
    <div className="rounded-xl border bg-card p-4 space-y-2">
      <div className="flex items-center gap-2">
        <Target className="w-4 h-4 text-primary" />
        <p className="font-semibold text-sm">Next meeting target</p>
      </div>
      <p className="text-sm">
        Read to <span className="font-medium">page {targetPage}</span> by{' '}
        <span className="font-medium">
          {format(new Date(meetingDate), 'EEE, MMM d')}
        </span>
      </p>
      <p className="text-xs text-muted-foreground">
        {onTrack
          ? `You're ahead — at page ${myPage}.`
          : `You're on page ${myPage} · ${remaining} pages to go.`}
      </p>
    </div>
  );
}
