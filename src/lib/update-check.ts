import Constants from 'expo-constants';

// The APK isn't on Google Play yet, so there's no store to push updates through —
// GitHub Releases is the distribution channel, and this is how the app notices a newer one.
const REPO = 'salestamrone-pixel/tamron-app';
const CURRENT_BUILD = Number(Constants.expoConfig?.extra?.buildNumber ?? 0);

export interface UpdateInfo {
  build: number;
  downloadUrl: string;
}

export async function checkForUpdate(): Promise<UpdateInfo | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`);
    if (!res.ok) return null;
    const data = await res.json();
    const match = /^build-(\d+)$/.exec(data.tag_name ?? '');
    if (!match) return null;
    const build = Number(match[1]);
    if (build <= CURRENT_BUILD) return null;
    const asset = (data.assets ?? []).find((a: { name: string }) => a.name === 'tamron-app.apk');
    if (!asset) return null;
    return { build, downloadUrl: asset.browser_download_url };
  } catch {
    return null;
  }
}
