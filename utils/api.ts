import { emulatorsEnabled } from "@/config/emulators";
import { auth_instance } from "@/config/firebase";
import axios, { AxiosRequestConfig } from "axios";

// Base URLs based on environment
const isLive = !emulatorsEnabled;

export const API_BASE_URL = isLive
  ? "https://us-central1-walkmate-d42b4.cloudfunctions.net/api/"
  : "http://localhost:5001/walkmate-d42b4/us-central1/api/";

export async function callApi<T = any>(
  path: string,
  data?: unknown,
  options?: AxiosRequestConfig
): Promise<T> {
  // Get authentication token if user is logged in
  let token;
  try {
    token = await auth_instance.currentUser?.getIdToken();
  } catch (error) {
    console.error("Failed to get authentication token:", error);
  }

  // Construct the full URL
  const url = `${API_BASE_URL}${path}`;
  console.log(`Making API call to ${url}`, { path, isLive, token });

  // Set up request configuration
  const config: AxiosRequestConfig = {
    method: "POST",
    url,
    data: data ? { data } : undefined,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
    ...options,
  };

  try {
    const response = await axios(config);
    return response.data as T;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error("API call failed:", {
        status: error.response.status,
        data: error.response.data,
      });
      throw error.response.data;
    }
    console.error("API call error:", error);
    throw error;
  }
}

/**
 * Similar to callApi but specifically for Firebase callable functions
 * This formats the data in the way Firebase callable functions expect
 */
export async function callFunction<T = any>(
  functionName: string,
  data?: unknown
): Promise<T> {
  return callApi<T>(`${functionName}`, data);
}
