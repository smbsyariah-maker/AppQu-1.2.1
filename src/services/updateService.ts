import { AppUpdateInfo, UpdateConfig } from '../types';

export const APP_CURRENT_VERSION = '1.2.1';
export const APP_BUILD_NUMBER = 100;

const STORAGE_KEYS = {
  UPDATE_CONFIG: 'appqu_update_config_v1',
};

const DEFAULT_CONFIG: UpdateConfig = {
  repoOwner: 'smbsyariah',
  repoName: 'bakso-qu-pos',
  autoCheckOnStartup: true,
};

/**
 * Membandingkan 2 string versi (SemVer)
 * Return: > 0 jika v2 > v1 (artinya ada versi baru)
 *         < 0 jika v1 > v2
 *         0 jika sama
 */
export function compareVersions(vCurrent: string, vLatest: string): number {
  const clean = (v: string) =>
    v.replace(/^[vV]/, '').trim().split(/[-+]/)[0]; // hilangkan 'v' dan build tag

  const pCurrent = clean(vCurrent).split('.').map((n) => parseInt(n, 10) || 0);
  const pLatest = clean(vLatest).split('.').map((n) => parseInt(n, 10) || 0);

  const len = Math.max(pCurrent.length, pLatest.length);
  for (let i = 0; i < len; i++) {
    const c = pCurrent[i] || 0;
    const l = pLatest[i] || 0;
    if (l > c) return 1;
    if (l < c) return -1;
  }
  return 0;
}

