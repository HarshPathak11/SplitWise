import { useState } from 'react'
import SignIn from './components/signin'
import SignUp from './components/signup'
import { BrowserRouter,Route,Routes,Link } from "react-router-dom";
import Dashboard from './components/DashBoard';
import LandingPage from './components/home';


function App() {
  

  return (
    <>
    <BrowserRouter>
    <Routes>
     <Route path='/login' element={<SignIn/>}/>
     <Route path='/logup' element={<SignUp/>}/>
     <Route path='/' element={<Dashboard />}/>
     <Route path='/home' element={<LandingPage />}/>
    </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
