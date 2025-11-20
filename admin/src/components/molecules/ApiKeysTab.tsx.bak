import React, { useState } from 'react';
import {
  Table,
  Card,
  Button,
  Space,
  Badge,
  Tooltip,
  Input,
  Select,
  Dropdown,
  Menu,
  Modal,
  Form,
  Switch,
  DatePicker,
  Tag,
  Drawer,
  Typography,
  Statistic,
  Progress,
  Alert,
} from 'antd';
import {
  KeyOutlined,
  PlusOutlined,
  SearchOutlined,
  MoreOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  PauseOutlined,
  PlayCircleOutlined,
  CopyOutlined,
  BarChartOutlined,
  SecurityScanOutlined,
} from '@ant-design/icons';
import { useApiKeys, useCreateApiKey, useUpdateApiKey, useRevokeApiKey, useSuspendApiKey, useActivateApiKey, useRotateApiKey } from '../../hooks/api/useIntegrations';
import type { ApiKey, CreateApiKeyRequest } from '../../types/api.types';

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

interface ApiKeyActionsProps {
  apiKey: ApiKey;
  onEdit: (apiKey: ApiKey) => void;
  onView: (apiKey: ApiKey) => void;
  onViewUsage: (apiKey: ApiKey) => void;
}

const ApiKeyActions: React.FC<ApiKeyActionsProps> = ({ apiKey, onEdit, onView, onViewUsage }) => {
  const { mutate: suspendApiKey } = useSuspendApiKey();
  const { mutate: activateApiKey } = useActivateApiKey();
  const { mutate: revokeApiKey } = useRevokeApiKey();
  const { mutate: rotateApiKey } = useRotateApiKey();

  const handleAction = (action: string) => {
    switch (action) {
      case 'edit':
        onEdit(apiKey);
        break;
      case 'view':
        onView(apiKey);
        break;
      case 'usage':
        onViewUsage(apiKey);
        break;
      case 'suspend':
        suspendApiKey(apiKey.id);
        break;
      case 'activate':
        activateApiKey(apiKey.id);
        break;
      case 'rotate':
        Modal.confirm({
          title: 'Rotate API Key',
          content: 'This will generate a new secret key. The old key will become invalid immediately. Continue?',
          onOk: () => rotateApiKey(apiKey.id),
        });
        break;
      case 'revoke':
        Modal.confirm({
          title: 'Revoke API Key',
          content: 'This action cannot be undone. The API key will be permanently disabled.',
          okType: 'danger',
          onOk: () => revokeApiKey(apiKey.id),
        });
        break;
    }
  };

  const menu = (
    <Menu onClick={({ key }) => handleAction(key)}>
      <Menu.Item key="view" icon={<EyeOutlined />}>
        View Details
      </Menu.Item>
      <Menu.Item key="edit" icon={<EditOutlined />}>
        Edit
      </Menu.Item>
      <Menu.Item key="usage" icon={<BarChartOutlined />}>
        View Usage
      </Menu.Item>
      <Menu.Divider />
      {apiKey.status === 'active' ? (
        <Menu.Item key="suspend" icon={<PauseOutlined />}>
          Suspend
        </Menu.Item>
      ) : (
        <Menu.Item key="activate" icon={<PlayCircleOutlined />}>
          Activate
        </Menu.Item>
      )}
      <Menu.Item key="rotate" icon={<ReloadOutlined />}>
        Rotate Key
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="revoke" danger icon={<DeleteOutlined />}>
        Revoke
      </Menu.Item>
    </Menu>
  );

  return (
    <Dropdown overlay={menu} trigger={['click']}>
      <Button type="text" icon={<MoreOutlined />} />
    </Dropdown>
  );
};

interface CreateApiKeyModalProps {
  open: boolean;
  onClose: () => void;
}

