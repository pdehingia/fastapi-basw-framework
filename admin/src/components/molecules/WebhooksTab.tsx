import React, { useState } from 'react';
import {
  Table,
  Card,
  Button,
  Space,
  Badge,
  Input,
  Select,
  Dropdown,
  Menu,
  Modal,
  Form,
  Switch,
  Tag,
  Drawer,
  Typography,
  Statistic,
  Timeline,
  Alert,
  Tabs,
  List,
  Avatar,
} from 'antd';
import {
  SendOutlined,
  PlusOutlined,
  SearchOutlined,
  MoreOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PauseOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  BugOutlined,
} from '@ant-design/icons';
import {
  useWebhookEndpoints,
  useCreateWebhookEndpoint,
  usePauseWebhookEndpoint,
  useResumeWebhookEndpoint,
  useTestWebhookEndpoint,
  useWebhookDeliveries,
} from '../../hooks/api/useIntegrations';
import type { WebhookEndpoint, WebhookDelivery, CreateWebhookEndpointRequest } from '../../types/api.types';

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

interface WebhookActionsProps {
  webhook: WebhookEndpoint;
  onEdit: (webhook: WebhookEndpoint) => void;
  onView: (webhook: WebhookEndpoint) => void;
}

const WebhookActions: React.FC<WebhookActionsProps> = ({ webhook, onEdit, onView }) => {
  const { mutate: pauseWebhook } = usePauseWebhookEndpoint();
  const { mutate: resumeWebhook } = useResumeWebhookEndpoint();
  const { mutate: testWebhook } = useTestWebhookEndpoint();

  const handleAction = (action: string) => {
    switch (action) {
      case 'edit':
        onEdit(webhook);
        break;
      case 'view':
        onView(webhook);
        break;
      case 'pause':
        pauseWebhook(webhook.id);
        break;
      case 'resume':
        resumeWebhook(webhook.id);
        break;
      case 'test':
        testWebhook({ id: webhook.id });
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
      <Menu.Item key="test" icon={<BugOutlined />}>
        Test Webhook
      </Menu.Item>
      <Menu.Divider />
      {webhook.status === 'active' ? (
        <Menu.Item key="pause" icon={<PauseOutlined />}>
          Pause
        </Menu.Item>
      ) : (
        <Menu.Item key="resume" icon={<PlayCircleOutlined />}>
          Resume
        </Menu.Item>
      )}
    </Menu>
  );

  return (
    <Dropdown overlay={menu} trigger={['click']}>
      <Button type="text" icon={<MoreOutlined />} />
    </Dropdown>
  );
};

interface CreateWebhookModalProps {
  open: boolean;
  onClose: () => void;
}

const CreateWebhookModal: React.FC<CreateWebhookModalProps> = ({ open, onClose }) => {
  const [form] = Form.useForm();
  const { mutate: createWebhook, isLoading } = useCreateWebhookEndpoint();

  const handleSubmit = (values: CreateWebhookEndpointRequest) => {
    createWebhook(values, {
      onSuccess: () => {
        form.resetFields();
        onClose();
      },
    });
  };

  return (
    <Modal
      title="Create Webhook Endpoint"
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
          Create Webhook
        </Button>,
      ]}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="url"
          label="Webhook URL"
          rules={[
            { required: true, message: 'Please enter webhook URL' },
            { type: 'url', message: 'Please enter a valid URL' },
          ]}
        >
          <Input placeholder="https://your-app.com/webhooks" />
        </Form.Item>

        <Form.Item
          name="events"
          label="Events to Subscribe"
          rules={[{ required: true, message: 'Please select at least one event' }]}
        >
          <Select
            mode="multiple"
            placeholder="Select events"
            options={[
              { value: 'user.created', label: 'User Created' },
              { value: 'user.updated', label: 'User Updated' },
              { value: 'booking.created', label: 'Booking Created' },
              { value: 'booking.cancelled', label: 'Booking Cancelled' },
              { value: 'payment.completed', label: 'Payment Completed' },
            ]}
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
        >
          <TextArea
            rows={3}
            placeholder="Brief description of this webhook endpoint"
          />
        </Form.Item>

        <Form.Item
          name="active"
          label="Active"
          valuePropName="checked"
          initialValue={true}
        >
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
};

