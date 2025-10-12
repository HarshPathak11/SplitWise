import React from "react";
import { motion } from "framer-motion";

const Documentation = () => {
  const sections = [
    {
      id: 1,
      title: "Fair AI",
      description:
        "FairFare AI is an advanced feature that leverages artificial intelligence to enhance user experience. It provides personalized insights, recommendations, and automated expense tracking, making financial management smarter and more efficient.",
        video: "FairAIVideo.mp4",
    },
    {
      id: 2,
      title: "Interactive Card",
      description:
        "FairFare Card provides an intuitive and interactive way to manage your expenses. With its sleek design and user-friendly interface, it allows you to track, organize, and visualize your financial data effortlessly, making group expense management seamless and efficient. Add your UPI ID to the card and make payments directly from the app.",
      video: "CardVideo.mp4"
    },
    {
      id: 3,
      title: "Expenses Section",
      description:
        "The Expenses Section is a dedicated area within the FairFare dashboard where users can view, and manage their expenses. It provides a clear overview of all transactions, allowing users to categorize and analyze their spending patterns effectively.",
      video: "RecentExpensesVideo.mp4",
    },
    {
      id: 4,
      title: "Trips and Events Section",
      description:
        "The Trips and Events Section is a specialized feature within the FairFare dashboard that enables users to plan, manage, and track expenses related to specific trips or events. It offers tools for budgeting, expense sharing, and real-time updates, ensuring a smooth experience for group outings.",
      video: "TripsSectionVideo.mp4",
    },
    {
      id: 5,
      title: "Trip Details Section",
      description:
        "The Trip Details feature provides users with a comprehensive view of all expenses related to a specific trip or event. It allows for detailed tracking, categorization, and sharing of expenses among group members, ensuring transparency and accountability.",
      video: "TripVideo.mp4",
    },
    {
      id: 6,
      title: "Friends Section",
      description:
        "The Friends Section is a dedicated area within the FairFare platform that allows users to manage their connections and interactions with friends. It provides tools for adding, removing, and organizing friends, making it easier to share expenses and plan group activities.",
      video: "FriendsSectionVideo.mp4",
    },
    {
      id: 8,
      title: "Add Friends Section",
      description:
        "The Add Friends feature enables users to easily connect with their friends on the FairFare platform. It simplifies the process of inviting and managing friends, enhancing the social aspect of expense sharing and group activities.",
      video: "AddFriendsVideo.mp4",
    },
  ];

  const fadeUpVariant = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white py-10 px-4 sm:px-6 lg:px-8">
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-4xl font-bold text-center mb-10 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500"
      >
        Have a detailed tour of your personal dashboard
      </motion.h1>

      <div className="space-y-16">
        {sections.map((section, index) => (
          <motion.div
            key={section.id}
            variants={fadeUpVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className={`flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-10 ${
              index % 2 === 0 ? "" : "md:flex-row-reverse"
            }`}
          >
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full md:w-1/2"
            >
              <video src={section.video} autoPlay loop muted/>
            </motion.div>

            {/* Text */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="w-full md:w-1/2"
            >
              <h2 className="text-2xl font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-400">
                {section.title}
              </h2>
              <p className="text-gray-400">{section.description}</p>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  );

};

export default Documentation;
