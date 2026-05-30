import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";

export default function TextType({
  text,
  as: Component = "div",
  typingSpeed = 50,
  initialDelay = 0,
  pauseDuration = 2000,
  deletingSpeed = 30,
  loop = true,
  className = "",
  showCursor = true,
  hideCursorWhileTyping = false,
  cursorCharacter = "|",
  cursorClassName = "",
  cursorBlinkDuration = 0.5,
  textColors = [],
  variableSpeed,
  onSentenceComplete,
  startOnVisible = false,
  reverseMode = false,
  ...props
}) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(!startOnVisible);

  const cursorRef = useRef(null);
  const containerRef = useRef(null);
  const hasStartedRef = useRef(false);

  const textArray = useMemo(() => (Array.isArray(text) ? text : [text]), [text]);

  const getRandomSpeed = useCallback(() => {
    if (!variableSpeed) return typingSpeed;

    const { min, max } = variableSpeed;
    return Math.random() * (max - min) + min;
  }, [variableSpeed, typingSpeed]);

  const currentTextColor =
    textColors.length > 0
      ? textColors[currentTextIndex % textColors.length]
      : "inherit";

  useEffect(() => {
    if (!startOnVisible || !containerRef.current) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setIsVisible(true);
        });
      },
      { threshold: 0.1 },
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [startOnVisible]);

  useEffect(() => {
    if (!showCursor || !cursorRef.current) return undefined;

    gsap.set(cursorRef.current, { opacity: 1 });

    const tween = gsap.to(cursorRef.current, {
      opacity: 0,
      duration: cursorBlinkDuration,
      repeat: -1,
      yoyo: true,
      ease: "power2.inOut",
    });

    return () => tween.kill();
  }, [showCursor, cursorBlinkDuration]);

  useEffect(() => {
    if (!isVisible) return undefined;

    let timeout;

    const currentText = textArray[currentTextIndex] || "";
    const processedText = reverseMode
      ? currentText.split("").reverse().join("")
      : currentText;

    if (!isDeleting && currentCharIndex < processedText.length) {
      const delay = hasStartedRef.current
        ? variableSpeed
          ? getRandomSpeed()
          : typingSpeed
        : initialDelay;

      timeout = setTimeout(() => {
        hasStartedRef.current = true;
        setDisplayedText((prev) => prev + processedText[currentCharIndex]);
        setCurrentCharIndex((prev) => prev + 1);
      }, delay);
    } else if (!isDeleting && currentCharIndex >= processedText.length) {
      if (!loop && currentTextIndex === textArray.length - 1) {
        return undefined;
      }

      timeout = setTimeout(() => {
        setIsDeleting(true);
      }, pauseDuration);
    } else if (isDeleting && displayedText.length > 0) {
      timeout = setTimeout(() => {
        setDisplayedText((prev) => prev.slice(0, -1));
      }, deletingSpeed);
    } else if (isDeleting && displayedText.length === 0) {
      timeout = setTimeout(() => {
        onSentenceComplete?.(textArray[currentTextIndex], currentTextIndex);
        setIsDeleting(false);
        setCurrentCharIndex(0);
        setCurrentTextIndex((prev) => (prev + 1) % textArray.length);
      }, 0);
    }

    return () => clearTimeout(timeout);
  }, [
    currentCharIndex,
    displayedText,
    isDeleting,
    typingSpeed,
    initialDelay,
    deletingSpeed,
    pauseDuration,
    textArray,
    currentTextIndex,
    loop,
    isVisible,
    reverseMode,
    variableSpeed,
    getRandomSpeed,
    onSentenceComplete,
  ]);

  const shouldHideCursor =
    hideCursorWhileTyping &&
    (currentCharIndex < (textArray[currentTextIndex] || "").length || isDeleting);

  return (
    <Component
      ref={containerRef}
      className={`inline-block whitespace-pre-wrap tracking-tight ${className}`.trim()}
      {...props}
    >
      <span className="inline" style={{ color: currentTextColor || "inherit" }}>
        {displayedText}
      </span>

      {showCursor && (
        <span
          ref={cursorRef}
          className={`ml-1 inline-block opacity-100 ${
            shouldHideCursor ? "hidden" : ""
          } ${cursorClassName}`.trim()}
        >
          {cursorCharacter}
        </span>
      )}
    </Component>
  );
}
