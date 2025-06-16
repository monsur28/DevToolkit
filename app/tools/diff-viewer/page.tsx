'use client';

import { useState } from 'react';
import { ToolLayout } from '@/components/tool-layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { GitCompare, Copy, Trash2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
  lineNumber?: number;
}

export default function DiffViewerPage() {
  const [originalText, setOriginalText] = useState('');
  const [modifiedText, setModifiedText] = useState('');
  const [diff, setDiff] = useState<DiffLine[]>([]);
  const { toast } = useToast();

  const generateDiff = () => {
    if (!originalText.trim() && !modifiedText.trim()) {
      toast({
        title: "Error",
        description: "Please enter text in both fields to compare",
        variant: "destructive"
      });
      return;
    }

    const originalLines = originalText.split('\n');
    const modifiedLines = modifiedText.split('\n');
    const diffResult: DiffLine[] = [];

    // Simple diff algorithm - can be enhanced with more sophisticated algorithms
    const maxLines = Math.max(originalLines.length, modifiedLines.length);
    
    for (let i = 0; i < maxLines; i++) {
      const originalLine = originalLines[i] || '';
      const modifiedLine = modifiedLines[i] || '';

      if (originalLine === modifiedLine) {
        diffResult.push({
          type: 'unchanged',
          content: originalLine,
          lineNumber: i + 1
        });
      } else {
        if (originalLines[i] !== undefined) {
          diffResult.push({
            type: 'removed',
            content: originalLine,
            lineNumber: i + 1
          });
        }
        if (modifiedLines[i] !== undefined) {
          diffResult.push({
            type: 'added',
            content: modifiedLine,
            lineNumber: i + 1
          });
        }
      }
    }

    setDiff(diffResult);
  };

  const copyDiff = async () => {
    const diffText = diff.map(line => {
      const prefix = line.type === 'added' ? '+ ' : line.type === 'removed' ? '- ' : '  ';
      return prefix + line.content;
    }).join('\n');

    await navigator.clipboard.writeText(diffText);
    toast({
      title: "Copied!",
      description: "Diff copied to clipboard",
    });
  };

  const clear = () => {
    setOriginalText('');
    setModifiedText('');
    setDiff([]);
  };

  const swap = () => {
    const temp = originalText;
    setOriginalText(modifiedText);
    setModifiedText(temp);
  };

  const getDiffStats = () => {
    const added = diff.filter(line => line.type === 'added').length;
    const removed = diff.filter(line => line.type === 'removed').length;
    const unchanged = diff.filter(line => line.type === 'unchanged').length;
    
    return { added, removed, unchanged };
  };

  const stats = getDiffStats();

  return (
    <ToolLayout
      title="Code Diff Viewer"
      description="Compare two code blocks and highlight line-by-line differences"
      icon={<GitCompare className="h-8 w-8 text-indigo-500" />}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Original Text</CardTitle>
              <CardDescription>Enter the original version</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter original text here..."
                value={originalText}
                onChange={(e) => setOriginalText(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Modified Text</CardTitle>
              <CardDescription>Enter the modified version</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter modified text here..."
                value={modifiedText}
                onChange={(e) => setModifiedText(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={generateDiff} className="flex items-center space-x-2">
            <GitCompare className="h-4 w-4" />
            <span>Compare</span>
          </Button>
          <Button onClick={swap} variant="outline" className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4" />
            <span>Swap</span>
          </Button>
          <Button onClick={clear} variant="outline" className="flex items-center space-x-2">
            <Trash2 className="h-4 w-4" />
            <span>Clear</span>
          </Button>
          {diff.length > 0 && (
            <Button onClick={copyDiff} variant="outline" className="flex items-center space-x-2">
              <Copy className="h-4 w-4" />
              <span>Copy Diff</span>
            </Button>
          )}
        </div>

        {diff.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Diff Result</CardTitle>
                  <CardDescription>
                    <span className="text-green-600 dark:text-green-400">+{stats.added} additions</span>
                    {' • '}
                    <span className="text-red-600 dark:text-red-400">-{stats.removed} deletions</span>
                    {' • '}
                    <span className="text-muted-foreground">{stats.unchanged} unchanged</span>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-md overflow-auto max-h-96">
                <div className="font-mono text-sm">
                  {diff.map((line, index) => (
                    <div
                      key={index}
                      className={`px-4 py-1 border-l-4 ${
                        line.type === 'added'
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-800 dark:text-green-200'
                          : line.type === 'removed'
                          ? 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-800 dark:text-red-200'
                          : 'bg-background border-transparent'
                      }`}
                    >
                      <span className="inline-block w-8 text-muted-foreground text-xs mr-4">
                        {line.lineNumber}
                      </span>
                      <span className="inline-block w-4 mr-2 text-xs">
                        {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                      </span>
                      <span className="whitespace-pre-wrap">{line.content}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ToolLayout>
  );
}