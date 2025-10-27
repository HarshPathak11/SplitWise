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

useEffect(() => {
  return () => setNavigated(false);
}, []);

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
      // important: allow horizontal pan but prevent default back-swipe by ensuring pan-x behavior
      style={{
        touchAction: "pan-x",
      }}
      className="relative mx-auto my-4 w-[90%] max-w-md h-12 bg-gray-800/60 backdrop-blur-md rounded-full flex items-center overflow-hidden text-center"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      <div
        className="flex-1 flex items-center justify-center text-gray-400 text-sm pointer-events-none"
        style={{
          // fade label as knob moves
          opacity: 1 - Math.min(1, offset / (THRESHOLD * 1.2)),
          transition: dragging ? "none" : "opacity 180ms ease",
        }}
      >
        <FaArrowLeft style={{ marginRight: 6 }} />
        Swipe to see friends
      </div>

      {/* knob */}
      <div
        ref={knobRef}
        className="absolute top-1 right-1 w-10 h-10 bg-gradient-to-br from-[#00FFA3] to-[#9e27ff] rounded-full flex items-center justify-center shadow-lg text-white text-lg font-bold"
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
        <FaArrowLeft />
      </div>
    </div>
  );
};

export default SwipeToFriends;
