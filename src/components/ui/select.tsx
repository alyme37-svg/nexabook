"use client";

import { Check, ChevronDown } from "lucide-react";
import * as React from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

type SelectOption = {
  value: string;
  label: React.ReactNode;
  disabled: boolean;
};

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(
  (
    {
      className,
      children,
      value,
      defaultValue,
      onChange,
      disabled,
      id,
      "aria-label": ariaLabel,
      "aria-describedby": ariaDescribedBy,
      "aria-invalid": ariaInvalid,
      ...props
    },
    forwardedRef,
  ) => {
    const generatedId = React.useId();
    const listboxId = `${id ?? generatedId}-options`;
    const triggerRef = React.useRef<HTMLButtonElement>(null);
    const nativeRef = React.useRef<HTMLSelectElement>(null);
    const [open, setOpen] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState(
      String(defaultValue ?? ""),
    );
    const [position, setPosition] = React.useState<React.CSSProperties>();
    const options = React.useMemo<SelectOption[]>(
      () =>
        React.Children.toArray(children).flatMap((child) => {
          if (
            !React.isValidElement<
              React.OptionHTMLAttributes<HTMLOptionElement>
            >(child)
          )
            return [];
          return [
            {
              value: String(child.props.value ?? ""),
              label: child.props.children,
              disabled: Boolean(child.props.disabled),
            },
          ];
        }),
      [children],
    );
    const selectedValue = String(value ?? internalValue);
    const selected =
      options.find((option) => option.value === selectedValue) ?? options[0];

    React.useImperativeHandle(
      forwardedRef,
      () => nativeRef.current as HTMLSelectElement,
    );

    React.useEffect(() => {
      if (!open) return;
      const close = () => setOpen(false);
      window.addEventListener("resize", close);
      window.addEventListener("scroll", close, true);
      return () => {
        window.removeEventListener("resize", close);
        window.removeEventListener("scroll", close, true);
      };
    }, [open]);

    function openMenu() {
      if (disabled || !triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      const menuHeight = Math.min(280, options.length * 42 + 12);
      const opensAbove =
        window.innerHeight - rect.bottom < menuHeight + 10 &&
        rect.top > menuHeight;
      setPosition({
        left: Math.max(
          8,
          Math.min(rect.left, window.innerWidth - rect.width - 8),
        ),
        top: opensAbove
          ? Math.max(8, rect.top - menuHeight - 6)
          : rect.bottom + 6,
        width: rect.width,
      });
      setOpen(true);
    }

    function choose(nextValue: string) {
      if (value === undefined) setInternalValue(nextValue);
      onChange?.({
        target: { value: nextValue },
        currentTarget: { value: nextValue },
      } as unknown as React.ChangeEvent<HTMLSelectElement>);
      setOpen(false);
      requestAnimationFrame(() => triggerRef.current?.focus());
    }

    function moveSelection(direction: 1 | -1) {
      const available = options.filter((option) => !option.disabled);
      const index = available.findIndex(
        (option) => option.value === selectedValue,
      );
      const next =
        available[
          index < 0
            ? 0
            : (index + direction + available.length) % available.length
        ];
      if (next) choose(next.value);
    }

    return (
      <span className="relative block min-w-0">
        <select
          ref={nativeRef}
          value={selectedValue}
          onChange={onChange}
          disabled={disabled}
          tabIndex={-1}
          aria-hidden="true"
          className="sr-only"
          {...props}
        >
          {children}
        </select>
        <button
          ref={triggerRef}
          id={id}
          type="button"
          disabled={disabled}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
          aria-invalid={ariaInvalid}
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listboxId : undefined}
          onClick={() => (open ? setOpen(false) : openMenu())}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              if (!open) openMenu();
              else moveSelection(event.key === "ArrowDown" ? 1 : -1);
            }
            if (event.key === "Escape") setOpen(false);
          }}
          className={cn(
            "flex h-11 w-full min-w-0 items-center justify-between gap-3 rounded-md border border-input bg-card px-3 py-2 text-left text-base text-foreground outline-none transition-[border-color,box-shadow,background-color] hover:border-ring/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60 md:h-10 md:text-sm",
            open && "border-ring ring-3 ring-ring/20",
            className,
          )}
        >
          <span className="min-w-0 flex-1 truncate">{selected?.label}</span>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform duration-150 motion-reduce:transition-none",
              open && "rotate-180",
            )}
            aria-hidden="true"
          />
        </button>
        {open && position
          ? createPortal(
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-[60] cursor-default"
                  aria-label="Close options"
                  onClick={() => setOpen(false)}
                />
                <div
                  id={listboxId}
                  role="listbox"
                  aria-label={ariaLabel}
                  className="scrollbar-subtle fixed z-[70] max-h-[17.5rem] overflow-y-auto rounded-xl border bg-popover p-1.5 text-popover-foreground shadow-float outline-none"
                  style={position}
                >
                  {options.map((option) => {
                    const isSelected = option.value === selectedValue;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        disabled={option.disabled}
                        onClick={() => choose(option.value)}
                        className={cn(
                          "flex min-h-10 w-full items-center gap-2 rounded-lg px-2.5 text-left text-sm outline-none transition-colors hover:bg-muted focus-visible:bg-muted disabled:cursor-not-allowed disabled:opacity-45",
                          isSelected &&
                            "bg-accent font-semibold text-accent-foreground",
                        )}
                      >
                        <span className="min-w-0 flex-1 truncate">
                          {option.label}
                        </span>
                        {isSelected ? (
                          <Check
                            className="size-4 shrink-0"
                            aria-hidden="true"
                          />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </>,
              document.body,
            )
          : null}
      </span>
    );
  },
);
Select.displayName = "Select";
