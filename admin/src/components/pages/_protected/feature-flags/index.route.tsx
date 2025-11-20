import { createFileRoute } from '@tanstack/react-router';
import { FeatureFlagsDashboard } from './FeatureFlagsDashboard';

export const Route = createFileRoute('/_protected/feature-flags/')({
  component: FeatureFlagsDashboard,
});
