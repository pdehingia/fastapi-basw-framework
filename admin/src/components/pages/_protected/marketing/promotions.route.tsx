import { createFileRoute } from '@tanstack/react-router';
import PromotionsPage from './PromotionsPage';

export const Route = createFileRoute('/_protected/marketing/promotions')({
  component: PromotionsPage,
});
