import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { AnimatePresence, motion } from "motion/react";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const RotatingText = forwardRef((props, ref) => {
  const {
    texts,
    transition = { type: "spring", damping: 25, stiffness: 300 },
    initial = { y: "100%", opacity: 0 },
    animate = { y: 0, opacity: 1 },
    exit = { y: "-120%", opacity: 0 },
    animatePresenceMode = "wait",
    animatePresenceInitial = false,
    rotationInterval = 2000,
    staggerDuration = 0,
    staggerFrom = "first",
    loop = true,
    auto = true,
    splitBy = "characters",
    onNext,
    mainClassName,
    splitLevelClassName,
    elementLevelClassName,
    ...rest
  } = props;

  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  const splitIntoCharacters = (value) => {
    if (typeof Intl !== "undefined" && Intl.Segmenter) {
      const segmenter = new Intl.Segmenter("id", { granularity: "grapheme" });
      return Array.from(segmenter.segment(value), (segment) => segment.segment);
    }

    return Array.from(value);
  };

  const elements = useMemo(() => {
    const currentText = texts[currentTextIndex] || "";

    if (splitBy === "characters") {
      const words = currentText.split(" ");

      return words.map((word, index) => ({
        characters: splitIntoCharacters(word),
        needsSpace: index !== words.length - 1,
      }));
    }

    if (splitBy === "words") {
      return currentText.split(" ").map((word, index, array) => ({
        characters: [word],
        needsSpace: index !== array.length - 1,
      }));
    }

    if (splitBy === "lines") {
      return currentText.split("\n").map((line, index, array) => ({
        characters: [line],
        needsSpace: index !== array.length - 1,
      }));
    }

    return currentText.split(splitBy).map((part, index, array) => ({
      characters: [part],
      needsSpace: index !== array.length - 1,
    }));
  }, [texts, currentTextIndex, splitBy]);

  const getStaggerDelay = useCallback(
    (index, totalChars) => {
      if (staggerFrom === "first") return index * staggerDuration;
      if (staggerFrom === "last") return (totalChars - 1 - index) * staggerDuration;

      if (staggerFrom === "center") {
        const center = Math.floor(totalChars / 2);
        return Math.abs(center - index) * staggerDuration;
      }

      if (staggerFrom === "random") {
        const randomIndex = Math.floor(Math.random() * totalChars);
        return Math.abs(randomIndex - index) * staggerDuration;
      }

      return Math.abs(Number(staggerFrom) - index) * staggerDuration;
    },
    [staggerFrom, staggerDuration],
  );

  const handleIndexChange = useCallback(
    (newIndex) => {
      setCurrentTextIndex(newIndex);
      if (onNext) onNext(newIndex);
    },
    [onNext],
  );

  const next = useCallback(() => {
    const nextIndex =
      currentTextIndex === texts.length - 1
        ? loop
          ? 0
          : currentTextIndex
        : currentTextIndex + 1;

    if (nextIndex !== currentTextIndex) {
      handleIndexChange(nextIndex);
    }
  }, [currentTextIndex, texts.length, loop, handleIndexChange]);

  const previous = useCallback(() => {
    const prevIndex =
      currentTextIndex === 0
        ? loop
          ? texts.length - 1
          : currentTextIndex
        : currentTextIndex - 1;

    if (prevIndex !== currentTextIndex) {
      handleIndexChange(prevIndex);
    }
  }, [currentTextIndex, texts.length, loop, handleIndexChange]);

  const jumpTo = useCallback(
    (index) => {
      const validIndex = Math.max(0, Math.min(index, texts.length - 1));

      if (validIndex !== currentTextIndex) {
        handleIndexChange(validIndex);
      }
    },
    [texts.length, currentTextIndex, handleIndexChange],
  );

  const reset = useCallback(() => {
    if (currentTextIndex !== 0) {
      handleIndexChange(0);
    }
  }, [currentTextIndex, handleIndexChange]);

  useImperativeHandle(
    ref,
    () => ({
      next,
      previous,
      jumpTo,
      reset,
    }),
    [next, previous, jumpTo, reset],
  );

  useEffect(() => {
    if (!auto) return undefined;

    const intervalId = setInterval(next, rotationInterval);

    return () => clearInterval(intervalId);
  }, [next, rotationInterval, auto]);

  return (
    <motion.span
      className={cn("relative flex flex-wrap whitespace-pre-wrap", mainClassName)}
      {...rest}
      layout
      transition={transition}
    >
      <span className="sr-only">{texts[currentTextIndex]}</span>

      <AnimatePresence mode={animatePresenceMode} initial={animatePresenceInitial}>
        <motion.span
          key={currentTextIndex}
          className={cn(
            splitBy === "lines"
              ? "flex w-full flex-col"
              : "relative flex flex-wrap whitespace-pre-wrap",
          )}
          layout
          aria-hidden="true"
        >
          {elements.map((wordObj, wordIndex, array) => {
            const previousCharsCount = array
              .slice(0, wordIndex)
              .reduce((sum, word) => sum + word.characters.length, 0);

            const totalChars = array.reduce(
              (sum, word) => sum + word.characters.length,
              0,
            );

            return (
              <span
                key={`${wordObj.characters.join("")}-${wordIndex}`}
                className={cn("inline-flex", splitLevelClassName)}
              >
                {wordObj.characters.map((char, charIndex) => (
                  <motion.span
                    key={`${char}-${charIndex}`}
                    initial={initial}
                    animate={animate}
                    exit={exit}
                    transition={{
                      ...transition,
                      delay: getStaggerDelay(
                        previousCharsCount + charIndex,
                        totalChars,
                      ),
                    }}
                    className={cn("inline-block", elementLevelClassName)}
                  >
                    {char}
                  </motion.span>
                ))}

                {wordObj.needsSpace && <span className="whitespace-pre"> </span>}
              </span>
            );
          })}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  );
});

RotatingText.displayName = "RotatingText";

export default RotatingText;