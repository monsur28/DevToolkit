'use client';

import { useState } from 'react';
import { ToolLayout } from '@/components/tool-layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Bug, Copy, Trash2, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GeminiAPI } from '@/lib/gemini';

interface BugReport {
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  description: string;
  suggestion: string;
  lineNumber?: number;
}

export default function AIBugFinderPage() {
  const [code, setCode] = useState('');
  const [bugs, setBugs] = useState<BugReport[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [codeQuality, setCodeQuality] = useState<number | null>(null);
  const { toast } = useToast();

  const analyzeCode = async () => {
    if (!code.trim()) {
      toast({
        title: "Error",
        description: "Please paste some code to analyze",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const gemini = new GeminiAPI();
      const result = await gemini.findBugs(code);
      
      setBugs(result.bugs);
      setCodeQuality(result.qualityScore);
      
      toast({
        title: "Analysis Complete",
        description: `Found ${result.bugs.length} potential issues`,
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze code for bugs",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-100 border-blue-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Bug className="h-4 w-4" />;
      case 'low': return <Lightbulb className="h-4 w-4" />;
      default: return <Bug className="h-4 w-4" />;
    }
  };

  const copyReport = async () => {
    const report = `Code Quality Analysis Report
Quality Score: ${codeQuality}/100

Issues Found: ${bugs.length}

${bugs.map((bug, index) => `
${index + 1}. ${bug.type} (${bug.severity.toUpperCase()})
   Description: ${bug.description}
   Suggestion: ${bug.suggestion}
   ${bug.lineNumber ? `Line: ${bug.lineNumber}` : ''}
`).join('\n')}`;

    await navigator.clipboard.writeText(report);
    toast({
      title: "Copied!",
      description: "Bug report copied to clipboard",
    });
  };

  const clear = () => {
    setCode('');
    setBugs([]);
    setCodeQuality(null);
  };

  const loadExample = () => {
    setCode(`function calculateTotal(items) {
  var total = 0;
  for (var i = 0; i <= items.length; i++) {
    total += items[i].price;
  }
  return total;
}

function processUser(user) {
  if (user.name == null) {
    return "Unknown";
  }
  return user.name.toUpperCase();
}

// Potential memory leak
var globalData = [];
function addData(item) {
  globalData.push(item);
}

// Unused variable
var unusedVar = "test";`);
  };

  return (
    <ToolLayout
      title="AI Bug Finder"
      description="Paste code and highlight potential issues, bugs, and bad practices using AI analysis"
      icon={<Bug className="h-8 w-8 text-red-500" />}
    >
      <div className="space-y-6">
        {/* Code Input */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Code Analysis</CardTitle>
            <CardDescription>Paste your code below for AI-powered bug detection and quality analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste your code here for analysis..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
            />
            
            <div className="flex gap-2">
              <Button 
                onClick={analyzeCode}
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
                    <Bug className="h-4 w-4" />
                    <span>Find Bugs with AI</span>
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

        {/* Quality Score */}
        {codeQuality !== null && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Code Quality Score</CardTitle>
                  <CardDescription>Overall assessment of your code quality</CardDescription>
                </div>
                {bugs.length > 0 && (
                  <Button onClick={copyReport} size="sm" variant="outline">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Report
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="text-4xl font-bold text-primary">{codeQuality}/100</div>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-500 ${
                        codeQuality >= 80 ? 'bg-green-500' :
                        codeQuality >= 60 ? 'bg-yellow-500' :
                        codeQuality >= 40 ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${codeQuality}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {codeQuality >= 80 ? 'Excellent code quality' :
                     codeQuality >= 60 ? 'Good code quality' :
                     codeQuality >= 40 ? 'Fair code quality' : 'Needs improvement'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bug Reports */}
        {bugs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Issues Found ({bugs.length})</CardTitle>
              <CardDescription>Potential bugs, security issues, and code improvements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bugs.map((bug, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge className={getSeverityColor(bug.severity)}>
                          {getSeverityIcon(bug.severity)}
                          <span className="ml-1 capitalize">{bug.severity}</span>
                        </Badge>
                        <span className="font-medium">{bug.type}</span>
                      </div>
                      {bug.lineNumber && (
                        <Badge variant="outline">Line {bug.lineNumber}</Badge>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <h4 className="font-medium text-sm">Issue:</h4>
                        <p className="text-sm text-muted-foreground">{bug.description}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                          Suggestion:
                        </h4>
                        <p className="text-sm text-muted-foreground">{bug.suggestion}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">AI Bug Detection Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">What AI Detects:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Logic errors and off-by-one mistakes</li>
                  <li>• Memory leaks and performance issues</li>
                  <li>• Security vulnerabilities</li>
                  <li>• Code smell and bad practices</li>
                  <li>• Unused variables and dead code</li>
                  <li>• Type safety issues</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Severity Levels:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• <span className="text-red-600 font-medium">Critical:</span> Security vulnerabilities, crashes</li>
                  <li>• <span className="text-orange-600 font-medium">High:</span> Logic errors, data corruption</li>
                  <li>• <span className="text-yellow-600 font-medium">Medium:</span> Performance issues, bad practices</li>
                  <li>• <span className="text-blue-600 font-medium">Low:</span> Code style, minor improvements</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
}