"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--background))] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
          {
            "bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/25":
              variant === "default",
            "bg-white/10 text-white hover:bg-white/15 border border-white/10":
              variant === "secondary",
            "hover:bg-white/10 text-white": variant === "ghost",
            "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/30":
              variant === "danger",
            "border border-white/20 bg-transparent hover:bg-white/10 text-white":
              variant === "outline",
          },
          {
            "h-8 px-3 text-sm": size === "sm",
            "h-10 px-5 text-sm": size === "md",
            "h-12 px-6 text-base": size === "lg",
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
