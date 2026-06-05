import { useEffect } from "react";
import Lenis from "lenis";

import AuthProvider from "../features/auth/AuthProvider";

function SmoothScrollProvider({ children }) {
  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    const lenis = new Lenis({
      duration: 1.35,
      easing: (value) => Math.min(1, 1.001 - 2 ** (-10 * value)),
      smoothWheel: true,
      touchMultiplier: 1.18,
      wheelMultiplier: 0.82,
      lerp: 0.075,
    });

    let frameId;

    const raf = (time) => {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    };

    frameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
    };
  }, []);

  return children;
}

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <SmoothScrollProvider>{children}</SmoothScrollProvider>
    </AuthProvider>
  );
}
