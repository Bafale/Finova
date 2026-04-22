import { useEffect, useRef, useState } from "react";

interface Props {
  end: number;
  duration?: number;
  format?: (n: number) => string;
  className?: string;
}

export function CountUp({ end, duration = 1200, format, className }: Props) {
  const [value, setValue] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    startRef.current = null;
    const step = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(end * eased);
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [end, duration]);

  return <span className={className}>{format ? format(value) : Math.round(value).toLocaleString("fr-CA")}</span>;
}
