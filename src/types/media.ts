export interface MediaPost {
  id: string;
  type: 'image' | 'video' | 'audio';
  title?: string;
  description?: string;
  tags?: string[];
  media_url: string;
  thumbnail_url?: string;
  created_at: number;
  updated_at: number;
  file_size?: number;
  mime_type?: string;
  width?: number;
  height?: number;
}

export interface MediaPostCreate {
  type: 'image' | 'video' | 'audio';
  title?: string;
  description?: string;
  tags?: string[];
  media_url: string;
  thumbnail_url?: string;
  file_size?: number;
  mime_type?: string;
  width?: number;
  height?: number;
}

export interface MediaFeedResponse {
  posts: MediaPost[];
  hasMore: boolean;
}

export interface UploadResponse {
  uploadUrl: string;
  fileKey: string;
}

export type MediaType = 'image' | 'video' | 'audio';

export interface MediaFile extends File {
  type: string;
}