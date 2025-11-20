import { createFileRoute } from '@tanstack/react-router';
import { WalletManagementPage } from './WalletManagementPage';

export const Route = createFileRoute('/_protected/financial/wallets')({
  component: WalletManagementPage,
});
