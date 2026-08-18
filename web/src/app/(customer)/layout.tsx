export default function CustomerLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10">
      <header className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 mb-3 shadow-lg shadow-amber-500/20">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-7 h-7 text-zinc-950"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="6" cy="6" r="3"></circle>
            <circle cx="6" cy="18" r="3"></circle>
            <line x1="20" y1="4" x2="8.12" y2="15.88"></line>
            <line x1="14.47" y1="14.48" x2="20" y2="20"></line>
            <line x1="8.12" y1="8.12" x2="12" y2="12"></line>
          </svg>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">The Gentleman&apos;s Cut</h1>
        <p className="text-zinc-400 text-sm mt-1">จองคิวตัดผมง่ายๆ ใน 3 ขั้นตอน</p>
      </header>

      {children}

      <footer className="text-center text-zinc-600 text-xs mt-6">
        ข้อมูลทั้งหมดเป็น Mock Data สำหรับสาธิตเท่านั้น
      </footer>
    </div>
  );
}
