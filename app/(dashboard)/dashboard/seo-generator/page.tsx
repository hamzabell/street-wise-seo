'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { GeneratorForm } from './generator-form';
import { SimpleResultsDisplay } from './simple-results-display';
import { EnhancedResultsDisplay } from './enhanced-results-display';
import { AdvancedSettingsPanel } from './advanced-settings-panel';
import { LoadingPage } from '@/components/ui/loading';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Wand2,
  AlertCircle,
  RefreshCw,
  Settings,
  Sparkles,
  Zap,
} from 'lucide-react';

interface TopicGenerationResult {
  inputTopic: string;
  generatedTopics: Array<{
    topic: string;
    difficulty: 'easy' | 'medium' | 'hard';
    searchVolume: number;
    competition: 'low' | 'medium' | 'high';
    suggestedTags: string[];
    relevanceScore?: number;
  }>;
  metadata: {
    businessType: string;
    targetAudience: string;
    location?: string;
    generatedAt: string;
    totalTopics: number;
    averageDifficulty: string;
    totalEstimatedVolume: number;
  };
}

interface UsageStats {
  daily: {
    generations: number;
    saves: number;
    total: number;
    limit: number;
    percentage: number;
    remaining: number;
  };
  monthly: {
    generations: number;
    saves: number;
    total: number;
    limit: number;
    percentage: number;
    remaining: number;
  };
  savedTopics: {
    count: number;
    limit: number;
    percentage: number;
    remaining: number;
  };
}

