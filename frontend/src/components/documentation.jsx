import React from "react";

const Documentation = () => {
  const sections = [
    {
      id: 1,
      title: "Feature 1",
      description: "Description for Feature 1",
      image: "path/to/image1.jpg",
    },
    {
      id: 2,
      title: "Feature 2",
      description: "Description for Feature 2",
      image: "path/to/image2.jpg",
    },
    {
      id: 3,
      title: "Feature 3",
      description: "Description for Feature 3",
      image: "path/to/image3.jpg",
    },
    {
      id: 4,
      title: "Feature 4",
      description: "Description for Feature 4",
      image: "path/to/image4.jpg",
    },
    {
      id: 5,
      title: "Feature 5",
      description: "Description for Feature 5",
      image: "path/to/image5.jpg",
    },
    {
      id: 6,
      title: "Feature 6",
      description: "Description for Feature 6",
      image: "path/to/image6.jpg",
    },
    {
      id: 7,
      title: "Feature 7",
      description: "Description for Feature 7",
      image: "path/to/image7.jpg",
    },
  ];

  return (
    <div className="min-h-screen bg-[#000000] text-white py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-center mb-10 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
        Website Documentation
      </h1>
      <div className="space-y-10">
        {sections.map((section) => (
          <div
            key={section.id}
            className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-10"
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
