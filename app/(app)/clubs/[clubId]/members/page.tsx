import { createClient } from '@/lib/supabase/server';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { Badge } from '@/components/ui/badge';
import { MemberActions } from './MemberActions';

export default async function MembersPage({
  params,
}: {
  params: Promise<{ clubId: string }>;
}) {
  const { clubId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: myMembership } = await supabase
    .from('club_members')
    .select('role')
    .eq('club_id', clubId)
    .eq('user_id', user!.id)
    .single();

  const isAdmin = myMembership?.role === 'admin';

  const { data: members } = await supabase
    .from('club_members')
    .select('*, profiles(id, display_name, avatar_url)')
    .eq('club_id', clubId)
    .order('joined_at', { ascending: true });

  return (
    <div className="px-4 space-y-3">
      <p className="text-sm text-muted-foreground">{members?.length ?? 0} members</p>
      <ul className="space-y-2">
        {members?.map((m) => {
          const name = m.profiles?.display_name || 'Member';
          const isMe = m.user_id === user!.id;
          return (
            <li key={m.id} className="flex items-center gap-3 p-3 rounded-xl border bg-card">
              <UserAvatar name={name} avatarUrl={m.profiles?.avatar_url} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm truncate">{name}</span>
                  {isMe && <span className="text-xs text-muted-foreground">(you)</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={m.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                  {m.role}
                </Badge>
                {isAdmin && !isMe && (
                  <MemberActions
                    memberId={m.id}
                    clubId={clubId}
                    currentRole={m.role as 'admin' | 'member'}
                  />
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
