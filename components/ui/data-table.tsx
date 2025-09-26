import type { ReactNode } from "react";

export type Column<T> = {
  header: string;
  accessor: (row: T) => ReactNode;
};

export function DataTable<T>({ data, columns }: { data: T[]; columns: Column<T>[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/5">
      <table className="min-w-full divide-y divide-white/10 bg-surface/40">
        <thead className="bg-white/5 text-left text-xs uppercase tracking-[0.3em] text-slate-400">
          <tr>
            {columns.map((column) => (
              <th key={column.header} className="px-4 py-3">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {data.map((row, index) => (
            <tr key={index} className="text-sm text-slate-200">
              {columns.map((column) => (
                <td key={column.header} className="px-4 py-3">
                  {column.accessor(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
