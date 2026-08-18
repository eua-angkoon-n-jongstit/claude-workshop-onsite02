import BookingWizard from "@/components/booking/BookingWizard";
import { getTodayBangkok, buildDateWindow } from "@/lib/booking/today";

// must be re-evaluated per request — getTodayBangkok() would otherwise be
// baked in at build time and never advance to the next day.
export const dynamic = "force-dynamic";

export default function BookingPage() {
  const today = getTodayBangkok();
  const dates = buildDateWindow(today);
  return <BookingWizard dates={dates} />;
}
