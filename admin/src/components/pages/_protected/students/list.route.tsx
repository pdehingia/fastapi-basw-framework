import { createFileRoute } from '@tanstack/react-router';
import { StudentsListPage } from './StudentsListPage';

export const Route = createFileRoute('/_protected/students/list')({
  component: StudentsListPage,
});
