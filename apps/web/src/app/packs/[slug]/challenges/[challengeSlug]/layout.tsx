export default function ChallengeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-[calc(100vh-3.5rem-1px)] flex-col overflow-clip">
      {children}
    </div>
  );
}
