'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Globe, Save, Search, BarChart3, Trash2, AlertTriangle } from 'lucide-react';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function WebsiteConfigurationCard() {
  // Separate states for saved website URL and input field
  const [savedWebsiteUrl, setSavedWebsiteUrl] = useState('');
  const [inputWebsiteUrl, setInputWebsiteUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReplaceConfirm, setShowReplaceConfirm] = useState(false);
  const [tempUrl, setTempUrl] = useState('');
  const searchParams = useSearchParams();
  const showAnalysisPrompt = searchParams.get('action') === 'analyze';

  useEffect(() => {
    fetchWebsiteUrl();
    fetchAnalysisStatus();
  }, []);

  // Add a retry mechanism in case the user authenticates after initial load
  useEffect(() => {
    const retryInterval = setInterval(() => {
      if (!isLoading && !message) {
        fetchWebsiteUrl();
      }
    }, 5000); // Retry every 5 seconds

    return () => clearInterval(retryInterval);
  }, [isLoading, message]);

  const fetchWebsiteUrl = async () => {
    try {
      console.log('🔍 [SECURITY PAGE] Fetching website URL...');
      const response = await fetch('/api/user/website');

      if (response.ok) {
        const data = await response.json();
        console.log('📋 [SECURITY PAGE] Website URL API Response:', {
          success: data.success,
          primaryWebsiteUrl: data.data?.primaryWebsiteUrl,
          fullResponse: data
        });

        const url = data.data?.primaryWebsiteUrl || '';
        console.log('🌐 [SECURITY PAGE] Setting saved website URL state to:', url || '(empty)');
        setSavedWebsiteUrl(url);

        // Also clear input field when no saved URL
        if (!url || url.trim() === '') {
          setInputWebsiteUrl('');
        }

        // Clear any authentication error messages if we successfully fetch data
        if (message?.text?.includes('sign in') || message?.text?.includes('load website configuration')) {
          setMessage(null);
        }
      } else if (response.status === 401) {
        // Only set auth message if we don't already have one
        if (!message || !message.text.includes('sign in')) {
          setMessage({
            type: 'error',
            text: 'Please sign in to manage your website configuration.'
          });
        }
      } else {
        console.error('❌ [SECURITY PAGE] Failed to fetch website URL:', response.status);
        setMessage({
          type: 'error',
          text: 'Failed to load website configuration. Please try refreshing the page.'
        });
      }
    } catch (error) {
      console.error('❌ [SECURITY PAGE] Network error fetching website URL:', error);
      setMessage({
        type: 'error',
        text: 'Network error while loading website configuration.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnalysisStatus = async () => {
    try {
      const response = await fetch('/api/user/website-status');

      if (response.ok) {
        const data = await response.json();
        setAnalysisStatus(data.data);
      }
    } catch (error) {
      console.error('Error fetching analysis status:', error);
    }
  };

  const handleSaveWebsiteUrl = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      console.log('🔧 [SECURITY PAGE] Attempting to save website URL:', inputWebsiteUrl);

      const response = await fetch('/api/user/website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteUrl: inputWebsiteUrl }),
      });

      const data = await response.json();
      console.log('📋 [SECURITY PAGE] API Response:', {
        status: response.status,
        success: data.success,
        message: data.message,
        error: data.error,
        details: data.details
      });

      if (response.ok && data.success) {
        // Success case - update the saved state and clear input
        setSavedWebsiteUrl(inputWebsiteUrl);
        setInputWebsiteUrl(''); // Clear input after successful save
        setMessage({
          type: 'success',
          text: data.message || 'Website URL saved successfully'
        });
        // Refresh analysis status after saving
        await fetchAnalysisStatus();
        console.log('✅ [SECURITY PAGE] Website URL saved successfully');
      } else {
        // Error case - provide detailed feedback
        let errorMessage = data.error || 'Failed to save website URL';

        // Add details if available
        if (data.details && typeof data.details === 'string') {
          errorMessage = `${errorMessage}: ${data.details}`;
        }

        // Handle specific validation errors
        if (data.requiresAction === 'replace_or_delete') {
          setTempUrl(inputWebsiteUrl);
          setShowReplaceConfirm(true);
          setMessage({
            type: 'error',
            text: 'You already have a primary website URL. Choose to replace it (will delete existing data) or cancel.'
          });
        } else {
          setMessage({
            type: 'error',
            text: errorMessage
          });
          console.error('❌ [SECURITY PAGE] API Error:', {
            status: response.status,
            error: data.error,
            details: data.details
          });
        }
      }
    } catch (error) {
      console.error('❌ [SECURITY PAGE] Network/Fetch Error:', error);
      setMessage({
        type: 'error',
        text: 'Network error - please check your connection and try again'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReplaceWebsiteUrl = async () => {
    setIsSaving(true);
    setShowReplaceConfirm(false);
    setMessage(null);

    try {
      console.log('🔄 [SECURITY PAGE] Attempting to replace website URL with:', tempUrl);

      const response = await fetch('/api/user/website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteUrl: tempUrl, replaceExisting: true }),
      });

      const data = await response.json();
      console.log('📋 [SECURITY PAGE] Replace API Response:', {
        status: response.status,
        success: data.success,
        message: data.message,
        error: data.error,
        details: data.details
      });

      if (response.ok && data.success) {
        setSavedWebsiteUrl(tempUrl);
        setInputWebsiteUrl(''); // Clear input after successful replace
        setMessage({
          type: 'success',
          text: data.message || 'Website URL replaced successfully'
        });
        setTempUrl('');
        // Refresh analysis status after replacing
        await fetchAnalysisStatus();
        console.log('✅ [SECURITY PAGE] Website URL replaced successfully');
      } else {
        let errorMessage = data.error || 'Failed to replace website URL';
        if (data.details && typeof data.details === 'string') {
          errorMessage = `${errorMessage}: ${data.details}`;
        }
        setMessage({
          type: 'error',
          text: errorMessage
        });
        console.error('❌ [SECURITY PAGE] Replace API Error:', {
          status: response.status,
          error: data.error,
          details: data.details
        });
      }
    } catch (error) {
      console.error('❌ [SECURITY PAGE] Replace Network Error:', error);
      setMessage({
        type: 'error',
        text: 'Network error while replacing website URL - please try again'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteWebsiteUrl = async () => {
    setIsDeleting(true);
    setShowDeleteConfirm(false);
    setMessage(null);

    try {
      console.log('🗑️ [SECURITY PAGE] Attempting to delete website URL');

      const response = await fetch('/api/user/website', {
        method: 'DELETE',
      });

      const data = await response.json();
      console.log('📋 [SECURITY PAGE] Delete API Response:', {
        status: response.status,
        success: data.success,
        message: data.message,
        error: data.error,
        details: data.details
      });

      if (response.ok && data.success) {
        setSavedWebsiteUrl('');
        setInputWebsiteUrl(''); // Clear input after successful deletion
        setMessage({
          type: 'success',
          text: data.message || 'Website URL deleted successfully'
        });
        // Refresh analysis status after deletion
        await fetchAnalysisStatus();
        console.log('✅ [SECURITY PAGE] Website URL deleted successfully');
      } else {
        let errorMessage = data.error || 'Failed to delete website URL';
        if (data.details && typeof data.details === 'string') {
          errorMessage = `${errorMessage}: ${data.details}`;
        }
        setMessage({
          type: 'error',
          text: errorMessage
        });
        console.error('❌ [SECURITY PAGE] Delete API Error:', {
          status: response.status,
          error: data.error,
          details: data.details
        });
      }
    } catch (error) {
      console.error('❌ [SECURITY PAGE] Delete Network Error:', error);
      setMessage({
        type: 'error',
        text: 'Network error while deleting website URL - please try again'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAnalyzeWebsite = async () => {
    if (!savedWebsiteUrl.trim()) {
      setMessage({ type: 'error', text: 'Please set your website URL first' });
      return;
    }

    setIsAnalyzing(true);
    setMessage(null);

    try {
      const response = await fetch('/api/seo/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: savedWebsiteUrl,
          maxPages: 10,
          includeExternalLinks: false
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage({
          type: 'success',
          text: `Website analysis completed! Found ${data.data.websiteAnalysis.crawledPages.length} pages and ${data.data.contentAnalysis?.contentGaps.length || 0} content gaps.`
        });
        // Refresh analysis status
        await fetchAnalysisStatus();
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.error || 'Failed to analyze website' });
      }
    } catch (error) {
      console.error('Error analyzing website:', error);
      setMessage({ type: 'error', text: 'Failed to analyze website' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Website Configuration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label className="mb-2">
              Primary Website URL
            </Label>
            {(!savedWebsiteUrl || savedWebsiteUrl.trim() === '') ? (
              <>
                <Input
                  id="website-url"
                  type="url"
                  placeholder="https://www.example.com"
                  value={inputWebsiteUrl}
                  onChange={(e) => setInputWebsiteUrl(e.target.value)}
                  disabled={isSaving || isLoading}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter your primary website URL. This will be used for competitor analysis and SEO comparisons.
                </p>
              </>
            ) : (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800">Website Configured</span>
                  </div>
                  <span className="text-sm text-gray-600 font-mono">{savedWebsiteUrl}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  This website URL is used for competitor analysis and SEO comparisons. Use the buttons below to replace or delete it.
                </p>
                {showReplaceConfirm && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <Input
                      id="replace-website-url"
                      type="url"
                      placeholder="Enter new website URL"
                      value={tempUrl}
                      onChange={(e) => setTempUrl(e.target.value)}
                      disabled={isSaving}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter the new website URL to replace the current one.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {message && (
            <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                <div className="flex items-start gap-2">
                  {message.type === 'success' ? (
                    <div className="h-4 w-4 rounded-full bg-green-600 flex-shrink-0 mt-0.5"></div>
                  ) : (
                    <div className="h-4 w-4 rounded-full bg-red-600 flex-shrink-0 mt-0.5"></div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{message.text}</p>
                    {message.type === 'error' && (
                      <p className="text-sm text-red-600 mt-1">
                        Please try again or contact support if the problem persists.
                      </p>
                    )}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center space-x-2 text-blue-600 bg-blue-50 p-4 rounded-lg">
            <Info className="h-5 w-5" />
            <p className="text-sm">
              Setting your primary website URL enables competitor analysis features and provides better SEO insights.
            </p>
          </div>

          {/* Analysis Status */}
          {analysisStatus && (
            <div className={`p-4 rounded-lg ${
              analysisStatus.hasBeenAnalyzed
                ? 'bg-green-50 border border-green-200'
                : 'bg-orange-50 border border-orange-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {analysisStatus.hasBeenAnalyzed ? (
                    <>
                      <div className="h-2 w-2 bg-green-600 rounded-full"></div>
                      <span className="text-sm font-medium text-green-800">Website Analyzed</span>
                    </>
                  ) : (
                    <>
                      <div className="h-2 w-2 bg-orange-600 rounded-full"></div>
                      <span className="text-sm font-medium text-orange-800">Analysis Required</span>
                    </>
                  )}
                </div>
                {analysisStatus.lastAnalysisDate && (
                  <span className="text-xs text-muted-foreground">
                    Last analyzed: {new Date(analysisStatus.lastAnalysisDate).toLocaleDateString()}
                  </span>
                )}
              </div>
              {showAnalysisPrompt && !analysisStatus.hasBeenAnalyzed && (
                <div className="mt-3 text-sm text-orange-700">
                  <p className="font-medium mb-1">🎯 Ready to analyze your website?</p>
                  <p>Analyzing your website helps identify content gaps and provides baseline data for competitor analysis.</p>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 flex-wrap">
            {(!savedWebsiteUrl || savedWebsiteUrl.trim() === '') ? (
              <Button
                onClick={handleSaveWebsiteUrl}
                disabled={isSaving || isLoading || !inputWebsiteUrl.trim()}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Website URL
                  </>
                )}
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => {
                    setTempUrl('');
                    setShowReplaceConfirm(true);
                  }}
                  disabled={isSaving || isLoading}
                  variant="outline"
                >
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Replace Website URL
                  </>
                </Button>
                <Button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isDeleting || isLoading}
                  variant="destructive"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Website URL
                    </>
                  )}
                </Button>
              </>
            )}

            {savedWebsiteUrl && savedWebsiteUrl.trim() !== '' && analysisStatus && (
              <Button
                onClick={handleAnalyzeWebsite}
                disabled={isAnalyzing || !savedWebsiteUrl.trim()}
                variant={analysisStatus.hasBeenAnalyzed ? "outline" : "default"}
                className={!analysisStatus.hasBeenAnalyzed ? "bg-green-600 hover:bg-green-700 text-white" : ""}
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    {analysisStatus.hasBeenAnalyzed ? (
                      <>
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Re-analyze Website
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Analyze My Website
                      </>
                    )}
                  </>
                )}
              </Button>
            )}
          </div>

  
          {/* Replace Confirmation Dialog */}
          {showReplaceConfirm && (
            <div className="border border-orange-200 bg-orange-50 rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-2 text-orange-800">
                <AlertTriangle className="h-5 w-5" />
                <h3 className="font-semibold">Replace Website URL</h3>
              </div>
              <div className="text-sm text-orange-700 space-y-2">
                <p>You are about to replace your current website URL with:</p>
                <p className="font-mono bg-white p-2 rounded border border-orange-200">{tempUrl}</p>
                <p className="font-semibold">⚠️ This will permanently delete all associated data:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Website analysis results</li>
                  <li>Crawled pages data</li>
                  <li>Content gaps analysis</li>
                  <li>Competitor analysis reports</li>
                  <li>PDF reports and content briefs</li>
                </ul>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleReplaceWebsiteUrl}
                  disabled={isSaving}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Replacing...
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Replace & Delete Data
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setShowReplaceConfirm(false);
                    setTempUrl('');
                    setMessage(null);
                  }}
                  variant="outline"
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Delete Confirmation Dialog */}
          {showDeleteConfirm && (
            <div className="border border-red-200 bg-red-50 rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="h-5 w-5" />
                <h3 className="font-semibold">Delete Website URL</h3>
              </div>
              <div className="text-sm text-red-700 space-y-2">
                <p>Are you sure you want to delete your primary website URL?</p>
                <p className="font-semibold">⚠️ This will permanently delete all associated data for your primary website:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Website analysis results</li>
                  <li>Crawled pages data</li>
                  <li>Content gaps analysis</li>
                  <li>Competitor analysis reports</li>
                  <li>PDF reports and content briefs</li>
                </ul>
                <p className="font-semibold">This action cannot be undone and will remove access to all website-related features.</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleDeleteWebsiteUrl}
                  disabled={isDeleting}
                  variant="destructive"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete & Remove Data
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setMessage(null);
                  }}
                  variant="outline"
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


export default function SecurityPage() {
  return (
    <section className="flex-1 p-4 lg:p-8 mobile-content-safe">
      <h1 className="text-lg lg:text-2xl font-medium bold text-gray-900 mb-8">
        Security Settings
      </h1>

      <div className="space-y-8">
        <Suspense fallback={<div>Loading website configuration...</div>}>
          <WebsiteConfigurationCard />
        </Suspense>

        <Card>
          <CardHeader>
            <CardTitle>Account Deletion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Account deletion is handled through Supabase for security reasons.
                Please contact support or access your Supabase dashboard to manage account deletion.
              </p>
              <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 p-4 rounded-lg">
                <Info className="h-5 w-5" />
                <p className="text-sm">
                  For immediate assistance with account deletion, please contact our support team.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
