import Footer from "../../components/layout/Footer";
import Grainient from "../../components/ui/Grainient";
import HeroSection from "./components/HeroSection";
import ProductIntroSection from "./components/ProductIntroSection";
import RiskMapSection from "./components/RiskMapSection";
import WorkflowSection from "./components/WorkflowSection";
import LandingFooter from "./components/LandingFooter";
import LandingReveal from "./components/LandingReveal";
import TrackingStatementSection from "./components/TrackingStatementSection";

export default function LandingPage() {
  return (
    <main className="relative isolate overflow-x-hidden text-[#102A43]">
      <div className="pointer-events-none fixed inset-0 z-0">
        <Grainient
          color1="#5EEAD4"
          color2="#CCFBF1"
          color3="#F8FAFC"
          timeSpeed={0.16}
          colorBalance={-0.05}
          warpStrength={0.7}
          warpFrequency={4.2}
          warpSpeed={1.25}
          warpAmplitude={58}
          blendAngle={-16}
          blendSoftness={0.14}
          rotationAmount={300}
          noiseScale={1.8}
          grainAmount={0.038}
          grainScale={1.7}
          grainAnimated={false}
          contrast={1.06}
          gamma={1}
          saturation={1.04}
          centerX={0.02}
          centerY={-0.06}
          zoom={0.92}
          className="h-full w-full opacity-95"
        />

        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(248,250,252,0.90)_0%,rgba(204,251,241,0.58)_42%,rgba(248,250,252,0.84)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(94,234,212,0.30),transparent_28rem),radial-gradient(circle_at_88%_30%,rgba(204,251,241,0.40),transparent_30rem)]" />
      </div>

      <div className="relative z-10">
        <HeroSection />
        <TrackingStatementSection />
        <LandingReveal>
          <RiskMapSection />
        </LandingReveal>
        <LandingReveal delay={80}>
          <ProductIntroSection />
        </LandingReveal>
        <LandingReveal delay={80}>
          <WorkflowSection />
        </LandingReveal>
        <LandingReveal delay={80}>
          <LandingFooter />
        </LandingReveal>
        <LandingReveal>
          <Footer />
        </LandingReveal>
      </div>
    </main>
  );
}
