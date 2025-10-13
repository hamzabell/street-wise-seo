'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  FileText,
  Wand2,
  Target,
  Smartphone,
  Globe,
  BarChart3,
  CheckCircle,
  Star,
  ArrowRight,
  Lightbulb,
  Zap
} from 'lucide-react';
import { ContentBriefGenerator } from '@/components/ui/content-brief-generator';
import { ContentBrief } from '@/lib/seo/content-brief-generator';

export default function ContentBriefPage() {
  const [generatedBrief, setGeneratedBrief] = useState<ContentBrief | null>(null);

  const exampleTopics = [
    {
      topic: "Emergency Plumbing Services: What Homeowners Need to Know",
      businessType: "Plumbing Service",
      targetAudience: "Local Homeowners",
      location: "Your City"
    },
    {
      topic: "Complete Guide to Electrical Safety for Small Business Owners",
      businessType: "Electrical Services",
      targetAudience: "Business Owners",
      location: "Local Area"
    },
    {
      topic: "5 Signs You Need Professional HVAC Maintenance Before Summer",
      businessType: "HVAC Service",
      targetAudience: "Property Managers",
      location: "Your Service Area"
    }
  ];

  const features = [
    {
      icon: Target,
      title: "Local SEO Focus",
      description: "Optimized for local search intent and service area pages"
    },
    {
      icon: Smartphone,
      title: "Voice Search Ready",
      description: "Voice-friendly content for mobile and smart speaker searches"
    },
    {
      icon: FileText,
      title: "Service Business Briefs",
      description: "Industry-specific outlines for plumbing, HVAC, electrical, and more"
    },
    {
      icon: Globe,
      title: "Service Area Pages",
      description: "Location-specific content that attracts local customers"
    },
    {
      icon: BarChart3,
      title: "Implementation Checklist",
      description: "Step-by-step guidance to create content that converts"
    },
    {
      icon: Zap,
      title: "Emergency Content",
      description: "Quick-turnaround briefs for urgent service topics"
    }
  ];

  const handleBriefGenerated = (brief: ContentBrief) => {
    setGeneratedBrief(brief);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <FileText className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Local Business Content Briefs</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Transform your service topics into customer-attracting content with AI-powered briefs designed specifically for local businesses like yours.
        </p>
        <div className="flex items-center justify-center gap-2">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" />
            Local Business Focus
          </Badge>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <Target className="mr-1 h-3 w-3" />
            Customer Attracting
          </Badge>
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            <Smartphone className="mr-1 h-3 w-3" />
            Voice Search Ready
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Generator */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                Generate Your Content Brief
              </CardTitle>
              <CardDescription>
                Enter your topic and let our AI create a comprehensive content brief for you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ContentBriefGenerator
                onBriefGenerated={handleBriefGenerated}
                trigger={
                  <Button className="w-full" size="lg">
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate Content Brief
                  </Button>
                }
              />
            </CardContent>
          </Card>

          {/* Example Topics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Example Topics
              </CardTitle>
              <CardDescription>
                Try these example topics to see how the content brief generator works.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {exampleTopics.map((example, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-2">
                    <h4 className="font-medium text-sm">{example.topic}</h4>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {example.businessType && (
                        <Badge variant="outline">{example.businessType}</Badge>
                      )}
                      {example.targetAudience && (
                        <Badge variant="outline">{example.targetAudience}</Badge>
                      )}
                      {example.location && (
                        <Badge variant="outline">{example.location}</Badge>
                      )}
                    </div>
                    <ContentBriefGenerator
                      initialTopic={example.topic}
                      businessType={example.businessType}
                      targetAudience={example.targetAudience}
                      location={example.location}
                      trigger={
                        <Button variant="outline" size="sm">
                          <Wand2 className="mr-2 h-3 w-3" />
                          Generate Brief
                        </Button>
                      }
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Key Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <feature.icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{feature.title}</h4>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* How It Works */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Enter Your Topic</h4>
                    <p className="text-xs text-muted-foreground">Provide your topic and context</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">AI Analysis</h4>
                    <p className="text-xs text-muted-foreground">Our AI analyzes and optimizes</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Get Your Brief</h4>
                    <p className="text-xs text-muted-foreground">Receive a comprehensive content plan</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generated Brief Preview */}
          {generatedBrief && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Your Generated Brief
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm mb-1">Title</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {generatedBrief.seoChecklist.titleSuggestion}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-1">Word Count</h4>
                    <Badge variant="secondary" className="capitalize">
                      {generatedBrief.wordCountRecommendation}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-1">Mobile Score</h4>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${generatedBrief.mobileOptimization.readabilityScore}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {generatedBrief.mobileOptimization.readabilityScore}%
                      </span>
                    </div>
                  </div>
                  <ContentBriefGenerator
                    initialTopic={generatedBrief.topic}
                    businessType=""
                    targetAudience=""
                    trigger={
                      <Button variant="outline" size="sm" className="w-full">
                        <ArrowRight className="mr-2 h-3 w-3" />
                        View Full Brief
                      </Button>
                    }
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Benefits Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Why Use AI Content Briefs?</CardTitle>
          <CardDescription className="text-center">
            Save time and improve your content quality with data-driven briefs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-blue-600">10x</div>
              <div className="font-medium">Faster Content Planning</div>
              <div className="text-sm text-muted-foreground">
                Generate comprehensive briefs in seconds instead of hours
              </div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-green-600">85%</div>
              <div className="font-medium">Better SEO Performance</div>
              <div className="text-sm text-muted-foreground">
                AI-optimized content ranks higher and drives more traffic
              </div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-purple-600">3x</div>
              <div className="font-medium">Content Consistency</div>
              <div className="text-sm text-muted-foreground">
                Maintain quality standards across all your content
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}