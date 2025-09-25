import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { CheckCircle, AlertCircle, XCircle, Loader2, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface LogEntry {
  timestamp: string;
  message: string;
  step?: string;
  level: 'info' | 'warning' | 'error' | 'success';
}

interface JobStep {
  name: string;
  status: string;
  conclusion: string | null;
  number: number;
  started_at: string | null;
  completed_at: string | null;
}

interface JobStatus {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  started_at: string | null;
  completed_at: string | null;
  steps: JobStep[];
}

interface PollingLogsProps {
  runId: string | null;
  runUrl?: string;
  onComplete?: (success: boolean) => void;
  className?: string;
}

export function PollingLogs({ runId, runUrl, onComplete, className }: PollingLogsProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [workflowStatus, setWorkflowStatus] = useState<string>('queued');
  const [workflowConclusion, setWorkflowConclusion] = useState<string | null>(null);
  const [jobs, setJobs] = useState<JobStatus[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isCompletedRef = useRef(false);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  // Polling function to get logs
  const fetchLogs = async () => {
    if (!runId || isCompletedRef.current) return;

    try {
      console.log('Polling logs for runId:', runId);
      
      const { data, error: fetchError } = await supabase.functions.invoke('get-workflow-logs', {
        body: { runId }
      });

      if (fetchError) {
        console.error('Error fetching logs:', fetchError);
        setError(fetchError.message);
        return;
      }

      if (data) {
        setError(null);
        setIsConnected(true);
        
        // Update logs
        if (data.logs) {
          setLogs(data.logs);
        }
        
        // Update workflow status
        if (data.status) {
          setWorkflowStatus(data.status);
          setWorkflowConclusion(data.conclusion);
        }
        
        // Update jobs
        if (data.jobs) {
          setJobs(data.jobs);
        }
        
        // Check if completed
        if (data.status === 'completed') {
          isCompletedRef.current = true;
          setIsConnected(false);
          
          if (onComplete) {
            onComplete(data.conclusion === 'success');
          }
          
          // Stop polling
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      }
    } catch (error) {
      console.error('Error in fetchLogs:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch logs');
    }
  };

  useEffect(() => {
    if (!runId) {
      console.log('No runId yet, will wait and show loading state');
      setError(null); // Clear any previous errors
      return;
    }

    console.log('Starting log polling for runId:', runId);
    isCompletedRef.current = false;
    setIsConnected(true);
    setError(null);
    
    // Initial fetch
    fetchLogs();
    
    // Start polling every 1 second for more responsive updates
    intervalRef.current = setInterval(fetchLogs, 1000);
    
    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [runId]);

  const getStatusIcon = (status: string, conclusion: string | null) => {
    if (status === 'completed') {
      if (conclusion === 'success') {
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      } else if (conclusion === 'failure') {
        return <XCircle className="h-4 w-4 text-red-500" />;
      } else {
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      }
    } else if (status === 'in_progress') {
      return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
    } else {
      return <Loader2 className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string, conclusion: string | null) => {
    if (status === 'completed') {
      if (conclusion === 'success') return 'default';
      if (conclusion === 'failure') return 'destructive';
      return 'secondary';
    }
    if (status === 'in_progress') return 'secondary';
    return 'outline';
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'text-red-400';
      case 'warning':
        return 'text-yellow-400';
      case 'success':
        return 'text-green-400';
      default:
        return 'text-gray-300';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  if (!runId) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <div className="text-center">
              <div className="font-medium">Finding your build...</div>
              <div className="text-sm mt-1">Looking for the newly triggered workflow run</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Build Logs</CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {getStatusIcon(workflowStatus, workflowConclusion)}
              <Badge variant={getStatusBadgeVariant(workflowStatus, workflowConclusion)}>
                {workflowStatus}
                {workflowConclusion && `: ${workflowConclusion}`}
              </Badge>
            </div>
          </div>
        </div>
        
        {/* Connection status */}
        <div className="text-sm text-muted-foreground">
          {isConnected ? (
            <span className="flex items-center gap-1">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              Polling for updates every second
            </span>
          ) : error ? (
            <span className="flex items-center gap-1 text-red-500">
              <div className="h-2 w-2 bg-red-500 rounded-full" />
              {error}
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <div className="h-2 w-2 bg-yellow-500 rounded-full" />
              Connecting...
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Job Status with Steps */}
        {jobs.length > 0 && (
          <div className="px-6 pb-4">
            <div className="space-y-3">
              {jobs.map((job) => (
                <div key={job.id} className="space-y-2">
                  {/* Job Header */}
                  <div className="flex items-center gap-2 text-sm font-medium">
                    {getStatusIcon(job.status, job.conclusion)}
                    <span>{job.name}</span>
                    <Badge variant={getStatusBadgeVariant(job.status, job.conclusion)} className="text-xs">
                      {job.status}
                      {job.conclusion && `: ${job.conclusion}`}
                    </Badge>
                  </div>
                  
                  {/* Steps */}
                  {job.steps && job.steps.length > 0 && (
                    <div className="ml-6 space-y-1">
                      {job.steps.map((step) => (
                        <div key={`${job.id}-${step.number}`} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <div className="h-1 w-1 rounded-full bg-current" />
                          <span className="min-w-0 flex-1">{step.name}</span>
                          {step.status === 'in_progress' && (
                            <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                          )}
                          {step.status === 'completed' && step.conclusion === 'success' && (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          )}
                          {step.status === 'completed' && step.conclusion !== 'success' && (
                            <XCircle className="h-3 w-3 text-red-500" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <Separator className="mt-4" />
          </div>
        )}

        {/* Logs */}
        <ScrollArea className="h-96" ref={scrollRef}>
          <div className="p-6 pt-0">
            {logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-muted-foreground py-8 space-y-3">
                <Loader2 className="h-8 w-8 animate-spin" />
                <div className="text-center">
                  <div className="font-medium">{isConnected ? 'Fetching build logs...' : 'Connecting to build...'}</div>
                  <div className="text-sm">This may take a moment to start</div>
                </div>
              </div>
            ) : (
              <div className="font-mono text-sm space-y-1">
                {logs.map((log, index) => (
                  <div key={index} className="flex gap-3">
                    <span className="text-xs text-muted-foreground shrink-0 w-20">
                      {formatTimestamp(log.timestamp)}
                    </span>
                    {log.step && (
                      <span className="text-xs text-blue-400 shrink-0 w-24 truncate">
                        [{log.step}]
                      </span>
                    )}
                    <span className={`break-all ${getLevelColor(log.level)}`}>
                      {log.message}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
