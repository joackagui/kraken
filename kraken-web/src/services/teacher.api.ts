import { apiRequest } from "./api";
import type { EnrollmentApplication } from "../types/academics";

export const getApplications = (
  offeringId: string,
  status?: string,
  token?: string,
) => {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiRequest<EnrollmentApplication[]>(
    `/offerings/${offeringId}/applications${query}`,
    {
      token,
    },
  );
};

export const approveEnrollment = (enrollmentId: string, token?: string) => {
  return apiRequest(`/enrollments/${enrollmentId}/approve`, {
    method: "POST",
    token,
  });
};
