import { createFileRoute } from '@tanstack/react-router';
import { OTPManagementListPage } from './OTPManagementListPage';

export const Route = createFileRoute('/_protected/otp-management/list')({
  component: OTPManagementListPage,
});
