'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Copy,
  Download,
  Check,
  FileCode,
  Code,
  Globe,
  Share2,
  Eye,
  EyeOff,
  Info,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { validateSchema } from '@/lib/seo/schema-generator';

interface SchemaCodeProps {
  schema: any;
  jsonLdScript?: string;
  validation?: {
    isValid: boolean;
    errors: string[];
  };
  className?: string;
  onCopy?: (content: string) => void;
  onDownload?: (schema: any, format: 'json' | 'html') => void;
}

export function SchemaCode({
  schema,
  jsonLdScript,
  validation,
  className,
  onCopy,
  onDownload
}: SchemaCodeProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [showRawJson, setShowRawJson] = useState(false);

  // Validate schema if not provided
  const schemaValidation = validation || validateSchema(schema);

  const handleCopy = useCallback(async (content: string, section: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);

      if (onCopy) {
        onCopy(content);
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  }, [onCopy]);

  const handleDownload = useCallback((format: 'json' | 'html') => {
    if (onDownload) {
      onDownload(schema, format);
      return;
    }

    // Default download behavior
    const content = format === 'json' ? JSON.stringify(schema, null, 2) : jsonLdScript || '';
    const filename = format === 'json' ? 'local-business-schema.json' : 'local-business-schema.html';
    const mimeType = format === 'json' ? 'application/json' : 'text/html';

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [schema, jsonLdScript, onDownload]);

  const formatSchemaKey = (key: string): string => {
    if (key.startsWith('@')) return key;
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  const formatSchemaValue = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') {
      if (value.startsWith('http')) {
        return value;
      }
      return value;
    }
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const renderSchemaOverview = () => (
    <div className="space-y-4">
      {/* Validation Status */}
      <div className={cn(
        "flex items-center gap-2 p-3 rounded-lg border",
        schemaValidation.isValid
          ? "bg-green-50 border-green-200 text-green-800"
          : "bg-red-50 border-red-200 text-red-800"
      )}>
        {schemaValidation.isValid ? (
          <>
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Schema is valid and ready for use</span>
          </>
        ) : (
          <>
            <XCircle className="h-4 w-4" />
            <span className="text-sm font-medium">
              Schema has {schemaValidation.errors.length} validation issue(s)
            </span>
          </>
        )}
      </div>

      {/* Validation Errors */}
      {!schemaValidation.isValid && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-red-800">Validation Issues:</h4>
          <ul className="space-y-1">
            {schemaValidation.errors.map((error, index) => (
              <li key={index} className="text-sm text-red-700 flex items-start gap-2">
                <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Schema Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h4 className="text-sm font-medium mb-2">Business Information</h4>
          <div className="space-y-1 text-sm">
            <div><span className="font-medium">Type:</span> {schema['@type']}</div>
            <div><span className="font-medium">Name:</span> {schema.name}</div>
            <div><span className="font-medium">Phone:</span> {schema.telephone}</div>
            {schema.url && (
              <div><span className="font-medium">Website:</span>
                <a href={schema.url} target="_blank" rel="noopener noreferrer"
                   className="ml-1 text-blue-600 hover:underline">
                  {schema.url}
                </a>
              </div>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Location</h4>
          <div className="space-y-1 text-sm">
            <div>{schema.address?.streetAddress}</div>
            <div>{schema.address?.addressLocality}, {schema.address?.addressRegion} {schema.address?.postalCode}</div>
            <div>{schema.address?.addressCountry}</div>
            {schema.geo && (
              <div className="text-xs text-muted-foreground">
                📍 {schema.geo.latitude.toFixed(6)}, {schema.geo.longitude.toFixed(6)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Features */}
      <div className="flex flex-wrap gap-2">
        {schema.openingHours && (
          <Badge variant="outline" className="text-xs">
            🕒 Opening Hours Included
          </Badge>
        )}
        {schema.priceRange && (
          <Badge variant="outline" className="text-xs">
            💰 Price Range: {schema.priceRange}
          </Badge>
        )}
        {schema.keywords && (
          <Badge variant="outline" className="text-xs">
            🏷️ SEO Keywords Included
          </Badge>
        )}
        {schema.aggregateRating && (
          <Badge variant="outline" className="text-xs">
            ⭐ Reviews: {schema.aggregateRating.ratingValue}/5 ({schema.aggregateRating.reviewCount})
          </Badge>
        )}
        {schema.areaServed && (
          <Badge variant="outline" className="text-xs">
            🗺️ Service Area Defined
          </Badge>
        )}
      </div>
    </div>
  );

  const renderStructuredData = () => (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleCopy(JSON.stringify(schema, null, 2), 'schema-json')}
          disabled={copiedSection === 'schema-json'}
        >
          {copiedSection === 'schema-json' ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Copied JSON
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" />
              Copy JSON
            </>
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDownload('json')}
        >
          <Download className="mr-2 h-4 w-4" />
          Download JSON
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowRawJson(!showRawJson)}
        >
          {showRawJson ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
          {showRawJson ? 'Hide Raw' : 'Show Raw'}
        </Button>
      </div>

      {/* Formatted Display */}
      {!showRawJson ? (
        <div className="space-y-3">
          {Object.entries(schema).map(([key, value]) => {
            if (value === null || value === undefined || value === '') return null;

            return (
              <div key={key} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium font-mono">
                    {formatSchemaKey(key)}
                  </h4>
                  {typeof value === 'object' && !Array.isArray(value) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => handleCopy(JSON.stringify(value, null, 2), key)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                {typeof value === 'object' && !Array.isArray(value) ? (
                  <div className="space-y-2 text-sm">
                    {Object.entries(value).map(([subKey, subValue]) => (
                      <div key={subKey} className="flex justify-between">
                        <span className="text-muted-foreground">
                          {formatSchemaKey(subKey)}:
                        </span>
                        <span className="font-mono text-xs ml-2">
                          {formatSchemaValue(subValue)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm font-mono bg-muted p-2 rounded">
                    {formatSchemaValue(value)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <ScrollArea className="h-96 w-full border rounded-lg">
          <pre className="text-xs p-4 font-mono">
            {JSON.stringify(schema, null, 2)}
          </pre>
        </ScrollArea>
      )}
    </div>
  );

  const renderHtmlScript = () => {
    if (!jsonLdScript) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <FileCode className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>HTML script not available</p>
          <p className="text-sm">Generate with "generateJsonLd: true" option</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCopy(jsonLdScript, 'html-script')}
            disabled={copiedSection === 'html-script'}
          >
            {copiedSection === 'html-script' ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copied HTML
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy HTML
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownload('html')}
          >
            <Download className="mr-2 h-4 w-4" />
            Download HTML
          </Button>
        </div>

        {/* HTML Display */}
        <div className="relative">
          <ScrollArea className="h-96 w-full border rounded-lg">
            <pre className="text-xs p-4 font-mono">
              {jsonLdScript}
            </pre>
          </ScrollArea>

          {/* Implementation Instructions */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">How to use this HTML:</p>
                <ul className="text-xs space-y-1">
                  <li>• Copy and paste this code into the &lt;head&gt; section of your website</li>
                  <li>• Or add it before the closing &lt;/body&gt; tag</li>
                  <li>• Only include one LocalBusiness schema per page</li>
                  <li>• Test your schema using Google's Rich Results Test tool</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Local Business Schema
            </CardTitle>
            <CardDescription>
              Structured data for Google search visibility and local SEO
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={schemaValidation.isValid ? 'default' : 'destructive'}>
              {schemaValidation.isValid ? 'Valid' : 'Invalid'}
            </Badge>
            <Badge variant="outline">
              {schema['@type']}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="text-xs">
              <Info className="mr-2 h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="structured-data" className="text-xs">
              <FileCode className="mr-2 h-4 w-4" />
              Structured Data
            </TabsTrigger>
            <TabsTrigger value="html-script" className="text-xs">
              <Globe className="mr-2 h-4 w-4" />
              HTML Code
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            {renderSchemaOverview()}
          </TabsContent>

          <TabsContent value="structured-data" className="mt-4">
            {renderStructuredData()}
          </TabsContent>

          <TabsContent value="html-script" className="mt-4">
            {renderHtmlScript()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}