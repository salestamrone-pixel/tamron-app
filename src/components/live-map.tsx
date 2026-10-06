import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { MapData, mapHtml } from '@/lib/map-html';

export function LiveMap({ data, height = 320 }: { data: MapData; height?: number }) {
  return (
    <View style={[styles.box, { height }]}>
      <WebView originWhitelist={['*']} source={{ html: mapHtml(data) }} style={styles.web} javaScriptEnabled />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderRadius: 20, overflow: 'hidden', backgroundColor: '#E5E7EB' },
  web: { flex: 1 },
});
