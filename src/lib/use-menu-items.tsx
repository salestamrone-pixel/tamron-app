import { useRouter } from 'expo-router';

import { badgeColors } from '@/components/kit';
import type { MainItem } from '@/components/kingdom';
import { SERVICES } from '@/constants/services';
import { useAuth } from '@/context/AuthContext';

// The main menu, shared by the home screen, the section pages and the side drawer.
export function useMenuItems(): MainItem[] {
  const router = useRouter();
  const { user, isStaff, isAdmin, isManager } = useAuth();
  const go = (path: string) => () => router.push(path as never);

  const items: MainItem[] = [
    {
      key: 'services',
      label: 'خدماتنا',
      subtitle: `${SERVICES.length} خدمة`,
      icon: 'grid-outline',
      color: badgeColors.amber,
      subs: SERVICES.map((s) => ({
        key: s.id,
        label: s.name,
        icon: s.icon,
        color: s.color,
        onPress: () => router.push({ pathname: '/request', params: { serviceId: s.id } }),
      })),
    },
    {
      key: 'store',
      label: 'متجرنا',
      subtitle: 'منتجاتنا وأعمالنا',
      icon: 'storefront-outline',
      color: badgeColors.sapphire,
      subs: [],
      onPress: go('/store'),
    },
    {
      key: 'work',
      label: 'أعمالنا',
      subtitle: 'معرض وطلباتك',
      icon: 'images-outline',
      color: badgeColors.emerald,
      subs: [
        { key: 'portfolio', label: 'معرض الأعمال', icon: 'images-outline', color: badgeColors.emerald, onPress: go('/portfolio') },
        { key: 'orders', label: 'طلباتي', icon: 'document-text-outline', color: badgeColors.sapphire, onPress: go('/orders') },
      ],
    },
  ];

  if (isStaff || isManager) {
    const subs: MainItem['subs'] = [];
    if (isStaff) {
      subs.push({ key: 'staff', label: 'الحضور والانصراف', icon: 'location-outline', color: badgeColors.emerald, onPress: go('/staff') });
      subs.push({ key: 'leave', label: 'إجازاتي وأذوناتي', icon: 'calendar-outline', color: badgeColors.amber, onPress: go('/staff/requests') });
      subs.push({ key: 'payslip', label: 'قسيمة راتبي', icon: 'cash-outline', color: badgeColors.sapphire, onPress: go('/staff/payslip') });
      subs.push({ key: 'mytasks', label: 'مهامي', icon: 'checkbox-outline', color: badgeColors.burgundy, onPress: go('/staff/tasks') });
      subs.push({ key: 'docs', label: 'مستنداتي', icon: 'document-text-outline', color: badgeColors.emerald, onPress: go('/staff/documents') });
    }
    if (isManager) {
      subs.push({ key: 'admin', label: 'لوحة الإدارة', icon: 'shield-checkmark-outline', color: badgeColors.burgundy, onPress: go('/admin') });
      subs.push({ key: 'att', label: 'سجل الحضور', icon: 'calendar-number-outline', color: badgeColors.emerald, onPress: go('/admin/attendance') });
      subs.push({ key: 'hr', label: 'طلبات الإجازات', icon: 'documents-outline', color: badgeColors.amber, onPress: go('/admin/hr') });
      subs.push({ key: 'payroll', label: 'الرواتب', icon: 'cash-outline', color: badgeColors.sapphire, onPress: go('/admin/payroll') });
      subs.push({ key: 'report', label: 'تقرير الحضور', icon: 'stats-chart-outline', color: badgeColors.burgundy, onPress: go('/admin/report') });
      subs.push({ key: 'tasks', label: 'مهام التنفيذ', icon: 'checkmark-done-outline', color: badgeColors.amber, onPress: go('/admin/tasks') });
    }
    if (isAdmin) {
      subs.push({ key: 'emp', label: 'الموظفون', icon: 'people-outline', color: badgeColors.sapphire, onPress: go('/admin/employees') });
      subs.push({ key: 'sites', label: 'مواقع العمل', icon: 'navigate-circle-outline', color: badgeColors.emerald, onPress: go('/admin/sites') });
      subs.push({ key: 'shop', label: 'إدارة المتجر', icon: 'storefront-outline', color: badgeColors.burgundy, onPress: go('/admin/store') });
      subs.push({ key: 'quotes', label: 'طلبات العملاء', icon: 'chatbubbles-outline', color: badgeColors.amber, onPress: go('/admin/requests') });
      subs.push({ key: 'audit', label: 'سجل العمليات', icon: 'shield-outline', color: badgeColors.sapphire, onPress: go('/admin/audit') });
    }
    items.push({ key: 'team', label: 'فريقنا', subtitle: 'للموظفين والإدارة', icon: 'people-outline', color: badgeColors.burgundy, subs });
  }

  items.push({
    key: 'about',
    label: 'من نحن',
    subtitle: 'تعرّف علينا',
    icon: 'information-circle-outline',
    color: badgeColors.emerald,
    subs: [],
    onPress: go('/about'),
  });

  items.push({
    key: 'me',
    label: 'حسابي',
    subtitle: 'ملفك وخياراتك',
    icon: 'person-outline',
    color: badgeColors.sapphire,
    subs: user
      ? [{ key: 'profile', label: 'ملفي', icon: 'person-circle-outline', color: badgeColors.sapphire, onPress: go('/profile') }]
      : [
          { key: 'login', label: 'تسجيل الدخول', icon: 'log-in-outline', color: badgeColors.sapphire, onPress: go('/auth/login') },
          { key: 'register', label: 'حساب جديد', icon: 'person-add-outline', color: badgeColors.emerald, onPress: go('/auth/register') },
        ],
  });

  // Signed-in users go straight to their profile; guests get a page with login / register.
  const me = items.find((i) => i.key === 'me');
  if (me && user) {
    me.subs = [];
    me.onPress = go('/profile');
  }

  return items;
}
