import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Props {
  name?: string | null;
  avatarUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = { sm: 'h-7 w-7 text-xs', md: 'h-9 w-9 text-sm', lg: 'h-12 w-12 text-base' };

export function UserAvatar({ name, avatarUrl, size = 'md' }: Props) {
  const initials = name
    ? name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <Avatar className={sizeClasses[size]}>
      <AvatarImage src={avatarUrl ?? undefined} />
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
}
