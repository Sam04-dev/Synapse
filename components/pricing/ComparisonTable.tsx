import { Check } from "lucide-react";

type CellValue = string | boolean;

interface Row {
  feature: string;
  starter: CellValue;
  pro: CellValue;
  enterprise: CellValue;
}

const ROWS: Row[] = [
  { feature: "Active agent namespaces", starter: "1", pro: "10", enterprise: "Unlimited" },
  { feature: "Memory nodes", starter: "1,000", pro: "100,000", enterprise: "Unlimited" },
  { feature: "Events / month", starter: "10,000", pro: "1M", enterprise: "Unlimited" },
  { feature: "Memory retention", starter: "7 days", pro: "Unlimited", enterprise: "Unlimited" },
  { feature: "Real-time memory graph", starter: false, pro: true, enterprise: true },
  { feature: "API access", starter: true, pro: true, enterprise: true },
  { feature: "Webhook support", starter: false, pro: true, enterprise: true },
  { feature: "ACID compliance", starter: true, pro: true, enterprise: true },
  { feature: "DynamoDB event log", starter: true, pro: true, enterprise: true },
  { feature: "Aurora DSQL state", starter: true, pro: true, enterprise: true },
  { feature: "Team collaboration", starter: false, pro: true, enterprise: true },
  { feature: "Priority support", starter: false, pro: true, enterprise: true },
  { feature: "SSO & advanced security", starter: false, pro: false, enterprise: "Custom" },
  { feature: "Audit logs & compliance", starter: false, pro: false, enterprise: "Custom" },
  { feature: "On-premise deployment", starter: false, pro: false, enterprise: "Custom" },
  { feature: "Custom SLA", starter: false, pro: false, enterprise: "Custom" },
];

function Cell({ value }: { value: CellValue }) {
  if (value === true)
    return <Check size={14} className="mx-auto text-[#ff6b35]" aria-label="Included" />;
  if (value === false)
    return <span className="text-[#333]">—</span>;
  return <span className="text-[#888] text-[11px]">{value}</span>;
}

export default function ComparisonTable() {
  return (
    <div>
      <p className="mb-4 text-[10px] font-mono tracking-[0.2em] uppercase text-[#444]">
        {"// FEATURE_COMPARISON"}
      </p>
      <div className="overflow-x-auto border border-[#222]">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-[#1a1a1a] border-b border-[#222]">
              <th className="px-5 py-3 text-left text-[10px] font-mono tracking-[0.2em] uppercase text-[#555] w-1/2">
                Feature
              </th>
              {(["Starter", "Pro", "Enterprise"] as const).map((col) => (
                <th
                  key={col}
                  className="px-5 py-3 text-center text-[10px] font-mono tracking-[0.2em] uppercase text-[#555]"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, i) => (
              <tr
                key={row.feature}
                className={`border-b border-[#1a1a1a] ${i % 2 === 0 ? "bg-transparent" : "bg-[#0d0d0d]"}`}
              >
                <td className="px-5 py-3 text-[12px] font-mono text-white">{row.feature}</td>
                <td className="px-5 py-3 text-center"><Cell value={row.starter} /></td>
                <td className="px-5 py-3 text-center"><Cell value={row.pro} /></td>
                <td className="px-5 py-3 text-center"><Cell value={row.enterprise} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
