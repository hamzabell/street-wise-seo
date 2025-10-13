'use client';

import { useState } from 'react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import {
  Bookmark,
  BookmarkCheck,
  TrendingUp,
  Users,
  Search,
  ExternalLink,
  Copy,
  Check,
  MoreHorizontal,
  Eye,
  Lightbulb,
  Globe,
  Target,
  TrendingDown,
  Info,
  MessageCircle,
  HelpCircle,
  MapPin,
  AlertTriangle,
  Zap,
  FileText,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { cn } from '@/lib/utils';
import { formatSearchVolume, getDifficultyColor, getCompetitionColor } from '@/lib/seo/utils';
import { TopicDetailModal } from './topic-detail-modal';
import { MarkdownRenderer } from './markdown-renderer';
import { cleanMarkdown, cleanTopicTitle } from '@/lib/seo/markdown-parser';
import type { CustomerQuestion } from '@/lib/seo/question-generator';
import { ContentBrief } from './content-brief';

interface TopicCardProps {
  topic: {
    id?: string;
    topic: string;
    difficulty: 'easy' | 'medium' | 'hard';
    searchVolume: number;
    competition: 'low' | 'medium' | 'high';
    suggestedTags: string[];
    relevanceScore?: number;
    description?: string;
    businessType?: string;
    targetAudience?: string;
    location?: string;
    reasoning?: string;
    source?: 'ai' | 'website_gap' | 'competitor_advantage' | 'content_opportunity';
    relatedContent?: string;
    customerQuestions?: CustomerQuestion[];
    savedTopicId?: number;
  };
  onSave?: (topic: any) => Promise<void>;
  isSaved?: boolean;
  isSaving?: boolean;
  showSaveButton?: boolean;
  showBriefButton?: boolean;
  websiteAnalysisId?: number;
  className?: string;
}

