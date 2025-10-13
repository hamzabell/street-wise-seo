'use client';

import React from 'react';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface BackgroundJob {
  id: number;
  type: string;
  status: string;
  progress: number;
  currentStep: string | null;
  createdAt: string;
  startedAt: string | null;
  error: string | null;
}

interface JobStateContextType {
  currentJob: BackgroundJob | null;
  isJobRunning: boolean;
  jobProgress: number;
  jobType: string;
  jobStep: string | null;
  setJobState: (job: BackgroundJob | null) => void;
  clearJobState: () => void;
}

const JobStateContext = createContext<JobStateContextType | undefined>(undefined);

export function JobStateProvider({ children }: { children: ReactNode }) {
  const [currentJob, setCurrentJob] = useState<BackgroundJob | null>(null);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);

  // Connect to SSE stream
  useEffect(() => {
    const connectSSE = () => {
      console.log('🔌 [JOB STATE] Connecting to SSE stream at /api/jobs/stream');

      try {
        const es = new EventSource('/api/jobs/stream');
        setEventSource(es);

        es.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('📨 [JOB STATE] Received SSE message:', data);

            switch (data.type) {
              case 'connected':
                console.log('✅ [JOB STATE] Connected to job stream');
                break;

              case 'job_update':
                console.log('📊 [JOB STATE] Job update received:', data.data);
                console.log('🎯 [JOB STATE] Setting current job to:', data.data);
                setCurrentJob(data.data);
                break;

              case 'no_jobs':
                console.log('🚫 [JOB STATE] No active jobs - clearing current job');
                setCurrentJob(null);
                break;

              case 'error':
                console.error('❌ [JOB STATE] SSE error:', data.data);
                break;

              default:
                console.log('❓ [JOB STATE] Unknown SSE message type:', data.type);
            }
          } catch (error) {
            console.error('❌ [JOB STATE] Error parsing SSE message:', error);
          }
        };

        es.onerror = (error) => {
          console.error('❌ [JOB STATE] SSE connection error:', error);
          console.log('🔄 [JOB STATE] Will attempt to reconnect in 3 seconds');
          es.close();

          // Attempt to reconnect after 3 seconds
          setTimeout(connectSSE, 3000);
        };

        es.onopen = () => {
          console.log('🔗 [JOB STATE] SSE connection opened successfully');
        };

        // Set a timeout to check if connection was successful
        setTimeout(() => {
          if (es.readyState === EventSource.CONNECTING) {
            console.warn('⚠️ [JOB STATE] SSE connection still connecting after 5 seconds');
          }
        }, 5000);

      } catch (error) {
        console.error('❌ [JOB STATE] Failed to create SSE connection:', error);
      }
    };

    connectSSE();

    // Cleanup on unmount
    return () => {
      if (eventSource) {
        eventSource.close();
        console.log('🔌 [JOB STATE] SSE connection closed');
      }
    };
  }, []);

  // Debug logging for state changes
  useEffect(() => {
    console.log('🔄 [JOB STATE] State changed:', {
      currentJob,
      isJobRunning: currentJob?.status === 'running',
      jobProgress: currentJob?.progress || 0,
      jobType: currentJob?.type || '',
      jobStep: currentJob?.currentStep || null
    });
  }, [currentJob]);

  const setJobState = (job: BackgroundJob | null) => {
    setCurrentJob(job);
  };

  const clearJobState = () => {
    setCurrentJob(null);
  };

  const value: JobStateContextType = {
    currentJob,
    isJobRunning: currentJob?.status === 'running',
    jobProgress: currentJob?.progress || 0,
    jobType: currentJob?.type || '',
    jobStep: currentJob?.currentStep || null,
    setJobState,
    clearJobState,
  };

  return (
    <JobStateContext.Provider value={value}>
      {children}
    </JobStateContext.Provider>
  );
}

export function useJobState() {
  const context = useContext(JobStateContext);
  if (context === undefined) {
    throw new Error('useJobState must be used within a JobStateProvider');
  }
  return context;
}