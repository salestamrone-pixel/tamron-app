import { StyleSheet, Text, View } from 'react-native';

import { Button, font, palette } from '@/components/kit';
import { currentMonth, monthLabel, shiftMonth } from '@/lib/payroll';

export function MonthBar({ month, onChange }: { month: string; onChange: (m: string) => void }) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Button label="التالي" variant="outline" icon="chevron-back" disabled={month >= currentMonth()} onPress={() => onChange(shiftMonth(month, 1))} />
      </View>
      <Text style={styles.label}>{monthLabel(month)}</Text>
      <View style={{ flex: 1 }}>
        <Button label="السابق" variant="outline" icon="chevron-forward" onPress={() => onChange(shiftMonth(month, -1))} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8 },
  label: { fontSize: 16, fontFamily: font.black, color: palette.text, minWidth: 110, textAlign: 'center' },
});
