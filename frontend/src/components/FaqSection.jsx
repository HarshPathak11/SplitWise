import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Wallet,
  PiggyBank,
  Smartphone,
  Mail,
  ChevronDown,
  ShieldCheck,
  Zap,
} from "lucide-react";

const faqs = [
  {
    id: 1,
    q: "Is FairFare completely free?",
    a: "Zero hidden fees. We believe splitting bills should cost nothing. We don't charge for transactions, groups, or monthly subscriptions. It's truly free financial freedom.",
    icon: ShieldCheck,
    color: "from-green-400 to-emerald-600",
  },
  {
    id: 2,
    q: "How does the friend invite system work?",
    a: "It's instant. Use our 'Quick Add' feature to scan a QR code or send a magic link via WhatsApp/iMessage. Once they click, they are instantly added to your expense group.",
    icon: Mail,
    color: "from-blue-400 to-indigo-600",
  },
  {
    id: 3,
    q: "Can I split uneven bills easily?",
    a: "Absolutely. Whether it's by percentage, shares, or exact amounts, our 'Smart Split' engine handles the math. You just enter the numbers, we handle the debt.",
    icon: PiggyBank,
    color: "from-purple-400 to-pink-600",
  },
  {
    id: 4,
    q: "Are payments handled in-app?",
    a: "We bridge the gap. Copy your friend's UPI ID with one tap and launch your preferred payment app (GPay, PhonePe, Paytm) directly from our interface.",
    icon: Smartphone,
    color: "from-yellow-400 to-orange-600",
  },
  {
    id: 5,
    q: "Is my financial data secure?",
    a: "Security is our bedrock. We use bank-grade encryption for all data storage. Your transaction history stays private and is only visible to the people you choose to share it with.",
    icon: Wallet,
    color: "from-cyan-400 to-blue-600",
  },
];

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="relative w-full py-24 px-4 md:px-0">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent blur-3xl" />
      </div>

      <div className="container mx-auto max-w-5xl relative z-10 flex flex-col md:flex-row gap-12 lg:gap-20">
        {/* LEFT SIDE: The Header & Active Visual */}
        <div className="md:w-1/3 flex flex-col justify-start">
          <div className="sticky top-24">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 mb-6"
            >
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-indigo-400 uppercase tracking-widest text-xs font-bold">
                Support Terminal
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight"
            >
              Common <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                Queries
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-slate-400 text-lg mb-8"
            >
              Everything you need to know about the platform. Can't find the
              answer? Contact our 24/7 support.
            </motion.p>

            {/* Dynamic Icon Display */}
            <div className="relative w-full aspect-square max-w-[200px] hidden md:flex items-center justify-center bg-slate-900/50 rounded-3xl border border-white/10 backdrop-blur-xl overflow-hidden">
              {/* Background Glow based on active item */}
              <motion.div
                key={`glow-${activeIndex}`}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`absolute inset-0 opacity-20 bg-gradient-to-br ${faqs[activeIndex].color} blur-2xl`}
              />

              {/* Icon Transition */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ y: 20, opacity: 0, rotateX: -90 }}
                  animate={{ y: 0, opacity: 1, rotateX: 0 }}
                  exit={{ y: -20, opacity: 0, rotateX: 90 }}
                  transition={{ duration: 0.4 }}
                >
                  {React.createElement(faqs[activeIndex].icon, {
                    size: 64,
                    className:
                      "text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]",
                  })}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: The Interactive List */}
        <div className="md:w-2/3 flex flex-col gap-4">
          {faqs.map((faq, index) => {
            const isActive = activeIndex === index;
            const Icon = faq.icon;

            return (
              <motion.div
                key={faq.id}
                onClick={() => setActiveIndex(index)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`group relative cursor-pointer border rounded-2xl overflow-hidden transition-all duration-500 ${
                  isActive
                    ? "bg-slate-900/40 border-indigo-500/30 shadow-[0_0_30px_-10px_rgba(99,102,241,0.3)]"
                    : "bg-slate-900/20 border-white/5 hover:bg-slate-800/40 hover:border-white/10"
                }`}
              >
                {/* Active Indicator Bar (Left side) */}
                <motion.div
                  className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${faq.color}`}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{
                    opacity: isActive ? 1 : 0,
                    height: isActive ? "100%" : "0%",
                  }}
                  transition={{ duration: 0.3 }}
                />

                <div className="p-6 md:p-8">
                  {/* Question Header */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {/* Mobile Icon (Visible only on small screens) */}
                      <div
                        className={`md:hidden p-2 rounded-lg bg-white/5 ${
                          isActive ? "text-indigo-400" : "text-slate-500"
                        }`}
                      >
                        <Icon size={20} />
                      </div>

                      <h3
                        className={`text-lg md:text-xl font-semibold transition-colors duration-300 ${
                          isActive
                            ? "text-white"
                            : "text-slate-400 group-hover:text-slate-200"
                        }`}
                      >
                        {faq.q}
                      </h3>
                    </div>

                    {/* Arrow / Plus */}
                    <motion.div
                      animate={{ rotate: isActive ? 180 : 0 }}
                      className={`flex-shrink-0 text-slate-500 ${
                        isActive ? "text-indigo-400" : ""
                      }`}
                    >
                      <ChevronDown />
                    </motion.div>
                  </div>

                  {/* Answer Content */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ height: 0, opacity: 0, marginTop: 0 }}
                        animate={{ height: "auto", opacity: 1, marginTop: 16 }}
                        exit={{ height: 0, opacity: 0, marginTop: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <p className="text-slate-400 leading-relaxed text-base md:text-lg border-t border-white/5 pt-4">
                          {faq.a}
                        </p>

                        {/* Optional: "Helpful?" Micro-interaction */}
                        <div className="flex items-center gap-2 mt-4 pt-2">
                          <span className="text-xs font-mono text-indigo-400/60 uppercase">
                            System Answer • 0.02s
                          </span>
                          <div className="h-px flex-grow bg-gradient-to-r from-indigo-500/20 to-transparent"></div>
                          <Zap
                            size={14}
                            className="text-indigo-400"
                            fill="currentColor"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
