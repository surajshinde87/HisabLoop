"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { receiptService } from "@/services/receipt-service";

export function BotBubble({ at, children, title }: { at?: string; children: ReactNode; title?: ReactNode }) {
  return (
    <div className="relative z-10 flex flex-col items-start">
      <div className="max-w-[88%] rounded-lg rounded-tl-none bg-[#202c33] p-2.5 text-[13px] leading-snug text-[#e9edef] shadow-sm">
        {title && <div className="mb-1.5 flex items-center gap-1 border-b border-[#2a3942] pb-1 text-[12px] font-semibold text-[#00a884]">{title}</div>}
        {children}
        {at && <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-[#8696a0]">{formatTime(at)}</div>}
      </div>
    </div>
  );
}

export function UserBubble({ at, children }: { at?: string; children: ReactNode }) {
  return (
    <div className="relative z-10 flex flex-col items-end">
      <div className="max-w-[88%] rounded-lg rounded-tr-none bg-[#005c4b] p-1.5 text-[13px] leading-snug text-[#e9edef] shadow-sm">
        {children}
        <div className="flex items-center justify-end gap-1 px-1 text-[10px] text-[#8696a0]">
          {at && formatTime(at)}
          <Icon name="done_all" className="text-[14px] text-[#53bdeb]" />
        </div>
      </div>
    </div>
  );
}

/** Receipt image sent "from the phone", loaded through the authenticated receipts API. */
export function ReceiptThumb({ companyId, receiptId, filename, caption }: { companyId: string; receiptId?: string; filename: string; caption?: string | null }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!receiptId) return;
    let u: string | null = null;
    let live = true;
    receiptService
      .objectUrl(companyId, receiptId)
      .then((r) => {
        u = r.url;
        if (live) setUrl(r.type.startsWith("image/") ? r.url : null);
      })
      .catch(() => undefined);
    return () => {
      live = false;
      if (u) URL.revokeObjectURL(u);
    };
  }, [companyId, receiptId]);
  return (
    <>
      <div className="relative mb-1 overflow-hidden rounded-md bg-[#025141]">
        <div className={cn("relative flex h-32 items-center justify-center bg-cover bg-center", !url && "bg-[#03443a]")} style={url ? { backgroundImage: `url(${url})` } : undefined}>
          {!url && <Icon name="receipt_long" className="text-[40px] text-[#53dbc7]/60" />}
          <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 via-transparent to-transparent p-2">
            <span className="flex items-center gap-1 truncate text-[11px] font-semibold text-white">
              <Icon name="image" className="text-[14px] text-secondary-fixed" />
              {filename}
            </span>
          </div>
        </div>
      </div>
      {caption && <p className="px-1 text-[12px] text-[#e9edef]">{caption}</p>}
    </>
  );
}

export function QuickReplies({ children }: { children: ReactNode }) {
  return <div className="relative z-10 mt-1.5 flex w-[88%] flex-col gap-1">{children}</div>;
}

export function QuickReply({ icon, children, onClick, disabled, tone = "teal" }: { icon: string; children: ReactNode; onClick: () => void; disabled?: boolean; tone?: "teal" | "red" | "muted" }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-center gap-2 rounded-lg bg-[#202c33] px-3 py-2 text-center text-[13px] font-semibold shadow-sm transition-colors hover:bg-[#2a3942] disabled:opacity-50",
        tone === "teal" && "text-[#00a884]",
        tone === "red" && "text-[#f15c6d]",
        tone === "muted" && "text-[#aebac1]",
      )}
    >
      <Icon name={icon} className="text-[16px]" />
      {children}
    </button>
  );
}

export function Typing() {
  return (
    <div className="relative z-10 flex items-start">
      <div className="flex items-center gap-1 rounded-lg rounded-tl-none bg-[#202c33] px-3 py-2.5" aria-label="HisabLoop is typing">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#8696a0]" style={{ animationDelay: `${i * 150}ms` }} />
        ))}
      </div>
    </div>
  );
}

export function KeyValues({ rows }: { rows: [string, ReactNode, string?][] }) {
  return (
    <div className="mb-2 space-y-1 rounded bg-[#111b21] p-2 font-mono text-[12px]">
      {rows.map(([k, v, cls]) => (
        <div key={k} className="flex justify-between gap-3">
          <span className="text-[#8696a0]">{k}:</span>
          <span className={cn("truncate text-right text-[#e9edef]", cls)}>{v}</span>
        </div>
      ))}
    </div>
  );
}
