import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { BookOpen, ChevronRight, Plus } from 'lucide-react';
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

  return (
    <div className="px-4 pt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Clubs</h1>
        <Link href="/clubs/new" className={cn(buttonVariants({ size: 'sm' }), 'gap-1.5')}>
          <Plus className="w-4 h-4" />
          New
        </Link>
      </div>

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
      )}
    </div>
  );
}
