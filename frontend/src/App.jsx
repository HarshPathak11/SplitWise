import { useState } from 'react'
import SignIn from './components/signin'
import SignUp from './components/signup'
import { BrowserRouter,Route,Routes,Link } from "react-router-dom";


function App() {
  

  return (
    <>
    <BrowserRouter>
    <Routes>
     <Route path='/login' element={<SignIn/>}/>
     <Route path='/logup' element={<SignUp/>}/>
    </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
