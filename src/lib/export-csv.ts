import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

function escapeCsv(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export async function shareAsCsv(fileName: string, header: string[], rows: string[][]) {
  // A leading BOM makes Excel render the Arabic columns correctly instead of as mojibake.
  const csv = '﻿' + [header, ...rows].map((r) => r.map(escapeCsv).join(',')).join('\n');
  const file = new File(Paths.cache, fileName);
  file.create({ overwrite: true });
  file.write(csv);
  await Sharing.shareAsync(file.uri, { mimeType: 'text/csv', dialogTitle: fileName });
}
