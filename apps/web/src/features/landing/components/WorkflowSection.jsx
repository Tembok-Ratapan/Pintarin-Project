import {
  BrainCircuit,
  CheckCircle2,
  Database,
  HandHeart,
  ShieldCheck,
} from "lucide-react";

import Badge from "../../../components/ui/Badge";

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
      className="mx-auto w-full max-w-7xl px-4 pb-24 pt-16 sm:px-6 sm:pt-20 lg:px-8"
    >
      <div className="mx-auto mb-12 max-w-3xl text-center">
        <Badge variant="green">Alur Sistem</Badge>

        <h2 className="font-heading mt-4 text-balance text-3xl font-extrabold leading-[1.08] text-[#102A43] sm:text-4xl">
          Dari data sampai keputusan bantuan.
        </h2>

        <p className="mt-4 text-pretty text-sm leading-8 text-[#475569] sm:text-base">
          Alurnya dibuat seperti decision tree: data masuk, AI membaca pola,
          manusia memvalidasi, lalu sistem menghasilkan prioritas aksi.
        </p>
      </div>

      <div className="relative mx-auto max-w-5xl">
        <div className="absolute left-5 top-0 h-full w-px bg-gradient-to-b from-[#0F766E]/0 via-[#0F766E]/40 to-[#0F766E]/0 md:left-1/2" />

        <div className="space-y-6">
          {workflowTree.map((step, index) => {
            const Icon = step.icon;
            const isRight = index % 2 === 1;

            return (
              <div
                key={step.number}
                className="relative grid grid-cols-[2.75rem_1fr] gap-4 md:grid-cols-[1fr_4rem_1fr] md:items-center"
              >
                <div className="hidden md:col-start-1 md:block">
                  {!isRight && (
                    <TreePanel step={step} Icon={Icon} align="right" />
                  )}
                </div>

                <div className="relative z-10 flex justify-center md:col-start-2">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/70 bg-[#0F766E] text-white shadow-xl shadow-[#5EEAD4]/25 ring-4 ring-white/45 backdrop-blur-xl">
                    <CheckCircle2 size={19} />
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
      className={`rounded-[1.75rem] border border-white/60 bg-white/36 p-5 shadow-xl shadow-slate-300/20 ring-1 ring-white/40 backdrop-blur-2xl transition hover:bg-white/48 ${
        align === "right" ? "md:text-right" : "text-left"
      }`}
    >
      <div
        className={`flex items-center gap-3 ${
          align === "right" ? "md:justify-end" : ""
        }`}
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/65 bg-[#5EEAD4]/18 text-[#0F766E] ring-1 ring-white/40">
          <Icon size={21} />
        </div>

        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#0F766E]">
          {step.number}
        </p>
      </div>

      <h3 className="font-heading mt-4 text-xl font-extrabold leading-tight text-[#102A43]">
        {step.title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-[#475569]">
        {step.description}
      </p>
    </div>
  );
}
