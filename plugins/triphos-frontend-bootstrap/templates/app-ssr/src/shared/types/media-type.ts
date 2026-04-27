export enum MediaType {
  Image = 'image',
  Video = 'video',
  Audio = 'audio',
  Document = 'document',
  Archive = 'archive',
  Code = 'code',
  Link = 'link',
}

export const MEDIA_TYPE_MAP: Record<string, MediaType> = {
  jpg: MediaType.Image,
  jpeg: MediaType.Image,
  png: MediaType.Image,
  gif: MediaType.Image,
  webp: MediaType.Image,
  svg: MediaType.Image,
  mp4: MediaType.Video,
  webm: MediaType.Video,
  mp3: MediaType.Audio,
  wav: MediaType.Audio,
  pdf: MediaType.Document,
  doc: MediaType.Document,
  docx: MediaType.Document,
  zip: MediaType.Archive,
  rar: MediaType.Archive,
  js: MediaType.Code,
  ts: MediaType.Code,
  tsx: MediaType.Code,
  json: MediaType.Code,
};

