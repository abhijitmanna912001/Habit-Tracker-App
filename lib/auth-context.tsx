import React, { createContext, useCallback, useContext, useMemo } from "react";
import { ID, Models } from "react-native-appwrite";
import { account } from "./appwrite";

type AuthContextType = {
  //   user: Models.User<Models.Preferences> | null;
  signUp: (email: string, password: string) => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<string | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      await account.createEmailPasswordSession({
        email,
        password,
      });
      return null;
    } catch (error) {
      if (error instanceof Error) {
        return error.message;
      }
      return "An error occurred during sign in";
    }
  }, []);

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

  const value = useMemo(() => {
    return {
      user: null,
      signIn,
      signUp,
    };
  }, [signIn, signUp]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be inside of the AuthProvider");
  }

  return context;
}
