/**
 * Create Ticket Modal
 * Form for creating new support tickets
 */

import { useState } from 'react';
import { Button } from '../../atoms';
import { Modal, FormField } from '../../molecules';
import { useCreateSupportTicket, useSupportCategories, useSupportAgents } from '../../../hooks/api/useSupportTickets';
import type { CreateSupportTicketRequest } from '../../../types/api.types';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateTicketModal = ({ isOpen, onClose, onSuccess }: CreateTicketModalProps) => {
  const [formData, setFormData] = useState<CreateSupportTicketRequest>({
    subject: '',
    description: '',
    priority: 'medium',
    category: '',
    status: 'open',
    tags: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newTag, setNewTag] = useState('');
  
  const createTicketMutation = useCreateSupportTicket();
  const { data: categories } = useSupportCategories();
  const { data: agents } = useSupportAgents();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.subject?.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (formData.subject.trim().length < 3) {
      newErrors.subject = 'Subject must be at least 3 characters';
    }

    if (!formData.description?.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.priority) {
      newErrors.priority = 'Priority is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await createTicketMutation.mutateAsync(formData);
      onSuccess();
      resetForm();
    } catch (error) {
      console.error('Error creating support ticket:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      subject: '',
      description: '',
      priority: 'medium',
      category: '',
      status: 'open',
      tags: []
    });
    setErrors({});
    setNewTag('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const updateFormData = (field: keyof CreateSupportTicketRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && formData.tags && !formData.tags.includes(newTag.trim())) {
      updateFormData('tags', [...formData.tags, newTag.trim()]);
      setNewTag('');
    } else if (newTag.trim() && !formData.tags) {
      updateFormData('tags', [newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    if (formData.tags) {
      updateFormData('tags', formData.tags.filter(tag => tag !== tagToRemove));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Support Ticket"
      size="large"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Subject */}
        <FormField
          label="Subject"
          name="subject"
          type="text"
          value={formData.subject}
          required
          error={errors.subject}
          placeholder="Enter ticket subject"
          onChange={(e) => updateFormData('subject', e.target.value)}
        />

        {/* Description */}
        <div className="space-y-2">
          <FormField
            label="Description"
            name="description"
            type="textarea"
            value={formData.description}
            rows={4}
            required
            error={errors.description}
            placeholder="Describe the issue or request in detail"
            onChange={(e) => updateFormData('description', e.target.value)}
          />
          <div className="text-xs text-gray-500">
            {formData.description.length}/1000 characters
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category */}
          <FormField
            label="Category"
            id="category"
            required
            error={errors.category}
          >
            <select
              id="category"
              value={formData.category}
              onChange={(e) => updateFormData('category', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.category ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select category</option>
              {categories?.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </FormField>

          {/* Priority */}
          <FormField
            label="Priority"
            id="priority"
            required
            error={errors.priority}
          >
            <select
              id="priority"
              value={formData.priority}
              onChange={(e) => updateFormData('priority', e.target.value as any)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.priority ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="low">Low - General inquiry</option>
              <option value="medium">Medium - Standard support</option>
              <option value="high">High - Service issue</option>
              <option value="urgent">Urgent - Service down</option>
            </select>
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Customer ID */}
          <FormField
            label="Customer ID (Optional)"
            id="customer_id"
          >
            <input
              type="text"
              id="customer_id"
              value={formData.customer_id || ''}
              onChange={(e) => updateFormData('customer_id', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter customer ID if applicable"
            />
          </FormField>

          {/* Assign to Agent */}
          <FormField
            label="Assign to Agent (Optional)"
            id="assigned_to"
          >
            <select
              id="assigned_to"
              value={formData.assigned_to || ''}
              onChange={(e) => updateFormData('assigned_to', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Auto-assign based on category</option>
              {agents?.filter(agent => agent.status === 'available')
                .map(agent => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} ({agent.department}) - {agent.active_tickets}/{agent.max_tickets} tickets
                  </option>
                ))
              }
            </select>
          </FormField>
        </div>

        {/* Tags */}
        <FormField
          label="Tags (Optional)"
          id="tags"
        >
          <div className="space-y-2">
            <div className="flex">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add a tag"
              />
              <Button
                type="button"
                onClick={addTag}
                disabled={!newTag.trim()}
                className="px-4 py-2 rounded-l-none"
              >
                Add
              </Button>
            </div>
            
            {formData.tags && formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </FormField>

        {/* Initial Status */}
        <FormField
          label="Initial Status"
          id="status"
        >
          <select
            id="status"
            value={formData.status || 'open'}
            onChange={(e) => updateFormData('status', e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="open">Open - New ticket</option>
            <option value="in_progress">In Progress - Start working immediately</option>
          </select>
        </FormField>

        {/* Auto-assignment info */}
        {!formData.assigned_to && formData.category && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-800">
              <strong>Auto-assignment:</strong> This ticket will be automatically assigned to 
              an available agent based on the selected category and current workload.
            </p>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={createTicketMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={createTicketMutation.isPending}
          >
            {createTicketMutation.isPending ? 'Creating...' : 'Create Ticket'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};