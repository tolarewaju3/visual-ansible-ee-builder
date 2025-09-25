import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const githubToken = Deno.env.get('GITHUB_TOKEN');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl!, supabaseServiceRoleKey!);

    // Get user from JWT
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);
    
    if (userError || !user) {
      throw new Error('Invalid or expired token');
    }

    const { image, eeZipB64, registryUsername, registryPassword } = await req.json();

    if (!image || !eeZipB64 || !registryUsername || !registryPassword) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters: image, eeZipB64, registryUsername, and registryPassword are all required' 
        }),
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

    // Trigger GitHub Actions workflow
    const workflowResponse = await fetch(
      'https://api.github.com/repos/tolarewaju3/visual-ansible-ee-builder/actions/workflows/main.yml/dispatches',
      {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `token ${githubToken}`,
          'Content-Type': 'application/json',
          'User-Agent': 'visual-ansible-ee-builder',
        },
        body: JSON.stringify({
          ref: 'main',
          inputs: {
            image: image,
            ee_yaml_path: 'test/execution-environment.yml',
            ee_zip_b64: eeZipB64,
            registry_username: registryUsername,
            registry_password: registryPassword,
          },
        }),
      }
    );

    if (!workflowResponse.ok) {
      const errorText = await workflowResponse.text();
      console.error('GitHub API error:', errorText);
      throw new Error(`GitHub API error: ${workflowResponse.status} ${workflowResponse.statusText}`);
    }

    // Wait for the workflow run to be created and get its ID
    const triggerTime = new Date();
    let runUrl = 'https://github.com/tolarewaju3/visual-ansible-ee-builder/actions';
    let runId = null;
    
    console.log('Looking for newly triggered workflow run...');
    
    // Retry logic to find the newly created workflow run
    for (let attempt = 0; attempt < 10; attempt++) {
      // Wait before checking (starts with 1 second, increases each attempt)
      if (attempt > 0) {
        console.log(`Attempt ${attempt + 1}: Waiting ${1000 + (attempt * 500)}ms before checking...`);
        await new Promise(resolve => setTimeout(resolve, 1000 + (attempt * 500)));
      }
      
      try {
        const workflowRunsResponse = await fetch(
          'https://api.github.com/repos/tolarewaju3/visual-ansible-ee-builder/actions/runs?per_page=10&event=workflow_dispatch',
          {
            headers: {
              'Accept': 'application/vnd.github.v3+json',
              'Authorization': `token ${githubToken}`,
              'User-Agent': 'visual-ansible-ee-builder',
            },
          }
        );

        if (workflowRunsResponse.ok) {
          const runsData = await workflowRunsResponse.json();
          
          if (runsData.workflow_runs && runsData.workflow_runs.length > 0) {
            // Find the most recent workflow_dispatch run that was created after we triggered
            for (const run of runsData.workflow_runs) {
              const runCreatedAt = new Date(run.created_at);
              const timeDiff = runCreatedAt.getTime() - triggerTime.getTime();
              
              console.log(`Checking run ${run.id}: created at ${run.created_at}, time diff: ${timeDiff}ms`);
              
              // Look for runs created within 2 minutes after our trigger (allowing for some clock skew)
              if (timeDiff >= -5000 && timeDiff <= 120000) {
                runUrl = run.html_url;
                runId = run.id;
                console.log(`✓ Found matching workflow run: ${runId} created at ${run.created_at}`);
                break;
              }
            }
          }
        }
        
        // If we found a run, break out of retry loop
        if (runId) {
          break;
        }
        
        console.log(`Attempt ${attempt + 1}: No matching workflow run found yet`);
        
      } catch (fetchError) {
        console.log(`Attempt ${attempt + 1} failed to fetch runs:`, fetchError);
      }
    }
    
    if (!runId) {
      console.warn('Could not find the specific workflow run within timeout period - using fallback');
      // Fallback: get the most recent workflow_dispatch run
      try {
        const fallbackResponse = await fetch(
          'https://api.github.com/repos/tolarewaju3/visual-ansible-ee-builder/actions/runs?per_page=1&event=workflow_dispatch',
          {
            headers: {
              'Accept': 'application/vnd.github.v3+json',
              'Authorization': `token ${githubToken}`,
              'User-Agent': 'visual-ansible-ee-builder',
            },
          }
        );
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          if (fallbackData.workflow_runs && fallbackData.workflow_runs.length > 0) {
            const latestRun = fallbackData.workflow_runs[0];
            runUrl = latestRun.html_url;
            runId = latestRun.id;
            console.log(`Using fallback run: ${runId}`);
          }
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Workflow triggered successfully',
        runUrl: runUrl,
        runId: runId
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error triggering workflow:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
