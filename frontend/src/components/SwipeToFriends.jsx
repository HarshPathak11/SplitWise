// SwipeToFriends.jsx
import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

const SwipeToFriends = () => {
  const containerRef = useRef(null);
  const knobRef = useRef(null);
  const navigate = useNavigate();

  // local state
  const [dragging, setDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [offset, setOffset] = useState(0);
  const [navigated, setNavigated] = useState(false); // guard to avoid double navigate

  // config
  const THRESHOLD = 120; // pixels to trigger navigation
  const KNOB_SIZE = 40; // sizes used for bounds (match your CSS)

  // pointer down
  const onPointerDown = (e) => {
    // only primary button / single touch
    if (e.pointerType === "mouse" && e.button !== 0) return;
    setDragging(true);
    setNavigated(false);
    setStartX(e.clientX);
    e.target.setPointerCapture?.(e.pointerId);
  };

  // pointer move
  const onPointerMove = (e) => {
    if (!dragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    // We want right -> left swipe (startX > currentX) to increase offset
    const currentX = e.clientX;
    let diff = startX - currentX; // positive when swiping left
    diff = Math.max(0, diff); // only allow positive
    const maxOffset = rect.width - KNOB_SIZE - 8; // keep knob inside container
    const clamped = Math.min(diff, maxOffset);
    setOffset(clamped);
  };

  // pointer up / cancel
  const onPointerUp = (e) => {
    if (!dragging) return;
    setDragging(false);

    // if already navigated during this gesture, reset and exit
    if (navigated) {
      setOffset(0);
      return;
    }

    if (offset >= THRESHOLD) {
      // guard: don't navigate if already on /friends
      if (window.location.pathname !== "/friends") {
        // mark as navigated to prevent double navigation
        setNavigated(true);

        // push a unique state to ensure a new history entry
        navigate("/friends", {
          state: { from: "/dash", navId: Date.now() },
          replace: false,
        });

        // graceful UI reset after short delay so user sees completion
        setTimeout(() => {
          setOffset(0);
        }, 180);
      } else {
        // already on /friends - just reset knob
        setOffset(0);
      }
    } else {
      // not enough swipe - animate back to start
      setOffset(0);
    }

    try {
      e.target.releasePointerCapture?.(e.pointerId);
    } catch (err) {
      // ignore
    }
  };

  return (
    <div
      ref={containerRef}
      // important: allow horizontal pan but prevent default back-swipe
      style={{
        touchAction: "pan-x",
      }}
      className="relative mx-auto w-full max-w-sm h-14 bg-zinc-950 border border-white/5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] rounded-full flex items-center overflow-hidden select-none"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      {/* Background Text Label */}
      <div
        className="flex-1 flex items-center justify-center text-zinc-500 text-sm font-medium tracking-wide pointer-events-none"
        style={{
          // fade label as knob moves
          opacity: 1 - Math.min(1, offset / (THRESHOLD * 1.2)),
          transition: dragging ? "none" : "opacity 180ms ease",
        }}
      >
        <span className="mr-2 text-indigo-500 animate-pulse">
          <FaArrowLeft />
        </span>
        Swipe for Contacts
      </div>

      {/* Premium Knob */}
      <div
        ref={knobRef}
        className="absolute top-1.5 right-1.5 w-11 h-11 bg-indigo-600 hover:bg-indigo-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.4)] text-white z-10 cursor-grab active:cursor-grabbing border border-indigo-400/30 transition-colors"
        style={{
          transform: `translateX(-${offset}px)`,
          transition: dragging
            ? "none"
            : "transform 220ms cubic-bezier(.2,.9,.2,1)",
          touchAction: "none", // ensure knob itself doesn't trigger browser gestures
        }}
        role="button"
        aria-label="Swipe to friends"
      >
        <FaArrowLeft className="w-4 h-4" />
      </div>
    </div>
  );
};

export default SwipeToFriends;
