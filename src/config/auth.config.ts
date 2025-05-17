import { env } from './env.config';

// Base URL for all auth callbacks
const baseCallbackUrl = env.NODE_ENV === 'production' 
  ? 'https://production-domain.com/auth' 
  : 'http://localhost:3000/auth';

export const authConfig = {
  jwt: {
    secret: env.JWT_SECRET,
    accessTokenExpiresIn: '15m',
    refreshTokenExpiresIn: '7d',
    audience: 'leftovers-api-users',
    issuer: 'leftovers-api',
  },
  providers: {
    google: {
      enabled: !!env.GOOGLE_CLIENT_ID && !!env.GOOGLE_CLIENT_SECRET,
      clientID: env.GOOGLE_CLIENT_ID || '',
      clientSecret: env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: `${baseCallbackUrl}/google/callback`,
      scope: ['email', 'profile'],
    },
    apple: {
      enabled: !!env.APPLE_CLIENT_ID && !!env.APPLE_CLIENT_SECRET,
      clientID: env.APPLE_CLIENT_ID || '',
      clientSecret: env.APPLE_CLIENT_SECRET || '',
      callbackURL: `${baseCallbackUrl}/apple/callback`,
      scope: ['email', 'name'],
    },
    // Add other providers here as needed
  },
  // Default redirect paths
  redirects: {
    success: '/dashboard',
    failure: '/login',
  },
  // Security settings
  security: {
    rateLimitAttempts: 5,
    rateLimitTimeWindow: 15 * 60 * 1000, // 15 minutes
    passwordResetTokenExpiry: 1 * 60 * 60 * 1000, // 1 hour
    refreshTokenRotation: true,
    cookieSecure: env.NODE_ENV === 'production',
    cookieHttpOnly: true,
    cookieSameSite: 'lax',
  }
}; 