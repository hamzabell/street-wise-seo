'use client';

import { useState, useEffect } from 'react';
import { Button } from './button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { Badge } from './badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import {
  Bookmark,
  BookmarkCheck,
  TrendingUp,
  Users,
  Search,
  ExternalLink,
  Copy,
  Check,
  Eye,
  EyeOff,
  Target,
  Lightbulb,
  BarChart3,
  Clock,
  Globe,
  Zap,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatSearchVolume, getDifficultyColor, getCompetitionColor } from '@/lib/seo/utils';
import { MarkdownRenderer } from './markdown-renderer';
import { cleanMarkdown } from '@/lib/seo/markdown-parser';

interface TopicDetailModalProps {
  topic: {
    id?: string;
    topic: string;
    difficulty: 'easy' | 'medium' | 'hard';
    searchVolume: number;
    competition: 'low' | 'medium' | 'high';
    suggestedTags: string[];
    relevanceScore?: number;
    description?: string;
    targetAudience?: string;
    businessType?: string;
    location?: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (topic: any) => Promise<void>;
  isSaved?: boolean;
  isSaving?: boolean;
}

export function TopicDetailModal({
  topic,
  open,
  onOpenChange,
  onSave,
  isSaved = false,
  isSaving = false,
}: TopicDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailedInfo, setDetailedInfo] = useState<{
    contentBrief?: string;
    contentAngle?: string;
    estimatedTimeToWrite?: string;
    competitorAnalysis?: string;
    keywordInsights?: string[];
    relatedTopics?: string[];
  }>({
    keywordInsights: [],
    relatedTopics: []
  });

  // Fetch detailed information when modal opens
  useEffect(() => {
    if (open) {
      fetchDetailedTopicInfo();
    }
  }, [open, topic.topic, topic.businessType, topic.targetAudience, topic.location]);

