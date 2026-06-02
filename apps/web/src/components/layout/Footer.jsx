import BrandLogo from "../brand/BrandLogo";

const footerGroups = [
  {
    title: "Produk",
    links: [
      { label: "Peta Risiko", href: "#risk-map" },
      { label: "Produk", href: "#product" },
      { label: "Alur Sistem", href: "#workflow" },
    ],
  },
  {
    title: "Teknologi",
    links: [
      { label: "React + Vite", href: "#product" },
      { label: "Express REST API", href: "#risk-map" },
      { label: "AI Risk Scoring", href: "#workflow" },
    ],
  },
  {
    title: "Project",
    links: [
      { label: "Coding Camp 2026", href: "#" },
      { label: "Capstone CC26-PSU211", href: "#" },
      { label: "Accessible Learning", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative bg-white/18 backdrop-blur-2xl">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.25fr_1fr_1fr_1fr] lg:px-8 lg:py-14">
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

      <div className="bg-white/16">
        <div className="mx-auto flex w-full max-w-7xl flex-col justify-between gap-2 px-4 py-5 text-xs font-medium text-[#64748B] sm:flex-row sm:px-6 lg:px-8">
          <p>&copy; 2026 PINTARIN. Capstone Project CC26-PSU211.</p>
          <p>Education Aid Intelligence Platform.</p>
        </div>
      </div>
    </footer>
  );
}
