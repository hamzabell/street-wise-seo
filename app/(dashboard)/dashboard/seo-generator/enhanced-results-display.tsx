'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Copy,
  Heart,
  Download,
  Check,
  FileText,
  Search,
  Globe,
  TrendingUp,
  Calendar,
  Users,
  BarChart3,
  Settings,
  ExternalLink,
  Clock,
  Target,
  Lightbulb,
  Zap,
  Eye,
  MessageSquare,
  Smartphone,
  MapPin,
  Star,
  BookOpen,
  Award,
  Bookmark,
  BookmarkCheck,
  RefreshCw,
  ChevronRight,
  Loader2,
  Library,
} from 'lucide-react';
import { ContentBrief } from '@/components/ui/content-brief';
import { TopicDetailModal } from '@/components/ui/topic-detail-modal';
import { cn } from '@/lib/utils';
import { formatSearchVolume, getDifficultyColor, getCompetitionColor } from '@/lib/seo/utils';

interface EnhancedResultsDisplayProps {
  results: {
    inputTopic: string;
    generatedTopics: Array<{
      topic: string;
      difficulty: 'easy' | 'medium' | 'hard';
      searchVolume: number;
      competition: 'low' | 'medium' | 'high';
      suggestedTags: string[];
      reasoning?: string;
      source?: 'ai' | 'website_gap' | 'competitor_advantage' | 'content_opportunity';
      mobileFriendly?: boolean;
      voiceSearchFriendly?: boolean;
      localIntent?: 'high' | 'medium' | 'low';
      actionOriented?: boolean;
      recommendedLength?: 'short' | 'medium' | 'long';
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
    enhancedData?: {
      websiteAnalysisId?: number;
      competitorAnalysis?: any;
      seasonalTopics?: string[];
      customerQuestions?: string[];
      localCitations?: string[];
      contentCalendar?: any[];
    };
  };
  onSaveTopic?: (topic: any) => Promise<void>;
  onSaveAllTopics?: (topics: any[]) => Promise<void>;
  onRegenerate?: () => void;
  savedTopics?: Set<string>;
  savingIds?: Set<string>;
  isGenerating?: boolean;
}

export function EnhancedResultsDisplay({
  results,
  onSaveTopic,
  onSaveAllTopics,
  onRegenerate,
  savedTopics = new Set(),
  savingIds = new Set(),
  isGenerating = false,
}: EnhancedResultsDisplayProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copyAllSuccess, setCopyAllSuccess] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('topics');
  const [contentBriefTopic, setContentBriefTopic] = useState<any>(null);
  const [contentBriefOpen, setContentBriefOpen] = useState(false);

