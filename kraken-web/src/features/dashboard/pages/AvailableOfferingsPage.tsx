import "../Dashboard.css";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Input,
  Row,
  Segmented,
  Select,
  Skeleton,
  Space,
  Tag,
  Typography,
  message,
} from "antd";
import { Link } from "react-router-dom";
import { DashboardLayout } from "../components/DashboardLayout";
import { authSession } from "../../auth/auth.session";
import { getAvailableOfferings } from "../../../services/offerings.api";
import { getMyOfferings } from "../../../services/me.api";
import { applyToOffering } from "../../../services/enrollments.api";
import { getProfile } from "../../../services/profile.api";
import { HttpError } from "../../../services/api";
import { tokenStorage } from "../../../services/tokenStorage";
import type {
  CourseOffering,
  Enrollment,
  Profile,
  ProfileResponse,
  User,
} from "../../../types/academics";

type TrackFilter = "ALL" | "PRACTICA_INTERNA" | "INDUCCION";

const trackLabel: Record<TrackFilter, string> = {
  ALL: "Todos",
  PRACTICA_INTERNA: "Práctica Interna",
  INDUCCION: "Inducción",
};

const formatDateRange = (startsAt?: string | null, endsAt?: string | null) => {
  if (!startsAt && !endsAt) {
    return null;
  }
  const formatter = new Intl.DateTimeFormat("es-BO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const startLabel = startsAt
    ? formatter.format(new Date(startsAt))
    : "Sin fecha";
  const endLabel = endsAt ? formatter.format(new Date(endsAt)) : "Sin fecha";
  return `${startLabel} - ${endLabel}`;
};

const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();

const inferTrack = (
  offering: CourseOffering,
): "PRACTICA_INTERNA" | "INDUCCION" | null => {
  const code = normalizeText(offering.course?.code ?? "");
  const name = normalizeText(offering.course?.name ?? "");
  if (code === "PRACTICA_INT" || name.includes("PRACTICA")) {
    return "PRACTICA_INTERNA";
  }
  if (code === "INDUCCION" || name.includes("INDUCCION")) {
    return "INDUCCION";
  }
  return null;
};

const buildTermLabel = (offering: CourseOffering) => {
  const term = offering.term;
  const yearLabel = term.year ? `Gestión ${term.year}` : "Gestión";
  const periodLabel = term.period ? ` - ${term.period}` : "";
  const nameLabel = term.name ? ` ${term.name}` : "";
  return `${yearLabel}${periodLabel}${nameLabel}`.trim();
};

const getTeacherLabel = (offering: CourseOffering) => {
  return (
    offering.teacher?.profile?.fullName ??
    offering.teacher?.email ??
    "Docente por definir"
  );
};

const getUserId = () => authSession.getUserId();

const fallbackProfile: Profile = {
  fullName: "Estudiante Kraken",
  role: "STUDENT",
  handle: null,
  avatarUrl: null,
};

export function AvailableOfferingsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [approved, setApproved] = useState<Set<string>>(new Set());
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [profile, setProfile] = useState<Profile>(fallbackProfile);
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [yearFilter, setYearFilter] = useState<number | "ALL">("ALL");
  const [trackFilter, setTrackFilter] = useState<TrackFilter>("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let active = true;
    const userId = getUserId();
    const token = tokenStorage.getAccessToken();

    if (!userId) {
      setError("No encontramos tu userId. Inicia sesión nuevamente.");
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      setError(null);

      const results = await Promise.allSettled([
        getAvailableOfferings(),
        getMyOfferings(userId, token ?? undefined),
        getProfile(userId, token ?? undefined),
      ]);

      if (!active) {
        return;
      }

      const [availableResult, myOfferingsResult, profileResult] = results;

      if (availableResult.status === "fulfilled") {
        setOfferings(availableResult.value);
      } else {
        setError("No pudimos cargar los cursos disponibles.");
      }

      if (myOfferingsResult.status === "fulfilled") {
        const approvedIds = new Set(
          myOfferingsResult.value
            .map((enrollment: Enrollment) => enrollment.offering?.id)
            .filter((id): id is string => Boolean(id)),
        );
        setApproved(approvedIds);
      } else {
        setApproved(new Set());
      }

      if (profileResult.status === "fulfilled") {
        const data = profileResult.value as ProfileResponse;
        setProfile(data.profile ?? fallbackProfile);
        setUserInfo(data.user ?? null);
      } else if (
        profileResult.reason instanceof HttpError &&
        profileResult.reason.status === 404
      ) {
        setProfile(fallbackProfile);
        setUserInfo(null);
      }

      setLoading(false);
    };

    loadData();

    return () => {
      active = false;
    };
  }, []);

  const yearOptions = useMemo(() => {
    const years = Array.from(
      new Set(offerings.map((offering) => offering.term?.year).filter(Boolean)),
    ) as number[];
    return years.sort((a, b) => b - a);
  }, [offerings]);

  const filteredOfferings = useMemo(() => {
    const query = normalizeText(search.trim());
    return offerings.filter((offering) => {
      if (yearFilter !== "ALL" && offering.term?.year !== yearFilter) {
        return false;
      }
      const inferredTrack = inferTrack(offering);
      if (trackFilter !== "ALL" && inferredTrack !== trackFilter) {
        return false;
      }
      if (!query) {
        return true;
      }
      if (!query) {
        return true;
      }
      const name = normalizeText(offering.course?.name ?? "");
      const code = normalizeText(offering.course?.code ?? "");
      return name.includes(query) || code.includes(query);
    });
  }, [offerings, yearFilter, trackFilter, search]);

  const groupedOfferings = useMemo(() => {
    const map = new Map<string, CourseOffering[]>();
    filteredOfferings.forEach((offering) => {
      const key = buildTermLabel(offering);
      const list = map.get(key) ?? [];
      list.push(offering);
      map.set(key, list);
    });
    return Array.from(map.entries());
  }, [filteredOfferings]);

  const handleApply = async (offering: CourseOffering) => {
    const userId = getUserId();
    const token = tokenStorage.getAccessToken();

    if (!userId) {
      message.error("No encontramos tu usuario. Inicia sesión nuevamente.");
      return;
    }
    if (!token) {
      message.error("Tu sesión ha expirado. Inicia sesión nuevamente.");
      return;
    }

    const track = inferTrack(offering);
    if (!track) {
      message.error("No pudimos inferir el track para este curso.");
      return;
    }
    const academicYear = offering.term?.year;
    if (!academicYear) {
      message.error("No encontramos el año académico del offering.");
      return;
    }

    setPendingIds((prev) => new Set(prev).add(offering.id));
    try {
      await applyToOffering(
        offering.id,
        { userId, track, academicYear },
        token,
      );
      message.success("Aplicación enviada");
    } catch (error) {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(offering.id);
        return next;
      });
      if (error instanceof HttpError) {
        message.error(error.message);
        return;
      }
      message.error("No pudimos enviar la aplicación.");
    }
  };

  return (
    <DashboardLayout profile={profile} user={userInfo}>
      <div className="dashboard">
        <Space direction="vertical" size={16} className="w-full">
          <Typography.Title level={3} className="!m-0">
            Cursos disponibles
          </Typography.Title>
          <Typography.Text type="secondary">
            Explora y aplica a los cursos disponibles para tu programa.
          </Typography.Text>
        </Space>

        {error ? (
          <Alert
            type="warning"
            message="Datos incompletos"
            description={error}
            showIcon
          />
        ) : null}

        <Card className="dashboard-card">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={8}>
              <Space direction="vertical" size={6} className="w-full">
                <Typography.Text>Año</Typography.Text>
                <Select
                  className="w-full"
                  value={yearFilter}
                  onChange={(value) => setYearFilter(value)}
                  options={[
                    { label: "Todos", value: "ALL" },
                    ...yearOptions.map((year) => ({
                      label: year,
                      value: year,
                    })),
                  ]}
                />
              </Space>
            </Col>
            <Col xs={24} md={8}>
              <Space direction="vertical" size={6} className="w-full">
                <Typography.Text>Track</Typography.Text>
                <Segmented
                  options={[
                    { label: trackLabel.ALL, value: "ALL" },
                    {
                      label: trackLabel.PRACTICA_INTERNA,
                      value: "PRACTICA_INTERNA",
                    },
                    { label: trackLabel.INDUCCION, value: "INDUCCION" },
                  ]}
                  value={trackFilter}
                  onChange={(value) => setTrackFilter(value as TrackFilter)}
                />
              </Space>
            </Col>
            <Col xs={24} md={8}>
              <Space direction="vertical" size={6} className="w-full">
                <Typography.Text>Búsqueda</Typography.Text>
                <Input.Search
                  placeholder="Busca por nombre o código"
                  allowClear
                  onSearch={(value) => setSearch(value)}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </Space>
            </Col>
          </Row>
        </Card>

        {loading ? (
          <Row gutter={[18, 18]}>
            {Array.from({ length: 6 }).map((_, index) => (
              <Col xs={24} md={12} xl={8} key={`skeleton-${index}`}>
                <Card className="dashboard-card">
                  <Skeleton active />
                </Card>
              </Col>
            ))}
          </Row>
        ) : groupedOfferings.length === 0 ? (
          <Card className="dashboard-card">
            <Empty description="No hay cursos para los filtros seleccionados." />
          </Card>
        ) : (
          groupedOfferings.map(([termLabel, termOfferings]) => (
            <div key={termLabel} className="space-y-4">
              <Typography.Title level={4} className="!mb-2">
                {termLabel}
              </Typography.Title>
              <Row gutter={[18, 18]}>
                {termOfferings.map((offering) => {
                  const isApproved = approved.has(offering.id);
                  const isPending = pendingIds.has(offering.id);
                  const dateRange = formatDateRange(
                    offering.term?.startsAt ?? undefined,
                    offering.term?.endsAt ?? undefined,
                  );

                  return (
                    <Col xs={24} md={12} xl={8} key={offering.id}>
                      <Card className="dashboard-card offering-card">
                        <div className="offering-card__body">
                          <div className="offering-card__header">
                            <Typography.Title level={5} className="!m-0">
                              {offering.course?.name ?? "Curso sin nombre"}
                            </Typography.Title>
                            <div className="offering-card__tags">
                              {offering.course?.code ? (
                                <Tag color="blue">{offering.course.code}</Tag>
                              ) : null}
                              {isApproved ? (
                                <Tag color="green">Inscrito</Tag>
                              ) : isPending ? (
                                <Tag color="gold">Pendiente</Tag>
                              ) : null}
                            </div>
                          </div>

                          <Space direction="vertical" size={4}>
                            <Typography.Text type="secondary">
                              {offering.term?.name ?? "Sin periodo"} •{" "}
                              {offering.term?.year ?? "N/A"}
                              {offering.term?.period
                                ? ` • ${offering.term.period}`
                                : ""}
                            </Typography.Text>
                            <Typography.Text type="secondary">
                              Docente: {getTeacherLabel(offering)}
                            </Typography.Text>
                            {dateRange ? (
                              <Typography.Text type="secondary">
                                {dateRange}
                              </Typography.Text>
                            ) : null}
                          </Space>

                          <div className="offering-card__footer">
                            {isApproved ? (
                              <Button type="primary">
                                <Link to="/me/offerings">Ir a mis cursos</Link>
                              </Button>
                            ) : (
                              <Button
                                type="primary"
                                disabled={isPending}
                                onClick={() => handleApply(offering)}
                              >
                                {isPending ? "En revisión" : "Aplicar"}
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}
