import { useMemo } from "react";
import { Alert, Form, Modal, Select, Space, Tag, Typography } from "antd";
import type { PracticaRoleOptions } from "../../../types/academics";

type PracticaRolesModalProps = {
  open: boolean;
  loading: boolean;
  options: PracticaRoleOptions | null;
  error?: string | null;
  onCancel: () => void;
  onSubmit: (role1: string, role2: string) => void;
};

export function PracticaRolesModal({
  open,
  loading,
  options,
  error,
  onCancel,
  onSubmit,
}: PracticaRolesModalProps) {
  const [form] = Form.useForm<{ role1: string; role2: string }>();

  const selectableOptions = useMemo(() => {
    return (options?.selectableRoles ?? []).map((role) => ({
      value: role,
      label: role,
    }));
  }, [options?.selectableRoles]);

  const handleOk = async () => {
    const values = await form.validateFields();
    if (values.role1 === values.role2) {
      form.setFields([
        {
          name: "role2",
          errors: ["No puedes repetir el mismo rol."],
        },
      ]);
      return;
    }
    onSubmit(values.role1, values.role2);
  };

  return (
    <Modal
      open={open}
      title="Elegir roles de Práctica Interna"
      onCancel={onCancel}
      onOk={handleOk}
      okText="Guardar"
      confirmLoading={loading}
      destroyOnClose
    >
      <Space direction="vertical" size={12} className="w-full">
        {error ? (
          <Alert type="error" message={error} showIcon />
        ) : null}
        <div>
          <Typography.Text type="secondary">Rol obligatorio</Typography.Text>
          <div className="mt-2">
            <Tag color="blue">{options?.mandatoryRole ?? "N/A"}</Tag>
          </div>
        </div>
        {options?.selectableRoles?.length ? (
          <div>
            <Typography.Text type="secondary">Roles disponibles</Typography.Text>
            <div className="mt-2 flex flex-wrap gap-2">
              {options.selectableRoles.map((role) => (
                <Tag key={role}>{role}</Tag>
              ))}
            </div>
          </div>
        ) : null}
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item
            label="Preferencia 1"
            name="role1"
            rules={[{ required: true, message: "Selecciona un rol" }]}
          >
            <Select options={selectableOptions} placeholder="Elige un rol" />
          </Form.Item>
          <Form.Item
            label="Preferencia 2"
            name="role2"
            rules={[{ required: true, message: "Selecciona un rol" }]}
          >
            <Select options={selectableOptions} placeholder="Elige un rol" />
          </Form.Item>
        </Form>
      </Space>
    </Modal>
  );
}
