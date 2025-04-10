import './landing.css';
import {SignIn} from "@clerk/clerk-react";


function LandingSignin(){
    
    return(
        <div>
            <section>
      <div className="content h-auto flex-col">   
      <SignIn forceRedirectUrl="/dash"/>
      </div>

      <ul className="circles">
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