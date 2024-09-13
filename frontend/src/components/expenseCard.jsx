import React, { useState } from 'react';

const ExpenseCard = ({ category, time, description, amount, iconColor, paidBy, beneficiaries }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div 
      className="flex flex-col bg-gray-800 p-4 rounded-lg mb-4 cursor-pointer transition-all duration-300 ease-in-out"
      onClick={handleToggle}
    >
      {/* Main card content */}
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className={`${iconColor} p-3 rounded-full`}></div>
          <div className="ml-4">
            <h3 className="font-semibold">{category}</h3>
            <p className="text-sm text-gray-400">{time} &bull; {description}</p>
          </div>
        </div>
        <div className="text-lg font-semibold">{amount}</div>
      </div>

      {/* Expanded section */}
      {isExpanded && (
        <div className="mt-4 bg-gray-900 p-4 rounded-lg">
          <p className="text-gray-300 mb-2">
            <strong>Paid by:</strong> {paidBy}
          </p>
          <p className="text-gray-300 mb-2">
            <strong>Beneficiaries:</strong>
          </p>
          <ul className="text-gray-400">
            {beneficiaries.map((person, index) => (
              <li key={index} className="ml-4 list-disc">{person}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ExpenseCard;
