import React from "react";
import './landing.css';
import { SignedIn, SignIn , useUser} from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
// import SignIn from "./signin";


function LandingSignin(){
    const[signin,setsignin]=React.useState(true);
    const navigate = useNavigate();
    
    return(
        <div>
            <section>
      <div class="content h-auto flex-col">   
      <SignIn forceRedirectUrl="/dash"/>
      </div>

      <ul class="circles">
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
      </ul>
    </section>
        </div>
    )
}

export default LandingSignin;