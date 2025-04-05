import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";

let apiInstance: AxiosInstance | null = null;

export const api = (baseURL: string): AxiosInstance => {
  if (!apiInstance) {
    apiInstance = axios.create({
      baseURL,
      timeout: 20000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    apiInstance.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        // Handle global error cases
        console.error("API Error:", error);
        return Promise.reject(error);
      }
    );
  }

  return apiInstance;
};
