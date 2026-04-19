import { useCallback, useEffect, useState } from "react";
import type { OfferingSummary } from "./types";
import { getAvailableOfferings } from "../../../services/offerings.api";
import { getApplications } from "../../../services/teacher.api";
import { tokenStorage } from "../../../services/tokenStorage";
import { HttpError } from "../../../services/api";
import type { EnrollmentApplication } from "../../../types/academics";

const buildOfferingLabel = (offering: {
  course?: { name?: string | null };
  term?: { year?: number | null; period?: string | null };
}) => {
  const name = offering.course?.name ?? "Offering";
  const year = offering.term?.year ?? "N/A";
  const period = offering.term?.period ?? "";
  return `${name} - ${year} ${period}`.trim();
};

export const useOfferings = () => {
  const [offerings, setOfferings] = useState<OfferingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = tokenStorage.getAccessToken();
      const available = await getAvailableOfferings();
      const summaries = await Promise.all(
        available.map(async (offering) => {
          let applications: EnrollmentApplication[] = [];
          try {
            applications = await getApplications(
              offering.id,
              undefined,
              token ?? undefined,
            );
          } catch (err) {
            if (!(err instanceof HttpError)) {
              throw err;
            }
          }
          const total = applications.length;
          const pending = applications.filter(
            (app) => app.status === "APPLIED",
          ).length;
          const approved = applications.filter(
            (app) => app.status === "APPROVED",
          ).length;
          const rejected = applications.filter(
            (app) => app.status === "REJECTED",
          ).length;

          return {
            id: offering.id,
            name: buildOfferingLabel(offering),
            secondary: offering.course?.name ? null : "Track no disponible",
            total,
            pending,
            approved,
            rejected,
          } as OfferingSummary;
        }),
      );
      setOfferings(summaries);
    } catch {
      setError("No pudimos cargar los offerings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { offerings, loading, error, reload: load };
};
