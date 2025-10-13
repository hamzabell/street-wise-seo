'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import {
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle,
  Copy,
  Wand2,
  Settings,
  Globe,
  Target,
  Smartphone,
  BarChart3,
  Link,
  Lightbulb,
  CheckCircle2
} from 'lucide-react';
import { ContentBrief } from '@/lib/seo/content-brief-generator';
import { cn } from '@/lib/utils';

interface ContentBriefGeneratorProps {
  trigger?: React.ReactNode;
  initialTopic?: string;
  businessType?: string;
  targetAudience?: string;
  location?: string;
  onBriefGenerated?: (brief: ContentBrief) => void;
}

interface GenerationState {
  isGenerating: boolean;
  progress: number;
  stage: string;
  error: string | null;
  completed: boolean;
  brief?: ContentBrief;
}

export function ContentBriefGenerator({
  trigger,
  initialTopic = '',
  businessType = '',
  targetAudience = '',
  location = '',
  onBriefGenerated
}: ContentBriefGeneratorProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [topic, setTopic] = useState(initialTopic);
  const [industry, setIndustry] = useState(businessType);
  const [audience, setAudience] = useState(targetAudience);
  const [locationState, setLocationState] = useState(location);
  const [useAdvancedSettings, setUseAdvancedSettings] = useState(false);

  const [generation, setGeneration] = useState<GenerationState>({
    isGenerating: false,
    progress: 0,
    stage: '',
    error: null,
    completed: false
  });

  const generateBrief = async () => {
    if (!topic.trim()) {
      setGeneration(prev => ({
        ...prev,
        error: 'Please enter a topic to generate a content brief.'
      }));
      return;
    }

    setGeneration({
      isGenerating: true,
      progress: 0,
      stage: 'Initializing AI-powered content brief generation...',
      error: null,
      completed: false
    });

    try {
      // Simulate progress updates
      const progressStages = [
        { progress: 10, stage: 'Analyzing topic and context...' },
        { progress: 25, stage: 'Researching content structure...' },
        { progress: 40, stage: 'Generating SEO-optimized outline...' },
        { progress: 55, stage: 'Creating mobile optimization plan...' },
        { progress: 70, stage: 'Developing internal linking strategy...' },
        { progress: 85, stage: 'Finalizing content recommendations...' },
        { progress: 95, stage: 'Validating content brief quality...' },
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

      // Call the API to generate the structured brief
      const response = await fetch('/api/seo/brief', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic.trim(),
          industry: industry.trim() || undefined,
          targetAudience: audience.trim() || undefined,
          location: locationState.trim() || undefined,
          businessType: industry.trim() || undefined,
        }),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();

        // Handle authentication errors specifically
        if (response.status === 401) {
          throw new Error('You must be logged in to generate content briefs. Please sign in and try again.');
        }

        // Handle server errors specifically
        if (response.status === 500) {
          throw new Error('A server error occurred while generating the content brief. Please try again in a few moments.');
        }

        throw new Error(errorData.error || 'Failed to generate content brief');
      }

      const result = await response.json();

      setGeneration({
        isGenerating: false,
        progress: 100,
        stage: 'Content brief generated successfully!',
        error: null,
        completed: true,
        brief: result.brief
      });

      // Call the callback if provided
      if (onBriefGenerated && result.brief) {
        onBriefGenerated(result.brief);
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
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const resetAndClose = () => {
    setGeneration({
      isGenerating: false,
      progress: 0,
      stage: '',
      error: null,
      completed: false
    });
    setIsOpen(false);
  };

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

  const defaultTrigger = (
    <Button>
      <Wand2 className="mr-2 h-4 w-4" />
      Generate Content Brief
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            AI Content Brief Generator
          </DialogTitle>
          <DialogDescription>
            Generate comprehensive, actionable content briefs optimized for SEO and mobile devices.
          </DialogDescription>
        </DialogHeader>

        {!generation.completed ? (
          <div className="grid gap-6 py-4">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic *</Label>
                  <Textarea
                    id="topic"
                    placeholder="Enter your topic (e.g., 'How to Create Effective Content Marketing Strategies for Small Businesses')"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    disabled={generation.isGenerating}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="industry">Business Type</Label>
                    <Input
                      id="industry"
                      placeholder="e.g., Plumbing, Marketing, Consulting"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      disabled={generation.isGenerating}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="audience">Target Audience</Label>
                    <Input
                      id="audience"
                      placeholder="e.g., Small Business Owners"
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                      disabled={generation.isGenerating}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location (Optional)</Label>
                    <Input
                      id="location"
                      placeholder="e.g., New York, USA"
                      value={locationState}
                      onChange={(e) => setLocationState(e.target.value)}
                      disabled={generation.isGenerating}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4">
                <Alert>
                  <Settings className="h-4 w-4" />
                  <AlertDescription>
                    Advanced settings allow you to customize the content brief generation with more specific parameters.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Content Focus</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Label>Content Angle</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select content angle" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="educational">Educational/How-to</SelectItem>
                            <SelectItem value="promotional">Promotional/Sales</SelectItem>
                            <SelectItem value="informational">Informational/News</SelectItem>
                            <SelectItem value="entertainment">Entertainment/Engagement</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">SEO Preferences</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Label>Target Word Count</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select word count range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="short">Short (800-1,200 words)</SelectItem>
                            <SelectItem value="medium">Medium (1,200-2,000 words)</SelectItem>
                            <SelectItem value="long">Long (2,000-3,000 words)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

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
                <AlertDescription>
                  {generation.error}
                  {generation.error.includes('must be logged in') && (
                    <div className="mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Redirect to login page
                          router.push('/login');
                        }}
                      >
                        Sign In
                      </Button>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">AI Content Brief Generated Successfully!</span>
            </div>

            {generation.brief && (
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
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {generation.brief.seoChecklist.titleSuggestion}
                      </CardTitle>
                      <CardDescription>
                        {generation.brief.outline.introduction}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <h4 className="font-medium mb-2">Word Count</h4>
                            <p className="text-2xl font-bold text-blue-600 capitalize">
                              {generation.brief.wordCountRecommendation}
                            </p>
                            <p className="text-sm text-gray-500">complexity</p>
                          </div>
                          <div className="text-center">
                            <h4 className="font-medium mb-2">Readability</h4>
                            <p className="text-2xl font-bold text-green-600">
                              {generation.brief.mobileOptimization.readabilityScore}/100
                            </p>
                            <p className="text-sm text-gray-500">mobile score</p>
                          </div>
                          <div className="text-center">
                            <h4 className="font-medium mb-2">Voice Search</h4>
                            <div className="flex justify-center">
                              {generation.brief.mobileOptimization.voiceSearchReady ? (
                                <CheckCircle2 className="h-8 w-8 text-green-600" />
                              ) : (
                                <AlertCircle className="h-8 w-8 text-orange-600" />
                              )}
                            </div>
                            <p className="text-sm text-gray-500">
                              {generation.brief.mobileOptimization.voiceSearchReady ? 'Ready' : 'Needs Work'}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Meta Description</h4>
                          <div className="bg-gray-50 p-3 rounded-lg text-sm">
                            {generation.brief.seoChecklist.metaDescription}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {generation.brief.seoChecklist.metaDescription.length}/160 characters
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Call to Action</h4>
                          <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
                            {generation.brief.seoChecklist.callToAction}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="outline" className="space-y-4">
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
                            {generation.brief.outline.introduction}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Key Points
                          </h4>
                          <div className="space-y-2">
                            {getKeyPointsArray(generation.brief.outline.keyPoints).map((point, index) => (
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
                            {generation.brief.outline.conclusion}
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const keyPointsArray = getKeyPointsArray(generation.brief!.outline.keyPoints);
                            const outline = `Introduction:\n${generation.brief!.outline.introduction}\n\nKey Points:\n${keyPointsArray.map((p, i) => `${i + 1}. ${p}`).join('\n')}\n\nConclusion:\n${generation.brief!.outline.conclusion}`;
                            copyToClipboard(outline);
                          }}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Outline
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="seo" className="space-y-4">
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
                            {generation.brief.seoChecklist.titleSuggestion}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {generation.brief.seoChecklist.titleSuggestion.length}/60 characters
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Internal Linking Opportunities</h4>
                          <div className="space-y-2">
                            {generation.brief.seoChecklist.internalLinking.map((link, index) => (
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
                            const seoChecklist = `Title: ${generation.brief!.seoChecklist.titleSuggestion}\nMeta Description: ${generation.brief!.seoChecklist.metaDescription}\n\nInternal Linking:\n${generation.brief!.seoChecklist.internalLinking.join('\n')}\n\nCall to Action: ${generation.brief!.seoChecklist.callToAction}`;
                            copyToClipboard(seoChecklist);
                          }}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy SEO Checklist
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="mobile" className="space-y-4">
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
                              {generation.brief.mobileOptimization.readabilityScore}
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{ width: `${generation.brief.mobileOptimization.readabilityScore}%` }}
                              />
                            </div>
                          </div>
                          <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium mb-2">Paragraph Count</h4>
                            <div className="text-3xl font-bold text-blue-600">
                              {generation.brief.mobileOptimization.paragraphsCount}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">estimated paragraphs</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Voice Search Optimization</h4>
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            {generation.brief.mobileOptimization.voiceSearchReady ? (
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
                </TabsContent>

                <TabsContent value="linking" className="space-y-4">
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
                            {generation.brief.seoChecklist.internalLinking.map((link, index) => (
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
                          onClick={() => copyToClipboard(generation.brief!.seoChecklist.internalLinking.join('\n'))}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Linking Strategy
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="actions" className="space-y-4">
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
                            <p><strong>Target Word Count:</strong> {generation.brief.wordCountRecommendation} ({generation.brief.wordCountRecommendation === 'short' ? '800-1,200' : generation.brief.wordCountRecommendation === 'medium' ? '1,200-2,000' : '2,000-3,000'} words)</p>
                            <p><strong>Readability Target:</strong> {generation.brief.mobileOptimization.readabilityScore}/100 score</p>
                            <p><strong>Paragraph Structure:</strong> {generation.brief.mobileOptimization.paragraphsCount} short paragraphs</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Button
                            variant="default"
                            className="w-full"
                            onClick={() => {
                              const keyPointsArray = getKeyPointsArray(generation.brief!.outline.keyPoints);
                              const fullBrief = `Content Brief: ${generation.brief!.topic}\n\nTitle: ${generation.brief!.seoChecklist.titleSuggestion}\nMeta Description: ${generation.brief!.seoChecklist.metaDescription}\n\nOutline:\n${generation.brief!.outline.introduction}\n\n${keyPointsArray.map((p, i) => `${i + 1}. ${p}`).join('\n\n')}\n\n${generation.brief!.outline.conclusion}\n\nSEO Checklist:\n${generation.brief!.seoChecklist.internalLinking.map(l => `- ${l}`).join('\n')}\n\nCall to Action: ${generation.brief!.seoChecklist.callToAction}`;
                              copyToClipboard(fullBrief);
                            }}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Complete Brief
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => {
                              const structuredJson = JSON.stringify(generation.brief, null, 2);
                              copyToClipboard(structuredJson);
                            }}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Copy as JSON
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>
        )}

        <div className="flex justify-between">
          <Button variant="outline" onClick={resetAndClose}>
            {generation.completed ? 'Close' : 'Cancel'}
          </Button>
          {!generation.completed && (
            <Button onClick={generateBrief} disabled={!topic.trim() || generation.isGenerating}>
              {generation.isGenerating && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Generate AI Brief
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}