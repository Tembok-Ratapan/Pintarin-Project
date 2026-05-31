import { useState } from "react";
import { ArrowLeft, ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import Grainient from "../../components/ui/Grainient";
import { useAuth } from "./useAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading } = useAuth();

  const [identifier, setIdentifier] = useState("admin_1");
  const [password, setPassword] = useState("Pintarin@2026");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await login({
        identifier: identifier.trim(),
        password,
      });

      navigate("/dashboard", { replace: true });
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Login gagal. Periksa username dan password.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative isolate min-h-[calc(100vh-4rem)] overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <Grainient
          color1="#5EEAD4"
          color2="#CCFBF1"
          color3="#F8FAFC"
          timeSpeed={0.14}
          colorBalance={-0.05}
          warpStrength={0.68}
          warpFrequency={4}
          warpSpeed={1.15}
          warpAmplitude={58}
          blendAngle={-14}
          blendSoftness={0.16}
          rotationAmount={280}
          noiseScale={1.8}
          grainAmount={0.035}
          grainScale={1.6}
          grainAnimated={false}
          contrast={1.05}
          gamma={1}
          saturation={1.02}
          centerX={0}
          centerY={-0.04}
          zoom={0.92}
          className="h-full w-full opacity-95"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(248,250,252,0.92)_0%,rgba(204,251,241,0.62)_45%,rgba(248,250,252,0.88)_100%)]" />
      </div>

      <section className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div className="order-2 lg:order-1">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-[#0F766E] transition hover:text-[#115E59]"
          >
            <ArrowLeft size={17} />
            Kembali ke landing page
          </Link>

          <Badge variant="green">Secure Workspace</Badge>

          <h1 className="font-heading mt-5 max-w-xl text-4xl font-extrabold leading-[1.05] tracking-[-0.05em] text-[#102A43] sm:text-5xl">
            Masuk ke ruang kerja PINTARIN.
          </h1>

          <p className="mt-5 max-w-xl text-sm leading-8 text-[#475569] sm:text-base">
            Akses dashboard, validasi prediksi AI, dan rekomendasi CSR hanya
            tersedia untuk pengguna yang memiliki otorisasi.
          </p>

          <div className="mt-8 grid max-w-xl gap-3">
            {[
              "JWT authentication",
              "Role-aware access control",
              "Protected API request",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/34 px-4 py-3 text-sm font-semibold text-[#475569] ring-1 ring-white/35 backdrop-blur-2xl"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#5EEAD4]/18 text-[#0F766E]">
                  <ShieldCheck size={18} />
                </span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <Card className="order-1 mx-auto w-full max-w-md overflow-hidden lg:order-2">
          <CardContent className="p-6 sm:p-8">
            <div className="mb-7 flex items-start justify-between gap-4">
              <div>
                <p className="font-heading text-2xl font-extrabold tracking-[-0.035em] text-[#102A43]">
                  Login
                </p>
                <p className="mt-2 text-sm leading-7 text-[#64748B]">
                  Gunakan akun seed yang sudah aktif.
                </p>
              </div>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#5EEAD4]/18 text-[#0F766E]">
                <LockKeyhole size={22} />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="identifier"
                  className="text-sm font-bold text-[#102A43]"
                >
                  Username atau Email
                </label>
                <input
                  id="identifier"
                  type="text"
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  autoComplete="username"
                  className="mt-2 h-12 w-full rounded-2xl border border-white/65 bg-white/55 px-4 text-sm font-semibold text-[#102A43] outline-none ring-1 ring-white/40 backdrop-blur-2xl transition placeholder:text-[#94A3B8] focus:border-[#5EEAD4] focus:ring-[#5EEAD4]/70"
                  placeholder="admin_1"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="text-sm font-bold text-[#102A43]"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  className="mt-2 h-12 w-full rounded-2xl border border-white/65 bg-white/55 px-4 text-sm font-semibold text-[#102A43] outline-none ring-1 ring-white/40 backdrop-blur-2xl transition placeholder:text-[#94A3B8] focus:border-[#5EEAD4] focus:ring-[#5EEAD4]/70"
                  placeholder="Masukkan password"
                  required
                />
              </div>

              {errorMessage && (
                <div className="rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm font-semibold leading-6 text-red-700">
                  {errorMessage}
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Memproses..." : "Masuk"}
                {!isSubmitting && <ArrowRight size={18} />}
              </Button>

              <p className="text-center text-xs leading-6 text-[#64748B]">
                Development password:{" "}
                <span className="font-bold text-[#0F766E]">Pintarin@2026</span>
              </p>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
