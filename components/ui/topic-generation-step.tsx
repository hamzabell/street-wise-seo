'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Wand2,
  Check,
  AlertCircle,
  Info,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Lightbulb,
  Star,
  Save
} from 'lucide-react';

interface TopicGenerationStepProps {
  onComplete: () => void;
  initialCompleted: boolean;
}

const BUSINESS_TYPES = [
  'Restaurant',
  'Retail Store',
  'Service Business',
  'Professional Services',
  'E-commerce',
  'Healthcare',
  'Education',
  'Real Estate',
  'Construction',
  'Technology',
  'Other'
];

const TARGET_AUDIENCES = [
  'Local Customers',
  'National Customers',
  'B2B Clients',
  'Consumers',
  'Small Businesses',
  'Enterprise Clients',
  'Students',
  'Parents',
  'Seniors',
  'Young Adults'
];

export function TopicGenerationStep({
  onComplete,
  initialCompleted
}: TopicGenerationStepProps) {
  const [formData, setFormData] = useState({
    topic: '',
    businessType: '',
    targetAudience: '',
    location: '',
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isCompleted, setIsCompleted] = useState(initialCompleted);
  const [generatedTopics, setGeneratedTopics] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    if (!initialCompleted) {
      // Set some smart defaults based on common use cases
      setFormData(prev => ({
        ...prev,
        topic: 'local seo',
        businessType: 'Service Business',
        targetAudience: 'Local Customers',
        location: 'your city',
      }));
    }
  }, [initialCompleted]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    setError(null);
  };

  const handleGenerateTopics = async () => {
    if (!formData.topic.trim()) {
      setError('Please enter a topic to generate ideas');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/seo/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: formData.topic,
          businessType: formData.businessType || 'general business',
          industryId: 'other',
          targetAudience: formData.targetAudience || 'general audience',
          location: formData.location,
        }),
      });

      const data = await response.json();

      if (response.ok && data.data) {
        setGeneratedTopics(data.data.generatedTopics || []);

        // Automatically save all topics for setup wizard
        if (data.data.generatedTopics && data.data.generatedTopics.length > 0) {
          await handleSaveAllTopics(data.data.generatedTopics);
        }
      } else {
        setError(data.error || 'Failed to generate topics');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAllTopics = async (topics: any[]) => {
    try {
      const savePromises = topics.map((topic) =>
        fetch('/api/seo/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: topic.topic,
            description: topic.description,
            tags: topic.suggestedTags,
            difficulty: topic.difficulty,
            searchVolume: topic.searchVolume,
            competitionLevel: topic.competition,
            businessType: formData.businessType,
            targetAudience: formData.targetAudience,
            location: formData.location,
          }),
        })
      );

      const results = await Promise.allSettled(savePromises);
      const successful = results.filter(r => r.status === 'fulfilled');
      setSavedCount(successful.length);

      if (successful.length > 0) {
        setIsCompleted(true);
        // Give a moment for user to see the success state
        setTimeout(() => {
          onComplete();
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to save topics:', error);
    }
  };

  if (isCompleted && generatedTopics.length > 0) {
    return (
      <div className="text-center space-y-6 py-8">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold text-green-900">Topics Generated Successfully!</h3>
            <p className="text-muted-foreground mt-2">
              We've created {generatedTopics.length} SEO-optimized topics and saved them to your library.
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-center gap-2 text-green-700 mb-2">
              <Star className="h-4 w-4" />
              <span className="font-medium">Your First SEO Topics</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left max-h-40 overflow-y-auto">
              {generatedTopics.slice(0, 6).map((topic, index) => (
                <div key={index} className="text-sm bg-white p-2 rounded border">
                  <div className="font-medium text-gray-900">{topic.topic}</div>
                  <div className="flex gap-1 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {topic.difficulty}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {topic.competition}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-green-600">
            <Sparkles className="h-4 w-4" />
            <span>Moving to final step...</span>
          </div>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="text-center space-y-6 py-8">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-green-900">Topic Generation Complete!</h3>
          <p className="text-muted-foreground">
            You're all set up with your first batch of SEO topics.
          </p>
        </div>
        <Button
          onClick={onComplete}
          size="lg"
          className="bg-green-600 hover:bg-green-700"
        >
          Continue to Final Step
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Generate Your First SEO Topics</h3>
        <p className="text-muted-foreground text-sm">
          Let's create your first batch of SEO-optimized content ideas for your business.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="main-topic">Main Topic or Service</Label>
          <Input
            id="main-topic"
            placeholder="e.g., plumbing services, digital marketing, restaurant"
            value={formData.topic}
            onChange={(e) => handleInputChange('topic', e.target.value)}
            disabled={isGenerating}
          />
          <p className="text-xs text-muted-foreground mt-1">
            What's the main product or service you want to create content about?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="business-type">Business Type</Label>
            <Select value={formData.businessType} onValueChange={(value) => handleInputChange('businessType', value)}>
              <SelectTrigger id="business-type">
                <SelectValue placeholder="Select business type" />
              </SelectTrigger>
              <SelectContent>
                {BUSINESS_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="target-audience">Target Audience</Label>
            <Select value={formData.targetAudience} onValueChange={(value) => handleInputChange('targetAudience', value)}>
              <SelectTrigger id="target-audience">
                <SelectValue placeholder="Select target audience" />
              </SelectTrigger>
              <SelectContent>
                {TARGET_AUDIENCES.map((audience) => (
                  <SelectItem key={audience} value={audience}>
                    {audience}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="location">Location (Optional)</Label>
          <Input
            id="location"
            placeholder="e.g., New York City, Los Angeles, nationwide"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            disabled={isGenerating}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Include your location for local SEO topics.
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center gap-2 text-blue-600 bg-blue-50 p-4 rounded-lg">
          <Lightbulb className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">
            We'll analyze your input and generate relevant SEO topics with difficulty scores and search volume estimates.
          </p>
        </div>
      </div>

      <Separator />

      <div className="flex justify-center">
        <Button
          onClick={handleGenerateTopics}
          disabled={isGenerating || !formData.topic.trim()}
          size="lg"
          className="min-w-[250px]"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generating Topics...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4 mr-2" />
              Generate SEO Topics
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>

      <div className="text-center">
        <Badge variant="secondary" className="text-xs">
          Required step - Generate your first topics to complete setup
        </Badge>
      </div>
    </div>
  );
}