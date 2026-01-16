# @tarxemo/react-google-auth

[![npm version](https://img.shields.io/npm/v/@tarxemo/react-google-auth.svg)](https://www.npmjs.com/package/@tarxemo/react-google-auth)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A flexible React component for Google Sign-In with One Tap support, built on Google Identity Services.

## Features

✅ **Google Sign-In Button** - Customizable sign-in button  
✅ **One Tap** - Automatic One Tap prompt  
✅ **TypeScript Support** - Full type definitions  
✅ **SSR Safe** - Compatible with Next.js and other SSR frameworks  
✅ **Auto-Loading** - Automatically loads Google Identity Services script  
✅ **Error Handling** - Built-in error callbacks

## Installation

\`\`\`bash
npm install @tarxemo/react-google-auth
\`\`\`

## Quick Start

### 1. Get Google Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project or select existing
3. Enable "Google+ API"
4. Create OAuth 2.0 credentials
5. Add authorized JavaScript origins
6. Copy your Client ID

### 2. Use the Component

\`\`\`tsx
import { GoogleSignIn } from '@tarxemo/react-google-auth';

function LoginPage() {
  const handleCredential = async (idToken: string) => {
    // Send idToken to your backend
    const response = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken })
    });
    
    const data = await response.json();
    // Handle login success
  };
  
  return (
    <GoogleSignIn
      clientId="YOUR_GOOGLE_CLIENT_ID"
      onCredential={handleCredential}
    />
  );
}
\`\`\`

## API Reference

### GoogleSignIn Props

\`\`\`tsx
interface GoogleSignInProps {
  clientId: string;                    // Required: Google Client ID
  onCredential: (idToken: string) => Promise<void> | void;  // Required
  render?: boolean;                    // Show button (default: true)
  buttonOptions?: ButtonOptions;       // Customize button appearance
  autoPrompt?: boolean;                // Show One Tap (default: true)
  scriptId?: string;                   // Custom script ID
  onError?: (error: Error) => void;    // Error callback
  onLoad?: () => void;                 // Script loaded callback
}
\`\`\`

### Button Options

\`\`\`tsx
interface ButtonOptions {
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  logo_alignment?: 'left' | 'center';
  width?: string;
  locale?: string;
}
\`\`\`

## Usage Examples

### Custom Button Style

\`\`\`tsx
<GoogleSignIn
  clientId={CLIENT_ID}
  onCredential={handleCredential}
  buttonOptions={{
    theme: 'filled_blue',
    size: 'large',
    shape: 'pill',
    text: 'continue_with',
    logo_alignment: 'left'
  }}
/>
\`\`\`

### One Tap Only (No Button)

\`\`\`tsx
<GoogleSignIn
  clientId={CLIENT_ID}
  onCredential={handleCredential}
  render={false}  // Hide button
  autoPrompt={true}  // Show One Tap
/>
\`\`\`

### With Error Handling

\`\`\`tsx
<GoogleSignIn
  clientId={CLIENT_ID}
  onCredential={handleCredential}
  onError={(error) => {
    console.error('Google Sign-In error:', error);
    toast.error('Failed to sign in with Google');
  }}
  onLoad={() => {
    console.log('Google Sign-In loaded');
  }}
/>
\`\`\`

### Backend Verification

\`\`\`typescript
// Backend (Node.js/Express)
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(CLIENT_ID);

app.post('/api/auth/google', async (req, res) => {
  const { idToken } = req.body;
  
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    const userId = payload['sub'];
    const email = payload['email'];
    const name = payload['name'];
    const picture = payload['picture'];
    
    // Create or update user in your database
    const user = await User.findOrCreate({ googleId: userId, email, name, picture });
    
    // Create session/JWT token
    const token = createJWT(user);
    
    res.json({ success: true, token, user });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});
\`\`\`

## Best Practices

1. **Verify on Backend**: Always verify the ID token on your backend
2. **Use HTTPS**: Google Sign-In requires HTTPS in production
3. **Handle Errors**: Implement error handling for better UX
4. **Store Securely**: Never store ID tokens in localStorage

## Troubleshooting

### Issue: Button not showing

**Cause:** Invalid Client ID or script not loaded

**Solution:** Check Client ID and ensure domain is authorized

### Issue: One Tap not appearing

**Cause:** User dismissed it previously or cookies disabled

**Solution:** One Tap won't show if user dismissed it recently

## License

MIT
# react-google-sign-in
