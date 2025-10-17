import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SwipeToFriends = () => {
  const [startX, setStartX] = useState(0);
  const [offset, setOffset] = useState(0);
  const navigate = useNavigate();

  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    const moveX = e.touches[0].clientX;
    const diff = startX - moveX; // right → left swipe
    if (diff >= 0) setOffset(Math.min(diff, window.innerWidth - 64)); // full travel animation
  };

  const handleTouchEnd = () => {
    if (offset > 120) {
      // ✅ Trigger page change after threshold
      navigate("/friends");
    }
    // Smoothly animate back to initial
    setOffset(0);
  };

  return (
    <div
      className="relative mx-auto my-4 w-[90%] max-w-md h-12 bg-gray-800/60 backdrop-blur-md rounded-full flex items-center overflow-hidden text-center"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Hint Text */}
      <div
        className="flex-1 flex items-center justify-center text-gray-400 text-sm"
        style={{ opacity: 1 - offset / 200 }}
      >
        ← Swipe to see friends
      </div>

      {/* Draggable Arrow Ball */}
      <div
        className="absolute top-1 right-1 w-10 h-10 bg-gradient-to-br from-[#00FFA3] to-[#9e27ff] rounded-full flex items-center justify-center shadow-lg text-white text-lg font-bold transition-transform duration-150"
        style={{
          transform: `translateX(-${offset}px)`, // move from right to left
        }}
      >
        ←
      </div>
    </div>
  );
};

export default SwipeToFriends;
