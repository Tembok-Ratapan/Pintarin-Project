import {
  BrainCircuit,
  CheckCircle2,
  Database,
  HandHeart,
  ShieldCheck,
} from "lucide-react";

const workflowTree = [
  {
    number: "01",
    title: "Data Foundation",
    description:
      "Data wilayah, sekolah, penduduk pendidikan, bantuan, dan prediksi dikumpulkan sebagai fondasi analisis.",
    icon: Database,
  },
  {
    number: "02",
    title: "AI Risk Scoring",
    description:
      "Model menghasilkan risk score, label risiko, dan confidence score untuk membantu membaca prioritas.",
    icon: BrainCircuit,
  },
  {
    number: "03",
    title: "Human Review",
    description:
      "Prediksi yang butuh perhatian masuk ke proses validasi manusia agar keputusan lebih aman.",
    icon: ShieldCheck,
  },
  {
    number: "04",
    title: "Decision Output",
    description:
      "Dashboard, peta risiko, dan CSR matching membantu bantuan diarahkan ke wilayah prioritas.",
    icon: HandHeart,
  },
];

export default function WorkflowSection() {
  return (
    <section
      id="workflow"
      className="mx-auto w-full max-w-7xl px-5 pb-20 pt-14 sm:px-8 sm:pt-16 lg:px-10 xl:px-12"
    >
      <div className="mx-auto mb-10 max-w-5xl text-center">
        <h2 className="font-heading text-balance text-3xl font-extrabold leading-[1.08] text-[#102A43] sm:text-[2.15rem] lg:whitespace-nowrap">
          Dari Data Sampai Kepada Keputusan Bantuan
        </h2>
      </div>

      <div className="relative mx-auto max-w-4xl">
        <div className="absolute left-5 top-0 h-full w-px bg-gradient-to-b from-[#0F766E]/0 via-[#0F766E]/40 to-[#0F766E]/0 md:left-1/2" />

        <div className="space-y-5">
          {workflowTree.map((step, index) => {
            const Icon = step.icon;
            const isRight = index % 2 === 1;

            return (
              <div
                key={step.number}
                className="relative grid grid-cols-[2.5rem_1fr] gap-3 md:grid-cols-[1fr_3.5rem_1fr] md:items-center"
              >
                <div className="hidden md:col-start-1 md:block">
                  {!isRight && (
                    <TreePanel step={step} Icon={Icon} align="right" />
                  )}
                </div>

                <div className="relative z-10 flex justify-center md:col-start-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/70 bg-[#0F766E] text-white shadow-xl shadow-[#5EEAD4]/25 ring-4 ring-white/45 backdrop-blur-xl">
                    <CheckCircle2 size={18} />
                  </div>
                </div>

                <div className="col-start-2 md:col-start-3">
                  {isRight ? (
                    <TreePanel step={step} Icon={Icon} align="left" />
                  ) : (
                    <div className="md:hidden">
                      <TreePanel step={step} Icon={Icon} align="left" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function TreePanel({ step, Icon, align = "left" }) {
  return (
    <div
      className={`rounded-[1.35rem] border border-white/60 bg-white/36 p-4 shadow-xl shadow-slate-300/20 ring-1 ring-white/40 backdrop-blur-2xl transition hover:bg-white/48 ${
        align === "right" ? "md:text-right" : "text-left"
      }`}
    >
      <div
        className={`flex items-center gap-3 ${
          align === "right" ? "md:justify-end" : ""
        }`}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/65 bg-[#5EEAD4]/18 text-[#0F766E] ring-1 ring-white/40">
          <Icon size={19} />
        </div>

        <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.18em] text-[#0F766E]">
          {step.number}
        </p>
      </div>

      <h3 className="font-heading mt-3 text-lg font-extrabold leading-tight text-[#102A43]">
        {step.title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-[#475569]">
        {step.description}
      </p>
    </div>
  );
}
