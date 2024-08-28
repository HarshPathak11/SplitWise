import React from 'react';
import ProfileCard from './profilecard';
import EventCard from './eventsCard';


const Dashboard = () => {
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'https://via.placeholder.com/150',
  };

  const events = [
    {
      title: 'Dinner at ABC Restaurant',
      payer: 'John Doe',
      amount: 120,
      participants: ['Jane Doe', 'Mike Ross', 'Rachel Zane'],
    },
    {
      title: 'Movie Night',
      payer: 'Jane Doe',
      amount: 45,
      participants: ['John Doe', 'Harvey Specter'],
    },
  ];

  const friends = ['Jane Doe', 'Mike Ross', 'Rachel Zane', 'Harvey Specter'];

  return (
    <div className="min-h-screen bg-slate-800 p-8">
      <div className="flex flex-col md:flex-row md:space-x-4">
        <ProfileCard name={user.name} email={user.email} avatar={user.avatar} />
        <div className="flex flex-col space-y-4 mt-4 md:mt-0">
          {events.map((event, index) => (
            <EventCard
              key={index}
              title={event.title}
              payer={event.payer}
              amount={event.amount}
              participants={event.participants}
            />
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-700 mb-4">Friends</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {friends.map((friend, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-lg shadow-md text-center text-gray-600"
            >
              {friend} owes you $500
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
