interface Props {
  children: React.ReactNode;
}

export function AppShell({ children }: Props) {
  return (
    <div className="min-h-screen max-w-lg mx-auto pb-20">
      {children}
    </div>
  );
}
