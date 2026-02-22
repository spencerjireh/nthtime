export default function ChallengeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="-mx-6 -mt-8 flex h-[calc(100vh-3.5rem)] flex-col overflow-hidden">
      {children}
    </div>
  );
}
