"use client";

import type { GrammarTip, GrammarLevel } from "@/lib/grammar";

type Props = {
  tips?: GrammarTip[];
};

const levelStyle: Record<
  GrammarLevel,
  { badge: string; label: string; border: string; edge: string }
> = {
  good: {
    badge: "bg-emerald-100 text-emerald-800",
    label: "講得自然",
    border: "border-emerald-200 bg-emerald-50/80",
    edge: "border-l-emerald-400",
  },
  minor: {
    badge: "bg-amber-100 text-amber-900",
    label: "小建議",
    border: "border-amber-200 bg-amber-50/80",
    edge: "border-l-amber-400",
  },
  important: {
    badge: "bg-rose-100 text-rose-900",
    label: "要注意",
    border: "border-rose-200 bg-rose-50/80",
    edge: "border-l-rose-400",
  },
};

export function GrammarTips({ tips }: Props) {
  if (!tips?.length) return null;

  return (
    <div className="flex w-full flex-col gap-2">
      {tips.map((tip, i) => {
        const style = levelStyle[tip.level] ?? levelStyle.minor;
        const isPraise =
          tip.level === "good" ||
          tip.original.trim().toLowerCase() ===
            tip.suggestion.trim().toLowerCase();

        return (
          <div
            key={i}
            className={`rounded-xl border border-l-4 px-3 py-2.5 text-left shadow-sm ${style.border} ${style.edge}`}
          >
            <div className="mb-1.5 flex items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${style.badge}`}
              >
                {style.label}
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                英文建議
              </span>
            </div>

            {!isPraise && (
              <div className="space-y-1 text-[13px] leading-snug">
                <p className="text-slate-600">
                  <span className="mr-1.5 text-[10px] font-semibold text-slate-400">
                    你寫
                  </span>
                  <span className="line-through decoration-rose-300/80">
                    {tip.original}
                  </span>
                </p>
                <p className="text-slate-900">
                  <span className="mr-1.5 text-[10px] font-semibold text-violet-600">
                    更自然
                  </span>
                  <span className="font-medium text-violet-900">
                    {tip.suggestion}
                  </span>
                </p>
              </div>
            )}

            <p
              className={`text-[12px] leading-relaxed text-slate-700 ${
                isPraise ? "" : "mt-1.5"
              }`}
            >
              {tip.reasonZh}
            </p>
          </div>
        );
      })}
    </div>
  );
}
