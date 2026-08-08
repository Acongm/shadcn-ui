import * as React from "react";

import { cn } from "@/lib/ui-cn";

export type TextareaProps = React.ComponentProps<"textarea">;

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        [
          "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
          "flex field-sizing-content min-h-16 w-full rounded-md border border-input bg-background px-3 py-2 text-base text-foreground shadow-xs",
          "transition-[color,box-shadow] outline-none md:text-sm",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
          "aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        ].join(" "),
        className,
      )}
      {...props}
    />
  );
}
