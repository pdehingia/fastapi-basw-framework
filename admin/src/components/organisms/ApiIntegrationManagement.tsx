import React, { useState } from 'react';
import { Card, Button, Tabs, Badge, Menu, Dropdown, Space } from 'antd';
import {
  ApiOutlined,
  KeyOutlined,
  SendOutlined,
  LinkOutlined,
  FileTextOutlined,
  BarChartOutlined,
  LockOutlined,
  PlusOutlined,
  SettingOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { ApiKeysTab } from '../molecules/ApiKeysTab';
import { WebhooksTab } from '../molecules/WebhooksTab';
import { IntegrationsTab } from '../molecules/IntegrationsTab';
import { ApiDocumentationTab } from '../molecules/ApiDocumentationTab';
import { ApiAnalyticsTab } from '../molecules/ApiAnalyticsTab';
import { RateLimitingTab } from '../molecules/RateLimitingTab';
import { useApiKeyStats } from '../../hooks/api/useIntegrations';
import './ApiIntegrationManagement.css';

const { TabPane } = Tabs;

interface QuickStatsProps {
  stats: {
    total_api_keys: number;
    active_api_keys: number;
    suspended_api_keys: number;
    total_requests_24h: number;
    error_rate_24h: number;
    avg_response_time: number;
  };
}

const QuickStats: React.FC<QuickStatsProps> = ({ stats }) => (
  <div className="api-integration-stats">
    <div className="stats-grid">
      <Card size="small" className="stat-card">
        <div className="stat-content">
          <div className="stat-number">{stats.total_api_keys}</div>
          <div className="stat-label">Total API Keys</div>
          <Badge
            count={stats.active_api_keys}
            style={{ backgroundColor: '#52c41a' }}
            className="stat-badge"
          />
        </div>
      </Card>
      
      <Card size="small" className="stat-card">
        <div className="stat-content">
          <div className="stat-number">{stats.total_requests_24h.toLocaleString()}</div>
          <div className="stat-label">Requests (24h)</div>
          <div className="stat-trend positive">
            +12% from yesterday
          </div>
        </div>
      </Card>
      
      <Card size="small" className="stat-card">
        <div className="stat-content">
          <div className="stat-number">{stats.error_rate_24h.toFixed(2)}%</div>
          <div className="stat-label">Error Rate</div>
          <div className={`stat-trend ${stats.error_rate_24h < 1 ? 'positive' : 'negative'}`}>
            {stats.error_rate_24h < 1 ? 'Good' : 'High'}
          </div>
        </div>
      </Card>
      
      <Card size="small" className="stat-card">
        <div className="stat-content">
          <div className="stat-number">{stats.avg_response_time}ms</div>
          <div className="stat-label">Avg Response</div>
          <div className={`stat-trend ${stats.avg_response_time < 200 ? 'positive' : 'negative'}`}>
            {stats.avg_response_time < 200 ? 'Fast' : 'Slow'}
          </div>
        </div>
      </Card>
    </div>
  </div>
);

export const ApiIntegrationManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('api-keys');
  const [refreshing, setRefreshing] = useState(false);
  
  const { data: apiKeyStats, isLoading: statsLoading } = useApiKeyStats();

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 1000);
  };

  const quickActionsMenu = (
    <Menu>
      <Menu.Item key="api-key" icon={<KeyOutlined />}>
        Create API Key
      </Menu.Item>
      <Menu.Item key="webhook" icon={<SendOutlined />}>
        Add Webhook
      </Menu.Item>
      <Menu.Item key="integration" icon={<LinkOutlined />}>
        New Integration
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="documentation" icon={<FileTextOutlined />}>
        Generate Docs
      </Menu.Item>
    </Menu>
  );

  const tabItems = [
    {
      key: 'api-keys',
      label: (
        <span>
          <KeyOutlined />
          API Keys
          {apiKeyStats && (
            <Badge 
              count={apiKeyStats.total_api_keys} 
              style={{ marginLeft: 8 }} 
              showZero 
            />
          )}
        </span>
      ),
      children: <ApiKeysTab />,
    },
    {
      key: 'webhooks',
      label: (
        <span>
          <SendOutlined />
          Webhooks
        </span>
      ),
      children: <WebhooksTab />,
    },
    {
      key: 'integrations',
      label: (
        <span>
          <LinkOutlined />
          Integrations
        </span>
      ),
      children: <IntegrationsTab />,
    },
    {
      key: 'documentation',
      label: (
        <span>
          <FileTextOutlined />
          Documentation
        </span>
      ),
      children: <ApiDocumentationTab />,
    },
    {
      key: 'analytics',
      label: (
        <span>
          <BarChartOutlined />
          Analytics
        </span>
      ),
      children: <ApiAnalyticsTab />,
    },
    {
      key: 'rate-limiting',
      label: (
        <span>
          <LockOutlined />
          Rate Limiting
        </span>
      ),
      children: <RateLimitingTab />,
    },
  ];

  return (
    <div className="api-integration-management">
      <Card className="page-header" bordered={false}>
        <div className="header-content">
          <div className="header-left">
            <div className="page-title">
              <ApiOutlined className="title-icon" />
              <div>
                <h1>API Integration Management</h1>
                <p>Manage API keys, webhooks, integrations, and monitoring</p>
              </div>
            </div>
          </div>
          
          <div className="header-actions">
            <Space size="middle">
              <Button
                icon={<ReloadOutlined spin={refreshing} />}
                onClick={handleRefresh}
                disabled={refreshing}
              >
                Refresh
              </Button>
              
              <Dropdown overlay={quickActionsMenu} trigger={['click']}>
                <Button type="primary" icon={<PlusOutlined />}>
                  Quick Actions
                </Button>
              </Dropdown>
              
              <Button icon={<SettingOutlined />}>
                Settings
              </Button>
            </Space>
          </div>
        </div>
      </Card>

      {apiKeyStats && !statsLoading && (
        <QuickStats stats={apiKeyStats} />
      )}

      <Card className="main-content" bordered={false}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          type="card"
          size="large"
          items={tabItems}
          className="api-integration-tabs"
        />
      </Card>
    </div>
  );
};