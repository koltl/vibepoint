"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { useSessionStore } from "@/store/session-store";
import { getSocket } from "@/lib/socket";
import { cn } from "@/lib/utils";

const URL_REGEX = /https?:\/\/[^\s]+/g;

function extractUrls(text: string): string[] {
  if (!text.trim()) return [];
  const re = new RegExp(URL_REGEX.source, "g");
  const urls: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    urls.push(m[0].replace(/[.,;:)]+$/, ""));
  }
  return urls;
}

function linkify(text: string): (string | { url: string })[] {
  if (!text.trim()) return [];
  const parts: (string | { url: string })[] = [];
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  const re = new RegExp(URL_REGEX.source, "g");
  while ((m = re.exec(text)) !== null) {
    if (m.index > lastIndex) {
      parts.push(text.slice(lastIndex, m.index));
    }
    parts.push({ url: m[0] });
    lastIndex = re.lastIndex;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

function ClientLinkifiedContent({ text }: { text: string }) {
  if (!text) return <>—</>;
  return (
    <>
      {linkify(text).map((part, i) =>
        typeof part === "string" ? (
          <span key={i}>{part}</span>
        ) : (
          <a
            key={i}
            href={part.url.replace(/[.,;:)]+$/, "")}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
          >
            {part.url}
          </a>
        )
      )}
    </>
  );
}

export function ContextPanel() {
  const state = useSessionStore((s) => s.state);
  const isHost = useSessionStore((s) => s.isHost());
  const [local, setLocal] = useState("");
  const [hoveredUrl, setHoveredUrl] = useState<string | null>(null);

  useEffect(() => {
    if (state) setLocal(state.contextText);
  }, [state?.id, state?.contextText]);

  const handleBlur = useCallback(() => {
    if (!isHost || !state) return;
    const socket = getSocket();
    if (socket && local !== state.contextText) {
      socket.emit("update_context", { sessionId: state.id, contextText: local });
    }
  }, [isHost, state, local]);

  const hostUrls = useMemo(() => extractUrls(local), [local]);

  if (!state) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="glass rounded-2xl p-4 min-h-[120px]"
    >
      <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2">
        Context
      </label>
      {isHost ? (
        <div className="space-y-2">
          <textarea
            value={local}
            onChange={(e) => setLocal(e.target.value)}
            onBlur={handleBlur}
            placeholder="Paste in a ticket link or describe the item…"
            className={cn(
              "w-full min-h-[80px] rounded-xl border bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 resize-y transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/30 border-white/10"
            )}
            maxLength={2000}
          />
          {hostUrls.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {hostUrls.map((url) => (
                <span
                  key={url}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-2 py-1 group/link"
                  onMouseEnter={() => setHoveredUrl(url)}
                  onMouseLeave={() => setHoveredUrl(null)}
                >
                  <span className="max-w-[180px] truncate text-xs text-white/70">{url}</span>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium text-indigo-300 bg-indigo-500/20 border border-indigo-500/30 transition-opacity",
                      hoveredUrl === url
                        ? "opacity-100"
                        : "opacity-0 group-hover/link:opacity-100 hover:bg-indigo-500/30 hover:text-indigo-200"
                    )}
                  >
                    Open link
                    <span className="text-[0.65rem]">↗</span>
                  </a>
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="min-h-[52px] rounded-xl bg-white/5 px-4 py-3 text-sm text-white/90 whitespace-pre-wrap break-words">
          <ClientLinkifiedContent text={state.contextText || local} />
        </div>
      )}
    </motion.section>
  );
}
