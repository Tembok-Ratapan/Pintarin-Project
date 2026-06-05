import { useEffect, useRef } from "react";
import { gsap } from "gsap";

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export default function ChromaGrid({
  items = [],
  className = "",
  radius = 300,
  damping = 0.45,
  fadeOut = 0.6,
  ease = "power3.out",
  tone = "dark",
}) {
  const rootRef = useRef(null);
  const fadeRef = useRef(null);
  const setX = useRef(null);
  const setY = useRef(null);
  const pos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = rootRef.current;

    if (!el) return undefined;

    setX.current = gsap.quickSetter(el, "--x", "px");
    setY.current = gsap.quickSetter(el, "--y", "px");

    const { width, height } = el.getBoundingClientRect();
    pos.current = { x: width / 2, y: height / 2 };
    setX.current(pos.current.x);
    setY.current(pos.current.y);

    const fadeNode = fadeRef.current;

    return () => {
      gsap.killTweensOf(pos.current);
      gsap.killTweensOf(fadeNode);
    };
  }, []);

  const moveTo = (x, y) => {
    gsap.to(pos.current, {
      x,
      y,
      duration: damping,
      ease,
      onUpdate: () => {
        setX.current?.(pos.current.x);
        setY.current?.(pos.current.y);
      },
      overwrite: true,
    });
  };

  const handleMove = (event) => {
    const root = rootRef.current;

    if (!root) return;

    const rect = root.getBoundingClientRect();
    moveTo(event.clientX - rect.left, event.clientY - rect.top);
    gsap.to(fadeRef.current, { opacity: 0, duration: 0.25, overwrite: true });
  };

  const handleLeave = () => {
    gsap.to(fadeRef.current, {
      opacity: 1,
      duration: fadeOut,
      overwrite: true,
    });
  };

  const handleCardMove = (event) => {
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();

    card.style.setProperty("--mouse-x", `${event.clientX - rect.left}px`);
    card.style.setProperty("--mouse-y", `${event.clientY - rect.top}px`);
  };

  const openUrl = (url) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleKeyDown = (event, url) => {
    if (!url) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openUrl(url);
    }
  };

  return (
    <div
      ref={rootRef}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className={`relative flex h-full w-full flex-wrap items-start justify-center gap-4 overflow-hidden ${className}`}
      style={{
        "--r": `${radius}px`,
        "--x": "50%",
        "--y": "50%",
      }}
    >
      {items.map((item, index) => {
        const hasUrl = Boolean(item.url);
        const isLight = tone === "light";

        return (
          <article
            key={`${item.title}-${index}`}
            onMouseMove={handleCardMove}
            onClick={() => openUrl(item.url)}
            onKeyDown={(event) => handleKeyDown(event, item.url)}
            role={hasUrl ? "link" : undefined}
            tabIndex={hasUrl ? 0 : undefined}
            aria-label={hasUrl ? `${item.title} - buka profil` : item.title}
            className={`group relative flex w-full max-w-[18rem] flex-col overflow-hidden rounded-[1.35rem] border transition duration-300 ${
              isLight
                ? "border-white/70 ring-1 ring-white/45 backdrop-blur-2xl"
                : "border-white/10"
            } ${
              hasUrl ? "cursor-pointer" : "cursor-default"
            }`}
            style={{
              "--card-border": item.borderColor || "rgba(255,255,255,0.18)",
              "--spotlight-color": isLight
                ? "rgba(255,255,255,0.54)"
                : "rgba(255,255,255,0.28)",
              background:
                item.gradient ||
                (isLight
                  ? "linear-gradient(145deg, rgba(255,255,255,0.78), rgba(204,251,241,0.56), rgba(248,250,252,0.72))"
                  : "linear-gradient(145deg, rgba(15,118,110,0.94), #07110F)"),
              boxShadow: isLight
                ? "0 22px 54px rgba(15, 23, 42, 0.10)"
                : "0 24px 60px rgba(2, 6, 23, 0.24)",
            }}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-20 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{
                background:
                  "radial-gradient(circle at var(--mouse-x) var(--mouse-y), var(--spotlight-color), transparent 70%)",
              }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-20 rounded-[1.35rem] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                boxShadow: "inset 0 0 0 2px var(--card-border)",
              }}
            />

            <div className="relative z-10 p-2.5">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  className={`aspect-[4/3] w-full rounded-[1rem] object-cover transition duration-500 ${
                    isLight
                      ? "grayscale-[0.22] group-hover:grayscale-0"
                      : "grayscale group-hover:grayscale-0"
                  }`}
                />
              ) : (
                <div
                  className={`flex aspect-[4/3] w-full items-center justify-center rounded-[1rem] text-5xl font-extrabold ${
                    isLight
                      ? "bg-[radial-gradient(circle_at_35%_20%,rgba(255,255,255,0.94),rgba(204,251,241,0.58)_42%,rgba(15,118,110,0.08)_100%)] text-[#0F766E]/70"
                      : "bg-[radial-gradient(circle_at_35%_20%,rgba(255,255,255,0.34),rgba(255,255,255,0.05)_34%,rgba(0,0,0,0.18)_100%)] text-white/88"
                  }`}
                >
                  {getInitials(item.title)}
                </div>
              )}
            </div>

            <footer
              className={`relative z-10 flex min-h-[8.25rem] flex-col px-4 pb-4 pt-2 ${
                isLight ? "text-[#102A43]" : "text-white"
              }`}
            >
              <h3 className="m-0 text-base font-extrabold leading-tight">
                {item.title}
              </h3>

              <p
                className={`m-0 mt-2 text-sm font-semibold leading-5 ${
                  isLight ? "text-[#475569]" : "text-white/74"
                }`}
              >
                {item.subtitle}
              </p>

              {(item.id || item.meta) && (
                <span
                  className={`mt-2 w-fit rounded-xl border px-2.5 py-1 text-xs font-extrabold tracking-[0.08em] ${
                    isLight
                      ? "border-[#0F766E]/12 bg-white/62 text-[#0F766E]/76"
                      : "border-white/10 bg-white/8 text-white/62"
                  }`}
                >
                  {item.id || item.meta}
                </span>
              )}
            </footer>
          </article>
        );
      })}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-30"
        style={{
          backdropFilter:
            tone === "light"
              ? "saturate(0.82) brightness(1.02)"
              : "grayscale(1) brightness(0.78)",
          WebkitBackdropFilter:
            tone === "light"
              ? "saturate(0.82) brightness(1.02)"
              : "grayscale(1) brightness(0.78)",
          background: "rgba(0,0,0,0.001)",
          maskImage:
            "radial-gradient(circle var(--r) at var(--x) var(--y), transparent 0%, transparent 15%, rgba(0,0,0,0.10) 30%, rgba(0,0,0,0.22) 45%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.50) 75%, rgba(0,0,0,0.68) 88%, white 100%)",
          WebkitMaskImage:
            "radial-gradient(circle var(--r) at var(--x) var(--y), transparent 0%, transparent 15%, rgba(0,0,0,0.10) 30%, rgba(0,0,0,0.22) 45%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.50) 75%, rgba(0,0,0,0.68) 88%, white 100%)",
        }}
      />
      <div
        ref={fadeRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-40 transition-opacity duration-[250ms]"
        style={{
          backdropFilter:
            tone === "light"
              ? "saturate(0.82) brightness(1.02)"
              : "grayscale(1) brightness(0.78)",
          WebkitBackdropFilter:
            tone === "light"
              ? "saturate(0.82) brightness(1.02)"
              : "grayscale(1) brightness(0.78)",
          background: "rgba(0,0,0,0.001)",
          maskImage:
            "radial-gradient(circle var(--r) at var(--x) var(--y), white 0%, white 15%, rgba(255,255,255,0.90) 30%, rgba(255,255,255,0.78) 45%, rgba(255,255,255,0.65) 60%, rgba(255,255,255,0.50) 75%, rgba(255,255,255,0.32) 88%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(circle var(--r) at var(--x) var(--y), white 0%, white 15%, rgba(255,255,255,0.90) 30%, rgba(255,255,255,0.78) 45%, rgba(255,255,255,0.65) 60%, rgba(255,255,255,0.50) 75%, rgba(255,255,255,0.32) 88%, transparent 100%)",
          opacity: 1,
        }}
      />
    </div>
  );
}
