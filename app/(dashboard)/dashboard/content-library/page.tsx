'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import {
  ArrowLeft,
  FileText,
  Search,
  Filter,
  Eye,
  Download,
  Copy,
  Trash2,
  Calendar,
  Clock,
  Target,
  Hash,
  PenTool,
  Loader2,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';
import useSWR from 'swr';

const fetcher = async (url: string) => {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error('📚 [FETCH] API request failed:', {
        url,
        status: response.status,
        statusText: response.statusText
      });
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
      console.error('📚 [FETCH] API returned error:', {
        url,
        error: data.error
      });
      throw new Error(data.error || 'API request failed');
    }

    console.log('📚 [FETCH] Successfully fetched data:', {
      url,
      itemCount: data.data?.length || 0
    });

    return data;
  } catch (error) {
    console.error('📚 [FETCH] Network or parsing error:', {
      url,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
};

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
  status: string;
  createdAt: string;
  updatedAt: string;
  savedTopic?: {
    topic: string;
    tags: string[];
    businessType: string;
    targetAudience: string;
    location: string;
  };
}

const CONTENT_TYPE_CONFIG = {
  blog_post: { name: 'Blog Post', color: 'bg-blue-100 text-blue-800', icon: '📝' },
  social_media: { name: 'Social Media', color: 'bg-pink-100 text-pink-800', icon: '📱' },
  website_page: { name: 'Website Page', color: 'bg-green-100 text-green-800', icon: '🌐' },
  email: { name: 'Email', color: 'bg-purple-100 text-purple-800', icon: '📧' },
  google_business_profile: { name: 'GBP Post', color: 'bg-orange-100 text-orange-800', icon: '📍' }
};

const STATUS_CONFIG = {
  draft: { name: 'Draft', color: 'bg-gray-100 text-gray-800' },
  published: { name: 'Published', color: 'bg-green-100 text-green-800' },
  archived: { name: 'Archived', color: 'bg-red-100 text-red-800' }
};

function ContentCard({ content, onDelete, onView }: {
  content: GeneratedContent;
  onDelete: (id: number) => void;
  onView: (content: GeneratedContent) => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Parse content to remove JSON artifacts
  const parseContentData = (content: GeneratedContent) => {
    const cleanJsonArtifacts = (text: string): string => {
      if (!text || typeof text !== 'string') return '';

      let cleaned = text
        // Remove JSON objects more carefully
        .replace(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g, '')
        .replace(/\{[\s\S]*?\}/g, '')
        // Remove specific JSON fields and metadata
        .replace(/Target Keywords:\s*[^,\n]*,?\s*/gi, '')
        .replace(/SEO Score:\s*\d+/gi, '')
        .replace(/Word Count:\s*\d+/gi, '')
        .replace(/SEO Keywords:\s*[^,\n]*,?\s*/gi, '')
        .replace(/"targetKeywords":\s*\[[^\]]*\]/gi, '')
        .replace(/"seoScore":\s*\d+/gi, '')
        .replace(/"wordCount":\s*\d+/gi, '')
        .replace(/"title":\s*"[^"]*"/gi, '')
        .replace(/"content":\s*"[^"]*"/gi, '')
        .replace(/"[^"]*":\s*(?:"[^"]*"|\d+|true|false|null|\[[^\]]*\])/gi, '')
        // Clean up artifacts but preserve markdown formatting
        .replace(/^[\s,":]+/, '')
        .replace(/[\s,":]+$/, '')
        .replace(/^\s+|\s+$/g, '')
        // Normalize whitespace but preserve newlines for markdown
        .replace(/[ \t]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n') // Normalize multiple newlines to double newlines
        .trim();

      // Remove surrounding quotes if present
      if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
        cleaned = cleaned.slice(1, -1).trim();
      }
      if (cleaned.match(/^[\s,:"]+/)) {
        cleaned = cleaned.replace(/^[\s,:"]+/, '').trim();
      }

      return cleaned;
    };

    let finalContent = content.content;

    try {
      const parsed = JSON.parse(content.content);
      if (parsed.content && typeof parsed.content === 'string') {
        finalContent = parsed.content;
      }
    } catch (e) {
      try {
        const jsonMatches = content.content.match(/\{[\s\S]*?\}/g);
        if (jsonMatches) {
          for (const jsonMatch of jsonMatches) {
            try {
              const parsed = JSON.parse(jsonMatch);
              if (parsed.content && typeof parsed.content === 'string') {
                finalContent = parsed.content;
                break;
              }
            } catch (e2) {
              continue;
            }
          }
        }
      } catch (e2) {
        // Use original content
      }
    }

    const cleanedContent = cleanJsonArtifacts(finalContent);
    let displayContent = cleanedContent;

    if (!displayContent || displayContent.length < 10) {
      displayContent = cleanJsonArtifacts(content.content);
    }

    if (!displayContent || displayContent.length < 10) {
      displayContent = content.content || 'Content generation in progress...';
    }

    return displayContent;
  };

  const cleanContent = parseContentData(content);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      console.log('🗑️ [FRONTEND] Starting deletion of content:', content.id);

      const response = await fetch(`/api/seo/content?id=${content.id}`, {
        method: 'DELETE',
      });

      console.log('🗑️ [FRONTEND] Delete response status:', response.status);

      const result = await response.json();
      console.log('🗑️ [FRONTEND] Delete response data:', result);

      if (response.ok && result.success) {
        console.log('🗑️ [FRONTEND] Delete successful, calling onDelete callback');
        onDelete(content.id);

        // Close the delete dialog
        setShowDeleteDialog(false);
      } else {
        console.error('🗑️ [FRONTEND] Delete failed:', result.error);
        // Show error to user
        alert(`Failed to delete content: ${result.error || 'Unknown error'}`);

        // Revalidate to ensure UI is in sync with server
        window.location.reload();
      }
    } catch (error) {
      console.error('🗑️ [FRONTEND] Network error during deletion:', error);
      alert('Network error occurred while deleting content. Please try again.');

      // Revalidate to ensure UI is in sync with server
      window.location.reload();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cleanContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying content:', error);
    }
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([cleanContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${content.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const contentTypeConfig = CONTENT_TYPE_CONFIG[content.contentType as keyof typeof CONTENT_TYPE_CONFIG];
  const statusConfig = STATUS_CONFIG[content.status as keyof typeof STATUS_CONFIG];

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{contentTypeConfig.icon}</span>
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{content.title}</h3>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge className={`text-xs ${contentTypeConfig.color}`}>
                {contentTypeConfig.name}
              </Badge>
              <Badge className={`text-xs ${statusConfig.color}`}>
                {statusConfig.name}
              </Badge>
              {content.tone && (
                <Badge variant="secondary" className="text-xs">
                  {content.tone}
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                Variant {content.variantNumber}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            disabled={isDeleting}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Content Preview */}
          <div className="text-sm text-gray-600 line-clamp-3">
            {cleanContent.substring(0, 150)}...
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="flex items-center gap-1 text-gray-600">
              <FileText className="h-3 w-3" />
              <span>{content.wordCount} words</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <Clock className="h-3 w-3" />
              <span>{content.readingTime} min</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <Target className="h-3 w-3" />
              <span>SEO: {content.seoScore}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <Hash className="h-3 w-3" />
              <span>{content.targetKeywords.length} keywords</span>
            </div>
          </div>

          {/* Keywords */}
          {content.targetKeywords.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {content.targetKeywords.slice(0, 3).map((keyword, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {keyword}
                </Badge>
              ))}
              {content.targetKeywords.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{content.targetKeywords.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Topic Info */}
          {content.savedTopic && (
            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
              <strong>Topic:</strong> {content.savedTopic.topic}
              {content.savedTopic.businessType && (
                <span> • {content.savedTopic.businessType}</span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Calendar className="h-3 w-3" />
              {new Date(content.createdAt).toLocaleDateString()}
            </div>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onView(content)}
              >
                <Eye className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
              >
                {copied ? (
                  <Copy className="h-3 w-3 text-green-600" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
              >
                <Download className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Content"
        description="Are you sure you want to delete this content? This action cannot be undone."
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
  selectedType,
  onTypeChange,
  selectedStatus,
  onStatusChange
}: {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Filter className="h-5 w-5" />
          Filter Content
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Search Content
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search titles, content, or keywords..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>

          {/* Content Type */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Content Type
            </label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedType === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => onTypeChange("all")}
                className="text-xs"
              >
                All
              </Button>
              {Object.entries(CONTENT_TYPE_CONFIG).map(([type, config]) => (
                <Button
                  key={type}
                  variant={selectedType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => onTypeChange(type)}
                  className="text-xs"
                >
                  <span className="mr-1">{config.icon}</span>
                  {config.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedStatus === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => onStatusChange("all")}
                className="text-xs"
              >
                All
              </Button>
              {Object.keys(STATUS_CONFIG).map((status) => (
                <Button
                  key={status}
                  variant={selectedStatus === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => onStatusChange(status)}
                  className="text-xs capitalize"
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ContentModal({ content, isOpen, onClose }: {
  content: GeneratedContent | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !content) return null;

  // Parse content to remove JSON artifacts
  const parseContentData = (content: GeneratedContent) => {
    const cleanJsonArtifacts = (text: string): string => {
      if (!text || typeof text !== 'string') return '';

      let cleaned = text
        // Remove JSON objects more carefully
        .replace(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g, '')
        .replace(/\{[\s\S]*?\}/g, '')
        // Remove specific JSON fields and metadata
        .replace(/Target Keywords:\s*[^,\n]*,?\s*/gi, '')
        .replace(/SEO Score:\s*\d+/gi, '')
        .replace(/Word Count:\s*\d+/gi, '')
        .replace(/SEO Keywords:\s*[^,\n]*,?\s*/gi, '')
        .replace(/"targetKeywords":\s*\[[^\]]*\]/gi, '')
        .replace(/"seoScore":\s*\d+/gi, '')
        .replace(/"wordCount":\s*\d+/gi, '')
        .replace(/"title":\s*"[^"]*"/gi, '')
        .replace(/"content":\s*"[^"]*"/gi, '')
        .replace(/"[^"]*":\s*(?:"[^"]*"|\d+|true|false|null|\[[^\]]*\])/gi, '')
        // Clean up artifacts but preserve markdown formatting
        .replace(/^[\s,":]+/, '')
        .replace(/[\s,":]+$/, '')
        .replace(/^\s+|\s+$/g, '')
        // Normalize whitespace but preserve newlines for markdown
        .replace(/[ \t]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n') // Normalize multiple newlines to double newlines
        .trim();

      // Remove surrounding quotes if present
      if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
        cleaned = cleaned.slice(1, -1).trim();
      }
      if (cleaned.match(/^[\s,:"]+/)) {
        cleaned = cleaned.replace(/^[\s,:"]+/, '').trim();
      }

      return cleaned;
    };

    let finalContent = content.content;

    try {
      const parsed = JSON.parse(content.content);
      if (parsed.content && typeof parsed.content === 'string') {
        finalContent = parsed.content;
      }
    } catch (e) {
      try {
        const jsonMatches = content.content.match(/\{[\s\S]*?\}/g);
        if (jsonMatches) {
          for (const jsonMatch of jsonMatches) {
            try {
              const parsed = JSON.parse(jsonMatch);
              if (parsed.content && typeof parsed.content === 'string') {
                finalContent = parsed.content;
                break;
              }
            } catch (e2) {
              continue;
            }
          }
        }
      } catch (e2) {
        // Use original content
      }
    }

    const cleanedContent = cleanJsonArtifacts(finalContent);
    let displayContent = cleanedContent;

    if (!displayContent || displayContent.length < 10) {
      displayContent = cleanJsonArtifacts(content.content);
    }

    if (!displayContent || displayContent.length < 10) {
      displayContent = content.content || 'Content generation in progress...';
    }

    return displayContent;
  };

  const cleanContent = parseContentData(content);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cleanContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying content:', error);
    }
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([cleanContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${content.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const contentTypeConfig = CONTENT_TYPE_CONFIG[content.contentType as keyof typeof CONTENT_TYPE_CONFIG];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{content.title}</h2>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={contentTypeConfig.color}>
                  {contentTypeConfig.icon} {contentTypeConfig.name}
                </Badge>
                <Badge variant="secondary">
                  Variant {content.variantNumber}
                </Badge>
                <Badge variant="outline">
                  Tone: {content.tone}
                </Badge>
              </div>
            </div>
            <Button variant="ghost" onClick={onClose}>
              ×
            </Button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="mb-4">
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Words:</span> {content.wordCount}
              </div>
              <div>
                <span className="font-medium">Reading Time:</span> {content.readingTime} min
              </div>
              <div>
                <span className="font-medium">SEO Score:</span> {content.seoScore}/100
              </div>
              <div>
                <span className="font-medium">Created:</span> {new Date(content.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {content.targetKeywords.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium mb-2">Target Keywords:</h4>
              <div className="flex flex-wrap gap-2">
                {content.targetKeywords.map((keyword, index) => (
                  <Badge key={index} variant="outline">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-lg">
            <MarkdownRenderer
              content={cleanContent}
              className="text-sm leading-relaxed"
            />
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50">
          <div className="flex gap-2">
            <Button onClick={handleCopy}>
              {copied ? (
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
            <Button variant="outline" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContentLibraryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedContent, setSelectedContent] = useState<GeneratedContent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: content, error, isLoading, mutate } = useSWR<{ data: GeneratedContent[] }>('/api/seo/content', fetcher);

  const handleDelete = async (deletedId: number) => {
    // Optimistically update the UI first
    mutate(
      (currentData: { data: GeneratedContent[] } | undefined) => {
        if (!currentData) return currentData;
        return {
          ...currentData,
          data: currentData.data.filter(item => item.id !== deletedId)
        };
      },
      false // Don't revalidate yet, wait for successful deletion
    );

    // After successful deletion, trigger a revalidation to ensure consistency
    try {
      await mutate();
    } catch (error) {
      console.error('Failed to revalidate content cache after deletion:', error);
      // Even if revalidation fails, the optimistic update should keep the UI in sync
    }
  };

  const handleView = (contentItem: GeneratedContent) => {
    setSelectedContent(contentItem);
    setIsModalOpen(true);
  };

  const filteredContent = content?.data?.filter(item => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const title = item.title.toLowerCase();
      const contentText = item.content.toLowerCase();
      const keywords = item.targetKeywords.join(' ').toLowerCase();

      if (!title.includes(query) && !contentText.includes(query) && !keywords.includes(query)) {
        return false;
      }
    }

    if (selectedType !== 'all' && item.contentType !== selectedType) {
      return false;
    }

    if (selectedStatus !== 'all' && item.status !== selectedStatus) {
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
                <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Content</h3>
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
                Content Library
              </h1>
              <p className="text-lg text-muted-foreground">
                Manage and organize your AI-generated content
              </p>
            </div>
            <Button asChild>
              <Link href="/dashboard/content-generator">
                <PenTool className="mr-2 h-4 w-4" />
                Generate New Content
              </Link>
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading content...</span>
          </div>
        ) : content?.data?.length === 0 ? (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Content Generated Yet</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Start by generating some AI-powered content from your saved topics.
                </p>
                <Button size="lg" asChild>
                  <Link href="/dashboard/content-generator">
                    <PenTool className="mr-2 h-5 w-5" />
                    Generate Your First Content
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Filters Section - Top */}
            <div className="w-full">
              <FilterControls
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedType={selectedType}
                onTypeChange={setSelectedType}
                selectedStatus={selectedStatus}
                onStatusChange={setSelectedStatus}
              />
            </div>

            {/* Content Section - Below */}
            <div className="w-full">
              {filteredContent.length === 0 ? (
                <Card>
                  <CardContent className="p-6 md:p-12">
                    <div className="text-center">
                      <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Content Found</h3>
                      <p className="text-gray-600">
                        Try adjusting your filters or search terms.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredContent.map((item) => (
                    <ContentCard
                      key={item.id}
                      content={item}
                      onDelete={handleDelete}
                      onView={handleView}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <ContentModal
          content={selectedContent}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </section>
  );
}