import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as LocalStrategy } from 'passport-local';
import authService from '../services/authService';
import { AuthRepository } from '../repositories/authRepository';
import { comparePassword } from '../utils/password';

const authRepo = new AuthRepository();

/**
 * Configure Passport Local Strategy
 */
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        const user = await authRepo.findByEmail(email);
        
        if (!user || !user.isActive) {
          return done(null, false, { message: 'Invalid credentials' });
        }

        const isPasswordValid = await comparePassword(password, user.passwordHash);
        
        if (!isPasswordValid) {
          return done(null, false, { message: 'Invalid credentials' });
        }

        // Map to TokenPayload for Express.User
        const userPayload = {
          userId: user.id,
          employeeId: user.employeeId,
          email: user.email,
          role: user.role,
        };

        return done(null, userPayload as any);
      } catch (error) {
        return done(error);
      }
    }
  )
);

/**
 * Configure Passport Google OAuth Strategy
 */
if (process.env['GOOGLE_CLIENT_ID'] && process.env['GOOGLE_CLIENT_SECRET']) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env['GOOGLE_CLIENT_ID'],
        clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
        callbackURL: process.env['GOOGLE_CALLBACK_URL'] || 'http://localhost:3000/api/v1/auth/google/callback',
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          
          if (!email) {
            return done(new Error('No email found in Google profile'));
          }

          const oauthProfile = {
            id: profile.id,
            email,
            displayName: profile.displayName,
            provider: 'google' as const,
          };

          const result = await authService.oauthLogin(oauthProfile);
          
          // Map to TokenPayload for Express.User
          const userPayload = {
            userId: result.user.id,
            employeeId: result.user.employeeId,
            email: result.user.email,
            role: result.user.role,
          };
          
          return done(null, userPayload as any);
        } catch (error) {
          return done(error as Error);
        }
      }
    )
  );
}

/**
 * Serialize user for session
 */
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

/**
 * Deserialize user from session
 */
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await authRepo.findById(id);
    if (user) {
      const userPayload = {
        userId: user.id,
        employeeId: user.employeeId,
        email: user.email,
        role: user.role,
      };
      done(null, userPayload as any);
    } else {
      done(null, false);
    }
  } catch (error) {
    done(error);
  }
});

export default passport;
