import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const githubToken = Deno.env.get('GITHUB_TOKEN');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

interface LogEntry {
  timestamp: string;
  message: string;
  step?: string;
  level: 'info' | 'warning' | 'error' | 'success';
}

interface JobStatus {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
}

async function getWorkflowRun(runId: string): Promise<any> {
  const response = await fetch(
    `https://api.github.com/repos/tolarewaju3/visual-ansible-ee-builder/actions/runs/${runId}`,
    {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${githubToken}`,
        'User-Agent': 'visual-ansible-ee-builder',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get workflow run: ${response.status}`);
  }

  return await response.json();
}

async function getWorkflowJobs(runId: string): Promise<JobStatus[]> {
  const response = await fetch(
    `https://api.github.com/repos/tolarewaju3/visual-ansible-ee-builder/actions/runs/${runId}/jobs`,
    {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${githubToken}`,
        'User-Agent': 'visual-ansible-ee-builder',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get workflow jobs: ${response.status}`);
  }

  const data = await response.json();
  return data.jobs || [];
}

async function getJobLogs(jobId: number): Promise<string> {
  const response = await fetch(
    `https://api.github.com/repos/tolarewaju3/visual-ansible-ee-builder/actions/jobs/${jobId}/logs`,
    {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${githubToken}`,
        'User-Agent': 'visual-ansible-ee-builder',
      },
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      return ''; // Logs not available yet
    }
    throw new Error(`Failed to get job logs: ${response.status}`);
  }

  return await response.text();
}

// Get detailed job with steps
async function getJobWithSteps(runId: string): Promise<any[]> {
  const response = await fetch(
    `https://api.github.com/repos/tolarewaju3/visual-ansible-ee-builder/actions/runs/${runId}/jobs`,
    {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${githubToken}`,
        'User-Agent': 'visual-ansible-ee-builder',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get job details: ${response.status}`);
  }

  const data = await response.json();
  return data.jobs || [];
}

// Generate synthetic logs for job/step status updates
function generateStatusLogs(jobs: any[], previousJobs: any[] = []): LogEntry[] {
  const statusLogs: LogEntry[] = [];
  const now = new Date().toISOString();
  
  jobs.forEach(job => {
    const prevJob = previousJobs.find(p => p.id === job.id);
    
    // Job status changes
    if (!prevJob || prevJob.status !== job.status) {
      let message = '';
      let level: LogEntry['level'] = 'info';
      
      switch (job.status) {
        case 'queued':
          message = `Job "${job.name}" queued`;
          break;
        case 'in_progress':
          message = `Job "${job.name}" started`;
          level = 'info';
          break;
        case 'completed':
          message = `Job "${job.name}" ${job.conclusion === 'success' ? 'completed successfully' : `failed with conclusion: ${job.conclusion}`}`;
          level = job.conclusion === 'success' ? 'success' : 'error';
          break;
      }
      
      if (message) {
        statusLogs.push({
          timestamp: job.started_at || now,
          message,
          step: job.name,
          level
        });
      }
    }
    
    // Step status changes
    if (job.steps) {
      job.steps.forEach((step: any) => {
        const prevStep = prevJob?.steps?.find((p: any) => p.number === step.number);
        
        if (!prevStep || prevStep.status !== step.status) {
          let message = '';
          let level: LogEntry['level'] = 'info';
          
          switch (step.status) {
            case 'in_progress':
              message = `Step ${step.number}: ${step.name} - Started`;
              break;
            case 'completed':
              message = `Step ${step.number}: ${step.name} - ${step.conclusion === 'success' ? 'Completed' : `Failed (${step.conclusion})`}`;
              level = step.conclusion === 'success' ? 'success' : 'error';
              break;
          }
          
          if (message) {
            statusLogs.push({
              timestamp: step.started_at || step.completed_at || now,
              message,
              step: job.name,
              level
            });
          }
        }
      });
    }
  });
  
  return statusLogs;
}

function parseLogsToEntries(rawLogs: string, jobName: string): LogEntry[] {
  const lines = rawLogs.split('\n').filter(line => line.trim());
  const entries: LogEntry[] = [];
  
  for (const line of lines) {
    // Extract timestamp if present (GitHub Actions log format)
    const timestampMatch = line.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z)/);
    const timestamp = timestampMatch ? timestampMatch[1] : new Date().toISOString();
    
    // Remove timestamp from message
    const message = timestampMatch ? line.substring(timestampMatch[0].length).trim() : line;
    
    // Skip empty messages
    if (!message) continue;
    
    // Determine log level based on content
    let level: LogEntry['level'] = 'info';
    if (message.toLowerCase().includes('error') || message.toLowerCase().includes('failed')) {
      level = 'error';
    } else if (message.toLowerCase().includes('warning') || message.toLowerCase().includes('warn')) {
      level = 'warning';
    } else if (message.toLowerCase().includes('completed') || message.toLowerCase().includes('success')) {
      level = 'success';
    }

    entries.push({
      timestamp,
      message,
      step: jobName,
      level
    });
  }
  
  return entries;
}

