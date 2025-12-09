/**
 * File type detection utility
 * Handles cases where the type field from the API might be incorrect
 * Similar to Android implementation for consistency
 */

export enum FileType {
  PDF = 'PDF',
  IMAGE = 'IMAGE',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Detects file type from URL by checking extensions and patterns
 * @param url - The file URL to analyze
 * @returns Detected file type
 */
export const detectFileTypeFromUrl = (url: string): FileType => {
  if (!url || url.trim() === '') {
    return FileType.UNKNOWN;
  }

  const urlLower = url.toLowerCase();

  // Check for PDF - look for .pdf anywhere in the path (before query params)
  const pdfPattern = /\.pdf(\?|#|$|&)/i;
  if (pdfPattern.test(url)) {
    // Double check it's actually .pdf and not part of another word
    const urlPath = url.split('?')[0].split('#')[0];
    if (urlPath.toLowerCase().includes('.pdf')) {
      return FileType.PDF;
    }
  }

  // Check for image extensions - look for image extensions in the path
  const imagePattern = /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?|#|$|&)/i;
  if (imagePattern.test(url)) {
    return FileType.IMAGE;
  }

  // Check content type in URL (for Firebase Storage and similar)
  if (
    urlLower.includes('contenttype=application/pdf') ||
    urlLower.includes('content-type=application/pdf') ||
    (urlLower.includes('alt=media&token') && urlLower.includes('pdf'))
  ) {
    return FileType.PDF;
  }

  if (
    urlLower.includes('contenttype=image/') ||
    urlLower.includes('content-type=image/')
  ) {
    return FileType.IMAGE;
  }

  return FileType.UNKNOWN;
};

/**
 * Detects file type by making a HEAD request to check Content-Type header
 * @param url - The file URL to check
 * @returns Detected file type or UNKNOWN if detection fails
 */
export const detectFileTypeFromHeaders = async (
  url: string,
): Promise<FileType> => {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'Cache-Control': 'no-cache',
      },
    });

    const contentType = response.headers.get('content-type')?.toLowerCase() || '';

    if (contentType.includes('application/pdf')) {
      return FileType.PDF;
    }

    if (contentType.startsWith('image/')) {
      return FileType.IMAGE;
    }

    return FileType.UNKNOWN;
  } catch (error) {
    console.error('Failed to detect content-type from headers:', error);
    return FileType.UNKNOWN;
  }
};

/**
 * Comprehensive file type detection
 * 1. First tries URL-based detection (most reliable)
 * 2. If unknown, tries to fetch Content-Type header
 * 3. Falls back to provided type parameter
 * @param url - The file URL
 * @param providedType - The type provided by the API (may be incorrect)
 * @returns Detected file type
 */
export const detectFileType = async (
  url: string,
  providedType?: string,
): Promise<FileType> => {
  if (!url || url.trim() === '') {
    return FileType.UNKNOWN;
  }

  // First, try URL-based detection (most reliable)
  const urlDetectedType = detectFileTypeFromUrl(url);

  if (urlDetectedType !== FileType.UNKNOWN) {
    return urlDetectedType;
  }

  // If URL detection is unknown, try to fetch the content-type header
  try {
    const headerDetectedType = await detectFileTypeFromHeaders(url);
    if (headerDetectedType !== FileType.UNKNOWN) {
      return headerDetectedType;
    }
  } catch (error) {
    console.error('Failed to detect file type from headers:', error);
  }

  // Fall back to provided type parameter
  if (providedType) {
    const typeLower = providedType.toLowerCase();
    if (typeLower === 'pdf') {
      return FileType.PDF;
    }
    if (typeLower === 'image' || typeLower === 'img') {
      return FileType.IMAGE;
    }
  }

  return FileType.UNKNOWN;
};

