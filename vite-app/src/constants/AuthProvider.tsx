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
  attemptLogin: (
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

  const attemptLogin = async (
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
    localStorage.removeItem("email");
    localStorage.removeItem("token");

    const userData = {
      Username: email,
      Pool: userPool,
    };

    const cognitoUser = new CognitoUser(userData);
    cognitoUser.signOut();
  };

  useEffect(() => {
    const email = localStorage.getItem("email");
    const token = localStorage.getItem("token");

    if (email) {
      setEmail(email);
    }

    if (token) {
      setToken(token);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("email", email);
    localStorage.setItem("token", token);
  }, [email, token]);

  return (
    <AuthContext.Provider
      value={{
        email,
        token,
        attemptLogin,
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

// eslint-disable-next-line react-refresh/only-export-components
export { AuthProvider, useAuth };
