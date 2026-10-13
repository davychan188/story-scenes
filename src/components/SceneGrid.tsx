"use client";

import type { Scene } from "@/lib/types";

type Props = {
  scenes: Scene[];
  loading?: boolean;
};

export function SceneGrid({ scenes, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="aspect-video animate-pulse bg-slate-200" />
            <div className="space-y-2 p-3">
              <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200" />
              <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!scenes?.length) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {scenes.map((scene) => (
        <article
          key={scene.index}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="relative aspect-video bg-slate-900">
            {scene.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={scene.imageUrl}
                alt={scene.title || `Scene ${scene.index}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-slate-800 px-4 text-center text-slate-300">
                <span className="text-sm font-semibold">
                  Scene {scene.index}
                </span>
                <span className="text-xs opacity-80">
                  圖片生成失敗或暫無圖片
                </span>
              </div>
            )}
            <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur">
              {scene.index} / 4
            </span>
          </div>
          <div className="space-y-1.5 p-3 sm:p-4">
            <h3 className="text-sm font-semibold text-slate-900">
              {scene.title}
            </h3>
            <p className="text-[13px] leading-relaxed text-slate-600">
              {scene.caption}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}
