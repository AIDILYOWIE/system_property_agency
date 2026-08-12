import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content text-text-primary min-h-16 w-full rounded-lg border border-border-base !bg-canvas p-4 text-sm transition-colors outline-none placeholder:text-text-muted focus-visible:border-border-base focus-visible:ring-0 focus-visible:ring-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
// w-full bg-transparent p-4 text-sm outline-none resize-y text-text-primary placeholder-text-muted
