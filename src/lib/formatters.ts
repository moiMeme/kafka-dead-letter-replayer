/**
 * Extracts the short error name from a full qualified class name
 * Example: com.geopost.coldcontrol.event.exception.NotFoundException -> NotFoundException
 */
export function getShortErrorName(fullErrorType: string): string {
  const parts = fullErrorType.split('.');
  return parts[parts.length - 1] || fullErrorType;
}

/**
 * Formats a stacktrace string by handling escaped newlines
 * and making it more readable
 */
export function formatStacktrace(stacktrace: string): string {
  if (!stacktrace) return '';

  // Replace literal \n with actual newlines
  return stacktrace
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '  ')
    .trim();
}

/**
 * Parses a JSON string payload safely
 */
export function parsePayload(payload: string): any {
  try {
    if (typeof payload === 'string') {
      return JSON.parse(payload);
    }
    return payload;
  } catch (e) {
    console.error('Failed to parse payload:', e);
    return payload;
  }
}

/**
 * Formats a timestamp to a readable format
 */
export function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    return date.toLocaleString();
  } catch (e) {
    return timestamp;
  }
}

/**
 * Truncates text to a specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
