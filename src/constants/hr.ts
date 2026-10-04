import { palette } from '@/components/kit';
import { HrRequestStatus, HrRequestType } from '@/types';

// Annual leave entitlement under the Saudi Labour Law for service under five years.
export const ANNUAL_LEAVE_DAYS = 21;

export const HR_TYPE_LABELS: Record<HrRequestType, string> = {
  leave: 'إجازة',
  permission: 'إذن (خروج مبكر / تأخير)',
};

export const HR_STATUS_LABELS: Record<HrRequestStatus, { label: string; color: string }> = {
  pending: { label: 'بانتظار الموافقة', color: '#D97706' },
  approved: { label: 'تمت الموافقة', color: palette.success },
  rejected: { label: 'مرفوض', color: palette.danger },
};

export const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function daysBetween(from: string, to: string) {
  const a = new Date(`${from}T00:00:00`).getTime();
  const b = new Date(`${to}T00:00:00`).getTime();
  if (Number.isNaN(a) || Number.isNaN(b) || b < a) return 0;
  return Math.round((b - a) / 86400000) + 1;
}
