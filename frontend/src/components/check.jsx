import React from 'react';

const ComparisonTable = () => {
  return (
    <div className="bg-black text-white py-10 px-4 lg:px-20">
      <div className="max-w-5xl mx-auto">
        {/* Table Header */}
        <div className="grid grid-cols-3 gap-4 text-center mb-6">
          <div></div>
          <div className="text-lg font-semibold">BillSplit</div>
          <div className="text-lg font-semibold">SplitWise</div>
        </div>

        {/* Table Rows */}
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>No monthly fees or minimum balance</div>
            <div className="text-green-500 text-xl">✔️</div>
            <div className="text-green-500 text-xl">🔒</div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>Make unlimited payments with no limits</div>
            <div className="text-green-500 text-xl">✔️</div>
            <div className="text-green-500 text-xl">🔒</div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>Rewards, cash back & card perks</div>
            <div className="text-green-500 text-xl">✔️</div>
            <div className="text-green-500 text-xl">✔️</div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>Hasslefree Payment Tracking and budget management</div>
            <div className="text-green-500 text-xl">✔️</div>
            <div className="text-green-500 text-xl">✔️</div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>Build credit history from Day 1</div>
            <div className="text-green-500 text-xl">✔️</div>
            <div className="text-gray-500 text-xl">🔒</div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>No credit check required for sign-up</div>
            <div className="text-green-500 text-xl">✔️</div>
            <div className="text-gray-500 text-xl">🔒</div>
          </div>
        </div>

        {/* Footer */}
        <div className="grid grid-cols-3 mt-10 text-3xl font-bold text-center">
          <div>Cost per year</div>
          <div>
          <div className="text-centre">$0 <p className='text-sm text-gray-500'>forever</p></div> </div>
          <div>
          <div className="text-centre">$39.99 <p className='text-sm text-gray-500'>yearly</p></div> </div>    
        </div>
      </div>
    </div>
  );
};

export default ComparisonTable;
