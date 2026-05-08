import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { AppShell } from '@/components/layout/AppShell';
import { BottomNav } from '@/components/layout/BottomNav';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const pathname = (await headers()).get('x-pathname') ?? '';
  if (pathname !== '/profile') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .single();

    if (!profile?.display_name?.trim()) {
      redirect('/profile?welcome=1');
    }
  }

  return (
    <AppShell>
      {children}
      <BottomNav />
    </AppShell>
  );
}
