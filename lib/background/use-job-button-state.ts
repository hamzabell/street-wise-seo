'use client';

import { useJobState } from './job-state';

export function useJobButtonState() {
  const { isJobRunning, currentJob } = useJobState();

  const getButtonProps = (jobType?: string) => {
    const isDisabled = isJobRunning && (!jobType || currentJob?.type === jobType);

    return {
      disabled: isDisabled,
      title: isDisabled
        ? `Cannot start new job while ${currentJob?.type || 'another job'} is running`
        : undefined,
      'aria-disabled': isDisabled,
    };
  };

  const isJobTypeRunning = (jobType: string) => {
    return isJobRunning && currentJob?.type === jobType;
  };

  return {
    isJobRunning,
    currentJob,
    getButtonProps,
    isJobTypeRunning,
    canStartJob: (jobType?: string) => !isJobRunning || (!jobType || currentJob?.type !== jobType),
  };
}