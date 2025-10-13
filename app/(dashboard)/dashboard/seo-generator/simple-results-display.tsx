'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, Heart, Download, Check } from 'lucide-react';
// import { SchemaGeneratorSection } from '@/components/ui/schema-generator-section';

interface SimpleResultsDisplayProps {
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
      seasonalRelevance?: 'spring' | 'summer' | 'fall' | 'winter' | 'holiday' | 'current';
      urgencyLevel?: 'low' | 'medium' | 'high' | 'emergency';
      implementationTime?: '15 min' | '30 min' | '1 hour' | '2+ hours';
      contentChecklist?: string[];
      titleVariations?: string[];
    }>;
    metadata: {
      businessType: string;
      targetAudience: string;
      location?: string;
      generatedAt: string;
      totalTopics: number;
      averageDifficulty: string;
      totalEstimatedVolume: number;
      industryId?: string;
    };
  };
  onSaveTopic?: (topic: any) => Promise<void>;
  onSaveAllTopics?: (topics: any[]) => Promise<void>;
  onRegenerate?: () => void;
  savedTopics?: Set<string>;
}

export function SimpleResultsDisplay({
  results,
  onSaveTopic,
  onSaveAllTopics,
  onRegenerate,
  savedTopics = new Set(),
}: SimpleResultsDisplayProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copyAllSuccess, setCopyAllSuccess] = useState(false);
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());

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
      setSavingIds(prev => new Set([...prev, topic.topic]));
      try {
        await onSaveTopic(topic);
      } finally {
        setSavingIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(topic.topic);
          return newSet;
        });
      }
    }
  };

  const handleSaveAll = async () => {
    if (onSaveAllTopics) {
      const unsavedTopics = results.generatedTopics.filter(topic => !savedTopics.has(topic.topic));
      await onSaveAllTopics(unsavedTopics);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCompetitionColor = (competition: string) => {
    switch (competition) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatSearchVolume = (volume: number) => {
    if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}k`;
    }
    return volume.toString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Your Content Ideas</h2>
              <p className="text-muted-foreground">
                {results.metadata.totalTopics} ideas for {results.metadata.businessType} business
                {results.metadata.location && ` in ${results.metadata.location}`}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyAll}
                className="flex items-center gap-2"
              >
                {copyAllSuccess ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy All
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveAll}
                disabled={results.generatedTopics.every(topic => savedTopics.has(topic.topic))}
              >
                <Heart className="h-4 w-4 mr-2" />
                Save All
              </Button>

              {onRegenerate && (
                <Button variant="outline" size="sm" onClick={onRegenerate}>
                  Generate New
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.generatedTopics.map((topic, index) => {
          const isSaved = savedTopics.has(topic.topic);
          const isSaving = savingIds.has(topic.topic);
          const isCopied = copiedId === topic.topic;

          return (
            <Card key={`${topic.topic}-${index}`} className="relative touch-manipulation active:scale-[0.98] transition-transform">
              <CardContent className="p-4 sm:p-5">
                {/* Action Buttons */}
                <div className="absolute top-3 right-3 flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyToClipboard(topic.topic, topic.topic)}
                    className="h-9 w-9 p-0 rounded-lg touch-manipulation active:scale-[0.95]"
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
                    onClick={() => handleSaveTopic(topic)}
                    disabled={isSaving || isSaved}
                    className="h-9 w-9 p-0 rounded-lg touch-manipulation active:scale-[0.95]"
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
                <h3 className="font-semibold text-base mb-2 pr-16">
                  {topic.topic}
                </h3>

                {/* Brief Description */}
                {topic.reasoning && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {topic.reasoning}
                  </p>
                )}

                {/* Search Intent */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {topic.urgencyLevel === 'emergency' && (
                    <Badge className="bg-red-600 text-white hover:bg-red-700 text-xs font-bold animate-pulse">
                      🚨 EMERGENCY
                    </Badge>
                  )}
                  {topic.urgencyLevel === 'high' && (
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-200 text-xs font-medium">
                      🔥 High Priority
                    </Badge>
                  )}
                  {topic.seasonalRelevance === 'current' && (
                    <Badge className="bg-green-600 text-white hover:bg-green-700 text-xs font-bold">
                      🌱 Seasonal Now
                    </Badge>
                  )}
                  {topic.seasonalRelevance && topic.seasonalRelevance !== 'current' && (
                    <Badge variant="outline" className="text-xs font-medium border-green-300 text-green-700">
                      {topic.seasonalRelevance === 'spring' && '🌸 Spring'}
                      {topic.seasonalRelevance === 'summer' && '☀️ Summer'}
                      {topic.seasonalRelevance === 'fall' && '🍂 Fall'}
                      {topic.seasonalRelevance === 'winter' && '❄️ Winter'}
                      {topic.seasonalRelevance === 'holiday' && '🎄 Holiday'}
                    </Badge>
                  )}
                  {topic.localIntent === 'high' && (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200 text-xs font-medium">
                      🏠 High Local Intent
                    </Badge>
                  )}
                  {topic.localIntent === 'medium' && (
                    <Badge variant="outline" className="text-xs font-medium border-green-300 text-green-700">
                      📍 Local
                    </Badge>
                  )}
                  {topic.voiceSearchFriendly && (
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-xs font-medium">
                      🎙️ Voice Search
                    </Badge>
                  )}
                  {topic.actionOriented && (
                    <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200 text-xs font-medium">
                      ⚡ Action-Oriented
                    </Badge>
                  )}
                  {topic.mobileFriendly && (
                    <Badge variant="outline" className="text-xs font-medium border-purple-300 text-purple-700">
                      📱 Mobile-Friendly
                    </Badge>
                  )}
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <div className={`px-2 py-1 rounded ${getDifficultyColor(topic.difficulty)}`}>
                      {topic.difficulty}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`px-2 py-1 rounded ${getCompetitionColor(topic.competition)}`}>
                      {topic.competition}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="px-2 py-1 rounded bg-blue-50 text-blue-700">
                      {formatSearchVolume(topic.searchVolume)}
                    </div>
                  </div>
                </div>

                {/* Implementation Time */}
                {topic.implementationTime && (
                  <div className="flex items-center gap-2 mt-3 mb-2">
                    <span className="text-xs text-muted-foreground">Implementation:</span>
                    <Badge variant="outline" className="text-xs font-medium">
                      ⏱️ {topic.implementationTime}
                    </Badge>
                  </div>
                )}

                {/* Content Checklist */}
                {topic.contentChecklist && topic.contentChecklist.length > 0 && (
                  <div className="mt-3">
                    <div className="text-xs font-medium text-gray-700 mb-2">Content Checklist:</div>
                    <div className="space-y-1">
                      {topic.contentChecklist.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                          </div>
                          <span className="text-xs text-gray-600">{item}</span>
                        </div>
                      ))}
                      {topic.contentChecklist.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{topic.contentChecklist.length - 3} more items
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {topic.suggestedTags && topic.suggestedTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {topic.suggestedTags.slice(0, 3).map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Schema Generator Section */}
      {/* <SchemaGeneratorSection
        metadata={results.metadata}
        className="mt-8"
      /> */}

      {/* Simple Export Section */}
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            Need these ideas in another format?
          </p>
          <Button
            variant="outline"
            onClick={handleCopyAll}
            className="w-full max-w-xs"
          >
            <Download className="h-4 w-4 mr-2" />
            Export to Text
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}