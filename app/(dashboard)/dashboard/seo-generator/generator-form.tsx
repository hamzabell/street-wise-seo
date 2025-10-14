'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { type DetailedLocation } from '@/lib/seo/location-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LocationAutocomplete } from '@/components/ui/location-autocomplete';
import { Loader2, Wand2, Sparkles, Settings, ChevronDown, TrendingUp, Globe, MessageCircle, Building, Target, Info, RefreshCw, Clock, CheckCircle, Languages, Users, MapPin } from 'lucide-react';
import { INDUSTRY_TEMPLATES } from '@/lib/seo/industry-templates';
import { IndustryIcon, getIndustryIcon } from '@/components/ui/industry-icons';

const TopicGenerationSchema = z.object({
  topic: z.string().min(3, 'Topic must be at least 3 characters long'),
  businessType: z.string().min(2, 'Business type must be at least 2 characters long'),
  industryId: z.string().min(1, 'Please select your industry'),
  targetAudience: z.string().min(2, 'Target audience is required'),
  location: z.string().optional(),
  competitorUrl: z.string().url('Invalid competitor URL').optional().or(z.literal('')),
  // Enhanced personalization fields
  tone: z.string().min(1, 'Please select a tone').default('professional'),
  additionalContext: z.string().optional(),
  // Cultural and language options
  languagePreference: z.enum(['english', 'native', 'cultural_english']).default('english'),
  formalityLevel: z.enum(['formal', 'professional', 'casual', 'slang_heavy']).default('professional'),
  contentPurpose: z.enum(['marketing', 'educational', 'conversational', 'technical']).default('marketing'),
});

type TopicGenerationForm = z.infer<typeof TopicGenerationSchema>;

interface GeneratorFormProps {
  onSubmit: (data: TopicGenerationForm & { websiteUrl: string; forceRecrawl?: boolean; detailedLocation?: DetailedLocation }) => Promise<void>;
  isGenerating: boolean;
  usageStats?: {
    daily: { remaining: number; limit: number };
    monthly: { remaining: number; limit: number };
  };
}

const targetAudienceSuggestions = [
  'Local customers',
  'Small businesses',
  'Young professionals',
  'Parents',
  'Students',
  'Seniors',
  'B2B clients',
  'High-income earners',
  'Tech enthusiasts',
  'Health-conscious individuals',
];


