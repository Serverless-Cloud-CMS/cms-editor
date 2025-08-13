export class Utils {
  /**
   * Sanitizes and cleans a URL by properly joining host and path
   * Prevents potential XSS attacks via URLs
   * 
   * @param host The base host URL
   * @param url The path or URL to be cleaned
   * @returns A properly formatted and sanitized URL
   */
  public static cleanURL(host: string, url: string): string {
    // For test compatibility - log sanitized values instead of raw inputs

    // Input validation
    if (!host || !url) {
      return '';
    }
    
    // Sanitize inputs
    const sanitizedHost = host.trim();
    const sanitizedUrl = url.trim();
    
    // Handle already complete URLs
    if (sanitizedUrl.match(/^https?:\/\//i)) {
      // Validate URL structure to prevent javascript: and data: URLs
      try {
        const urlObj = new URL(sanitizedUrl);
        if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
          return ''; // Reject non-http/https protocols
        }
        return sanitizedUrl;
      } catch (e) {
        console.error('Invalid URL:', e);
        return ''; // Invalid URL
      }
    }
    
    // Join paths correctly
    let cleanURL: string;
    if (sanitizedUrl.startsWith("/") && sanitizedHost.endsWith("/")) {
      cleanURL = sanitizedHost + sanitizedUrl.substring(1);
    } else if (sanitizedUrl.startsWith("/") || sanitizedHost.endsWith("/")) {
      cleanURL = sanitizedHost + sanitizedUrl;
    } else {
      cleanURL = sanitizedHost + "/" + sanitizedUrl;
    }
    
    // Final validation of combined URL
    try {
      new URL(cleanURL);
      return cleanURL;
    } catch (e) {
      console.error('Invalid URL after joining:', e);
      return ''; // Invalid URL after joining
    }
  }

  /**
   * Estimates the approximate number of tokens that would be charged for a prompt to an AI model
   * This is a simple approximation based on common tokenization patterns in models like GPT
   * 
   * @param prompt The text prompt to estimate token count for
   * @returns An integer representing the approximate token count
   */
  public static estimateTokenCount(prompt: string): number {
    if (!prompt || prompt.trim() === '') {
      return 0;
    }

    // Simple approximation based on common tokenization patterns
    // Most models use subword tokenization where:
    // - Common words are single tokens
    // - Longer/uncommon words are split into multiple tokens
    // - Spaces and punctuation are separate tokens
    // - On average, 1 token is roughly 4 characters for English text
    
    const text = prompt.trim();
    
    // Count words (roughly 1-2 tokens per word depending on length)
    const words = text.split(/\s+/).filter(word => word.length > 0);
    let tokenCount = 0;
    
    // Estimate tokens per word based on length
    for (const word of words) {
      if (word.length <= 2) {
        // Very short words or symbols are usually 1 token
        tokenCount += 1;
      } else if (word.length <= 6) {
        // Common words are usually 1 token
        tokenCount += 1;
      } else if (word.length <= 10) {
        // Longer words might be 2 tokens
        tokenCount += 2;
      } else {
        // Very long words are split into multiple tokens
        // Roughly 1 token per 4-5 characters
        tokenCount += Math.ceil(word.length / 4);
      }
    }
    
    // Add tokens for spaces (approximately 1 token per space)
    tokenCount += Math.max(0, words.length - 1);
    
    // Add tokens for special characters and punctuation
    const specialChars = text.replace(/[a-zA-Z0-9\s]/g, '').length;
    tokenCount += specialChars;
    
    return tokenCount;
  }
}
