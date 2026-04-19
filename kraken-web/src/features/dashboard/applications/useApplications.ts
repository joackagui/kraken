import { useCallback, useEffect, useState } from "react";
import type {
  ApplicationsQuery,
  ApplicationsResponse,
  OfferingApplication,
} from "./types";
import { getApplications } from "../../../services/teacher.api";
import { tokenStorage } from "../../../services/tokenStorage";
import type { EnrollmentApplication } from "../../../types/academics";

export const useApplications = (
  offeringId: string | null,
  query: ApplicationsQuery,
) => {
  const [data, setData] = useState<ApplicationsResponse>({
    items: [],
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!offeringId) {
      setData({ items: [], total: 0 });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const token = tokenStorage.getAccessToken();
      const status =
        query.status && query.status !== "ALL" ? query.status : undefined;
      const items = await getApplications(
        offeringId,
        status,
        token ?? undefined,
      );
      const normalized: OfferingApplication[] = items.map(
        (app: EnrollmentApplication) => ({
          id: app.id,
          offeringId,
          student: {
            id: app.student?.email ?? app.id,
            fullName:
              app.student?.profile?.fullName ??
              app.student?.email ??
              "Sin nombre",
            email: app.student?.email ?? "Sin email",
          },
          track: app.track as OfferingApplication["track"],
          status: app.status as OfferingApplication["status"],
          createdAt: app.createdAt ?? new Date().toISOString(),
        }),
      );

      const queryValue = query.q?.trim().toLowerCase() ?? "";
      const filtered = queryValue
        ? normalized.filter(
            (item) =>
              item.student.fullName.toLowerCase().includes(queryValue) ||
              item.student.email.toLowerCase().includes(queryValue),
          )
        : normalized;
      const total = filtered.length;
      const page = query.page ?? 1;
      const pageSize = query.pageSize ?? 10;
      const start = (page - 1) * pageSize;
      const pageItems = filtered.slice(start, start + pageSize);
      setData({ items: pageItems, total });
    } catch {
      setError("No pudimos cargar las aplicaciones.");
    } finally {
      setLoading(false);
    }
  }, [offeringId, query]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
};
