'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  TrendingUp,
  Users,
  Search,
  ExternalLink,
  Copy,
  Check,
  PenTool,
  Target,
  Lightbulb,
  BarChart3,
  Clock,
  Globe,
  Zap,
  Star,
  Loader2,
  Trash2,
  Edit
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatSearchVolume, getDifficultyColor, getCompetitionColor } from '@/lib/seo/utils';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { cleanMarkdown } from '@/lib/seo/markdown-parser';

interface SavedTopic {
  id: number;
  topic: string;
  description?: string;
  tags?: string;
  difficulty?: string;
  searchVolume?: number;
  competitionLevel?: string;
  tone?: string;
  businessType?: string;
  targetAudience?: string;
  location?: string;
  additionalContext?: string;
  websiteUrl?: string;
  savedAt: string;
  suggestedTags: string[];
}

interface DetailedInfo {
  contentBrief?: string;
  contentAngle?: string;
  estimatedTimeToWrite?: string;
  competitorAnalysis?: string;
  keywordInsights?: string[];
  relatedTopics?: string[];
}

export default function TopicDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = params.id as string;

  const [topic, setTopic] = useState<SavedTopic | null>(null);
  const [detailedInfo, setDetailedInfo] = useState<DetailedInfo>({
    keywordInsights: [],
    relatedTopics: []
  });
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Fetch topic details
  useEffect(() => {
    if (topicId) {
      fetchTopicDetails();
    }
  }, [topicId]);

  // Fetch detailed information when topic is loaded
  useEffect(() => {
    if (topic && topic.businessType && topic.targetAudience) {
      fetchDetailedTopicInfo();
    }
  }, [topic]);

  const fetchTopicDetails = async () => {
    try {
      const response = await fetch(`/api/seo/saved-topics/${topicId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTopic(data.data);
        }
      } else if (response.status === 404) {
        router.push('/dashboard/saved-topics');
      }
    } catch (error) {
      console.error('Failed to fetch topic details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetailedTopicInfo = async () => {
    if (!topic || !topic.businessType || !topic.targetAudience) return;

    setLoadingDetails(true);
    try {
      const response = await fetch('/api/seo/topic-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: cleanMarkdown(topic.topic),
          businessType: topic.businessType,
          targetAudience: topic.targetAudience,
          location: topic.location,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setDetailedInfo(data.data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch detailed topic info:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCopyTopic = async () => {
    if (!topic) return;

    try {
      const fullContent = formatTopicForCopy(topic);
      await navigator.clipboard.writeText(fullContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy topic:', error);
    }
  };

  const handleDelete = async () => {
    if (!topic) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/seo/saved-topics/${topic.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/dashboard/saved-topics');
      }
    } catch (error) {
      console.error('Error deleting topic:', error);
    } finally {
      setDeleting(false);
    }
  };

  const getSEOScore = () => {
    if (!topic) return 0;

    let score = 100;

    if (topic.difficulty === 'easy') score += 10;
    else if (topic.difficulty === 'medium') score += 5;

    if (topic.competitionLevel === 'low') score += 15;
    else if (topic.competitionLevel === 'medium') score += 8;

    if (topic.searchVolume && topic.searchVolume > 5000) score += 15;
    else if (topic.searchVolume && topic.searchVolume > 1000) score += 10;
    else if (topic.searchVolume && topic.searchVolume > 100) score += 5;

    return Math.min(100, Math.max(0, score));
  };

  if (loading) {
    return (
      <section className="flex-1 p-4 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading topic details...</span>
          </div>
        </div>
      </section>
    );
  }

  if (!topic) {
    return (
      <section className="flex-1 p-4 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Topic Not Found</h3>
                <p className="text-gray-600 mb-4">The topic you're looking for doesn't exist or has been deleted.</p>
                <Button asChild>
                  <Link href="/dashboard/saved-topics">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Saved Topics
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  const seoScore = getSEOScore();
  const scoreColor = seoScore >= 80 ? 'text-green-600' : seoScore >= 60 ? 'text-yellow-600' : 'text-red-600';

  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/saved-topics">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Saved Topics
              </Link>
            </Button>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">
                {cleanMarkdown(topic.topic)}
              </h1>
              {topic.description && (
                <p className="text-lg text-muted-foreground">
                  {topic.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className={cn('text-3xl font-bold', scoreColor)}>
                  {seoScore}/100
                </div>
                <div className="text-sm text-muted-foreground">SEO Score</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild className="w-full sm:w-auto">
                  <Link href={`/dashboard/content-generator?topicId=${topic.id}`}>
                    <PenTool className="mr-2 h-4 w-4" />
                    Generate Content
                  </Link>
                </Button>

                <Button variant="outline" onClick={handleCopyTopic} className="w-full sm:w-auto">
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Details
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    const query = encodeURIComponent(cleanMarkdown(topic.topic));
                    window.open(`https://google.com/search?q=${query}`, '_blank');
                  }}
                  className="w-full sm:w-auto"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Search on Google
                </Button>

                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={deleting}
                  className="w-full sm:w-auto"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Topic
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="keywords">Keywords</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="text-2xl font-bold">{formatSearchVolume(topic.searchVolume || 0)}</div>
                  <div className="text-sm text-muted-foreground">Monthly Searches</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className={cn('px-3 py-2 rounded-lg text-sm font-medium w-full', getDifficultyColor(topic.difficulty as any))}>
                    {topic.difficulty?.toUpperCase() || 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">Difficulty</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className={cn('px-3 py-2 rounded-lg text-sm font-medium w-full', getCompetitionColor(topic.competitionLevel as any))}>
                    {topic.competitionLevel?.toUpperCase() || 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">Competition</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Target className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="text-2xl font-bold">{seoScore}%</div>
                  <div className="text-sm text-muted-foreground">SEO Score</div>
                </CardContent>
              </Card>
            </div>

            {/* Target Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Target Audience
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {topic.targetAudience || 'General audience interested in this topic'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Business Context
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {topic.businessType || 'Business-focused content'}
                  </p>
                  {topic.location && (
                    <p className="text-sm text-muted-foreground mt-2">
                      📍 {topic.location}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Additional Context */}
            {(topic.additionalContext || topic.tone) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Additional Context</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {topic.tone && (
                    <div>
                      <h4 className="font-medium mb-2">Tone</h4>
                      <Badge variant="secondary">{topic.tone}</Badge>
                    </div>
                  )}
                  {topic.additionalContext && (
                    <div>
                      <h4 className="font-medium mb-2">Additional Context</h4>
                      <p className="text-muted-foreground">{topic.additionalContext}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Content Brief
                </CardTitle>
                <CardDescription>
                  Detailed guidance for creating high-quality content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingDetails ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-2 text-muted-foreground">Loading detailed information...</span>
                  </div>
                ) : detailedInfo.contentBrief ? (
                  <MarkdownRenderer
                    content={detailedInfo.contentBrief}
                    className="text-sm"
                  />
                ) : (
                  <div className="text-muted-foreground italic">
                    No detailed content brief available for this topic.
                  </div>
                )}

                {detailedInfo.contentAngle && (
                  <div>
                    <h4 className="font-semibold mb-2">Content Angle</h4>
                    <MarkdownRenderer
                      content={detailedInfo.contentAngle}
                      className="text-muted-foreground text-sm"
                    />
                  </div>
                )}

                {detailedInfo.estimatedTimeToWrite && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Estimated writing time: {detailedInfo.estimatedTimeToWrite}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {detailedInfo.relatedTopics && Array.isArray(detailedInfo.relatedTopics) && detailedInfo.relatedTopics.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Related Topics to Cover</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {detailedInfo.relatedTopics.map((relatedTopic, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-foreground">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span>{relatedTopic}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="seo" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    SEO Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Search Volume</span>
                      <span className="font-medium">{formatSearchVolume(topic.searchVolume || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Difficulty</span>
                      <Badge className={getDifficultyColor(topic.difficulty as any)}>
                        {topic.difficulty || 'N/A'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Competition</span>
                      <Badge className={getCompetitionColor(topic.competitionLevel as any)}>
                        {topic.competitionLevel || 'N/A'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">SEO Score</span>
                      <span className={cn('font-medium', scoreColor)}>{seoScore}/100</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Competitive Advantage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingDetails ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    </div>
                  ) : detailedInfo.competitorAnalysis ? (
                    <MarkdownRenderer
                      content={detailedInfo.competitorAnalysis}
                      className="text-sm text-muted-foreground"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      No competitor analysis available for this topic.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="keywords" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Target Keywords
                </CardTitle>
                <CardDescription>
                  Keywords to target in your content for better SEO performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topic.suggestedTags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {topic.suggestedTags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">
                      No specific keywords suggested for this topic.
                    </p>
                  )}

                  {detailedInfo.keywordInsights && Array.isArray(detailedInfo.keywordInsights) && detailedInfo.keywordInsights.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Keyword Insights</h4>
                      <ul className="space-y-2">
                        {detailedInfo.keywordInsights.map((insight, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                            <span className="text-sm text-muted-foreground">{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <ConfirmDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          title="Delete Topic"
          description="Are you sure you want to delete this topic? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleDelete}
          destructive={true}
        />
      </div>
    </section>
  );
}

function formatTopicForCopy(topic: SavedTopic): string {
  const sections = [
    `📝 TOPIC: ${cleanMarkdown(topic.topic)}`,
    '',
    `📊 SEO METRICS:`,
    `• Search Volume: ${formatSearchVolume(topic.searchVolume || 0)}`,
    `• Difficulty: ${topic.difficulty || 'N/A'}`,
    `• Competition: ${topic.competitionLevel || 'N/A'}`,
    `• SEO Score: ${Math.round((topic.difficulty === 'easy' ? 110 : topic.difficulty === 'medium' ? 105 : 100) + (topic.competitionLevel === 'low' ? 15 : topic.competitionLevel === 'medium' ? 8 : 0) + ((topic.searchVolume || 0) > 5000 ? 15 : (topic.searchVolume || 0) > 1000 ? 10 : (topic.searchVolume || 0) > 100 ? 5 : 0))}/100`,
    '',
    `🎯 TARGET AUDIENCE: ${topic.targetAudience || 'General audience'}`,
    `🏢 BUSINESS TYPE: ${topic.businessType || 'Business-focused'}`,
    topic.location ? `📍 LOCATION: ${topic.location}` : '',
    '',
    `🔑 TARGET KEYWORDS:`,
    ...(topic.suggestedTags.length > 0 ? topic.suggestedTags.map((tag: string) => `• ${tag}`) : ['• No specific keywords suggested']),
    '',
    topic.description ? `📋 DESCRIPTION: ${cleanMarkdown(topic.description)}` : '',
  ].filter(Boolean);

  return sections.join('\n');
}