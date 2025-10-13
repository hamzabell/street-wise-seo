'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TopicCard } from '@/components/ui/topic-card';
import { MetricsGrid, SEOScoreIndicator } from '@/components/ui/metrics-badge';
import { LoadingTopicCards } from '@/components/ui/loading';
import {
  Download,
  RefreshCw,
  SaveAll,
  Filter,
  SortAsc,
  SortDesc,
  Grid3X3,
  List,
  ChevronDown,
  BarChart3,
  TrendingUp,
  Users,
  Loader2,
  MessageCircle,
  Zap,
  MapPin,
  AlertTriangle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { filterTopics, sortByTrafficPotential } from '@/lib/seo/utils';
import { downloadCSV, prepareExportData } from '@/lib/utils/csv-export';
// import { SchemaGeneratorSection } from '@/components/ui/schema-generator-section';

interface ResultsDisplayProps {
  results: {
    inputTopic: string;
    generatedTopics: Array<{
      topic: string;
      difficulty: 'easy' | 'medium' | 'hard';
      searchVolume: number;
      competition: 'low' | 'medium' | 'high';
      suggestedTags: string[];
      relevanceScore?: number;
      reasoning?: string;
      source?: 'ai' | 'website_gap' | 'competitor_advantage' | 'content_opportunity';
      relatedContent?: string;
      customerQuestions?: Array<{
        question: string;
        category: 'how_to' | 'what_is' | 'where_can' | 'why_does' | 'emergency';
        voiceSearchOptimized: boolean;
        localIntent: 'high' | 'medium' | 'low';
        answerOutline: string;
        suggestedTitle: string;
      }>;
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
  };
  onSaveTopic?: (topic: any) => Promise<void>;
  onSaveAllTopics?: (topics: any[]) => Promise<void>;
  onRegenerate?: () => void;
  isSaving?: boolean;
  savedTopics?: Set<string>;
  className?: string;
}

export function ResultsDisplay({
  results,
  onSaveTopic,
  onSaveAllTopics,
  onRegenerate,
  isSaving = false,
  savedTopics = new Set(),
  className,
}: ResultsDisplayProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'relevance' | 'volume' | 'difficulty' | 'score'>('relevance');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterCompetition, setFilterCompetition] = useState<string>('all');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [filterHasQuestions, setFilterHasQuestions] = useState<string>('all');
  const [filterQuestionCategory, setFilterQuestionCategory] = useState<string>('all');
  const [filterVoiceOptimized, setFilterVoiceOptimized] = useState<string>('all');
  const [filterLocalIntent, setFilterLocalIntent] = useState<string>('all');
  const [savedTopicIds, setSavedTopicIds] = useState<Set<string>>(savedTopics);
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<string>('');

  // Sync local state with prop changes
  useEffect(() => {
    setSavedTopicIds(savedTopics);
  }, [savedTopics]);

  // Apply filters and sorting
  let processedTopics = [...results.generatedTopics];

  // Apply filters
  if (filterDifficulty !== 'all' || filterCompetition !== 'all' || filterSource !== 'all' ||
      filterHasQuestions !== 'all' || filterQuestionCategory !== 'all' ||
      filterVoiceOptimized !== 'all' || filterLocalIntent !== 'all') {
    processedTopics = processedTopics.filter(topic => {
      // Difficulty filter
      if (filterDifficulty !== 'all' && topic.difficulty !== filterDifficulty) {
        return false;
      }

      // Competition filter
      if (filterCompetition !== 'all' && topic.competition !== filterCompetition) {
        return false;
      }

      // Source filter
      if (filterSource !== 'all' && topic.source !== filterSource) {
        return false;
      }

      // Has questions filter
      if (filterHasQuestions !== 'all') {
        const hasQuestions = topic.customerQuestions && topic.customerQuestions.length > 0;
        if (filterHasQuestions === 'yes' && !hasQuestions) return false;
        if (filterHasQuestions === 'no' && hasQuestions) return false;
      }

      // Question category filter
      if (filterQuestionCategory !== 'all' && topic.customerQuestions) {
        const hasCategory = topic.customerQuestions.some(q => q.category === filterQuestionCategory);
        if (!hasCategory) return false;
      }

      // Voice optimized filter
      if (filterVoiceOptimized !== 'all' && topic.customerQuestions) {
        const hasVoiceOptimized = topic.customerQuestions.some(q => q.voiceSearchOptimized);
        if (filterVoiceOptimized === 'yes' && !hasVoiceOptimized) return false;
        if (filterVoiceOptimized === 'no' && hasVoiceOptimized) return false;
      }

      // Local intent filter
      if (filterLocalIntent !== 'all' && topic.customerQuestions) {
        const hasHighLocalIntent = topic.customerQuestions.some(q => q.localIntent === 'high');
        if (filterLocalIntent === 'high' && !hasHighLocalIntent) return false;
        if (filterLocalIntent === 'low' && hasHighLocalIntent) return false;
      }

      return true;
    });
  }

  // Apply sorting
  processedTopics = processedTopics.sort((a, b) => {
    switch (sortBy) {
      case 'relevance':
        return (b.relevanceScore || 0) - (a.relevanceScore || 0);
      case 'volume':
        return b.searchVolume - a.searchVolume;
      case 'difficulty':
        const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
        return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
      case 'score':
        const scoreA = calculateSEOScore(a);
        const scoreB = calculateSEOScore(b);
        return scoreB - scoreA;
      default:
        return 0;
    }
  });

  const handleSaveTopic = async (topic: any) => {
    if (onSaveTopic) {
      await onSaveTopic(topic);
      setSavedTopicIds(prev => new Set([...prev, topic.topic]));
    }
  };

  const handleSaveAll = async () => {
    if (onSaveAllTopics) {
      const unsavedTopics = processedTopics.filter(topic => !savedTopicIds.has(topic.topic));
      await onSaveAllTopics(unsavedTopics);
      setSavedTopicIds(prev => new Set([...prev, ...unsavedTopics.map(t => t.topic)]));
    }
  };

  const handleExport = async () => {
    if (isExporting) return;

    setIsExporting(true);
    setExportStatus('Preparing export...');

    try {
      // Prepare data with current filters and sorting applied
      const exportData = prepareExportData({
        ...results,
        generatedTopics: processedTopics
      });

      setExportStatus('Generating CSV file...');

      // Download with comprehensive error handling
      const exportResult = await downloadCSV(exportData, {
        includeMetadata: true,
        includeBOM: true
      });

      if (exportResult.success) {
        setExportStatus(`Successfully exported ${exportResult.recordCount} topics to ${exportResult.filename}`);
        // Clear status after 3 seconds
        setTimeout(() => setExportStatus(''), 3000);
      } else {
        setExportStatus(`Export failed: ${exportResult.error}`);
        // Clear error after 5 seconds
        setTimeout(() => setExportStatus(''), 5000);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setExportStatus(`Export failed: ${errorMessage}`);
      setTimeout(() => setExportStatus(''), 5000);
    } finally {
      setIsExporting(false);
    }
  };

  const calculateSEOScore = (topic: any) => {
    let score = 100;
    if (topic.difficulty === 'easy') score += 10;
    else if (topic.difficulty === 'medium') score += 5;
    if (topic.competition === 'low') score += 15;
    else if (topic.competition === 'medium') score += 8;
    if (topic.searchVolume > 5000) score += 15;
    else if (topic.searchVolume > 1000) score += 10;
    else if (topic.searchVolume > 100) score += 5;
    return Math.min(100, Math.max(0, score));
  };

  const getAverageScore = () => {
    const totalScore = processedTopics.reduce((sum, topic) => sum + calculateSEOScore(topic), 0);
    return Math.round(totalScore / processedTopics.length);
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Generated Topics for "{results.metadata.businessType}"
              </CardTitle>
              <CardDescription>
                Targeting {results.metadata.targetAudience}
                {results.metadata.location && ` in ${results.metadata.location}`}
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <SEOScoreIndicator score={getAverageScore()} />
              <Badge variant="outline">
                {processedTopics.length} topics
              </Badge>
            </div>
          </div>

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{results.metadata.totalTopics}</div>
              <div className="text-xs text-muted-foreground">Total Topics</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(results.metadata.totalEstimatedVolume / 1000)}K
              </div>
              <div className="text-xs text-muted-foreground">Est. Monthly Volume</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{results.metadata.averageDifficulty}</div>
              <div className="text-xs text-muted-foreground">Avg. Difficulty</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{getAverageScore()}</div>
              <div className="text-xs text-muted-foreground">Avg. SEO Score</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {/* View Mode */}
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Sort */}
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Most Relevant</SelectItem>
              <SelectItem value="volume">Highest Volume</SelectItem>
              <SelectItem value="difficulty">Easiest First</SelectItem>
              <SelectItem value="score">Best Score</SelectItem>
            </SelectContent>
          </Select>

          {/* Basic Filters */}
          <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterCompetition} onValueChange={setFilterCompetition}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Competition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterSource} onValueChange={setFilterSource}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="ai">AI Generated</SelectItem>
              <SelectItem value="website_gap">Website Gaps</SelectItem>
              <SelectItem value="competitor_advantage">Competitor Edge</SelectItem>
              <SelectItem value="content_opportunity">Content Opportunities</SelectItem>
            </SelectContent>
          </Select>

          {/* Question Filters */}
          <Select value={filterHasQuestions} onValueChange={setFilterHasQuestions}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Questions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Topics</SelectItem>
              <SelectItem value="yes">With Questions</SelectItem>
              <SelectItem value="no">No Questions</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterQuestionCategory} onValueChange={setFilterQuestionCategory}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Q. Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="how_to">How To</SelectItem>
              <SelectItem value="what_is">What Is</SelectItem>
              <SelectItem value="where_can">Where Can</SelectItem>
              <SelectItem value="why_does">Why Does</SelectItem>
              <SelectItem value="emergency">Emergency</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterVoiceOptimized} onValueChange={setFilterVoiceOptimized}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Voice" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Topics</SelectItem>
              <SelectItem value="yes">Voice Ready</SelectItem>
              <SelectItem value="no">Not Voice</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterLocalIntent} onValueChange={setFilterLocalIntent}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Local" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Topics</SelectItem>
              <SelectItem value="high">High Local</SelectItem>
              <SelectItem value="low">Low Local</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={isExporting}
            className="hidden sm:flex"
          >
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveAll}
            disabled={isSaving || processedTopics.every(topic => savedTopicIds.has(topic.topic))}
          >
            <SaveAll className="mr-2 h-4 w-4" />
            Save All
          </Button>

          {onRegenerate && (
            <Button variant="outline" size="sm" onClick={onRegenerate}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Regenerate
            </Button>
          )}
        </div>
      </div>

      {/* Export Status */}
      {exportStatus && (
        <div className={cn(
          "flex items-center gap-2 p-3 rounded-lg text-sm",
          exportStatus.includes('Successfully')
            ? "bg-green-50 text-green-800 border border-green-200"
            : "bg-red-50 text-red-800 border border-red-200"
        )}>
          {exportStatus.includes('Preparing') || exportStatus.includes('Generating') ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : exportStatus.includes('Successfully') ? (
            <Download className="h-4 w-4" />
          ) : null}
          {exportStatus}
        </div>
      )}

      {/* Results */}
      {processedTopics.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Filter className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No topics match your filters</h3>
            <p className="text-muted-foreground text-center mb-4">
              Try adjusting your filters or generate new topics
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setFilterDifficulty('all');
                setFilterCompetition('all');
                setFilterSource('all');
                setFilterHasQuestions('all');
                setFilterQuestionCategory('all');
                setFilterVoiceOptimized('all');
                setFilterLocalIntent('all');
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className={
          viewMode === 'grid'
            ? 'grid gap-4 md:grid-cols-2 lg:grid-cols-3'
            : 'space-y-4'
        }>
          {processedTopics.map((topic, index) => (
            <TopicCard
              key={`${topic.topic}-${index}`}
              topic={{
                ...topic,
                businessType: results.metadata.businessType,
                targetAudience: results.metadata.targetAudience,
                location: results.metadata.location,
                reasoning: topic.reasoning,
                source: topic.source,
                relatedContent: topic.relatedContent,
                customerQuestions: topic.customerQuestions,
              }}
              onSave={onSaveTopic}
              isSaved={savedTopicIds.has(topic.topic)}
              isSaving={isSaving}
              showSaveButton={!!onSaveTopic}
              className={viewMode === 'list' ? 'w-full' : ''}
            />
          ))}
        </div>
      )}

      {/* Schema Generator Section */}
      {/* <SchemaGeneratorSection
        metadata={results.metadata}
        className="mt-8"
      /> */}
    </div>
  );
}