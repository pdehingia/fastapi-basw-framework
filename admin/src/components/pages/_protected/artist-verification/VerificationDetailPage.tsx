/**
 * Artist Verification Detail Page Component
 * Detailed view for reviewing individual verification requests
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from '@tanstack/react-router';
import { 
  ArrowLeft, CheckCircle, XCircle, Download, Eye, Calendar, User, Mail,
  FileText, AlertTriangle, Clock 
} from 'lucide-react';

import Button from '../../../atoms/Button';
import Badge from '../../../atoms/Badge';
import { useToast } from '../../../../hooks/ui/useToast';
import { artistVerificationService, type VerificationDecision } from '../../../../services/api/artistVerificationService';

// Status configurations
const statusConfig = {
  pending: { variant: 'warning' as const, icon: Clock, label: 'Pending' },
  under_review: { variant: 'info' as const, icon: Eye, label: 'Under Review' },
  approved: { variant: 'success' as const, icon: CheckCircle, label: 'Approved' },
  rejected: { variant: 'error' as const, icon: XCircle, label: 'Rejected' },
};

const verificationBadges = {
  basic: { variant: 'default' as const, label: 'Basic' },
  professional: { variant: 'primary' as const, label: 'Professional' },
  elite: { variant: 'warning' as const, label: 'Elite' },
};

interface VerificationDetailPageProps {
  className?: string;
}

export const VerificationDetailPage: React.FC<VerificationDetailPageProps> = ({ className = '' }) => {
  const { requestId } = useParams({ strict: false }) as { requestId: string };
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [decision, setDecision] = useState<'approved' | 'rejected' | ''>('');
  const [adminNotes, setAdminNotes] = useState('');
  const [showDecisionPanel, setShowDecisionPanel] = useState(false);

  // Query for verification request details
  const { data: requestData, isLoading, error } = useQuery({
    queryKey: ['verificationRequest', requestId],
    queryFn: () => artistVerificationService.getVerificationRequest(requestId),
    enabled: !!requestId,
  });

  // Mutation for making verification decision
  const makeDecisionMutation = useMutation({
    mutationFn: (decisionData: VerificationDecision) =>
      artistVerificationService.makeVerificationDecision(requestId, decisionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verificationRequest', requestId] });
      queryClient.invalidateQueries({ queryKey: ['verificationQueue'] });
      queryClient.invalidateQueries({ queryKey: ['verificationStats'] });
      toast({
        title: 'Success',
        description: 'Verification decision made successfully',
      });
      setShowDecisionPanel(false);
      setDecision('');
      setAdminNotes('');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to make verification decision',
        variant: 'destructive',
      });
    },
  });

  const request = requestData?.data;

  const handleMakeDecision = () => {
    if (!decision) {
      toast({
        title: 'Error',
        description: 'Please select a decision',
        variant: 'destructive',
      });
      return;
    }

    if (!adminNotes.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide admin notes',
        variant: 'destructive',
      });
      return;
    }

    makeDecisionMutation.mutate({
      decision: decision,
      notes: adminNotes,
      notify_artist: true,
    });
  };

  const handleDownloadDocument = async (documentId: string, filename: string) => {
    try {
      const blob = await artistVerificationService.downloadDocument(documentId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast({
        title: 'Success',
        description: 'Document downloaded successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download document',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Verification Request</h3>
        <p className="text-gray-600 mb-4">
          {error instanceof Error ? error.message : 'Verification request not found'}
        </p>
        <Button onClick={() => navigate({ to: '/artist-verification' })}>
          Back to Queue
        </Button>
      </div>
    );
  }

  const statusBadge = statusConfig[request.status];
  const verificationBadge = verificationBadges[request.verification_type];

  return (
    <div className={`max-w-6xl mx-auto space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate({ to: '/artist-verification' })}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Queue
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Verification Request Detail</h1>
            <p className="text-gray-600">Request ID: {request.id}</p>
          </div>
        </div>
        
        {request.status === 'pending' && (
          <Button
            onClick={() => setShowDecisionPanel(true)}
            disabled={makeDecisionMutation.isPending}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Make Decision
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Artist Information */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Artist Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Artist Name</p>
                    <p className="font-medium text-gray-900">{request.artist.full_name}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{request.artist.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Submitted</p>
                    <p className="font-medium text-gray-900">
                      {new Date(request.submitted_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-2">Verification Type</p>
                  <Badge variant={verificationBadge.variant}>
                    {verificationBadge.label}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-2">Status</p>
                  <Badge variant={statusBadge.variant}>
                    <statusBadge.icon className="w-3 h-3 mr-1" />
                    {statusBadge.label}
                  </Badge>
                </div>

                {request.reviewed_at && (
                  <div>
                    <p className="text-sm text-gray-500">Reviewed At</p>
                    <p className="font-medium text-gray-900">
                      {new Date(request.reviewed_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submitted Documents */}
          {request.documents && request.documents.length > 0 && (
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Submitted Documents</h2>
              <div className="space-y-3">
                {request.documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{doc.file_name}</p>
                        <p className="text-sm text-gray-500">
                          {doc.type} • {doc.uploaded_at}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadDocument(doc.id, doc.file_name)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(doc.file_url, '_blank')}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Previous Reviews */}
          {request.admin_notes && (
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Previous Admin Notes</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed">{request.admin_notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {request.status === 'pending' && (
                <>
                  <Button
                    className="w-full"
                    onClick={() => {
                      setDecision('approved');
                      setShowDecisionPanel(true);
                    }}
                    disabled={makeDecisionMutation.isPending}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setDecision('rejected');
                      setShowDecisionPanel(true);
                    }}
                    disabled={makeDecisionMutation.isPending}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </>
              )}
              
              <div className="text-center py-4 text-gray-500 text-sm">
                Artist verification history will be available in future updates
              </div>
            </div>
          </div>

          {/* Verification Checklist */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Checklist</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-700">Artist profile completed</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-700">Documents submitted</span>
              </div>
              <div className="flex items-center space-x-2">
                {request.artist?.business_name ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span className="text-sm text-gray-700">Business name provided</span>
              </div>
              <div className="flex items-center space-x-2">
                {request.artist?.phone ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span className="text-sm text-gray-700">Contact information</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decision Panel Modal */}
      {showDecisionPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {decision === 'approved' ? 'Approve' : 'Reject'} Verification Request
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Notes *
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder={`Provide reason for ${decision === 'approved' ? 'approval' : 'rejection'}...`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDecisionPanel(false);
                    setDecision('');
                    setAdminNotes('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleMakeDecision}
                  disabled={makeDecisionMutation.isPending || !adminNotes.trim()}
                  className={decision === 'rejected' ? 'bg-red-600 hover:bg-red-700' : ''}
                >
                  {makeDecisionMutation.isPending ? 'Processing...' : (
                    decision === 'approved' ? 'Approve' : 'Reject'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationDetailPage;