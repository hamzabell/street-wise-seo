'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Trophy,
  Check,
  Sparkles,
  Wand2,
  Globe,
  Building,
  TrendingUp,
  ArrowRight,
  Star,
  Zap,
  Target
} from 'lucide-react';

interface SetupProgress {
  websiteSetup: boolean;
  businessInfo: boolean;
  topicGeneration: boolean;
}

interface CompletionStepProps {
  progress: SetupProgress;
  onExplore: () => void;
}

export function CompletionStep({
  progress,
  onExplore
}: CompletionStepProps) {
  const completedSteps = Object.values(progress).filter(Boolean).length;
  const totalSteps = Object.keys(progress).length;
  const completionPercentage = Math.round((completedSteps / totalSteps) * 100);

  const getStepStatus = (completed: boolean) => {
    return completed ? (
      <div className="flex items-center gap-2 text-green-600">
        <Check className="h-4 w-4" />
        <span className="text-sm">Completed</span>
      </div>
    ) : (
      <div className="flex items-center gap-2 text-gray-400">
        <div className="h-4 w-4 rounded-full border border-gray-300"></div>
        <span className="text-sm">Skipped</span>
      </div>
    );
  };

  const nextSteps = [
    {
      title: 'Explore Your Topics',
      description: 'View and manage your generated SEO topics',
      icon: Wand2,
      href: '/dashboard/saved-topics',
      priority: 'high'
    },
    {
      title: 'Generate More Content',
      description: 'Create additional SEO topics for different services',
      icon: Sparkles,
      href: '/dashboard/seo-generator',
      priority: 'high'
    },
    {
      title: 'Analyze Competitors',
      description: 'Compare your content strategy with competitors',
      icon: TrendingUp,
      href: '/dashboard/seo-generator',
      priority: 'medium'
    }
  ];

  const tips = [
    {
      title: 'Consistent Content Creation',
      description: 'Generate topics regularly to maintain a steady flow of content ideas',
      icon: Target
    },
    {
      title: 'Local SEO Focus',
      description: 'Include location-specific keywords to attract local customers',
      icon: Globe
    },
    {
      title: 'Track Performance',
      description: 'Monitor which topics perform best to refine your strategy',
      icon: TrendingUp
    }
  ];

  return (
    <div className="space-y-8 py-8">
      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
          <Trophy className="h-10 w-10 text-white" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-gray-900">Congratulations! 🎉</h3>
          <p className="text-lg text-muted-foreground">
            You've successfully set up StreetWise SEO and are ready to start ranking higher in search results.
          </p>
        </div>
        <Badge className="bg-green-100 text-green-800 border-green-200">
          Setup {completionPercentage}% Complete
        </Badge>
      </div>

      <Separator />

      {/* Setup Summary */}
      <div className="space-y-4">
        <h4 className="font-semibold text-lg flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          Setup Summary
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className={progress.websiteSetup ? 'border-green-200 bg-green-50' : 'border-gray-200'}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Globe className={`h-8 w-8 ${progress.websiteSetup ? 'text-green-600' : 'text-gray-400'}`} />
                <div className="flex-1">
                  <h5 className="font-medium">Website Setup</h5>
                  {getStepStatus(progress.websiteSetup)}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={progress.businessInfo ? 'border-green-200 bg-green-50' : 'border-gray-200'}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Building className={`h-8 w-8 ${progress.businessInfo ? 'text-green-600' : 'text-gray-400'}`} />
                <div className="flex-1">
                  <h5 className="font-medium">Business Info</h5>
                  {getStepStatus(progress.businessInfo)}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={progress.topicGeneration ? 'border-green-200 bg-green-50' : 'border-gray-200'}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Wand2 className={`h-8 w-8 ${progress.topicGeneration ? 'text-green-600' : 'text-gray-400'}`} />
                <div className="flex-1">
                  <h5 className="font-medium">Topic Generation</h5>
                  {getStepStatus(progress.topicGeneration)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Next Steps */}
      <div className="space-y-4">
        <h4 className="font-semibold text-lg flex items-center gap-2">
          <Zap className="h-5 w-5 text-blue-500" />
          Recommended Next Steps
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {nextSteps.map((step, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    step.priority === 'high' ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <step.icon className={`h-5 w-5 ${
                      step.priority === 'high' ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium mb-1">{step.title}</h5>
                    <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                    <Button variant="outline" size="sm" asChild>
                      <a href={step.href}>
                        Get Started
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Pro Tips */}
      <div className="space-y-4">
        <h4 className="font-semibold text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          Pro Tips for Success
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tips.map((tip, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <tip.icon className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h5 className="font-medium mb-1">{tip.title}</h5>
                    <p className="text-sm text-muted-foreground">{tip.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center space-y-4 pt-4">
        <div className="space-y-2">
          <h4 className="text-xl font-semibold">Ready to Boost Your SEO?</h4>
          <p className="text-muted-foreground">
            Start exploring your dashboard and generate more content ideas to grow your online presence.
          </p>
        </div>
        <Button
          onClick={onExplore}
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 min-w-[250px]"
        >
          Go to Dashboard
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}