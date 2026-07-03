import React from 'react';
import {Check, X} from 'lucide-react';

interface ComparisonRow {
  feature: string;
  colA: string | boolean;
  colB: string | boolean;
}

interface ComparisonTableProps {
  title: string;
  colAHeader: string;
  colBHeader: string;
  rows: ComparisonRow[];
}

function CellValue({value}: {value: string | boolean}): React.JSX.Element {
  if (typeof value === 'boolean') {
    return value ? (
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500">
        <Check size={11} strokeWidth={3} />
      </span>
    ) : (
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500/10 text-red-500">
        <X size={11} strokeWidth={3} />
      </span>
    );
  }
  return <span>{value}</span>;
}

export default function ComparisonTable({
  title,
  colAHeader,
  colBHeader,
  rows,
}: ComparisonTableProps): React.JSX.Element {
  return (
    <div className="my-8">
      <h3 className="text-lg font-semibold mb-4 tracking-tight">{title}</h3>
      <div className="overflow-x-auto">
        <table className="comparison-table">
          <thead>
            <tr>
              <th className="w-2/5">Feature</th>
              <th className="w-[30%]">{colAHeader}</th>
              <th className="w-[30%]">{colBHeader}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td className="font-medium text-[hsl(var(--foreground))]">{row.feature}</td>
                <td className="text-[hsl(var(--muted-foreground))]"><CellValue value={row.colA} /></td>
                <td><CellValue value={row.colB} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
