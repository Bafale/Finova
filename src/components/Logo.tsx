interface Props { className?: string; size?: number }
export function Logo({ className = "", size = 32 }: Props) {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <defs>
          <linearGradient id="finova-grad" x1="0" y1="0" x2="40" y2="40">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="50%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>
        <path d="M20 2 L38 20 L20 38 L2 20 Z" fill="url(#finova-grad)" />
        <path d="M20 10 L30 20 L20 30 L10 20 Z" fill="white" fillOpacity="0.25" />
      </svg>
      <span className="font-display text-xl font-bold tracking-tight">FinOva</span>
    </div>
  );
}
