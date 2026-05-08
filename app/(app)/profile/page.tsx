import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ProfileForm } from './ProfileForm';

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const isWelcome = (await searchParams).welcome === '1';

  return (
    <div className="px-4 pt-6 space-y-6">
      {isWelcome ? (
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Welcome 👋</h1>
          <p className="text-muted-foreground text-sm">
            Tell us your name so your club members know who you are.
          </p>
        </div>
      ) : (
        <h1 className="text-2xl font-bold">Profile</h1>
      )}
      <ProfileForm profile={profile} email={user.email} welcome={isWelcome} />
    </div>
  );
}
