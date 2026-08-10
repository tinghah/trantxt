import { Header } from '../components/Common/Header';
import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../hooks/useAuth';
import { Language, ApiKeyRecord, ProvidersResponse } from '../types';
import toast from 'react-hot-toast';

export const Settings = () => {
  const { user } = useAuth();
  const isAdmin = user?.isAdmin;

  // Languages
  const { data: languages, get: getLangs, put: putLang } = useApi<Language[]>();
  const [langsLoading, setLangsLoading] = useState(true);

  // Providers
  const { data: providers, get: getProviders } = useApi<ProvidersResponse>();

  // Server keys (admin)
  const { data: serverKeys, get: getServerKeys, post: postServerKey, del: delServerKey, put: putServerKey } = useApi<ApiKeyRecord[]>();

  // My keys (BYOK)
  const { data: myKeys, get: getMyKeys, post: postMyKey, del: delMyKey } = useApi<ApiKeyRecord[]>();

  // Form states
  const [serverKeyForm, setServerKeyForm] = useState({ provider: 'deepl', name: '', apiKey: '', projectId: '', clientId: '', clientSecret: '' });
  const [myKeyForm, setMyKeyForm] = useState({ provider: 'deepl', name: '', apiKey: '' });
  const [showServerForm, setShowServerForm] = useState(false);
  const [showMyForm, setShowMyForm] = useState(false);
  const [testingGoogle, setTestingGoogle] = useState(false);
  const [googleTestResult, setGoogleTestResult] = useState<string | null>(null);

  useEffect(() => {
    setLangsLoading(true);
    const url = isAdmin ? '/api/config/admin/languages' : '/api/config/languages';
    getLangs(url).finally(() => setLangsLoading(false));
    getProviders('/api/config/providers');
    getMyKeys('/api/config/user/api-keys');
    if (isAdmin) {
      getServerKeys('/api/config/admin/translation-apis');
    }
  }, [getLangs, getProviders, getMyKeys, getServerKeys, isAdmin]);

  const handleToggleLanguage = async (lang: Language) => {
    try {
      await putLang(`/api/config/admin/languages/${lang.code}`, { isEnabled: !lang.isEnabled });
      toast.success(`${lang.name} ${lang.isEnabled ? 'disabled' : 'enabled'}`);
      getLangs('/api/config/admin/languages');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update language');
    }
  };

  const handleAddServerKey = async (e: React.FormEvent) => {
    e.preventDefault();
    // For Google, allow either an API key OR OAuth credentials
    const isGoogle = serverKeyForm.provider === 'google';
    if (isGoogle && (serverKeyForm.clientId || serverKeyForm.clientSecret || serverKeyForm.projectId)) {
      if (!serverKeyForm.clientId || !serverKeyForm.clientSecret) {
        toast.error('Google client ID and client secret are required for OAuth setup');
        return;
      }
      try {
        await postServerKey('/api/config/admin/translation-apis', {
          provider: 'google',
          name: serverKeyForm.name || 'Google Cloud Translation',
          clientId: serverKeyForm.clientId,
          clientSecret: serverKeyForm.clientSecret,
          projectId: serverKeyForm.projectId,
        });
        toast.success('Google Cloud credentials saved');
        setServerKeyForm({ provider: 'google', name: '', apiKey: '', projectId: '', clientId: '', clientSecret: '' });
        setShowServerForm(false);
        getServerKeys('/api/config/admin/translation-apis');
        getProviders('/api/config/providers');
        return;
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to save Google credentials');
        return;
      }
    }
    if (!serverKeyForm.apiKey) {
      toast.error('API key is required');
      return;
    }
    try {
      await postServerKey('/api/config/admin/translation-apis', serverKeyForm);
      toast.success('Server API key added');
      setServerKeyForm({ provider: 'deepl', name: '', apiKey: '', projectId: '', clientId: '', clientSecret: '' });
      setShowServerForm(false);
      getServerKeys('/api/config/admin/translation-apis');
      getProviders('/api/config/providers');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add key');
    }
  };

  const handleTestGoogle = async () => {
    setTestingGoogle(true);
    setGoogleTestResult(null);
    try {
      const result = await getServerKeys('/api/config/admin/translation-apis/google/test');
      setGoogleTestResult(result?.error || result?.type || 'Connected');
      if (!result?.error) {
        toast.success('Google connection verified');
      }
    } catch (error: any) {
      setGoogleTestResult(error.response?.data?.message || 'Test failed');
    } finally {
      setTestingGoogle(false);
    }
  };

  const handleToggleServerKey = async (key: ApiKeyRecord) => {
    try {
      await putServerKey(`/api/config/admin/translation-apis/${key.id}`, { isActive: !key.isActive });
      getServerKeys('/api/config/admin/translation-apis');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update key');
    }
  };

  const handleDeleteServerKey = async (id: string) => {
    try {
      await delServerKey(`/api/config/admin/translation-apis/${id}`);
      toast.success('Server API key deleted');
      getServerKeys('/api/config/admin/translation-apis');
      getProviders('/api/config/providers');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete key');
    }
  };

  const handleAddMyKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myKeyForm.apiKey) {
      toast.error('API key is required');
      return;
    }
    try {
      await postMyKey('/api/config/user/api-keys', myKeyForm);
      toast.success('Your API key added');
      setMyKeyForm({ provider: 'deepl', name: '', apiKey: '' });
      setShowMyForm(false);
      getMyKeys('/api/config/user/api-keys');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add key');
    }
  };

  const handleDeleteMyKey = async (id: string) => {
    try {
      await delMyKey(`/api/config/user/api-keys/${id}`);
      toast.success('API key deleted');
      getMyKeys('/api/config/user/api-keys');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete key');
    }
  };

  const providerLabel = (p: string) =>
    ({ google: 'Google Translate', deepl: 'DeepL', azure: 'Azure Translator' }[p] || p);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Settings</h1>
          <p className="text-neutral-600">Configure languages and translation APIs</p>
        </div>

        {/* Languages */}
        <div className="card mb-8">
          <h2 className="text-lg font-bold text-neutral-900 mb-1">Supported Languages</h2>
          <p className="text-neutral-600 text-sm mb-4">
            {isAdmin ? 'Toggle which languages users can translate to.' : 'Languages available for translation. Contact an admin to enable more.'}
          </p>
          {langsLoading ? (
            <div className="animate-pulse">Loading languages...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {languages?.map((lang) => (
                <div key={lang.code} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                  <div>
                    <p className="font-medium text-neutral-900">
                      {lang.nativeName || lang.name}
                    </p>
                    <p className="text-xs text-neutral-500">{lang.name} ({lang.code})</p>
                  </div>
                  {isAdmin ? (
                    <button
                      onClick={() => handleToggleLanguage(lang)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        lang.isEnabled
                          ? 'bg-success/10 text-success hover:bg-success/20'
                          : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300'
                      }`}
                    >
                      {lang.isEnabled ? 'Enabled' : 'Disabled'}
                    </button>
                  ) : (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      lang.isEnabled ? 'bg-success/10 text-success' : 'bg-neutral-200 text-neutral-500'
                    }`}>
                      {lang.isEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Providers status */}
        <div className="card mb-8">
          <h2 className="text-lg font-bold text-neutral-900 mb-4">Translation Providers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {providers?.providers?.map((prov) => (
              <div key={prov.id} className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                <p className="font-medium text-neutral-900 mb-1">{prov.name}</p>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                  prov.serverKeyConfigured ? 'bg-success/10 text-success' : 'bg-neutral-200 text-neutral-500'
                }`}>
                  {prov.serverKeyConfigured ? 'Server key ready' : 'Not configured'}
                </span>
              </div>
            ))}
          </div>
          <p className="text-sm text-neutral-600 mt-4">
            {providers?.freeAvailable
              ? '✅ Server-side keys are available — you can translate for free, or bring your own key below.'
              : 'ℹ️ No server keys configured yet. Admin can add keys, or bring your own below.'}
          </p>
        </div>

        {/* Server keys (admin only) */}
        {isAdmin && (
          <div className="card mb-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-bold text-neutral-900">Server API Keys</h2>
                <p className="text-neutral-600 text-sm">Free keys provided to all users</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleTestGoogle}
                  disabled={testingGoogle}
                  className="btn-outline text-sm"
                >
                  {testingGoogle ? 'Testing...' : 'Test Google'}
                </button>
                <button onClick={() => setShowServerForm(!showServerForm)} className="btn-primary text-sm">
                  {showServerForm ? 'Cancel' : '+ Add Key'}
                </button>
              </div>
            </div>

            {googleTestResult && (
              <div className="mb-4 p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-sm text-neutral-700">
                <strong>Google connection:</strong> {googleTestResult}
              </div>
            )}

            {showServerForm && (
              <form onSubmit={handleAddServerKey} className="mb-6 p-4 bg-neutral-50 rounded-lg border border-neutral-200 space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Provider</label>
                    <select
                      value={serverKeyForm.provider}
                      onChange={(e) => {
                        const p = e.target.value;
                        setServerKeyForm({ ...serverKeyForm, provider: p, apiKey: p === 'google' ? '' : serverKeyForm.apiKey });
                      }}
                      className="input-base"
                    >
                      <option value="deepl">DeepL</option>
                      <option value="google">Google</option>
                      <option value="azure">Azure</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Name (optional)</label>
                    <input type="text" value={serverKeyForm.name} onChange={(e) => setServerKeyForm({ ...serverKeyForm, name: e.target.value })} className="input-base" placeholder="Server DeepL" />
                  </div>
                  {serverKeyForm.provider !== 'google' ? (
                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">API Key</label>
                      <input type="text" value={serverKeyForm.apiKey} onChange={(e) => setServerKeyForm({ ...serverKeyForm, apiKey: e.target.value })} className="input-base" placeholder="xxx..." required />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">Project ID</label>
                      <input type="text" value={serverKeyForm.projectId} onChange={(e) => setServerKeyForm({ ...serverKeyForm, projectId: e.target.value })} className="input-base" placeholder="my-project-123" />
                    </div>
                  )}
                </div>

                {serverKeyForm.provider === 'google' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">Client ID (OAuth)</label>
                      <input type="text" value={serverKeyForm.clientId} onChange={(e) => setServerKeyForm({ ...serverKeyForm, clientId: e.target.value })} className="input-base" placeholder="xxxx.apps.googleusercontent.com" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">Client Secret (OAuth)</label>
                      <input type="text" value={serverKeyForm.clientSecret} onChange={(e) => setServerKeyForm({ ...serverKeyForm, clientSecret: e.target.value })} className="input-base" placeholder="GOCSPX-..." />
                    </div>
                  </div>
                )}

                <p className="text-xs text-neutral-500">
                  {serverKeyForm.provider === 'google'
                    ? 'For Google, paste an API key (recommended for translation) OR OAuth client credentials + project ID. OAuth credentials alone cannot translate — you must also create an API key in Google Cloud Console → APIs & Services → Credentials.'
                    : 'Paste your provider API key.'}
                </p>
                <button type="submit" className="btn-primary">Save Server Key</button>
              </form>
            )}

            <div className="space-y-2">
              {serverKeys && serverKeys.length > 0 ? (
                serverKeys.map((key) => (
                  <div key={key.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                    <div>
                      <p className="font-medium text-neutral-900">{providerLabel(key.provider)}</p>
                      <p className="text-xs text-neutral-500">
                        {key.name} · {key.keyMasked}
                        {key.metadata?.projectId ? ` · project: ${key.metadata.projectId}` : ''}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleServerKey(key)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${key.isActive ? 'bg-success/10 text-success' : 'bg-neutral-200 text-neutral-500'}`}
                      >
                        {key.isActive ? 'Active' : 'Inactive'}
                      </button>
                      <button onClick={() => handleDeleteServerKey(key.id)} className="text-error hover:bg-error/10 p-2 rounded">
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-neutral-500 text-sm">No server keys configured yet.</p>
              )}
            </div>
          </div>
        )}

        {/* My keys (BYOK) */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">My API Keys</h2>
              <p className="text-neutral-600 text-sm">Bring Your Own Key (BYOK) — translations use your key first</p>
            </div>
            <button onClick={() => setShowMyForm(!showMyForm)} className="btn-outline text-sm">
              {showMyForm ? 'Cancel' : '+ Add My Key'}
            </button>
          </div>

          {showMyForm && (
            <form onSubmit={handleAddMyKey} className="mb-6 p-4 bg-neutral-50 rounded-lg border border-neutral-200 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Provider</label>
                  <select value={myKeyForm.provider} onChange={(e) => setMyKeyForm({ ...myKeyForm, provider: e.target.value })} className="input-base">
                    <option value="deepl">DeepL</option>
                    <option value="google">Google</option>
                    <option value="azure">Azure</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Name (optional)</label>
                  <input type="text" value={myKeyForm.name} onChange={(e) => setMyKeyForm({ ...myKeyForm, name: e.target.value })} className="input-base" placeholder="My DeepL Key" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">API Key</label>
                  <input type="text" value={myKeyForm.apiKey} onChange={(e) => setMyKeyForm({ ...myKeyForm, apiKey: e.target.value })} className="input-base" placeholder="xxx..." required />
                </div>
              </div>
              <button type="submit" className="btn-primary">Save My Key</button>
            </form>
          )}

          <div className="space-y-2">
            {myKeys && myKeys.length > 0 ? (
              myKeys.map((key) => (
                <div key={key.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                  <div>
                    <p className="font-medium text-neutral-900">{providerLabel(key.provider)}</p>
                    <p className="text-xs text-neutral-500">{key.name} · {key.keyMasked}</p>
                  </div>
                  <button onClick={() => handleDeleteMyKey(key.id)} className="text-error hover:bg-error/10 p-2 rounded">
                    ✕
                  </button>
                </div>
              ))
            ) : (
              <p className="text-neutral-500 text-sm">You haven't added any keys. Use the server's free keys, or add your own.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
