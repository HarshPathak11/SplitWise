import { useState } from 'react'
import SignIn from './components/signin'
import SignUp from './components/signup'
import { BrowserRouter,Route,Routes,Link } from "react-router-dom";
// import Dashboard from './components/DashBoard';
import LandingPage from './components/home';
import LandingSignin from './components/landingpage';
import LandingSignup from './components/register';
import ProfileEdit from './components/full-page/Profile';
import CashMapAI from './components/full-page/CashMapAI';
import Dashboard from './components/full-page/DashBoard';



function App() {
  

  return (
    <>
    <BrowserRouter>
    <Routes>
     <Route path='/login' element={<LandingSignin/>}/>
     <Route path='/logup' element={<LandingSignup/>}/>
     <Route path='/dash' element={<Dashboard/>}/>
     <Route path='/' element={<LandingPage />}/>
     <Route path="/profile/edit" element={<ProfileEdit />} />
     <Route path="/ai-assistant" element={<CashMapAI />} />
    </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
