/**
 * Sessions Overview Route
 * Displays combined session statistics and navigation
 */

import { createFileRoute } from '@tanstack/react-router';
import SessionsOverviewPage from './SessionsOverviewPage';

export const Route = createFileRoute('/_protected/sessions/')({
  component: SessionsOverviewPage,
});
