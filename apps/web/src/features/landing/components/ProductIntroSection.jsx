import {
  BrainCircuit,
  HandHeart,
  LayoutDashboard,
  ShieldCheck,
} from "lucide-react";

import { Card, CardContent } from "../../../components/ui/Card";
import ScrollStack, {
  ScrollStackItem,
} from "../../../components/ui/ScrollStack";

const productCards = [
  {
    eyebrow: "01 / Intelligence",
    title: "AI Risk Scoring untuk membaca prioritas wilayah.",
    description:
      "PINTARIN mengubah data pendidikan, wilayah, bantuan, dan indikator sosial menjadi skor risiko yang mudah dibaca oleh stakeholder.",
    icon: BrainCircuit,
    points: ["Risk label", "Confidence score", "Priority ranking"],
  },
  {
    eyebrow: "02 / Governance",
    title: "Validasi manusia tetap menjadi bagian dari keputusan.",
    description:
      "Prediksi AI dengan confidence rendah dapat masuk ke antrian review agar petugas bisa approve atau override berdasarkan kondisi lapangan.",
    icon: ShieldCheck,
    points: ["Human-in-the-loop", "Audit trail", "Manual override"],
  },
  {
    eyebrow: "03 / Distribution",
    title: "CSR Matching membantu bantuan diarahkan lebih tepat.",
    description:
      "Mitra CSR dapat menemukan wilayah yang paling relevan berdasarkan fokus program, skala anggaran, dan prioritas risiko pendidikan.",
    icon: HandHeart,
    points: ["Focus area", "Budget range", "Top recommendation"],
  },
  {
    eyebrow: "04 / Dashboard",
    title: "Satu dashboard untuk membaca kondisi dan aksi.",
    description:
      "Dinas, sekolah, dan mitra dapat melihat peta risiko, daftar prioritas, review prediksi, dan ringkasan data dalam satu sistem.",
    icon: LayoutDashboard,
    points: ["Risk map", "Analytics summary", "Decision support"],
  },
];

export default function ProductIntroSection() {
  return (
    <section
      id="product"
      className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-8 sm:py-16 lg:px-10 xl:px-12"
    >
      <div className="grid gap-8 lg:grid-cols-[0.62fr_1fr] lg:items-start">
        <div className="max-w-[25rem] lg:sticky lg:top-28">
          <h2 className="font-heading text-balance text-3xl font-extrabold leading-[1.08] text-[#102A43] sm:text-[2rem]">
            Bukan Hanya Sebuah Dashboard
          </h2>

          <p className="mt-5 text-pretty text-sm leading-7 text-[#475569] sm:text-base">
            PINTARIN Dirancang Untuk Membantu Stakeholder Dalam Membaca
            Masalah Bantuan Pendidikan Agar Penyaluran Tepat Sasaran.
          </p>
        </div>

        <div className="grid gap-4 lg:hidden">
          {productCards.map((feature) => (
            <ProductCard key={feature.title} feature={feature} />
          ))}
        </div>

        <div className="hidden h-[430px] overflow-hidden rounded-[1.5rem] lg:block">
          <ScrollStack
            itemDistance={34}
            itemScale={0.03}
            itemStackDistance={16}
            stackPosition="15%"
            scaleEndPosition="9%"
            baseScale={0.85}
            rotationAmount={0}
            blurAmount={0}
            nextSectionId="workflow"
          >
            {productCards.map((feature) => (
              <ScrollStackItem
                key={feature.title}
                itemClassName="my-4 h-52 rounded-[1.35rem] p-5 sm:h-56 sm:p-6 lg:h-56 lg:p-6"
              >
                <ProductCardContent feature={feature} />
              </ScrollStackItem>
            ))}
          </ScrollStack>
        </div>
      </div>
    </section>
  );
}

function ProductCard({ feature }) {
  return (
    <Card>
      <CardContent className="p-5 sm:p-6">
        <ProductCardContent feature={feature} />
      </CardContent>
    </Card>
  );
}

function ProductCardContent({ feature }) {
  const Icon = feature.icon;

  return (
    <div className="flex h-full flex-col justify-between gap-4 md:flex-row md:items-start">
      <div className="max-w-lg">
        <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-[#0F766E]">
          {feature.eyebrow}
        </p>

        <h3 className="font-heading mt-3 text-balance text-xl font-extrabold leading-[1.14] text-[#102A43] sm:text-2xl">
          {feature.title}
        </h3>

        <p className="mt-3 text-sm leading-7 text-[#475569]">
          {feature.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {feature.points.map((point) => (
            <span
              key={point}
              className="inline-flex items-center gap-2 text-[0.68rem] font-extrabold uppercase tracking-[0.08em] text-[#475569] before:h-1.5 before:w-1.5 before:rounded-full before:bg-[#14B8A6] before:content-['']"
            >
              {point}
            </span>
          ))}
        </div>
      </div>

      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#5EEAD4]/18 text-[#0F766E] shadow-lg shadow-[#5EEAD4]/20 backdrop-blur-2xl">
        <Icon size={22} />
      </div>
    </div>
  );
}