  const fetchDetailedTopicInfo = async () => {
    setLoadingDetails(true);
    try {
      const response = await fetch('/api/seo/topic-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: cleanMarkdown(topic.topic),
          businessType: topic.businessType || 'General Business',
          targetAudience: topic.targetAudience || 'General Audience',
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
    try {
      const fullContent = formatTopicForCopy(topic);
      await navigator.clipboard.writeText(fullContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy topic:', error);
    }
  };

  const handleSave = async () => {
    if (onSave && !isSaved) {
      await onSave(topic);
    }
  };

  const getSEOScore = () => {
    let score = 100;

    if (topic.difficulty === 'easy') score += 10;
    else if (topic.difficulty === 'medium') score += 5;

    if (topic.competition === 'low') score += 15;
    else if (topic.competition === 'medium') score += 8;

    if (topic.searchVolume > 5000) score += 15;
    else if (topic.searchVolume > 1000) score += 10;
    else if (topic.searchVolume > 100) score += 5;

    if (topic.relevanceScore) {
      score = Math.round((score + topic.relevanceScore) / 2);
    }

    return Math.min(100, Math.max(0, score));
  };

  const seoScore = getSEOScore();
  const scoreColor = seoScore >= 80 ? 'text-green-600' : seoScore >= 60 ? 'text-yellow-600' : 'text-red-600';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] flex flex-col p-0 sm:p-6">
        {/* Mobile Drag Handle */}
        <div className="flex justify-center pt-4 pb-2 sm:hidden">
          <div className="w-12 h-1 bg-muted-foreground/30 rounded-full" />
        </div>

        {/* Fixed Header */}
        <div className="flex-shrink-0 border-b bg-background sticky top-0 z-10 px-4 py-4 sm:px-0 sm:py-0 sm:border-0 sm:bg-transparent sm:static">
          <DialogHeader className="text-left sm:text-center">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1 min-w-0 pr-2">
                <DialogTitle className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2 leading-tight">
                  {cleanMarkdown(topic.topic)}
                </DialogTitle>
                <DialogDescription className="text-sm sm:text-base line-clamp-3 sm:line-clamp-none">
                  {topic.description || 'No description available'}
                </DialogDescription>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0 sm:self-center">
                <div className="text-center">
                  <div className={cn('text-xl sm:text-2xl font-bold', scoreColor)}>
                    {seoScore}/100
                  </div>
                  <div className="text-xs text-muted-foreground">SEO Score</div>
                </div>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 sm:px-0 sm:pb-0">
          <Tabs defaultValue="overview" className="mt-4 sm:mt-6">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto p-1 mb-4 sm:mb-6">
              <TabsTrigger value="overview" className="text-xs sm:text-sm py-2 px-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Overview</TabsTrigger>
              <TabsTrigger value="content" className="text-xs sm:text-sm py-2 px-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Content</TabsTrigger>
              <TabsTrigger value="seo" className="text-xs sm:text-sm py-2 px-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">SEO</TabsTrigger>
              <TabsTrigger value="keywords" className="text-xs sm:text-sm py-2 px-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Keywords</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <Card>
                  <CardContent className="p-3 sm:p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-lg sm:text-2xl font-bold">{formatSearchVolume(topic.searchVolume)}</div>
                    <div className="text-xs text-muted-foreground">Monthly Searches</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3 sm:p-4 text-center">
                    <div className={cn('px-2 py-1 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-medium w-full', getDifficultyColor(topic.difficulty))}>
                      {topic.difficulty.toUpperCase()}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">Difficulty</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3 sm:p-4 text-center">
                    <div className={cn('px-2 py-1 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-medium w-full', getCompetitionColor(topic.competition))}>
                      {topic.competition.toUpperCase()}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">Competition</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3 sm:p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-lg sm:text-2xl font-bold">
                      {topic.relevanceScore ? Math.round(topic.relevanceScore) : 85}%
                    </div>
                    <div className="text-xs text-muted-foreground">Relevance</div>
                  </CardContent>
                </Card>
              </div>

            {/* Target Information */}
            <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                    Target Audience
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {topic.targetAudience || 'General audience interested in this topic'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <Globe className="h-4 w-4 sm:h-5 sm:w-5" />
                    Business Context
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {topic.businessType || 'Business-focused content'}
                  </p>
                  {topic.location && (
                    <p className="text-xs text-muted-foreground mt-2">
                      📍 {topic.location}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant={isSaved ? 'secondary' : 'default'}
                  onClick={handleSave}
                  disabled={isSaving || isSaved}
                  className="w-full h-12 text-base"
                  size="lg"
                >
                  {isSaving ? (
                    'Saving...'
                  ) : isSaved ? (
                    <>
                      <BookmarkCheck className="mr-2 h-4 w-4" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Bookmark className="mr-2 h-4 w-4" />
                      Save Topic
                    </>
                  )}
                </Button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button variant="outline" onClick={handleCopyTopic} className="h-11 text-base">
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
                    className="h-11 text-base"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Google Search
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
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
                  <ul className="space-y-2 font-manrope">
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

          <TabsContent value="seo" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
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
                      <span className="font-medium">{formatSearchVolume(topic.searchVolume)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Difficulty</span>
                      <Badge className={getDifficultyColor(topic.difficulty)}>
                        {topic.difficulty}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Competition</span>
                      <Badge className={getCompetitionColor(topic.competition)}>
                        {topic.competition}
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

          <TabsContent value="keywords" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}

function formatTopicForCopy(topic: any): string {
  const sections = [
    `📝 TOPIC: ${cleanMarkdown(topic.topic)}`,
    '',
    `📊 SEO METRICS:`,
    `• Search Volume: ${formatSearchVolume(topic.searchVolume)}`,
    `• Difficulty: ${topic.difficulty}`,
    `• Competition: ${topic.competition}`,
    `• SEO Score: ${Math.round((topic.difficulty === 'easy' ? 110 : topic.difficulty === 'medium' ? 105 : 100) + (topic.competition === 'low' ? 15 : topic.competition === 'medium' ? 8 : 0) + (topic.searchVolume > 5000 ? 15 : topic.searchVolume > 1000 ? 10 : topic.searchVolume > 100 ? 5 : 0))}/100`,
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