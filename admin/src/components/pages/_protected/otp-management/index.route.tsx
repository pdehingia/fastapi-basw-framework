import { createFileRoute } from '@tanstack/react-router';
import { OTPManagementDashboard } from './OTPManagementDashboard';

export const Route = createFileRoute('/_protected/otp-management/')({
  component: OTPManagementDashboard,
});
