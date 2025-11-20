import React, { useState } from 'react';
import {
  Card,
  Button,
  Space,
  Badge,
  Input,
  Select,
  Row,
  Col,
  Avatar,
  Typography,
  Tag,
  Modal,
  Form,
  Switch,
  Tabs,
  Alert,
  Progress,
  List,
  Statistic,
  Empty,
} from 'antd';
import {
  LinkOutlined,
  PlusOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  DisconnectOutlined,
  SettingOutlined,
  PlayCircleOutlined,
  BugOutlined,
  ApiOutlined,
  CloudServerOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import {
  useIntegrations,
  useIntegrationTemplates,
  useTestIntegration,
  useHealthCheckIntegration,
  useInstallIntegrationFromTemplate,
} from '../../hooks/api/useIntegrations';
import type { ThirdPartyIntegration, IntegrationTemplate, CreateThirdPartyIntegrationRequest } from '../../types/api.types';

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

interface IntegrationCardProps {
  integration: ThirdPartyIntegration;
  onConfigure: (integration: ThirdPartyIntegration) => void;
  onTest: (integration: ThirdPartyIntegration) => void;
  onHealthCheck: (integration: ThirdPartyIntegration) => void;
}

const IntegrationCard: React.FC<IntegrationCardProps> = ({
  integration,
  onConfigure,
  onTest,
  onHealthCheck,
}) => {
  const getStatusBadge = (status: string, healthStatus?: string) => {
    if (status === 'active' && healthStatus === 'healthy') {
      return <Badge status="success" text="Active & Healthy" />;
    } else if (status === 'active' && healthStatus === 'unhealthy') {
      return <Badge status="error" text="Active but Unhealthy" />;
    } else if (status === 'inactive') {
      return <Badge status="default" text="Inactive" />;
    } else {
      return <Badge status="warning" text="Unknown" />;
    }
  };

  const getProviderIcon = (provider: string) => {
    const icons: Record<string, React.ReactNode> = {
      stripe: <DatabaseOutlined style={{ color: '#635BFF' }} />,
      paypal: <DatabaseOutlined style={{ color: '#0070BA' }} />,
      slack: <ApiOutlined style={{ color: '#4A154B' }} />,
      discord: <ApiOutlined style={{ color: '#5865F2' }} />,
      sendgrid: <CloudServerOutlined style={{ color: '#1A82E2' }} />,
      aws: <CloudServerOutlined style={{ color: '#FF9900' }} />,
      google: <CloudServerOutlined style={{ color: '#4285F4' }} />,
    };
    return icons[provider.toLowerCase()] || <LinkOutlined />;
  };

  const getSyncProgress = () => {
    if (integration.sync_status === 'syncing') {
      return (
        <Progress
          percent={integration.sync_progress || 0}
          size="small"
          status="active"
        />
      );
    }
    return null;
  };

  return (
    <Card
      className="integration-card"
      hoverable
      actions={[
        <Button
          key="configure"
          type="text"
          icon={<SettingOutlined />}
          onClick={() => onConfigure(integration)}
        >
          Configure
        </Button>,
        <Button
          key="test"
          type="text"
          icon={<BugOutlined />}
          onClick={() => onTest(integration)}
        >
          Test
        </Button>,
        <Button
          key="health"
          type="text"
          icon={<CheckCircleOutlined />}
          onClick={() => onHealthCheck(integration)}
        >
          Health Check
        </Button>,
      ]}
    >
      <div className="integration-header">
        <div className="integration-info">
          <div className="integration-avatar">
            <Avatar size={48} icon={getProviderIcon(integration.provider)} />
          </div>
          <div className="integration-details">
            <Title level={4} style={{ margin: 0 }}>
              {integration.name}
            </Title>
            <Text type="secondary">{integration.provider}</Text>
            <div className="integration-status">
              {getStatusBadge(integration.status, integration.health_status)}
            </div>
          </div>
        </div>
      </div>
      
      <div className="integration-body">
        <Paragraph ellipsis={{ rows: 2 }}>
          {integration.description || 'No description available'}
        </Paragraph>
        
        {getSyncProgress()}
        
        <div className="integration-stats">
          <div className="stat-item">
            <Text type="secondary">Last Sync:</Text>
            <Text>
              {integration.last_sync_at
                ? new Date(integration.last_sync_at).toLocaleDateString()
                : 'Never'}
            </Text>
          </div>
          
          {integration.api_calls_24h !== undefined && (
            <div className="stat-item">
              <Text type="secondary">API Calls (24h):</Text>
              <Text>{integration.api_calls_24h.toLocaleString()}</Text>
            </div>
          )}
        </div>
        
        <div className="integration-tags">
          <Space wrap>
            {integration.tags?.map(tag => (
              <Tag key={tag} size="small">{tag}</Tag>
            )) || []}
          </Space>
        </div>
      </div>
    </Card>
  );
};

interface TemplateCardProps {
  template: IntegrationTemplate;
  onInstall: (template: IntegrationTemplate) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onInstall }) => {
  return (
    <Card
      className="template-card"
      hoverable
      cover={
        <div className="template-cover">
          <Avatar size={64} icon={<ApiOutlined />} />
        </div>
      }
      actions={[
        <Button
          key="install"
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => onInstall(template)}
        >
          Install
        </Button>,
      ]}
    >
      <div className="template-header">
        <Title level={4} style={{ margin: 0 }}>
          {template.name}
        </Title>
        <Text type="secondary">{template.provider}</Text>
      </div>
      
      <Paragraph ellipsis={{ rows: 2 }}>
        {template.description}
      </Paragraph>
      
      <div className="template-stats">
        <Space>
          <Badge count={template.version} color="blue" />
          <Text type="secondary">•</Text>
          <Text type="secondary">{template.category}</Text>
        </Space>
      </div>
    </Card>
  );
};

interface InstallTemplateModalProps {
  open: boolean;
  template: IntegrationTemplate | null;
  onClose: () => void;
}

const InstallTemplateModal: React.FC<InstallTemplateModalProps> = ({
  open,
  template,
  onClose,
}) => {
  const [form] = Form.useForm();
  const { mutate: installTemplate, isLoading } = useInstallIntegrationFromTemplate();

  const handleSubmit = (values: any) => {
    if (!template) return;
    
    installTemplate(
      {
        templateId: template.id,
        config: values,
      },
      {
        onSuccess: () => {
          form.resetFields();
          onClose();
        },
      }
    );
  };

  if (!template) return null;

  return (
    <Modal
      title={`Install ${template.name}`}
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="install"
          type="primary"
          loading={isLoading}
          onClick={() => form.submit()}
        >
          Install Integration
        </Button>,
      ]}
      width={600}
    >
      <div className="template-install">
        <div className="template-info">
          <Alert
            message={`Installing ${template.name}`}
            description={template.description}
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Integration Name"
            rules={[{ required: true, message: 'Please enter a name' }]}
            initialValue={template.name}
          >
            <Input placeholder="e.g., Production Stripe" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea
              rows={3}
              placeholder="Brief description of this integration"
            />
          </Form.Item>

          {template.config_schema?.map((field) => (
            <Form.Item
              key={field.name}
              name={field.name}
              label={field.label}
              rules={field.required ? [{ required: true, message: `${field.label} is required` }] : []}
            >
              {field.type === 'text' ? (
                <Input placeholder={field.placeholder} />
              ) : field.type === 'password' ? (
                <Input.Password placeholder={field.placeholder} />
              ) : field.type === 'textarea' ? (
                <TextArea rows={3} placeholder={field.placeholder} />
              ) : (
                <Input placeholder={field.placeholder} />
              )}
            </Form.Item>
          ))}

          <Form.Item
            name="auto_sync"
            label="Enable Auto Sync"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export const IntegrationsTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('active');
  const [selectedTemplate, setSelectedTemplate] = useState<IntegrationTemplate | null>(null);
  const [installModalOpen, setInstallModalOpen] = useState(false);

  const { data: integrationsData, isLoading: integrationsLoading } = useIntegrations({
    search: searchTerm || undefined,
    status: statusFilter !== 'all' ? statusFilter as any : undefined,
    provider: providerFilter !== 'all' ? providerFilter : undefined,
  });

  const { data: templatesData, isLoading: templatesLoading } = useIntegrationTemplates();
  
  const { mutate: testIntegration } = useTestIntegration();
  const { mutate: healthCheck } = useHealthCheckIntegration();

  const handleTestIntegration = (integration: ThirdPartyIntegration) => {
    testIntegration({
      id: integration.id,
      test_endpoint: 'health',
    });
  };

  const handleHealthCheck = (integration: ThirdPartyIntegration) => {
    healthCheck(integration.id);
  };

  const handleInstallTemplate = (template: IntegrationTemplate) => {
    setSelectedTemplate(template);
    setInstallModalOpen(true);
  };

  const providerOptions = [
    { value: 'all', label: 'All Providers' },
    { value: 'stripe', label: 'Stripe' },
    { value: 'paypal', label: 'PayPal' },
    { value: 'slack', label: 'Slack' },
    { value: 'sendgrid', label: 'SendGrid' },
    { value: 'aws', label: 'AWS' },
    { value: 'google', label: 'Google' },
  ];

  return (
    <div className="integrations-tab">
      <Card className="filters-card" size="small">
        <Space size="middle" wrap>
          <Search
            placeholder="Search integrations..."
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
            <Option value="inactive">Inactive</Option>
            <Option value="error">Error</Option>
          </Select>
          
          <Select
            value={providerFilter}
            onChange={setProviderFilter}
            style={{ width: 150 }}
            options={providerOptions}
          />
        </Space>
      </Card>

      {integrationsData?.stats && (
        <Card className="summary-stats" size="small">
          <Row gutter={16}>
            <Col span={6}>
              <Statistic title="Total Integrations" value={integrationsData.stats.total} />
            </Col>
            <Col span={6}>
              <Statistic title="Active" value={integrationsData.stats.active} valueStyle={{ color: '#52c41a' }} />
            </Col>
            <Col span={6}>
              <Statistic title="Syncing" value={integrationsData.stats.syncing} valueStyle={{ color: '#1890ff' }} />
            </Col>
            <Col span={6}>
              <Statistic title="Errors" value={integrationsData.stats.errors} valueStyle={{ color: '#ff4d4f' }} />
            </Col>
          </Row>
        </Card>
      )}

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Active Integrations" key="active">
            {integrationsData?.integrations && integrationsData.integrations.length > 0 ? (
              <Row gutter={[16, 16]}>
                {integrationsData.integrations.map((integration) => (
                  <Col xs={24} sm={12} lg={8} xl={6} key={integration.id}>
                    <IntegrationCard
                      integration={integration}
                      onConfigure={() => {
                        // Open configuration modal
                      }}
                      onTest={handleTestIntegration}
                      onHealthCheck={handleHealthCheck}
                    />
                  </Col>
                ))}
              </Row>
            ) : (
              <Empty
                description="No integrations found"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </TabPane>
          
          <TabPane tab="Available Templates" key="templates">
            {templatesData?.templates && templatesData.templates.length > 0 ? (
              <Row gutter={[16, 16]}>
                {templatesData.templates.map((template) => (
                  <Col xs={24} sm={12} lg={8} xl={6} key={template.id}>
                    <TemplateCard
                      template={template}
                      onInstall={handleInstallTemplate}
                    />
                  </Col>
                ))}
              </Row>
            ) : (
              <Empty
                description="No templates available"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </TabPane>
        </Tabs>
      </Card>

      <InstallTemplateModal
        open={installModalOpen}
        template={selectedTemplate}
        onClose={() => {
          setInstallModalOpen(false);
          setSelectedTemplate(null);
        }}
      />
    </div>
  );
};