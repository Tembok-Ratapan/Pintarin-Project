import {
  BarChart3,
  ChevronDown,
  ClipboardCheck,
  GraduationCap,
  HandHeart,
  MapPinned,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import DashboardSection from "../components/DashboardSection";
import DashboardShell from "../components/DashboardShell";

const featureHighlights = [
  {
    title: "Prioritas wilayah",
    description: "Membaca tingkat risiko rendah, sedang, dan tinggi.",
    icon: MapPinned,
  },
  {
    title: "Rekomendasi bantuan",
    description: "Menyesuaikan jenis bantuan dengan kebutuhan data.",
    icon: HandHeart,
  },
  {
    title: "Validasi manusia",
    description: "Menjaga keputusan akhir tetap sesuai kondisi lapangan.",
    icon: ClipboardCheck,
  },
];

const roleBenefits = [
  {
    title: "Dinas Pendidikan",
    description:
      "Melihat wilayah prioritas lebih cepat, memahami alasan rekomendasi, dan mengambil keputusan berbasis data.",
    icon: ShieldCheck,
  },
  {
    title: "Sekolah",
    description:
      "Mengajukan bantuan, melihat kebutuhan berdasarkan data, dan memantau status permohonan secara jelas.",
    icon: GraduationCap,
  },
  {
    title: "Mitra CSR",
    description:
      "Menemukan wilayah atau sekolah prioritas agar program bantuan lebih tepat sasaran, terukur, dan berdampak.",
    icon: HandHeart,
  },
];

const faqItems = [
  {
    question: "Apa itu fitur Bantuan di PINTARIN?",
    answer:
      "Fitur Bantuan adalah fitur yang membantu pengguna menemukan wilayah atau sekolah yang paling membutuhkan bantuan pendidikan berdasarkan hasil analisis AI, sehingga bantuan bisa lebih tepat sasaran.",
  },
  {
    question: "Bagaimana PINTARIN menentukan prioritas bantuan?",
    answer:
      "PINTARIN menentukan prioritas bantuan dengan menganalisis data risiko wilayah, seperti rasio penerima bantuan, jumlah warga rentan, gap bantuan, tingkat urgensi, dan data pendidikan lainnya.",
  },
  {
    question: "Siapa saja yang bisa menggunakan fitur Bantuan?",
    answer:
      "Fitur ini dapat digunakan oleh Dinas Pendidikan, admin sekolah, dan mitra CSR sesuai dengan kebutuhan dan perannya masing-masing.",
  },
  {
    question: "Apakah rekomendasi bantuan dari AI langsung menjadi keputusan akhir?",
    answer:
      "Tidak. Rekomendasi dari AI tetap perlu divalidasi oleh pihak terkait agar keputusan akhir tetap sesuai dengan kondisi nyata di lapangan.",
  },
  {
    question: "Apa manfaat fitur Bantuan untuk Dinas Pendidikan?",
    answer:
      "Fitur ini membantu Dinas Pendidikan melihat wilayah prioritas dengan lebih cepat, memahami alasan rekomendasi, dan mengambil keputusan bantuan secara lebih berbasis data.",
  },
  {
    question: "Apa manfaat fitur Bantuan untuk sekolah?",
    answer:
      "Sekolah dapat mengajukan bantuan, melihat kebutuhan berdasarkan data, dan memantau status permohonan bantuan secara lebih jelas melalui sistem.",
  },
  {
    question: "Apa manfaat fitur Bantuan untuk mitra CSR?",
    answer:
      "Mitra CSR dapat melihat rekomendasi wilayah atau sekolah prioritas agar program bantuan yang diberikan lebih tepat sasaran, terukur, dan berdampak nyata.",
  },
  {
    question: "Jenis bantuan apa saja yang bisa direkomendasikan?",
    answer:
      "Bantuan yang dapat direkomendasikan meliputi beasiswa, bantuan belajar tambahan, bantuan fasilitas sekolah, sarana pendidikan, dan program CSR pendidikan.",
  },
  {
    question: "Apa arti risiko rendah, sedang, dan tinggi?",
    answer:
      "Risiko rendah berarti wilayah belum menjadi prioritas utama, risiko sedang berarti wilayah perlu diperhatikan, sedangkan risiko tinggi berarti wilayah menjadi prioritas utama untuk menerima bantuan.",
  },
  {
    question: "Apa itu Explain AI dalam fitur Bantuan?",
    answer:
      "Explain AI adalah fitur yang menjelaskan alasan di balik rekomendasi bantuan, seperti faktor apa yang paling memengaruhi suatu wilayah masuk ke kategori prioritas.",
  },
  {
    question: "Kenapa fitur Bantuan PINTARIN penting?",
    answer:
      "Fitur ini penting karena membantu mengurangi risiko bantuan yang tidak tepat sasaran dan membuat proses distribusi bantuan pendidikan menjadi lebih transparan, cepat, dan objektif.",
  },
  {
    question: "Apakah PINTARIN menggantikan peran manusia dalam menentukan bantuan?",
    answer:
      "Tidak. PINTARIN hanya membantu memberikan analisis dan rekomendasi, sementara keputusan akhir tetap berada pada pihak berwenang melalui proses validasi.",
  },
  {
    question: "Bagaimana jika rekomendasi AI tidak sesuai kondisi lapangan?",
    answer:
      "Rekomendasi dapat ditinjau ulang dan divalidasi oleh pihak terkait sebelum bantuan disetujui atau dijalankan.",
  },
  {
    question: "Apakah data bantuan bisa dipantau melalui PINTARIN?",
    answer:
      "Ya. Pengguna dapat memantau data bantuan, status permohonan, wilayah prioritas, dan hasil rekomendasi melalui dashboard yang tersedia.",
  },
  {
    question: "Apa tujuan utama fitur Bantuan PINTARIN?",
    answer:
      "Tujuan utamanya adalah memastikan bantuan pendidikan tidak hanya tersalurkan, tetapi benar-benar sampai kepada wilayah atau kelompok yang paling membutuhkan.",
  },
];

function InfoCard({ item }) {
  const Icon = item.icon;

  return (
    <div className="rounded-[1.25rem] border border-white/70 bg-white/42 p-4 ring-1 ring-white/35">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#5EEAD4]/18 text-[#0F766E]">
        <Icon size={18} />
      </div>

      <p className="text-sm font-extrabold text-[#102A43]">{item.title}</p>
      <p className="mt-2 text-xs font-semibold leading-5 text-[#64748B]">
        {item.description}
      </p>
    </div>
  );
}

export default function ProductAboutPage() {
  return (
    <DashboardShell
      badge="Tentang Produk"
      title="Tentang Produk"
      description="Informasi fitur Bantuan PINTARIN dan cara rekomendasi AI dipakai dalam alur bantuan pendidikan."
    >
      <DashboardSection contentClassName="p-6 sm:p-8">
        <div className="grid gap-7 xl:grid-cols-[0.92fr_1.08fr] xl:items-center">
          <div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#5EEAD4]/20 text-[#0F766E] ring-1 ring-white/50">
              <Sparkles size={24} />
            </div>

            <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.2em] text-[#0F766E]">
              Fitur Bantuan
            </p>

            <h2 className="font-heading mt-3 text-2xl font-extrabold leading-tight text-[#102A43] sm:text-3xl">
              Bantuan pendidikan yang lebih tepat sasaran.
            </h2>

            <p className="mt-4 text-sm font-medium leading-7 text-[#64748B]">
              Fitur Bantuan PINTARIN membantu pengguna menemukan wilayah atau
              sekolah yang paling membutuhkan bantuan pendidikan berdasarkan
              hasil analisis AI. Sistem membaca data risiko setiap wilayah,
              menampilkan tingkat prioritas, lalu memberikan rekomendasi bantuan
              yang paling sesuai.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
            {featureHighlights.map((item) => (
              <InfoCard key={item.title} item={item} />
            ))}
          </div>
        </div>
      </DashboardSection>

      <DashboardSection
        badge="Manfaat"
        title="Manfaat per role"
        description="Setiap role memakai rekomendasi bantuan sesuai tanggung jawabnya."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {roleBenefits.map((item) => (
            <InfoCard key={item.title} item={item} />
          ))}
        </div>
      </DashboardSection>

      <DashboardSection
        badge="FAQ"
        title="Pertanyaan umum"
        description="Ringkasan cara kerja fitur Bantuan dan rekomendasi AI."
      >
        <div className="grid gap-3">
          {faqItems.map((item, index) => (
            <details
              key={item.question}
              className="group rounded-[1.25rem] border border-white/70 bg-white/42 p-4 ring-1 ring-white/35 transition hover:bg-white/58"
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                <span className="flex min-w-0 gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#5EEAD4]/18 text-xs font-extrabold text-[#0F766E]">
                    {index + 1}
                  </span>
                  <span className="pt-0.5 text-sm font-extrabold leading-6 text-[#102A43]">
                    {item.question}
                  </span>
                </span>

                <ChevronDown
                  size={18}
                  className="mt-1 shrink-0 text-[#64748B] transition group-open:rotate-180"
                />
              </summary>

              <p className="ml-10 mt-3 text-sm font-medium leading-7 text-[#64748B]">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </DashboardSection>

      <DashboardSection
        badge="Explain AI"
        title="Keputusan tetap divalidasi manusia"
        description="AI membantu membaca pola dan memberikan rekomendasi. Validasi akhir tetap dilakukan oleh pihak berwenang."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Analisis data",
              description:
                "Sistem membaca rasio penerima bantuan, warga rentan, gap bantuan, urgensi, dan indikator pendidikan.",
              icon: BarChart3,
            },
            {
              title: "Rekomendasi",
              description:
                "Wilayah atau sekolah dipetakan berdasarkan prioritas agar bantuan lebih transparan dan objektif.",
              icon: Sparkles,
            },
            {
              title: "Validasi",
              description:
                "Pihak terkait dapat meninjau ulang rekomendasi sebelum bantuan disetujui atau dijalankan.",
              icon: ClipboardCheck,
            },
          ].map((item) => (
            <InfoCard key={item.title} item={item} />
          ))}
        </div>
      </DashboardSection>
    </DashboardShell>
  );
}
