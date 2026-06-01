import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import BrandLogo from "../../components/brand/BrandLogo";
import Button from "../../components/ui/Button";
import { getDashboardPathByRole } from "../dashboard/dashboardRoutes";
import { useAuth } from "./useAuth";
import BandungBoundaryVisual from "./components/BandungBoundaryVisual";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading, user } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requestedRedirectPath = location.state?.from?.pathname;

  const getPostLoginRedirectPath = (nextUser) => {
    const roleDashboardPath = getDashboardPathByRole(nextUser?.role);

    if (
      !requestedRedirectPath ||
      requestedRedirectPath === "/" ||
      requestedRedirectPath === "/login" ||
      requestedRedirectPath === "/dashboard"
    ) {
      return roleDashboardPath;
    }

    return requestedRedirectPath;
  };

  if (!isLoading && isAuthenticated) {
    return <Navigate to={getPostLoginRedirectPath(user)} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const result = await login({
        identifier: identifier.trim(),
        password,
      });

      navigate(getPostLoginRedirectPath(result.user), { replace: true });
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
    <main className="min-h-screen overflow-hidden bg-[#F8FAFC]">
      <div className="grid min-h-screen lg:grid-cols-[0.92fr_1.08fr]">
        <section className="relative flex min-h-screen items-center justify-center px-5 py-8 sm:px-8 lg:px-12 xl:px-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(94,234,212,0.18),transparent_34%),linear-gradient(135deg,#ffffff_0%,#F8FAFC_58%,#ECFEFF_100%)]" />

          <div className="relative z-10 w-full max-w-[430px]">
            <Link
              to="/"
              className="mb-9 inline-flex items-center gap-2 text-sm font-extrabold text-[#0F766E] transition hover:text-[#115E59]"
            >
              <ArrowLeft size={17} />
              Kembali
            </Link>

            <div className="mb-10">
              <BrandLogo />

              <h1 className="font-heading mt-12 text-4xl font-extrabold uppercase leading-[1.02] tracking-[0.04em] text-[#0B172A] sm:text-5xl">
                Welcome Back
              </h1>

              <p className="mt-4 max-w-sm text-sm font-medium leading-7 text-[#64748B] sm:text-base">
                Masuk untuk mengakses dashboard, validasi AI, dan rekomendasi
                bantuan pendidikan PINTARIN.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="identifier"
                  className="text-sm font-extrabold tracking-[0.01em] text-[#101828]"
                >
                  Username atau Email
                </label>

                <div className="relative mt-2">
                  <Mail
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                  />

                  <input
                    id="identifier"
                    type="text"
                    value={identifier}
                    onChange={(event) => setIdentifier(event.target.value)}
                    autoComplete="username"
                    className="h-12 w-full rounded-2xl border border-[#D6DEE8] bg-white px-11 text-sm font-semibold text-[#102A43] outline-none transition placeholder:text-[#94A3B8] focus:border-[#0F766E] focus:ring-4 focus:ring-[#5EEAD4]/24"
                    placeholder="Masukkan username atau email"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="text-sm font-extrabold tracking-[0.01em] text-[#101828]"
                >
                  Password
                </label>

                <div className="relative mt-2">
                  <LockKeyhole
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                  />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                    className="h-12 w-full rounded-2xl border border-[#D6DEE8] bg-white px-11 pr-12 text-sm font-semibold text-[#102A43] outline-none transition placeholder:text-[#94A3B8] focus:border-[#0F766E] focus:ring-4 focus:ring-[#5EEAD4]/24"
                    placeholder="Masukkan password"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl text-[#64748B] transition hover:bg-slate-100 hover:text-[#0F766E]"
                    aria-label={
                      showPassword
                        ? "Sembunyikan password"
                        : "Tampilkan password"
                    }
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold leading-6 text-red-700">
                  {errorMessage}
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                className="h-12 w-full rounded-2xl bg-[#0F766E] shadow-lg shadow-[#0F766E]/18 hover:bg-[#115E59]"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Memproses..." : "Sign in"}
                {!isSubmitting && <ArrowRight size={18} />}
              </Button>
            </form>
          </div>
        </section>

        <BandungBoundaryVisual />
      </div>
    </main>
  );
}