const toneOptions = [
  {
    value: 'professional',
    label: 'Professional',
    description: 'Formal, expert tone with industry terminology',
    example: 'Our comprehensive analysis reveals key insights into...',
    icon: Building,
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  {
    value: 'casual',
    label: 'Casual',
    description: 'Relaxed, conversational tone that feels approachable',
    example: "Let's talk about what's working and what isn't...",
    icon: MessageCircle,
    color: 'bg-green-100 text-green-800 border-green-200'
  },
  {
    value: 'friendly',
    label: 'Friendly',
    description: 'Warm, welcoming tone that builds trust',
    example: "We're here to help you every step of the way...",
    icon: Sparkles,
    color: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  {
    value: 'authoritative',
    label: 'Authoritative',
    description: 'Confident, expert tone that establishes credibility',
    example: 'Based on extensive research and industry expertise...',
    icon: Target,
    color: 'bg-red-100 text-red-800 border-red-200'
  },
  {
    value: 'conversational',
    label: 'Conversational',
    description: 'Engaging, two-way tone that encourages interaction',
    example: "Have you ever wondered how to...? Let's dive in...",
    icon: MessageCircle,
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  },
  {
    value: 'humorous',
    label: 'Humorous',
    description: 'Light-hearted tone with appropriate humor',
    example: 'Let\'s face it - tackling this can feel like herding cats...',
    icon: Sparkles,
    color: 'bg-orange-100 text-orange-800 border-orange-200'
  },
  {
    value: 'inspirational',
    label: 'Inspirational',
    description: 'Motivating tone that encourages action',
    example: 'Transform your business with these powerful strategies...',
    icon: Sparkles,
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200'
  }
];

const languagePreferenceOptions = [
  {
    value: 'english',
    label: 'Standard English',
    description: 'Professional English with cultural awareness',
    example: 'Generate content in standard English while respecting local cultural context',
    icon: Globe,
    color: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  {
    value: 'cultural_english',
    label: 'Cultural English',
    description: 'English with local slang and expressions',
    example: 'Mix English with Nigerian Pidgin, Indian English, or other local expressions',
    icon: MessageCircle,
    color: 'bg-green-50 text-green-700 border-green-200'
  },
  {
    value: 'native',
    label: 'Native Language',
    description: 'Content in the local language of your region',
    example: 'Generate content in Hindi, Spanish, or other local languages',
    icon: Sparkles,
    color: 'bg-purple-50 text-purple-700 border-purple-200'
  }
];

const formalityLevelOptions = [
  {
    value: 'formal',
    label: 'Formal',
    description: 'Professional, respectful language for business contexts',
    example: 'We hereby present our comprehensive analysis for your consideration.',
    icon: Building,
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  {
    value: 'professional',
    label: 'Professional',
    description: 'Business-appropriate language that\'s approachable',
    example: 'Let\'s explore how our services can benefit your business goals.',
    icon: Target,
    color: 'bg-green-100 text-green-800 border-green-200'
  },
  {
    value: 'casual',
    label: 'Casual',
    description: 'Relaxed, friendly tone for building rapport',
    example: 'Hey there! We\'ve got some great ideas that might work for you.',
    icon: MessageCircle,
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  },
  {
    value: 'slang_heavy',
    label: 'Local Slang',
    description: 'Authentic local expressions and casual language',
    example: 'Abeg, check out these wicked ideas for your business!',
    icon: Sparkles,
    color: 'bg-orange-100 text-orange-800 border-orange-200'
  }
];

const contentPurposeOptions = [
  {
    value: 'marketing',
    label: 'Marketing',
    description: 'Persuasive content to attract and convert customers',
    example: 'Promotional content that highlights benefits and drives action',
    icon: TrendingUp,
    color: 'bg-red-50 text-red-700 border-red-200'
  },
  {
    value: 'educational',
    label: 'Educational',
    description: 'Informative content that teaches and explains',
    example: 'Helpful content that answers questions and provides value',
    icon: Sparkles,
    color: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  {
    value: 'conversational',
    label: 'Conversational',
    description: 'Engaging content that encourages interaction',
    example: 'Interactive content that feels like a conversation',
    icon: MessageCircle,
    color: 'bg-green-50 text-green-700 border-green-200'
  },
  {
    value: 'technical',
    label: 'Technical',
    description: 'Detailed content for expert audiences',
    example: 'In-depth content with technical details and specifications',
    icon: Settings,
    color: 'bg-purple-50 text-purple-700 border-purple-200'
  }
];

export function GeneratorForm({ onSubmit, isGenerating, usageStats }: GeneratorFormProps) {
  const [showSuggestions, setShowSuggestions] = useState({
    targetAudience: false,
  });
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [isCrawling, setIsCrawling] = useState(false);
  const [websiteAnalysis, setWebsiteAnalysis] = useState<any>(null);
  const [primaryWebsiteUrl, setPrimaryWebsiteUrl] = useState('');
  const [isLoadingWebsite, setIsLoadingWebsite] = useState(true);
  const [websiteCacheStatus, setWebsiteCacheStatus] = useState<{
    recentlyCrawled: boolean;
    lastCrawledAt: string | null;
    daysSinceCrawl: number | null;
  } | null>(null);
  const [isCheckingCache, setIsCheckingCache] = useState(false);
  const [forceRecrawl, setForceRecrawl] = useState(false);
  const [detailedLocation, setDetailedLocation] = useState<DetailedLocation | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<TopicGenerationForm>({
    resolver: zodResolver(TopicGenerationSchema),
    mode: 'onChange',
    defaultValues: {
      tone: 'professional'
    }
  });

  const watchedFields = watch();

  // Fetch primary website URL on component mount
  useEffect(() => {
    fetchPrimaryWebsiteUrl();
  }, []);

  // Check cache status when primary website URL is available
  useEffect(() => {
    if (primaryWebsiteUrl) {
      checkWebsiteCacheStatus();
    }
  }, [primaryWebsiteUrl]);

  const fetchPrimaryWebsiteUrl = async () => {
    try {
      const response = await fetch('/api/user/website');
      if (response.ok) {
        const data = await response.json();
        const url = data.data?.primaryWebsiteUrl || '';
        setPrimaryWebsiteUrl(url);
      }
    } catch (error) {
      console.error('Error fetching primary website URL:', error);
    } finally {
      setIsLoadingWebsite(false);
    }
  };

  const checkWebsiteCacheStatus = async () => {
    if (!primaryWebsiteUrl) return;

    setIsCheckingCache(true);
    try {
      const response = await fetch('/api/seo/crawl/cache-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: primaryWebsiteUrl,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setWebsiteCacheStatus(data.data);
      } else {
        console.error('Failed to check cache status:', await response.text());
      }
    } catch (error) {
      console.error('Error checking cache status:', error);
    } finally {
      setIsCheckingCache(false);
    }
  };

  const handleSuggestionClick = (field: keyof TopicGenerationForm, value: string) => {
    setValue(field, value);
    setShowSuggestions(prev => ({ ...prev, [field]: false }));
  };

  const handleFormSubmit = async (data: TopicGenerationForm) => {
    // Include the primary website URL, force recrawl flag, and detailed location data in the submission
    await onSubmit({
      ...data,
      websiteUrl: primaryWebsiteUrl,
      forceRecrawl: forceRecrawl,
      detailedLocation: detailedLocation || undefined
    });

    // Reset force recrawl flag after submission
    setForceRecrawl(false);
  };

  const handleForceRecrawl = () => {
    setForceRecrawl(true);
  };

  const isNearLimit = usageStats?.daily.remaining !== undefined && usageStats.daily.limit > 0
    ? (usageStats.daily.remaining / usageStats.daily.limit) <= 0.2
    : false;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Wand2 className="h-6 w-6 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">Generate Content Ideas</CardTitle>
        <CardDescription>
          Get AI-powered content ideas that customers actually search for
        </CardDescription>

        {/* Quick Start Templates */}
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-3">Quick Start:</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              type="button"
              onClick={() => {
                setValue('industryId', 'plumbing-hvac');
                setValue('topic', 'emergency plumbing services');
                setValue('businessType', 'plumbing service');
                setValue('targetAudience', 'local homeowners');
                setValue('tone', 'professional');
                setValue('additionalContext', 'Focus on emergency response times, 24/7 availability, and licensed insured services');
              }}
              className="px-4 py-3 bg-blue-100 text-blue-800 rounded-xl text-sm font-medium hover:bg-blue-200 transition-all touch-manipulation active:scale-[0.95] hover:shadow-md border-2 border-blue-200"
              disabled={isGenerating}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg">🔧</span>
                <span>Plumber</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => {
                setValue('industryId', 'electrical-services');
                setValue('topic', 'residential electrical repairs');
                setValue('businessType', 'electrical contractor');
                setValue('targetAudience', 'homeowners and businesses');
                setValue('tone', 'authoritative');
                setValue('additionalContext', 'Emphasize safety, licensing, insurance, and professional expertise');
              }}
              className="px-4 py-3 bg-yellow-100 text-yellow-800 rounded-xl text-sm font-medium hover:bg-yellow-200 transition-all touch-manipulation active:scale-[0.95] hover:shadow-md border-2 border-yellow-200"
              disabled={isGenerating}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg">⚡</span>
                <span>Electrician</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => {
                setValue('industryId', 'cleaning-services');
                setValue('topic', 'professional house cleaning');
                setValue('businessType', 'cleaning service');
                setValue('targetAudience', 'busy professionals and families');
                setValue('tone', 'friendly');
                setValue('additionalContext', 'Focus on trustworthiness, eco-friendly products, and customizable cleaning plans');
              }}
              className="px-4 py-3 bg-green-100 text-green-800 rounded-xl text-sm font-medium hover:bg-green-200 transition-all touch-manipulation active:scale-[0.95] hover:shadow-md border-2 border-green-200"
              disabled={isGenerating}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg">🧹</span>
                <span>Cleaning</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => {
                setValue('industryId', 'home-repair');
                setValue('topic', 'home repair and maintenance');
                setValue('businessType', 'handyman service');
                setValue('targetAudience', 'homeowners');
                setValue('tone', 'casual');
                setValue('additionalContext', 'Highlight versatility, fair pricing, and ability to handle multiple types of repairs');
              }}
              className="px-4 py-3 bg-gray-100 text-gray-800 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all touch-manipulation active:scale-[0.95] hover:shadow-md border-2 border-gray-200"
              disabled={isGenerating}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg">🔨</span>
                <span>Handyman</span>
              </div>
            </button>
          </div>
        </div>

        {usageStats && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${
            isNearLimit
              ? 'bg-orange-50 text-orange-800 border border-orange-200'
              : 'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-medium">
                {isNearLimit ? '⚠️ Running low on generations' : '✨ Generations available'}
              </span>
              <span className="font-mono">
                {usageStats.daily.remaining}/{usageStats.daily.limit} today
              </span>
            </div>
            <div className="mt-1 text-xs opacity-75">
              {usageStats.monthly.remaining} remaining this month
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Main Topic Input */}
          <div className="space-y-2">
            <Label htmlFor="topic" className="text-base font-medium flex items-center gap-1">
              What's your main topic or keyword?
              <span className="text-red-500 text-sm">*</span>
            </Label>
            <div className="relative">
              <Input
                id="topic"
                placeholder="e.g., 'digital marketing for restaurants'"
                {...register('topic')}
                className="text-base h-12 sm:h-11 pr-10 touch-manipulation active:scale-[0.99] transition-transform"
                disabled={isGenerating}
                autoComplete="off"
                autoCapitalize="sentences"
                spellCheck="false"
              />
              <Sparkles className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            {errors.topic && (
              <p className="text-sm text-destructive">{errors.topic.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Enter the primary topic you want to create content about <span className="text-red-500 font-medium">(required)</span>
            </p>
          </div>

          {/* Business Type Input */}
          <div className="space-y-2">
            <Label htmlFor="businessType" className="text-base font-medium flex items-center gap-1">
              What type of business are you creating content for?
              <span className="text-red-500 text-sm">*</span>
            </Label>
            <Input
              id="businessType"
              placeholder="e.g., 'plumbing service', 'digital marketing agency', 'restaurant'"
              {...register('businessType')}
              className="text-base h-12 sm:h-11 touch-manipulation active:scale-[0.99] transition-transform"
              disabled={isGenerating}
              autoComplete="off"
              autoCapitalize="words"
            />
            {errors.businessType && (
              <p className="text-sm text-destructive">{errors.businessType.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Describe your business type to generate more relevant content ideas <span className="text-red-500 font-medium">(required)</span>
            </p>
          </div>

          {/* Industry Selection Grid */}
          <div className="space-y-2">
            <Label htmlFor="industryId" className="text-base font-medium flex items-center gap-1">
              What type of service business?
              <span className="text-red-500 text-sm">*</span>
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {INDUSTRY_TEMPLATES.map((template) => {
                const isSelected = watchedFields.industryId === template.id;
                const industryData = getIndustryIcon(template.id);

                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => setValue('industryId', template.id)}
                    className={`p-4 rounded-xl border-2 transition-all touch-manipulation active:scale-[0.96] hover:shadow-lg ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-sm ring-2 ring-primary/20'
                        : 'border-border hover:border-primary/50 bg-background hover:bg-gray-50'
                    }`}
                    disabled={isGenerating}
                  >
                    <div className="flex flex-col items-center gap-3 text-center">
                      <div className={`${industryData.bgColor} ${industryData.color} w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold shadow-sm`}>
                        {industryData.icon}
                      </div>
                      <div className="min-w-0">
                        <div className={`text-xs sm:text-sm font-medium leading-tight ${
                          isSelected ? 'text-primary' : 'text-gray-700'
                        }`}>
                          {template.name}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {template.category}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            {errors.industryId && (
              <p className="text-sm text-destructive">{errors.industryId.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Select your industry to get specialized content ideas <span className="text-red-500 font-medium">(required)</span>
            </p>

            {/* Hidden input to store industryId for form validation */}
            <input type="hidden" {...register('industryId')} />
          </div>

          {/* Target Audience Input */}
          <div className="space-y-2">
            <Label htmlFor="targetAudience" className="text-base font-medium flex items-center gap-1">
              Who are you targeting?
              <span className="text-red-500 text-sm">*</span>
            </Label>
            <div className="relative">
              <Input
                id="targetAudience"
                placeholder="e.g., Local customers, Small businesses, Young professionals *"
                {...register('targetAudience')}
                className="text-base h-12 sm:h-11 touch-manipulation active:scale-[0.99] transition-transform"
                disabled={isGenerating}
                onFocus={() => setShowSuggestions(prev => ({ ...prev, targetAudience: true }))}
                onBlur={() => setTimeout(() => setShowSuggestions(prev => ({ ...prev, targetAudience: false })), 200)}
                autoComplete="off"
              />
              {showSuggestions.targetAudience && watchedFields.targetAudience && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-border rounded-md shadow-lg max-h-40 overflow-y-auto">
                  {targetAudienceSuggestions
                    .filter(suggestion =>
                      suggestion.toLowerCase().includes(watchedFields.targetAudience.toLowerCase())
                    )
                    .slice(0, 5)
                    .map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        className="w-full text-left px-3 py-3 text-sm hover:bg-muted transition-colors touch-manipulation active:scale-[0.98]"
                        onClick={() => handleSuggestionClick('targetAudience', suggestion)}
                      >
                        {suggestion}
                      </button>
                    ))}
                </div>
              )}
            </div>
            {errors.targetAudience && (
              <p className="text-sm text-destructive">{errors.targetAudience.message}</p>
            )}
          </div>

          {/* Tone Selection */}
          <div className="space-y-2">
            <Label className="text-base font-medium flex items-center gap-1">
              What tone should your content have?
              <span className="text-red-500 text-sm">*</span>
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {toneOptions.map((toneOption) => {
                const isSelected = watchedFields.tone === toneOption.value;
                const Icon = toneOption.icon;

                return (
                  <button
                    key={toneOption.value}
                    type="button"
                    onClick={() => {
                      setValue('tone', toneOption.value, { shouldValidate: true });
                    }}
                    className={`p-3 rounded-lg border-2 transition-all touch-manipulation active:scale-[0.96] hover:shadow-md ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-sm ring-2 ring-primary/20'
                        : 'border-border hover:border-primary/50 bg-background hover:bg-gray-50'
                    }`}
                    disabled={isGenerating}
                  >
                    <div className="flex items-start gap-3 text-left">
                      <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-gray-100 text-gray-600'}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`font-medium text-sm ${isSelected ? 'text-primary' : 'text-gray-900'}`}>
                          {toneOption.label}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {toneOption.description}
                        </div>
                        {isSelected && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600 italic">
                            "{toneOption.example}"
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            {errors.tone && (
              <p className="text-sm text-destructive">{errors.tone.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Select the tone that best matches your brand voice and target audience <span className="text-red-500 font-medium">(required)</span>
            </p>
          </div>

          {/* Additional Context Input */}
          <div className="space-y-2">
            <Label htmlFor="additionalContext" className="text-base font-medium flex items-center gap-1">
              Additional Context
              <span className="text-gray-500 text-sm">(optional)</span>
            </Label>
            <Textarea
              id="additionalContext"
              placeholder="Tell us more about your preferences: specific keywords to include, topics to avoid, unique aspects of your business, target outcomes, etc."
              {...register('additionalContext')}
              className="text-base min-h-[100px] touch-manipulation active:scale-[0.99] transition-transform"
              disabled={isGenerating}
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground">
              Help us create more personalized content by providing specific instructions and preferences <span className="text-gray-500 font-medium">(optional)</span>
            </p>
          </div>

          {/* Location Input */}
          <div className="space-y-2">
            <Label htmlFor="location" className="text-base font-medium flex items-center gap-1">
              Location
              <span className="text-gray-500 text-sm">(optional)</span>
            </Label>
            <LocationAutocomplete
              value={watchedFields.location || ''}
              onChange={(value) => setValue('location', value)}
              onLocationDetected={(locationData) => setDetailedLocation(locationData)}
              placeholder="e.g., New York, London, Tokyo, or leave empty for general topics"
              disabled={isGenerating}
              className="text-base"
            />
            {detailedLocation && (
              <div className="text-xs text-green-600 bg-green-50 p-2 rounded border border-green-200">
                <span className="font-medium">Enhanced location detected:</span> {detailedLocation.fullDisplay}
                {detailedLocation.geographicContext && (
                  <span className="ml-1">({detailedLocation.geographicContext} context)</span>
                )}
              </div>
            )}
          </div>

          {/* Cultural and Language Settings */}
          <div className="border-t pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Languages className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Cultural & Language Settings</h3>
            </div>

            <div className="space-y-6">
              {/* Language Preference */}
              <div className="space-y-3">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Language Preference
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {languagePreferenceOptions.map((option) => {
                    const isSelected = watchedFields.languagePreference === option.value;
                    const Icon = option.icon;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setValue('languagePreference', option.value as 'english' | 'native' | 'cultural_english', { shouldValidate: true });
                        }}
                        className={`p-4 rounded-lg border-2 transition-all touch-manipulation active:scale-[0.96] hover:shadow-md ${
                          isSelected
                            ? 'border-primary bg-primary/5 shadow-sm ring-2 ring-primary/20'
                            : 'border-border hover:border-primary/50 bg-background hover:bg-gray-50'
                        }`}
                        disabled={isGenerating}
                      >
                        <div className="flex items-start gap-3 text-left">
                          <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-gray-100 text-gray-600'}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`font-medium text-sm ${isSelected ? 'text-primary' : 'text-gray-900'}`}>
                              {option.label}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {option.description}
                            </div>
                            {isSelected && (
                              <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600 italic">
                                "{option.example}"
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Choose how you want your content to be generated - standard English, culturally-adapted English, or native local language
                </p>
              </div>

              {/* Formality Level */}
              <div className="space-y-3">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Formality Level
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {formalityLevelOptions.map((option) => {
                    const isSelected = watchedFields.formalityLevel === option.value;
                    const Icon = option.icon;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setValue('formalityLevel', option.value as 'formal' | 'professional' | 'casual' | 'slang_heavy', { shouldValidate: true });
                        }}
                        className={`p-3 rounded-lg border-2 transition-all touch-manipulation active:scale-[0.96] hover:shadow-md ${
                          isSelected
                            ? 'border-primary bg-primary/5 shadow-sm ring-2 ring-primary/20'
                            : 'border-border hover:border-primary/50 bg-background hover:bg-gray-50'
                        }`}
                        disabled={isGenerating}
                      >
                        <div className="flex items-start gap-2 text-left">
                          <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-gray-100 text-gray-600'}`}>
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`font-medium text-xs ${isSelected ? 'text-primary' : 'text-gray-900'}`}>
                              {option.label}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {option.description}
                            </div>
                            {isSelected && (
                              <div className="mt-1.5 p-1.5 bg-gray-50 rounded text-xs text-gray-600 italic">
                                "{option.example}"
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Select the formality level that matches your brand voice and audience expectations
                </p>
              </div>

              {/* Content Purpose */}
              <div className="space-y-3">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Content Purpose
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {contentPurposeOptions.map((option) => {
                    const isSelected = watchedFields.contentPurpose === option.value;
                    const Icon = option.icon;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setValue('contentPurpose', option.value as 'marketing' | 'educational' | 'conversational' | 'technical', { shouldValidate: true });
                        }}
                        className={`p-3 rounded-lg border-2 transition-all touch-manipulation active:scale-[0.96] hover:shadow-md ${
                          isSelected
                            ? 'border-primary bg-primary/5 shadow-sm ring-2 ring-primary/20'
                            : 'border-border hover:border-primary/50 bg-background hover:bg-gray-50'
                        }`}
                        disabled={isGenerating}
                      >
                        <div className="flex items-start gap-2 text-left">
                          <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-gray-100 text-gray-600'}`}>
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`font-medium text-xs ${isSelected ? 'text-primary' : 'text-gray-900'}`}>
                              {option.label}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {option.description}
                            </div>
                            {isSelected && (
                              <div className="mt-1.5 p-1.5 bg-gray-50 rounded text-xs text-gray-600 italic">
                                "{option.example}"
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Define the primary purpose of your content to ensure it achieves your goals
                </p>
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="border-t pt-6">
            <Button
              type="button"
              variant="ghost"
              className="w-full justify-between text-muted-foreground hover:text-foreground"
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
            >
              <span className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Advanced Settings
              </span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  showAdvancedSettings ? 'rotate-180' : ''
                }`}
              />
            </Button>

            {showAdvancedSettings && (
              <div className="mt-6 space-y-6">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                  <div className="flex items-center gap-2 text-blue-800">
                    <Globe className="h-4 w-4" />
                    <h4 className="font-medium">Website Configuration</h4>
                  </div>
                  <p className="text-sm text-blue-700 mt-2">
                    Your primary website URL is automatically used from your Security settings.
                    To update it, go to Settings → Security and update your Website Configuration.
                  </p>
                </div>

                {/* Primary Website URL Display */}
                <div className="space-y-2">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Your Website URL
                  </Label>
                  {isLoadingWebsite ? (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                        <span className="text-sm text-gray-600">Loading website URL...</span>
                      </div>
                    </div>
                  ) : primaryWebsiteUrl ? (
                    <div className="space-y-3">
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 bg-green-600 rounded-full"></div>
                            <span className="text-sm font-medium text-green-800">Primary Website</span>
                          </div>
                          <span className="text-sm text-gray-600 font-mono">{primaryWebsiteUrl}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          This website URL will be used for content generation and SEO analysis.
                        </p>
                      </div>

                      {/* Cache Status Display */}
                      {isCheckingCache ? (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span className="text-sm text-blue-800">Checking cache status...</span>
                          </div>
                        </div>
                      ) : websiteCacheStatus ? (
                        <div className={`p-3 border rounded-lg ${
                          websiteCacheStatus.recentlyCrawled
                            ? 'bg-green-50 border-green-200'
                            : 'bg-yellow-50 border-yellow-200'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {websiteCacheStatus.recentlyCrawled ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <Clock className="h-4 w-4 text-yellow-600" />
                              )}
                              <span className={`text-sm font-medium ${
                                websiteCacheStatus.recentlyCrawled
                                  ? 'text-green-800'
                                  : 'text-yellow-800'
                              }`}>
                                Cache Status
                              </span>
                            </div>
                            <span className="text-xs text-gray-600">
                              {websiteCacheStatus.recentlyCrawled
                                ? `Recently crawled (${websiteCacheStatus.daysSinceCrawl} days ago)`
                                : websiteCacheStatus.lastCrawledAt
                                  ? `Crawled ${websiteCacheStatus.daysSinceCrawl} days ago`
                                  : 'Never crawled'
                              }
                            </span>
                          </div>
                          <p className={`text-xs mt-2 ${
                            websiteCacheStatus.recentlyCrawled
                              ? 'text-green-700'
                              : 'text-yellow-700'
                          }`}>
                            {websiteCacheStatus.recentlyCrawled
                              ? 'Your website was recently analyzed. Using cached data to save generation time.'
                              : 'Your website data is outdated. It will be re-crawled during generation.'
                            }
                          </p>
                        </div>
                      ) : null}

                      {/* Re-crawl Button */}
                      {websiteCacheStatus && websiteCacheStatus.recentlyCrawled && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleForceRecrawl}
                          disabled={isGenerating || forceRecrawl}
                          className="w-full flex items-center gap-2"
                        >
                          <RefreshCw className={`h-4 w-4 ${forceRecrawl ? 'animate-spin' : ''}`} />
                          {forceRecrawl ? 'Will Re-crawl on Generation' : 'Force Re-crawl Website'}
                        </Button>
                      )}

                      {forceRecrawl && (
                        <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-xs text-blue-700">
                            ✓ Your website will be re-crawled on the next generation, ignoring cached data.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center gap-2 text-orange-800">
                        <Info className="h-4 w-4" />
                        <span className="text-sm font-medium">No Website URL Set</span>
                      </div>
                      <p className="text-xs text-orange-700 mt-2">
                        Please set your primary website URL in Settings → Security to enable better content generation.
                      </p>
                    </div>
                  )}
                </div>

                {/* Competitor URL Input */}
                <div className="space-y-2">
                  <Label htmlFor="competitorUrl" className="text-base font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Competitor Website URL (optional)
                  </Label>
                  <Input
                    id="competitorUrl"
                    placeholder="https://competitor.com"
                    {...register('competitorUrl')}
                    className="text-base h-11"
                    disabled={isGenerating || isCrawling}
                  />
                  {errors.competitorUrl && (
                    <p className="text-sm text-destructive">{errors.competitorUrl.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Analyze competitor content to find opportunities and generate competitive topics
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-16 text-lg font-semibold touch-manipulation active:scale-[0.98] transition-transform"
            disabled={isGenerating || isCrawling}
          >
            {isGenerating || isCrawling ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {isCrawling ? 'Analyzing Website...' : 'Generating Topics...'}
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-5 w-5" />
                Generate Content Ideas
              </>
            )}
          </Button>

          {isNearLimit && (
            <div className="text-center">
              <p className="text-sm text-orange-600">
                You're running low on generations.{' '}
                <button
                  type="button"
                  className="text-orange-700 underline hover:text-orange-800"
                  onClick={() => {
                    // In a real app, this would navigate to pricing
                    console.log('Navigate to pricing');
                  }}
                >
                  Upgrade to Pro
                </button>{' '}
                for unlimited generations.
              </p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}