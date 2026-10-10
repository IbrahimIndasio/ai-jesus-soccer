"use client";
import * as React from "react";
import * as D from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
export const Dialog = D.Root,
  DialogTrigger = D.Trigger,
  DialogClose = D.Close,
  DialogTitle = D.Title,
  DialogDescription = D.Description;
export const DialogContent = React.forwardRef<
  React.ElementRef<typeof D.Content>,
  React.ComponentPropsWithoutRef<typeof D.Content>
>(({ className, children, ...props }, ref) => (
  <D.Portal>
    <D.Overlay className="fixed inset-0 z-50 bg-black/70" />
    <D.Content
      ref={ref}
      className={cn(
        "fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 shadow-2xl",
        className,
      )}
      {...props}
    >
      {children}
      <D.Close className="absolute right-4 top-4 rounded focus-visible:ring-2 focus-visible:ring-gold">
        <X className="h-5 w-5" />
        <span className="sr-only">Close</span>
      </D.Close>
    </D.Content>
  </D.Portal>
));
DialogContent.displayName = "DialogContent";
