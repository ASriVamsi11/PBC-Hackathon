import { AlertTriangle } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="p-8 flex items-center justify-center h-64">
      <Card className="text-center">
        <CardContent className="pt-6 space-y-4">
          <div className="w-10 h-10 mx-auto flex items-center justify-center border border-[var(--color-danger)] text-[var(--color-danger)] rounded">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <p className="text-sm text-[var(--color-text-muted)]">{message}</p>
          <Button onClick={onRetry} size="sm">
            Retry
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
