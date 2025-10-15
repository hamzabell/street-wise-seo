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
import { Loader2, Wand2, Sparkles, Settings, ChevronDown, TrendingUp, Globe, MessageCircle, Building, Target, Info, Languages, Users, MapPin, Plus, X, BookOpen, Heart, Coffee, Smile } from 'lucide-react';
import { INDUSTRY_TEMPLATES } from '@/lib/seo/industry-templates';
import { IndustryIcon, getIndustryIcon } from '@/components/ui/industry-icons';

const TopicGenerationSchema = z.object({
  topic: z.string().min(3, 'Topic must be at least 3 characters long'),
  businessType: z.string().min(2, 'Business type must be at least 2 characters long'),
  industryId: z.string().min(1, 'Please select your industry'),
  targetAudience: z.string().min(2, 'Target audience is required'),
  location: z.string().optional(),
  competitorUrls: z.array(z.string().url('Invalid competitor URL').or(z.literal(''))).optional(),
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
  onSubmit: (data: TopicGenerationForm & { detailedLocation?: DetailedLocation }) => Promise<void>;
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

const businessTypeSuggestions = [
  { value: 'plumbing service', label: 'Plumbing Service' },
  { value: 'electrical contractor', label: 'Electrical Contractor' },
  { value: 'cleaning service', label: 'Cleaning Service' },
  { value: 'handyman service', label: 'Handyman Service' },
  { value: 'landscaping', label: 'Landscaping' },
  { value: 'roofing contractor', label: 'Roofing Contractor' },
  { value: 'hvac company', label: 'HVAC Company' },
  { value: 'painting service', label: 'Painting Service' },
  { value: 'moving company', label: 'Moving Company' },
  { value: 'pest control', label: 'Pest Control' },
  { value: 'home inspection', label: 'Home Inspection' },
  { value: 'general contractor', label: 'General Contractor' },
  { value: 'digital marketing agency', label: 'Digital Marketing Agency' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'retail store', label: 'Retail Store' },
  { value: 'fitness center', label: 'Fitness Center' },
  { value: 'consulting firm', label: 'Consulting Firm' },
  { value: 'real estate agency', label: 'Real Estate Agency' },
  { value: 'auto repair shop', label: 'Auto Repair Shop' },
  { value: 'beauty salon', label: 'Beauty Salon' },
];


const toneOptions = [
  {
    value: 'professional',
    label: 'Professional',
    description: 'Formal, expert tone with industry terminology',
    example: 'Our comprehensive analysis reveals key insights into...',
    icon: Building,
    color: 'bg-blue-50 border-blue-200 text-blue-900',
    selectedColor: 'bg-blue-100 border-blue-400 text-blue-900'
  },
  {
    value: 'casual',
    label: 'Casual',
    description: 'Relaxed, conversational tone that feels approachable',
    example: "Let's talk about what's working and what isn't...",
    icon: Coffee,
    color: 'bg-green-50 border-green-200 text-green-900',
    selectedColor: 'bg-green-100 border-green-400 text-green-900'
  },
  {
    value: 'friendly',
    label: 'Friendly',
    description: 'Warm, welcoming tone that builds trust',
    example: "We're here to help you every step of the way...",
    icon: Heart,
    color: 'bg-purple-50 border-purple-200 text-purple-900',
    selectedColor: 'bg-purple-100 border-purple-400 text-purple-900'
  },
  {
    value: 'authoritative',
    label: 'Authoritative',
    description: 'Confident, expert tone that establishes credibility',
    example: 'Based on extensive research and industry expertise...',
    icon: Target,
    color: 'bg-red-50 border-red-200 text-red-900',
    selectedColor: 'bg-red-100 border-red-400 text-red-900'
  },
  {
    value: 'conversational',
    label: 'Conversational',
    description: 'Engaging, two-way tone that encourages interaction',
    example: "Have you ever wondered how to...? Let's dive in...",
    icon: MessageCircle,
    color: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    selectedColor: 'bg-yellow-100 border-yellow-400 text-yellow-900'
  },
  {
    value: 'humorous',
    label: 'Humorous',
    description: 'Light-hearted tone with appropriate humor',
    example: 'Let\'s face it - tackling this can feel like herding cats...',
    icon: Smile,
    color: 'bg-orange-50 border-orange-200 text-orange-900',
    selectedColor: 'bg-orange-100 border-orange-400 text-orange-900'
  },
  {
    value: 'inspirational',
    label: 'Inspirational',
    description: 'Motivating tone that encourages action',
    example: 'Transform your business with these powerful strategies...',
    icon: Sparkles,
    color: 'bg-indigo-50 border-indigo-200 text-indigo-900',
    selectedColor: 'bg-indigo-100 border-indigo-400 text-indigo-900'
  }
];

const languagePreferenceOptions = [
  {
    value: 'english',
    label: 'Standard English',
    description: 'Professional English with cultural awareness',
    example: 'Generate content in standard English while respecting local cultural context',
    icon: Globe,
    color: 'bg-blue-50 border-blue-200 text-blue-900',
    selectedColor: 'bg-blue-100 border-blue-400 text-blue-900',
    regionalExample: 'Professional service delivery with local cultural sensitivity'
  },
  {
    value: 'cultural_english',
    label: 'Cultural English',
    description: 'English with local slang and expressions',
    example: 'Mix English with Australian slang, Nigerian Pidgin, or other local expressions',
    icon: MessageCircle,
    color: 'bg-green-50 border-green-200 text-green-900',
    selectedColor: 'bg-green-100 border-green-400 text-green-900',
    regionalExample: 'No worries mate, we provide fair dinkum quality service (Australia)'
  },
  {
    value: 'native',
    label: 'Native Language',
    description: 'Content in the local language of your region',
    example: 'Generate content in Hindi, Spanish, or other local languages',
    icon: Languages,
    color: 'bg-purple-50 border-purple-200 text-purple-900',
    selectedColor: 'bg-purple-100 border-purple-400 text-purple-900',
    regionalExample: 'हम आपकी सेवा में तैयार हैं (Hindi: We are at your service)'
  }
];

const formalityLevelOptions = [
  {
    value: 'formal',
    label: 'Formal',
    description: 'Professional, respectful language for business contexts',
    example: 'We hereby present our comprehensive analysis for your consideration.',
    icon: Building,
    color: 'bg-blue-50 border-blue-200 text-blue-900',
    selectedColor: 'bg-blue-100 border-blue-400 text-blue-900'
  },
  {
    value: 'professional',
    label: 'Professional',
    description: 'Business-appropriate language that\'s approachable',
    example: 'Let\'s explore how our services can benefit your business goals.',
    icon: Target,
    color: 'bg-green-50 border-green-200 text-green-900',
    selectedColor: 'bg-green-100 border-green-400 text-green-900'
  },
  {
    value: 'casual',
    label: 'Casual',
    description: 'Relaxed, friendly tone for building rapport',
    example: 'Hey there! We\'ve got some great ideas that might work for you.',
    icon: MessageCircle,
    color: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    selectedColor: 'bg-yellow-100 border-yellow-400 text-yellow-900'
  },
  {
    value: 'slang_heavy',
    label: 'Local Slang',
    description: 'Authentic local expressions and casual language',
    example: 'Abeg, check out these wicked ideas for your business!',
    icon: Sparkles,
    color: 'bg-orange-50 border-orange-200 text-orange-900',
    selectedColor: 'bg-orange-100 border-orange-400 text-orange-900'
  }
];

const contentPurposeOptions = [
  {
    value: 'marketing',
    label: 'Marketing',
    description: 'Persuasive content to attract and convert customers',
    example: 'Promotional content that highlights benefits and drives action',
    icon: TrendingUp,
    color: 'bg-red-50 border-red-200 text-red-900',
    selectedColor: 'bg-red-100 border-red-400 text-red-900'
  },
  {
    value: 'educational',
    label: 'Educational',
    description: 'Informative content that teaches and explains',
    example: 'Helpful content that answers questions and provides value',
    icon: BookOpen,
    color: 'bg-blue-50 border-blue-200 text-blue-900',
    selectedColor: 'bg-blue-100 border-blue-400 text-blue-900'
  },
  {
    value: 'conversational',
    label: 'Conversational',
    description: 'Engaging content that encourages interaction',
    example: 'Interactive content that feels like a conversation',
    icon: MessageCircle,
    color: 'bg-green-50 border-green-200 text-green-900',
    selectedColor: 'bg-green-100 border-green-400 text-green-900'
  },
  {
    value: 'technical',
    label: 'Technical',
    description: 'Detailed content for expert audiences',
    example: 'In-depth content with technical details and specifications',
    icon: Settings,
    color: 'bg-purple-50 border-purple-200 text-purple-900',
    selectedColor: 'bg-purple-100 border-purple-400 text-purple-900'
  }
];

// Helper function to generate regional content preview
function getRegionalContentPreview(languagePreference: string, formalityLevel: string, location?: string): string {
  if (!location) {
    return 'Content will be generated in standard professional English with cultural awareness based on your preferences.';
  }

  const locationLower = location.toLowerCase();

  // Dynamic regional examples based on cultural settings
  if (languagePreference === 'cultural_english') {
    if (formalityLevel === 'casual') {
      return `Content will blend English with authentic ${location} cultural expressions and local communication style that resonates with your target audience.`;
    }
    return `Content will be written in professional English that incorporates ${location} cultural context and local business practices.`;
  }

  if (languagePreference === 'native') {
    return `Content will be generated in the local native language of ${location} with authentic cultural expressions and regional business terminology.`;
  }

  if (formalityLevel === 'slang_heavy') {
    return `Content will use authentic local slang and casual expressions from ${location} to sound like a native local speaker and build immediate trust.`;
  }

  if (formalityLevel === 'formal') {
    return `Content will use formal business language appropriate for ${location} business culture with professional terminology and respectful communication style.`;
  }

  return `Professional service delivery tailored to ${location} with local cultural awareness and appropriate business etiquette.`;
}

export function GeneratorForm({ onSubmit, isGenerating, usageStats }: GeneratorFormProps) {
  const [showSuggestions, setShowSuggestions] = useState({
    targetAudience: false,
  });
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [detailedLocation, setDetailedLocation] = useState<DetailedLocation | null>(null);
  const [competitorUrls, setCompetitorUrls] = useState<string[]>(['']);

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
      tone: 'professional',
      competitorUrls: ['']
    }
  });

  const watchedFields = watch();

  
  const handleSuggestionClick = (field: keyof TopicGenerationForm, value: string) => {
    setValue(field, value);
    setShowSuggestions(prev => ({ ...prev, [field]: false }));
  };

  const handleFormSubmit = async (data: TopicGenerationForm) => {
    // Filter out empty competitor URLs
    const validCompetitorUrls = data.competitorUrls?.filter(url => url && url.trim() !== '') || [];

    // Include detailed location data and ALL form settings in the submission
    await onSubmit({
      ...data,
      competitorUrls: validCompetitorUrls,
      detailedLocation: detailedLocation || undefined
    });
  };

  
  const addCompetitorUrl = () => {
    if (competitorUrls.length >= 5) {
      return; // Limit to 5 competitor URLs
    }
    const newUrls = [...competitorUrls, ''];
    setCompetitorUrls(newUrls);
    setValue('competitorUrls', newUrls);
  };

  const removeCompetitorUrl = (index: number) => {
    const newUrls = competitorUrls.filter((_, i) => i !== index);
    setCompetitorUrls(newUrls);
    setValue('competitorUrls', newUrls);
  };

  const updateCompetitorUrl = (index: number, value: string) => {
    const newUrls = [...competitorUrls];
    newUrls[index] = value;
    setCompetitorUrls(newUrls);
    setValue('competitorUrls', newUrls);
  };

  // Sync competitor URLs with form state
  useEffect(() => {
    setValue('competitorUrls', competitorUrls);
  }, [competitorUrls, setValue]);

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
            {/* Main Topic */}
          <div className="space-y-2">
            <Label htmlFor="topic">
              Topic <span className="text-red-500">*</span>
            </Label>
            <Input
              id="topic"
              placeholder="e.g., digital marketing for restaurants"
              {...register('topic')}
              disabled={isGenerating}
            />
            {errors.topic && (
              <p className="text-sm text-destructive">{errors.topic.message}</p>
            )}
          </div>

            {/* Business Type */}
          <div className="space-y-2">
            <Label htmlFor="businessType">
              Business Type <span className="text-red-500">*</span>
            </Label>
            <Select
              value={watchedFields.businessType || ''}
              onValueChange={(value) => setValue('businessType', value, { shouldValidate: true })}
              disabled={isGenerating}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select business type" />
              </SelectTrigger>
              <SelectContent>
                {businessTypeSuggestions.map((business) => (
                  <SelectItem key={business.value} value={business.value}>
                    {business.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.businessType && (
              <p className="text-sm text-destructive">{errors.businessType.message}</p>
            )}
          </div>

          {/* Industry */}
          <div className="space-y-2">
            <Label htmlFor="industryId">
              Industry <span className="text-red-500">*</span>
            </Label>
            <Select
              value={watchedFields.industryId || ''}
              onValueChange={(value) => setValue('industryId', value, { shouldValidate: true })}
              disabled={isGenerating}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRY_TEMPLATES.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.industryId && (
              <p className="text-sm text-destructive">{errors.industryId.message}</p>
            )}
          </div>

          {/* Target Audience */}
          <div className="space-y-2">
            <Label htmlFor="targetAudience">
              Target Audience <span className="text-red-500">*</span>
            </Label>
            <Input
              id="targetAudience"
              placeholder="e.g., Local customers, Small businesses"
              {...register('targetAudience')}
              disabled={isGenerating}
            />
            {errors.targetAudience && (
              <p className="text-sm text-destructive">{errors.targetAudience.message}</p>
            )}
          </div>

            {/* Content Tone */}
          <div className="space-y-2">
            <Label htmlFor="tone">
              Content Tone <span className="text-red-500">*</span>
            </Label>
            <Select
              value={watchedFields.tone || 'professional'}
              onValueChange={(value) => setValue('tone', value, { shouldValidate: true })}
              disabled={isGenerating}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                {toneOptions.map((toneOption) => (
                  <SelectItem key={toneOption.value} value={toneOption.value}>
                    {toneOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.tone && (
              <p className="text-sm text-destructive">{errors.tone.message}</p>
            )}
          </div>

          {/* Additional Context */}
          <div className="space-y-2">
            <Label htmlFor="additionalContext">
              Additional Context
            </Label>
            <Textarea
              id="additionalContext"
              placeholder="Any additional details or preferences..."
              {...register('additionalContext')}
              disabled={isGenerating}
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">
              Location
            </Label>
            <LocationAutocomplete
              value={watchedFields.location || ''}
              onChange={(value) => setValue('location', value)}
              onLocationDetected={(locationData) => setDetailedLocation(locationData)}
              placeholder="e.g., New York, London"
              disabled={isGenerating}
            />
          </div>

          {/* Cultural Settings with Enhanced UI */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-blue-600" />
                <Label className="text-base font-medium">Regional Content Settings</Label>
              </div>

              <p className="text-sm text-muted-foreground">
                Customize your content to sound authentic to your specific region and audience
              </p>
            </div>

            {/* Language Preference with Visual Selection */}
            <div className="space-y-3">
              <Label htmlFor="languagePreference">
                Language Preference
              </Label>
              <div className="grid grid-cols-1 gap-3">
                {languagePreferenceOptions.map((option) => {
                  const isSelected = watchedFields.languagePreference === option.value;
                  const IconComponent = option.icon;

                  return (
                    <div
                      key={option.value}
                      className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? option.selectedColor
                          : option.color
                      } hover:border-opacity-80`}
                      onClick={() => setValue('languagePreference', option.value as 'english' | 'native' | 'cultural_english', { shouldValidate: true })}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-white/50 rounded-lg">
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-sm">{option.label}</div>
                          <div className="text-xs opacity-75 mt-1">{option.description}</div>
                          {option.regionalExample && (
                            <div className="mt-2 p-2 bg-white/30 rounded border text-xs">
                              <span className="font-medium">Example:</span> {option.regionalExample}
                            </div>
                          )}
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Formality Level with Visual Selection */}
            <div className="space-y-3">
              <Label htmlFor="formalityLevel">
                Formality Level
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {formalityLevelOptions.map((option) => {
                  const isSelected = watchedFields.formalityLevel === option.value;
                  const IconComponent = option.icon;

                  return (
                    <div
                      key={option.value}
                      className={`relative p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? option.selectedColor
                          : option.color
                      } hover:border-opacity-80`}
                      onClick={() => setValue('formalityLevel', option.value as 'formal' | 'professional' | 'casual' | 'slang_heavy', { shouldValidate: true })}
                    >
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4" />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{option.label}</div>
                          <div className="text-xs opacity-75 mt-1">{option.example}</div>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Content Purpose with Visual Selection */}
            <div className="space-y-3">
              <Label htmlFor="contentPurpose">
                Content Purpose
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {contentPurposeOptions.map((option) => {
                  const isSelected = watchedFields.contentPurpose === option.value;
                  const IconComponent = option.icon;

                  return (
                    <div
                      key={option.value}
                      className={`relative p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? option.selectedColor
                          : option.color
                      } hover:border-opacity-80`}
                      onClick={() => setValue('contentPurpose', option.value as 'marketing' | 'educational' | 'conversational' | 'technical', { shouldValidate: true })}
                    >
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4" />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{option.label}</div>
                          <div className="text-xs opacity-75 mt-1">{option.example}</div>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Regional Preview */}
            {(watchedFields.location || watchedFields.languagePreference) && (
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <Label className="text-sm font-medium">Regional Content Preview</Label>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Region:</span>
                    <span className="text-blue-700">{watchedFields.location || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Language Style:</span>
                    <span className="text-purple-700">
                      {languagePreferenceOptions.find(opt => opt.value === watchedFields.languagePreference)?.label || 'Standard English'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Formality:</span>
                    <span className="text-green-700">
                      {formalityLevelOptions.find(opt => opt.value === watchedFields.formalityLevel)?.label || 'Professional'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Purpose:</span>
                    <span className="text-orange-700">
                      {contentPurposeOptions.find(opt => opt.value === watchedFields.contentPurpose)?.label || 'Marketing'}
                    </span>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-white/50 rounded-lg">
                  <div className="text-xs font-medium text-gray-600 mb-1">Sample Content Style:</div>
                  <div className="text-xs text-gray-700 italic">
                    {getRegionalContentPreview(watchedFields.languagePreference, watchedFields.formalityLevel, watchedFields.location)}
                  </div>
                </div>
              </div>
            )}

            {errors.languagePreference && (
              <p className="text-sm text-destructive">{errors.languagePreference.message}</p>
            )}
            {errors.formalityLevel && (
              <p className="text-sm text-destructive">{errors.formalityLevel.message}</p>
            )}
            {errors.contentPurpose && (
              <p className="text-sm text-destructive">{errors.contentPurpose.message}</p>
            )}
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
                
                {/* Competitor URLs Input */}
                <div className="space-y-3">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Competitor Websites (optional)
                  </Label>
                  <div className="space-y-2">
                    {competitorUrls.map((url, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder="https://competitor.com"
                          value={url}
                          onChange={(e) => updateCompetitorUrl(index, e.target.value)}
                          className="text-base h-11 flex-1"
                          disabled={isGenerating}
                        />
                        {competitorUrls.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeCompetitorUrl(index)}
                            disabled={isGenerating}
                            className="h-11 w-11 flex-shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addCompetitorUrl}
                      disabled={isGenerating || competitorUrls.length >= 5}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Competitor
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      Add up to 5 competitor websites for analysis
                    </span>
                  </div>
                  {errors.competitorUrls && (
                    <p className="text-sm text-destructive">
                      {errors.competitorUrls.root?.message || 'Please enter valid competitor URLs'}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Enter competitor websites to analyze their content and generate topics that can help you compete in search results
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-16 text-lg font-semibold touch-manipulation active:scale-[0.98] transition-transform"
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating Topics...
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