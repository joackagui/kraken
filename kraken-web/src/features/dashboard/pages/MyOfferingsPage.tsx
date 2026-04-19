import "../Dashboard.css";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  List,
  Row,
  Space,
  Typography,
  message,
} from "antd";
import { DashboardLayout } from "../components/DashboardLayout";
import { getMyOfferings } from "../../../services/me.api";
import { getProfile } from "../../../services/profile.api";
import { authSession } from "../../auth/auth.session";
import { HttpError } from "../../../services/api";
import { tokenStorage } from "../../../services/tokenStorage";
import {
  getPracticaRoleOptions,
  setPracticaRoles,
} from "../../../services/practicaRoles.api";
import type {
  Enrollment,
  PracticaRoleOptions,
  Profile,
  ProfileResponse,
  User,
} from "../../../types/academics";
import { PracticaRolesModal } from "../components/PracticaRolesModal";
import { CourseEnrollmentCard } from "../components/CourseEnrollmentCard";
import { SummaryPanel } from "../components/SummaryPanel";

const formatLabel = (value: string) => {
  return value.toLowerCase().replace(/_/g, " ");
};

const fallbackProfile: Profile = {
  fullName: "Estudiante Kraken",
  role: "STUDENT",
  handle: null,
  avatarUrl: null,
};

export function MyOfferingsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile>(fallbackProfile);
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [rolesModalOpen, setRolesModalOpen] = useState(false);
  const [rolesModalLoading, setRolesModalLoading] = useState(false);
  const [rolesModalError, setRolesModalError] = useState<string | null>(null);
  const [rolesOptions, setRolesOptions] = useState<PracticaRoleOptions | null>(
    null,
  );
  const [activeEnrollmentId, setActiveEnrollmentId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    let active = true;
    const userId = authSession.getUserId();
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
        getMyOfferings(userId, token ?? undefined),
        getProfile(userId, token ?? undefined),
      ]);
      if (!active) {
        return;
      }

      const [offeringsResult, profileResult] = results;

      if (offeringsResult.status === "fulfilled") {
        setEnrollments(offeringsResult.value);
      } else {
        setError("No pudimos cargar tus cursos aprobados.");
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
      }

      setLoading(false);
    };

    loadData();

    return () => {
      active = false;
    };
  }, []);

  const refreshOfferings = async () => {
    const userId = authSession.getUserId();
    const token = tokenStorage.getAccessToken();
    if (!userId) {
      return;
    }
    try {
      const updated = await getMyOfferings(userId, token ?? undefined);
      setEnrollments(updated);
    } catch {
      setError("No pudimos actualizar tus cursos.");
    }
  };

  const practicaEnrollments = useMemo(
    () =>
      enrollments.filter(
        (enrollment) =>
          enrollment.track === "PRACTICA_INTERNA" &&
          enrollment.status === "APPROVED",
      ),
    [enrollments],
  );

  const pendingRolesEnrollment = useMemo(
    () =>
      practicaEnrollments.find(
        (enrollment) => !(enrollment.prefRole1 && enrollment.prefRole2),
      ) ?? null,
    [practicaEnrollments],
  );

  const hasPendingRoles = Boolean(pendingRolesEnrollment);

  const handleOpenRolesModal = async (enrollmentId: string) => {
    setActiveEnrollmentId(enrollmentId);
    setRolesModalOpen(true);
    setRolesModalLoading(true);
    setRolesModalError(null);
    try {
      const options = await getPracticaRoleOptions(enrollmentId);
      setRolesOptions(options);
    } catch (err) {
      if (err instanceof HttpError) {
        setRolesModalError(err.message);
      } else {
        setRolesModalError("No pudimos cargar las opciones de roles.");
      }
    } finally {
      setRolesModalLoading(false);
    }
  };

  const handleSaveRoles = async (role1: string, role2: string) => {
    if (!activeEnrollmentId) {
      return;
    }
    setRolesModalLoading(true);
    setRolesModalError(null);
    try {
      await setPracticaRoles(activeEnrollmentId, role1, role2);
      message.success("Roles guardados");
      setRolesModalOpen(false);
      await refreshOfferings();
    } catch (err) {
      if (err instanceof HttpError) {
        setRolesModalError(err.message);
      } else {
        setRolesModalError("No pudimos guardar los roles.");
      }
    } finally {
      setRolesModalLoading(false);
    }
  };

  return (
    <DashboardLayout profile={profile} user={userInfo}>
      <div className="dashboard">
        <Card className="dashboard-hero-card my-courses-hero">
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} md={14}>
              <Space direction="vertical" size={8}>
                <Typography.Text className="eyebrow">
                  Mis cursos
                </Typography.Text>
                <Typography.Title level={2} className="hero-title">
                  Mis cursos
                </Typography.Title>
                <Typography.Text type="secondary">
                  Cursos aprobados en los que ya estás inscrito.
                </Typography.Text>
                <Typography.Text>
                  Total de cursos: <strong>{enrollments.length}</strong>
                </Typography.Text>
              </Space>
            </Col>
            <Col xs={24} md={10}>
              {enrollments.length === 0 ? (
                <Alert
                  type="info"
                  message="No tienes cursos aprobados"
                  description="Explora cursos disponibles para comenzar."
                  showIcon
                />
              ) : hasPendingRoles ? (
                <Alert
                  type="warning"
                  message="Debes elegir tus roles para Práctica Interna"
                  description="Completa tus preferencias para avanzar."
                  showIcon
                  action={
                    <Button
                      type="primary"
                      onClick={() =>
                        pendingRolesEnrollment
                          ? handleOpenRolesModal(pendingRolesEnrollment.id)
                          : null
                      }
                    >
                      Elegir roles
                    </Button>
                  }
                />
              ) : (
                <Alert
                  type="success"
                  message="Todo listo. Esperando inicio del programa"
                  showIcon
                />
              )}
            </Col>
          </Row>
        </Card>

        {error ? (
          <Alert
            type="warning"
            message="Datos incompletos"
            description={error}
            showIcon
          />
        ) : null}

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            {enrollments.length === 0 && !loading ? (
              <Card className="dashboard-card">
                <Empty description="Aún no tienes cursos aprobados." />
              </Card>
            ) : (
              <List
                grid={{ gutter: 18, xs: 1, sm: 1, md: 1, lg: 1 }}
                dataSource={enrollments}
                renderItem={(item) => (
                  <List.Item>
                    <CourseEnrollmentCard
                      enrollment={item}
                      onSelectRoles={handleOpenRolesModal}
                    />
                  </List.Item>
                )}
              />
            )}
          </Col>
          <Col xs={24} lg={8}>
            <div className="summary-sticky">
              <SummaryPanel
                enrollments={enrollments}
                hasPendingRoles={hasPendingRoles}
                onSelectRoles={() =>
                  pendingRolesEnrollment
                    ? handleOpenRolesModal(pendingRolesEnrollment.id)
                    : null
                }
              />
            </div>
          </Col>
        </Row>
      </div>

      <PracticaRolesModal
        open={rolesModalOpen}
        loading={rolesModalLoading}
        options={rolesOptions}
        error={rolesModalError}
        onCancel={() => setRolesModalOpen(false)}
        onSubmit={handleSaveRoles}
      />
    </DashboardLayout>
  );
}
