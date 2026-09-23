import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';

export const GOOGLE_DRIVE_APPDATA_SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
const GOOGLE_IDENTITY_SCRIPT = 'https://accounts.google.com/gsi/client';

interface TokenResponse {
  access_token?: string;
  expires_in?: number | string;
  scope?: string;
  error?: string;
}

interface TokenClient {
  requestAccessToken(options?: { prompt?: string }): void;
}

interface OAuth2Api {
  initTokenClient(config: {
    client_id: string;
    scope: string;
    callback: (response: TokenResponse) => void;
    error_callback: (error: { type?: string }) => void;
  }): TokenClient;
  revoke(token: string, callback: () => void): void;
}

interface SisuStepsWindow extends Window {
  google?: { accounts?: { oauth2?: OAuth2Api } };
  __SISU_STEPS_CONFIG__?: { googleOAuthClientId?: unknown };
}

@Injectable({ providedIn: 'root' })
export class GoogleIdentityAuthorizationAdapter {
  private readonly document = inject(DOCUMENT);
  private accessToken: string | null = null;
  private expiresAt = 0;
  private authorizedThisVisit = false;
  private library: Promise<OAuth2Api> | null = null;

  async authorize(): Promise<string> {
    if (this.accessToken && Date.now() < this.expiresAt - 60_000) return this.accessToken;
    const clientId = this.readClientId();
    const oauth2 = await this.loadLibrary();
    return new Promise<string>((resolve, reject) => {
      const client = oauth2.initTokenClient({
        client_id: clientId,
        scope: GOOGLE_DRIVE_APPDATA_SCOPE,
        callback: (response) => this.receiveToken(response, resolve, reject),
        error_callback: (error) => reject(this.authorizationError(error.type)),
      });
      client.requestAccessToken({ prompt: this.authorizedThisVisit ? '' : 'select_account' });
    });
  }

  forgetToken(): void {
    this.accessToken = null;
    this.expiresAt = 0;
  }

  async disconnect(): Promise<void> {
    const token = this.accessToken;
    this.forgetToken();
    this.authorizedThisVisit = false;
    if (!token) return;
    const oauth2 = await this.loadLibrary();
    await new Promise<void>((resolve) => oauth2.revoke(token, resolve));
  }

  private receiveToken(
    response: TokenResponse,
    resolve: (token: string) => void,
    reject: (reason: Error) => void,
  ): void {
    const scopes = new Set((response.scope ?? '').split(/\s+/u).filter(Boolean));
    if (response.error || !response.access_token || !scopes.has(GOOGLE_DRIVE_APPDATA_SCOPE)) {
      reject(new Error('Google Drive access was not granted. Your local progress is unchanged.'));
      return;
    }
    const lifetime = Number(response.expires_in);
    this.accessToken = response.access_token;
    this.expiresAt = Date.now() + (Number.isFinite(lifetime) ? lifetime * 1000 : 3_000_000);
    this.authorizedThisVisit = true;
    resolve(response.access_token);
  }

  private readClientId(): string {
    const configured = (this.document.defaultView as SisuStepsWindow | null)?.__SISU_STEPS_CONFIG__
      ?.googleOAuthClientId;
    const clientId = typeof configured === 'string' ? configured.trim() : '';
    if (!clientId) {
      throw new Error('Google Drive backup is not configured for this deployment.');
    }
    if (!/^[A-Za-z0-9._-]+\.apps\.googleusercontent\.com$/u.test(clientId)) {
      throw new Error('Google Drive backup configuration is invalid for this deployment.');
    }
    return clientId;
  }

  private loadLibrary(): Promise<OAuth2Api> {
    const googleWindow = this.document.defaultView as SisuStepsWindow | null;
    const existing = googleWindow?.google?.accounts?.oauth2;
    if (existing) return Promise.resolve(existing);
    if (this.library) return this.library;
    this.library = new Promise<OAuth2Api>((resolve, reject) => {
      const script = this.document.createElement('script');
      script.src = GOOGLE_IDENTITY_SCRIPT;
      script.async = true;
      script.addEventListener('load', () => {
        const loaded = googleWindow?.google?.accounts?.oauth2;
        if (loaded) resolve(loaded);
        else reject(new Error('Google authorization did not become available. Try again.'));
      });
      script.addEventListener('error', () => {
        this.library = null;
        reject(new Error('Google authorization could not load. Check your connection and retry.'));
      });
      this.document.head.append(script);
    });
    return this.library;
  }

  private authorizationError(type?: string): Error {
    if (type === 'popup_failed_to_open') {
      return new Error('The Google account window was blocked. Allow popups and try again.');
    }
    if (type === 'popup_closed') {
      return new Error('Google Drive setup was cancelled. Your local progress is unchanged.');
    }
    return new Error('Google authorization could not finish. Try again.');
  }
}
