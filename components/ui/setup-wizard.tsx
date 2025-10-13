'use client';

import { useState, useEffect } from 'react';
import { CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { SetupStepIndicator } from './setup-step-indicator';
import { WebsiteSetupStep } from './website-setup-step';
import { TopicGenerationStep } from './topic-generation-step';
import { CompletionStep } from './completion-step';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  Globe,
  Wand2,
  Trophy
} from 'lucide-react';

interface SetupProgress {
  websiteSetup: boolean;
  businessInfo: boolean;
  topicGeneration: boolean;
}

const SETUP_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to StreetWise SEO',
    description: 'Let\'s get you set up with everything you need to start generating SEO content ideas.',
    icon: Sparkles,
    isSkippable: false,
  },
  {
    id: 'websiteSetup',
    title: 'Setup Your Website',
    description: 'Add your primary website URL to enable personalized SEO recommendations.',
    icon: Globe,
    isSkippable: true,
  },
  {
    id: 'topicGeneration',
    title: 'Generate Your First Topics',
    description: 'Create your first batch of SEO-optimized content ideas.',
    icon: Wand2,
    isSkippable: false,
  },
  {
    id: 'completion',
    title: 'All Set!',
    description: 'You\'re ready to start using StreetWise SEO.',
    icon: Trophy,
    isSkippable: false,
  },
];

export function SetupWizard({
  isOpen,
  onComplete,
  onClose
}: {
  isOpen: boolean;
  onComplete: () => void;
  onClose: () => void;
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState<SetupProgress>({
    websiteSetup: false,
    businessInfo: false,
    topicGeneration: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const currentStep = SETUP_STEPS[currentStepIndex];

  const handleNext = () => {
    if (currentStepIndex < SETUP_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleSkip = () => {
    // Mark current step as skipped
    updateProgress(currentStep.id as keyof SetupProgress, true);
    handleNext();
  };

  const handleStepComplete = (stepId: keyof SetupProgress) => {
    updateProgress(stepId, true);
    handleNext();
  };

  const updateProgress = (stepId: keyof SetupProgress, completed: boolean) => {
    setProgress(prev => ({
      ...prev,
      [stepId]: completed,
    }));
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // Mark setup wizard as completed
      await fetch('/api/user/setup-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          setupWizardCompleted: true,
          setupProgress: JSON.stringify(progress),
        }),
      });
      onComplete();
    } catch (error) {
      console.error('Failed to complete setup wizard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateProgress = () => {
    const completedSteps = Object.values(progress).filter(Boolean).length;
    return Math.round((completedSteps / Object.keys(progress).length) * 100);
  };

  const canSkip = currentStep.isSkippable && currentStepIndex !== SETUP_STEPS.length - 1;
  const canProceed = currentStepIndex === 0 || // Can always proceed from welcome
                   currentStep.id === 'websiteSetup' ? progress.websiteSetup :
                   currentStep.id === 'topicGeneration' ? progress.topicGeneration :
                   true; // Other steps can proceed

  if (!isOpen) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 w-full">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="text-center space-y-4 pb-4 pt-8 px-6 sm:px-8">
          <div className="flex items-center justify-between w-full">
            {currentStepIndex > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevious}
                disabled={isLoading}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
              className={currentStepIndex > 0 ? '' : 'ml-auto'}
            >
              ×
            </Button>
          </div>

          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-primary/10 rounded-full">
              <currentStep.icon className="h-8 w-8 text-primary" />
            </div>
            <div className="text-left">
              <CardTitle className="text-2xl">{currentStep.title}</CardTitle>
              <p className="text-muted-foreground mt-1">{currentStep.description}</p>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Setup Progress</span>
              <span>{calculateProgress()}%</span>
            </div>
            <Progress value={calculateProgress()} className="h-2" />
            <SetupStepIndicator
              steps={SETUP_STEPS}
              currentStepIndex={currentStepIndex}
              progress={progress}
            />
          </div>
          </div>

          <div className="px-6 sm:px-8 pb-8 space-y-6">
          {/* Step Content */}
          {currentStep.id === 'welcome' && (
            <div className="text-center space-y-6 py-8">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Get started in just a few minutes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">Website Setup</h4>
                      <p className="text-sm text-muted-foreground">Connect your website for personalized SEO insights</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Wand2 className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">Generate Topics</h4>
                      <p className="text-sm text-muted-foreground">Create your first batch of SEO content ideas</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-green-600" />
                <span>You can skip any step and return later</span>
              </div>
            </div>
          )}

          {currentStep.id === 'websiteSetup' && (
            <WebsiteSetupStep
              onComplete={() => handleStepComplete('websiteSetup')}
              onSkip={canSkip ? handleSkip : undefined}
              initialCompleted={progress.websiteSetup}
            />
          )}

  
          {currentStep.id === 'topicGeneration' && (
            <TopicGenerationStep
              onComplete={() => handleStepComplete('topicGeneration')}
              initialCompleted={progress.topicGeneration}
            />
          )}

          {currentStep.id === 'completion' && (
            <CompletionStep
              progress={progress}
              onExplore={onComplete}
            />
          )}

          {/* Navigation buttons for welcome and completion steps */}
          {(currentStep.id === 'welcome' || currentStep.id === 'completion') && (
            <div className="flex justify-center pt-4">
              <Button
                onClick={handleNext}
                disabled={isLoading}
                size="lg"
                className="min-w-[200px]"
              >
                {currentStep.id === 'welcome' ? (
                  <>
                    Get Started
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                ) : (
                  <>
                    Start Using StreetWise SEO
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}