function SEOGeneratorContent() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentResult, setCurrentResult] = useState<TopicGenerationResult | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [savedTopics, setSavedTopics] = useState<Set<string>>(new Set());
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [useEnhancedView, setUseEnhancedView] = useState(true);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [advancedSettings, setAdvancedSettings] = useState({
    websiteAnalysis: null as any,
    competitorAnalysis: null as any,
    enhancedFeatures: {
      enableCompetitorAnalysis: true,
      enableWebsiteCrawling: false,
      enableGapAnalysis: true,
      enablePerformanceTracking: false,
      enableLocalSeoFocus: true,
      enableSeasonalContent: true,
    }
  });
  const [primaryWebsiteUrl, setPrimaryWebsiteUrl] = useState('');
  const [currentCompetitorUrl, setCurrentCompetitorUrl] = useState('');

  // Fetch usage stats and primary website URL on component mount
  useEffect(() => {
    fetchUsageStats();
    fetchPrimaryWebsiteUrl();
  }, []);

  const fetchUsageStats = async () => {
    try {
      const response = await fetch('/api/seo/usage');
      if (response.ok) {
        const data = await response.json();
        setUsageStats(data.data?.usage);
      } else if (response.status === 401) {
        // User not authenticated - set default stats
        setUsageStats({
          daily: { generations: 0, saves: 0, total: 0, limit: 25, percentage: 0, remaining: 25 },
          monthly: { generations: 0, saves: 0, total: 0, limit: 500, percentage: 0, remaining: 500 },
          savedTopics: { count: 0, limit: 100, percentage: 0, remaining: 100 }
        });
      }
    } catch (error) {
      console.error('Failed to fetch usage stats:', error);
      // Set fallback usage stats
      setUsageStats({
        daily: { generations: 0, saves: 0, total: 0, limit: 25, percentage: 0, remaining: 25 },
        monthly: { generations: 0, saves: 0, total: 0, limit: 500, percentage: 0, remaining: 500 },
        savedTopics: { count: 0, limit: 100, percentage: 0, remaining: 100 }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPrimaryWebsiteUrl = async () => {
    try {
      const response = await fetch('/api/user/website');
      if (response.ok) {
        const data = await response.json();
        const url = data.data?.primaryWebsiteUrl || '';
        setPrimaryWebsiteUrl(url);
      }
    } catch (error) {
      console.error('Error fetching primary website URL:', error);
    }
  };

  const handleGenerateTopics = async (formData: {
    topic: string;
    businessType: string;
    industryId: string;
    targetAudience: string;
    location?: string;
    competitorUrl?: string;
    websiteUrl?: string;
  }) => {
    setIsGenerating(true);
    setError(null);

    // Store the competitor URL for use in advanced settings
    if (formData.competitorUrl) {
      setCurrentCompetitorUrl(formData.competitorUrl);
    }

    try {
      const response = await fetch('/api/seo/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate topics');
      }

      const data = await response.json();
      setCurrentResult(data.data);

      // Update usage stats if provided
      if (data.usage) {
        setUsageStats(prev => ({
          daily: {
            generations: data.usage.daily,
            saves: prev?.daily?.saves || 0,
            total: data.usage.daily,
            limit: data.usage.limits?.dailyGenerations || 25,
            percentage: Math.round((data.usage.daily / (data.usage.limits?.dailyGenerations || 25)) * 100),
            remaining: data.usage.remaining?.daily || 0
          },
          monthly: {
            generations: data.usage.monthly,
            saves: prev?.monthly?.saves || 0,
            total: data.usage.monthly,
            limit: data.usage.limits?.monthlyGenerations || 500,
            percentage: Math.round((data.usage.monthly / (data.usage.limits?.monthlyGenerations || 500)) * 100),
            remaining: data.usage.remaining?.monthly || 0
          },
          savedTopics: prev?.savedTopics || {
            count: 0,
            limit: 100,
            percentage: 0,
            remaining: 100
          }
        }));
      }
    } catch (error) {
      console.error('Generation error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveTopic = async (topic: any) => {
    setSavingIds(prev => new Set([...prev, topic.topic]));
    try {
      const response = await fetch('/api/seo/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic.topic,
          description: topic.description,
          tags: topic.suggestedTags,
          difficulty: topic.difficulty,
          searchVolume: topic.searchVolume,
          competitionLevel: topic.competition,
          businessType: currentResult?.metadata.businessType,
          targetAudience: currentResult?.metadata.targetAudience,
          location: currentResult?.metadata.location,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save topic');
      }

      const data = await response.json();
      setSavedTopics(prev => new Set([...prev, topic.topic]));
      await fetchUsageStats(); // Refresh usage stats

      // Show success message or update UI
      console.log('Topic saved successfully:', data.data);
    } catch (error) {
      console.error('Failed to save topic:', error);
      // Show error message to user
      setError(error instanceof Error ? error.message : 'Failed to save topic');
      // Clear error after 3 seconds
      setTimeout(() => setError(null), 3000);
    } finally {
      setSavingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(topic.topic);
        return newSet;
      });
    }
  };

  const handleSaveAllTopics = async (topics: any[]) => {
    try {
      const savePromises = topics.map(topic =>
        fetch('/api/seo/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            topic: topic.topic,
            description: topic.description,
            tags: topic.suggestedTags,
            difficulty: topic.difficulty,
            searchVolume: topic.searchVolume,
            competitionLevel: topic.competition,
            businessType: currentResult?.metadata.businessType,
            targetAudience: currentResult?.metadata.targetAudience,
            location: currentResult?.metadata.location,
          }),
        })
      );

      const results = await Promise.allSettled(savePromises);
      const successful = results.filter(r => r.status === 'fulfilled');
      const failed = results.filter(r => r.status === 'rejected');

      if (successful.length > 0) {
        const newSavedTopics = new Set([...savedTopics, ...topics.map(t => t.topic)]);
        setSavedTopics(newSavedTopics);
        await fetchUsageStats(); // Refresh usage stats
      }

      if (failed.length > 0) {
        console.error(`Failed to save ${failed.length} topics`);
        setError(`Failed to save ${failed.length} topics. Some may have already been saved.`);
        setTimeout(() => setError(null), 3000);
      }

      console.log(`Successfully saved ${successful.length} topics`);
    } catch (error) {
      console.error('Failed to save topics:', error);
      setError(error instanceof Error ? error.message : 'Failed to save topics');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleRegenerate = () => {
    if (currentResult) {
      handleGenerateTopics({
        topic: currentResult.inputTopic,
        businessType: currentResult.metadata.businessType || 'general business',
        industryId: 'other', // Default to other since we don't have original industryId
        targetAudience: currentResult.metadata.targetAudience,
        location: currentResult.metadata.location,
      });
    }
  };

  const handleWebsiteAnalysis = async (url: string) => {
    try {
      const response = await fetch('/api/seo/crawl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze website');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Website analysis error:', error);
      throw error;
    }
  };

  const handleCompetitorAnalysis = async (competitorUrl: string) => {
    try {
      const response = await fetch('/api/competitors/crawl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          competitorUrl,
          enhancedFeatures: advancedSettings.enhancedFeatures
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze competitor');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Competitor analysis error:', error);
      throw error;
    }
  };

  const handleAdvancedSettingsChange = (newSettings: any) => {
    setAdvancedSettings(prev => ({
      ...prev,
      ...newSettings,
    }));
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <LoadingPage text="Loading SEO Generator..." />
      </div>
    );
  }

  return (
    <div className="w-full max-w-full space-y-6 overflow-y-auto h-full pb-8 scrollbar-hide">
      {/* Header */}
      <div className="text-center space-y-4 px-4 py-6">
        <div className="flex items-center justify-center gap-2">
          <div className="p-3 bg-primary/10 rounded-full">
            <Wand2 className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold">StreetWise SEO</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
          Generate content ideas customers actually search for. Perfect for local service businesses
          who want to attract more customers through Google.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="px-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Main Content - Single Page Flow */}
      <div className="px-4">
        {!currentResult ? (
          /* Step 1: Generation Form */
          <div className="grid xl:grid-cols-3 lg:grid-cols-1 gap-6">
            <div className="xl:col-span-2">
              <GeneratorForm
                onSubmit={handleGenerateTopics}
                isGenerating={isGenerating}
                usageStats={usageStats ? {
                  daily: usageStats.daily,
                  monthly: usageStats.monthly,
                } : undefined}
              />
            </div>

            <div className="space-y-6">
              {/* Usage Stats */}
              {usageStats && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Your Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Today's Generations</span>
                        <span className="font-medium">{usageStats.daily.generations}/{usageStats.daily.limit}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${usageStats.daily.percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Saved Topics</span>
                        <span className="font-medium">{usageStats.savedTopics.count}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Quick Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm space-y-2">
                    <p>• Be specific with your main topic for better results</p>
                    <p>• Include your service area for local SEO topics</p>
                    <p>• Focus on problems your customers actually have</p>
                    <p>• Choose the business type that fits you best</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* Step 2: Results Display */
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">Your SEO Content Strategy</h2>
                <p className="text-muted-foreground">
                  {currentResult.metadata.totalTopics} strategic topics with AI-powered insights
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  {showAdvancedSettings ? 'Hide' : 'Show'} Advanced
                </Button>
                <div className="flex items-center bg-muted rounded-lg p-1">
                  <Button
                    variant={useEnhancedView ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setUseEnhancedView(true)}
                    className="h-8 px-3"
                  >
                    <Sparkles className="h-4 w-4 mr-1" />
                    Enhanced
                  </Button>
                  <Button
                    variant={!useEnhancedView ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setUseEnhancedView(false)}
                    className="h-8 px-3"
                  >
                    Simple
                  </Button>
                </div>
                <Button onClick={handleRegenerate} variant="outline" disabled={isGenerating}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  New Topics
                </Button>
              </div>
            </div>

            {/* Advanced Settings Panel */}
            {showAdvancedSettings && (
              <AdvancedSettingsPanel
                onWebsiteAnalysis={handleWebsiteAnalysis}
                onCompetitorAnalysis={handleCompetitorAnalysis}
                onSettingsChange={handleAdvancedSettingsChange}
                websiteAnalysisResult={advancedSettings.websiteAnalysis}
                competitorAnalysisResult={advancedSettings.competitorAnalysis}
                isAnalyzing={isGenerating}
                primaryWebsiteUrl={primaryWebsiteUrl}
                competitorUrl={currentCompetitorUrl}
              />
            )}

            {useEnhancedView ? (
              <EnhancedResultsDisplay
                results={currentResult}
                onSaveTopic={handleSaveTopic}
                onSaveAllTopics={handleSaveAllTopics}
                onRegenerate={handleRegenerate}
                savedTopics={savedTopics}
                savingIds={savingIds}
                isGenerating={isGenerating}
              />
            ) : (
              <SimpleResultsDisplay
                results={currentResult}
                onSaveTopic={handleSaveTopic}
                onSaveAllTopics={handleSaveAllTopics}
                onRegenerate={handleRegenerate}
                savedTopics={savedTopics}
              />
            )}

            <div className="text-center">
              <Button
                onClick={() => setCurrentResult(null)}
                variant="outline"
                className="w-full max-w-md"
              >
                Generate More Topics
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SEOGeneratorPage() {
  return (
    <Suspense fallback={<LoadingPage text="Loading SEO Generator..." />}>
      <SEOGeneratorContent />
    </Suspense>
  );
}