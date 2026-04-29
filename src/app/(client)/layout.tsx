export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-[430px] mx-auto min-h-[100dvh] bg-surface relative shadow-2xl overflow-x-hidden flex flex-col">
      {children}
    </div>
  );
}
