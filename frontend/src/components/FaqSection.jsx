import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Wallet2,
  PiggyBank,
  Coins,
  DollarSign,
  Receipt,
} from "lucide-react";

// Notes Data
const notes = [
  {
    q: "Is FairFare really free?",
    a: "Yes! We don't charge any fees for basic bill splitting. Premium features available for power users.",
    color: "bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a]",
    icon: CreditCard,
    amount: "$0",
    cardNumber: "**** **** **** 0000",
  },
  {
    q: "How do I settle with friends?",
    a: "Choose your preferred payment method - bank transfer, UPI, or cash. We'll track everything automatically.",
    color: "bg-gradient-to-br from-[#1f1f1f] to-[#2d2d2d]",
    icon: Wallet2,
    amount: "₹500",
    cardNumber: "**** **** **** 1234",
  },
  {
    q: "Can I split uneven bills?",
    a: "Absolutely! Split by exact amounts, percentages, or shares. Perfect for group dinners and trips.",
    color: "bg-gradient-to-br from-[#242424] to-[#303030]",
    icon: PiggyBank,
    amount: "30%",
    cardNumber: "**** **** **** 5678",
  },
  {
    q: "What payment methods work?",
    a: "We support all major payment methods including credit cards, bank transfers, and digital wallets.",
    color: "bg-gradient-to-br from-[#292929] to-[#333333]",
    icon: DollarSign,
    amount: "24h",
    cardNumber: "**** **** **** 9012",
  },
  {
    q: "How are disputes handled?",
    a: "Our support team resolves disputes within 24 hours with full transaction history and receipts.",
    color: "bg-gradient-to-br from-[#2e2e2e] to-[#363636]",
    icon: Receipt,
    amount: "100%",
    cardNumber: "**** **** **** 3456",
  },
];

// FloatingCoin Component
function FloatingCoin({ className = "", delay = 0 }) {
  return (
    <motion.div
      className={`absolute ${className}`}
      initial={{ y: 0, scale: 0.8, opacity: 0.6 }}
      animate={{
        y: [-20, 20, -20],
        scale: [0.8, 1, 0.8],
        opacity: [0.6, 1, 0.6],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    >
      <Coins className="w-8 h-8 text-yellow-400/80" />
    </motion.div>
  );
}

// Helper Functions
const getCardPosition = (index, offset, notesLength) => {
  const adjustedIndex = (index - offset + notesLength) % notesLength;
  const baseLeft = 10;
  const spacing = 20;
  const baseTop = 0;
  const verticalSpacing = 80;

  return {
    left: `${baseLeft + adjustedIndex * spacing}%`,
    top: `${baseTop + adjustedIndex * verticalSpacing}px`,
    zIndex: notesLength - adjustedIndex,
  };
};

export default function FAQ() {
  const [selectedNote, setSelectedNote] = useState(null);
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);

  // Auto scroll effect
  useEffect(() => {
    if (!isDragging) {
      const interval = setInterval(() => {
        setOffset((prev) => (prev + 1) % notes.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isDragging]);

  // Drag Handlers
  const handleDragStart = (e) => {
    setIsDragging(true);
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    setStartX(clientX);
    setCurrentX(clientX);
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    setCurrentX(clientX);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const diff = currentX - startX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        setOffset((prev) => (prev - 1 + notes.length) % notes.length);
      } else {
        setOffset((prev) => (prev + 1) % notes.length);
      }
    }
  };

  return (
    <div className="min-h-screen text-white overflow-hidden">
      <div className="relative max-w-6xl px-4 py-24">
        {/* Floating Coins */}
        <FloatingCoin className="left-1/4 top-12" delay={0} />
        <FloatingCoin className="right-1/4 top-24" delay={1.5} />
        <FloatingCoin className="left-1/3 bottom-24" delay={1} />
        <FloatingCoin className="right-1/4 bottom-12" delay={2} />

        {/* Header */}
        <div className="text-center mb-24 lg:ml-10 xl:ml-80">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-block p-3 rounded-full bg-gradient-to-r from-emerald-500/20 to-green-500/20 mb-8"
          >
            <Wallet2 className="w-16 h-16 text-emerald-400" />
          </motion.div>
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent"
          >
            Smart Money, Simple Answers
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-400 max-w-2xl mx-auto text-lg"
          >
            Everything you need to know about managing your money with friends
          </motion.p>
        </div>

        {/* Cards Container */}
        <div
          className="relative max-w-[900px] h-[500px] perspective-1000 touch-pan-x"
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
        >
          <AnimatePresence>
            {notes.map((note, idx) => {
              const isSelected = selectedNote === idx;
              const Icon = note.icon;
              const position = getCardPosition(idx, offset, notes.length);

              return (
                <motion.div
                  key={idx}
                  className="absolute w-[360px] cursor-pointer preserve-3d"
                  style={{
                    ...position,
                    transition: isDragging ? "none" : "all 0.5s ease-out",
                  }}
                  initial={{
                    opacity: 0,
                    x: -100,
                    rotateY: -15,
                  }}
                  animate={{
                    opacity: 1,
                    x: isDragging ? currentX - startX : 0,
                    rotateY: isSelected ? 180 : -15,
                    scale: isSelected ? 1.05 : 1,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 100,
                    damping: 15,
                    delay: idx * 0.1,
                  }}
                  onClick={() => setSelectedNote(isSelected ? null : idx)}
                >
                  {/* Front of Card */}
                  <motion.div
                    className={`absolute inset-0 h-[200px] rounded-2xl ${note.color} p-6 flex flex-col justify-between backface-hidden shadow-lg border border-gray-700`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-4">
                        <Icon className="w-8 h-8 text-emerald-400" />
                        <div className="font-mono text-sm text-gray-400">
                          {note.cardNumber}
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-2xl font-bold text-emerald-400">
                          {note.amount}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 opacity-50 mt-2" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-emerald-400 mb-1">
                        {note.q}
                      </h3>
                      <p className="text-sm text-gray-400">Tap to flip</p>
                    </div>
                  </motion.div>

                  {/* Back of Card */}
                  <motion.div className="absolute inset-0 h-[200px] rounded-2xl bg-gray-800 p-6 flex flex-col justify-between backface-hidden shadow-lg rotate-y-180 border border-gray-700">
                    <div className="h-8 w-full bg-gray-700/50 rounded" />
                    <p className="text-gray-200 text-lg leading-relaxed">
                      {note.a}
                    </p>
                    <p className="text-sm text-gray-400 self-end">
                      Tap to flip back
                    </p>
                  </motion.div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
}
