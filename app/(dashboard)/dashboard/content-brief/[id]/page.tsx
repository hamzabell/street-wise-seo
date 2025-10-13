'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ArrowLeft,
  FileText,
  Copy,
  Download,
  Target,
  Link,
  Smartphone,
  Globe,
  BarChart3,
  CheckCircle2,
  Lightbulb,
  Hash,
  Loader2,
  AlertCircle,
  Calendar,
  Clock,
  User
} from 'lucide-react';

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
  topic?: string;
}

interface MobileValidation {
  overallScore: number;
  readabilityScore: number;
  voiceSearchOptimization: {
    questionFormat: boolean;
    conversationalTone: boolean;
  };
  mobilePreview: {
    titleLength: string;
    contentStructure: string;
  };
  recommendations: Array<{
    category: string;
    issue: string;
    solution: string;
  }>;
}

interface MobilePreview {
  readingTime: number;
  mobileViewport: {
    estimatedScrolls: number;
  };
}

export default function ContentBriefDetailPage() {
  const params = useParams();
  const router = useRouter();
  const briefId = params.id as string;

  const [brief, setBrief] = useState<BriefData | null>(null);
  const [mobileValidation, setMobileValidation] = useState<MobileValidation | null>(null);
  const [mobilePreview, setMobilePreview] = useState<MobilePreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  useEffect(() => {
    if (briefId) {
      fetchBrief();
    }
  }, [briefId]);

  const fetchBrief = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/seo/brief/${briefId}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError('Content brief not found');
        } else {
          setError('Failed to load content brief');
        }
        return;
      }

      const data = await response.json();
      setBrief(data.brief);
      setMobileValidation(data.mobileValidation);
      setMobilePreview(data.mobilePreview);
    } catch (error) {
      console.error('Error fetching brief:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const downloadAsText = () => {
    if (!brief) return;

    const content = `Content Brief: ${brief.title}

${brief.briefContent}

Suggested Headings:
${brief.suggestedHeadings.map((h, i) => `${i + 1}. ${h}`).join('\n')}

Target Keywords:
${brief.targetKeywords.join(', ')}

Word Count Estimate: ${brief.wordCountEstimate} words

Internal Linking Suggestions:
${brief.internalLinkingSuggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Content Recommendations:
${brief.contentRecommendations}

Generated on: ${new Date(brief.generatedAt).toLocaleString()}
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${brief.title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-').toLowerCase()}-brief.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-lg">Loading content brief...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !brief) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || 'Content brief not found'}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <div className="flex items-center space-x-2">
              <FileText className="h-6 w-6 text-blue-600" />
              <h1 className="text-3xl font-bold">{brief.title}</h1>
            </div>
            <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(brief.generatedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{new Date(brief.generatedAt).toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Hash className="h-4 w-4" />
                <span>ID: {brief.id}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => copyToClipboard(brief.briefContent, 'full-brief')}
          >
            <Copy className="mr-2 h-4 w-4" />
            {copiedSection === 'full-brief' ? 'Copied!' : 'Copy'}
          </Button>
          <Button onClick={downloadAsText}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{brief.wordCountEstimate.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Word Count</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{brief.suggestedHeadings.length}</div>
            <div className="text-sm text-muted-foreground">Headings</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{brief.targetKeywords.length}</div>
            <div className="text-sm text-muted-foreground">Keywords</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {mobileValidation ? Math.round(mobileValidation.overallScore) : 'N/A'}
            </div>
            <div className="text-sm text-muted-foreground">Mobile Score</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="brief" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="brief">Brief</TabsTrigger>
          <TabsTrigger value="structure">Structure</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="mobile">Mobile</TabsTrigger>
          <TabsTrigger value="links">Links</TabsTrigger>
        </TabsList>

        <TabsContent value="brief" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Content Brief
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(brief.briefContent, 'brief-content')}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  {copiedSection === 'brief-content' ? 'Copied!' : 'Copy'}
                </Button>
              </CardTitle>
              <CardDescription>
                Comprehensive content brief with structured outline and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none markdown-content">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({children}) => <h1 className="text-2xl font-bold mb-4 text-gray-900">{children}</h1>,
                    h2: ({children}) => <h2 className="text-xl font-bold mb-3 text-gray-800">{children}</h2>,
                    h3: ({children}) => <h3 className="text-lg font-semibold mb-2 text-gray-800">{children}</h3>,
                    p: ({children}) => <p className="mb-4 text-gray-700 leading-relaxed">{children}</p>,
                    ul: ({children}) => <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>,
                    ol: ({children}) => <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>,
                    li: ({children}) => <li className="text-gray-700">{children}</li>,
                    blockquote: ({children}) => (
                      <blockquote className="border-l-4 border-blue-500 pl-4 italic my-4 bg-blue-50 py-2">
                        {children}
                      </blockquote>
                    ),
                    code: ({className, children, ...props}) => {
                      const match = /language-(\w+)/.exec(className || '');
                      const isInline = !match && !className;

                      if (isInline) {
                        return (
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono" {...props}>
                            {children}
                          </code>
                        );
                      }
                      return (
                        <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
                          <code className="text-sm font-mono" {...props}>
                            {children}
                          </code>
                        </pre>
                      );
                    },
                    strong: ({children}) => <strong className="font-semibold text-gray-900">{children}</strong>,
                    em: ({children}) => <em className="italic">{children}</em>,
                  }}
                >
                  {brief.briefContent}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="structure" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Content Structure
              </CardTitle>
              <CardDescription>
                Suggested headings and content organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-3">Suggested Headings</h4>
                  <div className="space-y-2">
                    {brief.suggestedHeadings.map((heading, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          H{Math.min(index + 1, 6)}
                        </span>
                        <span className="font-medium">{heading}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => copyToClipboard(brief.suggestedHeadings.join('\n'), 'headings')}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    {copiedSection === 'headings' ? 'Copied!' : 'Copy Headings'}
                  </Button>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-3">Content Recommendations</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="prose">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                      >
                        {brief.contentRecommendations}
                      </ReactMarkdown>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => copyToClipboard(brief.contentRecommendations, 'recommendations')}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      {copiedSection === 'recommendations' ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                SEO Optimization
              </CardTitle>
              <CardDescription>
                Keywords and SEO elements for better rankings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">Target Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {brief.targetKeywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => copyToClipboard(brief.targetKeywords.join(', '), 'keywords')}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    {copiedSection === 'keywords' ? 'Copied!' : 'Copy Keywords'}
                  </Button>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-3">SEO Meta Tags</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Title Tag</label>
                      <div className="bg-green-50 p-3 rounded-lg mt-1">
                        <p className="text-sm font-medium text-green-800">{brief.title}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {brief.title.length}/60 characters (recommended: 50-60)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mobile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Mobile Optimization
              </CardTitle>
              <CardDescription>
                Mobile-friendly analysis and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {mobileValidation ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-2">Overall Score</h4>
                      <div className="text-3xl font-bold text-green-600">
                        {Math.round(mobileValidation.overallScore)}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${mobileValidation.overallScore}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-2">Readability Score</h4>
                      <div className="text-3xl font-bold text-blue-600">
                        {mobileValidation.readabilityScore}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${mobileValidation.readabilityScore}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Voice Search Optimization</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        {mobileValidation.voiceSearchOptimization.questionFormat ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-orange-600" />
                        )}
                        <span className="text-sm">Question format included</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        {mobileValidation.voiceSearchOptimization.conversationalTone ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-orange-600" />
                        )}
                        <span className="text-sm">Conversational tone</span>
                      </div>
                    </div>
                  </div>

                  {mobilePreview && (
                    <div>
                      <h4 className="font-medium mb-3">Mobile Reading Experience</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-medium mb-2">Reading Time</h4>
                          <div className="text-2xl font-bold text-purple-600">
                            {mobilePreview.readingTime} min
                          </div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-medium mb-2">Scroll Actions</h4>
                          <div className="text-2xl font-bold text-orange-600">
                            {mobilePreview.mobileViewport.estimatedScrolls}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {mobileValidation.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Optimization Recommendations</h4>
                      <div className="space-y-2">
                        {mobileValidation.recommendations
                          .filter(rec => rec.category === 'critical' || rec.category === 'important')
                          .slice(0, 5)
                          .map((rec, index) => (
                            <div key={index} className="p-3 bg-yellow-50 rounded-lg">
                              <div className="font-medium text-sm text-yellow-800 mb-1">
                                {rec.issue}
                              </div>
                              <div className="text-sm text-yellow-700">
                                {rec.solution}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Mobile optimization data not available for this brief
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="links" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5" />
                Internal Linking Strategy
              </CardTitle>
              <CardDescription>
                Strategic internal linking opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-3">Linking Suggestions</h4>
                  <div className="space-y-2">
                    {brief.internalLinkingSuggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <Link className="h-4 w-4 text-blue-600 mt-0.5" />
                        <span className="text-sm">{suggestion}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => copyToClipboard(brief.internalLinkingSuggestions.join('\n'), 'links')}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    {copiedSection === 'links' ? 'Copied!' : 'Copy Links'}
                  </Button>
                </div>

                <Separator />

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
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}