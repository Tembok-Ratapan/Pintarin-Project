import { ArrowRight, CheckCircle2 } from "lucide-react";

import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import RotatingText from "../../../components/ui/RotatingText";
import TextType from "../../../components/ui/TextType";

const rotatingTexts = [
  "tepat sasaran",
  "ter-track",
  "jelas riwayatnya",
  "tahu ke mana",
];

const highlights = ["RESTful API", "AI Confidence Score", "Role-based Access"];

export default function HeroSection() {
  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative">
      <div className="mx-auto flex min-h-[calc(76vh-4rem)] w-full max-w-7xl items-center justify-center px-4 pb-10 pt-12 sm:px-6 sm:pb-14 sm:pt-16 lg:min-h-[calc(78vh-4rem)] lg:px-8 lg:pb-16 lg:pt-[4.5rem]">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center text-center">
          <Badge variant="blue">Accessible & Adaptive Learning</Badge>

          <div className="mt-4 flex min-h-[7rem] w-full items-center justify-center sm:min-h-[8rem] lg:min-h-[9rem]">
            <TextType
              as="h1"
              text="Selamat Datang Di Pintarin"
              typingSpeed={60}
              initialDelay={120}
              loop={false}
              showCursor
              cursorCharacter="|"
              cursorClassName="text-[#0F766E]"
              className="font-heading max-w-4xl text-balance text-4xl font-extrabold leading-[1.04] text-[#102A43] sm:text-5xl lg:text-6xl"
            />
          </div>

          <div className="mt-4 flex max-w-3xl flex-wrap items-center justify-center gap-x-2 gap-y-3 text-base font-medium leading-8 text-[#475569] sm:text-lg">
            <span>Jangan sampai bantuan pendidikan tidak</span>

            <span className="relative inline-grid items-center align-middle">
              <span
                aria-hidden="true"
                className="[grid-area:1/1] invisible rounded-2xl border border-transparent px-4 py-2.5 text-sm font-bold leading-tight sm:text-base"
              >
                jelas riwayatnya
              </span>

              <RotatingText
                texts={rotatingTexts}
                rotationInterval={3200}
                staggerDuration={0}
                staggerFrom="first"
                splitBy="characters"
                mainClassName="[grid-area:1/1] inline-flex w-fit min-w-0 justify-self-center overflow-hidden rounded-2xl bg-[#0F172A] px-4 py-2.5 text-sm text-white shadow-lg shadow-slate-950/10 sm:text-base"
                splitLevelClassName="flex items-center overflow-hidden"
                elementLevelClassName="font-bold leading-tight"
                transition={{ type: "spring", damping: 32, stiffness: 360 }}
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "-120%", opacity: 0 }}
                auto
                loop
              />
            </span>
          </div>

          <p className="mt-6 max-w-3xl text-pretty text-sm leading-8 text-[#475569] sm:text-base">
            PINTARIN membantu Dinas Pendidikan, sekolah, dan mitra CSR membaca
            prioritas bantuan melalui dashboard data, prediksi AI, validasi
            manusia, dan rekomendasi program yang lebih tepat.
          </p>

          <div className="mt-8 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center">
            <Button
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => scrollToSection("risk-map")}
            >
              Lihat Dashboard
              <ArrowRight size={18} />
            </Button>

            <Button
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => scrollToSection("workflow")}
            >
              Pelajari Alur Sistem
            </Button>
          </div>

          <div className="mt-9 grid w-full max-w-3xl gap-3 text-sm font-semibold text-[#475569] sm:grid-cols-3">
            {highlights.map((item) => (
              <div
                key={item}
                className="flex items-center justify-center gap-2 px-3 py-2"
              >
                <CheckCircle2 size={17} className="text-[#0F766E]" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
