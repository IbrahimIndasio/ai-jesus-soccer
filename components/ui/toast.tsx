"use client";
import * as React from "react";
import * as T from "@radix-ui/react-toast";
import { cn } from "@/lib/utils";
export const ToastProvider = T.Provider,
  ToastTitle = T.Title,
  ToastDescription = T.Description,
  ToastClose = T.Close;
export const Toast = React.forwardRef<
  React.ElementRef<typeof T.Root>,
  React.ComponentPropsWithoutRef<typeof T.Root>
>(({ className, ...props }, ref) => (
  <T.Root
    ref={ref}
    className={cn(
      "rounded-lg border border-border bg-card p-4 shadow-xl",
      className,
    )}
    {...props}
  />
));
Toast.displayName = "Toast";
export const ToastViewport = React.forwardRef<
  React.ElementRef<typeof T.Viewport>,
  React.ComponentPropsWithoutRef<typeof T.Viewport>
>(({ className, ...props }, ref) => (
  <T.Viewport
    ref={ref}
    className={cn(
      "fixed bottom-4 right-4 z-50 flex max-w-sm flex-col gap-2",
      className,
    )}
    {...props}
  />
));
ToastViewport.displayName = "ToastViewport";
