import {
  BrainCircuit,
  HandHeart,
  LayoutDashboard,
  ShieldCheck,
} from "lucide-react";

import Badge from "../../../components/ui/Badge";
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
      className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
    >
      <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
        <div className="lg:sticky lg:top-28">
          <Badge>Produk</Badge>

          <h2 className="font-heading mt-4 max-w-xl text-balance text-3xl font-extrabold leading-[1.08] tracking-[-0.04em] text-[#102A43] sm:text-4xl">
            Bukan sekadar dashboard, tapi sistem pendukung keputusan.
          </h2>

          <p className="mt-5 max-w-xl text-pretty text-sm leading-8 text-[#475569] sm:text-base">
            PINTARIN dirancang untuk membantu stakeholder membaca masalah
            bantuan pendidikan sebagai alur keputusan: data, prediksi, validasi,
            lalu rekomendasi aksi.
          </p>
        </div>

        <div className="grid gap-4 lg:hidden">
          {productCards.map((feature) => (
            <ProductCard key={feature.title} feature={feature} />
          ))}
        </div>

        <div className="hidden h-[520px] overflow-hidden rounded-[2rem] lg:block">
          <ScrollStack
            itemDistance={48}
            itemScale={0.03}
            itemStackDistance={22}
            stackPosition="18%"
            scaleEndPosition="9%"
            baseScale={0.87}
            rotationAmount={0}
            blurAmount={0}
            nextSectionId="workflow"
          >
            {productCards.map((feature) => (
              <ScrollStackItem key={feature.title}>
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
    <div className="flex h-full flex-col justify-between gap-5 md:flex-row md:items-start">
      <div className="max-w-xl">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#0F766E]">
          {feature.eyebrow}
        </p>

        <h3 className="font-heading mt-4 text-balance text-2xl font-extrabold leading-[1.12] tracking-[-0.035em] text-[#102A43] sm:text-3xl">
          {feature.title}
        </h3>

        <p className="mt-4 text-sm leading-8 text-[#475569] sm:text-base">
          {feature.description}
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {feature.points.map((point) => (
            <span
              key={point}
              className="rounded-full border border-white/60 bg-white/42 px-3 py-1 text-xs font-bold text-[#475569] ring-1 ring-white/35 backdrop-blur-xl"
            >
              {point}
            </span>
          ))}
        </div>
      </div>

      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/65 bg-[#5EEAD4]/18 text-[#0F766E] shadow-lg shadow-[#5EEAD4]/20 ring-1 ring-white/50 backdrop-blur-2xl sm:h-14 sm:w-14">
        <Icon size={24} />
      </div>
    </div>
  );
}
