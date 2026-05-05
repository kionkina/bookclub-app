-- =====================
-- TABLES
-- =====================

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  avatar_url text,
  phone text,
  timezone text default 'UTC',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  cover_image_url text,
  invite_token text unique not null default encode(gen_random_bytes(8), 'hex'),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.club_members (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member',
  joined_at timestamptz default now(),
  unique(club_id, user_id),
  constraint valid_role check (role in ('admin', 'member'))
);

create table public.books (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  title text not null,
  author text,
  cover_image_url text,
  page_count integer,
  status text not null default 'current',
  started_at date,
  finished_at date,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  constraint valid_status check (status in ('current', 'past'))
);

create table public.reading_progress (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  current_page integer not null default 0,
  note text,
  updated_at timestamptz default now(),
  unique(club_id, book_id, user_id)
);

create table public.meetings (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  title text not null default 'Book Club Meeting',
  description text,
  location text,
  status text not null default 'polling',
  confirmed_at timestamptz,
  book_id uuid references public.books(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint valid_status check (status in ('polling', 'confirmed', 'cancelled'))
);

create table public.meeting_date_options (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.meetings(id) on delete cascade,
  proposed_at timestamptz not null,
  is_confirmed boolean not null default false,
  created_at timestamptz default now()
);

create table public.meeting_votes (
  id uuid primary key default gen_random_uuid(),
  option_id uuid not null references public.meeting_date_options(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  available boolean not null default true,
  created_at timestamptz default now(),
  unique(option_id, user_id)
);

create table public.sms_reminders (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.meetings(id) on delete cascade,
  scheduled_for timestamptz not null,
  reminder_offset interval not null,
  status text not null default 'pending',
  sent_at timestamptz,
  created_at timestamptz default now(),
  unique(meeting_id, reminder_offset),
  constraint valid_status check (status in ('pending', 'sent', 'failed'))
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  post_type text not null default 'general',
  page_number integer,
  is_pinned boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint valid_post_type check (post_type in ('general', 'progress', 'announcement'))
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =====================
-- INDEXES
-- =====================

create index club_members_club_user_idx on public.club_members(club_id, user_id);
create index club_members_user_idx on public.club_members(user_id);
create index posts_club_created_idx on public.posts(club_id, created_at desc);
create index comments_post_idx on public.comments(post_id, created_at asc);
create index meetings_club_idx on public.meetings(club_id, created_at desc);
create index meeting_votes_option_idx on public.meeting_votes(option_id);
create index sms_reminders_pending_idx on public.sms_reminders(status, scheduled_for) where status = 'pending';
create index reading_progress_book_idx on public.reading_progress(book_id, current_page desc);

-- =====================
-- TRIGGER: auto-create profile on signup
-- =====================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =====================
-- RLS
-- =====================

alter table public.profiles enable row level security;
alter table public.clubs enable row level security;
alter table public.club_members enable row level security;
alter table public.books enable row level security;
alter table public.reading_progress enable row level security;
alter table public.meetings enable row level security;
alter table public.meeting_date_options enable row level security;
alter table public.meeting_votes enable row level security;
alter table public.sms_reminders enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;

-- profiles
create policy "Users can view their own profile"
  on profiles for select using (auth.uid() = id);
create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = id);

-- clubs
create policy "Club members can view their clubs"
  on clubs for select using (
    exists (select 1 from public.club_members where club_id = clubs.id and user_id = auth.uid())
  );
create policy "Authenticated users can create clubs"
  on clubs for insert with check (auth.uid() is not null);
create policy "Club admins can update clubs"
  on clubs for update using (
    exists (select 1 from public.club_members where club_id = clubs.id and user_id = auth.uid() and role = 'admin')
  );

-- club_members
create policy "Members can view club membership"
  on club_members for select using (
    exists (select 1 from public.club_members cm where cm.club_id = club_members.club_id and cm.user_id = auth.uid())
  );
create policy "Authenticated users can join clubs"
  on club_members for insert with check (auth.uid() = user_id);
create policy "Members can leave or admins can remove"
  on club_members for delete using (
    auth.uid() = user_id
    or exists (select 1 from public.club_members cm where cm.club_id = club_members.club_id and cm.user_id = auth.uid() and cm.role = 'admin')
  );
create policy "Club admins can update member roles"
  on club_members for update using (
    exists (select 1 from public.club_members cm where cm.club_id = club_members.club_id and cm.user_id = auth.uid() and cm.role = 'admin')
  );

-- books
create policy "Club members can view books"
  on books for select using (
    exists (select 1 from public.club_members where club_id = books.club_id and user_id = auth.uid())
  );
create policy "Club admins can insert books"
  on books for insert with check (
    exists (select 1 from public.club_members where club_id = books.club_id and user_id = auth.uid() and role = 'admin')
  );
create policy "Club admins can update books"
  on books for update using (
    exists (select 1 from public.club_members where club_id = books.club_id and user_id = auth.uid() and role = 'admin')
  );

-- reading_progress
create policy "Club members can view reading progress"
  on reading_progress for select using (
    exists (select 1 from public.club_members where club_id = reading_progress.club_id and user_id = auth.uid())
  );
create policy "Members can insert their own progress"
  on reading_progress for insert with check (
    auth.uid() = user_id
    and exists (select 1 from public.club_members where club_id = reading_progress.club_id and user_id = auth.uid())
  );
create policy "Members can update their own progress"
  on reading_progress for update using (auth.uid() = user_id);

-- meetings
create policy "Club members can view meetings"
  on meetings for select using (
    exists (select 1 from public.club_members where club_id = meetings.club_id and user_id = auth.uid())
  );
create policy "Club admins can create meetings"
  on meetings for insert with check (
    exists (select 1 from public.club_members where club_id = meetings.club_id and user_id = auth.uid() and role = 'admin')
  );
create policy "Club admins can update meetings"
  on meetings for update using (
    exists (select 1 from public.club_members where club_id = meetings.club_id and user_id = auth.uid() and role = 'admin')
  );

-- meeting_date_options
create policy "Club members can view date options"
  on meeting_date_options for select using (
    exists (
      select 1 from public.meetings m
      join public.club_members cm on cm.club_id = m.club_id
      where m.id = meeting_date_options.meeting_id and cm.user_id = auth.uid()
    )
  );
create policy "Club admins can insert date options"
  on meeting_date_options for insert with check (
    exists (
      select 1 from public.meetings m
      join public.club_members cm on cm.club_id = m.club_id
      where m.id = meeting_date_options.meeting_id and cm.user_id = auth.uid() and cm.role = 'admin'
    )
  );
create policy "Club admins can update date options"
  on meeting_date_options for update using (
    exists (
      select 1 from public.meetings m
      join public.club_members cm on cm.club_id = m.club_id
      where m.id = meeting_date_options.meeting_id and cm.user_id = auth.uid() and cm.role = 'admin'
    )
  );

-- meeting_votes
create policy "Club members can view votes"
  on meeting_votes for select using (
    exists (
      select 1 from public.meeting_date_options mdo
      join public.meetings m on m.id = mdo.meeting_id
      join public.club_members cm on cm.club_id = m.club_id
      where mdo.id = meeting_votes.option_id and cm.user_id = auth.uid()
    )
  );
create policy "Members can submit their own votes"
  on meeting_votes for insert with check (auth.uid() = user_id);
create policy "Members can update their own votes"
  on meeting_votes for update using (auth.uid() = user_id);
create policy "Members can delete their own votes"
  on meeting_votes for delete using (auth.uid() = user_id);

-- sms_reminders: no client access
-- (no policies = no access; service role bypasses RLS)

-- posts
create policy "Club members can view posts"
  on posts for select using (
    exists (select 1 from public.club_members where club_id = posts.club_id and user_id = auth.uid())
  );
create policy "Club members can create posts"
  on posts for insert with check (
    auth.uid() = author_id
    and exists (select 1 from public.club_members where club_id = posts.club_id and user_id = auth.uid())
  );
create policy "Authors and admins can update posts"
  on posts for update using (
    auth.uid() = author_id
    or exists (select 1 from public.club_members where club_id = posts.club_id and user_id = auth.uid() and role = 'admin')
  );
create policy "Authors and admins can delete posts"
  on posts for delete using (
    auth.uid() = author_id
    or exists (select 1 from public.club_members where club_id = posts.club_id and user_id = auth.uid() and role = 'admin')
  );

-- comments
create policy "Club members can view comments"
  on comments for select using (
    exists (
      select 1 from public.posts p
      join public.club_members cm on cm.club_id = p.club_id
      where p.id = comments.post_id and cm.user_id = auth.uid()
    )
  );
create policy "Club members can create comments"
  on comments for insert with check (
    auth.uid() = author_id
    and exists (
      select 1 from public.posts p
      join public.club_members cm on cm.club_id = p.club_id
      where p.id = comments.post_id and cm.user_id = auth.uid()
    )
  );
create policy "Authors can update their comments"
  on comments for update using (auth.uid() = author_id);
create policy "Authors and admins can delete comments"
  on comments for delete using (
    auth.uid() = author_id
    or exists (
      select 1 from public.posts p
      join public.club_members cm on cm.club_id = p.club_id
      where p.id = comments.post_id and cm.user_id = auth.uid() and cm.role = 'admin'
    )
  );
