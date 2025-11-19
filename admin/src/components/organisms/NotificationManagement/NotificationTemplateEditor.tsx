/**
 * NotificationTemplateEditor Component
 * Rich editor for creating and editing notification templates with live preview
 */

import { useState, useEffect } from 'react';
import { 
  Heading, 
  Text, 
  Button, 
  Badge 
} from '@/components/atoms';
import { 
  Card, 
  CardHeader, 
  CardBody, 
  FormField,
  Modal 
} from '@/components/molecules';
import {
  useNotificationTemplate,
  useCreateNotificationTemplate,
  useUpdateNotificationTemplate,
  usePreviewTemplate,
  useTestNotificationTemplate
} from '@/hooks/api/useNotifications';
import type { NotificationTemplate, CreateNotificationTemplateRequest } from '@/types/api.types';

interface NotificationTemplateEditorProps {
  templateId?: string;
  initialType?: 'email' | 'push' | 'sms' | 'in_app';
  onSave?: (template: NotificationTemplate) => void;
  onCancel?: () => void;
  className?: string;
}

export const NotificationTemplateEditor: React.FC<NotificationTemplateEditorProps> = ({
  templateId,
  initialType = 'email',
  onSave,
  onCancel,
  className
}) => {
  // State management
  const [formData, setFormData] = useState<CreateNotificationTemplateRequest>({
    name: '',
    type: initialType,
    category: 'system',
    subject: '',
    title: '',
    body: '',
    html_body: '',
    variables: [],
    is_active: true,
    is_default: false,
    preview_data: {},
    metadata: {},
  });
  
  const [previewData, setPreviewData] = useState<Record<string, any>>({
    user_name: 'John Doe',
    user_email: 'john@example.com',
    booking_id: 'BK-123456',
    booking_date: '2025-11-25',
    artist_name: 'Sarah Johnson',
    amount: '$150.00',
    platform_name: 'Maya Platform',
  });
  
  const [showPreview, setShowPreview] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testPhone, setTestPhone] = useState('');
  const [availableVariables] = useState([
    'user_name', 'user_email', 'user_phone',
    'booking_id', 'booking_date', 'booking_time',
    'artist_name', 'artist_email', 'service_name',
    'amount', 'payment_method', 'platform_name',
    'support_email', 'unsubscribe_link'
  ]);

  // API hooks
  const { data: existingTemplate, isLoading: isLoadingTemplate } = useNotificationTemplate(templateId || '');
  const createMutation = useCreateNotificationTemplate();
  const updateMutation = useUpdateNotificationTemplate();
  const testMutation = useTestNotificationTemplate();
  
  const { data: previewResult } = usePreviewTemplate(
    templateId || 'temp',
    showPreview ? previewData : {}
  );

  // Load existing template data
  useEffect(() => {
    if (existingTemplate) {
      setFormData({
        name: existingTemplate.name,
        type: existingTemplate.type,
        category: existingTemplate.category,
        subject: existingTemplate.subject || '',
        title: existingTemplate.title || '',
        body: existingTemplate.body,
        html_body: existingTemplate.html_body || '',
        variables: existingTemplate.variables || [],
        is_active: existingTemplate.is_active,
        is_default: existingTemplate.is_default,
        preview_data: existingTemplate.preview_data || {},
        metadata: existingTemplate.metadata || {},
      });
      
      if (existingTemplate.preview_data) {
        setPreviewData(existingTemplate.preview_data);
      }
    }
  }, [existingTemplate]);

  // Update variables when body content changes
  useEffect(() => {
    const variablePattern = /\{\{(\w+)\}\}/g;
    const foundVariables = new Set<string>();
    
    const extractVariables = (text: string) => {
      let match;
      while ((match = variablePattern.exec(text)) !== null) {
        foundVariables.add(match[1]);
      }
    };

    extractVariables(formData.body);
    extractVariables(formData.subject || '');
    extractVariables(formData.title || '');
    extractVariables(formData.html_body || '');

    setFormData(prev => ({
      ...prev,
      variables: Array.from(foundVariables)
    }));
  }, [formData.body, formData.subject, formData.title, formData.html_body]);

  // Event handlers
  const handleInputChange = (field: keyof CreateNotificationTemplateRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreviewDataChange = (variable: string, value: string) => {
    setPreviewData(prev => ({
      ...prev,
      [variable]: value
    }));
  };

  const handleInsertVariable = (variable: string) => {
    const variableTag = `{{${variable}}}`;
    
    // Insert into the currently focused field (simplified - in real app you'd track cursor position)
    if (formData.type === 'email') {
      setFormData(prev => ({
        ...prev,
        body: prev.body + variableTag
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        body: prev.body + variableTag
      }));
    }
  };

  const handleSave = async () => {
    try {
      let savedTemplate;
      
      if (templateId) {
        savedTemplate = await updateMutation.mutateAsync({
          templateId,
          data: { ...formData, preview_data: previewData }
        });
      } else {
        savedTemplate = await createMutation.mutateAsync({
          ...formData,
          preview_data: previewData
        });
      }
      
      onSave?.(savedTemplate);
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const handleTest = async () => {
    if (!templateId) {
      alert('Please save the template first before testing.');
      return;
    }

    try {
      await testMutation.mutateAsync({
        templateId,
        testData: {
          recipient_email: testEmail || undefined,
          recipient_phone: testPhone || undefined,
          data: previewData
        }
      });
      setShowTestModal(false);
      setTestEmail('');
      setTestPhone('');
    } catch (error) {
      console.error('Error sending test:', error);
    }
  };

  const getTypeSpecificFields = () => {
    switch (formData.type) {
      case 'email':
        return (
          <>
            <FormField
              label="Subject Line"
              name="subject"
              type="text"
              value={formData.subject || ''}
              onChange={(value) => handleInputChange('subject', value)}
              placeholder="Enter email subject..."
              helpText="Use {{variable}} for dynamic content"
              required
            />
            <FormField
              label="HTML Body (Optional)"
              name="html_body"
              type="textarea"
              rows={8}
              value={formData.html_body || ''}
              onChange={(value) => handleInputChange('html_body', value)}
              placeholder="HTML version of the email body..."
              helpText="Rich HTML content for email clients that support it"
            />
          </>
        );
      case 'push':
        return (
          <FormField
            label="Push Title"
            name="title"
            type="text"
            value={formData.title || ''}
            onChange={(value) => handleInputChange('title', value)}
            placeholder="Enter push notification title..."
            helpText="Short, attention-grabbing title for the push notification"
            required
          />
        );
      case 'sms':
        return (
          <Text variant="caption" color="muted">
            SMS notifications use only the body content. Keep it concise (160 characters recommended).
          </Text>
        );
      case 'in_app':
        return (
          <FormField
            label="In-App Title"
            name="title"
            type="text"
            value={formData.title || ''}
            onChange={(value) => handleInputChange('title', value)}
            placeholder="Enter in-app notification title..."
            helpText="Title shown in the in-app notification center"
            required
          />
        );
      default:
        return null;
    }
  };

  if (isLoadingTemplate) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <Heading as="h1" size="2xl" className="text-gray-900">
            {templateId ? 'Edit Template' : 'Create Template'}
          </Heading>
          <Text color="muted" className="mt-1">
            {templateId ? 'Modify notification template settings and content.' : 'Create a new notification template for your campaigns.'}
          </Text>
        </div>
        <div className="flex items-center space-x-3">
          {templateId && (
            <>
              <Button
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowTestModal(true)}
              >
                Send Test
              </Button>
            </>
          )}
          <Button
            variant="secondary"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Template'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <Heading as="h3" size="lg">Basic Information</Heading>
            </CardHeader>
            <CardBody className="space-y-4">
              <FormField
                label="Template Name"
                name="name"
                type="text"
                value={formData.name}
                onChange={(value) => handleInputChange('name', value)}
                placeholder="Enter template name..."
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Notification Type"
                  name="type"
                  type="select"
                  value={formData.type}
                  onChange={(value) => handleInputChange('type', value)}
                  options={[
                    { value: 'email', label: 'Email' },
                    { value: 'push', label: 'Push Notification' },
                    { value: 'sms', label: 'SMS' },
                    { value: 'in_app', label: 'In-App Notification' },
                  ]}
                  required
                />

                <FormField
                  label="Category"
                  name="category"
                  type="select"
                  value={formData.category}
                  onChange={(value) => handleInputChange('category', value)}
                  options={[
                    { value: 'booking', label: 'Booking' },
                    { value: 'payment', label: 'Payment' },
                    { value: 'system', label: 'System' },
                    { value: 'marketing', label: 'Marketing' },
                    { value: 'security', label: 'Security' },
                  ]}
                  required
                />
              </div>

              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => handleInputChange('is_active', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <Text variant="body">Active</Text>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.is_default}
                    onChange={(e) => handleInputChange('is_default', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <Text variant="body">Default Template</Text>
                </label>
              </div>
            </CardBody>
          </Card>

          {/* Content */}
          <Card>
            <CardHeader>
              <Heading as="h3" size="lg">Content</Heading>
            </CardHeader>
            <CardBody className="space-y-4">
              {getTypeSpecificFields()}

              <FormField
                label="Body Content"
                name="body"
                type="textarea"
                rows={8}
                value={formData.body}
                onChange={(value) => handleInputChange('body', value)}
                placeholder="Enter notification content..."
                helpText="Use {{variable}} for dynamic content. Available variables are shown on the right."
                required
              />
            </CardBody>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Available Variables */}
          <Card>
            <CardHeader>
              <Heading as="h4" size="md">Available Variables</Heading>
            </CardHeader>
            <CardBody>
              <div className="space-y-2">
                {availableVariables.map((variable) => (
                  <button
                    key={variable}
                    onClick={() => handleInsertVariable(variable)}
                    className="flex items-center justify-between w-full p-2 text-left text-sm bg-gray-50 hover:bg-gray-100 rounded border"
                  >
                    <span className="font-mono">{`{{${variable}}}`}</span>
                    <span className="text-xs text-blue-600">+</span>
                  </button>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Used Variables */}
          {formData.variables.length > 0 && (
            <Card>
              <CardHeader>
                <Heading as="h4" size="md">Used Variables</Heading>
              </CardHeader>
              <CardBody>
                <div className="space-y-2">
                  {formData.variables.map((variable) => (
                    <Badge key={variable} variant="info" size="sm">
                      {`{{${variable}}}`}
                    </Badge>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Preview Data */}
          {showPreview && (
            <Card>
              <CardHeader>
                <Heading as="h4" size="md">Preview Data</Heading>
              </CardHeader>
              <CardBody className="space-y-3">
                {formData.variables.map((variable) => (
                  <div key={variable}>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {variable}
                    </label>
                    <input
                      type="text"
                      value={previewData[variable] || ''}
                      onChange={(e) => handlePreviewDataChange(variable, e.target.value)}
                      className="block w-full px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder={`Sample ${variable}`}
                    />
                  </div>
                ))}
              </CardBody>
            </Card>
          )}

          {/* Live Preview */}
          {showPreview && previewResult && (
            <Card>
              <CardHeader>
                <Heading as="h4" size="md">Live Preview</Heading>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  {previewResult.subject && (
                    <div>
                      <Text variant="caption" className="font-medium">Subject:</Text>
                      <Text variant="body" className="text-gray-900">{previewResult.subject}</Text>
                    </div>
                  )}
                  {previewResult.title && (
                    <div>
                      <Text variant="caption" className="font-medium">Title:</Text>
                      <Text variant="body" className="text-gray-900">{previewResult.title}</Text>
                    </div>
                  )}
                  <div>
                    <Text variant="caption" className="font-medium">Body:</Text>
                    <div className="mt-1 p-3 bg-gray-50 rounded text-sm">
                      {previewResult.body.split('\n').map((line, index) => (
                        <div key={index}>{line}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      {/* Test Modal */}
      <Modal
        isOpen={showTestModal}
        onClose={() => setShowTestModal(false)}
        title="Send Test Notification"
      >
        <div className="space-y-4">
          <Text>
            Send a test notification to verify the template content and formatting.
          </Text>
          
          {(formData.type === 'email' || formData.type === 'in_app') && (
            <FormField
              label="Test Email"
              name="test_email"
              type="email"
              value={testEmail}
              onChange={setTestEmail}
              placeholder="Enter email address..."
              required={formData.type === 'email'}
            />
          )}
          
          {(formData.type === 'sms' || formData.type === 'push') && (
            <FormField
              label="Test Phone"
              name="test_phone"
              type="tel"
              value={testPhone}
              onChange={setTestPhone}
              placeholder="Enter phone number..."
              required={formData.type === 'sms'}
            />
          )}
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowTestModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleTest}
              disabled={testMutation.isPending}
            >
              {testMutation.isPending ? 'Sending...' : 'Send Test'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default NotificationTemplateEditor;