import BlurText from "../../../components/ui/BlurText";

export default function TrackingStatementSection() {
  return (
    <section className="relative mx-auto w-full max-w-7xl px-5 pb-10 pt-2 sm:px-8 sm:pb-12 lg:px-10 xl:px-12">
      <div className="max-w-5xl">
        <BlurText
          text="Jangan Sampai Bantuanmu Tidak Ter-Track, Tidak Tepat Sasaran, Tidak Jelas Alurnya"
          delay={95}
          animateBy="words"
          direction="top"
          className="font-heading text-balance text-[2rem] font-semibold leading-[1.12] text-[#102A43] sm:text-[2.75rem] lg:text-[3.25rem]"
        />
      </div>
    </section>
  );
}
