import DashboardEmptyState from "./DashboardEmptyState";

export default function DashboardTable({
  columns = [],
  rows = [],
  getRowKey,
  emptyTitle = "Belum ada data tabel.",
  emptyDescription = "Data akan tampil setelah backend mengirim response.",
}) {
  if (rows.length === 0) {
    return (
      <DashboardEmptyState
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-white/70 bg-white/42 ring-1 ring-white/40">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left">
          <thead>
            <tr className="border-b border-white/70 bg-white/44">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="whitespace-nowrap px-4 py-3 text-xs font-extrabold uppercase tracking-[0.14em] text-[#64748B]"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, index) => (
              <tr
                key={getRowKey ? getRowKey(row, index) : index}
                className="border-b border-white/55 text-sm last:border-0 hover:bg-white/35"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="px-4 py-3 font-semibold leading-6 text-[#475569]"
                  >
                    {column.render ? column.render(row, index) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}