import React from "react";
import { motion } from "framer-motion";

const Documentation = () => {
  const sections = [
    {
      id: 1,
      title: "Fair AI Assistant",
      description:
        "Experience financial clarity with our advanced AI. It analyzes your spending habits to provide personalized insights, smart recommendations, and automated categorization.",
      video: "FairAIVideo.mp4",
    },
    {
      id: 2,
      title: "Interactive Cards",
      description:
        "Manage expenses with a tactile, intuitive card interface. Visualize your financial data effortlessly and link your UPI ID for instant, direct payments within the app.",
      video: "CardVideo.mp4",
    },
    {
      id: 3,
      title: "Expense Analytics",
      description:
        "A dedicated command center for your finances. View clear overviews of all transactions, analyze spending patterns, and maintain total control over your budget.",
      video: "RecentExpensesVideo.mp4",
    },
    {
      id: 4,
      title: "Event Management",
      description:
        "Planning a group trip or a night out? Create specialized event dashboards to budget, share expenses, and track real-time updates with your group.",
      video: "TripsSectionVideo.mp4",
    },
    {
      id: 5,
      title: "Trip Details",
      description:
        "Dive deep into specific events. Track who paid what, manage split ratios, and ensure total transparency and accountability among all members.",
      video: "TripVideo.mp4",
    },
    {
      id: 6,
      title: "Social Connections",
      description:
        "Finance is social. The Friends Section lets you manage connections, invite new peers, and settle up debts instantly without the awkward conversations.",
      video: "FriendsSectionVideo.mp4",
    },
    {
      id: 7,
      title: "Instant Invites",
      description:
        "Onboarding your squad is seamless. Use our streamlined invite system to connect your contact list to the FairFare ecosystem in seconds.",
      video: "AddFriendsVideo.mp4",
    },
  ];

  return (
    <section className="relative w-full py-24 lg:py-32 overflow-hidden">
      {/* Background Ambience (Subtle blending) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] right-[0%] w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[10%] left-[0%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-24 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 mb-6 border border-indigo-500/30 rounded-full bg-indigo-500/10"
          >
            <span className="text-indigo-300 text-xs font-bold tracking-widest uppercase">
              Product Tour
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-500 tracking-tight"
          >
            Master your Dashboard.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-lg text-slate-400"
          >
            Take a detailed look at the tools designed to simplify your
            financial life.
          </motion.p>
        </div>

        {/* Content Loop */}
        <div className="space-y-32">
          {sections.map((section, index) => (
            <motion.div
              key={section.id}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
                },
              }}
              className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-24 ${
                index % 2 === 1 ? "lg:flex-row-reverse" : ""
              }`}
            >
              {/* Visual Side (Video) */}
              <div className="w-full lg:w-1/2 group">
                <div className="relative rounded-2xl p-2 bg-gradient-to-br from-white/10 to-white/0 border border-white/10 shadow-2xl backdrop-blur-sm transition-transform duration-500 group-hover:scale-[1.02]">
                  {/* Glow behind video */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>

                  <div className="relative rounded-xl overflow-hidden aspect-video bg-slate-900">
                    <video
                      src={section.video}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                    />
                    {/* Glass Overlay for sheen */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none"></div>
                  </div>
                </div>
              </div>

              {/* Text Side */}
              <div className="w-full lg:w-1/2 relative">
                {/* Large Background Number */}
                <span className="absolute -top-20 -left-6 text-[180px] font-bold text-white/[0.03] pointer-events-none select-none leading-none font-mono">
                  0{index + 1}
                </span>

                <div className="relative z-10 pl-4">
                  <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                    {section.title}
                  </h2>
                  <p className="text-slate-400 text-lg leading-relaxed font-light">
                    {section.description}
                  </p>

                  {/* Decorative separator */}
                  <div className="w-12 h-1 bg-gradient-to-r from-indigo-500 to-blue-500 mt-8 rounded-full"></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Documentation;
