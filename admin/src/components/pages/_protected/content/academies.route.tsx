import { createFileRoute } from '@tanstack/react-router';
import { AcademiesPage } from './AcademiesPage';

export const Route = createFileRoute('/_protected/content/academies')({
  component: AcademiesPage,
});
