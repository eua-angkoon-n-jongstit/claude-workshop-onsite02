export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10">
      <header className="mb-8">
        <h1 className="text-xl font-bold tracking-tight">Admin — The Gentleman&apos;s Cut</h1>
        <p className="text-zinc-500 text-sm mt-1">จัดการคิวจอง</p>
      </header>
      {children}
    </div>
  );
}
