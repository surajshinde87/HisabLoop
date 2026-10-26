"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./icon";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({
  title,
  description,
  children,
  className,
  side = "center",
}: {
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
  side?: "center" | "right";
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-primary/30 backdrop-blur-[2px] data-[state=open]:animate-in" />
      <DialogPrimitive.Content
        className={cn(
          "fixed z-[61] flex max-h-[92vh] flex-col bg-surface-container-lowest focus:outline-none",
          side === "center"
            ? "left-1/2 top-1/2 w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl shadow-modal"
            : "right-0 top-0 h-full w-full max-w-xl shadow-drawer",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-brand-line px-6 py-4">
          <div>
            <DialogPrimitive.Title className="font-headline-md text-headline-md text-primary">{title}</DialogPrimitive.Title>
            {description ? (
              <DialogPrimitive.Description className="mt-0.5 font-body-sm text-body-sm text-on-surface-variant">
                {description}
              </DialogPrimitive.Description>
            ) : (
              <DialogPrimitive.Description className="sr-only">{typeof title === "string" ? title : "Dialog"}</DialogPrimitive.Description>
            )}
          </div>
          <DialogPrimitive.Close className="rounded-full p-1.5 text-on-surface-variant hover:bg-surface-container-low" aria-label="Close">
            <Icon name="close" className="text-[20px]" />
          </DialogPrimitive.Close>
        </div>
        <div className="overflow-y-auto px-6 py-5">{children}</div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
