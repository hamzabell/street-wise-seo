'use client';

import { useState } from 'react';
import { useSWRConfig } from 'swr';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle,
  Copy,
  Download,
  Target,
  Link,
  Lightbulb,
  Hash,
  Smartphone,
  Globe,
  CheckCircle2,
  BarChart3,
  ExternalLink
} from 'lucide-react';
import { MobilePreview } from '@/components/ui/mobile-preview';
import { type ContentBrief } from '@/lib/seo/content-brief-generator';

interface ContentBriefProps {
  savedTopicId: number;
  topic: string;
  websiteAnalysisId?: number;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface BriefData {
  id: number;
  title: string;
  briefContent: string;
  suggestedHeadings: string[];
  targetKeywords: string[];
  wordCountEstimate: number;
  internalLinkingSuggestions: string[];
  contentRecommendations: string;
  generatedAt: string;
  savedTopicId: number;
}

interface GenerationState {
  isGenerating: boolean;
  progress: number;
  stage: string;
  error: string | null;
  completed: boolean;
  briefData?: BriefData;
  structuredBrief?: ContentBrief;
  briefType?: 'legacy' | 'structured';
}

export function ContentBrief({
  savedTopicId,
  topic,
  websiteAnalysisId,
  trigger,
  open,
  onOpenChange
}: ContentBriefProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = open !== undefined ? open : internalIsOpen;
  const setIsOpen = onOpenChange || setInternalIsOpen;
  const [enhanceWithWebsiteData, setEnhanceWithWebsiteData] = useState(false);
  const [generation, setGeneration] = useState<GenerationState>({
    isGenerating: false,
    progress: 0,
    stage: '',
    error: null,
    completed: false
  });

  const { mutate } = useSWRConfig();
  const router = useRouter();

  const getKeyPointsArray = (keyPoints: any): string[] => {
    if (Array.isArray(keyPoints)) {
      return keyPoints;
    }
    if (typeof keyPoints === 'string') {
      try {
        return JSON.parse(keyPoints);
      } catch {
        return [];
      }
    }
    return [];
  };

  const generateBrief = async () => {
    setGeneration({
      isGenerating: true,
      progress: 0,
      stage: 'Initializing content brief generation...',
      error: null,
      completed: false
    });

    try {
      // Simulate progress updates
      const progressStages = [
        { progress: 10, stage: 'Analyzing topic and keywords...' },
        { progress: 25, stage: 'Researching content structure...' },
        { progress: 40, stage: 'Generating suggested headings...' },
        { progress: 55, stage: 'Extracting target keywords...' },
        { progress: 70, stage: 'Creating internal linking suggestions...' },
        { progress: 85, stage: 'Writing content recommendations...' },
        { progress: 95, stage: 'Finalizing content brief...' },
        { progress: 100, stage: 'Content brief generated successfully!' }
      ];

      let currentStageIndex = 0;
      const progressInterval = setInterval(() => {
        if (currentStageIndex < progressStages.length) {
          const stage = progressStages[currentStageIndex];
          setGeneration(prev => ({
            ...prev,
            progress: stage.progress,
            stage: stage.stage
          }));
          currentStageIndex++;
        } else {
          clearInterval(progressInterval);
        }
      }, 600);

      // Call the API to generate the brief
      const response = await fetch('/api/seo/brief', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          savedTopicId,
          websiteAnalysisId: enhanceWithWebsiteData ? websiteAnalysisId : undefined,
          enhanceWithWebsiteData,
        }),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate content brief');
      }

      const result = await response.json();

      setGeneration({
        isGenerating: false,
        progress: 100,
        stage: 'Content brief generated successfully!',
        error: null,
        completed: true,
        briefData: result.type === 'legacy' ? result.brief : undefined,
        structuredBrief: result.type === 'structured' ? result.brief : undefined,
        briefType: result.type
      });

      // Navigate to the new content brief page if we have a saved brief
      if (result.type === 'legacy' && result.brief?.id) {
        setTimeout(() => {
          router.push(`/dashboard/content-brief/${result.brief.id}`);
          setIsOpen(false);
        }, 1500); // Give user time to see success message
      }

    } catch (error) {
      setGeneration({
        isGenerating: false,
        progress: 0,
        stage: '',
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        completed: false
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const downloadAsText = () => {
    if (!generation.briefData) return;

    const content = `Content Brief: ${generation.briefData.title}

${generation.briefData.briefContent}

Suggested Headings:
${generation.briefData.suggestedHeadings.map((h, i) => `${i + 1}. ${h}`).join('\n')}

Target Keywords:
${generation.briefData.targetKeywords.join(', ')}

Word Count Estimate: ${generation.briefData.wordCountEstimate} words

Internal Linking Suggestions:
${generation.briefData.internalLinkingSuggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Content Recommendations:
${generation.briefData.contentRecommendations}

Generated on: ${new Date(generation.briefData.generatedAt).toLocaleString()}
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generation.briefData.title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-').toLowerCase()}-brief.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetAndClose = () => {
    setGeneration({
      isGenerating: false,
      progress: 0,
      stage: '',
      error: null,
      completed: false
    });
    setEnhanceWithWebsiteData(false);
    setIsOpen(false);
  };

  const defaultTrigger = (
    <Button variant="outline">
      <FileText className="mr-2 h-4 w-4" />
      Generate Brief
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      )}
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Content Brief</DialogTitle>
          <DialogDescription>
            Create a comprehensive content brief for "{topic}" to guide your content creation process.
          </DialogDescription>
        </DialogHeader>

        {!generation.completed ? (
          <div className="grid gap-4 py-4">
            <div className="text-sm text-gray-600">
              <strong>Topic:</strong> {topic}
            </div>

            {websiteAnalysisId && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enhance-data"
                  checked={enhanceWithWebsiteData}
                  onCheckedChange={(checked) => setEnhanceWithWebsiteData(checked as boolean)}
                  disabled={generation.isGenerating}
                />
                <Label htmlFor="enhance-data" className="text-sm">
                  Enhance with website analysis data (provides better internal linking suggestions)
                </Label>
              </div>
            )}

            {generation.isGenerating && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm font-medium">{generation.stage}</span>
                </div>
                <Progress value={generation.progress} className="w-full" />
                <div className="text-xs text-gray-500 text-right">
                  {generation.progress}% complete
                </div>
              </div>
            )}

            {generation.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{generation.error}</AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Content Brief Generated Successfully!</span>
              {generation.briefType && (
                <span className="text-xs text-gray-500 ml-2">
                  ({generation.briefType === 'structured' ? 'New AI-Powered' : 'Legacy'} Format)
                </span>
              )}
            </div>

            {generation.briefType === 'legacy' && (
              <div className="flex items-center space-x-2 text-blue-600">
                <ExternalLink className="h-4 w-4" />
                <span className="text-sm">Redirecting to your content brief page...</span>
              </div>
            )}

            {(generation.briefData || generation.structuredBrief) && (
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="outline">Outline</TabsTrigger>
                  <TabsTrigger value="seo">SEO</TabsTrigger>
                  <TabsTrigger value="mobile">Mobile</TabsTrigger>
                  <TabsTrigger value="linking">Linking</TabsTrigger>
                  <TabsTrigger value="actions">Actions</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  {generation.structuredBrief ? (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          {generation.structuredBrief.seoChecklist.titleSuggestion}
                        </CardTitle>
                        <CardDescription>
                          {generation.structuredBrief.outline.introduction}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                              <h4 className="font-medium mb-2">Word Count</h4>
                              <p className="text-2xl font-bold text-blue-600 capitalize">
                                {generation.structuredBrief.wordCountRecommendation}
                              </p>
                              <p className="text-sm text-gray-500">complexity</p>
                            </div>
                            <div className="text-center">
                              <h4 className="font-medium mb-2">Readability</h4>
                              <p className="text-2xl font-bold text-green-600">
                                {generation.structuredBrief.mobileOptimization.readabilityScore}/100
                              </p>
                              <p className="text-sm text-gray-500">mobile score</p>
                            </div>
                            <div className="text-center">
                              <h4 className="font-medium mb-2">Voice Search</h4>
                              <div className="flex justify-center">
                                {generation.structuredBrief.mobileOptimization.voiceSearchReady ? (
                                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                                ) : (
                                  <AlertCircle className="h-8 w-8 text-orange-600" />
                                )}
                              </div>
                              <p className="text-sm text-gray-500">
                                {generation.structuredBrief.mobileOptimization.voiceSearchReady ? 'Ready' : 'Needs Work'}
                              </p>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium mb-2">Meta Description</h4>
                            <div className="bg-gray-50 p-3 rounded-lg text-sm">
                              {generation.structuredBrief.seoChecklist.metaDescription}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {generation.structuredBrief.seoChecklist.metaDescription.length}/160 characters
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium mb-2">Call to Action</h4>
                            <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
                              {generation.structuredBrief.seoChecklist.callToAction}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          {generation.briefData!.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Brief Content</h4>
                            <div className="bg-gray-50 p-4 rounded-lg text-sm">
                              <pre className="whitespace-pre-wrap font-sans">
                                {generation.briefData!.briefContent}
                              </pre>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2"
                              onClick={() => copyToClipboard(generation.briefData!.briefContent)}
                            >
                              <Copy className="mr-2 h-4 w-4" />
                              Copy Brief
                            </Button>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium mb-2">Word Count</h4>
                              <p className="text-2xl font-bold text-blue-600">
                                {generation.briefData!.wordCountEstimate.toLocaleString()}
                              </p>
                              <p className="text-sm text-gray-500">estimated words</p>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">Generated</h4>
                              <p className="text-sm">
                                {new Date(generation.briefData!.generatedAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="outline" className="space-y-4">
                  {generation.structuredBrief ? (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Content Outline
                        </CardTitle>
                        <CardDescription>
                          Structured outline with introduction, key points, and conclusion
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <Globe className="h-4 w-4" />
                              Introduction
                            </h4>
                            <div className="bg-blue-50 p-3 rounded-lg text-sm">
                              {generation.structuredBrief.outline.introduction}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <BarChart3 className="h-4 w-4" />
                              Key Points
                            </h4>
                            <div className="space-y-2">
                              {getKeyPointsArray(generation.structuredBrief.outline.keyPoints).map((point, index) => (
                                <div key={index} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
                                    {index + 1}
                                  </span>
                                  <span className="text-sm">{point}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4" />
                              Conclusion
                            </h4>
                            <div className="bg-green-50 p-3 rounded-lg text-sm">
                              {generation.structuredBrief.outline.conclusion}
                            </div>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const keyPointsArray = getKeyPointsArray(generation.structuredBrief!.outline.keyPoints);
                              const outline = `Introduction:\n${generation.structuredBrief!.outline.introduction}\n\nKey Points:\n${keyPointsArray.map((p, i) => `${i + 1}. ${p}`).join('\n')}\n\nConclusion:\n${generation.structuredBrief!.outline.conclusion}`;
                              copyToClipboard(outline);
                            }}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Outline
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Hash className="h-5 w-5" />
                          Suggested Headings Structure
                        </CardTitle>
                        <CardDescription>
                          Recommended heading hierarchy for your content
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {generation.briefData!.suggestedHeadings.map((heading, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                              <span className="text-sm font-medium text-gray-500">H{Math.min(index + 1, 6)}</span>
                              <span>{heading}</span>
                            </div>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-4"
                          onClick={() => copyToClipboard(generation.briefData!.suggestedHeadings.join('\n'))}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Headings
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="seo" className="space-y-4">
                  {generation.structuredBrief ? (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5" />
                          SEO Checklist & Optimization
                        </CardTitle>
                        <CardDescription>
                          Complete SEO optimization checklist for your content
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Title Suggestion</h4>
                            <div className="bg-green-50 p-3 rounded-lg text-sm font-medium text-green-800">
                              {generation.structuredBrief.seoChecklist.titleSuggestion}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {generation.structuredBrief.seoChecklist.titleSuggestion.length}/60 characters
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium mb-2">Internal Linking Opportunities</h4>
                            <div className="space-y-2">
                              {generation.structuredBrief.seoChecklist.internalLinking.map((link, index) => (
                                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                  <Link className="h-4 w-4 text-blue-600" />
                                  <span className="text-sm">{link}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const seoChecklist = `Title: ${generation.structuredBrief!.seoChecklist.titleSuggestion}\nMeta Description: ${generation.structuredBrief!.seoChecklist.metaDescription}\n\nInternal Linking:\n${generation.structuredBrief!.seoChecklist.internalLinking.join('\n')}\n\nCall to Action: ${generation.structuredBrief!.seoChecklist.callToAction}`;
                              copyToClipboard(seoChecklist);
                            }}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Copy SEO Checklist
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5" />
                          Target Keywords
                        </CardTitle>
                        <CardDescription>
                          Primary and secondary keywords to include in your content
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {generation.briefData!.targetKeywords.map((keyword, index) => (
                            <div key={index} className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm">
                              {keyword}
                            </div>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-4"
                          onClick={() => copyToClipboard(generation.briefData!.targetKeywords.join(', '))}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Keywords
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="linking" className="space-y-4">
                  {generation.structuredBrief ? (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Link className="h-5 w-5" />
                          Internal Linking Strategy
                        </CardTitle>
                        <CardDescription>
                          Strategic internal linking opportunities for SEO
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Linking Opportunities</h4>
                            <div className="space-y-2">
                              {generation.structuredBrief.seoChecklist.internalLinking.map((link, index) => (
                                <div key={index} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                                  <Link className="h-4 w-4 text-blue-600 mt-0.5" />
                                  <div>
                                    <div className="text-sm font-medium">{link}</div>
                                    <div className="text-xs text-gray-500">Strategic internal linking opportunity</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-medium mb-2 text-blue-800">Internal Linking Best Practices</h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                              <li>• Link to relevant, high-authority pages on your site</li>
                              <li>• Use descriptive anchor text that includes keywords</li>
                              <li>• Limit to 3-5 internal links per piece of content</li>
                              <li>• Ensure links add value to the reader</li>
                              <li>• Link to cornerstone content when relevant</li>
                            </ul>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(generation.structuredBrief!.seoChecklist.internalLinking.join('\n'))}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Linking Strategy
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Link className="h-5 w-5" />
                          Internal Linking Suggestions
                        </CardTitle>
                        <CardDescription>
                          Recommended internal links to include in your content
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {generation.briefData!.internalLinkingSuggestions.map((suggestion, index) => (
                            <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                              <span className="text-sm">•</span>
                              <span className="text-sm">{suggestion}</span>
                            </div>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-4"
                          onClick={() => copyToClipboard(generation.briefData!.internalLinkingSuggestions.join('\n'))}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Suggestions
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="mobile" className="space-y-4">
                  {generation.structuredBrief ? (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Smartphone className="h-5 w-5" />
                          Mobile Optimization Analysis
                        </CardTitle>
                        <CardDescription>
                          Mobile-first optimization recommendations and metrics
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                              <h4 className="font-medium mb-2">Readability Score</h4>
                              <div className="text-3xl font-bold text-green-600">
                                {generation.structuredBrief.mobileOptimization.readabilityScore}
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                <div
                                  className="bg-green-600 h-2 rounded-full"
                                  style={{ width: `${generation.structuredBrief.mobileOptimization.readabilityScore}%` }}
                                />
                              </div>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                              <h4 className="font-medium mb-2">Paragraph Count</h4>
                              <div className="text-3xl font-bold text-blue-600">
                                {generation.structuredBrief.mobileOptimization.paragraphsCount}
                              </div>
                              <p className="text-sm text-gray-500 mt-1">estimated paragraphs</p>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium mb-2">Voice Search Optimization</h4>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              {generation.structuredBrief.mobileOptimization.voiceSearchReady ? (
                                <>
                                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                                  <div>
                                    <div className="font-medium text-green-800">Voice Search Ready</div>
                                    <div className="text-sm text-gray-600">Your content is optimized for voice search queries</div>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="h-6 w-6 text-orange-600" />
                                  <div>
                                    <div className="font-medium text-orange-800">Voice Search Needs Improvement</div>
                                    <div className="text-sm text-gray-600">Consider adding more conversational language</div>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-medium mb-2 text-blue-800">Mobile Optimization Tips</h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                              <li>• Use short paragraphs (2-3 sentences max)</li>
                              <li>• Include bullet points for scannability</li>
                              <li>• Optimize images for mobile loading</li>
                              <li>• Use descriptive subheadings</li>
                              <li>• Ensure tap targets are at least 44px</li>
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <MobilePreview
                      title={generation.briefData!.title}
                      content={generation.briefData!.briefContent}
                      targetKeywords={generation.briefData!.targetKeywords}
                      contentType="blog"
                      isBriefContent={true}
                      suggestedHeadings={generation.briefData!.suggestedHeadings}
                      className="w-full"
                    />
                  )}
                </TabsContent>

                <TabsContent value="actions" className="space-y-4">
                  {generation.structuredBrief ? (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Lightbulb className="h-5 w-5" />
                          Action Plan & Next Steps
                        </CardTitle>
                        <CardDescription>
                          Clear action items to implement your content brief
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <h4 className="font-medium mb-2 text-blue-800">Immediate Actions</h4>
                              <ul className="text-sm text-blue-700 space-y-1">
                                <li>✅ Write the title using the SEO suggestion</li>
                                <li>✅ Craft the meta description (160 chars)</li>
                                <li>✅ Create content following the outline</li>
                                <li>✅ Include the 3 key points</li>
                              </ul>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg">
                              <h4 className="font-medium mb-2 text-green-800">Content Optimization</h4>
                              <ul className="text-sm text-green-700 space-y-1">
                                <li>📱 Optimize for mobile readability</li>
                                <li>🔊 Include voice search phrases</li>
                                <li>🔗 Add internal links strategically</li>
                                <li>📞 Implement the call-to-action</li>
                              </ul>
                            </div>
                          </div>

                          <div className="bg-yellow-50 p-4 rounded-lg">
                            <h4 className="font-medium mb-2 text-yellow-800">Content Goals</h4>
                            <div className="text-sm text-yellow-700 space-y-1">
                              <p><strong>Target Word Count:</strong> {generation.structuredBrief.wordCountRecommendation} ({generation.structuredBrief.wordCountRecommendation === 'short' ? '800-1,200' : generation.structuredBrief.wordCountRecommendation === 'medium' ? '1,200-2,000' : '2,000-3,000'} words)</p>
                              <p><strong>Readability Target:</strong> {generation.structuredBrief.mobileOptimization.readabilityScore}/100 score</p>
                              <p><strong>Paragraph Structure:</strong> {generation.structuredBrief.mobileOptimization.paragraphsCount} short paragraphs</p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Button
                              variant="default"
                              className="w-full"
                              onClick={() => {
                                const keyPointsArray = getKeyPointsArray(generation.structuredBrief!.outline.keyPoints);
                                const fullBrief = `Content Brief: ${generation.structuredBrief!.topic}\n\nTitle: ${generation.structuredBrief!.seoChecklist.titleSuggestion}\nMeta Description: ${generation.structuredBrief!.seoChecklist.metaDescription}\n\nOutline:\n${generation.structuredBrief!.outline.introduction}\n\n${keyPointsArray.map((p, i) => `${i + 1}. ${p}`).join('\n\n')}\n\n${generation.structuredBrief!.outline.conclusion}\n\nSEO Checklist:\n${generation.structuredBrief!.seoChecklist.internalLinking.map(l => `- ${l}`).join('\n')}\n\nCall to Action: ${generation.structuredBrief!.seoChecklist.callToAction}`;
                                copyToClipboard(fullBrief);
                              }}
                            >
                              <Copy className="mr-2 h-4 w-4" />
                              Copy Complete Brief
                            </Button>
                            {generation.briefType === 'structured' && (
                              <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => {
                                  const structuredJson = JSON.stringify(generation.structuredBrief, null, 2);
                                  copyToClipboard(structuredJson);
                                }}
                              >
                                <Download className="mr-2 h-4 w-4" />
                                Copy as JSON
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Lightbulb className="h-5 w-5" />
                          Content Recommendations
                        </CardTitle>
                        <CardDescription>
                          Strategic advice for creating high-quality content
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <pre className="whitespace-pre-wrap font-sans text-sm">
                            {generation.briefData!.contentRecommendations}
                          </pre>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-4"
                          onClick={() => copyToClipboard(generation.briefData!.contentRecommendations)}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Recommendations
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </div>
        )}

        <DialogFooter className="flex justify-between">
          <div>
            {generation.completed && (
              <Button variant="outline" onClick={downloadAsText}>
                <Download className="mr-2 h-4 w-4" />
                Download Brief
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={resetAndClose}>
              {generation.completed ? 'Close' : 'Cancel'}
            </Button>
            {!generation.completed && (
              <Button onClick={generateBrief}>
                {generation.isGenerating && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Generate Brief
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}