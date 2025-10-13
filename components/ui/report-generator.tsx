'use client';

import { useState, useEffect } from 'react';
import { useSWRConfig } from 'swr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface ReportGeneratorProps {
  websiteAnalysisId?: number;
  websiteUrl?: string;
  domain?: string;
  trigger?: React.ReactNode;
}

interface GenerationState {
  isGenerating: boolean;
  progress: number;
  stage: string;
  error: string | null;
  completed: boolean;
  reportData?: {
    title: string;
    fileName: string;
    fileSize: number;
    generatedAt: string;
  };
}

export function ReportGenerator({
  websiteAnalysisId,
  websiteUrl,
  domain,
  trigger
}: ReportGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [clientName, setClientName] = useState('');
  const [reportType, setReportType] = useState<'audit' | 'competitor_analysis' | 'performance'>('audit');
  const [generation, setGeneration] = useState<GenerationState>({
    isGenerating: false,
    progress: 0,
    stage: '',
    error: null,
    completed: false
  });
  const [primaryWebsiteUrl, setPrimaryWebsiteUrl] = useState<string>('');
  const [customWebsiteUrl, setCustomWebsiteUrl] = useState('');
  const [competitorUrl, setCompetitorUrl] = useState('');
  const [usePrimaryWebsite, setUsePrimaryWebsite] = useState(true);
  const [loadingWebsites, setLoadingWebsites] = useState(false);

  const { mutate } = useSWRConfig();

  // Fetch primary website when dialog opens
  useEffect(() => {
    if (isOpen && !primaryWebsiteUrl) {
      fetchPrimaryWebsite();
    }
  }, [isOpen]);

  const fetchPrimaryWebsite = async () => {
    setLoadingWebsites(true);
    try {
      const response = await fetch('/api/user/website');
      if (response.ok) {
        const data = await response.json();
        setPrimaryWebsiteUrl(data.data.primaryWebsiteUrl || '');
        if (websiteUrl && !data.data.primaryWebsiteUrl) {
          setPrimaryWebsiteUrl(websiteUrl);
        }
      }
    } catch (error) {
      console.error('Error fetching primary website:', error);
    } finally {
      setLoadingWebsites(false);
    }
  };

  const validateInputs = () => {
    if (!clientName.trim()) {
      return 'Please provide a client name';
    }

    if (reportType === 'audit') {
      if (!websiteAnalysisId) {
        return 'Website analysis is required for audit reports';
      }
    }

    if (reportType === 'competitor_analysis') {
      if (!competitorUrl.trim()) {
        return 'Competitor URL is required for competitor analysis reports';
      }
      if (usePrimaryWebsite && !primaryWebsiteUrl && !customWebsiteUrl.trim()) {
        return 'Please set up your primary website or provide a custom website URL';
      }
      if (!usePrimaryWebsite && !customWebsiteUrl.trim()) {
        return 'Custom website URL is required when not using primary website';
      }
    }

    if (reportType === 'performance') {
      if (usePrimaryWebsite && !primaryWebsiteUrl && !customWebsiteUrl.trim()) {
        return 'Please set up your primary website or provide a custom website URL';
      }
      if (!usePrimaryWebsite && !customWebsiteUrl.trim()) {
        return 'Custom website URL is required when not using primary website';
      }
    }

    return null;
  };

  const generateReport = async () => {
    const validationError = validateInputs();
    if (validationError) {
      setGeneration(prev => ({
        ...prev,
        error: validationError
      }));
      return;
    }

    setGeneration({
      isGenerating: true,
      progress: 0,
      stage: 'Initializing report generation...',
      error: null,
      completed: false
    });

    try {
      // Set progress stages based on report type
      let progressStages;
      if (reportType === 'competitor_analysis') {
        progressStages = [
          { progress: 10, stage: 'Analyzing competitor website...' },
          { progress: 20, stage: 'Analyzing your website...' },
          { progress: 35, stage: 'Comparing content strategies...' },
          { progress: 50, stage: 'Identifying content gaps...' },
          { progress: 65, stage: 'Analyzing keyword overlap...' },
          { progress: 80, stage: 'Generating competitive insights...' },
          { progress: 90, stage: 'Creating competitor analysis report...' },
          { progress: 100, stage: 'Finalizing competitor report...' }
        ];
      } else if (reportType === 'performance') {
        progressStages = [
          { progress: 10, stage: 'Analyzing website performance...' },
          { progress: 25, stage: 'Calculating ranking scores...' },
          { progress: 40, stage: 'Evaluating content quality...' },
          { progress: 55, stage: 'Assessing technical SEO...' },
          { progress: 70, stage: 'Measuring traffic metrics...' },
          { progress: 80, stage: 'Generating performance insights...' },
          { progress: 90, stage: 'Creating performance report...' },
          { progress: 100, stage: 'Finalizing performance report...' }
        ];
      } else {
        progressStages = [
          { progress: 10, stage: 'Analyzing website data...' },
          { progress: 25, stage: 'Compiling technical issues...' },
          { progress: 40, stage: 'Processing content gaps...' },
          { progress: 55, stage: 'Analyzing keywords...' },
          { progress: 70, stage: 'Generating recommendations...' },
          { progress: 85, stage: 'Creating report layout...' },
          { progress: 95, stage: 'Generating PDF document...' },
          { progress: 100, stage: 'Finalizing report...' }
        ];
      }

      let currentStageIndex = 0;
      const progressInterval = setInterval(() => {
        if (currentStageIndex < progressStages.length) {
          const stage = progressStages[currentStageIndex];
          setGeneration(prev => ({
            ...prev,
            progress: stage.progress,
            stage: stage.stage
          }));
          currentStageIndex++;
        } else {
          clearInterval(progressInterval);
        }
      }, 800);

      // Prepare request payload
      const requestPayload: any = {
        clientName: clientName.trim(),
        reportType,
        usePrimaryWebsite
      };

      // Add website analysis ID for audit reports
      if (reportType === 'audit' && websiteAnalysisId) {
        requestPayload.websiteAnalysisId = websiteAnalysisId;
      }

      // Add website URLs for competitor and performance reports
      if (reportType === 'competitor_analysis') {
        requestPayload.competitorUrl = competitorUrl.trim();
        if (!usePrimaryWebsite) {
          requestPayload.websiteUrl = customWebsiteUrl.trim();
        }
      }

      if (reportType === 'performance') {
        if (!usePrimaryWebsite) {
          requestPayload.websiteUrl = customWebsiteUrl.trim();
        }
      }

      // Call the API to generate the report
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate report');
      }

      const result = await response.json();

      setGeneration({
        isGenerating: false,
        progress: 100,
        stage: 'Report generated successfully!',
        error: null,
        completed: true,
        reportData: result.report
      });

      // Refresh reports list
      mutate('/api/reports');

    } catch (error) {
      setGeneration({
        isGenerating: false,
        progress: 0,
        stage: '',
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        completed: false
      });
    }
  };

  const downloadReport = () => {
    if (generation.reportData) {
      // Use the correct API route with file parameter
      const link = document.createElement('a');
      link.href = `/api/reports/download?file=${encodeURIComponent(generation.reportData.fileName)}`;
      link.download = generation.reportData.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const resetAndClose = () => {
    setGeneration({
      isGenerating: false,
      progress: 0,
      stage: '',
      error: null,
      completed: false
    });
    setClientName('');
    setCustomWebsiteUrl('');
    setCompetitorUrl('');
    setUsePrimaryWebsite(true);
    setIsOpen(false);
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const defaultTrigger = (
    <Button>
      <FileText className="mr-2 h-4 w-4" />
      Generate Report
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Generate SEO Report</DialogTitle>
          <DialogDescription>
            Create a professional PDF report for your client based on the website analysis.
          </DialogDescription>
        </DialogHeader>

        {!generation.completed ? (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="client-name">Client Name</Label>
              <Input
                id="client-name"
                placeholder="Enter client name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                disabled={generation.isGenerating}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="report-type">Report Type</Label>
              <Select
                value={reportType}
                onValueChange={(value: 'audit' | 'competitor_analysis' | 'performance') => setReportType(value)}
                disabled={generation.isGenerating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="audit">SEO Audit Report</SelectItem>
                  <SelectItem value="competitor_analysis">Competitor Analysis Report</SelectItem>
                  <SelectItem value="performance">Performance Analysis Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Website Selection Section - Show for competitor and performance reports */}
            {(reportType === 'competitor_analysis' || reportType === 'performance') && (
              <div className="grid gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="use-primary-website"
                    checked={usePrimaryWebsite}
                    onChange={(e) => setUsePrimaryWebsite(e.target.checked)}
                    disabled={generation.isGenerating || loadingWebsites}
                    className="rounded"
                  />
                  <Label htmlFor="use-primary-website" className="text-sm font-medium">
                    Use my primary website
                  </Label>
                </div>

                {usePrimaryWebsite ? (
                  <div className="text-sm">
                    {loadingWebsites ? (
                      <div className="flex items-center gap-2 text-gray-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading primary website...
                      </div>
                    ) : primaryWebsiteUrl ? (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                        <div className="text-green-800">
                          <strong>Primary Website:</strong> {primaryWebsiteUrl}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                        <div className="text-amber-800 text-sm">
                          No primary website configured. Please set up your primary website or use a custom URL.
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid gap-2">
                    <Label htmlFor="custom-website-url">Custom Website URL</Label>
                    <Input
                      id="custom-website-url"
                      placeholder="https://example.com"
                      value={customWebsiteUrl}
                      onChange={(e) => setCustomWebsiteUrl(e.target.value)}
                      disabled={generation.isGenerating}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Competitor URL Section - Show for competitor analysis reports */}
            {reportType === 'competitor_analysis' && (
              <div className="grid gap-2">
                <Label htmlFor="competitor-url">Competitor Website URL</Label>
                <Input
                  id="competitor-url"
                  placeholder="https://competitor.com"
                  value={competitorUrl}
                  onChange={(e) => setCompetitorUrl(e.target.value)}
                  disabled={generation.isGenerating}
                />
                <p className="text-xs text-gray-500">
                  Enter the competitor's website URL to analyze against your website
                </p>
              </div>
            )}

            {/* Show existing website info for audit reports */}
            {reportType === 'audit' && websiteUrl && (
              <div className="text-sm text-gray-600 p-3 bg-blue-50 rounded-md">
                <strong>Website:</strong> {websiteUrl}
              </div>
            )}

            {generation.isGenerating && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm font-medium">{generation.stage}</span>
                </div>
                <Progress value={generation.progress} className="w-full" />
                <div className="text-xs text-gray-500 text-right">
                  {generation.progress}% complete
                </div>
              </div>
            )}

            {generation.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{generation.error}</AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Report Generated Successfully!</span>
            </div>

            {generation.reportData && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div>
                  <strong>Title:</strong> {generation.reportData.title}
                </div>
                <div>
                  <strong>File Size:</strong> {formatFileSize(generation.reportData.fileSize)}
                </div>
                <div>
                  <strong>Generated:</strong> {new Date(generation.reportData.generatedAt).toLocaleString()}
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {!generation.completed ? (
            <>
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={generation.isGenerating}
              >
                Cancel
              </Button>
              <Button
                onClick={generateReport}
                disabled={generation.isGenerating || !clientName.trim() ||
                  (reportType === 'audit' && !websiteAnalysisId) ||
                  (reportType === 'competitor_analysis' && !competitorUrl.trim()) ||
                  ((reportType === 'competitor_analysis' || reportType === 'performance') &&
                    usePrimaryWebsite && !primaryWebsiteUrl && !customWebsiteUrl.trim()) ||
                  ((reportType === 'competitor_analysis' || reportType === 'performance') &&
                    !usePrimaryWebsite && !customWebsiteUrl.trim())
                }
              >
                {generation.isGenerating && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Generate Report
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={resetAndClose}>
                Close
              </Button>
              <Button onClick={downloadReport}>
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}