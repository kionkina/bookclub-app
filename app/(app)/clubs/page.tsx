import Link from 'next/link';
import { format } from 'date-fns';
import { createClient } from '@/lib/supabase/server';
import { BookOpen, ChevronRight, Plus, Calendar } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/EmptyState';
import { cn } from '@/lib/utils';

export default async function ClubsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: memberships } = await supabase
    .from('club_members')
    .select('role, clubs(id, name, description, cover_image_url)')
    .eq('user_id', user!.id)
    .order('joined_at', { ascending: false });

  type ClubRow = { id: string; name: string; description: string | null; cover_image_url: string | null; myRole: string };
  const clubs: ClubRow[] = memberships?.map((m) => ({ ...(m.clubs as unknown as Omit<ClubRow, 'myRole'>), myRole: m.role })) ?? [];

  const clubIds = clubs.map((c) => c.id);
  const { data: upcoming } = clubIds.length
    ? await supabase
        .from('meetings')
        .select('id, title, confirmed_at, target_page, club_id, clubs(name)')
        .in('club_id', clubIds)
        .eq('status', 'confirmed')
        .gte('confirmed_at', new Date().toISOString())
        .order('confirmed_at', { ascending: true })
        .limit(3)
    : { data: null };

  type UpcomingRow = {
    id: string;
    title: string;
    confirmed_at: string;
    target_page: number | null;
    club_id: string;
    clubs: { name: string } | null;
  };
  const upcomingMeetings = (upcoming as UpcomingRow[] | null) ?? [];

  return (
    <div className="px-4 pt-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Clubs</h1>
        <Link href="/clubs/new" className={cn(buttonVariants({ size: 'sm' }), 'gap-1.5')}>
          <Plus className="w-4 h-4" />
          New
        </Link>
      </div>

      {upcomingMeetings.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground">Upcoming meetings</h2>
          <ul className="space-y-2">
            {upcomingMeetings.map((m) => (
              <li key={m.id}>
                <Link
                  href={`/clubs/${m.club_id}/meetings`}
                  className="flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-accent transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{m.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {m.clubs?.name} · {format(new Date(m.confirmed_at), 'EEE, MMM d · h:mm a')}
                      {m.target_page != null && ` · to pg ${m.target_page}`}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {clubs.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="w-10 h-10" />}
          title="No book clubs yet"
          description="Create one or ask someone to share their invite link with you."
          action={
            <Link href="/clubs/new" className={buttonVariants()}>Create a club</Link>
          }
        />
      ) : (
        <div className="space-y-2">
          {upcomingMeetings.length > 0 && (
            <h2 className="text-sm font-semibold text-muted-foreground">Your clubs</h2>
          )}
          <ul className="space-y-2">
          {clubs.map((club) => (
            <li key={club!.id}>
              <Link
                href={`/clubs/${club!.id}`}
                className="flex items-center gap-3 p-4 rounded-xl border bg-card hover:bg-accent transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  {club!.cover_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={club!.cover_image_url} alt="" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <BookOpen className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{club!.name}</p>
                  {club!.description && (
                    <p className="text-sm text-muted-foreground truncate">{club!.description}</p>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </Link>
            </li>
          ))}
          </ul>
        </div>
      )}
    </div>
  );
}
