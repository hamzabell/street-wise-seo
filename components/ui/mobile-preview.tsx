'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Smartphone,
  Eye,
  CheckCircle,
  AlertTriangle,
  Info,
  Loader2,
  RefreshCw,
  Copy,
  Download,
  MessageSquare,
  BookOpen,
  Zap
} from 'lucide-react';
import { MobileValidator, MobileValidation, MobilePreviewData } from '@/lib/seo/mobile-validator';

interface MobilePreviewProps {
  title: string;
  content: string;
  metaDescription?: string;
  targetKeywords?: string[];
  contentType?: 'blog' | 'landing' | 'product' | 'service' | 'general';
  isBriefContent?: boolean;
  suggestedHeadings?: string[];
  className?: string;
}

interface ValidationState {
  isLoading: boolean;
  validation: MobileValidation | null;
  mobilePreview: MobilePreviewData | null;
  error: string | null;
  lastValidated: string | null;
}

export function MobilePreview({
  title,
  content,
  metaDescription,
  targetKeywords = [],
  contentType = 'general',
  isBriefContent = false,
  suggestedHeadings = [],
  className = ''
}: MobilePreviewProps) {
  const [validationState, setValidationState] = useState<ValidationState>({
    isLoading: false,
    validation: null,
    mobilePreview: null,
    error: null,
    lastValidated: null
  });

  const [activeTab, setActiveTab] = useState('overview');

  // Auto-validate on mount and when content changes
  useEffect(() => {
    validateContent();
  }, [title, content, metaDescription]);

  const validateContent = async () => {
    setValidationState(prev => ({
      ...prev,
      isLoading: true,
      error: null
    }));

    try {
      const requestBody = isBriefContent
        ? {
            title,
            briefContent: content,
            suggestedHeadings,
            targetKeywords,
            metaDescription
          }
        : {
            title,
            content,
            metaDescription,
            targetKeywords,
            contentType
          };

      const response = await fetch('/api/seo/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to validate content');
      }

      const result = await response.json();

      setValidationState({
        isLoading: false,
        validation: result.validation,
        mobilePreview: result.mobilePreview,
        error: null,
        lastValidated: new Date().toISOString()
      });

    } catch (error) {
      setValidationState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Validation failed'
      }));
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getRecommendationIcon = (category: string) => {
    switch (category) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'important':
        return <Info className="h-4 w-4 text-yellow-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const downloadValidationReport = () => {
    if (!validationState.validation) return;

    const report = `
Mobile Content Validation Report
Generated: ${new Date().toLocaleString()}

CONTENT DETAILS
===============
Title: ${title}
${metaDescription ? `Meta Description: ${metaDescription}` : ''}
Content Type: ${contentType}
Word Count: ${content.split(/\s+/).filter(w => w.length > 0).length}

VALIDATION SCORES
================
Overall Score: ${validationState.validation.overallScore}/100
Readability Score: ${validationState.validation.readabilityScore}/100

MOBILE PREVIEW ANALYSIS
=======================
Title Length: ${validationState.validation.mobilePreview.titleLength}
Meta Description: ${validationState.validation.mobilePreview.metaDescription}
Content Structure: ${validationState.validation.mobilePreview.contentStructure}
Paragraph Count: ${validationState.validation.mobilePreview.paragraphCount}
Sentence Length: ${validationState.validation.mobilePreview.sentenceLength}
Image Optimization: ${validationState.validation.mobilePreview.imageOptimization ? 'Optimized' : 'Needs Improvement'}

VOICE SEARCH OPTIMIZATION
==========================
Question Format: ${validationState.validation.voiceSearchOptimization.questionFormat ? 'Yes' : 'No'}
Conversational Tone: ${validationState.validation.voiceSearchOptimization.conversationalTone ? 'Yes' : 'No'}
Quick Answers: ${validationState.validation.voiceSearchOptimization.quickAnswers ? 'Yes' : 'No'}
Natural Language: ${validationState.validation.voiceSearchOptimization.naturalLanguage ? 'Yes' : 'No'}

RECOMMENDATIONS
===============
${validationState.validation.recommendations.map((rec, index) => `
${index + 1}. ${rec.issue}
   Category: ${rec.category.toUpperCase()}
   Solution: ${rec.solution}
   Impact: ${rec.impact}
`).join('')}
    `.trim();

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mobile-validation-${title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (validationState.isLoading && !validationState.validation) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Mobile Optimization Preview
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Analyzing mobile optimization...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (validationState.error && !validationState.validation) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Mobile Optimization Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {validationState.error}
            </AlertDescription>
          </Alert>
          <Button onClick={validateContent} variant="outline" className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry Validation
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            <CardTitle>Mobile Optimization Preview</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {validationState.validation && (
              <Badge
                variant="secondary"
                className={`${getScoreBgColor(validationState.validation.overallScore)} ${getScoreColor(validationState.validation.overallScore)}`}
              >
                {validationState.validation.overallScore}/100
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={validateContent}
              disabled={validationState.isLoading}
            >
              {validationState.isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        <CardDescription>
          See how your content performs on mobile devices and get optimization recommendations
        </CardDescription>
      </CardHeader>

      {validationState.validation && (
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="readability" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Readability
              </TabsTrigger>
              <TabsTrigger value="voice" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Voice Search
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Tips
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {/* Score Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className={`text-2xl font-bold ${getScoreColor(validationState.validation.overallScore)}`}>
                    {validationState.validation.overallScore}
                  </div>
                  <div className="text-sm text-gray-600">Overall Score</div>
                  <Progress value={validationState.validation.overallScore} className="mt-2" />
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className={`text-2xl font-bold ${getScoreColor(validationState.validation.readabilityScore)}`}>
                    {validationState.validation.readabilityScore}
                  </div>
                  <div className="text-sm text-gray-600">Readability</div>
                  <Progress value={validationState.validation.readabilityScore} className="mt-2" />
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className={`text-2xl font-bold ${getScoreColor(
                    (validationState.validation.voiceSearchOptimization.questionFormat ? 25 : 0) +
                    (validationState.validation.voiceSearchOptimization.conversationalTone ? 25 : 0) +
                    (validationState.validation.voiceSearchOptimization.quickAnswers ? 30 : 0) +
                    (validationState.validation.voiceSearchOptimization.naturalLanguage ? 20 : 0)
                  )}`}>
                    {((validationState.validation.voiceSearchOptimization.questionFormat ? 25 : 0) +
                      (validationState.validation.voiceSearchOptimization.conversationalTone ? 25 : 0) +
                      (validationState.validation.voiceSearchOptimization.quickAnswers ? 30 : 0) +
                      (validationState.validation.voiceSearchOptimization.naturalLanguage ? 20 : 0))}
                  </div>
                  <div className="text-sm text-gray-600">Voice Search</div>
                  <Progress
                    value={(validationState.validation.voiceSearchOptimization.questionFormat ? 25 : 0) +
                           (validationState.validation.voiceSearchOptimization.conversationalTone ? 25 : 0) +
                           (validationState.validation.voiceSearchOptimization.quickAnswers ? 30 : 0) +
                           (validationState.validation.voiceSearchOptimization.naturalLanguage ? 20 : 0)}
                    className="mt-2"
                  />
                </div>
              </div>

              {/* Mobile Preview */}
              {validationState.mobilePreview && (
                <div className="space-y-2">
                  <h4 className="font-medium">Mobile Search Result Preview</h4>
                  <div className="border rounded-lg p-4 bg-white max-w-md mx-auto">
                    <div className="text-blue-700 text-sm mb-1">example.com › page</div>
                    <div className="text-lg font-medium text-gray-900 mb-1">
                      {validationState.mobilePreview.truncatedTitle}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {validationState.mobilePreview.truncatedDescription}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{validationState.mobilePreview.readingTime} min read</span>
                      <span>{validationState.mobilePreview.mobileViewport.estimatedLines} lines</span>
                      <span>{validationState.mobilePreview.mobileViewport.estimatedScrolls} scrolls</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    validationState.validation.mobilePreview.titleLength === 'good'
                      ? 'bg-green-500'
                      : 'bg-red-500'
                  }`} />
                  <span>Title: {validationState.validation.mobilePreview.titleLength}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    validationState.validation.mobilePreview.metaDescription === 'good'
                      ? 'bg-green-500'
                      : 'bg-red-500'
                  }`} />
                  <span>Meta: {validationState.validation.mobilePreview.metaDescription}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    validationState.validation.mobilePreview.contentStructure === 'good'
                      ? 'bg-green-500'
                      : 'bg-yellow-500'
                  }`} />
                  <span>Structure: {validationState.validation.mobilePreview.contentStructure}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    validationState.validation.voiceSearchOptimization.quickAnswers
                      ? 'bg-green-500'
                      : 'bg-yellow-500'
                  }`} />
                  <span>Voice Ready</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="readability" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Readability Analysis</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-sm">Paragraphs</span>
                      <span className="font-medium">{validationState.validation.mobilePreview.paragraphCount}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-sm">Sentence Length</span>
                      <Badge variant={validationState.validation.mobilePreview.sentenceLength === 'good' ? 'default' : 'destructive'}>
                        {validationState.validation.mobilePreview.sentenceLength}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-sm">Content Structure</span>
                      <Badge variant={validationState.validation.mobilePreview.contentStructure === 'good' ? 'default' : 'secondary'}>
                        {validationState.validation.mobilePreview.contentStructure}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-sm">Image Optimization</span>
                      <Badge variant={validationState.validation.mobilePreview.imageOptimization ? 'default' : 'secondary'}>
                        {validationState.validation.mobilePreview.imageOptimization ? 'Optimized' : 'Needs Work'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {validationState.mobilePreview && (
                  <div>
                    <h4 className="font-medium mb-2">Mobile Reading Experience</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
                        <span className="text-sm">Estimated Reading Time</span>
                        <span className="font-medium">{validationState.mobilePreview.readingTime} minutes</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
                        <span className="text-sm">Characters per Line</span>
                        <span className="font-medium">{validationState.mobilePreview.mobileViewport.charactersPerLine}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
                        <span className="text-sm">Total Lines</span>
                        <span className="font-medium">{validationState.mobilePreview.mobileViewport.estimatedLines}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
                        <span className="text-sm">Scroll Actions Required</span>
                        <span className="font-medium">{validationState.mobilePreview.mobileViewport.estimatedScrolls}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="voice" className="space-y-4">
              <div className="space-y-4">
                <h4 className="font-medium">Voice Search Optimization</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">Question Format</span>
                      </div>
                      <Badge variant={validationState.validation.voiceSearchOptimization.questionFormat ? 'default' : 'secondary'}>
                        {validationState.validation.voiceSearchOptimization.questionFormat ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">Conversational Tone</span>
                      </div>
                      <Badge variant={validationState.validation.voiceSearchOptimization.conversationalTone ? 'default' : 'secondary'}>
                        {validationState.validation.voiceSearchOptimization.conversationalTone ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">Quick Answers</span>
                      </div>
                      <Badge variant={validationState.validation.voiceSearchOptimization.quickAnswers ? 'default' : 'secondary'}>
                        {validationState.validation.voiceSearchOptimization.quickAnswers ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">Natural Language</span>
                      </div>
                      <Badge variant={validationState.validation.voiceSearchOptimization.naturalLanguage ? 'default' : 'secondary'}>
                        {validationState.validation.voiceSearchOptimization.naturalLanguage ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <h5 className="font-medium mb-2">Voice Search Tips</h5>
                  <ul className="text-sm space-y-1 text-blue-800">
                    <li>• Include questions that match how people speak</li>
                    <li>• Use conversational language and address users directly</li>
                    <li>• Provide clear, concise answers in bullet points</li>
                    <li>• Focus on natural language and simple sentence structure</li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Optimization Recommendations</h4>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(
                        validationState.validation?.recommendations
                          ?.map(r => `${r.issue}: ${r.solution}`)
                          .join('\n') || 'No recommendations available'
                      )}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadValidationReport}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Report
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {validationState.validation.recommendations.map((recommendation, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        {getRecommendationIcon(recommendation.category)}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <h5 className="font-medium">{recommendation.issue}</h5>
                            <Badge variant={
                              recommendation.category === 'critical' ? 'destructive' :
                              recommendation.category === 'important' ? 'default' : 'secondary'
                            }>
                              {recommendation.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{recommendation.solution}</p>
                          <p className="text-xs text-gray-500">
                            <strong>Impact:</strong> {recommendation.impact}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {validationState.validation.recommendations.length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                    <h5 className="font-medium text-green-700">Excellent Mobile Optimization!</h5>
                    <p className="text-sm text-gray-600 mt-1">
                      Your content is well-optimized for mobile users and voice search.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {validationState.lastValidated && (
            <div className="mt-4 pt-4 border-t text-xs text-gray-500 text-center">
              Last validated: {new Date(validationState.lastValidated).toLocaleString()}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}