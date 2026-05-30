import { useCallback, useLayoutEffect, useRef } from "react";
import Lenis from "lenis";

export const ScrollStackItem = ({ children, itemClassName = "" }) => (
  <div
    className={`scroll-stack-card relative my-6 h-64 w-full origin-top rounded-[2rem] border border-white/60 bg-white/38 p-5 shadow-[0_0_30px_rgba(15,23,42,0.10)] ring-1 ring-white/40 backdrop-blur-2xl will-change-transform sm:h-72 sm:p-7 lg:h-72 lg:p-8 ${itemClassName}`.trim()}
    style={{
      backfaceVisibility: "hidden",
      transformStyle: "preserve-3d",
    }}
  >
    {children}
  </div>
);

export default function ScrollStack({
  children,
  className = "",
  itemDistance = 64,
  itemScale = 0.03,
  itemStackDistance = 28,
  stackPosition = "20%",
  scaleEndPosition = "10%",
  baseScale = 0.85,
  scaleDuration = 0.5,
  rotationAmount = 0,
  blurAmount = 0,
  useWindowScroll = false,
  nextSectionId,
  onStackComplete,
}) {
  const scrollerRef = useRef(null);
  const stackCompletedRef = useRef(false);
  const animationFrameRef = useRef(null);
  const lenisRef = useRef(null);
  const cardsRef = useRef([]);
  const lastTransformsRef = useRef(new Map());
  const isUpdatingRef = useRef(false);
  const bridgeCooldownRef = useRef(0);

  const calculateProgress = useCallback((scrollTop, start, end) => {
    if (scrollTop < start) return 0;
    if (scrollTop > end) return 1;
    return (scrollTop - start) / (end - start);
  }, []);

  const parsePercentage = useCallback((value, containerHeight) => {
    if (typeof value === "string" && value.includes("%")) {
      return (parseFloat(value) / 100) * containerHeight;
    }

    return parseFloat(value);
  }, []);

  const getScrollData = useCallback(() => {
    if (useWindowScroll) {
      return {
        scrollTop: window.scrollY,
        containerHeight: window.innerHeight,
        scrollContainer: document.documentElement,
      };
    }

    const scroller = scrollerRef.current;

    return {
      scrollTop: scroller?.scrollTop || 0,
      containerHeight: scroller?.clientHeight || window.innerHeight,
      scrollContainer: scroller,
    };
  }, [useWindowScroll]);

  const getElementOffset = useCallback(
    (element) => {
      if (useWindowScroll) {
        const rect = element.getBoundingClientRect();
        return rect.top + window.scrollY;
      }

      return element.offsetTop;
    },
    [useWindowScroll],
  );

  const updateCardTransforms = useCallback(() => {
    if (!cardsRef.current.length || isUpdatingRef.current) return;

    isUpdatingRef.current = true;

    const { scrollTop, containerHeight } = getScrollData();
    const stackPositionPx = parsePercentage(stackPosition, containerHeight);
    const scaleEndPositionPx = parsePercentage(
      scaleEndPosition,
      containerHeight,
    );

    const endElement = useWindowScroll
      ? document.querySelector(".scroll-stack-end")
      : scrollerRef.current?.querySelector(".scroll-stack-end");

    const endElementTop = endElement ? getElementOffset(endElement) : 0;

    cardsRef.current.forEach((card, index) => {
      if (!card) return;

      const cardTop = getElementOffset(card);
      const triggerStart =
        cardTop - stackPositionPx - itemStackDistance * index;
      const triggerEnd = cardTop - scaleEndPositionPx;
      const pinStart = cardTop - stackPositionPx - itemStackDistance * index;
      const pinEnd = endElementTop - containerHeight / 2;

      const scaleProgress = calculateProgress(
        scrollTop,
        triggerStart,
        triggerEnd,
      );

      const targetScale = baseScale + index * itemScale;
      const scale = 1 - scaleProgress * (1 - targetScale);

      const rotation = rotationAmount
        ? index * rotationAmount * scaleProgress
        : 0;

      let blur = 0;

      if (blurAmount) {
        let topCardIndex = 0;

        for (
          let currentIndex = 0;
          currentIndex < cardsRef.current.length;
          currentIndex += 1
        ) {
          const currentCardTop = getElementOffset(
            cardsRef.current[currentIndex],
          );

          const currentTriggerStart =
            currentCardTop - stackPositionPx - itemStackDistance * currentIndex;

          if (scrollTop >= currentTriggerStart) {
            topCardIndex = currentIndex;
          }
        }

        if (index < topCardIndex) {
          const depthInStack = topCardIndex - index;
          blur = Math.max(0, depthInStack * blurAmount);
        }
      }

      let translateY = 0;
      const isPinned = scrollTop >= pinStart && scrollTop <= pinEnd;

      if (isPinned) {
        translateY =
          scrollTop - cardTop + stackPositionPx + itemStackDistance * index;
      } else if (scrollTop > pinEnd) {
        translateY =
          pinEnd - cardTop + stackPositionPx + itemStackDistance * index;
      }

      const newTransform = {
        translateY: Math.round(translateY * 100) / 100,
        scale: Math.round(scale * 1000) / 1000,
        rotation: Math.round(rotation * 100) / 100,
        blur: Math.round(blur * 100) / 100,
      };

      const lastTransform = lastTransformsRef.current.get(index);

      const hasChanged =
        !lastTransform ||
        Math.abs(lastTransform.translateY - newTransform.translateY) > 0.1 ||
        Math.abs(lastTransform.scale - newTransform.scale) > 0.001 ||
        Math.abs(lastTransform.rotation - newTransform.rotation) > 0.1 ||
        Math.abs(lastTransform.blur - newTransform.blur) > 0.1;

      if (hasChanged) {
        card.style.transform = `translate3d(0, ${newTransform.translateY}px, 0) scale(${newTransform.scale}) rotate(${newTransform.rotation}deg)`;
        card.style.filter =
          newTransform.blur > 0 ? `blur(${newTransform.blur}px)` : "";

        lastTransformsRef.current.set(index, newTransform);
      }

      if (index === cardsRef.current.length - 1) {
        const isInView = scrollTop >= pinStart && scrollTop <= pinEnd;

        if (isInView && !stackCompletedRef.current) {
          stackCompletedRef.current = true;
          onStackComplete?.();
        } else if (!isInView && stackCompletedRef.current) {
          stackCompletedRef.current = false;
        }
      }
    });

    isUpdatingRef.current = false;
  }, [
    itemScale,
    itemStackDistance,
    stackPosition,
    scaleEndPosition,
    baseScale,
    rotationAmount,
    blurAmount,
    useWindowScroll,
    onStackComplete,
    calculateProgress,
    parsePercentage,
    getScrollData,
    getElementOffset,
  ]);

  const handleScroll = useCallback(() => {
    updateCardTransforms();
  }, [updateCardTransforms]);

  const bridgeToPageScroll = useCallback(
    (event) => {
      if (useWindowScroll) return;

      const scroller = scrollerRef.current;
      if (!scroller) return;

      const now = Date.now();
      const isScrollingDown = event.deltaY > 0;
      const isScrollingUp = event.deltaY < 0;

      const isAtBottom =
        scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 4;

      const isAtTop = scroller.scrollTop <= 4;

      if (isScrollingDown && isAtBottom) {
        event.preventDefault();
        event.stopPropagation();

        if (now - bridgeCooldownRef.current < 500) return;

        bridgeCooldownRef.current = now;

        if (nextSectionId) {
          document.getElementById(nextSectionId)?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });

          return;
        }

        window.scrollBy({
          top: Math.max(event.deltaY, 320),
          behavior: "smooth",
        });

        return;
      }

      if (isScrollingUp && isAtTop) {
        event.preventDefault();
        event.stopPropagation();

        window.scrollBy({
          top: event.deltaY,
          behavior: "auto",
        });
      }
    },
    [nextSectionId, useWindowScroll],
  );

  const setupLenis = useCallback(() => {
    if (useWindowScroll) {
      const lenis = new Lenis({
        duration: 1.2,
        easing: (value) => Math.min(1, 1.001 - 2 ** (-10 * value)),
        smoothWheel: true,
        touchMultiplier: 2,
        infinite: false,
        wheelMultiplier: 1,
        lerp: 0.1,
        syncTouch: true,
        syncTouchLerp: 0.075,
      });

      lenis.on("scroll", handleScroll);

      const raf = (time) => {
        lenis.raf(time);
        animationFrameRef.current = requestAnimationFrame(raf);
      };

      animationFrameRef.current = requestAnimationFrame(raf);
      lenisRef.current = lenis;

      return;
    }

    const scroller = scrollerRef.current;
    if (!scroller) return;

    const lenis = new Lenis({
      wrapper: scroller,
      content: scroller.querySelector(".scroll-stack-inner"),
      duration: 1.2,
      easing: (value) => Math.min(1, 1.001 - 2 ** (-10 * value)),
      smoothWheel: true,
      touchMultiplier: 2,
      infinite: false,
      wheelMultiplier: 1,
      lerp: 0.1,
      syncTouch: true,
      syncTouchLerp: 0.075,
    });

    lenis.on("scroll", handleScroll);

    const raf = (time) => {
      lenis.raf(time);
      animationFrameRef.current = requestAnimationFrame(raf);
    };

    animationFrameRef.current = requestAnimationFrame(raf);
    lenisRef.current = lenis;
  }, [handleScroll, useWindowScroll]);

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return undefined;

    const cards = Array.from(
      useWindowScroll
        ? document.querySelectorAll(".scroll-stack-card")
        : scroller.querySelectorAll(".scroll-stack-card"),
    );

    cardsRef.current = cards;
    const transformsCache = lastTransformsRef.current;

    cards.forEach((card, index) => {
      if (index < cards.length - 1) {
        card.style.marginBottom = `${itemDistance}px`;
      }

      card.style.willChange = "transform, filter";
      card.style.transformOrigin = "top center";
      card.style.backfaceVisibility = "hidden";
      card.style.transform = "translateZ(0)";
      card.style.webkitTransform = "translateZ(0)";
      card.style.perspective = "1000px";
      card.style.webkitPerspective = "1000px";
    });

    setupLenis();
    updateCardTransforms();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (lenisRef.current) {
        lenisRef.current.destroy();
      }

      stackCompletedRef.current = false;
      cardsRef.current = [];
      transformsCache.clear();
      isUpdatingRef.current = false;
    };
  }, [
    itemDistance,
    itemScale,
    itemStackDistance,
    stackPosition,
    scaleEndPosition,
    baseScale,
    scaleDuration,
    rotationAmount,
    blurAmount,
    useWindowScroll,
    onStackComplete,
    setupLenis,
    updateCardTransforms,
  ]);

  const containerStyles = useWindowScroll
    ? {
        overscrollBehavior: "auto",
        WebkitOverflowScrolling: "touch",
        WebkitTransform: "translateZ(0)",
        transform: "translateZ(0)",
      }
    : {
        overscrollBehavior: "auto",
        WebkitOverflowScrolling: "touch",
        scrollBehavior: "smooth",
        WebkitTransform: "translateZ(0)",
        transform: "translateZ(0)",
        willChange: "scroll-position",
      };

  const containerClassName = useWindowScroll
    ? `relative w-full ${className}`.trim()
    : `relative h-full w-full overflow-y-auto overflow-x-hidden rounded-[2rem] border border-white/50 bg-white/16 ring-1 ring-white/30 backdrop-blur-xl ${className}`.trim();

  return (
    <div
      ref={scrollerRef}
      className={containerClassName}
      style={containerStyles}
      onWheelCapture={bridgeToPageScroll}
    >
      <div className="scroll-stack-inner min-h-full px-3 pb-14 pt-14 sm:px-5 sm:pb-16 sm:pt-16 lg:px-7 lg:pb-20 lg:pt-16">
        {children}
        <div className="scroll-stack-end h-px w-full" />
      </div>
    </div>
  );
}
