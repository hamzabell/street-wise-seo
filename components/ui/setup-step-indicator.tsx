'use client';

import { Check, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SetupStep {
  id: string;
  title: string;
  icon: any;
  isSkippable: boolean;
}

interface SetupProgress {
  websiteSetup: boolean;
  businessInfo: boolean;
  topicGeneration: boolean;
}

interface SetupStepIndicatorProps {
  steps: SetupStep[];
  currentStepIndex: number;
  progress: SetupProgress;
}

export function SetupStepIndicator({
  steps,
  currentStepIndex,
  progress
}: SetupStepIndicatorProps) {
  const getStepStatus = (stepId: string, stepIndex: number) => {
    if (stepIndex < currentStepIndex) {
      return 'completed';
    } else if (stepIndex === currentStepIndex) {
      return 'current';
    } else {
      return 'upcoming';
    }
  };

  const isStepCompleted = (stepId: string) => {
    switch (stepId) {
      case 'websiteSetup':
        return progress.websiteSetup;
      case 'businessInfo':
        return progress.businessInfo;
      case 'topicGeneration':
        return progress.topicGeneration;
      default:
        return false;
    }
  };

  return (
    <div className="flex items-center justify-between space-x-2">
      {steps.map((step, index) => {
        const status = getStepStatus(step.id, index);
        const isCompleted = isStepCompleted(step.id);
        const isWelcomeOrCompletion = step.id === 'welcome' || step.id === 'completion';

        return (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex items-center space-x-2 flex-1">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors',
                  status === 'completed' && 'bg-green-600 text-white',
                  status === 'current' && 'bg-primary text-primary-foreground',
                  status === 'upcoming' && 'bg-gray-200 text-gray-500'
                )}
              >
                {status === 'completed' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className={cn(
                    'text-sm font-medium truncate transition-colors',
                    status === 'completed' && 'text-green-600',
                    status === 'current' && 'text-primary',
                    status === 'upcoming' && 'text-gray-500'
                  )}
                >
                  {step.title}
                </div>
                {!isWelcomeOrCompletion && isCompleted && (
                  <div className="text-xs text-green-600 flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    <span>Completed</span>
                  </div>
                )}
              </div>
            </div>

            {index < steps.length - 1 && (
              <div
                className={cn(
                  'w-4 h-0.5 mx-2 flex-shrink-0',
                  status === 'completed' || (index < currentStepIndex - 1)
                    ? 'bg-green-600'
                    : 'bg-gray-200'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}