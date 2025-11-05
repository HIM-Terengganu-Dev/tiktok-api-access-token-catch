
import React, { useState, useEffect } from 'react';
import { StepCard } from './components/StepCard';
import { TextInput } from './components/TextInput';
import { CodeBlock } from './components/CodeBlock';
import { AlertTriangleIcon } from './constants';

function App() {
  // State for Step 1
  const [authUrlInput, setAuthUrlInput] = useState('');
  const redirectUri = 'https://tiktok-api-access-token-catch.vercel.app';

  // State used in both steps
  const [appKey, setAppKey] = useState(process.env.TIKTOK_APP_KEY || '');
  
  // State for Step 2
  const [appSecret, setAppSecret] = useState(process.env.TIKTOK_APP_SECRET || '');
  const [authCode, setAuthCode] = useState('');
  const [curlCommand, setCurlCommand] = useState('');

  // Auto-fill auth code from URL query parameter on page load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      setAuthCode(code);
      document.getElementById('step2')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Extract App Key from pasted Authorization URL
  useEffect(() => {
    if (authUrlInput) {
      try {
        const url = new URL(authUrlInput);
        const key = url.searchParams.get('app_key');
        if (key) {
          setAppKey(key);
        } else {
          setAppKey(''); // Clear if URL is valid but doesn't contain app_key
        }
      } catch (error) {
        console.warn("Invalid Authorization URL pasted");
        setAppKey(''); // Clear if URL is invalid
      }
    }
  }, [authUrlInput]);

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
  
  const isUrlValid = authUrlInput && authUrlInput.startsWith('https://auth.tiktok-shops.com');

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-800">TikTok Shop OAuth 2.0 Helper</h1>
          <p className="text-sm text-gray-600 mt-1">A developer tool for the Custom (in-house) App OAuth flow.</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
        <StepCard stepNumber={1} title="Authorize Your Application">
            <div className="space-y-4 text-sm text-gray-700">
                <p>To get your authorization <code className="bg-gray-200 text-red-600 px-1 rounded">code</code>, you need to configure your app's **Redirect URI** in the TikTok Shop Partner Center.</p>
                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                    <p className="font-semibold text-indigo-800">Your Redirect URI is:</p>
                    <p className="text-xs text-gray-500 mt-1 mb-2">Copy this URL and paste it into the "Redirect URI" field in your app settings on the TikTok Shop Partner Center.</p>
                    <CodeBlock content={redirectUri} />
                </div>
                 <p>Once you save the Redirect URI, the Partner Center will provide you with an **Authorization URL**. Paste that full URL below.</p>
            </div>
          <TextInput
            label="Authorization URL from Partner Center"
            id="authUrl"
            value={authUrlInput}
            onChange={(e) => setAuthUrlInput(e.target.value)}
            placeholder="https://auth.tiktok-shops.com/oauth/authorize?..."
            description="The full URL provided by the TikTok Partner Center."
          />
          <div>
             <a href={isUrlValid ? authUrlInput : '#'}
               target="_blank" 
               rel="noopener noreferrer" 
               className={`mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${isUrlValid ? 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500' : 'bg-gray-400 cursor-not-allowed'}`}
               aria-disabled={!isUrlValid}
               onClick={(e) => !isUrlValid && e.preventDefault()}
            >
                Open TikTok Authorization Page
            </a>
          </div>
        </StepCard>

        <StepCard stepNumber={2} title="Exchange Code for Tokens" id="step2">
          <p className="text-sm text-gray-600">After authorizing, TikTok will redirect you back to this page with a temporary <code className="bg-gray-200 text-red-600 px-1 rounded">code</code> in the URL. It will be auto-filled below.</p>
          <TextInput
            label="TikTok App Key (auto-filled)"
            id="appKey"
            value={appKey}
            onChange={() => {}} // No-op for readOnly field
            placeholder="Auto-filled from Authorization URL in Step 1"
            readOnly={true}
          />
          <TextInput
            label="Authorization Code (auto-filled)"
            id="authCode"
            value={authCode}
            onChange={(e) => setAuthCode(e.target.value)}
            placeholder="Auto-filled from redirect URL"
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
