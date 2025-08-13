import { User } from 'oidc-client-ts';
import { config } from '../config';

/**
 * AuthService handles authentication-related functionality including:
 * - Token refresh
 * - Session timeout management
 * - Secure token storage
 */
export class AuthService {
  private static readonly SESSION_TIMEOUT_KEY = 'cms_session_timeout';
  private static readonly LAST_ACTIVITY_KEY = 'cms_last_activity';
  private static readonly TOKEN_REFRESH_BUFFER = 5 * 60 * 1000; // 5 minutes in milliseconds
  private static readonly DEFAULT_SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
  
  // Singleton instance
  private static instance: AuthService;
  
  private user: User | null = null;
  private refreshTimer: number | null = null;
  private sessionTimer: number | null = null;
  private sessionTimeoutDuration: number;
  private timeoutWarningCallback: (() => void) | null = null;
  private logoutCallback: (() => void) | null = null;
  
  /**
   * Private constructor to prevent direct instantiation
   */
  private constructor() {
    // Get session timeout from config or use default
    this.sessionTimeoutDuration = AuthService.DEFAULT_SESSION_TIMEOUT;
    
    // Initialize timers
    this.refreshTimer = null;
    this.sessionTimer = null;
  }
  
  /**
   * Get the singleton instance of AuthService
   * @returns The AuthService instance
   */
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }
  
  /**
   * Initialize the auth service with the current user
   * @param user The authenticated user
   * @param timeoutWarningCallback Callback to warn user of impending timeout
   * @param logoutCallback Callback to execute on session timeout
   */
  public initialize(
    user: User,
    timeoutWarningCallback: () => void,
    logoutCallback: () => void
  ): void {
    this.user = user;
    this.timeoutWarningCallback = timeoutWarningCallback;
    this.logoutCallback = logoutCallback;
    
    // Set up token refresh
    this.setupTokenRefresh();
    
    // Set up session timeout
    this.setupSessionTimeout();
    
    // Store the initial activity timestamp
    this.updateActivity();
    
    // Add event listeners for user activity
    this.addActivityListeners();
  }
  
  /**
   * Set up automatic token refresh before expiration
   */
  private setupTokenRefresh(): void {
    if (!this.user) return;
    
    // Clear any existing timer
    if (this.refreshTimer) {
      window.clearTimeout(this.refreshTimer);
    }
    
    const expiresAt = this.user.expires_at;
    if (!expiresAt) return;
    
    const expiresAtMs = expiresAt * 1000;
    const now = Date.now();
    
    // Calculate time until refresh (token expiry minus buffer time)
    let timeUntilRefresh = expiresAtMs - now - AuthService.TOKEN_REFRESH_BUFFER;
    
    // If token is already expired or about to expire, refresh immediately
    if (timeUntilRefresh < 0) {
      this.refreshToken();
      return;
    }
    
    // Set timer to refresh token before it expires
    this.refreshTimer = window.setTimeout(() => {
      this.refreshToken();
    }, timeUntilRefresh);
  }
  
  /**
   * Refresh the authentication token
   * 
   * Note: This method won't actually refresh the token - it's just a placeholder.
   * Token refresh is handled automatically by the OIDC library (oidc-client-ts)
   * through the UserManager when automaticSilentRenew is set to true in the main.tsx config.
   * 
   * The actual refresh happens internally in the auth context from useAuth().
   */
  private async refreshToken(): Promise<void> {
    if (!this.user) return;
    
    try {
      // The token is already being refreshed automatically by the OIDC library
      // We just need to set up the next refresh timer and dispatch the event
      
      // Set up the next refresh
      this.setupTokenRefresh();
      
      // Dispatch token refresh event
      this.dispatchTokenRefreshEvent();
      
      console.info('Token refresh check completed');
    } catch (error) {
      console.error('Token refresh check failed:', error);
      
      // If refresh fails, log out the user
      if (this.logoutCallback) {
        this.logoutCallback();
      }
    }
  }
  
  /**
   * Set up session timeout monitoring
   */
  private setupSessionTimeout(): void {
    // Check for activity every minute
    this.sessionTimer = window.setInterval(() => {
      this.checkSessionTimeout();
    }, 60 * 1000);
  }
  
  /**
   * Check if the session has timed out due to inactivity
   */
  private checkSessionTimeout(): void {
    const lastActivity = this.getLastActivity();
    if (!lastActivity) {
      this.updateActivity();
      return;
    }
    
    const now = Date.now();
    const idleTime = now - lastActivity;
    
    // If 80% of timeout duration has passed, warn user
    if (idleTime > this.sessionTimeoutDuration * 0.8 && this.timeoutWarningCallback) {
      this.timeoutWarningCallback();
    }
    
    // If session has timed out, log out
    if (idleTime > this.sessionTimeoutDuration && this.logoutCallback) {
      this.logoutCallback();
    }
  }
  
  /**
   * Update the last activity timestamp
   */
  public updateActivity(): void {
    // Store in both memory and sessionStorage for persistence
    const now = Date.now();
    window.sessionStorage.setItem(AuthService.LAST_ACTIVITY_KEY, now.toString());
  }
  
  /**
   * Get the last recorded user activity timestamp
   */
  private getLastActivity(): number | null {
    const lastActivity = window.sessionStorage.getItem(AuthService.LAST_ACTIVITY_KEY);
    return lastActivity ? parseInt(lastActivity, 10) : null;
  }
  
  /**
   * Add event listeners to monitor user activity
   */
  private addActivityListeners(): void {
    // List of events to track for user activity
    const events = ['mousedown', 'keypress', 'scroll', 'mousemove', 'touchstart'];
    
    // Throttled activity update (max once every 5 seconds)
    let lastUpdate = 0;
    const updateThrottled = () => {
      const now = Date.now();
      if (now - lastUpdate > 5000) {
        this.updateActivity();
        lastUpdate = now;
      }
    };
    
    // Add event listeners
    events.forEach(event => {
      window.addEventListener(event, updateThrottled, { passive: true });
    });
  }
  
  /**
   * Clean up timers and listeners on logout
   */
  public cleanup(): void {
    // Clear timers
    if (this.refreshTimer) {
      window.clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    
    if (this.sessionTimer) {
      window.clearInterval(this.sessionTimer);
      this.sessionTimer = null;
    }
    
    // Clear stored session data
    window.sessionStorage.removeItem(AuthService.LAST_ACTIVITY_KEY);
    window.sessionStorage.removeItem(AuthService.SESSION_TIMEOUT_KEY);
    
    // Clear user
    this.user = null;
  }
  
  /**
   * Dispatch an event when the token is refreshed
   */
  private dispatchTokenRefreshEvent(): void {
    const event = new Event('tokenRefreshed');
    window.dispatchEvent(event);
  }
  
  /**
   * Store tokens securely in session storage with encryption
   * This is a simple implementation - in a production app,
   * consider using a more secure approach or a dedicated library
   */
  public static securelyStoreToken(tokenName: string, tokenValue: string): void {
    // Simple obfuscation - not true encryption, just to avoid plain text
    const obfuscated = btoa(tokenValue);
    sessionStorage.setItem(tokenName, obfuscated);
  }
  
  /**
   * Retrieve securely stored token
   */
  public static retrieveSecureToken(tokenName: string): string | null {
    const storedToken = sessionStorage.getItem(tokenName);
    if (!storedToken) return null;
    
    // Decode the obfuscated token
    try {
      return atob(storedToken);
    } catch (e) {
      console.error('Error retrieving secure token:', e);
      return null;
    }
  }
  
  /**
   * Clear all securely stored tokens
   */
  public static clearSecureTokens(): void {
    sessionStorage.clear();
  }
  
  /**
   * Instance method to access the static securelyStoreToken method
   * This provides a proper way to access the static method from an instance
   */
  public securelyStoreToken(tokenName: string, tokenValue: string): void {
    AuthService.securelyStoreToken(tokenName, tokenValue);
  }
  
  /**
   * Instance method to access the static retrieveSecureToken method
   * This provides a proper way to access the static method from an instance
   */
  public retrieveSecureToken(tokenName: string): string | null {
    return AuthService.retrieveSecureToken(tokenName);
  }
  
  /**
   * Instance method to access the static clearSecureTokens method
   * This provides a proper way to access the static method from an instance
   */
  public clearSecureTokens(): void {
    AuthService.clearSecureTokens();
  }


}

// Export the singleton instance
export const authService = AuthService.getInstance();