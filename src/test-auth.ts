import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtStrategy } from './modules/auth/infrastructure/strategies/jwt.strategy';
import { GoogleStrategy } from './modules/auth/infrastructure/strategies/google.strategy';
import { AuthRepository } from './modules/auth/infrastructure/repositories/auth.repository';
import { LoginUseCase } from './modules/auth/application/use-cases';

async function testAuth() {
  console.log('Starting authentication test...');
  
  // Create a NestJS application instance
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
  });
  
  try {
    // Get auth-related instances
    const authModule = app.select(AuthModule);
    const jwtStrategy = authModule.get(JwtStrategy);
    const googleStrategy = authModule.get(GoogleStrategy);
    const authRepository = authModule.get(AuthRepository);
    const loginUseCase = authModule.get(LoginUseCase);

    console.log('✅ All authentication components loaded successfully');
    
    // Test JWT validation with a mock payload
    console.log('\nTesting JWT strategy:');
    try {
      const mockPayload = {
        sub: 'test-user-id', // This should be a valid user ID in your database
        email: 'test@example.com',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
        aud: 'leftovers-api-users',
        iss: 'leftovers-api',
      };
      
      console.log('Validating JWT payload:', mockPayload);
      const user = await jwtStrategy.validate(mockPayload);
      console.log('✅ JWT validation successful:', user);
    } catch (error) {
      console.log('❌ JWT validation failed:', error.message);
    }
    
    // Test login flow with test credentials
    console.log('\nTesting login flow:');
    try {
      // Replace with valid test credentials
      const testEmail = 'test@example.com';
      const testPassword = 'password123';
      
      // Test if we can find the user
      console.log(`Looking up user with email: ${testEmail}`);
      const testUser = await authRepository.findUserByEmail(testEmail);
      
      if (testUser) {
        console.log('✅ Test user found:', testUser.email);
        
        // Try login flow
        console.log('Attempting to login with test user');
        const result = await loginUseCase.execute({ 
          email: testEmail, 
          userId: testUser.id 
        });
        
        console.log('✅ Login successful');
        console.log('Access token:', result.accessToken);
      } else {
        console.log('❌ Test user not found. Please create a test user in your database');
      }
    } catch (error) {
      console.log('❌ Login test failed:', error.message);
    }
    
    // Check if Google OAuth is configured
    console.log('\nChecking OAuth configuration:');
    try {
      // Access the Google strategy config to see if it's properly configured
      const googleCredentials = (googleStrategy as any)._options;
      
      if (googleCredentials && googleCredentials.clientID && googleCredentials.clientSecret) {
        console.log('✅ Google OAuth is properly configured');
        console.log('Client ID:', googleCredentials.clientID.substring(0, 10) + '...');
        console.log('Callback URL:', googleCredentials.callbackURL);
      } else {
        console.log('⚠️ Google OAuth is not fully configured. Check your environment variables.');
      }
    } catch (error) {
      console.log('❌ Error checking OAuth configuration:', error.message);
    }
    
    console.log('\nAuthentication test completed.');
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await app.close();
  }
}

// Run the test
testAuth().catch(error => {
  console.error('Failed to run authentication test:', error);
  process.exit(1);
}); 