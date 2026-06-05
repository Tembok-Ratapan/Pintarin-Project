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
      smoothWheel: true,
      syncTouch: true,
      touchMultiplier: 1,
      wheelMultiplier: 0.9,
      lerp: 0.115,
      anchors: true,
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
