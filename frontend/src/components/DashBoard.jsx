import React from 'react';
import ExpenseCard from './expenseCard';
import {useParams} from 'react-router-dom'

const Dashboard = () => {
  const [friends,setFriends]=React.useState([]);
  const [groups,setGroups]=React.useState([]);
  const [name,setName]=React.useState("");

  // const {email}=useParams();
  

  // React.useEffect(async()=>{
  //   const response= await fetch('http://localhost:8000/user',{
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json' // Specify the content type as JSON
  //     },
  //     body: JSON.stringify({
  //       email: email,
  //     })
  //   });
  //   if(response.ok){
  //     const data=await response.json()
  //     setName(data.username);
  //     setGroups(data.groups);
  //     setFriends(data.friends);
  //   }
  //   // else
  //   // alert("oops");
  // },[friends])

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
                  <h2 className="text-xl font-bold">Name : {name}</h2>
                  <p className="text-sm">Email :</p>
                </div>
              </div>
            </div> {/* Placeholder for a graph */}
          </div>

          {/* Today's expenses */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Today</h2>
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

