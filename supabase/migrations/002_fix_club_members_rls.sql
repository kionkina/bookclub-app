-- Fix 1: club_members SELECT policy referenced itself → infinite recursion.
-- Fix 2: clubs SELECT policy couldn't see a newly created club until the creator
--        was inserted into club_members (race condition in createClub action).

-- Security definer bypasses RLS, breaking the recursion chain.
create or replace function public.get_my_club_ids()
returns setof uuid
language sql
security definer
stable
set search_path = public
as $$
  select club_id from club_members where user_id = auth.uid()
$$;

-- Replace recursive club_members SELECT policy
drop policy if exists "Members can view club membership" on club_members;
create policy "Members can view club membership"
  on club_members for select using (
    club_id in (select get_my_club_ids())
  );

-- Allow club creator to see the club even before they're added to club_members
drop policy if exists "Club members can view their clubs" on clubs;
create policy "Club members can view their clubs"
  on clubs for select using (
    created_by = auth.uid()
    or id in (select get_my_club_ids())
  );
