import type { Book } from '@/lib/types';
import { BookOpen } from 'lucide-react';

interface Props {
  book: Book;
}

export function CurrentBookCard({ book }: Props) {
  return (
    <div className="flex gap-4 p-4 rounded-xl border bg-card">
      <div className="w-16 h-24 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
        {book.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={book.cover_image_url} alt={book.title} className="w-full h-full object-cover" />
        ) : (
          <BookOpen className="w-7 h-7 text-muted-foreground" />
        )}
      </div>
      <div className="space-y-1">
        <p className="font-bold text-lg leading-tight">{book.title}</p>
        {book.author && <p className="text-muted-foreground text-sm">{book.author}</p>}
        {book.page_count && (
          <p className="text-xs text-muted-foreground">{book.page_count} pages</p>
        )}
        {book.started_at && (
          <p className="text-xs text-muted-foreground">
            Started {new Date(book.started_at).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
}
