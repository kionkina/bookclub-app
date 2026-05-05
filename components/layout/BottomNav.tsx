'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Home, User, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  clubId?: string;
}

export function BottomNav({ clubId }: Props) {
  const pathname = usePathname();

  const items = [
    { href: '/clubs', label: 'Clubs', icon: Home },
    ...(clubId ? [{ href: `/clubs/${clubId}`, label: 'Feed', icon: BookOpen }] : []),
    { href: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t safe-area-pb">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-4">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-colors',
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
        <Link
          href="/clubs/new"
          className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="text-[10px] font-medium">New</span>
        </Link>
      </div>
    </nav>
  );
}
