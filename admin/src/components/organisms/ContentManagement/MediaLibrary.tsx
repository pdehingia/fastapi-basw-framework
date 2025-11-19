import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  Search,
  Filter,
  Grid,
  List,
  Download,
  Edit,
  Trash2,
  Folder,
  FolderPlus,
  Image,
  Video,
  FileText,
  File,
  MoreHorizontal,
  Eye,
  Copy,
  Move,
  Tag,
  Calendar,
  HardDrive,
  Zap,
} from 'lucide-react';
import {
  useMediaFiles,
  useInfiniteMedia,
  useUploadMedia,
  useUpdateMedia,
  useDeleteMedia,
  useBulkDeleteMedia,
  useMoveMedia,
  useMediaFolders,
  useCreateFolder,
  useUpdateFolder,
  useDeleteFolder,
  useOptimizeImage,
  useMediaUsage,
} from '@/hooks/api/useContent';
import type { MediaFile, MediaFolder, CreateMediaRequest } from '@/types/api.types';

interface MediaLibraryProps {
  selectionMode?: boolean;
  onSelect?: (file: MediaFile) => void;
  onSelectMultiple?: (files: MediaFile[]) => void;
  selectedFiles?: MediaFile[];
  allowedTypes?: MediaFile['file_type'][];
}

