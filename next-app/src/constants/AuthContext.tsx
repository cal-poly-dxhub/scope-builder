"use client";

import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
} from "amazon-cognito-identity-js";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import awsConfig from "./aws-config";

interface AuthContextType {
  email: string;
  token: string;
  handleLogin: (
    email: string,
    password: string,
    onSuccess: (result: unknown) => void,
    onFailure: (err: unknown) => void
  ) => void;
  handleLogout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const userPool = new CognitoUserPool({
  UserPoolId: awsConfig.userPoolId,
  ClientId: awsConfig.userPoolWebClientId,
});

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [email, setEmail] = useState<string>("");
  const [token, setToken] = useState<string>("");

  const handleLogin = async (
    em: string,
    password: string,
    onSuccess: (result: unknown) => void,
    onFailure: (err: unknown) => void
  ) => {
    const authData = {
      Username: em,
      Password: password,
    };
    const authDetails = new AuthenticationDetails(authData);

    const userData = {
      Username: em,
      Pool: userPool,
    };
    const cognitoUser = new CognitoUser(userData);

    cognitoUser.authenticateUser(authDetails, {
      onSuccess: (result) => {
        setToken(result.getIdToken().getJwtToken());
        setEmail(em);
        onSuccess(result);
      },
      onFailure: (err) => {
        console.error("Authentication failed:", err);
        onFailure(err);
      },
    });
  };

  const handleLogout = () => {
    setEmail("");
    setToken("");
    sessionStorage.removeItem("email");
    sessionStorage.removeItem("token");

    const userData = {
      Username: email,
      Pool: userPool,
    };

    const cognitoUser = new CognitoUser(userData);
    cognitoUser.signOut();
  };

  useEffect(() => {
    const email = sessionStorage.getItem("email");
    const token = sessionStorage.getItem("token");

    if (email) {
      setEmail(email);
    }

    if (token) {
      setToken(token);
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem("email", email);
    sessionStorage.setItem("token", token);
  }, [email, token]);

  return (
    <AuthContext.Provider
      value={{
        email,
        token,
        handleLogin,
        handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return context;
};

export { AuthProvider, useAuth };
