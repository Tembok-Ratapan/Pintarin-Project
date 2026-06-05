import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Database,
  Pencil,
  Plus,
  RefreshCcw,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";

import Button from "../../../components/ui/Button";
import SelectField from "../../../components/ui/Select";
import LoadingState from "../../../components/feedback/LoadingState";
import DashboardEmptyState from "../components/DashboardEmptyState";
import DashboardErrorBanner from "../components/DashboardErrorBanner";
import DashboardSection from "../components/DashboardSection";
import DashboardShell from "../components/DashboardShell";
import { adminDatabaseService } from "../adminDatabaseService";

const getWritableFields = (table, mode) => {
  return (table?.fields || []).filter((field) => {
    if (field.readOnly) return false;
    if (field.virtual && field.type !== "password") return false;
    if (field.name === "password" && mode === "edit") return true;
    return true;
  });
};

const createInitialForm = (table, record = null, mode = "create") => {
  return getWritableFields(table, mode).reduce((form, field) => {
    if (field.name === "password") {
      return {
        ...form,
        [field.name]: "",
      };
    }

    const value = record?.[field.name];

    return {
      ...form,
      [field.name]:
        value === null || value === undefined
          ? ""
          : field.type === "date"
            ? String(value).slice(0, 10)
          : field.type === "json" && typeof value === "object"
            ? JSON.stringify(value, null, 2)
            : String(value),
    };
  }, {});
};

const formatValue = (value, field) => {
  if (value === null || value === undefined || value === "") return "-";

  if (field?.type === "boolean") {
    return value ? "Aktif" : "Nonaktif";
  }

  if (field?.type === "json") {
    const text = typeof value === "string" ? value : JSON.stringify(value);
    return text.length > 64 ? `${text.slice(0, 64)}...` : text;
  }

  if (field?.type === "datetime" || field?.type === "date") {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? value
      : new Intl.DateTimeFormat("id-ID", {
          dateStyle: "medium",
          ...(field.type === "datetime" ? { timeStyle: "short" } : {}),
        }).format(date);
  }

  const text = String(value);
  return text.length > 72 ? `${text.slice(0, 72)}...` : text;
};

