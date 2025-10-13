'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Globe,
  TrendingUp,
  Search,
  Settings,
  Loader2,
  CheckCircle,
  AlertCircle,
  Info,
  Zap,
  Target,
  BarChart3,
  Eye,
  Clock,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

interface AdvancedSettingsPanelProps {
  onWebsiteAnalysis?: (url: string) => Promise<any>;
  onCompetitorAnalysis?: (competitorUrl: string) => Promise<any>;
  onSettingsChange?: (settings: any) => void;
  isAnalyzing?: boolean;
  websiteAnalysisResult?: any;
  competitorAnalysisResult?: any;
  primaryWebsiteUrl?: string;
  competitorUrl?: string;
}

export function AdvancedSettingsPanel({
  onWebsiteAnalysis,
  onCompetitorAnalysis,
  onSettingsChange,
  isAnalyzing = false,
  websiteAnalysisResult,
  competitorAnalysisResult,
  primaryWebsiteUrl,
  competitorUrl,
}: AdvancedSettingsPanelProps) {
  const [websiteUrl, setWebsiteUrl] = useState(primaryWebsiteUrl || '');
  const [competitorUrlState, setCompetitorUrlState] = useState(competitorUrl || '');

  // Update URLs when props change
  useEffect(() => {
    if (primaryWebsiteUrl) {
      setWebsiteUrl(primaryWebsiteUrl);
    }
  }, [primaryWebsiteUrl]);

  useEffect(() => {
    if (competitorUrl) {
      setCompetitorUrlState(competitorUrl);
    }
  }, [competitorUrl]);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState('');
  const [analysisErrors, setAnalysisErrors] = useState<string[]>([]);
  const [enhancedFeatures, setEnhancedFeatures] = useState({
    enableCompetitorAnalysis: true,
    enableWebsiteCrawling: false,
    enableGapAnalysis: true,
    enablePerformanceTracking: false,
    enableLocalSeoFocus: true,
    enableSeasonalContent: true,
  });

  const handleWebsiteAnalysis = async () => {
    if (!websiteUrl || !onWebsiteAnalysis) return;

    setAnalysisErrors([]);
    setAnalysisProgress(0);
    setAnalysisStage('Initiating website analysis...');

    let progressInterval: NodeJS.Timeout | null = null;

    try {
      // Simulate progress updates
      const progressStages = [
        { progress: 10, stage: 'Connecting to website...' },
        { progress: 25, stage: 'Crawling pages and content...' },
        { progress: 40, stage: 'Analyzing topics and keywords...' },
        { progress: 55, stage: 'Identifying content gaps...' },
        { progress: 70, stage: 'Evaluating SEO performance...' },
        { progress: 85, stage: 'Generating recommendations...' },
        { progress: 100, stage: 'Analysis complete!' }
      ];

      let currentStageIndex = 0;
      progressInterval = setInterval(() => {
        if (currentStageIndex < progressStages.length) {
          const stage = progressStages[currentStageIndex];
          setAnalysisProgress(stage.progress);
          setAnalysisStage(stage.stage);
          currentStageIndex++;
        } else if (progressInterval) {
          clearInterval(progressInterval);
          progressInterval = null;
        }
      }, 800);

      const result = await onWebsiteAnalysis(websiteUrl);
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
      setAnalysisProgress(100);
      setAnalysisStage('Website analysis completed successfully!');

      if (onSettingsChange) {
        onSettingsChange({
          websiteAnalysis: result,
          enhancedFeatures,
        });
      }

    } catch (error) {
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
      setAnalysisProgress(0);
      setAnalysisStage('');
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze website';
      setAnalysisErrors([errorMessage]);
    }
  };

  const handleCompetitorAnalysis = async () => {
    if (!competitorUrlState || !onCompetitorAnalysis) return;

    setAnalysisErrors([]);
    setAnalysisProgress(0);
    setAnalysisStage('Analyzing competitor website...');

    try {
      const result = await onCompetitorAnalysis(competitorUrlState);
      setAnalysisProgress(100);
      setAnalysisStage('Competitor analysis completed!');

      if (onSettingsChange) {
        onSettingsChange({
          competitorAnalysis: result,
          enhancedFeatures,
        });
      }

    } catch (error) {
      setAnalysisProgress(0);
      setAnalysisStage('');
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze competitor';
      setAnalysisErrors([errorMessage]);
    }
  };

  const handleFeatureToggle = (feature: string, enabled: boolean) => {
    const newFeatures = { ...enhancedFeatures, [feature]: enabled };
    setEnhancedFeatures(newFeatures);

    if (onSettingsChange) {
      onSettingsChange({
        enhancedFeatures: newFeatures,
        websiteAnalysis: websiteAnalysisResult,
        competitorAnalysis: competitorAnalysisResult,
      });
    }
  };

  const getAnalysisSummary = () => {
    const summaries = [];

    if (websiteAnalysisResult) {
      summaries.push({
        type: 'website',
        title: 'Website Analysis',
        status: 'completed',
        details: `${websiteAnalysisResult.totalPages || 0} pages analyzed, ${websiteAnalysisResult.topicsFound || 0} topics identified`
      });
    }

    if (competitorAnalysisResult) {
      summaries.push({
        type: 'competitor',
        title: 'Competitor Analysis',
        status: 'completed',
        details: `${competitorAnalysisResult.opportunities || 0} opportunities found, ${competitorAnalysisResult.contentGaps || 0} gaps identified`
      });
    }

    return summaries;
  };

  const analysisSummaries = getAnalysisSummary();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Advanced SEO Analysis
        </CardTitle>
        <CardDescription>
          Enhance your topic generation with website analysis and competitor intelligence
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Analysis Summary */}
        {analysisSummaries.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Completed Analyses
            </h4>
            <div className="grid gap-2">
              {analysisSummaries.map((summary, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    {summary.type === 'website' ? (
                      <Globe className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    )}
                    <div>
                      <div className="font-medium text-sm">{summary.title}</div>
                      <div className="text-xs text-green-700">{summary.details}</div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Completed
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Website Analysis */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <Label className="font-medium">Your Website Analysis</Label>
          </div>
          <div className="space-y-2">
            <div className="relative">
              <Input
                placeholder="https://yourwebsite.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                disabled={true} // Always disabled - read-only from security settings
                className="bg-gray-50 text-gray-700 border-gray-300"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Settings className="h-4 w-4 text-gray-400" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Your website URL is configured in Settings → Security → Website Configuration
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleWebsiteAnalysis}
                disabled={!websiteUrl || isAnalyzing}
                variant="outline"
                size="sm"
              >
                {isAnalyzing && analysisStage.includes('website') ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Analyze Your Website
              </Button>
              {websiteUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(websiteUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Competitor Analysis */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <Label className="font-medium">Competitor Analysis</Label>
          </div>
          <div className="space-y-2">
            <Input
              placeholder="https://competitor.com"
              value={competitorUrlState}
              onChange={(e) => setCompetitorUrlState(e.target.value)}
              disabled={isAnalyzing}
            />
            <p className="text-xs text-muted-foreground">
              Competitor URL is taken from the main SEO form. You can edit it here or update it in the form above.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleCompetitorAnalysis}
                disabled={!competitorUrlState || isAnalyzing}
                variant="outline"
                size="sm"
              >
                {isAnalyzing && analysisStage.includes('competitor') ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <BarChart3 className="h-4 w-4 mr-2" />
                )}
                Analyze Competitor
              </Button>
              {competitorUrlState && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(competitorUrlState, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Features */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <Label className="font-medium">Enhanced Features</Label>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="competitor-analysis"
                checked={enhancedFeatures.enableCompetitorAnalysis}
                onCheckedChange={(checked) => handleFeatureToggle('enableCompetitorAnalysis', checked as boolean)}
              />
              <Label htmlFor="competitor-analysis" className="text-sm">
                Competitor Analysis Integration
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="website-crawling"
                checked={enhancedFeatures.enableWebsiteCrawling}
                onCheckedChange={(checked) => handleFeatureToggle('enableWebsiteCrawling', checked as boolean)}
              />
              <Label htmlFor="website-crawling" className="text-sm">
                Website Content Crawling
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="gap-analysis"
                checked={enhancedFeatures.enableGapAnalysis}
                onCheckedChange={(checked) => handleFeatureToggle('enableGapAnalysis', checked as boolean)}
              />
              <Label htmlFor="gap-analysis" className="text-sm">
                Content Gap Analysis
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="performance-tracking"
                checked={enhancedFeatures.enablePerformanceTracking}
                onCheckedChange={(checked) => handleFeatureToggle('enablePerformanceTracking', checked as boolean)}
              />
              <Label htmlFor="performance-tracking" className="text-sm">
                Performance Tracking
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="local-seo-focus"
                checked={enhancedFeatures.enableLocalSeoFocus}
                onCheckedChange={(checked) => handleFeatureToggle('enableLocalSeoFocus', checked as boolean)}
              />
              <Label htmlFor="local-seo-focus" className="text-sm">
                Local SEO Focus
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="seasonal-content"
                checked={enhancedFeatures.enableSeasonalContent}
                onCheckedChange={(checked) => handleFeatureToggle('enableSeasonalContent', checked as boolean)}
              />
              <Label htmlFor="seasonal-content" className="text-sm">
                Seasonal Content Suggestions
              </Label>
            </div>
          </div>
        </div>

        {/* Analysis Progress */}
        {isAnalyzing && analysisProgress > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm font-medium">{analysisStage}</span>
            </div>
            <Progress value={analysisProgress} className="w-full" />
            <div className="text-xs text-muted-foreground text-right">
              {analysisProgress}% complete
            </div>
          </div>
        )}

        {/* Error Display */}
        {analysisErrors.length > 0 && (
          <div className="space-y-2">
            {analysisErrors.map((error, index) => (
              <Alert key={index} variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Info Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Advanced analysis provides deeper insights by analyzing your existing content and competitor strategies. This helps identify content gaps and opportunities for better topic generation.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}