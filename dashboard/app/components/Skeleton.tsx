export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-zinc-700 rounded ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
      <Skeleton className="h-4 w-24 mb-3" />
      <Skeleton className="h-8 w-20 mb-2" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
      <Skeleton className="h-6 w-40 mb-6" />
      <Skeleton className="h-80 w-full" />
    </div>
  );
}

export function SkeletonTableRow() {
  return (
    <tr className="border-b border-zinc-700">
      <td className="px-4 py-4"><Skeleton className="h-4 w-8" /></td>
      <td className="px-4 py-4"><Skeleton className="h-4 w-32" /></td>
      <td className="px-4 py-4"><Skeleton className="h-4 w-8" /></td>
      <td className="px-4 py-4"><Skeleton className="h-4 w-24" /></td>
      <td className="px-4 py-4"><Skeleton className="h-4 w-10" /></td>
    </tr>
  );
}

export function SkeletonEventCard() {
  return (
    <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6">
      <div className="flex gap-4">
        <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
        <div className="flex-1">
          <Skeleton className="h-4 w-48 mb-2" />
          <Skeleton className="h-3 w-64" />
        </div>
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}
