const STEP_LABELS = ["บริการ & เวลา", "ข้อมูลติดต่อ", "ยืนยัน"];

export default function Stepper({ current }: { current: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center justify-center mb-8 select-none">
      {STEP_LABELS.map((label, i) => {
        const stepNum = i + 1;
        const isDone = stepNum < current;
        const isActive = stepNum === current;

        return (
          <div className="flex items-center" key={label}>
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors ${
                isDone
                  ? "bg-amber-500 border-amber-500 text-zinc-950"
                  : isActive
                    ? "border-amber-500 text-amber-400 bg-zinc-900"
                    : "border-zinc-700 text-zinc-600 bg-zinc-900"
              }`}
            >
              {isDone ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              ) : (
                stepNum
              )}
            </div>
            <div className="ml-2 mr-3 hidden sm:block">
              <span
                className={`text-xs font-medium ${
                  isActive
                    ? "text-amber-400"
                    : isDone
                      ? "text-zinc-300"
                      : "text-zinc-600"
                }`}
              >
                {label}
              </span>
            </div>
            {stepNum < STEP_LABELS.length && (
              <div
                className={`w-6 sm:w-10 h-0.5 mx-1 ${isDone ? "bg-amber-500" : "bg-zinc-700"}`}
              ></div>
            )}
          </div>
        );
      })}
    </div>
  );
}
