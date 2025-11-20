import { createFileRoute } from '@tanstack/react-router';
import { AddressesListPage } from './AddressesListPage';

export const Route = createFileRoute('/_protected/addresses/list')({
  component: AddressesListPage,
});
