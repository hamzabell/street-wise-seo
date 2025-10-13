'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  ArrowLeft,
  Library,
  Search,
  Filter,
  PenTool,
  Trash2,
  Calendar,
  Hash,
  MapPin,
  Building,
  Users,
  Target,
  Star,
  Loader2,
  Eye,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface SavedTopic {
  id: number;
  topic: string;
  description?: string;
  tags?: string[];
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
}

const DIFFICULTY_COLORS = {
  easy: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  hard: 'bg-red-100 text-red-800'
};

const COMPETITION_COLORS = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800'
};

function TopicCard({ topic, onDelete }: {
  topic: SavedTopic;
  onDelete: (id: number) => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isGeneratingBrief, setIsGeneratingBrief] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/seo/saved-topics/${topic.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onDelete(topic.id);
      }
    } catch (error) {
      console.error('Error deleting topic:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleGenerateBrief = async () => {
    setIsGeneratingBrief(true);
    try {
      // Call the API to generate the brief
      const response = await fetch('/api/seo/brief', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          savedTopicId: topic.id,
          websiteAnalysisId: undefined,
          enhanceWithWebsiteData: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate content brief');
      }

      const result = await response.json();

      // Redirect to the content brief page if successful
      if (result.type === 'legacy' && result.brief?.id) {
        window.location.href = `/dashboard/content-brief/${result.brief.id}`;
      } else {
        // For structured briefs, we might need a different approach or create a new page
        // For now, let the user know the brief was generated
        alert('Content brief generated successfully! (Structured format - page integration coming soon)');
      }
    } catch (error) {
      console.error('Error generating brief:', error);
      alert(error instanceof Error ? error.message : 'Failed to generate content brief');
    } finally {
      setIsGeneratingBrief(false);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 flex-1 pr-2 leading-tight">{topic.topic}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            disabled={isDeleting}
            className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>

        {topic.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{topic.description}</p>
        )}

        <div className="flex flex-wrap gap-2">
          {topic.difficulty && (
            <Badge className={`text-xs ${DIFFICULTY_COLORS[topic.difficulty as keyof typeof DIFFICULTY_COLORS]}`}>
              {topic.difficulty}
            </Badge>
          )}
          {topic.competitionLevel && (
            <Badge className={`text-xs ${COMPETITION_COLORS[topic.competitionLevel as keyof typeof COMPETITION_COLORS]}`}>
              {topic.competitionLevel} competition
            </Badge>
          )}
          {topic.tone && (
            <Badge variant="secondary" className="text-xs">
              Tone: {topic.tone}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 space-y-4">
          {/* Business Context */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {topic.businessType && (
              <div className="flex items-center gap-2 text-gray-600">
                <Building className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{topic.businessType}</span>
              </div>
            )}
            {topic.targetAudience && (
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{topic.targetAudience}</span>
              </div>
            )}
            {topic.location && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{topic.location}</span>
              </div>
            )}
            {topic.searchVolume && (
              <div className="flex items-center gap-2 text-gray-600">
                <Target className="h-4 w-4 flex-shrink-0" />
                <span>{topic.searchVolume.toLocaleString()} searches</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {topic.tags && Array.isArray(topic.tags) && topic.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {topic.tags.slice(0, 5).map((tag: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
              {topic.tags.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{topic.tags.length - 5} more
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Actions - Always at bottom */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar className="h-3 w-3" />
            {new Date(topic.savedAt).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" asChild className="flex-shrink-0" title="View Details">
              <Link href={`/dashboard/saved-topics/${topic.id}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-shrink-0"
              title="Generate Content Brief"
              onClick={handleGenerateBrief}
              disabled={isGeneratingBrief}
            >
              {isGeneratingBrief ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
            </Button>
            <Button size="sm" variant="default" asChild className="flex-shrink-0" title="Generate Content">
              <Link href={`/dashboard/content-generator?topicId=${topic.id}`}>
                <PenTool className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>

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
    </Card>
  );
}

function FilterControls({
  searchQuery,
  onSearchChange,
  selectedDifficulty,
  onDifficultyChange,
  selectedCompetition,
  onCompetitionChange
}: {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedDifficulty: string;
  onDifficultyChange: (difficulty: string) => void;
  selectedCompetition: string;
  onCompetitionChange: (competition: string) => void;
}) {
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
          {/* Search - Full width on mobile, flex-1 on desktop */}
          <div className="w-full lg:flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search topics, tags, or description..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>

          {/* Filter Buttons Group */}
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            {/* Difficulty Filter */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Difficulty
              </label>
              <div className="flex gap-1">
                {['all', 'easy', 'medium', 'hard'].map((difficulty) => (
                  <Button
                    key={difficulty}
                    variant={selectedDifficulty === difficulty ? "default" : "outline"}
                    size="sm"
                    onClick={() => onDifficultyChange(difficulty)}
                    className="capitalize text-xs px-2 py-1"
                  >
                    {difficulty}
                  </Button>
                ))}
              </div>
            </div>

            {/* Competition Filter */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Competition
              </label>
              <div className="flex gap-1">
                {['all', 'low', 'medium', 'high'].map((competition) => (
                  <Button
                    key={competition}
                    variant={selectedCompetition === competition ? "default" : "outline"}
                    size="sm"
                    onClick={() => onCompetitionChange(competition)}
                    className="capitalize text-xs px-2 py-1"
                  >
                    {competition}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SavedTopicsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedCompetition, setSelectedCompetition] = useState('all');

  const { data: topics, error, isLoading, mutate } = useSWR<{ success: boolean; data: SavedTopic[]; pagination: any }>('/api/seo/saved-topics', fetcher);

  const handleDelete = (deletedId: number) => {
    mutate(
      (currentData: { success: boolean; data: SavedTopic[]; pagination: any } | undefined) => {
        if (!currentData) return currentData;
        return {
          ...currentData,
          data: currentData.data.filter(topic => topic.id !== deletedId)
        };
      },
      false
    );
  };

  const filteredTopics = topics?.data?.filter(topic => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const topicText = topic.topic.toLowerCase();
      const descriptionText = topic.description?.toLowerCase() || '';
      const tagsText = topic.tags && Array.isArray(topic.tags) ? topic.tags.join(' ').toLowerCase() : '';

      if (!topicText.includes(query) &&
          !descriptionText.includes(query) &&
          !tagsText.includes(query)) {
        return false;
      }
    }

    // Difficulty filter
    if (selectedDifficulty !== 'all' && topic.difficulty !== selectedDifficulty) {
      return false;
    }

    // Competition filter
    if (selectedCompetition !== 'all' && topic.competitionLevel !== selectedCompetition) {
      return false;
    }

    return true;
  }) || [];

  if (error) {
    return (
      <section className="flex-1 p-4 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Topics</h3>
                <p className="text-red-600">Please try again later.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Saved Topics
              </h1>
              <p className="text-lg text-muted-foreground">
                Manage your library of SEO-optimized topics
              </p>
            </div>
            <Button asChild>
              <Link href="/dashboard/seo-generator">
                <Star className="mr-2 h-4 w-4" />
                Generate New Topics
              </Link>
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading topics...</span>
          </div>
        ) : topics?.data?.length === 0 ? (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <Library className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Saved Topics Yet</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Start by generating some SEO-optimized topics for your business.
                </p>
                <Button size="lg" asChild>
                  <Link href="/dashboard/seo-generator">
                    <Star className="mr-2 h-5 w-5" />
                    Generate Your First Topics
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div>
            {/* Filter Controls - Now at the top */}
            <FilterControls
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedDifficulty={selectedDifficulty}
              onDifficultyChange={setSelectedDifficulty}
              selectedCompetition={selectedCompetition}
              onCompetitionChange={setSelectedCompetition}
            />

            {/* Topics Grid - Full width */}
            {filteredTopics.length === 0 ? (
              <Card>
                <CardContent className="p-12">
                  <div className="text-center">
                    <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Topics Found</h3>
                    <p className="text-gray-600">
                      Try adjusting your filters or search terms.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredTopics.map((topic) => (
                  <TopicCard
                    key={topic.id}
                    topic={topic}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
