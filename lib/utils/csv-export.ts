export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string = 'export.csv'
): void {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Get headers from the first object
  const headers = Object.keys(data[0]);

  // Create CSV content
  const csvContent = [
    // Header row
    headers.join(','),
    // Data rows
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        // Handle values that contain commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(',')
    )
  ].join('\n');

  // Create a blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function generateCSVContent<T extends Record<string, any>>(
  data: T[],
  headers?: { key: keyof T; label: string }[]
): string {
  if (data.length === 0) {
    return '';
  }

  const effectiveHeaders = headers ||
    Object.keys(data[0]).map(key => ({ key: key as keyof T, label: key }));

  // Header row
  const headerRow = effectiveHeaders.map(h => h.label).join(',');

  // Data rows
  const dataRows = data.map(row =>
    effectiveHeaders.map(({ key }) => {
      const value = row[key];
      // Handle values that contain commas or quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value ?? '';
    }).join(',')
  );

  return [headerRow, ...dataRows].join('\n');
}

// Additional functions needed by the results display component
export function prepareExportData(results: any) {
  const exportData = results.generatedTopics.map((topic: any) => ({
    Topic: topic.topic,
    Difficulty: topic.difficulty,
    'Search Volume': topic.searchVolume,
    Competition: topic.competition,
    'Relevance Score': topic.relevanceScore || 0,
    'SEO Score': calculateSEOScore(topic),
    Tags: Array.isArray(topic.suggestedTags) ? topic.suggestedTags.join('; ') : '',
    Source: topic.source || 'ai',
    Reasoning: topic.reasoning || '',
    'Related Content': topic.relatedContent || '',
  }));

  // Add metadata as additional rows at the top
  const metadataRows = [
    { Column: 'Input Topic', Value: results.inputTopic },
    { Column: 'Business Type', Value: results.metadata.businessType },
    { Column: 'Target Audience', Value: results.metadata.targetAudience },
    { Column: 'Location', Value: results.metadata.location || 'Global' },
    { Column: 'Generated At', Value: results.metadata.generatedAt },
    { Column: 'Total Topics', Value: results.metadata.totalTopics },
    { Column: 'Average Difficulty', Value: results.metadata.averageDifficulty },
    { Column: 'Total Estimated Volume', Value: results.metadata.totalEstimatedVolume },
    {}, // Empty row separator
  ];

  return {
    headers: Object.keys(exportData[0] || {}),
    data: exportData,
    metadata: metadataRows,
  };
}

export function downloadCSV(
  exportData: any,
  options: { includeMetadata?: boolean; includeBOM?: boolean } = {}
): Promise<{ success: boolean; filename?: string; recordCount?: number; error?: string }> {
  return new Promise((resolve) => {
    try {
      const { includeMetadata = true, includeBOM = true } = options;

      let csvContent = '';

      // Add BOM for Excel compatibility if requested
      if (includeBOM) {
        csvContent = '\uFEFF';
      }

      // Add metadata if requested
      if (includeMetadata && exportData.metadata) {
        exportData.metadata.forEach((row: any) => {
          if (Object.keys(row).length === 0) {
            csvContent += '\n';
          } else {
            csvContent += `"${row.Column}","${row.Value}"\n`;
          }
        });
      }

      // Add main data
      if (exportData.data && exportData.data.length > 0) {
        // Add headers
        csvContent += exportData.headers.join(',') + '\n';

        // Add data rows
        exportData.data.forEach((row: any) => {
          const rowData = exportData.headers.map((header: string) => {
            const value = row[header] || '';
            // Escape commas and quotes
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          });
          csvContent += rowData.join(',') + '\n';
        });
      }

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const filename = `seo-topics-${new Date().toISOString().split('T')[0]}.csv`;

      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        resolve({
          success: true,
          filename,
          recordCount: exportData.data?.length || 0,
        });
      } else {
        resolve({
          success: false,
          error: 'Download not supported in this browser',
        });
      }
    } catch (error) {
      resolve({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
}

// Helper function to calculate SEO score
function calculateSEOScore(topic: any): number {
  let score = 100;
  if (topic.difficulty === 'easy') score += 10;
  else if (topic.difficulty === 'medium') score += 5;
  if (topic.competition === 'low') score += 15;
  else if (topic.competition === 'medium') score += 8;
  if (topic.searchVolume > 5000) score += 15;
  else if (topic.searchVolume > 1000) score += 10;
  else if (topic.searchVolume > 100) score += 5;
  return Math.min(100, Math.max(0, score));
}