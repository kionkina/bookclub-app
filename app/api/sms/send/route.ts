import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function sendSms(to: string, body: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID!;
  const authToken = process.env.TWILIO_AUTH_TOKEN!;
  const from = process.env.TWILIO_PHONE_NUMBER!;

  const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

  const params = new URLSearchParams({ To: to, From: from, Body: body });
  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    }
  );
  return res.ok;
}

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  const now = new Date().toISOString();
  const { data: reminders } = await supabase
    .from('sms_reminders')
    .select('id, meeting_id, reminder_offset, meetings(title, confirmed_at, club_id, clubs(name))')
    .eq('status', 'pending')
    .lte('scheduled_for', now);

  if (!reminders || reminders.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  let sent = 0;

  type MeetingData = { title: string; confirmed_at: string; club_id: string; clubs: { name: string } };
  for (const reminder of reminders) {
    const meeting = reminder.meetings as unknown as MeetingData | null;
    if (!meeting) continue;

    const confirmedAt = new Date(meeting.confirmed_at);
    const hoursUntil = Math.round((confirmedAt.getTime() - Date.now()) / (1000 * 60 * 60));
    const timeLabel = hoursUntil <= 2 ? 'in about 1 hour' : 'tomorrow';
    const msgBody = `📚 Reminder: ${meeting.clubs.name} — "${meeting.title}" is ${timeLabel} at ${confirmedAt.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}`;

    // Get all club members with phone numbers
    const { data: members } = await supabase
      .from('club_members')
      .select('profiles(phone)')
      .eq('club_id', meeting.club_id);

    const phones = (members ?? [])
      .map((m) => (m.profiles as unknown as { phone: string | null })?.phone)
      .filter((p): p is string => Boolean(p));

    let reminderSent = false;
    for (const phone of phones) {
      const ok = await sendSms(phone, msgBody);
      if (ok) { sent++; reminderSent = true; }
    }

    await supabase
      .from('sms_reminders')
      .update({ status: reminderSent ? 'sent' : 'failed', sent_at: new Date().toISOString() })
      .eq('id', reminder.id);
  }

  return NextResponse.json({ sent });
}
