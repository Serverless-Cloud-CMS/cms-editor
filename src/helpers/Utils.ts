export class Utils {
  /**
   * Cleans and formats a URL by properly joining host and path
   * @param host The base host URL
   * @param url The path or URL to be cleaned
   * @returns A properly formatted URL
   */
  public static cleanURL(host: string, url: string): string {
    let cleanURL = url;
    console.log(`${host} and ${url}`);
    if (url.startsWith("http")) {
      return url;
    }
    if (url.startsWith("/") && host.endsWith("/")) {
      cleanURL = host + url.substring(1);
    } else if (url.startsWith("/") || host.endsWith("/")) {
      cleanURL = host + url;
    } else {
      cleanURL = host + "/" + url;
    }
    return cleanURL;
  }
}
