import React from 'react';

const EventCard = ({ title, payer, amount, participants }) => {
  return (
    <div className="bg-white bg-opacity-25 rounded-lg shadow-lg p-6 mb-4 w-full md:w-3/4 transform transition-transform hover:scale-105">
      <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
      <div className="flex flex-col md:flex-row items-center justify-between text-white">
        <p className="text-lg m-1">
          <strong>{payer}</strong> paid <strong>${amount}</strong>
        </p>
        <p className="text-sm bg-white bg-opacity-25 px-2 py-1 rounded-lg m-1">
          Participants: {participants.join(', ')}
        </p>
      </div>
      <div className="mt-4">
        <p className="text-sm text-gray-200 italic">
          <span className="font-semibold text-yellow-300">Note:</span> Be sure to settle the payments!
        </p>
      </div>
    </div>
  );
};

export default EventCard;

