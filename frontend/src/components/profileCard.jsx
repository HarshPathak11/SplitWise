import React from 'react';

const ProfileCard = ({ name, email, avatar }) => {
  return (
    <div className="bg-gradient-to-r from-slate-900 to-blue-500 text-white rounded-lg shadow-lg p-6 w-full md:w-1/4">
      <div className="flex items-center space-x-4">
        <img
          className="w-16 h-16 rounded-full border-2 border-white"
          src={avatar}
          alt="User Avatar"
        />
        <div>
          <h2 className="text-xl font-bold">{name}</h2>
          <p className="text-sm">{email}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
