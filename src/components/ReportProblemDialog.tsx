import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bug, Mail, Copy, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReportProblemDialogProps {
  children: React.ReactNode;
  errorDetails?: {
    error?: string;
    logs?: string;
    context?: string;
    runId?: string;
    runUrl?: string;
  };
}

export function ReportProblemDialog({ children, errorDetails }: ReportProblemDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const adminEmail = 'tio.olarewaju@gmail.com';

  const generateEmailContent = () => {
    const timestamp = new Date().toISOString();
    
    return `Subject: Problem Report - Visual Ansible EE Builder

Hi,

I'm experiencing an issue with the Visual Ansible EE Builder application.

## Problem Details
Please describe your problem here...

## Error Information
${errorDetails?.error ? `Error: ${errorDetails.error}` : 'No specific error provided'}

## Context
${errorDetails?.context || 'No context provided'}

## Additional Information
${errorDetails?.runId ? `Run ID: ${errorDetails.runId}` : ''}
${errorDetails?.runUrl ? `Run URL: ${errorDetails.runUrl}` : ''}

## Logs
${errorDetails?.logs ? `\`\`\`\n${errorDetails.logs}\n\`\`\`` : 'No logs provided'}

Thank you for your help!

---
Reported on: ${timestamp}`;
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(adminEmail);
      setIsCopied(true);
      toast({
        title: "Email copied to clipboard",
        description: "You can now paste it into your email client.",
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy email",
        description: "Please try again or copy manually.",
        variant: "destructive"
      });
    }
  };

  const handleCopyTemplate = async () => {
    try {
      await navigator.clipboard.writeText(generateEmailContent());
      toast({
        title: "Email template copied to clipboard",
        description: "You can now paste it into your email client and fill in the details.",
      });
    } catch (error) {
      toast({
        title: "Failed to copy template",
        description: "Please try again or copy manually.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Report a Problem
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              Having an issue? Contact us directly via email and we'll help you resolve it.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">Contact Information</h3>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Send your problem report to:</p>
                <p className="text-lg font-mono break-all">{adminEmail}</p>
              </div>
            </div>

            {errorDetails && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Error Context (Include in your email)</h4>
                <div className="p-3 bg-muted rounded-md text-sm font-mono max-h-32 overflow-y-auto">
                  {errorDetails.error && <div><strong>Error:</strong> {errorDetails.error}</div>}
                  {errorDetails.context && <div><strong>Context:</strong> {errorDetails.context}</div>}
                  {errorDetails.runId && <div><strong>Run ID:</strong> {errorDetails.runId}</div>}
                  {errorDetails.runUrl && <div><strong>Run URL:</strong> {errorDetails.runUrl}</div>}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <h4 className="font-medium text-sm">What to include in your email:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Description of the problem</li>
                <li>• Steps to reproduce the issue</li>
                <li>• Expected vs actual behavior</li>
                <li>• Any error messages you see</li>
                <li>• Your browser and operating system</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              onClick={handleCopyEmail}
              className="w-full"
            >
              {isCopied ? <CheckCircle className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {isCopied ? 'Email Copied!' : 'Copy Email Address'}
            </Button>

            <Button
              variant="outline"
              onClick={handleCopyTemplate}
              className="w-full"
            >
              <Mail className="h-4 w-4 mr-2" />
              Copy Email Template
            </Button>

            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="w-full"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}