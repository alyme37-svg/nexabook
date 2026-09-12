import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold whitespace-nowrap outline-none transition-[background-color,color,border-color,box-shadow,opacity] duration-150 focus-visible:ring-3 focus-visible:ring-ring/25 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border border-transparent bg-[linear-gradient(135deg,#5b55ed,#4f46e5_55%,#6d3fe2)] text-primary-foreground shadow-[0_6px_16px_-8px_rgb(79_70_229/0.8)] hover:brightness-[1.04] active:brightness-95",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/75 active:bg-secondary",
        outline: "border border-border bg-card text-foreground hover:border-input hover:bg-muted/60 active:bg-muted",
        ghost: "text-muted-foreground hover:bg-muted hover:text-foreground active:bg-secondary",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80",
      },
      size: {
        default: "h-10",
        sm: "min-h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-lg px-5",
        icon: "size-10 px-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Component = asChild ? Slot : "button";
  return <Component className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
