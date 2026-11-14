import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, XCircle } from "lucide-react";
import type { OrderingWindow } from "@/lib/types";
import { formatTime } from "@/lib/format";

export function OrderingStatusBanner({ ordering }: { ordering: OrderingWindow }) {
  if (ordering.state === "open") {
    return (
      <Badge
        variant="outline"
        className="gap-1.5 border-green-600/30 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
      >
        <Clock className="h-3.5 w-3.5" aria-hidden />
        Ordering open — closes {formatTime(ordering.closes_at)}
      </Badge>
    );
  }
  if (ordering.state === "closing_soon") {
    return (
      <Badge
        variant="outline"
        className="gap-1.5 border-amber-600/30 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
      >
        <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
        Closing soon — order by {formatTime(ordering.closes_at)}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="gap-1.5 text-muted-foreground">
      <XCircle className="h-3.5 w-3.5" aria-hidden />
      Ordering closed{ordering.opens_at ? ` · opens ${formatTime(ordering.opens_at)}` : ""}
    </Badge>
  );
}
