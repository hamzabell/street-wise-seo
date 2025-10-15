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
    let reconnectTimeout: NodeJS.Timeout;
    let connectionAttempts = 0;
    const maxConnectionAttempts = 3; // Reduced attempts to reduce noise

    const connectSSE = () => {
      connectionAttempts++;
      console.log(`🔌 [JOB STATE] Connecting to SSE stream (attempt ${connectionAttempts}/${maxConnectionAttempts})`);

      // Clear any existing timeout
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }

      // Stop trying after max attempts
      if (connectionAttempts > maxConnectionAttempts) {
        console.warn('⚠️ [JOB STATE] Max connection attempts reached, SSE may not be essential for current operation');
        return;
      }

      try {
        const es = new EventSource('/api/jobs/stream');
        setEventSource(es);

        es.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('📨 [JOB STATE] Received SSE message:', data);

            // Reset connection attempts on successful message
            connectionAttempts = 0;

            switch (data.type) {
              case 'connected':
                console.log('✅ [JOB STATE] Connected to job stream');
                break;

              case 'job_update':
                console.log('📊 [JOB STATE] Job update received:', data.data);
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
          es.close();

          // Only reconnect if we haven't exceeded max attempts
          if (connectionAttempts < maxConnectionAttempts) {
            // Shorter backoff for better UX
            const backoffDelay = Math.min(2000 * Math.pow(2, connectionAttempts - 1), 10000);
            console.log(`🔄 [JOB STATE] Will attempt to reconnect in ${backoffDelay/1000}s`);
            reconnectTimeout = setTimeout(connectSSE, backoffDelay);
          } else {
            console.warn('⚠️ [JOB STATE] SSE connection failed - continuing without real-time updates');
          }
        };

        es.onopen = () => {
          console.log('🔗 [JOB STATE] SSE connection opened successfully');
          // Reset connection attempts on successful connection
          connectionAttempts = 0;
        };

        // Reduced timeout for better UX
        const connectionTimeout = setTimeout(() => {
          if (es.readyState === EventSource.CONNECTING) {
            console.warn('⚠️ [JOB STATE] SSE connection taking longer than expected');
            // Don't automatically close - let it try to connect naturally
            // This reduces connection churn
          }
        }, 3000); // Reduced from 5 seconds

        // Clear the timeout if the connection closes or opens successfully
        es.addEventListener('open', () => {
          clearTimeout(connectionTimeout);
        }, { once: true });

        es.addEventListener('error', () => {
          clearTimeout(connectionTimeout);
        }, { once: true });

      } catch (error) {
        console.error('❌ [JOB STATE] Failed to create SSE connection:', error);
        // Only try again if we haven't exceeded max attempts
        if (connectionAttempts < maxConnectionAttempts) {
          reconnectTimeout = setTimeout(connectSSE, 3000);
        }
      }
    };

    // Start connection
    connectSSE();

    // Cleanup on unmount
    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
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