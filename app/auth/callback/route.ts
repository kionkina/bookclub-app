import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/clubs';

  const headers = request.headers;
  const protocol = headers.get('x-forwarded-proto') ?? 'http';
  const host =
    headers.get('x-forwarded-host') ??
    headers.get('host') ??
    'localhost:3000';
  const origin = `${protocol}://${host}`;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name, avatar_url')
          .eq('id', user.id)
          .single();

        const meta = user.user_metadata ?? {};
        const metaName = (meta.full_name || meta.name || '').trim();
        const metaAvatar = (meta.avatar_url || meta.picture || '').trim();

        const patch: { display_name?: string; avatar_url?: string } = {};
        if (!profile?.display_name?.trim() && metaName) patch.display_name = metaName;
        if (!profile?.avatar_url && metaAvatar) patch.avatar_url = metaAvatar;
        if (Object.keys(patch).length > 0) {
          await supabase.from('profiles').update(patch).eq('id', user.id);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
