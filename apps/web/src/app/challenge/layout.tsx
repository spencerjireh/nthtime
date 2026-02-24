export default function ChallengeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="-mx-9 -my-10 flex h-[calc(100vh-3.5rem-1px)] flex-col overflow-hidden">
      {children}
    </div>
  );
}
