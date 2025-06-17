'use client';

import { useState } from 'react';
import { ToolLayout } from '@/components/tool-layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { FileText, Copy, Trash2, Sparkles, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GeminiAPI } from '@/lib/gemini';

export default function APIResponseAnalyzerPage() {
  const [apiResponse, setApiResponse] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const analyzeResponse = async () => {
    if (!apiResponse.trim()) {
      toast({
        title: "Error",
        description: "Please paste an API response to analyze",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    setError('');
    try {
      // Validate JSON
      try {
        JSON.parse(apiResponse);
      } catch (e) {
        // If not valid JSON, we'll still try to analyze it as it might be XML or another format
      }

      const gemini = new GeminiAPI();
      const result = await gemini.analyzeAPIResponse(apiResponse);
      
      setAnalysis(result);
      
      toast({
        title: "Analysis Complete",
        description: "API response analyzed successfully",
      });
    } catch (error) {
      setError('Failed to analyze API response. Please check your input and try again.');
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze API response",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyAnalysis = async () => {
    await navigator.clipboard.writeText(analysis);
    toast({
      title: "Copied!",
      description: "Analysis copied to clipboard",
    });
  };

  const clear = () => {
    setApiResponse('');
    setAnalysis('');
    setError('');
  };

  const loadExample = () => {
    setApiResponse(`{
  "data": {
    "users": [
      {
        "id": "u-123",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "admin",
        "lastLogin": "2023-12-15T08:30:45Z",
        "settings": {
          "notifications": true,
          "theme": "dark"
        }
      },
      {
        "id": "u-456",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "role": "user",
        "lastLogin": "2023-12-14T16:22:10Z",
        "settings": {
          "notifications": false,
          "theme": "light"
        }
      }
    ],
    "pagination": {
      "total": 42,
      "page": 1,
      "perPage": 10,
      "totalPages": 5
    }
  },
  "meta": {
    "requestId": "req-789",
    "timestamp": "2023-12-16T10:15:30Z",
    "status": "success",
    "version": "2.1.0"
  }
}`);
  };

  return (
    <ToolLayout
      title="API Response Analyzer"
      description="Paste JSON/API responses and get structured summaries and insights"
      icon={<FileText className="h-8 w-8 text-indigo-500" />}
    >
      <div className="space-y-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-purple-500" />
              API Response Analysis
            </CardTitle>
            <CardDescription>Paste your API response (JSON, XML, etc.) to get an AI-powered analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste your API response here..."
              value={apiResponse}
              onChange={(e) => setApiResponse(e.target.value)}
              className="min-h-[200px] font-mono text-sm"
            />
            
            <div className="flex gap-2">
              <Button 
                onClick={analyzeResponse}
                disabled={isAnalyzing}
                className="flex items-center space-x-2"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Analyze with AI</span>
                  </>
                )}
              </Button>
              <Button onClick={clear} variant="outline" className="flex items-center space-x-2">
                <Trash2 className="h-4 w-4" />
                <span>Clear</span>
              </Button>
              <Button onClick={loadExample} variant="outline" size="sm">
                Load Example
              </Button>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Analysis Output */}
        {analysis && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Analysis Results</CardTitle>
                  <CardDescription>AI-powered insights about your API response</CardDescription>
                </div>
                <Button onClick={copyAnalysis} size="sm" variant="outline">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Analysis
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-sm">{analysis}</div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">API Analysis Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">What AI Analyzes:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Data structure and organization</li>
                  <li>• Key entities and relationships</li>
                  <li>• Error codes and messages</li>
                  <li>• Pagination and metadata</li>
                  <li>• Authentication tokens and headers</li>
                  <li>• Response format and standards</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Supported Formats:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• JSON (most common API format)</li>
                  <li>• XML responses</li>
                  <li>• GraphQL responses</li>
                  <li>• Plain text responses</li>
                  <li>• Error responses</li>
                  <li>• Authentication responses</li>
                </ul>
              </div>
            </div>
            
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Pro Tips:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Include complete responses for better analysis</li>
                <li>• For authenticated APIs, you can redact sensitive tokens</li>
                <li>• Use this tool to understand unfamiliar API responses</li>
                <li>• Analyze error responses to debug API issues</li>
                <li>• Compare responses before and after changes</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
}