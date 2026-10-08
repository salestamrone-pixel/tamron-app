import { Asset } from 'expo-asset';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

// The bundled company profile PDF. Lets the user save/share it straight from "من نحن"
// without needing a server to host it.
export async function downloadCompanyProfile() {
  if (Platform.OS === 'web') {
    // On web the bundler serves it as a static file; just open it in a new tab.
    const asset = Asset.fromModule(require('@/assets/docs/tamron-profile.pdf'));
    await asset.downloadAsync();
    if (typeof window !== 'undefined') window.open(asset.localUri ?? asset.uri, '_blank');
    return;
  }
  const asset = Asset.fromModule(require('@/assets/docs/tamron-profile.pdf'));
  await asset.downloadAsync();
  const uri = asset.localUri ?? asset.uri;
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: 'الملف التعريفي لشركة تامرون' });
  }
}
