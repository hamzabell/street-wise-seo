'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import {
  PenTool,
  ArrowLeft,
  FileText,
  Clock,
  Target,
  Hash,
  Sparkles,
  Download,
  Copy,
  Eye,
  Loader2,
  Save,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface SavedTopic {
  id: number;
  topic: string;
  description?: string;
  tags?: string[];
  tone?: string;
  businessType?: string;
  targetAudience?: string;
  location?: string;
  additionalContext?: string;
  websiteUrl?: string;
  savedAt: string;
}

interface GeneratedContent {
  id: number;
  title: string;
  content: string;
  htmlContent: string;
  wordCount: number;
  readingTime: number;
  seoScore: number;
  contentType: string;
  variantNumber: number;
  targetKeywords: string[];
  tone: string;
  createdAt: string;
}

interface ParsedContentData {
  title: string;
  content: string;
  targetKeywords: string[];
  seoScore: number;
  wordCount: number;
  readingTime: number;
  hasError?: boolean;
}

const CONTENT_TYPES = [
  {
    id: 'blog_post',
    name: 'Blog Post',
    description: 'In-depth article for your website blog',
    wordCount: '800-1500 words',
    color: 'bg-blue-500',
    icon: '📝'
  },
  {
    id: 'social_media',
    name: 'Social Media',
    description: 'Engaging content for social platforms',
    wordCount: '150-300 words',
    color: 'bg-pink-500',
    icon: '📱'
  },
  {
    id: 'website_page',
    name: 'Website Page',
    description: 'Service page or informational content',
    wordCount: '400-800 words',
    color: 'bg-green-500',
    icon: '🌐'
  },
  {
    id: 'email',
    name: 'Email Newsletter',
    description: 'Email content for subscribers',
    wordCount: '300-600 words',
    color: 'bg-purple-500',
    icon: '📧'
  },
  {
    id: 'google_business_profile',
    name: 'Google Business Profile',
    description: 'Local-focused content for GBP',
    wordCount: '100-200 words',
    color: 'bg-orange-500',
    icon: '📍'
  }
];

