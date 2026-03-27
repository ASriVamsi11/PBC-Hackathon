export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse ${className}`} style={{ background: "var(--color-surface-2)" }} />;
}

export function SkeletonCard() {
  return (
    <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", padding: "20px" }}>
      <Skeleton className="h-3 w-24 mb-3" />
      <Skeleton className="h-7 w-20 mb-2" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", padding: "24px" }}>
      <Skeleton className="h-4 w-40 mb-6" />
      <Skeleton className="h-72 w-full" />
    </div>
  );
}

export function SkeletonTableRow() {
  return (
    <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
      <td className="px-5 py-3"><Skeleton className="h-3 w-8" /></td>
      <td className="px-5 py-3"><Skeleton className="h-3 w-32" /></td>
      <td className="px-5 py-3"><Skeleton className="h-3 w-8" /></td>
      <td className="px-5 py-3"><Skeleton className="h-3 w-24" /></td>
      <td className="px-5 py-3"><Skeleton className="h-3 w-10" /></td>
    </tr>
  );
}

export function SkeletonEventCard() {
  return (
    <div className="flex gap-4 px-5 py-4" style={{ background: "var(--color-surface)" }}>
      <Skeleton className="h-2 w-2 rounded-full flex-shrink-0 mt-1.5" />
      <div className="flex-1">
        <Skeleton className="h-3 w-48 mb-2" />
        <Skeleton className="h-3 w-64" />
      </div>
      <Skeleton className="h-3 w-16" />
    </div>
  );
}
