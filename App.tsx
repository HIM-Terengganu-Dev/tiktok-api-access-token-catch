import React, { useState, useEffect } from 'react';
import { StepCard } from './components/StepCard';
import { TextInput } from './components/TextInput';
import { CodeBlock } from './components/CodeBlock';
import { AlertTriangleIcon, InformationCircleIcon } from './constants';

type Region = 'global' | 'us';

function App() {
  // State for Step 1
  const [authUrlInput, setAuthUrlInput] = useState('');
  const [isUrlValid, setIsUrlValid] = useState(false);
  const redirectUri = 'https://tiktok-api-access-token-catch.vercel.app';

  // State used in both steps
  const [appKey, setAppKey] = useState(process.env.TIKTOK_APP_KEY || '');
  
  // State for Step 2
  const [appSecret, setAppSecret] = useState(process.env.TIKTOK_APP_SECRET || '');
  const [authCode, setAuthCode] = useState('');
  const [curlCommand, setCurlCommand] = useState('');
  const [os, setOs] = useState('other');
  const [tokenEndpoint, setTokenEndpoint] = useState('https://auth.tiktok-shops.com/api/v2/token/get');
  const [region, setRegion] = useState<Region>('global');
  const [showRegionSelector, setShowRegionSelector] = useState(false);


  // Detect OS on component mount
  useEffect(() => {
    const platform = navigator.platform.toLowerCase();
    if (platform.includes('win')) {
      setOs('Windows');
    } else if (platform.includes('mac')) {
      setOs('macOS');
    } else if (platform.includes('linux')) {
      setOs('Linux');
    }
  }, []);

  // Auto-fill auth code from URL query parameter on page load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      setAuthCode(code);
      document.getElementById('step2')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Extract App Key/Service ID and validate Authorization URL
  useEffect(() => {
    const trimmedUrl = authUrlInput.trim();
    let endpoint = 'https://auth.tiktok-shops.com/api/v2/token/get'; // Default
    let shouldShowRegionSelector = false;

    if (trimmedUrl) {
      try {
        const url = new URL(trimmedUrl);
        const key = url.searchParams.get('app_key') || url.searchParams.get('service_id');
        const hasTiktokDomain = url.hostname.endsWith('tiktok-shops.com') || url.hostname.endsWith('tiktokshop.com');

        if (key && hasTiktokDomain) {
          setAppKey(key);
          setIsUrlValid(true);
          
          if (url.hostname.startsWith('services')) {
            // Old URL format - we don't know the region, so we must ask the user.
            shouldShowRegionSelector = true;
            // Endpoint will be set by the other useEffect based on region selection
          } else {
             // New URL format includes the region in the domain, so we can set it automatically.
            shouldShowRegionSelector = false;
            endpoint = `${url.origin}/api/v2/token/get`;
            if (url.hostname.includes('-us')) {
                setRegion('us');
            } else {
                setRegion('global');
            }
          }
        } else {
          setAppKey('');
          setIsUrlValid(false);
        }
      } catch (error) {
        console.warn("Invalid Authorization URL pasted");
        setAppKey('');
        setIsUrlValid(false);
      }
    } else {
      setAppKey('');
      setIsUrlValid(false);
    }
    setShowRegionSelector(shouldShowRegionSelector);
  }, [authUrlInput]);

  // Update token endpoint based on region selection, especially for old URLs
  useEffect(() => {
    if (showRegionSelector) {
        if (region === 'us') {
            setTokenEndpoint('https://auth-us.tiktok-shops.com/api/v2/token/get');
        } else {
            setTokenEndpoint('https://auth.tiktok-shops.com/api/v2/token/get');
        }
    } else {
        // For new URLs, the endpoint is derived directly in the other effect
         const trimmedUrl = authUrlInput.trim();
        if (trimmedUrl && isUrlValid) {
            try {
                const url = new URL(trimmedUrl);
                if (!url.hostname.startsWith('services')) {
                    setTokenEndpoint(`${url.origin}/api/v2/token/get`);
                }
            } catch (e) {
                // Fallback
                setTokenEndpoint('https://auth.tiktok-shops.com/api/v2/token/get');
            }
        }
    }
  }, [region, showRegionSelector, authUrlInput, isUrlValid]);


  // Update cURL command whenever Step 2 inputs change
  useEffect(() => {
    if (appKey && appSecret && authCode) {
        const params = new URLSearchParams({
        app_key: appKey,
        app_secret: appSecret,
        auth_code: authCode,
        grant_type: 'authorized_code',
      });

      const isWindows = os === 'Windows';
      const quote = isWindows ? '"' : "'";
      const fullUrl = `${tokenEndpoint}?${params.toString()}`;

      setCurlCommand(`curl -X GET ${quote}${fullUrl}${quote}`);
    } else {
        setCurlCommand('');
    }
  }, [appKey, appSecret, authCode, tokenEndpoint, os]);

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
            placeholder="https://auth.tiktok-shops.com/... or https://services.tiktokshop.com/..."
            description={
              !isUrlValid && authUrlInput
                ? 'Please paste a valid TikTok Shop URL containing an app_key or service_id.'
                : 'The full URL provided by the TikTok Partner Center.'
            }
          />
          <div>
             <a href={isUrlValid ? authUrlInput.trim() : '#'}
               target="_blank" 
               rel="noopener noreferrer" 
               className={`mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white transition-colors ${isUrlValid ? 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500' : 'bg-gray-400 cursor-not-allowed'}`}
               aria-disabled={!isUrlValid}
               onClick={(e) => !isUrlValid && e.preventDefault()}
            >
                Open TikTok Authorization Page
            </a>
          </div>
        </StepCard>

        <StepCard stepNumber={2} title="Exchange Code for Tokens" id="step2">
          <p className="text-sm text-gray-600">After authorizing, TikTok will redirect you back to this page with a temporary <code className="bg-gray-200 text-red-600 px-1 rounded">code</code> in the URL. It will be auto-filled below.</p>
          
          {showRegionSelector && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg space-y-2">
                <p className="font-semibold text-sm text-orange-800">Select Your Shop Region</p>
                <p className="text-xs text-orange-700">Your Authorization URL doesn't specify a region. Selecting the correct one is crucial to avoid an <code className="bg-orange-200 text-orange-900 px-1 rounded-sm">invalid client_key</code> error.</p>
                <fieldset className="mt-2">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                            <input id="region-global" name="region" type="radio" checked={region === 'global'} onChange={() => setRegion('global')} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300" />
                            <label htmlFor="region-global" className="ml-2 block text-sm font-medium text-gray-700">Global (UK, Southeast Asia, etc.)</label>
                        </div>
                        <div className="flex items-center">
                            <input id="region-us" name="region" type="radio" checked={region === 'us'} onChange={() => setRegion('us')} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300" />
                            <label htmlFor="region-us" className="ml-2 block text-sm font-medium text-gray-700">United States</label>
                        </div>
                    </div>
                    <p className="text-xs text-orange-600 mt-2">Select "Global" for shops in regions like the UK, Malaysia, Singapore, and Vietnam.</p>
                </fieldset>
            </div>
          )}

          <TextInput
            label="TikTok App Key / Service ID (auto-filled)"
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
            {os !== 'other' && <p className="mt-1 text-xs text-gray-500">Command tailored for your detected OS ({os}).</p>}
            <CodeBlock content={curlCommand || 'Fill in the details above to generate the command.'} />
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <InformationCircleIcon className="h-5 w-5 text-blue-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">What's Next? Using Your Tokens</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ol className="list-decimal list-inside space-y-1">
                    <li><strong>Run the Command:</strong> Copy the command above and run it in your computer's terminal.</li>
                    <li><strong>Get Your Tokens:</strong> The output will be a JSON response containing your <code className="bg-blue-200 text-blue-900 px-1 rounded-sm">access_token</code> and <code className="bg-blue-200 text-blue-900 px-1 rounded-sm">refresh_token</code>.</li>
                    <li><strong>Store Securely:</strong> Save these tokens in a safe place (e.g., environment variables). You'll use the <code className="bg-blue-200 text-blue-900 px-1 rounded-sm">access_token</code> to make authenticated API requests to TikTok Shop.</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </StepCard>
      </main>
      
      <footer className="text-center py-4 text-sm text-gray-500">
        <p>Built for developers. Use securely.</p>
      </footer>
    </div>
  );
}

export default App;