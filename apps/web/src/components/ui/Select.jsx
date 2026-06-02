import {
  Children,
  isValidElement,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "../../lib/utils";

const parseOptionChildren = (children) => {
  return Children.toArray(children)
    .filter((child) => isValidElement(child) && child.type === "option")
    .map((child) => ({
      value: String(child.props.value ?? child.props.children ?? ""),
      label: String(child.props.children ?? child.props.value ?? ""),
      disabled: Boolean(child.props.disabled),
    }));
};

export default function SelectField({
  label,
  value,
  onChange,
  options,
  children,
  disabled = false,
  className,
  labelClassName,
  placeholder = "Pilih opsi",
}) {
  const id = useId();
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const items = useMemo(() => {
    const source = Array.isArray(options) ? options : parseOptionChildren(children);

    return source.map((item) => ({
      ...item,
      value: String(item.value ?? ""),
      label: String(item.label ?? item.value ?? ""),
      disabled: Boolean(item.disabled),
    }));
  }, [children, options]);

  const selectedIndex = items.findIndex((item) => item.value === String(value));
  const selectedItem = selectedIndex >= 0 ? items[selectedIndex] : null;

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  const openMenu = () => {
    if (disabled) return;

    setIsOpen(true);
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
  };

  const selectItem = (item) => {
    if (!item || item.disabled) return;

    onChange?.(item.value);
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  const moveActiveIndex = (direction) => {
    if (!items.length) return;

    setActiveIndex((current) => {
      let next = current;

      for (let count = 0; count < items.length; count += 1) {
        next = (next + direction + items.length) % items.length;

        if (!items[next]?.disabled) {
          return next;
        }
      }

      return current;
    });
  };

  const handleButtonKeyDown = (event) => {
    if (disabled) return;

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!isOpen) {
        openMenu();
        return;
      }
      moveActiveIndex(event.key === "ArrowDown" ? 1 : -1);
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!isOpen) {
        openMenu();
        return;
      }
      selectItem(items[activeIndex]);
    }

    if (event.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      {label && (
        <label
          id={`${id}-label`}
          className={cn("text-sm font-extrabold text-[#102A43]", labelClassName)}
        >
          {label}
        </label>
      )}

      <button
        ref={buttonRef}
        type="button"
        aria-labelledby={label ? `${id}-label ${id}-value` : undefined}
        aria-expanded={isOpen}
        aria-controls={`${id}-menu`}
        aria-haspopup="listbox"
        disabled={disabled}
        onClick={() => (isOpen ? setIsOpen(false) : openMenu())}
        onKeyDown={handleButtonKeyDown}
        className="mt-2 flex min-h-12 w-full items-center justify-between gap-3 rounded-[1.15rem] bg-white/64 px-4 text-left text-sm font-extrabold text-[#102A43] shadow-[0_12px_34px_rgba(15,118,110,0.08),inset_0_1px_0_rgba(255,255,255,0.75)] outline-none backdrop-blur-2xl transition hover:bg-white/78 focus-visible:ring-4 focus-visible:ring-[#5EEAD4]/24 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span id={`${id}-value`} className="min-w-0 truncate">
          {selectedItem?.label || placeholder}
        </span>
        <ChevronDown
          size={16}
          className={cn(
            "shrink-0 text-[#0F766E] transition duration-200",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen && (
        <div
          id={`${id}-menu`}
          role="listbox"
          aria-labelledby={label ? `${id}-label` : undefined}
          className="absolute z-[70] mt-2 max-h-72 w-full overflow-auto rounded-[1.15rem] bg-[#FBFFFD]/96 p-1.5 shadow-[0_22px_54px_rgba(15,23,42,0.18)] backdrop-blur-2xl"
        >
          {items.map((item, index) => {
            const isSelected = item.value === String(value);
            const isActive = index === activeIndex;

            return (
              <button
                key={`${item.value}-${item.label}`}
                type="button"
                role="option"
                aria-selected={isSelected}
                disabled={item.disabled}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectItem(item)}
                className={cn(
                  "flex min-h-10 w-full items-center justify-between gap-3 rounded-[0.9rem] px-3 text-left text-sm font-bold text-[#334155] transition",
                  isActive && "bg-[#5EEAD4]/16 text-[#0F766E]",
                  isSelected && "text-[#0F766E]",
                  item.disabled && "cursor-not-allowed opacity-45",
                )}
              >
                <span className="min-w-0 whitespace-normal leading-5">
                  {item.label}
                </span>
                {isSelected && <Check size={15} className="shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
