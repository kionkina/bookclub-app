import { createClient } from '@/lib/supabase/server';
import { EmptyState } from '@/components/shared/EmptyState';
import { SetBookForm } from '@/components/book/SetBookForm';
import { CurrentBookCard } from '@/components/book/CurrentBookCard';
import { ProgressList } from '@/components/book/ProgressList';
import { PageProgressForm } from '@/components/book/PageProgressForm';
import { NextMeetingTarget } from '@/components/book/NextMeetingTarget';
import { BookOpen } from 'lucide-react';

export default async function BookPage({
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

  const { data: book } = await supabase
    .from('books')
    .select('*')
    .eq('club_id', clubId)
    .eq('status', 'current')
    .single();

  const { data: progress } = book
    ? await supabase
        .from('reading_progress')
        .select('*, profiles(id, display_name, avatar_url)')
        .eq('book_id', book.id)
        .order('current_page', { ascending: false })
    : { data: null };

  const myProgress = progress?.find((p) => p.user_id === user!.id);

  const { data: nextMeeting } = await supabase
    .from('meetings')
    .select('id, title, confirmed_at, target_page')
    .eq('club_id', clubId)
    .eq('status', 'confirmed')
    .gte('confirmed_at', new Date().toISOString())
    .not('target_page', 'is', null)
    .order('confirmed_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  return (
    <div className="px-4 space-y-4">
      {!book ? (
        <EmptyState
          icon={<BookOpen className="w-10 h-10" />}
          title="No book selected"
          description={isAdmin ? 'Set the current book below.' : 'Waiting for an admin to set a book.'}
          action={isAdmin ? <SetBookForm clubId={clubId} /> : undefined}
        />
      ) : (
        <>
          <CurrentBookCard book={book} />
          {nextMeeting && (
            <NextMeetingTarget
              targetPage={nextMeeting.target_page!}
              meetingDate={nextMeeting.confirmed_at!}
              myPage={myProgress?.current_page ?? 0}
            />
          )}
          <PageProgressForm
            clubId={clubId}
            bookId={book.id}
            totalPages={book.page_count}
            currentPage={myProgress?.current_page ?? 0}
          />
          {progress && progress.length > 0 && (
            <ProgressList progress={progress} totalPages={book.page_count} />
          )}
          {isAdmin && (
            <div className="pt-2">
              <p className="text-xs text-muted-foreground mb-2">Change book</p>
              <SetBookForm clubId={clubId} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
