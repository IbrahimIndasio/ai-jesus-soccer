"use client";
import * as React from "react";
import * as T from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";
export const TooltipProvider = T.Provider,
  Tooltip = T.Root,
  TooltipTrigger = T.Trigger;
export const TooltipContent = React.forwardRef<
  React.ElementRef<typeof T.Content>,
  React.ComponentPropsWithoutRef<typeof T.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <T.Portal>
    <T.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 rounded-md border border-border bg-card px-3 py-2 text-sm shadow-lg",
        className,
      )}
      {...props}
    />
  </T.Portal>
));
TooltipContent.displayName = "TooltipContent";
