"use client";

import { useMemo, useRef, useEffect, useLayoutEffect } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { useSessionStore } from "@/store/session-store";
import { revealSortKey } from "@/lib/utils";
import { cn } from "@/lib/utils";

const CHECK_PATH_LENGTH = 23;

function CheckmarkDraw({ active }: { active: boolean }) {
  const pathRef = useRef<SVGPathElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!active) {
      hasAnimated.current = false;
      return;
    }
    if (hasAnimated.current || !pathRef.current) return;
    hasAnimated.current = true;
    const path = pathRef.current;
    requestAnimationFrame(() => {
      gsap.to(path, {
        strokeDashoffset: 0,
        duration: 0.55,
        ease: "power2.out",
        overwrite: true,
      });
    });
  }, [active]);

  if (!active) return null;

  return (
    <svg
      className="w-12 h-12 text-white"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        ref={pathRef}
        d="M4 12.5l5 5 11-11"
        style={{
          strokeDasharray: CHECK_PATH_LENGTH,
          strokeDashoffset: CHECK_PATH_LENGTH,
        }}
      />
    </svg>
  );
}

export function PlayersReveal() {
  const state = useSessionStore((s) => s.state);
  const socketId = useSessionStore((s) => s.socketId);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const prevRevealed = useRef<boolean | null>(null);

  const sorted = useMemo(() => {
    if (!state) return [];
    return [...state.users].sort((a, b) => {
      const va = state.revealed ? state.votes[a.socketId] : undefined;
      const vb = state.revealed ? state.votes[b.socketId] : undefined;
      const ka = revealSortKey(va);
      const kb = revealSortKey(vb);
      if (ka !== kb) return ka - kb;
      return a.joinedAt - b.joinedAt;
    });
  }, [state?.users, state?.votes, state?.revealed]);

  useLayoutEffect(() => {
    if (!state) return;
    if (prevRevealed.current === null) {
      prevRevealed.current = state.revealed;
      return;
    }
    if (prevRevealed.current === state.revealed) return;
    const revealed = state.revealed;
    prevRevealed.current = revealed;
    const targets = cardRefs.current.filter(Boolean);
    targets.forEach((el, i) => {
      const flipInner = el?.querySelector("[data-flip-inner]");
      if (!flipInner) return;
      const delay = i * 0.08;
      gsap.fromTo(
        flipInner,
        { rotationY: revealed ? 0 : 180 },
        {
          rotationY: revealed ? 180 : 0,
          duration: 0.45,
          delay,
          ease: "power2.inOut",
          transformPerspective: 400,
          overwrite: true,
        }
      );
    });
  }, [state?.revealed, state]);

  if (!state) return null;

  return (
    <section className="glass rounded-2xl p-5 md:p-6">
      <h2 className="text-xs font-medium text-white/50 uppercase tracking-wider mb-4">
        {state.revealed ? "Results" : "Players"} ({state.users.length})
      </h2>
      <ul className="flex flex-wrap gap-4 justify-start">
        {sorted.map((user, i) => {
          const value = state.revealed ? state.votes[user.socketId] : undefined;
          const voted = user.socketId in state.votes;
          const isMe = user.socketId === socketId;

          return (
            <motion.li
              key={user.id}
              initial={{ opacity: 0, y: 12, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 28,
                delay: state.revealed ? i * 0.06 : 0,
              }}
              className="list-none"
            >
              <div
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                className={cn(
                  "w-[100px] flex flex-col rounded-2xl overflow-hidden border shrink-0",
                  "bg-white/5 border-white/10",
                  isMe && "ring-1 ring-indigo-400/40"
                )}
              >
                {/* Top: name only (no flip) — fixed height so all cards match */}
                <div className="h-[44px] flex flex-col items-center justify-center px-2 shrink-0 border-b border-white/10 bg-white/[0.04]">
                  <p className="text-xs font-semibold text-white truncate text-center w-full">
                    {user.username}
                  </p>
                  {isMe ? (
                    <p className="text-[10px] text-white/50 text-center">(you)</p>
                  ) : (
                    <span className="text-[10px] invisible select-none">(you)</span>
                  )}
                </div>

                {/* Bottom: flip only this part — this section flips with estimate in the middle */}
                <div className="relative flex-1 min-h-[90px] overflow-hidden perspective-[400px] [perspective-origin:center_center]">
                  <div
                    data-flip-inner
                    className="absolute inset-0 w-full h-full"
                    style={{
                      transformStyle: "preserve-3d",
                      transform: state.revealed ? "rotateY(180deg)" : "rotateY(0deg)",
                    }}
                  >
                    {/* Front: blank or checkmark when voted */}
                    <div
                      className="absolute inset-0 flex items-center justify-center bg-white/[0.04]"
                      style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
                    >
                      <CheckmarkDraw active={voted && !state.revealed} />
                    </div>
                    {/* Back: estimate centered */}
                    <div
                      className="absolute inset-0 flex items-center justify-center bg-white/10"
                      style={{
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                      }}
                    >
                      <span className="text-3xl md:text-4xl font-bold tabular-nums text-white/95">
                        {value !== undefined && value !== null ? value : ""}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}
