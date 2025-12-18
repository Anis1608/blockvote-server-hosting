import AuthContext from "./authcontext";
import React, { useState } from "react";

const AuthState = (props) => {
  const host = "https://inotebook-anis.onrender.com/";
  const credentialsinitial = [];
  const [credentials, setCredentials] = useState(credentialsinitial);

   const Login = async () => {
     const response = await fetch("https://inotebook-anis.onrender.com/api/auth/getuser", {
       method: "POST",
       headers: {
         "Content-Type": "application/json",
         token: localStorage.getItem("token"),
       },
     });
     const json = await response.json();
     setCredentials(json);
   };
  
   return (
      <AuthContext.Provider
        value={{
          credentials,
          setCredentials,
        }}
      >
        {props.children}
      </AuthContext.Provider>
    );

}
export default AuthState;