const CreateApiKeyModal: React.FC<CreateApiKeyModalProps> = ({ open, onClose }) => {
  const [form] = Form.useForm();
  const { mutate: createApiKey, isLoading } = useCreateApiKey();

  const handleSubmit = (values: CreateApiKeyRequest) => {
    createApiKey(values, {
      onSuccess: () => {
        form.resetFields();
        onClose();
      },
    });
  };

  return (
    <Modal
      title="Create API Key"
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="create"
          type="primary"
          loading={isLoading}
          onClick={() => form.submit()}
        >
          Create API Key
        </Button>,
      ]}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          permissions: [],
          rate_limit_per_minute: 100,
          expires_at: null,
        }}
      >
        <Form.Item
          name="name"
          label="API Key Name"
          rules={[{ required: true, message: 'Please enter a name' }]}
        >
          <Input placeholder="e.g., Mobile App Production" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
        >
          <TextArea
            rows={3}
            placeholder="Brief description of what this API key will be used for"
          />
        </Form.Item>

        <Form.Item
          name="permissions"
          label="Permissions"
          rules={[{ required: true, message: 'Please select at least one permission' }]}
        >
          <Select
            mode="multiple"
            placeholder="Select permissions"
            options={[
              { value: 'read', label: 'Read' },
              { value: 'write', label: 'Write' },
              { value: 'delete', label: 'Delete' },
              { value: 'admin', label: 'Admin' },
            ]}
          />
        </Form.Item>

        <Form.Item
          name="rate_limit_per_minute"
          label="Rate Limit (requests per minute)"
        >
          <Input type="number" min={1} max={10000} />
        </Form.Item>

        <Form.Item
          name="ip_whitelist"
          label="IP Whitelist (optional)"
        >
          <Input placeholder="e.g., 192.168.1.1,10.0.0.1" />
        </Form.Item>

        <Form.Item
          name="expires_at"
          label="Expiration Date (optional)"
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export const ApiKeysTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedApiKey, setSelectedApiKey] = useState<ApiKey | null>(null);
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);

  const { data: apiKeysData, isLoading } = useApiKeys({
    search: searchTerm || undefined,
    status: statusFilter !== 'all' ? statusFilter as any : undefined,
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'success', text: 'Active' },
      suspended: { color: 'warning', text: 'Suspended' },
      revoked: { color: 'error', text: 'Revoked' },
      expired: { color: 'default', text: 'Expired' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return <Badge status={config.color as any} text={config.text} />;
  };

  const getUsageProgress = (used: number, limit: number) => {
    const percentage = (used / limit) * 100;
    let status: 'success' | 'normal' | 'exception' = 'normal';
    if (percentage >= 90) status = 'exception';
    else if (percentage >= 70) status = 'normal';
    else status = 'success';

    return (
      <div style={{ width: 120 }}>
        <Progress
          percent={Math.min(percentage, 100)}
          size="small"
          status={status}
          showInfo={false}
        />
        <Text type="secondary" style={{ fontSize: 12 }}>
          {used.toLocaleString()} / {limit.toLocaleString()}
        </Text>
      </div>
    );
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: ApiKey) => (
        <div>
          <Text strong>{name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.key_prefix}***
          </Text>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusBadge(status),
    },
    {
      title: 'Permissions',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions: string[]) => (
        <Space wrap>
          {permissions.slice(0, 2).map(permission => (
            <Tag key={permission}>{permission}</Tag>
          ))}
          {permissions.length > 2 && (
            <Tag>+{permissions.length - 2} more</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Usage (24h)',
      dataIndex: 'usage_24h',
      key: 'usage',
      render: (usage: number, record: ApiKey) => 
        getUsageProgress(usage, record.rate_limit_per_minute * 60 * 24),
    },
    {
      title: 'Last Used',
      dataIndex: 'last_used_at',
      key: 'last_used',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : 'Never',
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record: ApiKey) => (
        <ApiKeyActions
          apiKey={record}
          onEdit={(apiKey) => {
            setSelectedApiKey(apiKey);
            // Open edit modal
          }}
          onView={(apiKey) => {
            setSelectedApiKey(apiKey);
            setDetailsDrawerOpen(true);
          }}
          onViewUsage={(apiKey) => {
            // Open usage analytics
          }}
        />
      ),
    },
  ];

  return (
    <div className="api-keys-tab">
      <Card className="filters-card" size="small">
        <Space size="middle" wrap>
          <Search
            placeholder="Search API keys..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 120 }}
          >
            <Option value="all">All Status</Option>
            <Option value="active">Active</Option>
            <Option value="suspended">Suspended</Option>
            <Option value="revoked">Revoked</Option>
            <Option value="expired">Expired</Option>
          </Select>
          
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalOpen(true)}
          >
            Create API Key
          </Button>
        </Space>
      </Card>

      {apiKeysData?.stats && (
        <Card className="summary-stats" size="small">
          <Space size="large">
            <Statistic title="Total Keys" value={apiKeysData.stats.total} />
            <Statistic title="Active" value={apiKeysData.stats.active} valueStyle={{ color: '#52c41a' }} />
            <Statistic title="Requests (24h)" value={apiKeysData.stats.requests_24h} />
            <Statistic title="Error Rate" value={`${apiKeysData.stats.error_rate}%`} valueStyle={{ color: '#f5222d' }} />
          </Space>
        </Card>
      )}

      <Card>
        <Table
          columns={columns}
          dataSource={apiKeysData?.api_keys}
          loading={isLoading}
          rowKey="id"
          pagination={{
            total: apiKeysData?.total,
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} API keys`,
          }}
        />
      </Card>

      <CreateApiKeyModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

      <Drawer
        title="API Key Details"
        placement="right"
        width={600}
        open={detailsDrawerOpen}
        onClose={() => setDetailsDrawerOpen(false)}
      >
        {selectedApiKey && (
          <div className="api-key-details">
            <div className="detail-section">
              <Title level={4}>Basic Information</Title>
              <div className="detail-row">
                <Text strong>Name:</Text>
                <Text>{selectedApiKey.name}</Text>
              </div>
              <div className="detail-row">
                <Text strong>Status:</Text>
                {getStatusBadge(selectedApiKey.status)}
              </div>
              <div className="detail-row">
                <Text strong>Created:</Text>
                <Text>{new Date(selectedApiKey.created_at).toLocaleString()}</Text>
              </div>
              {selectedApiKey.expires_at && (
                <div className="detail-row">
                  <Text strong>Expires:</Text>
                  <Text>{new Date(selectedApiKey.expires_at).toLocaleString()}</Text>
                </div>
              )}
            </div>

            <div className="detail-section">
              <Title level={4}>Permissions</Title>
              <Space wrap>
                {selectedApiKey.permissions.map(permission => (
                  <Tag key={permission} color="blue">{permission}</Tag>
                ))}
              </Space>
            </div>

            <div className="detail-section">
              <Title level={4}>Usage Statistics</Title>
              <div className="detail-row">
                <Text strong>Rate Limit:</Text>
                <Text>{selectedApiKey.rate_limit_per_minute} requests/minute</Text>
              </div>
              <div className="detail-row">
                <Text strong>Last Used:</Text>
                <Text>
                  {selectedApiKey.last_used_at 
                    ? new Date(selectedApiKey.last_used_at).toLocaleString()
                    : 'Never'}
                </Text>
              </div>
            </div>

            {selectedApiKey.ip_whitelist && (
              <div className="detail-section">
                <Title level={4}>IP Whitelist</Title>
                <Paragraph>
                  <pre>{selectedApiKey.ip_whitelist}</pre>
                </Paragraph>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};