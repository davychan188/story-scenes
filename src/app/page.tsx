"use client";

import { useCallback, useEffect, useState } from "react";
import { GrammarTips } from "@/components/GrammarTips";
import { SceneGrid } from "@/components/SceneGrid";
import type { GrammarTip } from "@/lib/grammar";
import type { Scene, StatusResponse } from "@/lib/types";

type ResultState = {
  provider: "grok" | "demo";
  demoMode: boolean;
  correctedText: string;
  tips: GrammarTip[];
  scenes: Scene[];
};

const EXAMPLE = `Yesterday I go to the park with my friend. The sky is blue and there is many birds. We very like the colour of the flowers. Then we discuss about our weekend plans and go home happy.`;

export default function HomePage() {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResultState | null>(null);

  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then((data: StatusResponse) => setStatus(data))
      .catch(() =>
        setStatus({
          provider: "demo",
          demoMode: true,
          textModel: null,
          imageModel: null,
        })
      );
  }, []);

  const onGenerate = useCallback(async () => {
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "生成失敗");
      }
      setResult({
        provider: data.provider,
        demoMode: data.demoMode,
        correctedText: data.correctedText,
        tips: data.tips || [],
        scenes: data.scenes || [],
      });
      if (status) {
        setStatus({
          ...status,
          provider: data.provider,
          demoMode: data.demoMode,
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "生成失敗");
    } finally {
      setLoading(false);
    }
  }, [text, status]);

  const demoMode = status?.demoMode ?? result?.demoMode ?? true;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-6 sm:px-6 sm:py-10">
      <header className="mb-6 space-y-3 sm:mb-8">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Story Scenes
          </h1>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              demoMode
                ? "bg-slate-200 text-slate-700"
                : "bg-violet-100 text-violet-800"
            }`}
          >
            {demoMode ? "Demo 模式" : "Grok 模式"}
          </span>
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-[15px]">
          用英文寫一段故事，一鍵幫你改英文、拆成 4 個場景，再生成場照。介面係繁中；故事同場次說明用英文。
        </p>
        {!demoMode && status?.textModel && (
          <p className="text-xs text-slate-400">
            文字：{status.textModel}
            {status.imageModel ? ` · 圖像：${status.imageModel}` : ""}
          </p>
        )}
        {demoMode && (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">
            未設定 <code className="font-mono">XAI_API_KEY</code> → 免費
            Demo（彩色分鏡佔位圖 + 啟發式改錯）。本機加 key 後重新啟動即可用真 Grok／Imagine。
          </p>
        )}
      </header>

      <main className="flex flex-1 flex-col gap-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <label
            htmlFor="story"
            className="mb-2 block text-sm font-semibold text-slate-800"
          >
            你嘅英文故事
          </label>
          <textarea
            id="story"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={7}
            placeholder="Write a short English story or scene description…"
            className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[15px] leading-relaxed text-slate-900 outline-none ring-violet-400 placeholder:text-slate-400 focus:bg-white focus:ring-2"
            disabled={loading}
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onGenerate}
              disabled={loading || !text.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  生成緊 4 張場照…
                </>
              ) : (
                "生成 4 張場照"
              )}
            </button>
            <button
              type="button"
              onClick={() => setText(EXAMPLE)}
              disabled={loading}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              填入範例
            </button>
            <button
              type="button"
              onClick={() => {
                setText("");
                setResult(null);
                setError(null);
              }}
              disabled={loading}
              className="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-800 disabled:opacity-50"
            >
              清空
            </button>
          </div>
          {loading && (
            <p className="mt-3 text-xs text-slate-500">
              {demoMode
                ? "Demo：即時產生改寫同佔位場照…"
                : "Grok 改寫／分鏡中，之後並行生成 4 張圖（可能要半分鐘）…"}
            </p>
          )}
          {error && (
            <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
              {error}
            </p>
          )}
        </section>

        {result && (
          <>
            <section className="space-y-3">
              <h2 className="text-base font-semibold text-slate-900">
                改寫後英文
              </h2>
              <div className="rounded-2xl border border-violet-100 bg-violet-50/60 p-4 text-[15px] leading-relaxed text-slate-800 whitespace-pre-wrap">
                {result.correctedText}
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-slate-900">
                英文建議
              </h2>
              <GrammarTips tips={result.tips} />
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-slate-900">
                4 張故事場照
              </h2>
              <SceneGrid scenes={result.scenes} />
            </section>
          </>
        )}
      </main>

      <footer className="mt-10 border-t border-slate-200 pt-4 text-center text-xs text-slate-400">
        Story Scenes · 英文練習＋場照 ·{" "}
        {demoMode ? "Demo 免費" : "Live（想像圖約 $0.02–0.04／張）"}
      </footer>
    </div>
  );
}
