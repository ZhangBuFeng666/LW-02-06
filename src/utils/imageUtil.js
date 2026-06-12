export function optimizeImageUrl(url, width = 400) {
  if (!url) return '';
  if (url.includes('unsplash.com')) {
    try {
      const parsedUrl = new URL(url);
      parsedUrl.searchParams.set('w', String(width));
      parsedUrl.searchParams.set('q', '75');
      parsedUrl.searchParams.set('auto', 'format');
      parsedUrl.searchParams.set('fit', 'crop');
      return parsedUrl.toString();
    } catch {
      return url;
    }
  }
  return url;
}
