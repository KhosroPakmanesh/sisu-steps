import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  GOOGLE_DRIVE_APPDATA_SCOPE,
  GoogleIdentityAuthorizationAdapter,
} from '@/features/learning/learner-data/drive/google-identity-authorization.adapter';

interface TokenConfig {
  client_id: string;
  scope: string;
  callback: (response: { access_token: string; expires_in: number; scope: string }) => void;
  error_callback: (error: { type: string }) => void;
}

describe('GoogleIdentityAuthorizationAdapter', () => {
  beforeEach(() => {
    Object.defineProperty(window, '__SISU_STEPS_CONFIG__', {
      configurable: true,
      value: { googleOAuthClientId: 'browser-client-id.apps.googleusercontent.com' },
    });
  });

  afterEach(() => {
    Reflect.deleteProperty(window, '__SISU_STEPS_CONFIG__');
    Reflect.deleteProperty(window, 'google');
  });

  it('requests only app-data access and retains the token only in memory', async () => {
    let config: TokenConfig | undefined;
    const revoke = vi.fn((_token: string, callback: () => void) => callback());
    const requestAccessToken = vi.fn(() =>
      config?.callback({
        access_token: 'secret-access-token',
        expires_in: 3600,
        scope: GOOGLE_DRIVE_APPDATA_SCOPE,
      }),
    );
    Object.defineProperty(window, 'google', {
      configurable: true,
      value: {
        accounts: {
          oauth2: {
            initTokenClient: (value: TokenConfig) => {
              config = value;
              return { requestAccessToken };
            },
            revoke,
          },
        },
      },
    });
    const adapter = TestBed.inject(GoogleIdentityAuthorizationAdapter);

    expect(await adapter.authorize()).toBe('secret-access-token');
    expect(config?.scope).toBe(GOOGLE_DRIVE_APPDATA_SCOPE);
    expect(config?.client_id).toBe('browser-client-id.apps.googleusercontent.com');
    expect(requestAccessToken).toHaveBeenCalledWith({ prompt: 'select_account' });
    expect(Object.keys(localStorage).map((key) => localStorage.getItem(key))).not.toContain(
      'secret-access-token',
    );

    await adapter.disconnect();
    expect(revoke).toHaveBeenCalledExactlyOnceWith('secret-access-token', expect.any(Function));
  });

  it('fails safely when the deployment has no OAuth client ID', async () => {
    Object.defineProperty(window, '__SISU_STEPS_CONFIG__', {
      configurable: true,
      value: { googleOAuthClientId: '' },
    });
    const adapter = TestBed.inject(GoogleIdentityAuthorizationAdapter);

    await expect(adapter.authorize()).rejects.toThrowError(
      'Google Drive backup is not configured for this deployment.',
    );
  });

  it('rejects malformed runtime configuration before loading Google', async () => {
    Object.defineProperty(window, '__SISU_STEPS_CONFIG__', {
      configurable: true,
      value: { googleOAuthClientId: '<script>not-a-client</script>' },
    });
    const adapter = TestBed.inject(GoogleIdentityAuthorizationAdapter);

    await expect(adapter.authorize()).rejects.toThrowError(
      'Google Drive backup configuration is invalid for this deployment.',
    );
    expect(
      document.querySelector('script[src="https://accounts.google.com/gsi/client"]'),
    ).toBeNull();
  });
});
