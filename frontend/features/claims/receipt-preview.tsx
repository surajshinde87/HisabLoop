"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/feedback";
import { errorMessage } from "@/lib/api-client";
import { receiptService } from "@/services/receipt-service";
import type { ReceiptDto } from "@/types/api";

/**
 * Loads the receipt through the authenticated API (files are never public URLs) and shows it
 * with zoom/rotate controls from the Stitch "Tax Invoice Preview" panel.
 */
export function ReceiptPreview({ companyId, receipt }: { companyId: string; receipt: ReceiptDto }) {
  // Results are tagged with the receipt they belong to, so switching receipts never shows a stale image.
  const [loaded, setLoaded] = useState<{ id: string; url: string; type: string } | null>(null);
  const [failed, setFailed] = useState<{ id: string; message: string } | null>(null);
  const src = loaded?.id === receipt.id ? loaded : null;
  const error = failed?.id === receipt.id ? failed.message : null;
  const [zoom, setZoom] = useState(1);
  const [rotate, setRotate] = useState(0);
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let revoked = false;
    let url: string | null = null;
    const id = receipt.id;
    receiptService
      .objectUrl(companyId, id)
      .then((r) => {
        url = r.url;
        if (!revoked) setLoaded({ id, ...r });
      })
      .catch((e) => {
        if (!revoked) setFailed({ id, message: errorMessage(e) });
      });
    return () => {
      revoked = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [companyId, receipt.id]);

  const isPdf = (src?.type ?? receipt.contentType) === "application/pdf";
  const tool = "p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors disabled:opacity-40";

  return (
    <div className="flex flex-col overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm">
      <div className="flex items-center justify-between bg-surface-container-low px-space-md py-2.5">
        <div className="flex items-center gap-1.5">
          <Icon name="receipt_long" className="text-[18px] text-primary" />
          <span className="font-label-md text-label-md font-semibold text-primary">Receipt Preview</span>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" className={tool} disabled={isPdf} onClick={() => setZoom((z) => Math.min(3, z + 0.25))} title="Zoom in" aria-label="Zoom in">
            <Icon name="zoom_in" className="text-[18px]" />
          </button>
          <button type="button" className={tool} disabled={isPdf} onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))} title="Zoom out" aria-label="Zoom out">
            <Icon name="zoom_out" className="text-[18px]" />
          </button>
          <button type="button" className={tool} disabled={isPdf} onClick={() => setRotate((r) => (r + 90) % 360)} title="Rotate" aria-label="Rotate">
            <Icon name="rotate_right" className="text-[18px]" />
          </button>
          <div className="mx-1 h-4 w-px bg-outline-variant" />
          <button type="button" className={tool} onClick={() => void stage.current?.requestFullscreen?.()} title="Fullscreen" aria-label="Fullscreen">
            <Icon name="fullscreen" className="text-[18px]" />
          </button>
          {src && (
            <a href={src.url} download={receipt.originalFilename} className="rounded-lg p-1.5 text-secondary transition-colors hover:bg-surface-container" title="Download original" aria-label="Download original">
              <Icon name="download" className="text-[18px]" />
            </a>
          )}
        </div>
      </div>
      <div ref={stage} className="flex min-h-[420px] items-center justify-center overflow-auto bg-surface-container-low/50 p-space-md">
        {error ? (
          <p className="text-center font-body-sm text-body-sm text-on-surface-variant">
            <Icon name="broken_image" className="mb-2 block text-[32px] text-outline" />
            Could not load the receipt: {error}
          </p>
        ) : !src ? (
          <Skeleton className="h-[380px] w-full max-w-sm" />
        ) : isPdf ? (
          <object data={src.url} type="application/pdf" className="h-[520px] w-full rounded-lg bg-white" aria-label={receipt.originalFilename}>
            <a href={src.url} download={receipt.originalFilename} className="text-brand-link underline">
              Download PDF
            </a>
          </object>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- authenticated blob URL, not optimisable by next/image
          <img
            src={src.url}
            alt={`Receipt ${receipt.originalFilename}`}
            className="max-w-full rounded-lg shadow-md transition-transform duration-300"
            style={{ transform: `scale(${zoom}) rotate(${rotate}deg)` }}
          />
        )}
      </div>
      <div className="flex flex-col gap-2 bg-surface-container-lowest p-space-md">
        <div className="flex items-center justify-between font-body-sm text-body-sm text-on-surface-variant">
          <div className="flex min-w-0 items-center gap-2">
            <Icon name={isPdf ? "picture_as_pdf" : "image"} className="text-[18px] text-outline" />
            <span className="truncate font-label-md text-label-md font-semibold text-on-surface">{receipt.originalFilename}</span>
            <span className="shrink-0 font-label-sm text-label-sm text-outline">({(receipt.sizeBytes / 1024).toFixed(0)} KB)</span>
          </div>
          <span className="rounded bg-surface-container-high px-2 py-0.5 font-label-sm text-label-sm font-semibold text-on-surface">Original</span>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="rounded-lg bg-surface-container-low p-2">
            <p className="font-label-sm text-[10px] uppercase text-outline">SHA-256 fingerprint</p>
            <p className="truncate font-label-md text-label-md font-medium text-on-surface" title={receipt.sha256}>
              {receipt.sha256.slice(0, 16)}…
            </p>
          </div>
          <div className="rounded-lg bg-surface-container-low p-2">
            <p className="font-label-sm text-[10px] uppercase text-outline">Extraction</p>
            <p className="truncate font-label-md text-label-md font-medium text-secondary">
              {receipt.processingStatus === "COMPLETED"
                ? `${receipt.provider === "mock" ? "Mock OCR (dev)" : receipt.provider ?? "OCR"} · ${receipt.confidence ?? "–"}%`
                : receipt.processingStatus === "NEEDS_REVIEW"
                  ? "Manual entry needed"
                  : receipt.processingStatus.toLowerCase()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
