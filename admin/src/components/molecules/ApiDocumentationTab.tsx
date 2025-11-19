import React from 'react';
import { Card, Typography, Alert } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';

const { Title } = Typography;

export const ApiDocumentationTab: React.FC = () => {
  return (
    <div className="api-documentation-tab">
      <Card>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <FileTextOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
          <Title level={3}>API Documentation</Title>
          <Alert
            message="API Documentation Management"
            description="This section will contain comprehensive API documentation management tools including endpoint documentation, SDK generation, and interactive API explorer."
            type="info"
            showIcon
            style={{ textAlign: 'left' }}
          />
        </div>
      </Card>
    </div>
  );
};