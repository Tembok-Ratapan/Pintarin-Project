import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../../../components/ui/Button";
import TextType from "../../../components/ui/TextType";
import heroStudentsImage from "../../../assets/images/landing-hero-students.webp";
import api from "../../../lib/api";
import { formatNumber } from "../../../lib/utils";

const highlights = ["Map Risk", "AI Matching", "Human Validation"];

export default function HeroSection() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalRegions: 30,
    totalSchools: 0,
  });

  useEffect(() => {
    const controller = new AbortController();

    const fetchHeroStats = async () => {
      try {
        const response = await api.get("/analytics/summary", {
          signal: controller.signal,
        });
        const summary = response.data?.data?.summary || {};

        setStats({
          totalRegions: Number(summary.total_regions ?? 30),
          totalSchools: Number(summary.total_schools ?? 0),
        });
      } catch (error) {
        if (error.name !== "CanceledError" && error.name !== "AbortError") {
          setStats((current) => current);
        }
      }
    };

    fetchHeroStats();

    return () => controller.abort();
  }, []);

  const proofPoints = [
    { value: formatNumber(stats.totalRegions), label: "kecamatan terbaca" },
    { value: formatNumber(stats.totalSchools), label: "sekolah terbaca" },
  ];

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative">
      <div className="mx-auto grid min-h-[calc(72vh-4rem)] w-full max-w-7xl items-center gap-8 px-5 pb-8 pt-9 sm:px-8 sm:pb-10 sm:pt-12 lg:grid-cols-[0.88fr_0.92fr] lg:px-10 lg:pb-12 lg:pt-14 xl:px-12">
        <div className="max-w-3xl text-left">
          <h1 className="font-heading max-w-3xl text-balance text-[3.35rem] font-semibold leading-[0.98] text-[#102A43] sm:text-7xl lg:text-[5.85rem]">
            <TextType
              as="span"
              text={["PINTARIN"]}
              typingSpeed={75}
              pauseDuration={1500}
              deletingSpeed={50}
              loop={false}
              showCursor
              cursorCharacter="_"
              cursorBlinkDuration={0.5}
              className="min-h-[1em]"
              cursorClassName="text-[#0F766E]"
            />
          </h1>

          <p className="mt-5 max-w-[39rem] text-pretty text-base font-medium leading-8 text-[#475569] sm:text-lg">
            PINTARIN Membantu Bantuan Pendidikan Sampai Pada Prioritas Yang
            Sebenarnya.
          </p>

          <div className="mt-7 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
            <Button size="lg" onClick={() => navigate("/analytic-pintarin")}>
              Analitik PINTARIN
              <ArrowRight size={18} />
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={() => scrollToSection("workflow")}
            >
              Pelajari Alur Sistem
            </Button>
          </div>

          <div className="mt-7 grid max-w-xl gap-2 text-sm font-semibold text-[#475569] sm:grid-cols-3">
            {highlights.map((item) => (
              <div
                key={item}
                className="flex min-h-10 items-center gap-2 rounded-2xl bg-white/36 px-3 py-2 ring-1 ring-white/45 backdrop-blur-xl"
              >
                <CheckCircle2 size={16} className="shrink-0 text-[#0F766E]" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <dl className="mt-4 grid max-w-md grid-cols-2 overflow-hidden rounded-[1rem] border border-white/62 bg-white/34 text-left shadow-xl shadow-slate-200/18 ring-1 ring-white/42 backdrop-blur-2xl">
            {proofPoints.map((item) => (
              <div
                key={item.label}
                className="flex min-h-[4.6rem] flex-col justify-center border-l border-white/55 px-4 py-3 first:border-l-0"
              >
                <dt className="text-[0.67rem] font-bold uppercase leading-[1.25] tracking-[0.1em] text-[#64748B]">
                  {item.label}
                </dt>
                <dd className="font-heading mt-1 text-2xl font-semibold leading-none text-[#0F766E]">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative mx-auto flex min-h-[24rem] w-full max-w-[35rem] items-end justify-center lg:min-h-[34rem]">
          <div
            aria-hidden="true"
            className="absolute bottom-7 left-1/2 h-[72%] w-[86%] -translate-x-1/2 rounded-[45%_55%_42%_58%] bg-[#5EEAD4]/22 blur-2xl"
          />
          <div
            aria-hidden="true"
            className="absolute bottom-1 left-1/2 h-[61%] w-[94%] -translate-x-1/2 rounded-[48%_52%_42%_58%] bg-[linear-gradient(180deg,rgba(255,255,255,0.44),rgba(204,251,241,0.22)_64%,rgba(204,251,241,0))] ring-1 ring-white/38"
          />
          <div
            aria-hidden="true"
            className="absolute bottom-[10.5rem] right-[6%] h-32 w-56 rounded-[2.4rem] border border-[#0F766E]/16 bg-[linear-gradient(135deg,rgba(255,255,255,0.36),rgba(94,234,212,0.12))] opacity-80"
          />
          <div
            aria-hidden="true"
            className="absolute bottom-[12.3rem] right-[13%] h-[5.5rem] w-[14rem] rounded-[2rem] bg-[linear-gradient(90deg,rgba(15,118,110,0.15)_1px,transparent_1px),linear-gradient(180deg,rgba(15,118,110,0.12)_1px,transparent_1px)] bg-[length:2rem_2rem]"
          />
          <div
            aria-hidden="true"
            className="absolute bottom-[16.4rem] right-[5%] h-24 w-44 rounded-full border-2 border-dashed border-[#0F766E]/22"
          />
          <div
            aria-hidden="true"
            className="absolute bottom-[8.25rem] left-[11%] h-28 w-44 rounded-full border-2 border-[#14B8A6]/20"
          />
          <div
            aria-hidden="true"
            className="absolute bottom-[5.15rem] left-1/2 z-20 h-9 w-[58%] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(15,23,42,0.22),rgba(15,118,110,0.1)_44%,transparent_72%)] opacity-80 blur-[2px]"
          />
          <div
            aria-hidden="true"
            className="absolute bottom-[4.85rem] left-1/2 z-20 h-3 w-[44%] -translate-x-1/2 rounded-full bg-[#0F766E]/8 blur-sm"
          />

          <img
            src={heroStudentsImage}
            alt="Tiga siswa sekolah dasar sebagai representasi penerima manfaat bantuan pendidikan"
            className="relative z-10 max-h-[27rem] w-auto object-contain drop-shadow-[0_32px_48px_rgba(15,23,42,0.18)] sm:max-h-[31rem] lg:max-h-[35rem]"
            loading="eager"
          />
        </div>
      </div>
    </section>
  );
}
