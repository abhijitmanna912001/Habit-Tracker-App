import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ID, Models } from "react-native-appwrite";
import { account } from "./appwrite";

type AuthContextType = {
  user: Models.User<Models.Preferences> | null;
  isLoadingUser: boolean;
  signUp: (email: string, password: string) => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    null,
  );

  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);

  const getUser = useCallback(async () => {
    try {
      const session = await account.get();
      setUser(session);
    } catch (error) {
      console.log("Failed to fetch user session:", error);
      setUser(null);
    } finally {
      setIsLoadingUser(false);
    }
  }, []);

  useEffect(() => {
    getUser();
  }, [getUser]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        await account.createEmailPasswordSession({
          email,
          password,
        });

        await getUser();
        return null;
      } catch (error) {
        if (error instanceof Error) {
          return error.message;
        }
        return "An error occurred during sign in";
      }
    },
    [getUser],
  );

  const signUp = useCallback(
    async (email: string, password: string) => {
      try {
        await account.create({
          userId: ID.unique(),
          email,
          password,
        });

        await signIn(email, password);

        return null;
      } catch (error) {
        if (error instanceof Error) {
          return error.message;
        }
        return "An error occurred during signup";
      }
    },
    [signIn],
  );

  const signOut = useCallback(async () => {
    try {
      await account.deleteSession({
        sessionId: "current",
      });

      setUser(null);
    } catch (error) {
      console.log("Sign out error:", error);
    }
  }, []);

  const value = useMemo(() => {
    return {
      user,
      isLoadingUser,
      signIn,
      signUp,
      signOut,
    };
  }, [user, isLoadingUser, signIn, signUp, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be inside of the AuthProvider");
  }

  return context;
}
