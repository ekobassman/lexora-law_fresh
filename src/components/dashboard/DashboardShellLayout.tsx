import { Outlet } from 'react-router-dom';
import { DashboardShell } from './DashboardShell';

/** Wraps dashboard routes with the reference shell (header + bottom nav). */
export function DashboardShellLayout() {
  return (
    <DashboardShell>
      <Outlet />
    </DashboardShell>
  );
}
