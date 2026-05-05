import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MeetingCard } from '@/components/meetings/MeetingCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { CalendarPlus, Calendar } from 'lucide-react';
import type { Meeting } from '@/lib/types';

export default async function MeetingsPage({
  params,
}: {
  params: Promise<{ clubId: string }>;
}) {
  const { clubId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: membership } = await supabase
    .from('club_members')
    .select('role')
    .eq('club_id', clubId)
    .eq('user_id', user!.id)
    .single();

  const isAdmin = membership?.role === 'admin';

  const { data: meetings } = await supabase
    .from('meetings')
    .select('*, meeting_date_options(*, meeting_votes(*, profiles(id, display_name)))')
    .eq('club_id', clubId)
    .order('created_at', { ascending: false });

  return (
    <div className="px-4 space-y-4">
      {isAdmin && (
        <Link href={`/clubs/${clubId}/meetings/new`} className={cn(buttonVariants(), 'w-full gap-2')}>
          <CalendarPlus className="w-4 h-4" />
          Schedule a meeting
        </Link>
      )}

      {!meetings?.length ? (
        <EmptyState
          icon={<Calendar className="w-10 h-10" />}
          title="No meetings yet"
          description={isAdmin ? 'Schedule your first meeting above.' : 'Admins will schedule meetings here.'}
        />
      ) : (
        <div className="space-y-3">
          {(meetings as Meeting[]).map((meeting) => (
            <MeetingCard
              key={meeting.id}
              meeting={meeting}
              clubId={clubId}
              currentUserId={user!.id}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}
    </div>
  );
}
