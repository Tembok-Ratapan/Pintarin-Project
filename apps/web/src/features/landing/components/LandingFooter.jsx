import { teamMembers } from "../data/teamMembers";
import LogoLoop from "../../../components/ui/LogoLoop";
import { BarChart3 } from "lucide-react";
import {
  SiAxios,
  SiExpress,
  SiGreensock,
  SiGooglecolab,
  SiKaggle,
  SiKeras,
  SiLeaflet,
  SiMysql,
  SiNumpy,
  SiPandas,
  SiPython,
  SiReact,
  SiScikitlearn,
  SiTailwindcss,
  SiVite,
  SiZod,
} from "react-icons/si";

const teamPalette = [
  {
    borderColor: "rgba(15, 118, 110, 0.28)",
    gradient:
      "linear-gradient(145deg, rgba(255,255,255,0.78), rgba(204,251,241,0.58), rgba(94,234,212,0.18))",
  },
  {
    borderColor: "rgba(2, 132, 199, 0.24)",
    gradient:
      "linear-gradient(180deg, rgba(255,255,255,0.80), rgba(236,254,255,0.62), rgba(56,189,248,0.12))",
  },
  {
    borderColor: "rgba(245, 158, 11, 0.26)",
    gradient:
      "linear-gradient(165deg, rgba(255,255,255,0.80), rgba(254,249,195,0.44), rgba(204,251,241,0.44))",
  },
  {
    borderColor: "rgba(251, 113, 133, 0.24)",
    gradient:
      "linear-gradient(195deg, rgba(255,255,255,0.82), rgba(255,228,230,0.38), rgba(204,251,241,0.48))",
  },
  {
    borderColor: "rgba(167, 139, 250, 0.24)",
    gradient:
      "linear-gradient(225deg, rgba(255,255,255,0.80), rgba(237,233,254,0.42), rgba(204,251,241,0.48))",
  },
  {
    borderColor: "rgba(34, 197, 94, 0.24)",
    gradient:
      "linear-gradient(135deg, rgba(255,255,255,0.82), rgba(220,252,231,0.42), rgba(204,251,241,0.48))",
  },
];

function hasValue(value) {
  return typeof value === "string" && value.trim() && value.trim() !== "-";
}

const platformTechStackItems = [
  {
    label: "React",
    title: "React",
    color: "#149ECA",
    Icon: SiReact,
  },
  {
    label: "Vite",
    title: "Vite",
    color: "#646CFF",
    Icon: SiVite,
  },
  {
    label: "Tailwind",
    title: "Tailwind CSS",
    color: "#38BDF8",
    Icon: SiTailwindcss,
  },
  {
    label: "Express",
    title: "Express REST API",
    color: "#111827",
    Icon: SiExpress,
  },
  {
    label: "MySQL",
    title: "MySQL",
    color: "#00758F",
    Icon: SiMysql,
  },
  {
    label: "Leaflet",
    title: "Leaflet",
    color: "#199900",
    Icon: SiLeaflet,
  },
  {
    label: "Recharts",
    title: "Recharts",
    color: "#22B5BF",
    Icon: BarChart3,
  },
  {
    label: "Axios",
    title: "Axios",
    color: "#5A29E4",
    Icon: SiAxios,
  },
  {
    label: "GSAP",
    title: "GSAP",
    color: "#88CE02",
    Icon: SiGreensock,
  },
  {
    label: "Zod",
    title: "Zod",
    color: "#3068B7",
    Icon: SiZod,
  },
];

const aiDataTechStackItems = [
  {
    label: "Python",
    title: "Python",
    color: "#3776AB",
    Icon: SiPython,
  },
  {
    label: "pandas",
    title: "pandas",
    color: "#150458",
    Icon: SiPandas,
  },
  {
    label: "NumPy",
    title: "NumPy",
    color: "#013243",
    Icon: SiNumpy,
  },
  {
    label: "scikit-learn",
    title: "scikit-learn",
    color: "#F7931E",
    Icon: SiScikitlearn,
  },
  {
    label: "Keras",
    title: "Keras",
    color: "#D00000",
    Icon: SiKeras,
  },
  {
    label: "Matplotlib",
    title: "Matplotlib",
    imageSrc:
      "https://upload.wikimedia.org/wikipedia/commons/8/84/Matplotlib_icon.svg",
  },
  {
    label: "Kaggle",
    title: "Kaggle",
    color: "#20BEFF",
    Icon: SiKaggle,
  },
  {
    label: "Google Colab",
    title: "Google Colab",
    color: "#F9AB00",
    Icon: SiGooglecolab,
  },
];

const buildTechLogos = (items) =>
  items.map((item) => ({
    title: item.title,
    ariaLabel: item.title,
    node: <TechLogoMark {...item} />,
  }));

const platformTechLogos = buildTechLogos(platformTechStackItems);
const aiDataTechLogos = buildTechLogos(aiDataTechStackItems);

