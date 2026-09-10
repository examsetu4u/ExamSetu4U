import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { AdminLayout } from '@/admin/components/admin-layout';

export default function AdminPage() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    document.title = 'ExamSetu4U — Admin Content Management & Architecture';
  }, []);

  return <AdminLayout onReturnToStudentApp={() => setLocation('/')} />;
}
