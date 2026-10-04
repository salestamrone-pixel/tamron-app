import type { IconName } from '@/components/kit';
import { QuoteStatus, Service } from '@/types';

export type ServiceItem = Service & { icon: IconName };

export const SERVICES: ServiceItem[] = [
  {
    id: 'banners',
    name: 'بنرات',
    icon: 'flag-variant-outline',
    description: 'طباعة بنرات دعائية بالمقاس المطلوب.',
    specHint: 'المقاس، عدد البنرات، هل التصميم جاهز؟',
  },
  {
    id: 'stickers',
    name: 'ستيكرات',
    icon: 'sticker-outline',
    description: 'طباعة وقص ستيكرات للواجهات والسيارات والمنتجات.',
    specHint: 'المقاس، الكمية، مكان اللصق (زجاج، سيارة، حائط...)',
  },
  {
    id: 'pylon',
    name: 'لوحات بايلون',
    icon: 'sign-real-estate',
    description: 'تصنيع وتركيب لوحات بايلون.',
    specHint: 'الارتفاع والعرض، وجه واحد أم وجهين، مضيئة أم لا، موقع التركيب',
  },
  {
    id: 'unipole',
    name: 'لوحات يوني بول',
    icon: 'billboard',
    description: 'تصنيع وتركيب لوحات يوني بول.',
    specHint: 'مقاس اللوحة، الارتفاع، عدد الأوجه، موقع التركيب',
  },
  {
    id: 'facades',
    name: 'لوحات وواجهات تجارية',
    icon: 'storefront-outline',
    description: 'لوحات المحلات والواجهات التجارية.',
    specHint: 'مقاس الواجهة، نوع اللوحة أو الحروف، مضيئة أم لا، موقع المحل',
  },
  {
    id: 'hoarding',
    name: 'أسوار دعائية للمشاريع',
    icon: 'fence',
    description: 'أسوار دعائية لمواقع المشاريع.',
    specHint: 'طول السور وارتفاعه، موقع المشروع، هل التصميم جاهز؟',
  },
  {
    id: 'fiber-laser',
    name: 'قص وحفر فايبر ليزر',
    icon: 'laser-pointer',
    description: 'قص وحفر بماكينة الفايبر ليزر.',
    specHint: 'نوع الخامة وسماكتها، المقاسات، الكمية، هل يوجد ملف تصميم؟',
  },
  {
    id: 'cnc',
    name: 'حفر وقص CNC',
    icon: 'saw-blade',
    description: 'حفر وقص بماكينة CNC.',
    specHint: 'نوع الخامة وسماكتها، المقاسات، الكمية، هل يوجد ملف تصميم؟',
  },
  {
    id: 'co2-laser',
    name: 'ليزر CO2',
    icon: 'ray-start-arrow',
    description: 'قص وحفر بماكينة ليزر CO2.',
    specHint: 'نوع الخامة وسماكتها، المقاسات، الكمية، هل يوجد ملف تصميم؟',
  },
  {
    id: 'rolling-bending',
    name: 'درفلة وثني',
    icon: 'pipe',
    description: 'أعمال الدرفيل والطعاجة.',
    specHint: 'نوع الخامة وسماكتها، المقاسات، الشكل المطلوب، الكمية',
  },
  {
    id: 'other',
    name: 'طلب آخر',
    icon: 'dots-horizontal-circle-outline',
    description: 'أي عمل دعاية وإعلان أو تصنيع غير مذكور.',
    specHint: 'اشرح المطلوب بالتفصيل',
  },
];

export const STATUS_LABELS: Record<QuoteStatus, { label: string; color: string }> = {
  new: { label: 'بانتظار رد الشركة', color: '#D97706' },
  quoted: { label: 'تم إرسال عرض السعر', color: '#1D4ED8' },
  in_progress: { label: 'قيد التنفيذ', color: '#7C3AED' },
  done: { label: 'مكتمل', color: '#059669' },
  cancelled: { label: 'ملغي', color: '#6B7280' },
};
