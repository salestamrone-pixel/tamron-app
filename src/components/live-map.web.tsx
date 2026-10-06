import { View } from 'react-native';

import { MapData, mapHtml } from '@/lib/map-html';

export function LiveMap({ data, height = 320 }: { data: MapData; height?: number }) {
  return (
    <View style={{ height, borderRadius: 20, overflow: 'hidden', backgroundColor: '#E5E7EB' }}>
      <iframe title="map" srcDoc={mapHtml(data)} style={{ border: 0, width: '100%', height: '100%' }} />
    </View>
  );
}
