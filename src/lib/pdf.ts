import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import { fmtMoney, monthLabel, Sheet } from '@/lib/payroll';
import { StaffMember } from '@/types';

export const COMPANY = {
  name: 'شركة تامرون العربية المحدودة',
  cr: '1010853768',
  vat: '311524490100003',
};

export const esc = (v: unknown) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);

function shell(title: string, body: string) {
  return `<html dir="rtl" lang="ar"><head><meta charset="utf-8"/><style>
    body{font-family:sans-serif;margin:0;padding:32px;color:#0A0A0A}
    .head{border-bottom:4px solid #CCA741;padding-bottom:12px;margin-bottom:22px}
    .head h1{margin:0;font-size:22px}
    .head p{margin:4px 0 0;font-size:11px;color:#555}
    h2{font-size:18px;margin:0 0 14px}
    table{width:100%;border-collapse:collapse;font-size:12px}
    th{background:#0A0A0A;color:#EDD85D;padding:7px;text-align:right}
    td{padding:7px;border-bottom:1px solid #E7E1CF}
    .total td{font-weight:bold;background:#F7F1DC}
    .p{font-size:14px;line-height:2}
    .sign{margin-top:48px;font-size:13px}
    .foot{margin-top:40px;font-size:10px;color:#777;border-top:1px solid #E7E1CF;padding-top:8px}
  </style></head><body>
    <div class="head"><h1>${esc(COMPANY.name)}</h1><p>السجل التجاري: ${COMPANY.cr} · الرقم الضريبي: ${COMPANY.vat}</p></div>
    <h2>${esc(title)}</h2>${body}
    <div class="foot">وثيقة صادرة إلكترونياً من تطبيق تامرون بتاريخ ${new Date().toLocaleDateString('ar')}</div>
  </body></html>`;
}

export async function sharePdf(html: string) {
  if (Platform.OS === 'web') {
    await Print.printAsync({ html });
    return;
  }
  const { uri } = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
  }
}

export function tableHtml(title: string, headers: string[], rows: (string | number)[][]) {
  const head = headers.map((h) => `<th>${esc(h)}</th>`).join('');
  const body = rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('');
  return shell(title, `<table><tr>${head}</tr>${body}</table>`);
}

export function payslipHtml(s: Sheet, month: string) {
  const row = (label: string, value: string) => `<tr><td>${esc(label)}</td><td>${esc(value)}</td></tr>`;
  return shell(
    `قسيمة راتب · ${monthLabel(month)}`,
    `<p class="p">الموظف: <b>${esc(s.name)}</b> · ${esc(s.jobTitle || '')}</p>
     <table>
       <tr><th>البند</th><th>القيمة</th></tr>
       ${row('الراتب الأساسي', fmtMoney(s.salary))}
       ${row('البدلات', fmtMoney(s.allowances))}
       ${row(`خصم الغياب (${s.absentDays} يوم)`, fmtMoney(s.absentDeduction))}
       ${row(`خصم التأخير والخروج المبكر (${s.lateMinutes + s.earlyMinutes} دقيقة)`, fmtMoney(s.lateDeduction))}
       ${row('السلف', fmtMoney(s.advances))}
       ${row('التأمينات الاجتماعية', fmtMoney(s.gosi))}
       <tr class="total"><td>إجمالي الخصومات</td><td>${esc(fmtMoney(s.totalDeductions))}</td></tr>
       <tr class="total"><td>صافي الراتب</td><td>${esc(fmtMoney(s.net))}</td></tr>
     </table>
     <p class="p">أيام العمل: ${s.workingDays} · حضور: ${s.presentDays} · إجازة: ${s.leaveDays} · غياب: ${s.absentDays}</p>`,
  );
}

export function salaryCertificateHtml(m: StaffMember) {
  const total = (m.salary ?? 0) + (m.allowances ?? 0);
  return shell(
    'شهادة تعريف بالراتب',
    `<p class="p">تشهد ${esc(COMPANY.name)} بأن السيد/ة <b>${esc(m.name)}</b>
     ${m.idNumber ? `(رقم الهوية/الإقامة: ${esc(m.idNumber)})` : ''} يعمل لديها بوظيفة <b>${esc(m.jobTitle || 'موظف')}</b>
     ${m.hireDate ? `منذ تاريخ ${esc(m.hireDate)}` : ''}، ويبلغ راتبه الشهري الإجمالي <b>${esc(fmtMoney(total))}</b>.</p>
     <p class="p">وقد أعطيت له هذه الشهادة بناءً على طلبه دون أدنى مسؤولية على الشركة تجاه الغير.</p>
     <div class="sign">الإدارة<br/>${esc(COMPANY.name)}</div>`,
  );
}

export function employmentLetterHtml(m: StaffMember) {
  return shell(
    'خطاب تعريف بالموظف',
    `<p class="p">إلى من يهمه الأمر،</p>
     <p class="p">نفيدكم بأن السيد/ة <b>${esc(m.name)}</b> ${m.idNumber ? `(رقم الهوية/الإقامة: ${esc(m.idNumber)})` : ''}
     من العاملين لدينا بوظيفة <b>${esc(m.jobTitle || 'موظف')}</b> ${m.hireDate ? `منذ تاريخ ${esc(m.hireDate)}` : ''}، ولا يزال على رأس العمل.</p>
     <p class="p">وقد أعطي هذا الخطاب بناءً على طلبه لتقديمه لمن يلزم.</p>
     <div class="sign">الإدارة<br/>${esc(COMPANY.name)}</div>`,
  );
}
