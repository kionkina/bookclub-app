'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { InviteButton } from '@/components/clubs/InviteButton';

interface Props {
  children: React.ReactNode;
  club: { id: string; name: string; description: string | null; invite_token: string };
  isAdmin: boolean;
  clubId: string;
}

export function ClubLayoutClient({ children, club, isAdmin, clubId }: Props) {
  const pathname = usePathname();
  const base = `/clubs/${clubId}`;

  const tabs = [
    { href: base, label: 'Feed' },
    { href: `${base}/meetings`, label: 'Meetings' },
    { href: `${base}/book`, label: 'Book' },
    { href: `${base}/members`, label: 'Members' },
  ];

  return (
    <div>
      {/* Club header */}
      <div className="px-4 pt-6 pb-3 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold leading-tight">{club.name}</h1>
            {club.description && (
              <p className="text-sm text-muted-foreground mt-0.5">{club.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <InviteButton token={club.invite_token} />
            {isAdmin && (
              <Link
                href={`${base}/settings`}
                className="text-xs text-muted-foreground hover:text-foreground border rounded-md px-2 py-1"
              >
                Settings
              </Link>
            )}
          </div>
        </div>

        {/* Tab nav */}
        <div className="flex gap-0 border-b mt-3">
          {tabs.map(({ href, label }) => {
            const active = href === base ? pathname === base : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'px-3 py-2 text-sm font-medium border-b-2 transition-colors',
                  active
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>

      {children}
    </div>
  );
}
