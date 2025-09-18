import { TokenManager } from './token-manager';

export class TokenRefreshInterceptor {
  private static isRefreshing = false;
  private static refreshPromise: Promise<string | null> | null = null;

  /**
   * Handles token refresh with deduplication to prevent multiple simultaneous refresh attempts
   */
  static async handleTokenRefresh(): Promise<string | null> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performTokenRefresh();

    try {
      const newToken = await this.refreshPromise;
      return newToken;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  /**
   * Performs the actual token refresh by calling the refresh API
   */
  private static async performTokenRefresh(): Promise<string | null> {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.accessToken || null;
      }

      // If refresh fails, clear any stored tokens
      await this.clearTokens();
      return null;
    } catch (error) {
      console.error('Token refresh failed:', error);
      await this.clearTokens();
      return null;
    }
  }

  /**
   * Clears all authentication tokens
   */
  private static async clearTokens(): Promise<void> {
    try {
      // Clear cookies by calling logout
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }

  /**
   * Checks if a token is expired or about to expire
   */
  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      const buffer = 60; // 1 minute buffer
      return payload.exp < (now + buffer);
    } catch (error) {
      return true; // If we can't parse, consider it expired
    }
  }

  /**
   * Sets up automatic token refresh for the current session
   */
  static setupAutoRefresh(): NodeJS.Timeout | null {
    // Refresh tokens every 14 minutes (1 minute before 15-minute expiry)
    return setInterval(async () => {
      try {
        const success = await this.handleTokenRefresh();
        if (!success) {
          // If refresh fails, redirect to login
          window.location.href = '/sign-in';
        }
      } catch (error) {
        console.error('Auto refresh failed:', error);
        window.location.href = '/sign-in';
      }
    }, 14 * 60 * 1000); // 14 minutes
  }
}




