import { createFileRoute } from '@tanstack/react-router';
import { FeatureFlagsListPage } from './FeatureFlagsListPage';

export const Route = createFileRoute('/_protected/feature-flags/list')({
  component: FeatureFlagsListPage,
});
