import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const avatarTones = [
  "bg-indigo-100 text-indigo-700",
  "bg-violet-100 text-violet-700",
  "bg-sky-100 text-sky-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-800",
] as const;

function toneFor(label: string) {
  let total = 0;
  for (let index = 0; index < label.length; index += 1) total += label.charCodeAt(index);
  return avatarTones[total % avatarTones.length];
}

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  name: string;
  size?: "sm" | "md";
}

export function Avatar({ name, size = "md", className, ...props }: AvatarProps) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <span
      role="img"
      aria-label={name}
      className={cn(
        "grid shrink-0 place-items-center rounded-full font-bold ring-2 ring-card",
        toneFor(name),
        size === "sm" ? "size-7 text-[9px]" : "size-9 text-[11px]",
        className,
      )}
      {...props}
    >
      {initials}
    </span>
  );
}
