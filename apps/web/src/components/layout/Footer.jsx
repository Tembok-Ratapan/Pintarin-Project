import BrandLogo from "../brand/BrandLogo";

const footerGroups = [
  {
    title: "Produk",
    links: [
      { label: "Peta Risiko", href: "/#risk-map" },
      { label: "Produk Bantuan", href: "/#product" },
      { label: "Alur Sistem", href: "/#workflow" },
      { label: "PINTARIN Team", href: "/#team" },
      { label: "Analitik Publik", href: "/analytic-pintarin" },
    ],
  },
  {
    title: "Platform",
    links: [
      { label: "Map Risk", href: "/#risk-map" },
      { label: "AI Matching", href: "/#product" },
      { label: "Human Validation", href: "/#workflow" },
      { label: "CSR Distribution Flow", href: "/#workflow" },
      { label: "Role-based Dashboard", href: "/login" },
    ],
  },
  {
    title: "Web Stack",
    links: [
      { label: "React + Vite", href: "/#team" },
      { label: "Tailwind CSS", href: "/#team" },
      { label: "Express REST API", href: "/#team" },
      { label: "MySQL + Zod", href: "/#team" },
      { label: "Leaflet + Recharts", href: "/#team" },
    ],
  },
  {
    title: "AI & Data",
    links: [
      { label: "Python", href: "/#team" },
      { label: "pandas + NumPy", href: "/#team" },
      { label: "scikit-learn + Keras", href: "/#team" },
      { label: "Matplotlib", href: "/#team" },
      { label: "Kaggle + Google Colab", href: "/#team" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-white/70 bg-white/72 shadow-[0_-24px_80px_rgba(15,23,42,0.07)] backdrop-blur-2xl">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-2 lg:grid-cols-[1.25fr_0.85fr_0.85fr_0.85fr_0.85fr] lg:px-10 lg:py-14 xl:px-12">
        <div>
          <BrandLogo />

          <p className="mt-5 max-w-sm text-sm leading-7 text-[#475569]">
            Sistem pendukung keputusan untuk membantu distribusi bantuan
            pendidikan di Kota Bandung agar lebih tepat sasaran, tervalidasi,
            dan transparan.
          </p>

          <div className="mt-5 inline-flex text-xs font-extrabold uppercase tracking-[0.14em] text-[#0F766E]">
            Built for Accessible & Adaptive Learning
          </div>

          <div className="mt-5 space-y-2 text-xs font-semibold leading-5 text-[#64748B]">
            <p>Capstone ID: CC26-PSU211</p>
            <p>
              Fokus: risk map, AI matching, validasi manusia, dan transparansi
              alur bantuan.
            </p>
            <p>
              Stack data: Python, pandas, NumPy, scikit-learn, Keras,
              Matplotlib, Kaggle, dan Google Colab.
            </p>
            <p>Wilayah studi: Kota Bandung, Indonesia.</p>
          </div>
        </div>

        {footerGroups.map((group) => (
          <div key={group.title}>
            <h3 className="text-sm font-extrabold text-[#102A43]">
              {group.title}
            </h3>

            <ul className="mt-4 space-y-3">
              {group.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm font-medium text-[#64748B] transition hover:text-[#0F766E]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/60 bg-white/45">
        <div className="mx-auto flex w-full max-w-7xl flex-col justify-between gap-2 px-5 py-5 text-xs font-medium text-[#64748B] sm:flex-row sm:px-8 lg:px-10 xl:px-12">
          <p>&copy; 2026 PINTARIN. Capstone Project CC26-PSU211.</p>
          <p>Education Aid Intelligence Platform.</p>
        </div>
      </div>
    </footer>
  );
}
