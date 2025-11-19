import React from 'react';
import { Card, Typography, Alert } from 'antd';
import { BarChartOutlined } from '@ant-design/icons';

const { Title } = Typography;

export const ApiAnalyticsTab: React.FC = () => {
  return (
    <div className="api-analytics-tab">
      <Card>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <BarChartOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
          <Title level={3}>API Analytics</Title>
          <Alert
            message="API Analytics & Monitoring"
            description="This section will contain real-time API analytics, performance metrics, error tracking, usage statistics, and comprehensive monitoring dashboards."
            type="info"
            showIcon
            style={{ textAlign: 'left' }}
          />
        </div>
      </Card>
    </div>
  );
};