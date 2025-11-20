import React from 'react';
import { Card, Typography, Alert } from 'antd';
import { LockOutlined } from '@ant-design/icons';

const { Title } = Typography;

export const RateLimitingTab: React.FC = () => {
  return (
    <div className="rate-limiting-tab">
      <Card>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <LockOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
          <Title level={3}>Rate Limiting</Title>
          <Alert
            message="Rate Limiting Management"
            description="This section will contain rate limiting rule configuration, quota management, throttling controls, and traffic analysis tools."
            type="info"
            showIcon
            style={{ textAlign: 'left' }}
          />
        </div>
      </Card>
    </div>
  );
};