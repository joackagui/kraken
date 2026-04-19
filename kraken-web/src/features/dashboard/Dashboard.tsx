import "./Dashboard.css";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Descriptions,
  Empty,
  List,
  Progress,
  Row,
  Col,
  Space,
  Statistic,
  Tag,
  Typography,
} from "antd";
import { Link } from "react-router-dom";
import { DashboardLayout } from "./components/DashboardLayout";
import { getMyOfferings } from "../../services/me.api";
import { getProfile } from "../../services/profile.api";
import { getWallet } from "../../services/wallet.api";
import { HttpError } from "../../services/api";
import { authSession } from "../auth/auth.session";
import { tokenStorage } from "../../services/tokenStorage";
import type {
  Enrollment,
  Profile,
  ProfileResponse,
  User,
  Wallet,
} from "../../types/academics";

const getInitials = (value: string) => {
  const parts = value.trim().split(" ").filter(Boolean);
  const initials = parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "");
  return initials.join("");
};

const formatLabel = (value: string) => {
  return value.toLowerCase().replace(/_/g, " ");
};

const getUserId = () => authSession.getUserId();

const fallbackUser = (userId: string): User => ({
  id: userId,
  email: `user-${userId.slice(0, 6)}@unijira.local`,
});

const fallbackProfile: Profile = {
  fullName: "Estudiante Kraken",
  role: "STUDENT",
  handle: null,
  avatarUrl: null,
};

const getPrimaryEnrollment = (enrollments: Enrollment[]) => {
  const approved = enrollments.filter(
    (enrollment) => enrollment.status === "APPROVED",
  );
  const practica = approved.find(
    (enrollment) => enrollment.track === "PRACTICA_INTERNA",
  );
  return practica ?? approved[0] ?? null;
};

const buildNextAction = (enrollments: Enrollment[]) => {
  const approved = enrollments.filter(
    (enrollment) => enrollment.status === "APPROVED",
  );
  const practica = approved.find(
    (enrollment) => enrollment.track === "PRACTICA_INTERNA",
  );

  if (practica) {
    const hasRoles = Boolean(
      practica.prefRole1 || practica.prefRole2 || practica.prefRole3,
    );
    if (!hasRoles) {
      return {
        title: "Elegir roles de Práctica Interna",
        description:
          "Completa tus preferencias para que podamos armar tu equipo ideal.",
        to: "/me/offerings",
        kind: "primary" as const,
      };
    }
    return {
      title: "Esperando inicio del programa",
      description: "Ya registraste tus roles. Te avisaremos cuando inicie.",
      kind: "info" as const,
    };
  }

  if (approved.some((enrollment) => enrollment.track === "INDUCCION")) {
    return {
      title: "Revisa cursos disponibles",
      description:
        "Actualiza tu perfil y mira las opciones antes de tu práctica interna.",
      to: "/offerings/available",
      kind: "secondary" as const,
    };
  }

  return {
    title: "Explorar cursos disponibles",
    description: "Encuentra cursos y comienza tu ruta de aprendizaje.",
    to: "/offerings/available",
    kind: "primary" as const,
  };
};

