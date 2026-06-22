import * as React from "react";
import { ShieldAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function DisclaimerPanel() {
  return (
    <Alert variant="warning">
      <AlertTitle className="flex items-center gap-2">
        <ShieldAlert className="h-4 w-4" />
        Estimates only — not financial or legal advice
      </AlertTitle>
      <AlertDescription className="mt-1 text-amber-900/90">
        This dashboard provides estimates only. HDB grants, HFE eligibility, loan amount, CPF usage,
        MSR/TDSR assessment, stamp duties, and resale approval are subject to official HDB, CPF Board,
        IRAS, and lender rules. Buyers should verify with HDB, CPF, their bank, and a licensed property
        agent.
      </AlertDescription>
    </Alert>
  );
}
