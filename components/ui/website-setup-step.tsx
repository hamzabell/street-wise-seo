'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Globe,
  Check,
  AlertCircle,
  Search,
  Info,
  ArrowRight,
  Zap
} from 'lucide-react';

interface WebsiteSetupStepProps {
  onComplete: () => void;
  onSkip?: () => void;
  initialCompleted: boolean;
}

export function WebsiteSetupStep({
  onComplete,
  onSkip,
  initialCompleted
}: WebsiteSetupStepProps) {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(initialCompleted);
  const [savedUrl, setSavedUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisCompleted, setAnalysisCompleted] = useState(false);

  useEffect(() => {
    fetchExistingWebsite();
  }, []);

  const fetchExistingWebsite = async () => {
    try {
      const response = await fetch('/api/user/website');
      if (response.ok) {
        const data = await response.json();
        const url = data.data?.primaryWebsiteUrl;
        if (url) {
          setSavedUrl(url);
          setIsSaved(true);
          if (!initialCompleted) {
            setWebsiteUrl(url);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch existing website:', error);
    }
  };

  const handleSaveWebsite = async () => {
    if (!websiteUrl.trim()) {
      setError('Please enter a website URL');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/user/website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteUrl: websiteUrl.trim() }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSavedUrl(websiteUrl.trim());
        setIsSaved(true);
        setWebsiteUrl('');

        // Automatically start website analysis after saving
        await handleAnalyzeWebsite(websiteUrl.trim());
      } else {
        setError(data.error || 'Failed to save website URL');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAnalyzeWebsite = async (url: string) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/seo/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          maxPages: 10,
          includeExternalLinks: false
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysisCompleted(true);
        // Give a moment for user to see the success state
        setTimeout(() => {
          onComplete();
        }, 1500);
      } else {
        // Analysis failed but we still proceed
        setError('Website saved, but analysis failed. You can try again later.');
        setTimeout(() => {
          onComplete();
        }, 2000);
      }
    } catch (error) {
      console.error('Website analysis error:', error);
      setError('Website saved, but analysis failed. You can try again later.');
      setTimeout(() => {
        onComplete();
      }, 2000);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const isUrlValid = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const getDisplayUrl = () => {
    if (savedUrl) return savedUrl;
    if (websiteUrl) return websiteUrl;
    return '';
  };

  if (isSaved && analysisCompleted) {
    return (
      <div className="text-center space-y-6 py-8">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-green-900">Website Setup Complete!</h3>
          <p className="text-muted-foreground">
            Your website <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{savedUrl}</span> has been analyzed and is ready for SEO optimization.
          </p>
        </div>
        <div className="flex items-center justify-center gap-2 text-sm text-green-600">
          <Zap className="h-4 w-4" />
          <span>Moving to next step automatically...</span>
        </div>
      </div>
    );
  }

  if (isSaved && isAnalyzing) {
    return (
      <div className="text-center space-y-6 py-8">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <Search className="h-8 w-8 text-blue-600 animate-pulse" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-blue-900">Analyzing Your Website</h3>
          <p className="text-muted-foreground">
            We're analyzing <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{savedUrl}</span> to gather insights for better SEO recommendations.
          </p>
        </div>
        <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span>This usually takes 30-60 seconds...</span>
        </div>
      </div>
    );
  }

  if (isSaved) {
    return (
      <div className="text-center space-y-6 py-8">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold text-green-900">Website Connected!</h3>
            <p className="text-muted-foreground mt-2">
              Your website has been successfully connected.
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-left">
            <div className="flex items-center gap-2 text-green-700 mb-2">
              <Globe className="h-4 w-4" />
              <span className="font-medium">Connected Website</span>
            </div>
            <p className="font-mono text-sm text-gray-700 break-all">{savedUrl}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={onComplete}
              size="lg"
              className="bg-green-600 hover:bg-green-700"
            >
              Continue to Next Step
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            {onSkip && (
              <Button
                variant="outline"
                onClick={onSkip}
                size="lg"
              >
                Skip This Step
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Connect Your Website</h3>
        <p className="text-muted-foreground text-sm">
          Add your primary website URL to enable personalized SEO recommendations and topic suggestions.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="website-url" className="block text-sm font-medium mb-2">
            Primary Website URL
          </label>
          <Input
            id="website-url"
            type="url"
            placeholder="https://www.example.com"
            value={websiteUrl}
            onChange={(e) => {
              setWebsiteUrl(e.target.value);
              setError(null);
            }}
            disabled={isSaving}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground mt-1">
            This will be used for competitor analysis and SEO recommendations.
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center gap-2 text-blue-600 bg-blue-50 p-4 rounded-lg">
          <Info className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">
            After adding your website, we'll analyze it to provide better SEO insights and topic suggestions.
          </p>
        </div>
      </div>

      <Separator />

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          onClick={handleSaveWebsite}
          disabled={isSaving || !websiteUrl.trim() || !isUrlValid(websiteUrl)}
          size="lg"
          className="min-w-[200px]"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              Save & Analyze Website
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
        {onSkip && (
          <Button
            variant="outline"
            onClick={onSkip}
            disabled={isSaving}
            size="lg"
          >
            Skip for Now
          </Button>
        )}
      </div>

      <div className="text-center">
        <Badge variant="secondary" className="text-xs">
          Optional step - you can always add your website later
        </Badge>
      </div>
    </div>
  );
}