export const UpdateService = {
  getCurrentVersion(): string {
    return APP_CURRENT_VERSION;
  },

  getUpdateConfig(): UpdateConfig {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.UPDATE_CONFIG);
      if (!raw) {
        return DEFAULT_CONFIG;
      }
      return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_CONFIG;
    }
  },

  saveUpdateConfig(config: UpdateConfig): void {
    try {
      localStorage.setItem(STORAGE_KEYS.UPDATE_CONFIG, JSON.stringify(config));
    } catch (e) {
      console.warn('Gagal menyimpan konfigurasi update:', e);
    }
  },

  dismissVersion(version: string): void {
    const config = this.getUpdateConfig();
    config.dismissedVersion = version;
    this.saveUpdateConfig(config);
  },

  resetDismissedVersion(): void {
    const config = this.getUpdateConfig();
    delete config.dismissedVersion;
    this.saveUpdateConfig(config);
  },

  /**
   * Cek pembaruan ke GitHub Releases API atau fallback latest-release.json
   */
  async checkForUpdate(forceManual = false): Promise<{
    hasUpdate: boolean;
    updateInfo: AppUpdateInfo | null;
    message: string;
    error?: boolean;
  }> {
    const config = this.getUpdateConfig();
    const owner = (config.repoOwner || 'smbsyariah').trim();
    const repo = (config.repoName || 'bakso-qu-pos').trim();

    // Catat waktu cek terakhir
    config.lastCheckedAt = new Date().toISOString();
    this.saveUpdateConfig(config);

    try {
      // 1. Coba GitHub Releases API resmi terlebih dahulu
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
      let releaseData: any = null;

      try {
        const res = await fetch(apiUrl, {
          headers: {
            Accept: 'application/vnd.github.v3+json',
          },
        });

        if (res.ok) {
          releaseData = await res.json();
        }
      } catch (errApi) {
        console.warn('GitHub API fetch gagal, mencoba raw latest-release.json:', errApi);
      }

      // 2. Fallback jika API limit atau repo private/raw: baca latest-release.json langsung dari branch main
      if (!releaseData) {
        const rawUrls = [
          `https://raw.githubusercontent.com/${owner}/${repo}/main/output-apk/latest-release.json`,
          `https://raw.githubusercontent.com/${owner}/${repo}/master/output-apk/latest-release.json`,
        ];

        for (const rawUrl of rawUrls) {
          try {
            const rawRes = await fetch(rawUrl);
            if (rawRes.ok) {
              const rawJson = await rawRes.json();
              releaseData = {
                tag_name: rawJson.tagName || `v${rawJson.version}`,
                name: rawJson.releaseName || `AppQu BaksoQu v${rawJson.version}`,
                published_at: rawJson.releaseDate || new Date().toISOString(),
                body: rawJson.changelog || 'Pembaruan otomatis dari GitHub Action',
                assets: [
                  {
                    name: rawJson.apkName || 'AppQu-BaksoQu-latest.apk',
                    browser_download_url:
                      rawJson.downloadUrl ||
                      rawJson.latestDownloadUrl ||
                      `https://github.com/${owner}/${repo}/releases/latest/download/AppQu-BaksoQu-latest.apk`,
                    size: 15 * 1024 * 1024,
                  },
                ],
              };
              break;
            }
          } catch {
            // lanjut loop
          }
        }
      }

      // Jika tetap tidak ditemukan release
      if (!releaseData) {
        return {
          hasUpdate: false,
          updateInfo: null,
          message: `Belum ada release di repositori GitHub "${owner}/${repo}". Lakukan git push untuk memicu GitHub Action release otomatis.`,
        };
      }

      const latestTag = releaseData.tag_name || releaseData.name || '';
      const cleanLatest = latestTag.replace(/^[vV]/, '');
      const isNewer = compareVersions(APP_CURRENT_VERSION, cleanLatest) > 0;

      // Cari file APK dalam assets release
      let apkAsset = (releaseData.assets || []).find((a: any) =>
        a.name && a.name.toLowerCase().endsWith('.apk')
      );

      // Jika tidak ada asset eksplisit di array, gunakan URL direct default GitHub release
      const downloadUrl = apkAsset
        ? apkAsset.browser_download_url
        : `https://github.com/${owner}/${repo}/releases/download/${latestTag}/AppQu-BaksoQu-latest.apk`;

      const apkName = apkAsset ? apkAsset.name : `AppQu-BaksoQu-${latestTag}.apk`;
      const fileSizeMb = apkAsset && apkAsset.size ? Math.round((apkAsset.size / (1024 * 1024)) * 10) / 10 : 16.5;

      const updateInfo: AppUpdateInfo = {
        version: cleanLatest,
        tagName: latestTag,
        releaseName: releaseData.name || `Pembaruan Versi ${latestTag}`,
        releaseDate: releaseData.published_at || new Date().toISOString(),
        changelog: releaseData.body || 'Peningkatan performa, perbaikan bug, dan sinkronisasi fitur terbaru.',
        apkDownloadUrl: downloadUrl,
        apkName,
        fileSizeMb,
        isNewer,
        mandatory: false,
      };

      if (!isNewer) {
        return {
          hasUpdate: false,
          updateInfo,
          message: `Aplikasi Anda sudah versi terbaru (v${APP_CURRENT_VERSION}).`,
        };
      }

      // Jika tidak force manual dan versi ini sudah di-dismiss oleh pengguna
      if (!forceManual && config.dismissedVersion === cleanLatest) {
        return {
          hasUpdate: false,
          updateInfo,
          message: `Pembaruan v${cleanLatest} ditunda oleh pengguna.`,
        };
      }

      return {
        hasUpdate: true,
        updateInfo,
        message: `Pembaruan v${cleanLatest} tersedia!`,
      };
    } catch (e: any) {
      console.error('Error saat cek update GitHub:', e);
      return {
        hasUpdate: false,
        updateInfo: null,
        message: 'Gagal menghubungi server GitHub: ' + (e.message || 'Periksa koneksi internet.'),
        error: true,
      };
    }
  },

  /**
   * Memicu pengunduhan file APK langsung ke perangkat pengguna
   */
  triggerDownload(apkUrl: string, fileName = 'AppQu-BaksoQu-latest.apk'): void {
    try {
      const link = document.createElement('a');
      link.href = apkUrl;
      link.setAttribute('download', fileName);
      link.setAttribute('target', '_blank');
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.warn('Fallback buka URL langsung:', e);
      window.open(apkUrl, '_blank');
    }
  },
};
