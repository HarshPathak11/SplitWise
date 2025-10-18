import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const SwipeToFriends = () => {
  const [startX, setStartX] = useState(0);
  const [offset, setOffset] = useState(0);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    const moveX = e.touches[0].clientX;
    const diff = startX - moveX; // right → left swipe

    if (diff >= 0 && containerRef.current) {
      const maxOffset = containerRef.current.offsetWidth - 40; // arrow width = 40px
      setOffset(Math.min(diff, maxOffset)); // arrow moves with finger
    }
  };

  const handleTouchEnd = () => {
    const threshold = 120; // swipe threshold to trigger navigation
    if (offset > threshold) {
      navigate("/friends", { state: { from: "/dash" } });
    }
    // Animate back to initial position
    setOffset(0);
  };

  return (
    <div
      ref={containerRef}
      className="relative mx-auto my-4 w-[90%] max-w-md h-12 bg-gray-800/60 backdrop-blur-md rounded-full flex items-center overflow-hidden text-center"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Hint Text */}
      <div
        className="flex-1 flex items-center justify-center text-gray-400 text-sm pointer-events-none"
        style={{ opacity: 1 - offset / 200 }}
      >
        ← Swipe to see friends
      </div>

      {/* Draggable Arrow Ball */}
      <div
        className="absolute top-1 right-1 w-10 h-10 bg-gradient-to-br from-[#00FFA3] to-[#9e27ff] rounded-full flex items-center justify-center shadow-lg text-white text-lg font-bold"
        style={{
          transform: `translateX(-${offset}px)`,
        }}
      >
        ←
      </div>
    </div>
  );
};

export default SwipeToFriends;
