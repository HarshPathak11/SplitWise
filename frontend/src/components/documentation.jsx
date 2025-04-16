import React from "react";

const Documentation = () => {
  const sections = [
    {
      id: 1,
      title: "Interactive Card",
      description:
        "FairFare Card provides an intuitive and interactive way to manage your expenses. With its sleek design and user-friendly interface, it allows you to track, organize, and visualize your financial data effortlessly, making group expense management seamless and efficient.",
      image: "./FairFare card.png",
    },
    {
      id: 2,
      title: "Expenses Section",
      description:
        "The Expenses Section is a dedicated area within the FairFare dashboard where users can view, and manage their expenses. It provides a clear overview of all transactions, allowing users to categorize and analyze their spending patterns effectively.",
      image: "./RecentExpenses.png",
    },
    {
      id: 3,
      title: "Trips and Events Section",
      description:
        "The Trips and Events Section is a specialized feature within the FairFare dashboard that enables users to plan, manage, and track expenses related to specific trips or events. It offers tools for budgeting, expense sharing, and real-time updates, ensuring a smooth experience for group outings.",
      image: "./Trips snd events.png",
    },
    {
      id: 4,
      title: "Trip Details Section",
      description:
        "The Trip Details feature provides users with a comprehensive view of all expenses related to a specific trip or event. It allows for detailed tracking, categorization, and sharing of expenses among group members, ensuring transparency and accountability.",
      image: "./Trip Details.png",
    },
    {
      id: 5,
      title: "Friends Section",
      description:
        "The Friends Section is a dedicated area within the FairFare platform that allows users to manage their connections and interactions with friends. It provides tools for adding, removing, and organizing friends, making it easier to share expenses and plan group activities.",
      image: "./Friends Section.png",
    },
    {
      id: 6,
      title: "Friend's Details Section",
      description:
        "The Friend Card feature allows users to view and manage their friends' expenses in a visually appealing format. It provides a snapshot of each friend's spending habits, making it easier to track shared expenses and settle up after group outings.",
      image: "./Friend Card.png",
    },
    {
      id: 7,
      title: "Add Friends Section",
      description:
        "The Add Friends feature enables users to easily connect with their friends on the FairFare platform. It simplifies the process of inviting and managing friends, enhancing the social aspect of expense sharing and group activities.",
      image: "./Add Friends.png",
    },
  ];

  return (
    <div className="min-h-screen bg-[#000000] text-white py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-center mb-10 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
      Have a detailed tour of your personal dashboard
      </h1>
      <div className="space-y-10">
        {sections.map((section, index) => (
          <div
            key={section.id}
            className={`flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-10 ${
              index % 2 === 0 ? "" : "md:flex-row-reverse"
            }`}
          >
            {/* Photo Section */}
            <div className="w-full md:w-1/2">
              <img
                src={section.image}
                alt={section.title}
                className="rounded-lg shadow-lg hover:scale-105 transition-transform duration-300"
              />
            </div>
            {/* Description Section */}
            <div className="w-full md:w-1/2">
              <h2 className="text-2xl font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-400">
                {section.title}
              </h2>
              <p className="text-gray-400">{section.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Documentation;
