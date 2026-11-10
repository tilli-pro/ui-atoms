import { catalogueSpec } from "./finance/catalogue.js";
import { financeDashboard } from "./finance/dashboard.js";
import { ledgerSpec } from "./finance/ledger.js";
import { payablesSpec } from "./finance/payables.js";
import { paymentsSpec } from "./finance/payments.js";
import { receivablesSpec } from "./finance/receivables.js";
import type { ModuleSpecs } from "./types.js";

export const financeSpecs: ModuleSpecs = {
  items: {
    receivables: receivablesSpec,
    payables: payablesSpec,
    payments: paymentsSpec,
    ledger: ledgerSpec,
    catalogue: catalogueSpec,
  },
  dashboard: financeDashboard,
};