interface DeliveryDetailsProps {
  delivery: WebhookDelivery;
}

const DeliveryDetails: React.FC<DeliveryDetailsProps> = ({ delivery }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'failed':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'pending':
        return <ClockCircleOutlined style={{ color: '#faad14' }} />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  return (
    <div className="delivery-details">
      <div className="delivery-header">
        <Space>
          {getStatusIcon(delivery.status)}
          <Text strong>{delivery.event_type}</Text>
          <Text type="secondary">
            {new Date(delivery.created_at).toLocaleString()}
          </Text>
        </Space>
      </div>
      
      <div className="delivery-body">
        <Tabs defaultActiveKey="request">
          <TabPane tab="Request" key="request">
            <div className="code-block">
              <Text strong>Headers:</Text>
              <pre>{JSON.stringify(delivery.request_headers, null, 2)}</pre>
              
              <Text strong>Payload:</Text>
              <pre>{JSON.stringify(delivery.payload, null, 2)}</pre>
            </div>
          </TabPane>
          
          <TabPane tab="Response" key="response">
            <div className="response-info">
              <div className="response-row">
                <Text strong>Status Code:</Text>
                <Badge
                  status={delivery.response_status >= 200 && delivery.response_status < 300 ? 'success' : 'error'}
                  text={delivery.response_status}
                />
              </div>
              
              <div className="response-row">
                <Text strong>Response Time:</Text>
                <Text>{delivery.response_time}ms</Text>
              </div>
              
              {delivery.response_headers && (
                <>
                  <Text strong>Headers:</Text>
                  <pre>{JSON.stringify(delivery.response_headers, null, 2)}</pre>
                </>
              )}
              
              {delivery.response_body && (
                <>
                  <Text strong>Body:</Text>
                  <pre>{delivery.response_body}</pre>
                </>
              )}
              
              {delivery.error_message && (
                <>
                  <Text strong>Error:</Text>
                  <Alert
                    message={delivery.error_message}
                    type="error"
                    showIcon
                  />
                </>
              )}
            </div>
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export const WebhooksTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookEndpoint | null>(null);
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);

  const { data: webhooksData, isLoading } = useWebhookEndpoints({
    search: searchTerm || undefined,
    status: statusFilter !== 'all' ? statusFilter as any : undefined,
  });

  const { data: deliveriesData } = useWebhookDeliveries({
    webhook_id: selectedWebhook?.id,
    limit: 50,
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'success', text: 'Active' },
      paused: { color: 'warning', text: 'Paused' },
      inactive: { color: 'default', text: 'Inactive' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return <Badge status={config.color as any} text={config.text} />;
  };

  const getEventTags = (events: string[]) => (
    <Space wrap>
      {events.slice(0, 3).map(event => (
        <Tag key={event} color="blue">{event}</Tag>
      ))}
      {events.length > 3 && (
        <Tag>+{events.length - 3} more</Tag>
      )}
    </Space>
  );

  const getDeliveryStats = (webhook: WebhookEndpoint) => {
    const total = webhook.delivery_stats?.total || 0;
    const successful = webhook.delivery_stats?.successful || 0;
    const failed = webhook.delivery_stats?.failed || 0;
    const successRate = total > 0 ? ((successful / total) * 100).toFixed(1) : '0.0';

    return (
      <div>
        <Text>{successRate}% success</Text>
        <br />
        <Text type="secondary" style={{ fontSize: 12 }}>
          {successful}/{total} delivered
        </Text>
      </div>
    );
  };

  const columns = [
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      render: (url: string) => (
        <Text code style={{ fontSize: 12 }}>{url}</Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusBadge(status),
    },
    {
      title: 'Events',
      dataIndex: 'events',
      key: 'events',
      render: (events: string[]) => getEventTags(events),
    },
    {
      title: 'Success Rate',
      key: 'success_rate',
      render: (_, record: WebhookEndpoint) => getDeliveryStats(record),
    },
    {
      title: 'Last Delivery',
      dataIndex: 'last_delivery_at',
      key: 'last_delivery',
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
      render: (_, record: WebhookEndpoint) => (
        <WebhookActions
          webhook={record}
          onEdit={(webhook) => {
            // Open edit modal
          }}
          onView={(webhook) => {
            setSelectedWebhook(webhook);
            setDetailsDrawerOpen(true);
          }}
        />
      ),
    },
  ];

  return (
    <div className="webhooks-tab">
      <Card className="filters-card" size="small">
        <Space size="middle" wrap>
          <Search
            placeholder="Search webhooks..."
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
            <Option value="paused">Paused</Option>
            <Option value="inactive">Inactive</Option>
          </Select>
          
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalOpen(true)}
          >
            Add Webhook
          </Button>
        </Space>
      </Card>

      {webhooksData?.stats && (
        <Card className="summary-stats" size="small">
          <Space size="large">
            <Statistic title="Total Webhooks" value={webhooksData.stats.total} />
            <Statistic title="Active" value={webhooksData.stats.active} valueStyle={{ color: '#52c41a' }} />
            <Statistic title="Deliveries (24h)" value={webhooksData.stats.deliveries_24h} />
            <Statistic title="Success Rate" value={`${webhooksData.stats.success_rate}%`} />
          </Space>
        </Card>
      )}

      <Card>
        <Table
          columns={columns}
          dataSource={webhooksData?.webhooks}
          loading={isLoading}
          rowKey="id"
          pagination={{
            total: webhooksData?.total,
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} webhooks`,
          }}
        />
      </Card>

      <CreateWebhookModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

      <Drawer
        title="Webhook Details"
        placement="right"
        width={800}
        open={detailsDrawerOpen}
        onClose={() => setDetailsDrawerOpen(false)}
      >
        {selectedWebhook && (
          <div className="webhook-details">
            <Tabs defaultActiveKey="details">
              <TabPane tab="Details" key="details">
                <div className="detail-section">
                  <Title level={4}>Endpoint Information</Title>
                  <div className="detail-row">
                    <Text strong>URL:</Text>
                    <Text code>{selectedWebhook.url}</Text>
                  </div>
                  <div className="detail-row">
                    <Text strong>Status:</Text>
                    {getStatusBadge(selectedWebhook.status)}
                  </div>
                  <div className="detail-row">
                    <Text strong>Created:</Text>
                    <Text>{new Date(selectedWebhook.created_at).toLocaleString()}</Text>
                  </div>
                </div>

                <div className="detail-section">
                  <Title level={4}>Events</Title>
                  <Space wrap>
                    {selectedWebhook.events.map(event => (
                      <Tag key={event} color="blue">{event}</Tag>
                    ))}
                  </Space>
                </div>

                <div className="detail-section">
                  <Title level={4}>Delivery Statistics</Title>
                  {selectedWebhook.delivery_stats && (
                    <Space size="large">
                      <Statistic title="Total" value={selectedWebhook.delivery_stats.total} />
                      <Statistic title="Successful" value={selectedWebhook.delivery_stats.successful} valueStyle={{ color: '#52c41a' }} />
                      <Statistic title="Failed" value={selectedWebhook.delivery_stats.failed} valueStyle={{ color: '#ff4d4f' }} />
                    </Space>
                  )}
                </div>
              </TabPane>
              
              <TabPane tab="Recent Deliveries" key="deliveries">
                {deliveriesData?.deliveries && deliveriesData.deliveries.length > 0 ? (
                  <List
                    dataSource={deliveriesData.deliveries}
                    renderItem={(delivery) => (
                      <List.Item key={delivery.id}>
                        <DeliveryDetails delivery={delivery} />
                      </List.Item>
                    )}
                  />
                ) : (
                  <Alert
                    message="No deliveries found"
                    description="This webhook hasn't received any events yet."
                    type="info"
                    showIcon
                  />
                )}
              </TabPane>
            </Tabs>
          </div>
        )}
      </Drawer>
    </div>
  );
};