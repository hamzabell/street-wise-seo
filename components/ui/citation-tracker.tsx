"use client";

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Clock,
  ExternalLink,
  Filter,
  Download,
  CheckCircle,
  AlertCircle,
  XCircle,
  Building,
  MapPin,
  Phone,
  Globe,
  Star,
  TrendingUp,
  Users,
  Target,
  BarChart3,
  Loader2,
  RefreshCw,
  FileText,
  Info,
} from 'lucide-react';
import { CitationOpportunity, CitationReport } from '@/lib/seo/citation-helper';

interface CitationTrackerProps {
  businessInfo?: {
    name: string;
    address: string;
    phone: string;
    website: string;
    description: string;
    categories: string[];
    city?: string;
    state?: string;
  };
  className?: string;
}

export function CitationTracker({ businessInfo, className }: CitationTrackerProps) {
  const [citations, setCitations] = useState<CitationOpportunity[]>([]);
  const [report, setReport] = useState<CitationReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCitations, setSelectedCitations] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    category: 'all',
    difficulty: 'all',
    status: 'all',
    priority: 'all',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<'list' | 'report'>('list');
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');

  // Load citations when component mounts
  useEffect(() => {
    if (businessInfo?.name && businessInfo?.address && businessInfo?.phone) {
      loadCitations();
    }
  }, [businessInfo]);

  const loadCitations = async () => {
    if (!businessInfo) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/seo/citations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(businessInfo),
      });

      if (!response.ok) {
        throw new Error('Failed to load citations');
      }

      const data = await response.json();
      if (data.success) {
        setCitations(data.data.opportunities);
      } else {
        setError(data.error || 'Failed to load citations');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const loadReport = async () => {
    if (!businessInfo) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/seo/citations?type=report');
      if (!response.ok) {
        throw new Error('Failed to load report');
      }

      const data = await response.json();
      if (data.success) {
        setReport(data.data);
      } else {
        setError(data.error || 'Failed to load report');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateCitationStatus = async (citationId: string, status: 'unclaimed' | 'claimed' | 'needs_update' | 'not_applicable') => {
    try {
      const response = await fetch('/api/seo/citations', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_status',
          data: { id: citationId, status },
        }),
      });

      if (response.ok) {
        setCitations(prev =>
          prev.map(c => c.id === citationId ? { ...c, status } : c)
        );
      }
    } catch (err) {
      console.error('Failed to update citation status:', err);
    }
  };

  const bulkUpdateStatus = async (status: 'unclaimed' | 'claimed' | 'needs_update' | 'not_applicable') => {
    if (selectedCitations.length === 0) return;

    try {
      const response = await fetch('/api/seo/citations', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'bulk_update',
          data: { citationIds: selectedCitations, status },
        }),
      });

      if (response.ok) {
        setCitations(prev =>
          prev.map(c =>
            selectedCitations.includes(c.id) ? { ...c, status } : c
          )
        );
        setSelectedCitations([]);
      }
    } catch (err) {
      console.error('Failed to bulk update citations:', err);
    }
  };

  const exportCitations = async (selectedOnly = false) => {
    try {
      const ids = selectedOnly ? selectedCitations.join(',') : undefined;
      const response = await fetch(`/api/seo/citations?format=${exportFormat}${ids ? `&ids=${ids}` : ''}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        if (exportFormat === 'json') {
          const data = await response.json();
          const blob = new Blob([JSON.stringify(data.data, null, 2)], {
            type: 'application/json',
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = data.filename;
          a.click();
        } else {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || 'citations.csv';
          a.click();
        }
      }
    } catch (err) {
      console.error('Failed to export citations:', err);
    }
  };

  // Filter citations
  const filteredCitations = citations.filter(citation => {
    const matchesSearch = citation.directory.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         citation.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filters.category === 'all' || citation.category === filters.category;
    const matchesDifficulty = filters.difficulty === 'all' || citation.difficulty === filters.difficulty;
    const matchesStatus = filters.status === 'all' || citation.status === filters.status;
    const matchesPriority = filters.priority === 'all' || citation.priority === filters.priority;

    return matchesSearch && matchesCategory && matchesDifficulty && matchesStatus && matchesPriority;
  });

  // Calculate statistics
  const stats = {
    total: citations.length,
    claimed: citations.filter(c => c.status === 'claimed').length,
    unclaimed: citations.filter(c => c.status === 'unclaimed').length,
    needsUpdate: citations.filter(c => c.status === 'needs_update').length,
    highPriority: citations.filter(c => c.priority === 'high').length,
  };

  const completionRate = stats.total > 0 ? (stats.claimed / stats.total) * 100 : 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'claimed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'needs_update':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'not_applicable':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      high: 'destructive',
      medium: 'secondary',
      low: 'outline',
    } as const;

    return (
      <Badge variant={variants[priority as keyof typeof variants]}>
        {priority}
      </Badge>
    );
  };

  const getCategoryBadge = (category: string) => {
    const colors = {
      major: 'bg-blue-100 text-blue-800',
      industry: 'bg-purple-100 text-purple-800',
      local: 'bg-green-100 text-green-800',
      niche: 'bg-orange-100 text-orange-800',
    };

    return (
      <Badge className={colors[category as keyof typeof colors]}>
        {category}
      </Badge>
    );
  };

  if (!businessInfo?.name || !businessInfo?.address || !businessInfo?.phone) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Business Information Required</h3>
            <p>Please complete your business profile first to use the Citation Tracker.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading citation opportunities...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Local Citation Tracker</h2>
          <p className="text-muted-foreground">Manage your local business listings across directories</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => view === 'list' ? loadReport() : loadCitations()}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Export Citations</DialogTitle>
                <DialogDescription>
                  Choose export format and options
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Format</label>
                  <Select value={exportFormat} onValueChange={(value: 'csv' | 'json') => setExportFormat(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => exportCitations(false)}
                    className="flex-1"
                  >
                    Export All
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => exportCitations(true)}
                    disabled={selectedCitations.length === 0}
                    className="flex-1"
                  >
                    Export Selected ({selectedCitations.length})
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Citations</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Claimed</p>
                <p className="text-2xl font-bold text-green-600">{stats.claimed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unclaimed</p>
                <p className="text-2xl font-bold text-blue-600">{stats.unclaimed}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Priority</p>
                <p className="text-2xl font-bold text-red-600">{stats.highPriority}</p>
              </div>
              <Target className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Citation Building Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Completion Rate</span>
              <span>{completionRate.toFixed(1)}%</span>
            </div>
            <Progress value={completionRate} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{stats.claimed} claimed</span>
              <span>{stats.total - stats.claimed} remaining</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={view} onValueChange={(value) => setView(value as 'list' | 'report')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">Citation List</TabsTrigger>
          <TabsTrigger value="report">Analysis Report</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span className="text-sm font-medium">Filters:</span>
                </div>
                <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="major">Major</SelectItem>
                    <SelectItem value="industry">Industry</SelectItem>
                    <SelectItem value="local">Local</SelectItem>
                    <SelectItem value="niche">Niche</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.difficulty} onValueChange={(value) => setFilters(prev => ({ ...prev, difficulty: value }))}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.priority} onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <input
                  type="text"
                  placeholder="Search citations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Bulk Actions */}
          {selectedCitations.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {selectedCitations.length} citations selected
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => bulkUpdateStatus('claimed')}
                    >
                      Mark as Claimed
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => bulkUpdateStatus('needs_update')}
                    >
                      Mark as Needs Update
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCitations([])}
                    >
                      Clear Selection
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Citation List */}
          <div className="space-y-3">
            {filteredCitations.map((citation) => (
              <Card key={citation.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Checkbox
                        checked={selectedCitations.includes(citation.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedCitations(prev => [...prev, citation.id]);
                          } else {
                            setSelectedCitations(prev => prev.filter(id => id !== citation.id));
                          }
                        }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(citation.status)}
                          <h3 className="font-semibold">{citation.directory}</h3>
                          {getPriorityBadge(citation.priority)}
                          {getCategoryBadge(citation.category)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {citation.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {citation.estimatedTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            DA {citation.domainAuthority}
                          </span>
                          {!citation.isFree && (
                            <Badge variant="outline">Paid</Badge>
                          )}
                        </div>
                        {citation.instructions && (
                          <div className="bg-muted p-2 rounded text-sm mb-3">
                            <strong>Instructions:</strong> {citation.instructions}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(citation.url, '_blank')}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Visit Directory
                          </Button>
                          <Select
                            value={citation.status}
                            onValueChange={(value: 'unclaimed' | 'claimed' | 'needs_update' | 'not_applicable') => updateCitationStatus(citation.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unclaimed">Unclaimed</SelectItem>
                              <SelectItem value="claimed">Claimed</SelectItem>
                              <SelectItem value="needs_update">Needs Update</SelectItem>
                              <SelectItem value="not_applicable">Not Applicable</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCitations.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No citations found</h3>
                <p>Try adjusting your filters or search terms.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="report">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Citation Analysis Report
              </CardTitle>
              <CardDescription>
                Comprehensive analysis of your citation building progress and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {report ? (
                <>
                  {/* NAP Consistency Check */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">NAP Consistency Check</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className={`p-3 rounded-lg border ${report.napConsistency.name ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          <span className="font-medium">Name</span>
                        </div>
                        <p className="text-sm mt-1">
                          {report.napConsistency.name ? 'Consistent' : 'Needs Review'}
                        </p>
                      </div>
                      <div className={`p-3 rounded-lg border ${report.napConsistency.address ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span className="font-medium">Address</span>
                        </div>
                        <p className="text-sm mt-1">
                          {report.napConsistency.address ? 'Consistent' : 'Needs Review'}
                        </p>
                      </div>
                      <div className={`p-3 rounded-lg border ${report.napConsistency.phone ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span className="font-medium">Phone</span>
                        </div>
                        <p className="text-sm mt-1">
                          {report.napConsistency.phone ? 'Consistent' : 'Needs Review'}
                        </p>
                      </div>
                      <div className={`p-3 rounded-lg border ${report.napConsistency.website ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <span className="font-medium">Website</span>
                        </div>
                        <p className="text-sm mt-1">
                          {report.napConsistency.website ? 'Consistent' : 'Needs Review'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Overall Consistency Score</span>
                        <span>{report.consistencyScore}%</span>
                      </div>
                      <Progress value={report.consistencyScore} className="h-2" />
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Recommendations</h3>
                    <div className="space-y-2">
                      {report.recommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                          <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                          <p className="text-sm">{recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Category Breakdown */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Category Breakdown</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {['major', 'industry', 'local', 'niche'].map((category) => {
                        const categoryCitations = report.opportunities.filter(c => c.category === category);
                        const claimedInCategory = categoryCitations.filter(c => c.status === 'claimed').length;
                        const completionRate = categoryCitations.length > 0
                          ? (claimedInCategory / categoryCitations.length) * 100
                          : 0;

                        return (
                          <Card key={category}>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium capitalize">{category}</span>
                                <Badge variant="outline">{categoryCitations.length}</Badge>
                              </div>
                              <div className="text-2xl font-bold mb-2">{claimedInCategory}/{categoryCitations.length}</div>
                              <Progress value={completionRate} className="h-2" />
                              <div className="text-xs text-muted-foreground mt-1">
                                {completionRate.toFixed(0)}% complete
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Button onClick={loadReport} disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Generate Report
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}