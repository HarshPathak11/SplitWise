import "./landing.css";
import { SignUp, useSignUp } from "@clerk/clerk-react";
import axios from "axios";

function LandingSignup() {
  const { signUp } = useSignUp();

  async function handleUserSignup() {
    try {
      const token = await signUp.getToken();
  
      const response = await axios.post("http://localhost:8000/demo", {}, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
  
      console.log(response.data);
    } catch (error) {
      console.error("Signup backend call failed:", error);
    }
  }

  return (
    <div>
      <section>
        <div className="content h-auto flex-col">
          <SignUp
            forceRedirectUrl="/login"
            afterSignUp={(user) => {
              console.log("afterSignUp triggered with user:", user);
              handleUserSignup(user);
            }}
          />
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
  );
}

export default LandingSignup;
