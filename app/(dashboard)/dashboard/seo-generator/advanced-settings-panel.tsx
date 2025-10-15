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
import { Switch } from '@/components/ui/switch';
import {
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
  Globe,
  MessageCircle,
  Languages,
  BookOpen,
  Sparkles,
  Palette,
  Brain,
  Users,
  MapPin,
  Heart,
  Coffee,
  Smile,
  Building,
} from 'lucide-react';

interface AdvancedSettingsPanelProps {
  onCompetitorAnalysis?: (competitorUrl: string) => Promise<any>;
  onSettingsChange?: (settings: any) => void;
  isAnalyzing?: boolean;
  competitorAnalysisResult?: any;
  competitorUrl?: string;
  // New props to reflect form updates
  currentTone?: string;
  currentLanguagePreference?: string;
  currentFormalityLevel?: string;
  currentContentPurpose?: string;
  currentAdditionalContext?: string;
}

export function AdvancedSettingsPanel({
  onCompetitorAnalysis,
  onSettingsChange,
  isAnalyzing = false,
  competitorAnalysisResult,
  competitorUrl,
  currentTone,
  currentLanguagePreference,
  currentFormalityLevel,
  currentContentPurpose,
  currentAdditionalContext,
}: AdvancedSettingsPanelProps) {
  const [competitorUrlState, setCompetitorUrlState] = useState(competitorUrl || '');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState('');
  const [analysisErrors, setAnalysisErrors] = useState<string[]>([]);

  // Enhanced analysis settings aligned with form updates
  const [analysisSettings, setAnalysisSettings] = useState({
    // Content Personalization Analysis
    toneBasedAnalysis: true,
    culturalContextAnalysis: true,
    languageAdaptationAnalysis: true,

    // Advanced Competitor Intelligence
    toneMatchingAnalysis: true,
    contentGapAnalysis: true,
    culturalCompetitorAnalysis: false,

    // Market & Cultural Intelligence
    regionalLanguageAnalysis: false,
    formalityLevelAnalysis: true,
    contentPurposeAnalysis: true,

    // Technical SEO Analysis
    keywordDensityAnalysis: false,
    contentStructureAnalysis: false,
    backlinkAnalysis: false,
  });

  // Update competitor URL when prop changes
  useEffect(() => {
    if (competitorUrl) {
      setCompetitorUrlState(competitorUrl);
    }
  }, [competitorUrl]);

  
  const handleCompetitorAnalysis = async () => {
    if (!competitorUrlState || !onCompetitorAnalysis) return;

    setAnalysisErrors([]);
    setAnalysisProgress(0);
    setAnalysisStage('Analyzing competitor website...');

    try {
      // Enhanced analysis request with form settings
      const analysisRequest = {
        competitorUrl: competitorUrlState,
        analysisSettings,
        currentFormSettings: {
          tone: currentTone,
          languagePreference: currentLanguagePreference,
          formalityLevel: currentFormalityLevel,
          contentPurpose: currentContentPurpose,
          additionalContext: currentAdditionalContext,
        }
      };

      const result = await onCompetitorAnalysis(competitorUrlState);
      setAnalysisProgress(100);
      setAnalysisStage('Advanced competitor analysis completed!');

      if (onSettingsChange) {
        onSettingsChange({
          competitorAnalysis: result,
          analysisSettings,
        });
      }

    } catch (error) {
      setAnalysisProgress(0);
      setAnalysisStage('');
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze competitor';
      setAnalysisErrors([errorMessage]);
    }
  };

  const handleAnalysisToggle = (setting: string, enabled: boolean) => {
    const newSettings = { ...analysisSettings, [setting]: enabled };
    setAnalysisSettings(newSettings);

    if (onSettingsChange) {
      onSettingsChange({
        analysisSettings: newSettings,
        competitorAnalysis: competitorAnalysisResult,
      });
    }
  };

  // Helper functions to get icons and colors for different settings
  const getToneIcon = (tone?: string) => {
    const toneIcons: { [key: string]: any } = {
      professional: Building,
      casual: Coffee,
      friendly: Heart,
      authoritative: Target,
      conversational: MessageCircle,
      humorous: Smile,
      inspirational: Sparkles,
    };
    return toneIcons[tone || 'professional'] || Building;
  };

  const getLanguageIcon = (preference?: string) => {
    const languageIcons: { [key: string]: any } = {
      english: Globe,
      cultural_english: MessageCircle,
      native: Languages,
    };
    return languageIcons[preference || 'english'] || Globe;
  };

  const getCurrentSettingsDisplay = () => {
    const ToneIcon = getToneIcon(currentTone);
    const LanguageIcon = getLanguageIcon(currentLanguagePreference);

    return [
      {
        icon: ToneIcon,
        label: 'Tone',
        value: currentTone || 'professional',
        color: 'bg-blue-50 text-blue-700 border-blue-200'
      },
      {
        icon: LanguageIcon,
        label: 'Language',
        value: currentLanguagePreference === 'cultural_english' ? 'Cultural English' :
               currentLanguagePreference === 'native' ? 'Native Language' : 'Standard English',
        color: 'bg-green-50 text-green-700 border-green-200'
      },
      {
        icon: BookOpen,
        label: 'Purpose',
        value: currentContentPurpose || 'marketing',
        color: 'bg-purple-50 text-purple-700 border-purple-200'
      }
    ];
  };

  const getAnalysisSummary = () => {
    const summaries = [];

    if (competitorAnalysisResult) {
      summaries.push({
        type: 'competitor',
        title: 'Advanced Competitor Analysis',
        status: 'completed',
        details: `${competitorAnalysisResult.opportunities || 0} opportunities found, ${competitorAnalysisResult.contentGaps || 0} gaps identified`,
        features: [
          analysisSettings.toneMatchingAnalysis && 'Tone matching',
          analysisSettings.contentGapAnalysis && 'Content gap analysis',
          analysisSettings.culturalCompetitorAnalysis && 'Cultural adaptation'
        ].filter(Boolean).join(', ')
      });
    }

    return summaries;
  };

  const analysisSummaries = getAnalysisSummary();
  const currentSettingsDisplay = getCurrentSettingsDisplay();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Advanced SEO Analysis
        </CardTitle>
        <CardDescription>
          Enhance your topic generation with personalized competitor intelligence and cultural analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Settings Display */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Your Content Settings
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {currentSettingsDisplay.map((setting, index) => {
              const IconComponent = setting.icon;
              return (
                <div key={index} className={`p-3 rounded-lg border ${setting.color}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <IconComponent className="h-4 w-4" />
                    <span className="text-xs font-medium">{setting.label}</span>
                  </div>
                  <div className="text-sm font-semibold capitalize">
                    {setting.value}
                  </div>
                </div>
              );
            })}
          </div>
          {currentAdditionalContext && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="text-xs font-medium text-gray-600 mb-1">Additional Context</div>
              <div className="text-sm text-gray-800 italic">
                "{currentAdditionalContext}"
              </div>
            </div>
          )}
        </div>

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
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <div>
                      <div className="font-medium text-sm">{summary.title}</div>
                      <div className="text-xs text-green-700">{summary.details}</div>
                      {summary.features && (
                        <div className="text-xs text-green-600 mt-1">Features: {summary.features}</div>
                      )}
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

        {/* Content Personalization Analysis */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <Label className="font-medium">Content Personalization Analysis</Label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <Switch
                id="tone-based-analysis"
                checked={analysisSettings.toneBasedAnalysis}
                onCheckedChange={(checked) => handleAnalysisToggle('toneBasedAnalysis', checked)}
              />
              <div className="flex-1">
                <Label htmlFor="tone-based-analysis" className="text-sm font-medium">
                  Tone-Based Analysis
                </Label>
                <p className="text-xs text-muted-foreground">
                  Analyze competitor content matching your tone
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <Switch
                id="cultural-context-analysis"
                checked={analysisSettings.culturalContextAnalysis}
                onCheckedChange={(checked) => handleAnalysisToggle('culturalContextAnalysis', checked)}
              />
              <div className="flex-1">
                <Label htmlFor="cultural-context-analysis" className="text-sm font-medium">
                  Cultural Context
                </Label>
                <p className="text-xs text-muted-foreground">
                  Cultural adaptation and localization analysis
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <Switch
                id="language-adaptation-analysis"
                checked={analysisSettings.languageAdaptationAnalysis}
                onCheckedChange={(checked) => handleAnalysisToggle('languageAdaptationAnalysis', checked)}
              />
              <div className="flex-1">
                <Label htmlFor="language-adaptation-analysis" className="text-sm font-medium">
                  Language Adaptation
                </Label>
                <p className="text-xs text-muted-foreground">
                  Language preference based content analysis
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Competitor Intelligence */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-blue-600" />
            <Label className="font-medium">Advanced Competitor Intelligence</Label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <Switch
                id="tone-matching-analysis"
                checked={analysisSettings.toneMatchingAnalysis}
                onCheckedChange={(checked) => handleAnalysisToggle('toneMatchingAnalysis', checked)}
              />
              <div className="flex-1">
                <Label htmlFor="tone-matching-analysis" className="text-sm font-medium">
                  Tone Matching
                </Label>
                <p className="text-xs text-muted-foreground">
                  Find competitors with similar content tone
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <Switch
                id="content-gap-analysis"
                checked={analysisSettings.contentGapAnalysis}
                onCheckedChange={(checked) => handleAnalysisToggle('contentGapAnalysis', checked)}
              />
              <div className="flex-1">
                <Label htmlFor="content-gap-analysis" className="text-sm font-medium">
                  Content Gap Analysis
                </Label>
                <p className="text-xs text-muted-foreground">
                  Identify missing content opportunities
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <Switch
                id="cultural-competitor-analysis"
                checked={analysisSettings.culturalCompetitorAnalysis}
                onCheckedChange={(checked) => handleAnalysisToggle('culturalCompetitorAnalysis', checked)}
              />
              <div className="flex-1">
                <Label htmlFor="cultural-competitor-analysis" className="text-sm font-medium">
                  Cultural Intelligence
                </Label>
                <p className="text-xs text-muted-foreground">
                  Cultural competitor strategies analysis
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Market & Cultural Intelligence */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-green-600" />
            <Label className="font-medium">Market & Cultural Intelligence</Label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <Switch
                id="regional-language-analysis"
                checked={analysisSettings.regionalLanguageAnalysis}
                onCheckedChange={(checked) => handleAnalysisToggle('regionalLanguageAnalysis', checked)}
              />
              <div className="flex-1">
                <Label htmlFor="regional-language-analysis" className="text-sm font-medium">
                  Regional Language
                </Label>
                <p className="text-xs text-muted-foreground">
                  Regional language trends analysis
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <Switch
                id="formality-level-analysis"
                checked={analysisSettings.formalityLevelAnalysis}
                onCheckedChange={(checked) => handleAnalysisToggle('formalityLevelAnalysis', checked)}
              />
              <div className="flex-1">
                <Label htmlFor="formality-level-analysis" className="text-sm font-medium">
                  Formality Analysis
                </Label>
                <p className="text-xs text-muted-foreground">
                  Formality level in competitor content
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <Switch
                id="content-purpose-analysis"
                checked={analysisSettings.contentPurposeAnalysis}
                onCheckedChange={(checked) => handleAnalysisToggle('contentPurposeAnalysis', checked)}
              />
              <div className="flex-1">
                <Label htmlFor="content-purpose-analysis" className="text-sm font-medium">
                  Content Purpose
                </Label>
                <p className="text-xs text-muted-foreground">
                  Purpose-based competitor analysis
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Competitor Analysis Section */}
        <div className="space-y-3 border-t pt-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <Label className="font-medium">Competitor URL Analysis</Label>
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
                Run Advanced Analysis
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

        {/* Enhanced Info Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Advanced analysis now incorporates your content settings (tone, language, cultural preferences) to provide personalized competitor intelligence and content gap analysis tailored to your specific requirements.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}