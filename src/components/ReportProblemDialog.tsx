import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bug, Send, Copy, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    problemType: '',
    description: '',
    stepsToReproduce: '',
    expectedBehavior: '',
    actualBehavior: '',
    contactEmail: user?.email || '',
    additionalInfo: ''
  });

  const problemTypes = [
    { value: 'build-failure', label: 'Build Failure' },
    { value: 'ui-bug', label: 'UI Bug' },
    { value: 'performance', label: 'Performance Issue' },
    { value: 'authentication', label: 'Authentication Issue' },
    { value: 'subscription', label: 'Subscription Issue' },
    { value: 'other', label: 'Other' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateReportContent = () => {
    const timestamp = new Date().toISOString();
    const userInfo = user ? `User: ${user.email} (${user.id})` : 'User: Anonymous';
    
    return `# Problem Report - ${timestamp}

## User Information
${userInfo}

## Problem Type
${formData.problemType}

## Description
${formData.description}

## Steps to Reproduce
${formData.stepsToReproduce}

## Expected Behavior
${formData.expectedBehavior}

## Actual Behavior
${formData.actualBehavior}

## Additional Information
${formData.additionalInfo}

## Error Details
${errorDetails?.error ? `Error: ${errorDetails.error}` : 'No specific error provided'}

## Context
${errorDetails?.context || 'No context provided'}

## Run Information
${errorDetails?.runId ? `Run ID: ${errorDetails.runId}` : 'No run ID'}
${errorDetails?.runUrl ? `Run URL: ${errorDetails.runUrl}` : 'No run URL'}

## Logs
${errorDetails?.logs ? `\`\`\`\n${errorDetails.logs}\n\`\`\`` : 'No logs provided'}

## Contact Information
Email: ${formData.contactEmail}
`;
  };

  const handleCopyReport = async () => {
    try {
      await navigator.clipboard.writeText(generateReportContent());
      setIsCopied(true);
      toast({
        title: "Report copied to clipboard",
        description: "You can now paste this into your issue tracker or email.",
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy report",
        description: "Please try again or copy manually.",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async () => {
    if (!formData.problemType || !formData.description) {
      toast({
        title: "Missing required fields",
        description: "Please fill in the problem type and description.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // For now, we'll just copy the report to clipboard
      // In the future, this could send to a backend service
      await handleCopyReport();
      
      toast({
        title: "Report prepared",
        description: "Your problem report has been copied to clipboard. You can paste it into GitHub Issues or send it via email.",
      });
      
      setIsOpen(false);
      
      // Reset form
      setFormData({
        problemType: '',
        description: '',
        stepsToReproduce: '',
        expectedBehavior: '',
        actualBehavior: '',
        contactEmail: user?.email || '',
        additionalInfo: ''
      });
    } catch (error) {
      toast({
        title: "Failed to prepare report",
        description: "Please try again or contact support directly.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Report a Problem
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Alert>
            <Bug className="h-4 w-4" />
            <AlertDescription>
              Help us improve by reporting issues. Your feedback helps us fix bugs and enhance the user experience.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="problemType">Problem Type *</Label>
              <Select value={formData.problemType} onValueChange={(value) => handleInputChange('problemType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select the type of problem" />
                </SelectTrigger>
                <SelectContent>
                  {problemTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the problem in detail..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stepsToReproduce">Steps to Reproduce</Label>
              <Textarea
                id="stepsToReproduce"
                placeholder="1. Go to...&#10;2. Click on...&#10;3. See error..."
                value={formData.stepsToReproduce}
                onChange={(e) => handleInputChange('stepsToReproduce', e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expectedBehavior">Expected Behavior</Label>
                <Textarea
                  id="expectedBehavior"
                  placeholder="What should have happened?"
                  value={formData.expectedBehavior}
                  onChange={(e) => handleInputChange('expectedBehavior', e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="actualBehavior">Actual Behavior</Label>
                <Textarea
                  id="actualBehavior"
                  placeholder="What actually happened?"
                  value={formData.actualBehavior}
                  onChange={(e) => handleInputChange('actualBehavior', e.target.value)}
                  rows={2}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                placeholder="your.email@example.com"
                value={formData.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalInfo">Additional Information</Label>
              <Textarea
                id="additionalInfo"
                placeholder="Any other relevant information..."
                value={formData.additionalInfo}
                onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                rows={2}
              />
            </div>

            {errorDetails && (
              <div className="space-y-2">
                <Label>Error Context (Auto-included)</Label>
                <div className="p-3 bg-muted rounded-md text-sm font-mono">
                  {errorDetails.error && <div><strong>Error:</strong> {errorDetails.error}</div>}
                  {errorDetails.context && <div><strong>Context:</strong> {errorDetails.context}</div>}
                  {errorDetails.runId && <div><strong>Run ID:</strong> {errorDetails.runId}</div>}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleCopyReport}
              disabled={isSubmitting}
            >
              {isCopied ? <CheckCircle className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {isCopied ? 'Copied!' : 'Copy Report'}
            </Button>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Preparing...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Report
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