export function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile>(fallbackProfile);
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [wallet, setWallet] = useState<Wallet>({
    coinsBalance: 0,
    diamondsBalance: 0,
  });
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

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
        getProfile(userId, token ?? undefined),
        getWallet(userId),
        getMyOfferings(userId, token ?? undefined),
      ]);

      if (!active) {
        return;
      }

      const [profileResult, walletResult, offeringsResult] = results;

      if (profileResult.status === "fulfilled") {
        const data = profileResult.value as ProfileResponse;
        setProfile(data.profile ?? fallbackProfile);
        setUserInfo(data.user ?? fallbackUser(userId));
      } else if (
        profileResult.reason instanceof HttpError &&
        profileResult.reason.status === 404
      ) {
        setProfile(fallbackProfile);
        setUserInfo(fallbackUser(userId));
      } else if (profileResult.status === "rejected") {
        setError("No pudimos cargar tu perfil.");
      }

      if (walletResult.status === "fulfilled") {
        setWallet(walletResult.value);
      } else if (
        walletResult.reason instanceof HttpError &&
        walletResult.reason.status === 404
      ) {
        setWallet({ coinsBalance: 0, diamondsBalance: 0 });
      } else if (walletResult.status === "rejected") {
        setError((prev) => prev ?? "No pudimos cargar tu wallet.");
      }

      if (offeringsResult.status === "fulfilled") {
        setEnrollments(offeringsResult.value);
      } else if (offeringsResult.status === "rejected") {
        setError((prev) => prev ?? "No pudimos cargar tus cursos.");
        setEnrollments([]);
      }

      setLoading(false);
    };

    loadData();

    return () => {
      active = false;
    };
  }, []);

  const fullName =
    profile.fullName && profile.fullName.trim().length > 0
      ? profile.fullName
      : (userInfo?.email ?? fallbackProfile.fullName ?? "Estudiante Kraken");
  const initials = useMemo(() => getInitials(fullName), [fullName]);
  const role = profile.role ? formatLabel(profile.role) : "student";
  const primaryEnrollment = getPrimaryEnrollment(enrollments);
  const statusLabel = primaryEnrollment
    ? formatLabel(primaryEnrollment.status)
    : "sin estado";
  const trackLabel = primaryEnrollment
    ? formatLabel(primaryEnrollment.track)
    : "sin track";
  const nextAction = buildNextAction(enrollments);
  const recentCourses = enrollments.slice(0, 3);

  return (
    <DashboardLayout profile={profile} user={userInfo}>
      <div className="dashboard">
        {error ? (
          <Alert
            type="warning"
            message="Datos incompletos"
            description={error}
            showIcon
          />
        ) : null}

        <Card
          className="dashboard-hero-card"
          bordered={false}
          loading={loading}
        >
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} lg={14}>
              <Typography.Text className="eyebrow">
                Welcome back
              </Typography.Text>
              <Typography.Title level={2} className="hero-title">
                Hi, {fullName.split(" ")[0] || "there"}
              </Typography.Title>
              <Typography.Paragraph className="hero-subtitle">
                Track your rewards, keep your progress visible, and stay aligned
                with your goals.
              </Typography.Paragraph>
              <Space size={[8, 8]} wrap className="pill-row">
                <Tag className="pill-tag">Role: {role}</Tag>
                <Tag className="pill-tag">Status: {statusLabel}</Tag>
                <Tag className="pill-tag">Track: {trackLabel}</Tag>
              </Space>
            </Col>

            <Col xs={24} lg={10}>
              <Card className="wallet-card" bordered={false}>
                <Space align="center" size={12} className="wallet-header">
                  <Avatar
                    size={56}
                    src={profile.avatarUrl ?? undefined}
                    className="wallet-avatar"
                  >
                    {initials}
                  </Avatar>
                  <div>
                    <Typography.Text className="wallet-title">
                      Wallet snapshot
                    </Typography.Text>
                    <Typography.Text
                      className="wallet-subtitle"
                      type="secondary"
                    >
                      {profile.handle
                        ? `@${profile.handle}`
                        : (userInfo?.email ?? "Sin email")}
                    </Typography.Text>
                  </div>
                </Space>
                <Row gutter={[12, 12]} className="wallet-grid">
                  <Col span={12}>
                    <Card className="wallet-stat" bordered={false}>
                      <Statistic title="Coins" value={wallet.coinsBalance} />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card className="wallet-stat" bordered={false}>
                      <Statistic
                        title="Diamonds"
                        value={wallet.diamondsBalance}
                      />
                    </Card>
                  </Col>
                </Row>
                <Typography.Text className="wallet-footnote" type="secondary">
                  Keep earning by completing missions and collaborating with
                  your squad.
                </Typography.Text>
              </Card>
            </Col>
          </Row>
        </Card>

        <section className="dashboard-grid">
          <Row gutter={[18, 18]}>
            <Col xs={24} md={12} xl={6}>
              <Card
                className="dashboard-card"
                title="Profile highlights"
                loading={loading}
              >
                <Descriptions
                  column={1}
                  size="small"
                  className="dashboard-descriptions"
                >
                  <Descriptions.Item label="Full name">
                    {fullName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Email">
                    {userInfo?.email ?? "Sin email"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Role">{role}</Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            <Col xs={24} md={12} xl={6}>
              <Card
                className="dashboard-card"
                title="Momentum"
                loading={loading}
              >
                <Space direction="vertical" size={12} className="card-stack">
                  <Progress
                    percent={72}
                    strokeColor="#2f7fd6"
                    trailColor="#d9edf7"
                  />
                  <Typography.Text type="secondary">
                    72% of weekly goals completed
                  </Typography.Text>
                  <Row gutter={12}>
                    <Col span={12}>
                      <Statistic
                        title="Weekly streak"
                        value={4}
                        suffix="weeks"
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic title="Missions done" value={18} />
                    </Col>
                  </Row>
                </Space>
              </Card>
            </Col>

            <Col xs={24} md={12} xl={6}>
              <Card
                className="dashboard-card"
                title="Next actions"
                loading={loading}
              >
                <Space direction="vertical" size={12} className="card-stack">
                  <div>
                    <Typography.Text strong>{nextAction.title}</Typography.Text>
                    <Typography.Paragraph
                      type="secondary"
                      style={{ margin: 0 }}
                    >
                      {nextAction.description}
                    </Typography.Paragraph>
                  </div>
                  {nextAction.to ? (
                    <Button
                      type={
                        nextAction.kind === "primary" ? "primary" : "default"
                      }
                      size="middle"
                    >
                      <Link to={nextAction.to}>Ir ahora</Link>
                    </Button>
                  ) : (
                    <Typography.Text type="secondary">
                      Te mantendremos al tanto.
                    </Typography.Text>
                  )}
                </Space>
              </Card>
            </Col>

            <Col xs={24} md={12} xl={6}>
              <Card
                className="dashboard-card"
                title="Mis cursos recientes"
                loading={loading}
              >
                {recentCourses.length === 0 && !loading ? (
                  <Empty description="Sin cursos aprobados" />
                ) : (
                  <List
                    size="small"
                    dataSource={recentCourses}
                    renderItem={(item) => (
                      <List.Item className="dashboard-list-item">
                        <Space direction="vertical" size={4}>
                          <Typography.Text className="label">
                            {item.offering?.course?.name ?? "Curso sin nombre"}
                          </Typography.Text>
                          <Typography.Text>
                            {item.offering?.term?.name ?? "Sin periodo"} •{" "}
                            {formatLabel(item.track)}
                          </Typography.Text>
                        </Space>
                      </List.Item>
                    )}
                  />
                )}
              </Card>
            </Col>
          </Row>
        </section>
      </div>
    </DashboardLayout>
  );
}
