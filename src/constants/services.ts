import { QuoteStatus, Service } from '@/types';

export const SERVICES: Service[] = [
  {
    id: 'banners',
    name: 'بنرات',
    description: 'طباعة بنرات دعائية بالمقاس المطلوب.',
    specHint: 'المقاس، عدد البنرات، هل التصميم جاهز؟',
  },
  {
    id: 'stickers',
    name: 'ستيكرات',
    description: 'طباعة وقص ستيكرات للواجهات والسيارات والمنتجات.',
    specHint: 'المقاس، الكمية، مكان اللصق (زجاج، سيارة، حائط...)',
  },
  {
    id: 'pylon',
    name: 'لوحات بايلون',
    description: 'تصنيع وتركيب لوحات بايلون.',
    specHint: 'الارتفاع والعرض، وجه واحد أم وجهين، مضيئة أم لا، موقع التركيب',
  },
  {
    id: 'unipole',
    name: 'لوحات يوني بول',
    description: 'تصنيع وتركيب لوحات يوني بول.',
    specHint: 'مقاس اللوحة، الارتفاع، عدد الأوجه، موقع التركيب',
  },
  {
    id: 'facades',
    name: 'لوحات وواجهات تجارية',
    description: 'لوحات المحلات والواجهات التجارية.',
    specHint: 'مقاس الواجهة، نوع اللوحة أو الحروف، مضيئة أم لا، موقع المحل',
  },
  {
    id: 'hoarding',
    name: 'أسوار دعائية للمشاريع',
    description: 'أسوار دعائية لمواقع المشاريع.',
    specHint: 'طول السور وارتفاعه، موقع المشروع، هل التصميم جاهز؟',
  },
  {
    id: 'fiber-laser',
    name: 'قص وحفر فايبر ليزر',
    description: 'قص وحفر بماكينة الفايبر ليزر.',
    specHint: 'نوع الخامة وسماكتها، المقاسات، الكمية، هل يوجد ملف تصميم؟',
  },
  {
    id: 'cnc',
    name: 'حفر وقص CNC',
    description: 'حفر وقص بماكينة CNC.',
    specHint: 'نوع الخامة وسماكتها، المقاسات، الكمية، هل يوجد ملف تصميم؟',
  },
  {
    id: 'co2-laser',
    name: 'ليزر CO2',
    description: 'قص وحفر بماكينة ليزر CO2.',
    specHint: 'نوع الخامة وسماكتها، المقاسات، الكمية، هل يوجد ملف تصميم؟',
  },
  {
    id: 'rolling-bending',
    name: 'درفلة وثني',
    description: 'أعمال الدرفيل والطعاجة.',
    specHint: 'نوع الخامة وسماكتها، المقاسات، الشكل المطلوب، الكمية',
  },
  {
    id: 'other',
    name: 'طلب آخر',
    description: 'أي عمل دعاية وإعلان أو تصنيع غير مذكور.',
    specHint: 'اشرح المطلوب بالتفصيل',
  },
];

export const STATUS_LABELS: Record<QuoteStatus, { label: string; color: string }> = {
  new: { label: 'بانتظار رد الشركة', color: '#f57c00' },
  quoted: { label: 'تم إرسال عرض السعر', color: '#1e88e5' },
  in_progress: { label: 'قيد التنفيذ', color: '#6a1b9a' },
  done: { label: 'مكتمل', color: '#2e7d32' },
  cancelled: { label: 'ملغي', color: '#757575' },
};
