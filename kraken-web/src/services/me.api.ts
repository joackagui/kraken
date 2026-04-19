import { apiRequest } from "./api";
import type { Enrollment } from "../types/academics";

const OFFERINGS_ENDPOINT = "/me/offerings";

export const getMyOfferings = (userId: string, token?: string) => {
  return apiRequest<Enrollment[]>(`${OFFERINGS_ENDPOINT}?userId=${userId}`, {
    token,
  });
};