export function TopicCard({
  topic,
  onSave,
  isSaved = false,
  isSaving = false,
  showSaveButton = true,
  showBriefButton = true,
  websiteAnalysisId,
  className,
}: TopicCardProps) {
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleCopyTopic = async () => {
    try {
      await navigator.clipboard.writeText(cleanTopicTitle(topic.topic));
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

    // Score based on difficulty (easier is better)
    if (topic.difficulty === 'easy') score += 10;
    else if (topic.difficulty === 'medium') score += 5;

    // Score based on competition (lower is better)
    if (topic.competition === 'low') score += 15;
    else if (topic.competition === 'medium') score += 8;

    // Score based on search volume
    if (topic.searchVolume > 5000) score += 15;
    else if (topic.searchVolume > 1000) score += 10;
    else if (topic.searchVolume > 100) score += 5;

    // Add relevance score if available
    if (topic.relevanceScore) {
      score = Math.round((score + topic.relevanceScore) / 2);
    }

    return Math.min(100, Math.max(0, score));
  };

  const seoScore = getSEOScore();
  const scoreColor = seoScore >= 80 ? 'text-green-600' : seoScore >= 60 ? 'text-yellow-600' : 'text-red-600';

  // Helper functions for source display
  const getSourceInfo = (source?: string) => {
    switch (source) {
      case 'website_gap':
        return {
          icon: TrendingDown,
          label: 'Website Gap',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50 border-orange-200',
          description: 'Addresses missing content on your website'
        };
      case 'competitor_advantage':
        return {
          icon: Target,
          label: 'Competitor Edge',
          color: 'text-red-600',
          bgColor: 'bg-red-50 border-red-200',
          description: 'Helps compete with competitor content'
        };
      case 'content_opportunity':
        return {
          icon: Lightbulb,
          label: 'Content Opportunity',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50 border-blue-200',
          description: 'Builds on your existing content strengths'
        };
      default:
        return {
          icon: Globe,
          label: 'AI Generated',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50 border-gray-200',
          description: 'AI suggestion based on business context'
        };
    }
  };

  const sourceInfo = getSourceInfo(topic.source);

  // Helper functions for question categories
  const getQuestionCategoryInfo = (category: CustomerQuestion['category']) => {
    switch (category) {
      case 'how_to':
        return {
          icon: HelpCircle,
          label: 'How To',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50 border-blue-200',
          description: 'Step-by-step guidance questions'
        };
      case 'what_is':
        return {
          icon: MessageCircle,
          label: 'What Is',
          color: 'text-green-600',
          bgColor: 'bg-green-50 border-green-200',
          description: 'Definition and explanation questions'
        };
      case 'where_can':
        return {
          icon: MapPin,
          label: 'Where Can',
          color: 'text-purple-600',
          bgColor: 'bg-purple-50 border-purple-200',
          description: 'Location-based search questions'
        };
      case 'why_does':
        return {
          icon: Search,
          label: 'Why Does',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50 border-orange-200',
          description: 'Problem explanation questions'
        };
      case 'emergency':
        return {
          icon: AlertTriangle,
          label: 'Emergency',
          color: 'text-red-600',
          bgColor: 'bg-red-50 border-red-200',
          description: 'Urgent help questions'
        };
      default:
        return {
          icon: MessageCircle,
          label: 'Questions',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50 border-gray-200',
          description: 'Customer questions'
        };
    }
  };

  const getQuestionStats = () => {
    if (!topic.customerQuestions || topic.customerQuestions.length === 0) {
      return null;
    }

    const stats = topic.customerQuestions.reduce((acc, question) => {
      acc.total++;
      acc.voiceSearchOptimized += question.voiceSearchOptimized ? 1 : 0;
      acc.localIntentHigh += question.localIntent === 'high' ? 1 : 0;
      acc.categories[question.category] = (acc.categories[question.category] || 0) + 1;
      return acc;
    }, {
      total: 0,
      voiceSearchOptimized: 0,
      localIntentHigh: 0,
      categories: {} as Record<string, number>
    });

    return stats;
  };

  const questionStats = getQuestionStats();

  return (
    <Card className={cn('relative group hover:shadow-md transition-all duration-200', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg leading-6 mb-2 line-clamp-2">
              {cleanTopicTitle(topic.topic)}
            </CardTitle>
            {topic.description && (
              <div className="text-sm text-muted-foreground line-clamp-2">
                <MarkdownRenderer
                  content={topic.description}
                  className="[&_p]:mb-0 [&_p]:text-sm [&_p]:text-muted-foreground [&_p]:leading-normal"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 ml-2">
            {/* Eye Icon for Details */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => setShowDetails(true)}
              title="View topic details"
            >
              <Eye className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowDetails(true)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyTopic}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy topic
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    const query = encodeURIComponent(cleanTopicTitle(topic.topic));
                    window.open(`https://google.com/search?q=${query}`, '_blank');
                  }}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Search on Google
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          {/* SEO Score Badge */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span className={`text-sm font-medium ${scoreColor}`}>
                {seoScore}/100
              </span>
            </div>
            <span className="text-xs text-muted-foreground">SEO Score</span>
          </div>

          <div className="flex items-center gap-1">
            {/* Questions Indicator */}
            {questionStats && (
              <div className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-full border text-xs mr-2',
                'bg-indigo-50 border-indigo-200 text-indigo-600'
              )}>
                <MessageCircle className="h-3 w-3" />
                <span className="font-medium">{questionStats.total} Q's</span>
              </div>
            )}

            {/* Source Indicator */}
            {topic.source && (
              <div className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-full border text-xs',
                sourceInfo.bgColor,
                sourceInfo.color
              )}>
                <sourceInfo.icon className="h-3 w-3" />
                <span className="font-medium">{sourceInfo.label}</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <div className={cn('px-2 py-1 rounded-full text-xs font-medium', getDifficultyColor(topic.difficulty))}>
              {topic.difficulty}
            </div>
            <span className="text-xs text-muted-foreground">Difficulty</span>
          </div>

          <div className="flex items-center gap-2">
            <div className={cn('px-2 py-1 rounded-full text-xs font-medium', getCompetitionColor(topic.competition))}>
              {topic.competition}
            </div>
            <span className="text-xs text-muted-foreground">Competition</span>
          </div>
        </div>

        {/* Search Volume */}
        <div className="flex items-center gap-2 text-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{formatSearchVolume(topic.searchVolume)}</span>
          <span className="text-muted-foreground">monthly searches</span>
        </div>

        {/* Reasoning Section */}
        {topic.reasoning && (
          <div className={cn(
            'p-3 rounded-lg border text-xs',
            sourceInfo.bgColor
          )}>
            <div className="flex items-start gap-2">
              <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <div className="font-medium">
                  Why this topic?
                </div>
                <div className="text-muted-foreground leading-normal">
                  {topic.reasoning}
                </div>
                {topic.relatedContent && (
                  <div className="text-muted-foreground mt-2">
                    <span className="font-medium">Related content:</span> {topic.relatedContent}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Customer Questions Section */}
        {questionStats && questionStats.total > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Customer Questions:</span>
                <span className="font-medium text-indigo-600">{questionStats.total}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {questionStats.voiceSearchOptimized > 0 && (
                  <div className="flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    <span>{questionStats.voiceSearchOptimized} voice-ready</span>
                  </div>
                )}
                {questionStats.localIntentHigh > 0 && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{questionStats.localIntentHigh} local</span>
                  </div>
                )}
              </div>
            </div>

            {/* Question Categories */}
            <div className="flex flex-wrap gap-1">
              {Object.entries(questionStats.categories).slice(0, 3).map(([category, count]) => {
                const categoryInfo = getQuestionCategoryInfo(category as CustomerQuestion['category']);
                return (
                  <Badge
                    key={category}
                    variant="outline"
                    className={cn('text-xs', categoryInfo.color, categoryInfo.bgColor)}
                  >
                    <categoryInfo.icon className="h-3 w-3 mr-1" />
                    {categoryInfo.label} ({count})
                  </Badge>
                );
              })}
              {Object.keys(questionStats.categories).length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{Object.keys(questionStats.categories).length - 3}
                </Badge>
              )}
            </div>

            {/* Sample Questions */}
            <div className="space-y-2">
              {topic.customerQuestions?.slice(0, 3).map((question, index) => {
                const categoryInfo = getQuestionCategoryInfo(question.category);
                return (
                  <div
                    key={index}
                    className={cn(
                      'p-2 rounded-lg border text-xs',
                      categoryInfo.bgColor
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <categoryInfo.icon className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-xs mb-1">
                          {question.question}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {question.voiceSearchOptimized && (
                            <div className="flex items-center gap-1">
                              <Zap className="h-2 w-2" />
                              <span>Voice</span>
                            </div>
                          )}
                          {question.localIntent === 'high' && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-2 w-2" />
                              <span>Local</span>
                            </div>
                          )}
                          {question.category === 'emergency' && (
                            <div className="flex items-center gap-1">
                              <AlertTriangle className="h-2 w-2" />
                              <span>Urgent</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tags */}
        {topic.suggestedTags.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Target keywords:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {topic.suggestedTags.slice(0, 5).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {topic.suggestedTags.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{topic.suggestedTags.length - 5}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          {showSaveButton && (
            <Button
              variant={isSaved ? 'secondary' : 'default'}
              size="sm"
              onClick={handleSave}
              disabled={isSaving || isSaved}
              className="flex-1"
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
          )}

          {showBriefButton && (topic.savedTopicId || topic.id) && (
            <ContentBrief
              savedTopicId={topic.savedTopicId || parseInt(topic.id || '0')}
              topic={topic.topic}
              websiteAnalysisId={websiteAnalysisId}
              trigger={
                <Button
                  variant="outline"
                  size="sm"
                  title="Generate content brief"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Brief
                </Button>
              }
            />
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyTopic}
            className="relative"
          >
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </>
            )}
          </Button>
        </div>
      </CardContent>

      {/* Visual indicator for high relevance */}
      {topic.relevanceScore && topic.relevanceScore > 80 && (
        <div className="absolute top-2 right-2">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
        </div>
      )}

      {/* Topic Detail Modal */}
      <TopicDetailModal
        topic={topic}
        open={showDetails}
        onOpenChange={setShowDetails}
        onSave={onSave}
        isSaved={isSaved}
        isSaving={isSaving}
      />
    </Card>
  );
}