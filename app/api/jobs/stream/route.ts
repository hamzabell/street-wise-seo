/**
 * SSE endpoint for real-time background job updates
 */

import { NextRequest } from 'next/server';
import { getSupabaseUserId } from '@/lib/db/queries';
import { jobManager } from '@/lib/background/job-manager';

export async function GET(request: NextRequest) {
  // Get authenticated user
  const supabaseUserId = await getSupabaseUserId();
  if (!supabaseUserId) {
    return new Response('Unauthorized', { status: 401 });
  }

  console.log(`🔄 [SSE] Starting job stream for user ${supabaseUserId}`);

  // Create a TransformStream for SSE
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  // Send initial connection message
  const sendMessage = async (data: any) => {
    const message = `data: ${JSON.stringify(data)}\n\n`;
    await writer.write(encoder.encode(message));
  };

  // Send initial connection message
  await sendMessage({ type: 'connected', message: 'Connected to job stream' });

  // Function to check for active jobs and send updates
  const checkJobs = async () => {
    try {
      const activeJobs = await jobManager.getUserActiveJobs(supabaseUserId);

      if (activeJobs.length > 0) {
        const job = activeJobs[0]; // Get the most recent active job

        await sendMessage({
          type: 'job_update',
          data: {
            id: job.id,
            type: job.type,
            status: job.status,
            progress: job.progress,
            currentStep: job.currentStep,
            createdAt: job.createdAt.toISOString(),
            startedAt: job.startedAt?.toISOString() || null,
            error: job.error,
          }
        });

        console.log(`📊 [SSE] Job update sent: ${job.type} - ${job.progress}% - ${job.currentStep}`);
      } else {
        // Send no active jobs message
        await sendMessage({
          type: 'no_jobs',
          data: { message: 'No active jobs' }
        });
      }
    } catch (error) {
      console.error('❌ [SSE] Error checking jobs:', error);
      await sendMessage({
        type: 'error',
        data: { message: 'Error checking jobs' }
      });
    }
  };

  // Initial check
  await checkJobs();

  // Set up polling for job updates (every 2 seconds)
  const interval = setInterval(checkJobs, 2000);

  // Handle client disconnect
  request.signal.addEventListener('abort', () => {
    console.log(`🔌 [SSE] Client disconnected for user ${supabaseUserId}`);
    clearInterval(interval);
    writer.close();
  });

  // Return the SSE response
  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}