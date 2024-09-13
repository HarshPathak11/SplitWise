import React from "react";
import './landing.css';
import SignIn from "./signin";


function LandingSignin(){
    const[signin,setsignin]=React.useState(true);
    return(
        <div>
            <section>
      <div class="content h-auto flex-col">   
      <SignIn/>
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