const techStackGroups = [
  {
    title: "Platform Engineering",
    logos: platformTechLogos,
    speed: 74,
    direction: "left",
  },
  {
    title: "AI & Data Scientist",
    logos: aiDataTechLogos,
    speed: 58,
    direction: "right",
  },
];

export default function LandingFooter() {
  return (
    <section
      id="team"
      className="relative bg-transparent px-5 pb-12 pt-16 text-[#102A43] sm:px-8 lg:px-10 xl:px-12"
    >
      <div className="relative mx-auto w-full max-w-7xl">
        <div className="mb-6">
          <div>
            <h2 className="font-heading text-3xl font-semibold leading-[1.04] text-[#102A43] sm:text-4xl">
              PINTARIN TEAM
            </h2>
          </div>
        </div>

        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          {[
            ["Web Platform", "Dashboard role-based dan REST API"],
            ["AI & Data", "Prediksi risiko, confidence, dan analitik"],
            ["Decision Flow", "Validasi bantuan sekolah dan CSR"],
          ].map(([title, description]) => (
            <div
              key={title}
              className="rounded-2xl border border-white/58 bg-white/30 px-4 py-3 ring-1 ring-white/38 backdrop-blur-xl"
            >
              <p className="font-heading text-sm font-semibold text-[#102A43]">
                {title}
              </p>
              <p className="mt-1 text-xs font-semibold leading-5 text-[#64748B]">
                {description}
              </p>
            </div>
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {teamMembers.map((member, index) => (
            <TeamCard
              key={member.id}
              member={member}
              palette={teamPalette[index % teamPalette.length]}
            />
          ))}
        </div>

        <div className="mt-8 space-y-5 py-4">
          <div className="max-w-3xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#0F766E]">
              Tech Stack PINTARIN
            </p>
          </div>

          {techStackGroups.map((group) => (
            <TechStackLoop key={group.title} {...group} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TechStackLoop({ title, logos, speed, direction }) {
  return (
    <div className="w-full">
      <LogoLoop
        logos={logos}
        speed={speed}
        direction={direction}
        logoHeight={34}
        gap={48}
        hoverSpeed={0}
        scaleOnHover
        ariaLabel={`${title} PINTARIN`}
      />
    </div>
  );
}

function TechLogoMark({ label, color, Icon, imageSrc }) {
  return (
    <span className="inline-flex items-center gap-2.5 text-sm font-extrabold text-[#102A43]">
      {imageSrc ? (
        <img
          src={imageSrc}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          className="h-8 w-8 shrink-0 object-contain"
        />
      ) : (
        <Icon
          aria-hidden="true"
          className="h-8 w-8 shrink-0"
          style={{ color }}
        />
      )}
      <span className="whitespace-nowrap leading-none">{label}</span>
    </span>
  );
}

function TeamCard({ member, palette }) {
  const hasPhoto = hasValue(member.image);
  const hasLinkedIn = hasValue(member.linkedin);
  const Component = hasLinkedIn ? "a" : "article";
  const linkProps = hasLinkedIn
    ? {
        href: member.linkedin,
        target: "_blank",
        rel: "noreferrer noopener",
        "aria-label": `Buka profil LinkedIn ${member.name}`,
      }
    : {};
  const initials = member.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <Component
      {...linkProps}
      className={`group relative flex min-h-full items-center gap-3 overflow-hidden rounded-[1.15rem] border border-white/70 p-2.5 shadow-xl shadow-slate-200/18 ring-1 ring-white/45 backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-teal-900/10 ${hasLinkedIn ? "cursor-pointer no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0F766E]" : ""}`}
      style={{
        "--team-border": palette.borderColor,
        background: palette.gradient,
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[1.15rem] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ boxShadow: "inset 0 0 0 2px var(--team-border)" }}
      />

      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[0.95rem] bg-white/38 sm:h-28 sm:w-28">
        {hasPhoto ? (
          <img
            src={member.image}
            alt={`Foto ${member.name}`}
            loading="lazy"
            className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-[1.035]"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-[radial-gradient(circle_at_35%_20%,rgba(255,255,255,0.96),rgba(204,251,241,0.62)_42%,rgba(15,118,110,0.08)_100%)] px-3 text-center">
            <span className="text-3xl font-extrabold text-[#0F766E]/70">
              {initials}
            </span>
            <span className="mt-2 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-[#0F766E]/60">
              Foto menyusul
            </span>
          </div>
        )}
      </div>

      <footer className="relative z-10 min-w-0 flex-1 py-1 pr-2 text-[#102A43]">
        <h3 className="font-heading text-base font-semibold leading-tight">
          {member.name}
        </h3>

        <p className="mt-1.5 text-sm font-semibold leading-5 text-[#475569]">
          {member.role}
        </p>

        <span className="mt-2 inline-flex w-fit rounded-xl border border-[#0F766E]/12 bg-white/64 px-2.5 py-1 text-[0.68rem] font-bold tracking-[0.06em] text-[#0F766E]/76">
          {member.id}
        </span>
      </footer>
    </Component>
  );
}
