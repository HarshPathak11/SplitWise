import React from 'react';
import { Link , useNavigate} from 'react-router-dom';

const SignUp = () => {

  const [name,setName]=React.useState();
  const [email,setEmail]=React.useState();
  const [password,setPassword]=React.useState();
  const [no,setNo]=React.useState();
  const navigate=useNavigate()
  
async function handleSubmit(event){
  const response=await fetch("http://localhost:8000/logup",{
    method:'POST',
    headers: {
          'Content-Type': 'application/json' // Specify the content type as JSON
        },
    body: JSON.stringify({
          username:name,
          email: email,
          password: password
        })
  })
  if(response.ok){
    return navigate(`/dash/${encodeURIComponent(email)}`);
  }
}
return (
    // <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="relative w-full max-w-sm p-8 bg-slate-500 rounded-lg shadow-md overflow-hidden">
        
        <div className="absolute inset-x-0 top-0 -translate-y-1/2 flex justify-center">
          <div className=" w-96 h-96 bg-slate-800 rounded-full"></div>
        </div>

        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6 mt-16">
            <div className="text-2xl font-bold text-white">SIGN UP</div>
            <Link to='/login'><div className="text-xl text-white cursor-pointer">LOGIN</div></Link>
          </div>
          <form onSubmit={handleSubmit}>
          <div className="mb-4">
           <label className="block text-white text-sm font-bold mb-2" htmlFor="name">
             Name
          </label>
            <input
              id="name"
              value={name}
              onChange={(event)=>setName(event.target.value)}
              type="text"
              placeholder="Name"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:shadow-outline"
            />
           </div>
          <div className="mb-4">
            <label className="block text-white text-sm font-bold mb-2" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event)=>setEmail(event.target.value)}
              placeholder="Email Address"
              className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:shadow-outline"
            />
         </div>
           <div className="mb-4">
           <label className="block text-white text-sm font-bold mb-2" htmlFor="password">
             Password
             </label>
             <input
              id="password"
              type="password"
              value={password}
              onChange={(event)=>setPassword(event.target.value)}
              placeholder="Password"
              className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:shadow-outline"
            />
          </div>
         <div className="mb-6">
           <label className="block text-white text-sm font-bold mb-2" htmlFor="phone">
             Phone Number
         </label>
            <input
              id="phone"
              type="tel"
              value={no}
              onChange={(event)=>setNo(event.target.value)}
              placeholder="Phone Number"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:shadow-outline"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:shadow-outline"
          >            Sign Up
          </button>
        </form>
          <div className="flex justify-center items-center mt-6 space-x-4">
            <button className="flex items-center justify-center w-12 h-12 bg-white border rounded-full shadow-md hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chrome"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="21.17" x2="12" y1="8" y2="8"/><line x1="3.95" x2="8.54" y1="6.06" y2="14"/><line x1="10.88" x2="15.46" y1="21.94" y2="14"/></svg>
            </button>
            <button className="flex items-center justify-center w-12 h-12 bg-white border rounded-full shadow-md hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chrome"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="21.17" x2="12" y1="8" y2="8"/><line x1="3.95" x2="8.54" y1="6.06" y2="14"/><line x1="10.88" x2="15.46" y1="21.94" y2="14"/></svg>
            </button>
          </div>
        </div>
      </div>
    // </div>
  );
};


export default SignUp;
