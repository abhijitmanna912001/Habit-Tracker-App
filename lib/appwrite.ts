import { Account, Client, Databases } from "react-native-appwrite";

export const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || "")
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || "")
  .setPlatform(process.env.EXPO_PUBLIC_APPWRITE_PLATFORM || "");

export const account = new Account(client);
export const databases = new Databases(client);

export const DB_ID = process.env.EXPO_PUBLIC_DB_ID;
export const COLLECTION_ID = process.env.EXPO_PUBLIC_COLLECTION_ID;
export const COMPLETION_COLLECTION_ID =
  process.env.EXPO_PUBLIC_COMPLETION_COLLECTION_ID;

export interface RealtimeResponse {
  events: string[];
  payload: any;
}