serve(async (req) => {
  console.log('Get workflow logs function called with method:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header (same as trigger-github-workflow)
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Initialize Supabase client (same as trigger-github-workflow)
    const supabase = createClient(supabaseUrl!, supabaseServiceRoleKey!);

    // Get user from JWT (same as trigger-github-workflow)
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);
    
    if (userError || !user) {
      throw new Error('Invalid or expired token');
    }

    console.log('User authenticated successfully:', user.id);

    // Get runId from request body
    const { runId } = await req.json();
    
    if (!runId) {
      return new Response(
        JSON.stringify({ error: 'runId is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!githubToken) {
      return new Response(
        JSON.stringify({ error: 'GitHub token not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Fetching data for runId:', runId);

    // Get workflow run status and validate it exists
    let workflowRun;
    try {
      workflowRun = await getWorkflowRun(runId);
      console.log(`Found workflow run ${runId}: status=${workflowRun.status}, created=${workflowRun.created_at}`);
    } catch (error) {
      console.error(`Failed to fetch workflow run ${runId}:`, error);
      throw new Error(`Workflow run ${runId} not found or not accessible`);
    }
    console.log(`Workflow status: ${workflowRun.status}, conclusion: ${workflowRun.conclusion}`);
    
    // Get detailed jobs with steps
    const jobs = await getJobWithSteps(runId);
    console.log(`Found ${jobs.length} jobs`);
    
    // Generate status update logs (these show immediately even if full logs aren't ready)
    const statusLogs = generateStatusLogs(jobs);
    console.log(`Generated ${statusLogs.length} status logs`);
    
    // Get actual logs for completed/running jobs
    const actualLogs: LogEntry[] = [];
    
    for (const job of jobs) {
      try {
        // Only try to get logs for jobs that have started
        if (job.status !== 'queued') {
          const rawLogs = await getJobLogs(job.id);
          if (rawLogs) {
            console.log(`Got ${rawLogs.length} characters of logs for job ${job.name}`);
            const logEntries = parseLogsToEntries(rawLogs, job.name);
            actualLogs.push(...logEntries);
          } else {
            console.log(`No logs available yet for job ${job.name} (status: ${job.status})`);
          }
        }
      } catch (logError) {
        console.log(`Could not fetch logs for job ${job.id} (${job.name}):`, logError);
        // Add a log entry about the error
        actualLogs.push({
          timestamp: new Date().toISOString(),
          message: `Could not fetch logs for ${job.name}: ${logError.message}`,
          step: job.name,
          level: 'warning'
        });
      }
    }
    
    // Combine status logs and actual logs
    const allLogs = [...statusLogs, ...actualLogs];
    
    // Sort logs by timestamp
    allLogs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    console.log(`Returning ${allLogs.length} total log entries (${statusLogs.length} status + ${actualLogs.length} actual) for ${jobs.length} jobs`);

    return new Response(
      JSON.stringify({
        success: true,
        status: workflowRun.status,
        conclusion: workflowRun.conclusion,
        logs: allLogs,
        jobs: jobs.map(job => ({
          id: job.id,
          name: job.name,
          status: job.status,
          conclusion: job.conclusion,
          started_at: job.started_at,
          completed_at: job.completed_at,
          steps: job.steps ? job.steps.map((step: any) => ({
            name: step.name,
            status: step.status,
            conclusion: step.conclusion,
            number: step.number,
            started_at: step.started_at,
            completed_at: step.completed_at
          })) : []
        })),
        workflow_run: {
          id: workflowRun.id,
          status: workflowRun.status,
          conclusion: workflowRun.conclusion,
          created_at: workflowRun.created_at,
          updated_at: workflowRun.updated_at,
          html_url: workflowRun.html_url
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error getting workflow logs:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