function FieldInput({ field, value, onChange, mode }) {
  const isRequired =
    field.required || (field.name === "password" && mode === "create");

  if (field.type === "enum") {
    return (
      <SelectField
        value={value}
        onChange={(nextValue) => onChange(field.name, nextValue)}
        placeholder={isRequired ? "Pilih" : "Kosong"}
      >
        <option value="">{field.nullable ? "Kosong" : "Pilih"}</option>
        {(field.options || []).map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </SelectField>
    );
  }

  if (field.type === "boolean") {
    return (
      <label className="mt-2 flex min-h-11 items-center gap-3 rounded-2xl border border-white/70 bg-white/58 px-3 ring-1 ring-white/40">
        <input
          type="checkbox"
          checked={value === true || value === "1" || value === "true"}
          onChange={(event) =>
            onChange(field.name, event.target.checked ? "1" : "0")
          }
          className="h-4 w-4 accent-[#0F766E]"
        />
        <span className="text-sm font-extrabold text-[#102A43]">Aktif</span>
      </label>
    );
  }

  if (field.type === "text" || field.type === "json") {
    return (
      <textarea
        value={value}
        required={isRequired}
        rows={field.type === "json" ? 5 : 3}
        onChange={(event) => onChange(field.name, event.target.value)}
        className="mt-2 w-full resize-y rounded-2xl border border-white/70 bg-white/70 px-3 py-3 text-sm font-semibold leading-6 text-[#102A43] outline-none ring-1 ring-white/40 transition focus:border-[#5EEAD4] focus:ring-4 focus:ring-[#5EEAD4]/20"
      />
    );
  }

  const inputType =
    field.type === "integer" || field.type === "decimal"
      ? "number"
      : field.type === "date"
        ? "date"
        : field.type === "password"
          ? "password"
          : "text";

  return (
    <input
      type={inputType}
      step={field.type === "decimal" ? "any" : undefined}
      value={value}
      required={isRequired}
      placeholder={
        field.name === "password" && mode === "edit"
          ? "Kosongkan jika tidak diubah"
          : undefined
      }
      onChange={(event) => onChange(field.name, event.target.value)}
      className="mt-2 h-11 w-full rounded-2xl border border-white/70 bg-white/70 px-3 text-sm font-semibold text-[#102A43] outline-none ring-1 ring-white/40 transition placeholder:text-[#94A3B8] focus:border-[#5EEAD4] focus:ring-4 focus:ring-[#5EEAD4]/20"
    />
  );
}

function RecordFormModal({
  table,
  mode,
  record,
  isSaving,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(() => createInitialForm(table, record, mode));

  const fields = getWritableFields(table, mode);

  const handleChange = (fieldName, value) => {
    setForm((current) => ({
      ...current,
      [fieldName]: value,
    }));
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4 py-6">
      <button
        type="button"
        aria-label="Tutup modal"
        className="absolute inset-0 bg-[#0B172A]/38 backdrop-blur-sm"
        onClick={onClose}
      />

      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(form);
        }}
        className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/88 shadow-2xl shadow-slate-900/20 ring-1 ring-white/50 backdrop-blur-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/70 px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#0F766E]">
              {mode === "create" ? "Tambah Data" : "Edit Data"}
            </p>
            <h2 className="mt-1 text-lg font-extrabold text-[#102A43]">
              {table?.label}
            </h2>
          </div>

          <button
            type="button"
            aria-label="Tutup"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/70 text-[#102A43] ring-1 ring-white/50 transition hover:bg-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto p-5">
          <div className="grid gap-4 md:grid-cols-2">
            {fields.map((field) => (
              <div
                key={field.name}
                className={field.type === "text" || field.type === "json" ? "md:col-span-2" : ""}
              >
                <label className="text-sm font-extrabold text-[#102A43]">
                  {field.label}
                  {(field.required ||
                    (field.name === "password" && mode === "create")) && (
                    <span className="text-red-600"> *</span>
                  )}
                </label>
                <FieldInput
                  field={field}
                  value={form[field.name] ?? ""}
                  mode={mode}
                  onChange={handleChange}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-white/70 p-5 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" disabled={isSaving}>
            <Save size={17} />
            {isSaving ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </form>
    </div>,
    document.body,
  );
}

function DeleteConfirmModal({ table, record, isDeleting, onClose, onConfirm }) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4 py-6">
      <button
        type="button"
        aria-label="Tutup konfirmasi hapus"
        className="absolute inset-0 bg-[#0B172A]/38 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-md rounded-[1.75rem] border border-white/70 bg-white/90 p-5 shadow-2xl shadow-slate-900/20 ring-1 ring-white/50 backdrop-blur-2xl">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-700">
          <Trash2 size={20} />
        </div>

        <h2 className="mt-4 text-lg font-extrabold text-[#102A43]">
          Hapus data {table?.label}?
        </h2>
        <p className="mt-2 text-sm font-medium leading-6 text-[#64748B]">
          Data ID #{record?.id} akan dihapus dari database jika tidak sedang
          dipakai tabel lain.
        </p>

        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button
            type="button"
            variant="danger"
            disabled={isDeleting}
            onClick={onConfirm}
          >
            <Trash2 size={17} />
            {isDeleting ? "Menghapus..." : "Hapus"}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default function ManageDatabasePage() {
  const [tables, setTables] = useState([]);
  const [selectedTableKey, setSelectedTableKey] = useState("");
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 1,
  });
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [isLoadingTables, setIsLoadingTables] = useState(true);
  const [isLoadingRows, setIsLoadingRows] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formState, setFormState] = useState(null);
  const [deleteState, setDeleteState] = useState(null);

  const selectedTable = useMemo(
    () => tables.find((table) => table.key === selectedTableKey) || null,
    [selectedTableKey, tables],
  );

  const groupedTables = useMemo(() => {
    return tables.reduce((groups, table) => {
      const category = table.category || "Database";
      return {
        ...groups,
        [category]: [...(groups[category] || []), table],
      };
    }, {});
  }, [tables]);

  const tableColumns = useMemo(() => {
    if (!selectedTable) return [];

    const visibleColumns = selectedTable.tableColumns?.length
      ? selectedTable.tableColumns
      : selectedTable.fields.filter((field) => field.name !== "password").slice(0, 6);

    return visibleColumns;
  }, [selectedTable]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchTables = async () => {
      setIsLoadingTables(true);
      setErrorMessage("");

      try {
        const data = await adminDatabaseService.getTables(controller.signal);
        const tableList = data.tables || [];

        if (controller.signal.aborted) return;

        setTables(tableList);
        setSelectedTableKey((current) => current || tableList[0]?.key || "");
      } catch (error) {
        if (!controller.signal.aborted) {
          setErrorMessage(
            error.response?.data?.message ||
              error.message ||
              "Metadata database belum bisa dimuat.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingTables(false);
        }
      }
    };

    fetchTables();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!selectedTableKey) return undefined;

    const controller = new AbortController();

    const fetchRows = async () => {
      setIsLoadingRows(true);
      setErrorMessage("");

      try {
        const data = await adminDatabaseService.listRecords({
          tableKey: selectedTableKey,
          search: activeSearch,
          page: pagination.page,
          limit: pagination.limit,
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;

        setRows(data.rows || []);
        setPagination((current) => ({
          ...current,
          ...(data.pagination || {}),
        }));
      } catch (error) {
        if (!controller.signal.aborted) {
          setRows([]);
          setErrorMessage(
            error.response?.data?.message ||
              error.message ||
              "Data database belum bisa dimuat.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingRows(false);
        }
      }
    };

    fetchRows();

    return () => controller.abort();
  }, [
    activeSearch,
    pagination.limit,
    pagination.page,
    reloadKey,
    selectedTableKey,
  ]);

  const handleSelectTable = (tableKey) => {
    setSelectedTableKey(tableKey);
    setRows([]);
    setSearchInput("");
    setActiveSearch("");
    setSuccessMessage("");
    setPagination((current) => ({
      ...current,
      page: 1,
    }));
  };

  const handleSubmitSearch = (event) => {
    event.preventDefault();
    setActiveSearch(searchInput.trim());
    setPagination((current) => ({
      ...current,
      page: 1,
    }));
  };

  const handleSaveRecord = async (payload) => {
    if (!formState || !selectedTable) return;

    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (formState.mode === "create") {
        await adminDatabaseService.createRecord({
          tableKey: selectedTable.key,
          payload,
        });
        setSuccessMessage("Data berhasil ditambahkan.");
      } else {
        await adminDatabaseService.updateRecord({
          tableKey: selectedTable.key,
          id: formState.record.id,
          payload,
        });
        setSuccessMessage("Data berhasil diperbarui.");
      }

      setFormState(null);
      setReloadKey((current) => current + 1);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Data belum bisa disimpan.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRecord = async () => {
    if (!deleteState || !selectedTable) return;

    setIsDeleting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await adminDatabaseService.deleteRecord({
        tableKey: selectedTable.key,
        id: deleteState.record.id,
      });

      setSuccessMessage("Data berhasil dihapus.");
      setDeleteState(null);
      setReloadKey((current) => current + 1);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Data belum bisa dihapus.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DashboardShell
      badge="Manage Database"
      title="Manage Database"
      description="Kelola data inti PINTARIN dengan akses admin."
      actions={
        <Button
          variant="iconGhost"
          size="icon"
          aria-label="Refresh database"
          title="Refresh data"
          disabled={isLoadingRows}
          onClick={() => setReloadKey((current) => current + 1)}
        >
          <RefreshCcw size={20} />
        </Button>
      }
    >
      {isLoadingTables ? (
        <LoadingState label="Menyiapkan metadata database..." />
      ) : (
        <>
          {errorMessage && (
            <DashboardErrorBanner
              title="Manage Database belum bisa diproses."
              description={errorMessage}
            />
          )}

          {successMessage && (
            <div className="rounded-[1.35rem] border border-[#5EEAD4]/45 bg-[#5EEAD4]/14 p-4 text-sm font-extrabold text-[#0F766E] ring-1 ring-white/40 backdrop-blur-xl">
              {successMessage}
            </div>
          )}

          <div className="grid gap-6">
            <DashboardSection
              badge="Table"
              title="Database"
              description="Pilih data yang akan dikelola."
              contentClassName="p-4 sm:p-5"
            >
              <div className="md:hidden">
                <SelectField
                  value={selectedTableKey}
                  onChange={handleSelectTable}
                >
                  {tables.map((table) => (
                    <option key={table.key} value={table.key}>
                      {table.label}
                    </option>
                  ))}
                </SelectField>
              </div>

              <div className="hidden gap-4 md:grid md:grid-cols-2 xl:grid-cols-3">
                {Object.entries(groupedTables).map(([category, tableItems]) => (
                  <div
                    key={category}
                    className="rounded-[1.25rem] border border-white/70 bg-white/34 p-3 ring-1 ring-white/35 backdrop-blur-xl"
                  >
                    <p className="mb-2 px-2 text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-[#94A3B8]">
                      {category}
                    </p>

                    <div className="space-y-1.5">
                      {tableItems.map((table) => {
                        const isActive = table.key === selectedTableKey;

                        return (
                          <button
                            key={table.key}
                            type="button"
                            onClick={() => handleSelectTable(table.key)}
                            className={[
                              "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-extrabold transition",
                              isActive
                                ? "bg-[#0F766E] text-white shadow-lg shadow-[#0F766E]/18"
                                : "text-[#475569] hover:bg-white/58 hover:text-[#0F766E]",
                            ].join(" ")}
                          >
                            <Database size={17} className="shrink-0" />
                            <span className="min-w-0 truncate">
                              {table.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </DashboardSection>

            <DashboardSection
              badge={selectedTable?.category}
              title={selectedTable?.label || "Database"}
              description={selectedTable?.description}
              action={
                selectedTable?.canCreate && (
                  <Button
                    onClick={() =>
                      setFormState({
                        mode: "create",
                        record: null,
                      })
                    }
                  >
                    <Plus size={17} />
                    Tambah
                  </Button>
                )
              }
            >
              {selectedTable && (
                <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:justify-end">
                  <form
                    onSubmit={handleSubmitSearch}
                    className="flex w-full gap-2 lg:max-w-md"
                  >
                    <div className="relative min-w-0 flex-1">
                      <Search
                        size={16}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                      />
                      <input
                        value={searchInput}
                        onChange={(event) => setSearchInput(event.target.value)}
                        placeholder="Cari data"
                        className="h-11 w-full rounded-2xl border border-white/70 bg-white/70 pl-9 pr-3 text-sm font-semibold text-[#102A43] outline-none ring-1 ring-white/40 placeholder:text-[#94A3B8] focus:border-[#5EEAD4] focus:ring-4 focus:ring-[#5EEAD4]/20"
                      />
                    </div>

                    <Button type="submit" variant="secondary">
                      Cari
                    </Button>
                  </form>
                </div>
              )}

              {isLoadingRows ? (
                <LoadingState label="Mengambil data tabel..." />
              ) : rows.length === 0 ? (
                <DashboardEmptyState
                  title="Belum ada data."
                  description="Data akan tampil setelah tabel memiliki record atau filter pencarian dikosongkan."
                />
              ) : (
                <>
                  <div className="overflow-hidden rounded-[1.5rem] border border-white/70 bg-white/42 ring-1 ring-white/40">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[860px] text-left">
                        <thead>
                          <tr className="border-b border-white/70 bg-white/44">
                            {tableColumns.map((field) => (
                              <th
                                key={field.name}
                                className="whitespace-nowrap px-4 py-3 text-xs font-extrabold uppercase tracking-[0.14em] text-[#64748B]"
                              >
                                {field.label}
                              </th>
                            ))}
                            <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-extrabold uppercase tracking-[0.14em] text-[#64748B]">
                              Aksi
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {rows.map((row) => (
                            <tr
                              key={row.id}
                              className="border-b border-white/55 text-sm last:border-0 hover:bg-white/35"
                            >
                              {tableColumns.map((field) => (
                                <td
                                  key={`${row.id}-${field.name}`}
                                  className="max-w-[18rem] px-4 py-3 font-semibold leading-6 text-[#475569]"
                                >
                                  <span className="line-clamp-2">
                                    {formatValue(row[field.name], field)}
                                  </span>
                                </td>
                              ))}
                              <td className="px-4 py-3">
                                <div className="flex justify-end gap-2">
                                  {selectedTable?.canUpdate && (
                                    <button
                                      type="button"
                                      aria-label="Edit data"
                                      onClick={() =>
                                        setFormState({
                                          mode: "edit",
                                          record: row,
                                        })
                                      }
                                      className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/66 text-[#0F766E] ring-1 ring-white/50 transition hover:bg-white"
                                    >
                                      <Pencil size={16} />
                                    </button>
                                  )}
                                  {selectedTable?.canDelete && (
                                    <button
                                      type="button"
                                      aria-label="Hapus data"
                                      onClick={() =>
                                        setDeleteState({
                                          record: row,
                                        })
                                      }
                                      className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50 text-red-700 ring-1 ring-red-100 transition hover:bg-red-100"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col justify-between gap-3 text-sm font-bold text-[#64748B] sm:flex-row sm:items-center">
                    <p>
                      {pagination.total} data - halaman {pagination.page} dari{" "}
                      {pagination.total_pages}
                    </p>

                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        disabled={pagination.page <= 1}
                        onClick={() =>
                          setPagination((current) => ({
                            ...current,
                            page: Math.max(current.page - 1, 1),
                          }))
                        }
                      >
                        Sebelumnya
                      </Button>
                      <Button
                        variant="secondary"
                        disabled={pagination.page >= pagination.total_pages}
                        onClick={() =>
                          setPagination((current) => ({
                            ...current,
                            page: current.page + 1,
                          }))
                        }
                      >
                        Berikutnya
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </DashboardSection>
          </div>
        </>
      )}

      {formState && selectedTable && (
        <RecordFormModal
          table={selectedTable}
          mode={formState.mode}
          record={formState.record}
          isSaving={isSaving}
          onClose={() => setFormState(null)}
          onSubmit={handleSaveRecord}
        />
      )}

      {deleteState && selectedTable && (
        <DeleteConfirmModal
          table={selectedTable}
          record={deleteState.record}
          isDeleting={isDeleting}
          onClose={() => setDeleteState(null)}
          onConfirm={handleDeleteRecord}
        />
      )}
    </DashboardShell>
  );
}
