export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="p-8 flex items-center justify-center h-64">
      <div className="text-center space-y-4">
        <div className="text-4xl">&#x26A0;&#xFE0F;</div>
        <p className="text-zinc-400 text-lg">{message}</p>
        <button
          onClick={onRetry}
          className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
