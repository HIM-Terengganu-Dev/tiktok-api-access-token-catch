
import React, { useState, useEffect } from 'react';
import { StepCard } from './components/StepCard';
import { TextInput } from './components/TextInput';
import { CodeBlock } from './components/CodeBlock';
import { AlertTriangleIcon } from './constants';

function App() {
  // State for Step 1
  const [appKey, setAppKey] = useState(process.env.TIKTOK_APP_KEY || '');
  const [redirectUri, setRedirectUri] = useState('https://your-vercel-domain.vercel.app/api/auth/callback');
  const [scopes, setScopes] = useState('order_management,product_management');
  const [authState, setAuthState] = useState('');
  const [authUrl, setAuthUrl] = useState('');

  // State for Step 2
  const [appSecret, setAppSecret] = useState(process.env.TIKTOK_APP_SECRET || '');
  const [authCode, setAuthCode] = useState('');
  const [curlCommand, setCurlCommand] = useState('');

  // Generate a unique state value on component mount
  useEffect(() => {
    setAuthState(crypto.randomUUID());
  }, []);
  
  // Auto-fill auth code from URL query parameter on page load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    if (code) {
      setAuthCode(code);
      // Optional: Compare state with stored state for security
      console.log("Received state:", state);
      // Scroll to Step 2 for better UX
      document.getElementById('step2')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);


  // Update Authorization URL whenever Step 1 inputs change
  useEffect(() => {
    if (appKey && authState && redirectUri && scopes) {
        const params = new URLSearchParams({
        app_key: appKey,
        state: authState,
        redirect_uri: redirectUri,
        scope: scopes,
        response_type: 'code',
      });
      setAuthUrl(`https://auth.tiktok-shops.com/oauth/authorize?${params.toString()}`);
    } else {
        setAuthUrl('');
    }
  }, [appKey, redirectUri, scopes, authState]);

  // Update cURL command whenever Step 2 inputs change
  useEffect(() => {
    if (appKey && appSecret && authCode) {
        const params = new URLSearchParams({
        app_key: appKey,
        app_secret: appSecret,
        auth_code: authCode,
        grant_type: 'authorized_code',
      });
      setCurlCommand(`curl -X GET 'https://auth.tiktok-shops.com/api/v2/token/get?${params.toString()}'`);
    } else {
        setCurlCommand('');
    }
  }, [appKey, appSecret, authCode]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-800">TikTok Shop OAuth 2.0 Helper</h1>
          <p className="text-sm text-gray-600 mt-1">A developer tool for the Custom (in-house) App OAuth flow.</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
        <StepCard stepNumber={1} title="Generate Authorization URL">
          <TextInput
            label="TikTok App Key"
            id="appKey"
            value={appKey}
            onChange={(e) => setAppKey(e.target.value)}
            placeholder="Enter your TikTok App Key"
          />
          <TextInput
            label="Redirect URI"
            id="redirectUri"
            value={redirectUri}
            onChange={(e) => setRedirectUri(e.target.value)}
            placeholder="e.g., https://your-domain.com/callback"
            description="Must exactly match the one in your TikTok Shop Partner Center."
          />
          <TextInput
            label="Scopes"
            id="scopes"
            value={scopes}
            onChange={(e) => setScopes(e.target.value)}
            placeholder="e.g., order_management,product_management"
            description="Comma-separated list of required permissions."
          />
          <div>
            <label className="block text-sm font-medium text-gray-700">Generated Authorization URL</label>
            <CodeBlock content={authUrl || 'Fill in the details above to generate the URL.'} />
            {authUrl && (
                <a href={authUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Open TikTok Authorization Page
                </a>
            )}
          </div>
        </StepCard>

        <StepCard stepNumber={2} title="Exchange Code for Tokens" id="step2">
          <p className="text-sm text-gray-600">After authorizing, TikTok will redirect you to your Redirect URI with a temporary <code className="bg-gray-200 text-red-600 px-1 rounded">code</code> in the URL. Paste it below.</p>
          <TextInput
            label="Authorization Code"
            id="authCode"
            value={authCode}
            onChange={(e) => setAuthCode(e.target.value)}
            placeholder="Paste the code from the redirect URL"
          />
          <TextInput
            label="TikTok App Secret"
            id="appSecret"
            type="password"
            value={appSecret}
            onChange={(e) => setAppSecret(e.target.value)}
            placeholder="Enter your TikTok App Secret"
          />

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  For security, the token exchange must be done from a server. Run the command below in your local terminal to get your tokens. Your App Secret is never sent from this browser.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Generated Terminal Command</label>
            <CodeBlock content={curlCommand || 'Fill in the details above to generate the command.'} />
          </div>
          <p className="text-sm text-gray-600">The command output will be a JSON object containing your <code className="bg-gray-200 px-1 rounded">access_token</code> and <code className="bg-gray-200 px-1 rounded">refresh_token</code>.</p>
        </StepCard>
      </main>
      
      <footer className="text-center py-4 text-sm text-gray-500">
        <p>Built for developers. Use securely.</p>
      </footer>
    </div>
  );
}

export default App;
