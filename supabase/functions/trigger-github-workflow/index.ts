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

    // Get the workflow run URL for tracking
    const workflowRunsResponse = await fetch(
      'https://api.github.com/repos/tolarewaju3/visual-ansible-ee-builder/actions/runs?per_page=1',
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `token ${githubToken}`,
          'User-Agent': 'visual-ansible-ee-builder',
        },
      }
    );

    let runUrl = 'https://github.com/tolarewaju3/visual-ansible-ee-builder/actions';
    if (workflowRunsResponse.ok) {
      const runsData = await workflowRunsResponse.json();
      if (runsData.workflow_runs && runsData.workflow_runs.length > 0) {
        runUrl = runsData.workflow_runs[0].html_url;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Workflow triggered successfully',
        runUrl: runUrl
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error triggering workflow:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
