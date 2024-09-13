// import React from 'react';
// import ProfileCard from './profilecard';
// import EventCard from './eventsCard';


// const Dashboard = () => {
//   const user = {
//     name: 'John Doe',
//     email: 'john.doe@example.com',
//     avatar: 'https://via.placeholder.com/150',
//   };

//   const events = [
//     {
//       title: 'Dinner at ABC Restaurant',
//       payer: 'John Doe',
//       amount: 120,
//       participants: ['Jane Doe', 'Mike Ross', 'Rachel Zane'],
//     },
//     {
//       title: 'Movie Night',
//       payer: 'Jane Doe',
//       amount: 45,
//       participants: ['John Doe', 'Harvey Specter'],
//     },
//   ];

//   const friends = ['Jane Doe', 'Mike Ross', 'Rachel Zane', 'Harvey Specter'];

//   return (
//     <div className="min-h-screen bg-slate-800 p-8">
//       <div className="flex flex-col flex-row md:flex-row md:space-x-4 ">
//         <ProfileCard name={user.name} email={user.email} avatar={user.avatar} />
//         <div className="flex flex-col space-y-4 mt-4 md:mt-0">
//           {events.map((event, index) => (
//             <EventCard
//               key={index}
//               title={event.title}
//               payer={event.payer}
//               amount={event.amount}
//               participants={event.participants}
//             />
//           ))}
//         </div>
//       </div>

//       <div className="mt-8">
//         <h2 className="text-xl font-bold text-gray-700 mb-4">Friends</h2>
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           {friends.map((friend, index) => (
//             <div
//               key={index}
//               className="bg-white p-4 rounded-lg shadow-md text-center text-gray-600"
//             >
//               {friend} owes you $500
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;
import React from 'react';
import ExpenseCard from './expenseCard';

const Dashboard = () => {
  return (
    <div className="bg-gray-900 text-white min-h-screen p-6">
      {/* Main container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left side: Expenses */}
        <div className="md:col-span-2">
          {/* Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold">SplitIt</h1>
            <p className="text-gray-400">DashBoard</p>
          </div>

          {/* Graph placeholder */}
          <div className="bg-gray-800 p-4 rounded-lg mb-6">
            <div className="h-24 bg-gray-700 rounded-lg p-3">
              {/* <h4 className=' font-bold p-2'>Name: User123</h4>
              <h5 className='font-bold p-2'>Email : londa@123</h5> */}
              <div className="flex items-center space-x-4">
                <img
                  className="w-16 h-16 rounded-full border-2 border-white"
                  src='https://via.placeholder.com/150'
                  alt="User Avatar"
                />
                <div>
                  <h2 className="text-xl font-bold">Name : user@123</h2>
                  <p className="text-sm">Email : lodu@1233</p>
                </div>
              </div>
            </div> {/* Placeholder for a graph */}
          </div>

          {/* Today's expenses */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Today</h2>
            {/* <ExpenseCard
              category="Grocery"
              time="5:12 pm"
              description="Belanja di pasar"
              amount="-326.800"
              iconColor="bg-blue-500"
            />
            <ExpenseCard
              category="Transportation"
              time="5:12 pm"
              description="Naik bus umum"
              amount="-15.000"
              iconColor="bg-purple-500"
            />
            <ExpenseCard
              category="Housing"
              time="5:12 pm"
              description="Bayar Listrik"
              amount="-185.750"
              iconColor="bg-orange-500"
            /> */}
            <ExpenseCard
              category="Grocery"
              time="5:12 pm"
              description="Belanja di pasar"
              amount="-326.800"
              iconColor="bg-blue-500"
              paidBy="John Doe"
              beneficiaries={['Alice', 'Bob', 'Charlie']}
            />
            <ExpenseCard
              category="Transportation"
              time="5:12 pm"
              description="Naik bus umum"
              amount="-15.000"
              iconColor="bg-purple-500"
              paidBy="Jane Smith"
              beneficiaries={['John', 'Alice']}
            />
          </div>
        </div>

        {/* Right side: Friends */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Friends</h2>
          <FriendCard
            name="John Doe"
            amountOwed="250.00"
          />
          <FriendCard
            name="Jane Smith"
            amountLent="180.00"
          />
          <FriendCard
            name="Alice Johnson"
            amountOwed="75.00"
          />
        </div>
      </div>
    </div>
  );
};

// Expense Card Component
// const ExpenseCard = ({ category, time, description, amount, iconColor }) => {
//   return (
//     <div className="flex justify-between items-center mb-4 bg-gray-800 p-4 rounded-lg">
//       <div className="flex items-center">
//         <div className={`${iconColor} p-3 rounded-full`}></div>
//         <div className="ml-4">
//           <h3 className="font-semibold">{category}</h3>
//           <p className="text-sm text-gray-400">{time} &bull; {description}</p>
//         </div>
//       </div>
//       <div className="text-lg font-semibold">{amount}</div>
//     </div>
//   );
// };

// Friend Card Component
const FriendCard = ({ name, amountOwed, amountLent }) => {
  return (
    <div className="flex justify-between items-center mb-4 p-4 bg-gray-700 rounded-lg">
      <div>
        <h3 className="font-semibold">{name}</h3>
        {amountOwed && <p className="text-sm text-red-500">Owes you: ${amountOwed}</p>}
        {amountLent && <p className="text-sm text-green-500">You lent: ${amountLent}</p>}
      </div>
    </div>
  );
};

export default Dashboard;

