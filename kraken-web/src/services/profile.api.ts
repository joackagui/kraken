import { apiRequest, HttpError } from "./api";
import type { ProfileResponse } from "../types/academics";

const PROFILE_ENDPOINTS = ["/users/:id/profile", "/me/profile"];

const buildProfilePath = (endpoint: string, userId: string) => {
  if (endpoint.includes(":id")) {
    return endpoint.replace(":id", userId);
  }
  return `${endpoint}?userId=${userId}`;
};

export const getProfile = async (
  userId: string,
  token?: string,
): Promise<ProfileResponse> => {
  let lastError: unknown;

  for (const endpoint of PROFILE_ENDPOINTS) {
    try {
      return await apiRequest<ProfileResponse>(
        buildProfilePath(endpoint, userId),
        {
          token,
        },
      );
    } catch (error) {
      lastError = error;
      if (error instanceof HttpError && error.status === 404) {
        continue;
      }
      throw error;
    }
  }

  throw lastError ?? new Error("Profile endpoint not available");
};
