import { useEffect, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Globe2,
  Mail,
  MapPinned,
  Phone,
  Save,
  UserRoundCog,
} from "lucide-react";

import Button from "../../../components/ui/Button";
import LoadingState from "../../../components/feedback/LoadingState";
import DashboardErrorBanner from "../components/DashboardErrorBanner";
import DashboardMetricCard from "../components/DashboardMetricCard";
import DashboardSection from "../components/DashboardSection";
import DashboardShell from "../components/DashboardShell";
import { profileService } from "../profileService";

const initialForm = {
  display_name: "",
  organization_name: "",
  phone: "",
  contact_email: "",
  address: "",
  website: "",
  logo_url: "",
  description: "",
};

const profileTypeLabel = {
  admin: "Admin",
  dinas: "Dinas",
  sekolah: "Sekolah",
  csr: "CSR",
  analitik: "Analis",
  viewer: "Viewer",
};

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  icon: Icon,
}) {
  return (
    <div>
      <label className="text-sm font-extrabold text-[#102A43]">{label}</label>

      <div className="relative mt-2">
        {Icon && (
          <Icon
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]"
          />
        )}

        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`h-12 w-full rounded-2xl border border-white/70 bg-white/68 text-sm font-semibold text-[#102A43] outline-none ring-1 ring-white/40 backdrop-blur-2xl transition placeholder:text-[#94A3B8] focus:border-[#5EEAD4] focus:ring-4 focus:ring-[#5EEAD4]/20 ${
            Icon ? "px-11" : "px-4"
          }`}
        />
      </div>
    </div>
  );
}

function TextAreaField({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-sm font-extrabold text-[#102A43]">{label}</label>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        placeholder={placeholder}
        className="mt-2 w-full resize-none rounded-2xl border border-white/70 bg-white/68 px-4 py-3 text-sm font-semibold leading-7 text-[#102A43] outline-none ring-1 ring-white/40 backdrop-blur-2xl transition placeholder:text-[#94A3B8] focus:border-[#5EEAD4] focus:ring-4 focus:ring-[#5EEAD4]/20"
      />
    </div>
  );
}

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const updateField = (field, value) => {
    setSuccessMessage("");
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  useEffect(() => {
    const controller = new AbortController();

    const fetchProfile = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const data = await profileService.getMyProfile(controller.signal);

        if (controller.signal.aborted) return;

        setProfile(data);
        setForm({
          display_name: data?.display_name || "",
          organization_name: data?.organization_name || "",
          phone: data?.phone || "",
          contact_email: data?.contact_email || "",
          address: data?.address || "",
          website: data?.website || "",
          logo_url: data?.logo_url || "",
          description: data?.description || "",
        });
      } catch (error) {
        if (!controller.signal.aborted) {
          setErrorMessage(
            error.response?.data?.message ||
              error.message ||
              "Profil belum bisa dimuat.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchProfile();

    return () => controller.abort();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const data = await profileService.updateMyProfile(form);
      setProfile(data);
      setSuccessMessage("Profil berhasil diperbarui.");
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Profil gagal diperbarui.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const profileLabel =
    profileTypeLabel[profile?.profile_type] || profile?.profile_type || "-";

  return (
    <DashboardShell
      badge="Profil"
      title="Profil Stakeholder"
      description="Kelola identitas dan informasi kontak."
    >
      {isLoading ? (
        <LoadingState label="Mengambil profil..." />
      ) : (
        <>
          {errorMessage && (
            <DashboardErrorBanner
              title="Profil belum bisa diproses."
              description={errorMessage}
            />
          )}

          {successMessage && (
            <div className="flex items-center gap-3 rounded-[1.5rem] border border-[#5EEAD4]/45 bg-[#5EEAD4]/14 p-4 text-[#0F766E] ring-1 ring-white/40 backdrop-blur-xl">
              <CheckCircle2 size={20} />
              <p className="text-sm font-extrabold">{successMessage}</p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <DashboardMetricCard
              label="Tipe"
              value={profileLabel}
              helper="Jenis stakeholder"
              icon={UserRoundCog}
              tone="teal"
            />

            <DashboardMetricCard
              label="Status"
              value={profile?.is_verified ? "Terverifikasi" : "Belum"}
              helper="Status profil"
              icon={CheckCircle2}
              tone={profile?.is_verified ? "teal" : "amber"}
            />

            <DashboardMetricCard
              label="Wilayah"
              value={profile?.region_name || "-"}
              helper="Wilayah terkait"
              icon={MapPinned}
              tone="blue"
            />

            <DashboardMetricCard
              label="Sekolah"
              value={profile?.school_name || "-"}
              helper="Jika akun sekolah"
              icon={Building2}
              tone="teal"
            />
          </div>

          <DashboardSection
            badge="Data Profil"
            title="Informasi utama"
            description="Gunakan informasi singkat dan jelas."
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 lg:grid-cols-2">
                <TextField
                  label="Nama Tampilan"
                  value={form.display_name}
                  onChange={(value) => updateField("display_name", value)}
                  placeholder="Contoh: SDN Mandalajati 02"
                  icon={UserRoundCog}
                />

                <TextField
                  label="Nama Institusi"
                  value={form.organization_name}
                  onChange={(value) => updateField("organization_name", value)}
                  placeholder="Contoh: Dinas Pendidikan Kota Bandung"
                  icon={Building2}
                />

                <TextField
                  label="Email Kontak"
                  value={form.contact_email}
                  onChange={(value) => updateField("contact_email", value)}
                  placeholder="kontak@pintarin.id"
                  icon={Mail}
                />

                <TextField
                  label="Nomor Telepon"
                  value={form.phone}
                  onChange={(value) => updateField("phone", value)}
                  placeholder="08xxxxxxxxxx"
                  icon={Phone}
                />

                <TextField
                  label="Website"
                  value={form.website}
                  onChange={(value) => updateField("website", value)}
                  placeholder="https://..."
                  icon={Globe2}
                />

                <TextField
                  label="Logo URL"
                  value={form.logo_url}
                  onChange={(value) => updateField("logo_url", value)}
                  placeholder="https://..."
                  icon={Building2}
                />
              </div>

              <TextAreaField
                label="Alamat"
                value={form.address}
                onChange={(value) => updateField("address", value)}
                placeholder="Alamat institusi atau sekolah..."
              />

              <TextAreaField
                label="Deskripsi"
                value={form.description}
                onChange={(value) => updateField("description", value)}
                placeholder="Tuliskan deskripsi singkat stakeholder..."
              />

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button type="submit" size="lg" disabled={isSaving}>
                  <Save size={18} />
                  {isSaving ? "Menyimpan..." : "Simpan Profil"}
                </Button>
              </div>
            </form>
          </DashboardSection>
        </>
      )}
    </DashboardShell>
  );
}