const MediaLibrary: React.FC<MediaLibraryProps> = ({
  selectionMode = false,
  onSelect,
  onSelectMultiple,
  selectedFiles = [],
  allowedTypes,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<MediaFile['file_type'] | 'all'>('all');
  const [currentFolder, setCurrentFolder] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState<MediaFolder | null>(null);
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);
  const [page, setPage] = useState(1);

  // Fetch data
  const { data: mediaData, isLoading: mediaLoading } = useMediaFiles({
    page,
    limit: 24,
    search: searchTerm || undefined,
    type: selectedType !== 'all' ? selectedType : undefined,
    folder_id: currentFolder || undefined,
    sort_by: 'upload_date',
    sort_order: 'desc',
  });

  const { data: folders } = useMediaFolders();
  
  // Mutations
  const uploadMutation = useUploadMedia();
  const updateMutation = useUpdateMedia();
  const deleteMutation = useDeleteMedia();
  const bulkDeleteMutation = useBulkDeleteMedia();
  const moveMutation = useMoveMedia();
  const createFolderMutation = useCreateFolder();
  const updateFolderMutation = useUpdateFolder();
  const deleteFolderMutation = useDeleteFolder();
  const optimizeMutation = useOptimizeImage();

  const mediaFiles = mediaData?.data || [];
  const pagination = mediaData?.pagination;

  // File types with icons
  const fileTypes: Array<{ value: MediaFile['file_type'] | 'all'; label: string; icon: React.ReactNode }> = [
    { value: 'all', label: 'All Files', icon: <File className="w-4 h-4" /> },
    { value: 'image', label: 'Images', icon: <Image className="w-4 h-4" /> },
    { value: 'video', label: 'Videos', icon: <Video className="w-4 h-4" /> },
    { value: 'audio', label: 'Audio', icon: <FileText className="w-4 h-4" /> },
    { value: 'document', label: 'Documents', icon: <FileText className="w-4 h-4" /> },
    { value: 'other', label: 'Other', icon: <File className="w-4 h-4" /> },
  ];

  // Dropzone for file uploads
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      const uploadData: CreateMediaRequest = {
        file,
        folder_id: currentFolder || undefined,
      };
      
      try {
        await uploadMutation.mutateAsync(uploadData);
      } catch (error) {
        console.error('Upload failed for', file.name, error);
      }
    }
  }, [currentFolder, uploadMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: allowedTypes ? allowedTypes.reduce((acc, type) => {
      switch (type) {
        case 'image':
          acc['image/*'] = [];
          break;
        case 'video':
          acc['video/*'] = [];
          break;
        case 'audio':
          acc['audio/*'] = [];
          break;
        case 'document':
          acc['application/pdf'] = [];
          acc['application/msword'] = [];
          acc['application/vnd.openxmlformats-officedocument.wordprocessingml.document'] = [];
          break;
      }
      return acc;
    }, {} as Record<string, string[]>) : undefined,
  });

  // Selection handlers
  const handleSelectItem = (file: MediaFile) => {
    if (selectionMode && onSelect) {
      onSelect(file);
      return;
    }
    
    setSelectedItems(prev =>
      prev.includes(file.id) ? prev.filter(id => id !== file.id) : [...prev, file.id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === mediaFiles.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(mediaFiles.map(file => file.id));
    }
  };

  // File operations
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedItems.length} files?`)) {
      try {
        await bulkDeleteMutation.mutateAsync(selectedItems);
        setSelectedItems([]);
      } catch (error) {
        console.error('Bulk delete failed:', error);
      }
    }
  };

  const handleMoveFiles = async (folderId?: string) => {
    if (selectedItems.length === 0) return;
    
    try {
      await moveMutation.mutateAsync({ ids: selectedItems, folderId });
      setSelectedItems([]);
    } catch (error) {
      console.error('Move failed:', error);
    }
  };

  const handleOptimizeImage = async (id: string) => {
    try {
      await optimizeMutation.mutateAsync(id);
    } catch (error) {
      console.error('Optimization failed:', error);
    }
  };

  // Folder operations
  const handleCreateFolder = async (name: string) => {
    try {
      await createFolderMutation.mutateAsync({
        name,
        parent_id: currentFolder || undefined,
      });
      setShowFolderModal(false);
    } catch (error) {
      console.error('Create folder failed:', error);
    }
  };

  const handleDeleteFolder = async (folder: MediaFolder) => {
    if (window.confirm(`Are you sure you want to delete the folder "${folder.name}"?`)) {
      try {
        await deleteFolderMutation.mutateAsync({
          id: folder.id,
          moveContents: true,
        });
      } catch (error) {
        console.error('Delete folder failed:', error);
      }
    }
  };

  // Helper functions
  const getFileIcon = (file: MediaFile) => {
    switch (file.file_type) {
      case 'image':
        return <Image className="w-8 h-8 text-green-500" />;
      case 'video':
        return <Video className="w-8 h-8 text-blue-500" />;
      case 'audio':
        return <FileText className="w-8 h-8 text-purple-500" />;
      case 'document':
        return <FileText className="w-8 h-8 text-red-500" />;
      default:
        return <File className="w-8 h-8 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getBreadcrumbs = () => {
    if (!currentFolder) return [{ id: '', name: 'Root' }];
    
    const breadcrumbs = [{ id: '', name: 'Root' }];
    let folder = folders?.find(f => f.id === currentFolder);
    
    while (folder) {
      breadcrumbs.unshift({ id: folder.id, name: folder.name });
      folder = folders?.find(f => f.id === folder?.parent_id);
    }
    
    return breadcrumbs;
  };

  const currentFolders = folders?.filter(f => f.parent_id === (currentFolder || null)) || [];

  if (mediaLoading && page === 1) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      {!selectionMode && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your media files and organize them into folders
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFolderModal(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <FolderPlus className="w-4 h-4 mr-2" />
              New Folder
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Files
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      {!selectionMode && mediaData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <File className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Files</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {mediaData.total_files}
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
                  <HardDrive className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Size</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {formatFileSize(mediaData.total_size)}
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
                  <Folder className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Folders</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {mediaData.folders.length}
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
                  <Image className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Images</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {mediaFiles.filter(f => f.file_type === 'image').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumbs */}
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-4">
          {getBreadcrumbs().map((crumb, index) => (
            <li key={crumb.id || 'root'}>
              <div className="flex items-center">
                {index > 0 && <span className="text-gray-400 mr-4">/</span>}
                <button
                  onClick={() => setCurrentFolder(crumb.id)}
                  className="text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  {crumb.name}
                </button>
              </div>
            </li>
          ))}
        </ol>
      </nav>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-indigo-500 bg-indigo-50'
            : 'border-gray-300 hover:border-indigo-400'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          {isDragActive
            ? 'Drop files here...'
            : 'Drag and drop files here, or click to select files'}
        </p>
        <p className="text-xs text-gray-500">
          Supports images, videos, documents, and more
        </p>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as MediaFile['file_type'] | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              {fileTypes
                .filter(type => !allowedTypes || allowedTypes.includes(type.value as MediaFile['file_type']) || type.value === 'all')
                .map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>

            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-md">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 text-sm font-medium ${
                  viewMode === 'grid'
                    ? 'bg-indigo-50 text-indigo-700 border-r border-gray-300'
                    : 'text-gray-500 hover:text-gray-700 border-r border-gray-300'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm font-medium ${
                  viewMode === 'list'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedItems.length > 0 && !selectionMode && (
          <div className="p-4 bg-blue-50 border-b border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">
                {selectedItems.length} file{selectedItems.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleBulkDelete}
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

        {/* Content */}
        {viewMode === 'grid' ? (
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {/* Folders */}
              {currentFolders.map((folder) => (
                <div
                  key={folder.id}
                  onDoubleClick={() => setCurrentFolder(folder.id)}
                  className="group relative bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 cursor-pointer"
                >
                  <div className="flex flex-col items-center">
                    <Folder className="w-12 h-12 text-yellow-500 mb-2" />
                    <p className="text-sm font-medium text-gray-900 text-center truncate w-full">
                      {folder.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {folder.file_count} files
                    </p>
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFolder(folder);
                      }}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Files */}
              {mediaFiles.map((file) => (
                <div
                  key={file.id}
                  onClick={() => handleSelectItem(file)}
                  className={`group relative bg-white border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    selectedItems.includes(file.id)
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${
                    selectedFiles.some(f => f.id === file.id)
                      ? 'ring-2 ring-indigo-500'
                      : ''
                  }`}
                >
                  <div className="flex flex-col items-center">
                    {file.file_type === 'image' ? (
                      <img
                        src={file.thumbnail_url || file.url}
                        alt={file.alt_text || file.filename}
                        className="w-16 h-16 object-cover rounded mb-2"
                      />
                    ) : (
                      <div className="mb-2">
                        {getFileIcon(file)}
                      </div>
                    )}
                    <p className="text-sm font-medium text-gray-900 text-center truncate w-full">
                      {file.title || file.filename}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.file_size)}
                    </p>
                  </div>

                  {!selectionMode && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex space-x-1">
                        {file.file_type === 'image' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOptimizeImage(file.id);
                            }}
                            className="p-1 text-gray-400 hover:text-indigo-600"
                            title="Optimize"
                          >
                            <Zap className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewFile(file);
                          }}
                          className="p-1 text-gray-400 hover:text-indigo-600"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(file.id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          // List view
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {!selectionMode && (
                      <input
                        type="checkbox"
                        checked={selectedItems.length === mediaFiles.length}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                    )}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Upload Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Folders in list view */}
                {currentFolders.map((folder) => (
                  <tr key={folder.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Folder className="w-5 h-5 text-yellow-500" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          <button
                            onClick={() => setCurrentFolder(folder.id)}
                            className="hover:text-indigo-600"
                          >
                            {folder.name}
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Folder
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {folder.file_count} files
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(folder.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteFolder(folder)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}

                {/* Files in list view */}
                {mediaFiles.map((file) => (
                  <tr
                    key={file.id}
                    className={`hover:bg-gray-50 ${
                      selectedItems.includes(file.id) ? 'bg-indigo-50' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      {selectionMode ? (
                        <button
                          onClick={() => handleSelectItem(file)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Select
                        </button>
                      ) : (
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(file.id)}
                          onChange={() => handleSelectItem(file)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 mr-3">
                          {file.file_type === 'image' ? (
                            <img
                              src={file.thumbnail_url || file.url}
                              alt={file.alt_text || file.filename}
                              className="w-10 h-10 object-cover rounded"
                            />
                          ) : (
                            getFileIcon(file)
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {file.title || file.filename}
                          </div>
                          {file.alt_text && (
                            <div className="text-sm text-gray-500">
                              {file.alt_text}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {file.file_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatFileSize(file.file_size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(file.upload_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setPreviewFile(file)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {file.file_type === 'image' && (
                          <button
                            onClick={() => handleOptimizeImage(file.id)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Optimize"
                          >
                            <Zap className="w-4 h-4" />
                          </button>
                        )}
                        <a
                          href={file.url}
                          download={file.filename}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleDelete(file.id)}
                          className="text-red-600 hover:text-red-900"
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
        )}

        {/* Empty state */}
        {mediaFiles.length === 0 && currentFolders.length === 0 && !mediaLoading && (
          <div className="p-8 text-center">
            <File className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No files found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Upload some files to get started.
            </p>
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

export default MediaLibrary;