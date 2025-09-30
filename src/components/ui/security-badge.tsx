import { Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function SecurityBadge() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className="gap-1">
            <Shield className="h-3 w-3" />
            Secure
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs max-w-xs">
            Credentials are stored with encryption at rest and transmitted over HTTPS.
            Row-level security ensures only you can access your credentials.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
