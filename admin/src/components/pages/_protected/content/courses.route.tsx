import { createFileRoute } from '@tanstack/react-router';
import { CoursesPage } from './CoursesPage';

export const Route = createFileRoute('/_protected/content/courses')({
  component: CoursesPage,
});
