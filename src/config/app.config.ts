export const appConfig = {
  apiBaseUrl: 'https://test.api.chutneyads.com/api/v1',
//  apiBaseUrl: 'http://192.168.100.193:9001/api/v1',
//  apiBaseUrl: 'http://192.168.101.111:9001/api/v1',
  tokenKey: "auth_token",
  refreshTokenKey: "refresh_token",
  userKey: "auth_user",
  tokenExpirationBuffer: 5 * 60 * 1000,
} as const;

export type AppConfig = typeof appConfig;
