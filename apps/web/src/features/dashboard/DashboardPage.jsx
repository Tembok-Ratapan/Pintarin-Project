import { LogOut, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import { useAuth } from "../auth/useAuth";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <main className="mx-auto min-h-[calc(100vh-4rem)] w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <Badge variant="green">Protected Dashboard</Badge>

          <h1 className="font-heading mt-4 text-3xl font-extrabold tracking-[-0.04em] text-[#102A43] sm:text-4xl">
            Dashboard PINTARIN
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-8 text-[#475569]">
            Halaman ini sudah dilindungi oleh JWT. Nanti di step berikutnya,
            konten dashboard final akan diisi berdasarkan role pengguna.
          </p>
        </div>

        <Button variant="secondary" onClick={handleLogout}>
          <LogOut size={18} />
          Logout
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["Nama", user?.full_name || "-"],
          ["Role", user?.role || "-"],
          ["Instansi", user?.institution || "-"],
        ].map(([label, value]) => (
          <Card key={label}>
            <CardContent className="p-5">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#5EEAD4]/18 text-[#0F766E]">
                <ShieldCheck size={20} />
              </div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#64748B]">
                {label}
              </p>
              <p className="mt-2 text-lg font-extrabold text-[#102A43]">
                {value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}