function TopicSelector({ selectedTopic, onSelectTopic }: {
  selectedTopic: SavedTopic | null;
  onSelectTopic: (topic: SavedTopic) => void;
}) {
  const { data: topics, error, isLoading } = useSWR<{ data: SavedTopic[] }>('/api/seo/saved-topics', fetcher);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Select a Topic
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading saved topics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !topics?.data || !Array.isArray(topics.data) || topics.data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Select a Topic
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Saved Topics</h3>
            <p className="text-gray-600 mb-4">You need to save some topics first before generating content.</p>
            <Button asChild>
              <Link href="/dashboard/seo-generator">
                <PenTool className="mr-2 h-4 w-4" />
                Generate Topics
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Select a Topic
        </CardTitle>
        <p className="text-sm text-muted-foreground">Choose a saved topic to generate content for</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {topics.data.map((topic) => (
            <div
              key={topic.id}
              className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                selectedTopic?.id === topic.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onSelectTopic(topic)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{topic.topic}</h4>
                  {topic.description && (
                    <p className="text-sm text-gray-600 mt-1">{topic.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {topic.tone && (
                      <Badge variant="secondary" className="text-xs">
                        Tone: {topic.tone}
                      </Badge>
                    )}
                    {topic.businessType && (
                      <Badge variant="outline" className="text-xs">
                        {topic.businessType}
                      </Badge>
                    )}
                    {topic.location && (
                      <Badge variant="outline" className="text-xs">
                        📍 {topic.location}
                      </Badge>
                    )}
                    {topic.tags && (
                      <div className="flex gap-1">
                        {(Array.isArray(topic.tags) ? topic.tags : JSON.parse(topic.tags)).slice(0, 3).map((tag: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ContentTypeSelector({ selectedType, onSelectType }: {
  selectedType: string | null;
  onSelectType: (type: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Content Type
        </CardTitle>
        <p className="text-sm text-muted-foreground">Choose the type of content you want to generate</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CONTENT_TYPES.map((type) => (
            <div
              key={type.id}
              className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                selectedType === type.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onSelectType(type.id)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${type.color} rounded-lg flex items-center justify-center text-white text-lg`}>
                  {type.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{type.name}</h4>
                  <p className="text-sm text-gray-600">{type.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{type.wordCount}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function GenerationControls({
  selectedTopic,
  selectedType,
  onGenerate,
  isGenerating
}: {
  selectedTopic: SavedTopic | null;
  selectedType: string | null;
  onGenerate: (variantCount: number) => void;
  isGenerating: boolean;
}) {
  const [variantCount, setVariantCount] = useState(1);

  if (!selectedTopic || !selectedType) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <PenTool className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p>Select a topic and content type to start generating</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Generate Content
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Number of Variants
            </label>
            <div className="flex gap-2">
              {[1, 2, 3].map((count) => (
                <Button
                  key={count}
                  variant={variantCount === count ? "default" : "outline"}
                  size="sm"
                  onClick={() => setVariantCount(count)}
                  className="flex-1"
                >
                  {count} 
                </Button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Free users can generate up to 3 variants per topic
            </p>
          </div>

          <Button
            onClick={() => onGenerate(variantCount)}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Content...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Content
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function GeneratedContentDisplay({ content, selectedTopic, onRetry }: {
  content: GeneratedContent[];
  selectedTopic: SavedTopic | null;
  onRetry: () => void;
}) {
  const [activeVariant, setActiveVariant] = useState(0);
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [savedStatus, setSavedStatus] = useState<Record<number, boolean>>({});
  const [savedContentIds, setSavedContentIds] = useState<Record<number, number | null>>({});

  if (!content.length) {
    return null;
  }

  const currentContent = content[activeVariant];

  // Check saved status when content changes
  useEffect(() => {
    content.forEach(async (item) => {
      const parsedData = parseContentData(item);
      const isSaved = await checkIfContentIsSaved(
        parsedData.title,
        parsedData.content,
        selectedTopic?.id,
        item.contentType
      );
      setSavedStatus(prev => ({ ...prev, [item.id]: isSaved.isSaved }));
      if (isSaved.savedContentId) {
        setSavedContentIds(prev => ({ ...prev, [item.id]: isSaved.savedContentId }));
      }
    });
  }, [content, selectedTopic]);

  // Additional safety check - if currentContent is undefined, return null
  if (!currentContent) {
    return null;
  }

  // Parse content if it's a JSON string
  const parseContentData = (content: GeneratedContent): ParsedContentData => {
    // Safety check for content parameter
    if (!content) {
      return {
        title: "Error: No Content Available",
        content: "⚠️ No content was provided for display. Please try generating content again.",
        targetKeywords: [],
        seoScore: 0,
        wordCount: 0,
        readingTime: 0,
        hasError: true
      };
    }

    let finalContent = content.content || '';
    let finalTitle = content.title || 'Generated Content';
    let finalKeywords = content.targetKeywords || [];
    let finalSeoScore = content.seoScore || 0;
    let finalWordCount = content.wordCount || 0;
    let finalReadingTime = content.readingTime || 0;

    // Try to parse as JSON first
    try {
      // Only try to parse if content.content exists and is a string
      if (finalContent && typeof finalContent === 'string') {
        const parsed = JSON.parse(finalContent);
        if (parsed.content && typeof parsed.content === 'string') {
        // We successfully parsed JSON and have content
        finalContent = parsed.content;
        finalTitle = parsed.title || content.title;
        finalKeywords = Array.isArray(parsed.targetKeywords) ? parsed.targetKeywords : content.targetKeywords;
        finalSeoScore = parsed.seoScore || content.seoScore;
        finalWordCount = parsed.wordCount || content.wordCount;
        finalReadingTime = parsed.readingTime || content.readingTime;
        }
      }
    } catch (e) {
      // JSON parsing failed, try to extract JSON from within the content
      try {
        // Only try regex matching if we have content to work with
        if (!finalContent || typeof finalContent !== 'string') {
          throw new Error('No content to parse');
        }

        // Handle malformed JSON by extracting just the content field
        // Look for "content": "..." pattern and extract the content between quotes
        const contentMatch = finalContent.match(/"content"\s*:\s*"((?:[^"\\]|\\.)*)"/);
        if (contentMatch) {
          // Extract content from the first match
          let extractedContent = contentMatch[1];

          // Unescape JSON escape sequences
          extractedContent = extractedContent
            .replace(/\\"/g, '"')
            .replace(/\\n/g, '\n')
            .replace(/\\t/g, '\t')
            .replace(/\\\\/g, '\\');

          finalContent = extractedContent;

          // Try to extract other fields
          const titleMatch = finalContent.match(/"title"\s*:\s*"((?:[^"\\]|\\.)*)"/);
          if (titleMatch) {
            finalTitle = titleMatch[1].replace(/\\"/g, '"');
          }

          const keywordsMatch = finalContent.match(/"targetKeywords"\s*:\s*(\[.*?\])/);
          if (keywordsMatch) {
            try {
              finalKeywords = JSON.parse(keywordsMatch[1]);
            } catch (e3) {
              // Keep original keywords if parsing fails
            }
          }

          const scoreMatch = finalContent.match(/"seoScore"\s*:\s*(\d+)/);
          if (scoreMatch) {
            finalSeoScore = parseInt(scoreMatch[1], 10);
          }
        } else {
          // Fallback: Look for complete JSON objects
          const jsonMatches = finalContent.match(/\{[\s\S]*?\}/g);
          if (jsonMatches) {
            for (const jsonMatch of jsonMatches) {
              try {
                const parsed = JSON.parse(jsonMatch);
                if (parsed.content && typeof parsed.content === 'string') {
                  finalContent = parsed.content;
                  finalTitle = parsed.title || content.title;
                  finalKeywords = Array.isArray(parsed.targetKeywords) ? parsed.targetKeywords : content.targetKeywords;
                  finalSeoScore = parsed.seoScore || content.seoScore;
                  finalWordCount = parsed.wordCount || content.wordCount;
                  finalReadingTime = parsed.readingTime || content.readingTime;
                  break; // Use the first valid JSON we find
                }
              } catch (e2) {
                // Continue to next JSON match
                continue;
              }
            }
          }
        }
      } catch (e2) {
        // JSON extraction also failed, use original content
      }
    }

    // Content cleaning and formatting
    let displayContent = finalContent;
    if (displayContent && typeof displayContent === 'string') {
      displayContent = displayContent
        .replace(/^["']+|["']+$/g, '') // Remove surrounding quotes
        .replace(/^[\s,:]+|[\s,:]+$/g, '') // Remove leading/trailing whitespace, commas, colons
        .replace(/\n\s*\n/g, '\n\n') // Normalize multiple newlines
        .replace(/\n\s*(#{1,6}\s)/g, '\n$1') // Ensure proper heading spacing
        .replace(/\n\s*([-*+]\s)/g, '\n$1') // Ensure proper list spacing
        .trim();

      // Replace common placeholder patterns with more generic text
      displayContent = displayContent
        .replace(/\[Name\]/g, 'Homeowner')
        .replace(/\[Your Plumbing & HVAC Business\]/g, 'your local plumbing expert')
        .replace(/\[Your Phone Number\]/g, '[Your Phone Number]')
        .replace(/\[Your Website\]/g, '[Your Website]')
        .replace(/\[Your Name\]/g, '[Your Name]');
    }

    // Calculate actual word count if not provided
    if (!finalWordCount && displayContent) {
      finalWordCount = displayContent.split(/\s+/).filter(word => word.length > 0).length;
    }

    // Calculate reading time if not provided (200 words per minute)
    if (!finalReadingTime && finalWordCount) {
      finalReadingTime = Math.ceil(finalWordCount / 200);
    }

    // Validate content quality
    if (!displayContent || displayContent.length < 20) {
      // Content is too short or empty, indicate generation issue
      displayContent = `⚠️ Content generation incomplete. The generated content appears to be empty or too short. Please try regenerating the content or contact support if the issue persists.`;

      // Reset other fields to indicate issue
      finalTitle = "⚠️ Content Generation Issue";
      finalSeoScore = 0;
      finalWordCount = 0;
      finalReadingTime = 0;
    }

    return {
      title: finalTitle,
      content: displayContent,
      targetKeywords: finalKeywords,
      seoScore: finalSeoScore,
      wordCount: finalWordCount,
      readingTime: finalReadingTime,
      hasError: displayContent.includes('⚠️ Content generation incomplete')
    };
  };

  const parsedContent = parseContentData(currentContent);

  
  const handleCopy = async (text: string, id: number, type: 'full' | 'title' | 'content' = 'full') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates(prev => ({ ...prev, [`${id}-${type}`]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [`${id}-${type}`]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  // Check if content is already saved
  const checkIfContentIsSaved = async (
    title: string,
    content: string,
    savedTopicId?: number,
    contentType?: string
  ) => {
    try {
      const response = await fetch('/api/seo/content/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          savedTopicId,
          contentType,
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error checking content status:', error);
      return { isSaved: false, savedContentId: null };
    }
  };

  const handleRemoveFromLibrary = async (contentId: number, originalContentId: number) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/seo/content?id=${contentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSavedStatus(prev => ({ ...prev, [originalContentId]: false }));
        setSavedContentIds(prev => ({ ...prev, [originalContentId]: null }));
        } else {
        console.error('Failed to remove content');
      }
    } catch (error) {
      console.error('Error removing content:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleSave = async (content: GeneratedContent) => {
    const isCurrentlySaved = savedStatus[content.id];
    const savedContentId = savedContentIds[content.id];

    if (isCurrentlySaved && savedContentId) {
      // Remove from library
      await handleRemoveFromLibrary(savedContentId, content.id);
    } else {
      // Save to library
      await handleSaveToLibrary(content);
    }
  };

  const handleSaveToLibrary = async (content: GeneratedContent) => {
    setIsSaving(true);
    try {
      const parsedData = parseContentData(content);
      const response = await fetch('/api/seo/content/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: parsedData.title,
          content: parsedData.content,
          targetKeywords: parsedData.targetKeywords,
          seoScore: parsedData.seoScore,
          wordCount: parsedData.wordCount,
          readingTime: parsedData.readingTime,
          contentType: content.contentType || 'blog_post', // Default content type if not set
          tone: content.tone || 'professional', // Default tone if not set
          savedTopicId: selectedTopic?.id,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSavedStatus(prev => ({ ...prev, [content.id]: true }));
        setSavedContentIds(prev => ({ ...prev, [content.id]: data.data.id }));
        } else if (data.isDuplicate) {
        // Already exists, update the state
        setSavedStatus(prev => ({ ...prev, [content.id]: true }));
        setSavedContentIds(prev => ({ ...prev, [content.id]: data.existingContentId }));
        } else {
        console.error('Failed to save content:', data.error);
      }
    } catch (error) {
      console.error('Error saving content:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = (content: GeneratedContent) => {
    const parsedData = parseContentData(content);
    const downloadContent = `Title: ${parsedData.title}\n\nSEO Score: ${parsedData.seoScore}/100\nWord Count: ${parsedData.wordCount}\nReading Time: ${parsedData.readingTime} minutes\nKeywords: ${parsedData.targetKeywords.join(', ')}\n\n---\n\n${parsedData.content}`;

    const element = document.createElement('a');
    const file = new Blob([downloadContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${parsedData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Generated Content
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Variant Selector */}
        {content.length > 1 && (
          <div className="flex gap-2 mb-6">
            {content.map((variant, index) => (
              <Button
                key={variant.id}
                variant={activeVariant === index ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveVariant(index)}
              >
                Variant {index + 1}
              </Button>
            ))}
          </div>
        )}

        {/* Content Display */}
        <div className="space-y-6">
          {/* Title Section */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-100">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-blue-600 uppercase tracking-wide">Title</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                  {parsedContent.title}
                </h2>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(parsedContent.title, currentContent.id, 'title')}
                  >
                    {copiedStates[`${currentContent.id}-title`] ? (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Title
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Metadata Section */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center">
                <Target className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">Content Metrics</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 text-blue-600 mb-1">
                  <FileText className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase">Words</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{parsedContent.wordCount}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 text-green-600 mb-1">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase">Read Time</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{parsedContent.readingTime}m</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 text-purple-600 mb-1">
                  <Target className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase">SEO Score</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{parsedContent.seoScore}/100</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 text-orange-600 mb-1">
                  <Hash className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase">Keywords</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{parsedContent.targetKeywords.length}</p>
              </div>
            </div>
          </div>

          {/* Keywords Section */}
          {parsedContent.targetKeywords.length > 0 && (
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Hash className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">Target Keywords</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {parsedContent.targetKeywords.map((keyword: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Content Section */}
          <div className={`p-8 rounded-xl border shadow-sm ${parsedContent.hasError ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${parsedContent.hasError ? 'bg-red-500' : 'bg-green-500'}`}>
                  {parsedContent.hasError ? (
                    <Target className="h-4 w-4 text-white" />
                  ) : (
                    <FileText className="h-4 w-4 text-white" />
                  )}
                </div>
                <span className="text-sm font-medium uppercase tracking-wide">
                  {parsedContent.hasError ? 'Generation Issue' : 'Content Body'}
                </span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {!parsedContent.hasError && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(parsedContent.content, currentContent.id, 'content')}
                    >
                      {copiedStates[`${currentContent.id}-content`] ? (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Content
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleSave(currentContent)}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          {savedStatus[currentContent.id] ? (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Remove from Library
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save to Library
                            </>
                          )}
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(currentContent)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download TXT
                    </Button>
                  </>
                )}
                {parsedContent.hasError && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onRetry}
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Retry Generation
                  </Button>
                )}
              </div>
            </div>
            <div className={`text-base leading-relaxed ${parsedContent.hasError ? 'text-red-800' : 'text-gray-800'}`}>
              {parsedContent.hasError ? (
                <div className="space-y-4">
                  <div className="bg-red-100 p-4 rounded-lg border border-red-200">
                    <h3 className="font-semibold text-red-900 mb-2">Content Generation Failed</h3>
                    <p className="text-red-800">{parsedContent.content}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">Troubleshooting Tips:</h4>
                    <ul className="list-disc list-inside text-blue-800 space-y-1">
                      <li>Try generating with a different content type</li>
                      <li>Check if your topic description is clear and specific</li>
                      <li>Ensure your selected topic has sufficient context</li>
                      <li>Contact support if the issue persists</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <MarkdownRenderer
                  content={parsedContent.content}
                  className="text-base leading-relaxed text-gray-800"
                />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ContentGeneratorPageContent() {
  const [selectedTopic, setSelectedTopic] = useState<SavedTopic | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const searchParams = useSearchParams();
  const topicIdParam = searchParams.get('topicId');

  const { data: topics } = useSWR<{ data: SavedTopic[] }>('/api/seo/saved-topics', fetcher);

  // Auto-select topic if coming from saved topics page
  useEffect(() => {
    if (topicIdParam && topics?.data && Array.isArray(topics.data) && !selectedTopic) {
      const topic = topics.data.find(t => t.id === parseInt(topicIdParam));
      if (topic) {
        setSelectedTopic(topic);
      }
    }
  }, [topicIdParam, topics, selectedTopic]);

  const handleGenerate = async (variantCount: number) => {
    if (!selectedTopic || !selectedType) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/seo/content/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          savedTopicId: selectedTopic.id,
          contentType: selectedType,
          variantCount,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedContent(data.data.variants);
      } else {
        console.error('Generation failed:', data.error);
      }
    } catch (error) {
      console.error('Error generating content:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const currentStep = selectedTopic ? (selectedType ? 3 : 2) : 1;
  const canGenerate = selectedTopic && selectedType && !isGenerating;

  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
              <PenTool className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              AI Content Generator
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Transform your saved topics into high-quality, personalized content with AI
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center max-w-2xl mx-auto">
            <div className="flex items-center">
              <div className={`flex flex-col items-center ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold mb-2 ${
                  currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  1
                </div>
                <span className="text-sm font-medium">Select Topic</span>
              </div>
              <div className={`w-16 h-1 mx-4 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
              <div className={`flex flex-col items-center ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold mb-2 ${
                  currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  2
                </div>
                <span className="text-sm font-medium">Choose Type</span>
              </div>
              <div className={`w-16 h-1 mx-4 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
              <div className={`flex flex-col items-center ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold mb-2 ${
                  currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  3
                </div>
                <span className="text-sm font-medium">Generate</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Topic & Type Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Topic Selection */}
            <div className={`transition-all duration-300 ${currentStep === 1 ? 'scale-105' : ''}`}>
              <TopicSelector
                selectedTopic={selectedTopic}
                onSelectTopic={setSelectedTopic}
              />
            </div>

            {/* Content Type Selection */}
            <div className={`transition-all duration-300 ${currentStep === 2 ? 'scale-105' : ''} ${!selectedTopic ? 'opacity-50' : ''}`}>
              <ContentTypeSelector
                selectedType={selectedType}
                onSelectType={setSelectedType}
              />
            </div>

            {/* Generated Content Display */}
            {generatedContent.length > 0 && (
              <div className="transition-all duration-500">
                <GeneratedContentDisplay
                  content={generatedContent}
                  selectedTopic={selectedTopic}
                  onRetry={() => handleGenerate(1)}
                />
              </div>
            )}
          </div>

          {/* Right Column - Generation Controls & Status */}
          <div className="space-y-6">
            {/* Generation Controls */}
            <div className={`sticky top-8 transition-all duration-300 ${currentStep === 3 ? 'scale-105' : ''}`}>
              <GenerationControls
                selectedTopic={selectedTopic}
                selectedType={selectedType}
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
              />
            </div>

            {/* Selected Topic Summary */}
            {selectedTopic && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="h-5 w-5" />
                    Selected Topic
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{selectedTopic.topic}</h4>
                      {selectedTopic.description && (
                        <p className="text-sm text-gray-600 mt-1">{selectedTopic.description}</p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedTopic.tone && (
                        <Badge variant="secondary" className="text-xs">
                          Tone: {selectedTopic.tone}
                        </Badge>
                      )}
                      {selectedTopic.businessType && (
                        <Badge variant="outline" className="text-xs">
                          {selectedTopic.businessType}
                        </Badge>
                      )}
                      {selectedTopic.location && (
                        <Badge variant="outline" className="text-xs">
                          📍 {selectedTopic.location}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Empty State (when no content generated yet) */}
            {!generatedContent.length && canGenerate && (
              <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                <CardContent className="p-6">
                  <div className="text-center">
                    <Sparkles className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Ready to Generate!
                    </h3>
                    <p className="text-sm text-gray-700">
                      Your topic and content type are selected. Click generate to create amazing content!
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ContentGeneratorPage() {
  return (
    <Suspense fallback={
      <section className="flex-1 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-16">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading Content Generator...</p>
          </div>
        </div>
      </section>
    }>
      <ContentGeneratorPageContent />
    </Suspense>
  );
}
