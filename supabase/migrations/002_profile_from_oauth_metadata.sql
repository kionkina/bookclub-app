-- Pre-fill display_name and avatar_url from OAuth provider metadata.
-- Google sets full_name/name and avatar_url/picture in raw_user_meta_data.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $func$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    nullif(coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'), ''),
    nullif(coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'), '')
  );
  return new;
end;
$func$;