  const handleCopyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const handleCopyAll = async () => {
    try {
      const allTopics = results.generatedTopics.map(topic => topic.topic).join('\n\n');
      await navigator.clipboard.writeText(allTopics);
      setCopyAllSuccess(true);
      setTimeout(() => setCopyAllSuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy all topics:', error);
    }
  };

  const handleSaveTopic = async (topic: any) => {
    if (onSaveTopic) {
      await onSaveTopic(topic);
    }
  };

  const handleSaveAll = async () => {
    if (onSaveAllTopics) {
      const unsavedTopics = results.generatedTopics.filter(topic => !savedTopics.has(topic.topic));
      await onSaveAllTopics(unsavedTopics);
    }
  };

  const handleTopicDetail = (topic: any) => {
    setSelectedTopic({
      ...topic,
      businessType: results.metadata.businessType,
      targetAudience: results.metadata.targetAudience,
      location: results.metadata.location,
    });
    setDetailModalOpen(true);
  };

  const handleGenerateBrief = (topic: any) => {
    setContentBriefTopic({
      id: topic.id,
      topic: topic.topic,
      businessType: results.metadata.businessType,
      targetAudience: results.metadata.targetAudience,
      location: results.metadata.location,
    });
    setContentBriefOpen(true);
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Topic', 'Difficulty', 'Search Volume', 'Competition', 'Local Intent', 'Mobile Friendly', 'Voice Search Ready', 'Tags'],
      ...results.generatedTopics.map(topic => [
        topic.topic,
        topic.difficulty,
        topic.searchVolume.toString(),
        topic.competition,
        topic.localIntent || 'medium',
        topic.mobileFriendly ? 'Yes' : 'No',
        topic.voiceSearchFriendly ? 'Yes' : 'No',
        topic.suggestedTags.join('; ')
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seo-topics-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    const exportData = {
      metadata: results.metadata,
      topics: results.generatedTopics,
      enhancedData: results.enhancedData,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seo-analysis-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getAverageMetrics = () => {
    const topics = results.generatedTopics;
    const avgDifficulty = topics.reduce((acc, t) => acc + (t.difficulty === 'easy' ? 1 : t.difficulty === 'medium' ? 2 : 3), 0) / topics.length;
    const avgVolume = topics.reduce((acc, t) => acc + t.searchVolume, 0) / topics.length;
    const avgCompetition = topics.reduce((acc, t) => acc + (t.competition === 'low' ? 1 : t.competition === 'medium' ? 2 : 3), 0) / topics.length;

    return {
      difficulty: avgDifficulty <= 1.5 ? 'Easy' : avgDifficulty <= 2.5 ? 'Medium' : 'Hard',
      volume: Math.round(avgVolume),
      competition: avgCompetition <= 1.5 ? 'Low' : avgCompetition <= 2.5 ? 'Medium' : 'High',
    };
  };

  const avgMetrics = getAverageMetrics();

  return (
    <div className="space-y-6">
      {/* Header with Metrics */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">Your SEO Content Strategy</CardTitle>
              <CardDescription>
                {results.metadata.totalTopics} strategic topics for {results.metadata.businessType}
                {results.metadata.location && ` in ${results.metadata.location}`}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopyAll}>
                {copyAllSuccess ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy All
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm" onClick={handleSaveAll}>
                <Heart className="h-4 w-4 mr-2" />
                Save All
              </Button>
              {onRegenerate && (
                <Button variant="outline" size="sm" onClick={onRegenerate}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  New Topics
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-900">{formatSearchVolume(avgMetrics.volume)}</div>
              <div className="text-sm text-blue-700">Avg. Monthly Searches</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className={cn('text-lg font-bold', getDifficultyColor(avgMetrics.difficulty.toLowerCase() as 'easy' | 'medium' | 'hard'))}>
                {avgMetrics.difficulty}
              </div>
              <div className="text-sm text-green-700">Avg. Difficulty</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className={cn('text-lg font-bold', getCompetitionColor(avgMetrics.competition.toLowerCase() as 'low' | 'medium' | 'high'))}>
                {avgMetrics.competition}
              </div>
              <div className="text-sm text-purple-700">Avg. Competition</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <MapPin className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-orange-900">
                {results.metadata.location || 'General'}
              </div>
              <div className="text-sm text-orange-700">Target Location</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="topics" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Topics
          </TabsTrigger>
          <TabsTrigger value="briefs" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Briefs
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </TabsTrigger>
        </TabsList>

        {/* Topics Tab */}
        <TabsContent value="topics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {results.generatedTopics.map((topic, index) => {
              const isSaved = savedTopics.has(topic.topic);
              const isSaving = savingIds.has(topic.topic);
              const isCopied = copiedId === topic.topic;

              return (
                <Card key={`${topic.topic}-${index}`} className="relative hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    {/* Action Buttons */}
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyToClipboard(topic.topic, topic.topic)}
                        className="h-8 w-8 p-0"
                      >
                        {isCopied ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                        <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTopicDetail(topic)}
                        className="h-8 w-8 p-0"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSaveTopic(topic)}
                        disabled={isSaving || isSaved}
                        className="h-8 w-8 p-0"
                      >
                        {isSaving ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                        ) : isSaved ? (
                          <Heart className="h-4 w-4 text-red-500 fill-current" />
                        ) : (
                          <Heart className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {/* Topic Title */}
                    <h3 className="font-semibold text-base mb-2 pr-16 line-clamp-2">
                      {topic.topic}
                    </h3>

                    {/* Source Badge */}
                    {topic.source && (
                      <Badge variant="secondary" className="text-xs mb-2">
                        {topic.source === 'ai' ? '🤖 AI Generated' :
                         topic.source === 'website_gap' ? '🔍 Gap Analysis' :
                         topic.source === 'competitor_advantage' ? '⚔️ Competitor Edge' :
                         '💡 Content Opportunity'}
                      </Badge>
                    )}

                    {/* Brief Description */}
                    {topic.reasoning && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {topic.reasoning}
                      </p>
                    )}

                    {/* Features */}
                    <div className="flex items-center gap-1 mb-3 flex-wrap">
                      {topic.localIntent === 'high' && (
                        <Badge variant="outline" className="text-xs">🏠 Local</Badge>
                      )}
                      {topic.voiceSearchFriendly && (
                        <Badge variant="outline" className="text-xs">🎙️ Voice</Badge>
                      )}
                      {topic.actionOriented && (
                        <Badge variant="outline" className="text-xs">⚡ Action</Badge>
                      )}
                      {topic.mobileFriendly && (
                        <Badge variant="outline" className="text-xs">📱 Mobile</Badge>
                      )}
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                      <div className="text-center">
                        <div className={cn('px-2 py-1 rounded text-xs font-medium', getDifficultyColor(topic.difficulty))}>
                          {topic.difficulty}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className={cn('px-2 py-1 rounded text-xs font-medium', getCompetitionColor(topic.competition))}>
                          {topic.competition}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700">
                          {formatSearchVolume(topic.searchVolume)}
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    {topic.suggestedTags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {topic.suggestedTags.slice(0, 3).map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {topic.suggestedTags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{topic.suggestedTags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Content Briefs Tab */}
        <TabsContent value="briefs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Content Brief Generation
              </CardTitle>
              <CardDescription>
                Save topics to generate comprehensive content briefs with SEO optimization, structure, and recommendations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertDescription>
                  Save your topics first, then go to the "Saved Topics" page to generate comprehensive content briefs with SEO recommendations, structure, and optimization tips.
                </AlertDescription>
              </Alert>

              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No topics available for brief generation</p>
                <Button variant="outline" asChild>
                  <a href="/dashboard/saved-topics">
                    <Library className="h-4 w-4 mr-2" />
                    View Saved Topics
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Industry Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Target Audience Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium">Primary Audience</h4>
                    <p className="text-sm text-muted-foreground">{results.metadata.targetAudience}</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Business Type</h4>
                    <p className="text-sm text-muted-foreground">{results.metadata.businessType}</p>
                  </div>
                  {results.metadata.location && (
                    <div>
                      <h4 className="font-medium">Location Focus</h4>
                      <p className="text-sm text-muted-foreground">{results.metadata.location}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Topics Generated</span>
                    <span className="font-medium">{results.metadata.totalTopics}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total Monthly Volume</span>
                    <span className="font-medium">{formatSearchVolume(results.metadata.totalEstimatedVolume)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Average Difficulty</span>
                    <span className="font-medium">{results.metadata.averageDifficulty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Topics with High Local Intent</span>
                    <span className="font-medium">
                      {results.generatedTopics.filter(t => t.localIntent === 'high').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content Recommendations */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Content Strategy Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Zap className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <h4 className="font-medium text-green-900 mb-1">Quick Wins</h4>
                    <p className="text-sm text-green-700">
                      Start with {results.generatedTopics.filter(t => t.difficulty === 'easy' && t.competition === 'low').length} easy, low-competition topics
                    </p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <h4 className="font-medium text-blue-900 mb-1">High Volume Topics</h4>
                    <p className="text-sm text-blue-700">
                      {results.generatedTopics.filter(t => t.searchVolume > 1000).length} topics with 1k+ monthly searches
                    </p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <MapPin className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <h4 className="font-medium text-purple-900 mb-1">Local SEO Focus</h4>
                    <p className="text-sm text-purple-700">
                      {results.generatedTopics.filter(t => t.localIntent === 'high').length} topics with strong local intent
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Content Calendar Tab */}
        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Content Calendar Planning
              </CardTitle>
              <CardDescription>
                Strategic content planning based on seasonality and business priorities.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <Calendar className="h-4 w-4" />
                <AlertDescription>
                  Content calendar recommendations will be available soon. This feature will help you plan content based on seasonality, trends, and business cycles.
                </AlertDescription>
              </Alert>

              <div className="grid gap-4 md:grid-cols-3 mt-6">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-2">This Month</div>
                  <div className="text-sm text-muted-foreground">Focus on foundation content</div>
                  <div className="text-lg font-medium mt-2">8-10 topics</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-2">Next Month</div>
                  <div className="text-sm text-muted-foreground">Seasonal content planning</div>
                  <div className="text-lg font-medium mt-2">6-8 topics</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 mb-2">Quarter</div>
                  <div className="text-sm text-muted-foreground">Comprehensive coverage</div>
                  <div className="text-lg font-medium mt-2">25-30 topics</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Export Tab */}
        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export Your Data
              </CardTitle>
              <CardDescription>
                Download your SEO analysis in various formats for further use and reporting.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-medium">Basic Exports</h4>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" onClick={exportToCSV}>
                      <Download className="h-4 w-4 mr-2" />
                      Export to CSV
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={exportToJSON}>
                      <Download className="h-4 w-4 mr-2" />
                      Export to JSON
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={handleCopyAll}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy to Clipboard
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Advanced Exports</h4>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" disabled>
                      <Award className="h-4 w-4 mr-2" />
                      PDF Report (Coming Soon)
                    </Button>
                    <Button variant="outline" className="w-full justify-start" disabled>
                      <BookOpen className="h-4 w-4 mr-2" />
                      Content Plan Template (Coming Soon)
                    </Button>
                    <Button variant="outline" className="w-full justify-start" disabled>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Analytics Dashboard (Coming Soon)
                    </Button>
                  </div>
                </div>
              </div>

              <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertDescription>
                  Export your data to create content calendars, share with your team, or import into other SEO tools.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Topic Detail Modal */}
      {selectedTopic && (
        <TopicDetailModal
          topic={selectedTopic}
          open={detailModalOpen}
          onOpenChange={setDetailModalOpen}
          onSave={handleSaveTopic}
          isSaved={savedTopics.has(selectedTopic.topic)}
        />
      )}

      {/* Content Brief Modal */}
      {contentBriefTopic && (
        <ContentBrief
          savedTopicId={contentBriefTopic.id || 0}
          topic={contentBriefTopic.topic}
          trigger={null}
        />
      )}
    </div>
  );
}