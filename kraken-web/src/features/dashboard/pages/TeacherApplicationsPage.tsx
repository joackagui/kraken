import "../Dashboard.css";
import { useMemo, useState } from "react";
import {
  Alert,
  Breadcrumb,
  Card,
  Space,
  Typography,
  message,
  Modal,
} from "antd";
import { DashboardLayout } from "../components/DashboardLayout";
import { OfferingsGrid } from "../applications/OfferingsGrid";
import { OfferingApplicationsTable } from "../applications/OfferingApplicationsTable";
import { useOfferings } from "../applications/useOfferings";
import { useApplications } from "../applications/useApplications";
import type {
  ApplicationStatus,
  OfferingApplication,
} from "../applications/types";
import { approveEnrollment } from "../../../services/teacher.api";

export function TeacherApplicationsPage() {
  const { offerings, loading, error } = useOfferings();
  const [selectedOfferingId, setSelectedOfferingId] = useState<string | null>(
    null,
  );
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "ALL">(
    "ALL",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalState, setModalState] = useState<{
    action: "approve" | "reject" | null;
    record: OfferingApplication | null;
    loading: boolean;
  }>({ action: null, record: null, loading: false });

  const applicationsQuery = useMemo(
    () => ({
      status: statusFilter,
      q: searchQuery,
      page,
      pageSize,
    }),
    [statusFilter, searchQuery, page, pageSize],
  );

  const {
    data: applicationsData,
    loading: loadingApplications,
    error: applicationsError,
    reload,
  } = useApplications(selectedOfferingId, applicationsQuery);

  const selectedOffering = useMemo(
    () =>
      offerings.find((offering) => offering.id === selectedOfferingId) ?? null,
    [offerings, selectedOfferingId],
  );

  const handleOpenOffering = (offeringId: string) => {
    setSelectedOfferingId(offeringId);
    setStatusFilter("ALL");
    setSearchQuery("");
    setPage(1);
  };

  const handleApprove = (record: OfferingApplication) => {
    setModalState({ action: "approve", record, loading: false });
  };

  const handleReject = () => {
    message.error("Rechazo no disponible en el backend.");
  };

  const handleConfirmAction = async () => {
    if (!modalState.record || !modalState.action) {
      return;
    }
    setModalState((prev) => ({ ...prev, loading: true }));
    try {
      if (modalState.action === "approve") {
        await approveEnrollment(modalState.record.id);
        message.success("Estudiante aprobado");
      } else {
        message.error("Rechazo no disponible en el backend.");
        setModalState((prev) => ({ ...prev, loading: false }));
        return;
      }
      setModalState({ action: null, record: null, loading: false });
      reload();
    } catch {
      message.error("No pudimos actualizar la postulación.");
      setModalState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleCloseModal = () => {
    setModalState({ action: null, record: null, loading: false });
  };

  return (
    <DashboardLayout>
      <div className="dashboard">
        {selectedOffering ? (
          <Space direction="vertical" size={16} className="w-full">
            <Breadcrumb
              items={[
                {
                  title: (
                    <Typography.Link
                      onClick={() => setSelectedOfferingId(null)}
                    >
                      Applications
                    </Typography.Link>
                  ),
                },
                { title: selectedOffering.name },
              ]}
            />
            <Card className="ka-hero-card" bordered={false}>
              <Space direction="vertical" size={6}>
                <Typography.Title level={3} className="!m-0">
                  Postulaciones
                </Typography.Title>

                <Typography.Text type="secondary">
                  {selectedOffering.name}
                </Typography.Text>

                <Space size={8} wrap>
                  <span className="ka-stat-chip ka-stat-chip--warning">
                    Pendientes: <strong>{selectedOffering.pending}</strong>
                  </span>

                  <span className="ka-stat-chip">
                    Total: <strong>{selectedOffering.total}</strong>
                  </span>
                </Space>
              </Space>
            </Card>

            {applicationsError ? (
              <Alert
                type="warning"
                message="Datos incompletos"
                description={applicationsError}
                showIcon
              />
            ) : null}

            <Card className="dashboard-card">
              <OfferingApplicationsTable
                loading={loadingApplications}
                data={applicationsData.items}
                total={applicationsData.total}
                page={page}
                pageSize={pageSize}
                status={statusFilter}
                query={searchQuery}
                onStatusChange={(value) => {
                  setStatusFilter(value);
                  setPage(1);
                }}
                onQueryChange={(value) => {
                  setSearchQuery(value);
                  setPage(1);
                }}
                onPageChange={(nextPage, nextPageSize) => {
                  setPage(nextPage);
                  setPageSize(nextPageSize);
                }}
                onApprove={handleApprove}
                onReject={handleReject}
                disableReject
                onView={(record) =>
                  message.info(`Detalle de ${record.student.fullName}`)
                }
              />
            </Card>
          </Space>
        ) : (
          <Space direction="vertical" size={8} className="w-full">
            <Typography.Title level={3} className="!m-0">
              Postulaciones
            </Typography.Title>
            <Typography.Text type="secondary">
              Postulaciones pendientes de aprobación
            </Typography.Text>
            {error ? (
              <Alert
                type="warning"
                message="Datos incompletos"
                description={error}
                showIcon
              />
            ) : null}
            <OfferingsGrid
              offerings={offerings}
              loading={loading}
              onOpen={handleOpenOffering}
            />
          </Space>
        )}
      </div>

      <Modal
        open={Boolean(modalState.action)}
        title={
          modalState.action === "approve"
            ? "Aprobar postulación"
            : "Rechazar postulación"
        }
        onCancel={handleCloseModal}
        onOk={handleConfirmAction}
        okText="Confirmar"
        cancelText="Cancelar"
        confirmLoading={modalState.loading}
      >
        <Typography.Text>
          {modalState.action === "approve"
            ? "¿Seguro que deseas aprobar a este estudiante?"
            : "¿Seguro que deseas rechazar esta postulación?"}
        </Typography.Text>
      </Modal>
    </DashboardLayout>
  );
}
