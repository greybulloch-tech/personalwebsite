"use client";

import * as React from "react";
import { RoomPlan } from "./RoomPlan";
import { Room3DScene } from "./Room3DScene";
import type { RoomLayout } from "../lib/types";
import { normalizeModelData } from "../lib/normalizeModelData";

type HistoryState = {
  layout: RoomLayout;
};

export function RoomExperienceClient() {
  const [layout, setLayout] = React.useState<RoomLayout | null>(() =>
    normalizeModelData(),
  );
  const [past, setPast] = React.useState<HistoryState[]>([]);
  const [future, setFuture] = React.useState<HistoryState[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  const pushLayout = (next: RoomLayout) => {
    if (layout) {
      setPast((prev) => [...prev, { layout }]);
    }
    setFuture([]);
    setLayout(next);
  };

  const handleUndo = () => {
    if (!canUndo || !layout) return;
    const prev = past[past.length - 1];
    setPast((p) => p.slice(0, -1));
    setFuture((f) => [{ layout }, ...f]);
    setLayout(prev.layout);
  };

  const handleRedo = () => {
    if (!canRedo || !layout) return;
    const [next, ...rest] = future;
    setFuture(rest);
    setPast((p) => [...p, { layout }]);
    setLayout(next.layout);
  };

  const handleUploadChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (files.length > 5) {
      setError("Please upload up to 5 photos for a single room.");
      return;
    }

    const oversized = Array.from(files).find((f) => f.size > 10 * 1024 * 1024);
    if (oversized) {
      setError("Each file must be 10MB or smaller.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });

      const res = await fetch("/api/analyze-room", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong while analyzing.");
      }

      const data = (await res.json()) as { layout: RoomLayout };
      pushLayout(data.layout);
    } catch (e: any) {
      setError(e.message ?? "Unexpected error during analysis.");
    } finally {
      setIsLoading(false);
      // reset input so same file can be selected again
      event.target.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleUndo}
          disabled={!canUndo}
          className="inline-flex items-center justify-center rounded-full border border-zinc-700 bg-zinc-950/60 px-3 py-1.5 text-[11px] font-medium text-zinc-200 transition disabled:cursor-not-allowed disabled:border-zinc-800 disabled:text-zinc-600"
        >
          Undo
        </button>
        <button
          type="button"
          onClick={handleRedo}
          disabled={!canRedo}
          className="inline-flex items-center justify-center rounded-full border border-zinc-700 bg-zinc-950/60 px-3 py-1.5 text-[11px] font-medium text-zinc-200 transition disabled:cursor-not-allowed disabled:border-zinc-800 disabled:text-zinc-600"
        >
          Redo
        </button>
        <span className="text-[11px] text-zinc-500">
          Upload new photos any time to regenerate the layout.
        </span>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/40 p-4">
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-6 text-center text-xs text-zinc-400 transition hover:border-zinc-600 hover:bg-zinc-900">
          <span className="font-medium text-zinc-200">
            Drop up to 5 room photos
          </span>
          <span className="text-[11px] text-zinc-500">
            JPG, PNG, WEBP · each ≤ 10MB
          </span>
          <input
            type="file"
            name="files"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleUploadChange}
          />
        </label>
        {isLoading && (
          <p className="text-[11px] text-zinc-400">
            Analyzing your room with the demo AI… This may take a few seconds.
          </p>
        )}
        {error && (
          <p className="text-[11px] text-rose-400">
            {error}
          </p>
        )}
        {!isLoading && !error && (
          <p className="text-[11px] text-zinc-500">
            The current prototype uses a deterministic AI stub. Swapping in a
            real model later will not change the experience.
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <RoomPlan
          layoutOverride={layout}
          onLayoutChange={(next) => setLayout(next)}
        />
        <Room3DScene layout={layout ?? undefined} />
      </div>
    </div>
  );
}

