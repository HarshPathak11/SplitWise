import React from "react";
import './landing.css';

import SignUp from "./signup";


function LandingSignup(){
    const[signin,setsignin]=React.useState(true);
    return(
        <div>
            <section>
      <div class="content h-auto flex-col">   
      <SignUp/>
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

export default LandingSignup;