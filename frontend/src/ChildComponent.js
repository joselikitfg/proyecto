import React, { useEffect, useState } from "react";
import { Amplify } from "aws-amplify";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { Auth, fetchAuthSession } from "@aws-amplify/auth";

const ChildComponent = ({ fetchItems }) => {
  const { user, signOut } = useAuthenticator();
  const [jwtToken, setJwtToken] = useState("");
  const [accessToken, setAccessToken] = useState(""); 

  useEffect(() => {
    if (user) {
      fetchJwtToken();
    }
    fetchItems();
  }, [user, fetchItems]);

  const fetchJwtToken = async () => {
    try {
      const session = await fetchAuthSession();
      const idToken = session.tokens.idToken.toString();
      const accessTok = session.tokens.accessToken.toString(); 
      setJwtToken(idToken);
      setAccessToken(accessTok);
    } catch (error) {
      console.log("Error fetching JWT token:", error);
    }
  };

};

export default ChildComponent;
