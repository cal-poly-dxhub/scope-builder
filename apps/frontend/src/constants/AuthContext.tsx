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
        sessionStorage.setItem("token", result.getIdToken().getJwtToken());
        setEmail(em);
        sessionStorage.setItem("email", em);
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
    sessionStorage.clear();

    const userData = {
      Username: email,
      Pool: userPool,
    };

    const cognitoUser = new CognitoUser(userData);
    cognitoUser.signOut();
  };

  useEffect(() => {
    const e = sessionStorage.getItem("email");
    if (e) {
      setEmail(e);
    }

    const t = sessionStorage.getItem("token");
    if (t) {
      setToken(t);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        email: email,
        token: token,
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
