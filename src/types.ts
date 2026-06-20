export interface MediaFormat {
  id: string;
  quality: string;
  ext: string;
  url: string;
  extType: string;
  size: string;
  type: string; // 'video' | 'audio' | 'combined'
}

export interface ParsedVideo {
  title: string;
  thumbnail: string;
  author: string;
  sourceUrl: string;
  platform: string; // 'youtube' | 'instagram' | 'tiktok' | 'twitter' | 'facebook' | 'generic'
  formats: MediaFormat[];
  extractionSource?: string;
  isDemoFallback?: boolean;
}

export interface HistoryItem {
  id: string;
  title: string;
  thumbnail: string;
  platform: string;
  sourceUrl: string;
  formatDownloaded: string;
  downloadedAt: string;
}
