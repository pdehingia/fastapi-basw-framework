import React, { useState, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Copy,
  Calendar,
  BarChart3,
  Settings,
  Users,
  Tag,
  Folder,
  Grid,
  List,
  Download,
  Upload,
  MoreHorizontal,
  Globe,
  Lock,
  Clock,
  TrendingUp,
  Image,
  Video,
  FileIcon,
} from 'lucide-react';
import {
  useContent,
  useDeleteContent,
  useDuplicateContent,
  usePublishContent,
  useUnpublishContent,
  useBulkContentOperation,
  useCategories,
  useTags,
  useTrendingContent,
} from '@/hooks/api/useContent';
import type { ContentItem, BulkContentOperation } from '@/types/api.types';

const ContentManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<ContentItem['type'] | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<ContentItem['status'] | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'created_at' | 'updated_at' | 'published_at' | 'title' | 'view_count'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [page, setPage] = useState(1);

  // Fetch data
  const { data: contentData, isLoading: contentLoading, error: contentError } = useContent({
    page,
    limit: 20,
    search: searchTerm || undefined,
    type: selectedType !== 'all' ? selectedType : undefined,
    status: selectedStatus !== 'all' ? selectedStatus : undefined,
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
    sort_by: sortBy,
    sort_order: sortOrder,
  });

  const { data: categories } = useCategories({ flat: true });
  const { data: tags } = useTags({ popular: true, limit: 20 });
  const { data: trendingContent } = useTrendingContent(5);

  // Mutations
  const deleteContentMutation = useDeleteContent();
  const duplicateContentMutation = useDuplicateContent();
  const publishContentMutation = usePublishContent();
  const unpublishContentMutation = useUnpublishContent();
  const bulkOperationMutation = useBulkContentOperation();

  const content = contentData?.data || [];
  const pagination = contentData?.pagination;

  // Memoized filter options
  const contentTypes: Array<{ value: ContentItem['type'] | 'all'; label: string; icon: React.ReactNode }> = [
    { value: 'all', label: 'All Types', icon: <FileText className="w-4 h-4" /> },
    { value: 'page', label: 'Pages', icon: <FileText className="w-4 h-4" /> },
    { value: 'blog_post', label: 'Blog Posts', icon: <FileText className="w-4 h-4" /> },
    { value: 'announcement', label: 'Announcements', icon: <FileText className="w-4 h-4" /> },
    { value: 'help_article', label: 'Help Articles', icon: <FileText className="w-4 h-4" /> },
    { value: 'landing_page', label: 'Landing Pages', icon: <Globe className="w-4 h-4" /> },
    { value: 'email_template', label: 'Email Templates', icon: <FileText className="w-4 h-4" /> },
  ];

  const statusOptions: Array<{ value: ContentItem['status'] | 'all'; label: string; color: string }> = [
    { value: 'all', label: 'All Status', color: 'bg-gray-100' },
    { value: 'draft', label: 'Draft', color: 'bg-gray-100' },
    { value: 'published', label: 'Published', color: 'bg-green-100' },
    { value: 'scheduled', label: 'Scheduled', color: 'bg-blue-100' },
    { value: 'archived', label: 'Archived', color: 'bg-yellow-100' },
  ];

  // Bulk operations
  const handleSelectAll = () => {
    if (selectedItems.length === content.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(content.map(item => item.id));
    }
  };

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkOperation = async (operation: BulkContentOperation['action']) => {
    if (selectedItems.length === 0) return;

    const bulkOp: BulkContentOperation = {
      action: operation,
      content_ids: selectedItems,
    };

    try {
      await bulkOperationMutation.mutateAsync(bulkOp);
      setSelectedItems([]);
      setShowBulkActions(false);
    } catch (error) {
      console.error('Bulk operation failed:', error);
    }
  };

  // Individual actions
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      try {
        await deleteContentMutation.mutateAsync(id);
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateContentMutation.mutateAsync(id);
    } catch (error) {
      console.error('Duplicate failed:', error);
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await publishContentMutation.mutateAsync(id);
    } catch (error) {
      console.error('Publish failed:', error);
    }
  };

  const handleUnpublish = async (id: string) => {
    try {
      await unpublishContentMutation.mutateAsync(id);
    } catch (error) {
      console.error('Unpublish failed:', error);
    }
  };

  const getStatusIcon = (status: ContentItem['status']) => {
    switch (status) {
      case 'published':
        return <Globe className="w-4 h-4 text-green-600" />;
      case 'scheduled':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'draft':
        return <Edit className="w-4 h-4 text-gray-600" />;
      case 'archived':
        return <Archive className="w-4 h-4 text-yellow-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getVisibilityIcon = (visibility: ContentItem['visibility']) => {
    switch (visibility) {
      case 'public':
        return <Globe className="w-4 h-4 text-green-600" />;
      case 'private':
        return <Lock className="w-4 h-4 text-red-600" />;
      case 'members_only':
        return <Users className="w-4 h-4 text-blue-600" />;
      default:
        return <Globe className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTypeIcon = (type: ContentItem['type']) => {
    switch (type) {
      case 'page':
        return <FileText className="w-5 h-5" />;
      case 'blog_post':
        return <FileText className="w-5 h-5" />;
      case 'announcement':
        return <FileText className="w-5 h-5" />;
      case 'help_article':
        return <FileText className="w-5 h-5" />;
      case 'landing_page':
        return <Globe className="w-5 h-5" />;
      case 'email_template':
        return <FileText className="w-5 h-5" />;
      default:
        return <FileIcon className="w-5 h-5" />;
    }
  };

  if (contentError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading content</h3>
          <p className="mt-1 text-sm text-gray-500">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create, manage, and optimize your content across all channels
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/content/templates"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Settings className="w-4 h-4 mr-2" />
            Templates
          </Link>
          <Link
            to="/admin/content/create"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Content
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Content</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {pagination?.total || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Globe className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Published</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {content.filter(item => item.status === 'published').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Edit className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Drafts</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {content.filter(item => item.status === 'draft').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Scheduled</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {content.filter(item => item.status === 'scheduled').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trending Content */}
      {trendingContent && trendingContent.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
              Trending Content
            </h2>
          </div>
          <div className="space-y-3">
            {trendingContent.slice(0, 3).map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {getTypeIcon(item.type)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-500">{item.view_count} views</p>
                  </div>
                </div>
                <Link
                  to="/admin/content/$contentId"
                  params={{ contentId: item.id }}
                  className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as ContentItem['type'] | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              {contentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as ContentItem['status'] | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>

            {/* Category Filter */}
            {categories && categories.length > 0 && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            )}

            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-md">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm font-medium ${
                  viewMode === 'list'
                    ? 'bg-indigo-50 text-indigo-700 border-r border-gray-300'
                    : 'text-gray-500 hover:text-gray-700 border-r border-gray-300'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 text-sm font-medium ${
                  viewMode === 'grid'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedItems.length > 0 && (
          <div className="p-4 bg-blue-50 border-b border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm text-blue-700">
                  {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleBulkOperation('publish')}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-white bg-green-600 hover:bg-green-700"
                >
                  <Globe className="w-4 h-4 mr-1" />
                  Publish
                </button>
                <button
                  onClick={() => handleBulkOperation('unpublish')}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-white bg-yellow-600 hover:bg-yellow-700"
                >
                  <Clock className="w-4 h-4 mr-1" />
                  Unpublish
                </button>
                <button
                  onClick={() => handleBulkOperation('delete')}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-white bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </button>
                <button
                  onClick={() => setSelectedItems([])}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content List */}
        {contentLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading content...</p>
          </div>
        ) : content.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No content found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first piece of content.
            </p>
            <div className="mt-6">
              <Link
                to="/admin/content/create"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Content
              </Link>
            </div>
          </div>
        ) : viewMode === 'list' ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === content.length}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updated
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {content.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 mr-3">
                          {getTypeIcon(item.type)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            <Link
                              to="/admin/content/$contentId"
                              params={{ contentId: item.id }}
                              className="hover:text-indigo-600"
                            >
                              {item.title}
                            </Link>
                          </div>
                          {item.excerpt && (
                            <div className="text-sm text-gray-500 mt-1">
                              {item.excerpt.substring(0, 100)}...
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {item.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        statusOptions.find(s => s.value === item.status)?.color || 'bg-gray-100'
                      } text-gray-800`}>
                        {getStatusIcon(item.status)}
                        <span className="ml-1">{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.author_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.view_count.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to="/admin/content/$contentId/edit"
                          params={{ contentId: item.id }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDuplicate(item.id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Duplicate"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        {item.status === 'draft' || item.status === 'scheduled' ? (
                          <button
                            onClick={() => handlePublish(item.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Publish"
                          >
                            <Globe className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUnpublish(item.id)}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Unpublish"
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          // Grid view
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {content.map((item) => (
                <div key={item.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => handleSelectItem(item.id)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mr-2"
                        />
                        {getTypeIcon(item.type)}
                      </div>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(item.status)}
                        {getVisibilityIcon(item.visibility)}
                      </div>
                    </div>
                    
                    <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                      <Link
                        to="/admin/content/$contentId"
                        params={{ contentId: item.id }}
                        className="hover:text-indigo-600"
                      >
                        {item.title}
                      </Link>
                    </h3>
                    
                    {item.excerpt && (
                      <p className="text-xs text-gray-500 mb-3 line-clamp-3">
                        {item.excerpt}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span>{item.author_name}</span>
                      <span>{item.view_count} views</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {new Date(item.updated_at).toLocaleDateString()}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Link
                          to="/admin/content/$contentId/edit"
                          params={{ contentId: item.id }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDuplicate(item.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {((page - 1) * pagination.per_page) + 1} to {Math.min(page * pagination.per_page, pagination.total)} of{' '}
                {pagination.total} results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-500">
                  Page {page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= pagination.pages}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentManager;