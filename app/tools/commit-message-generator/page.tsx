'use client';

import { useState } from 'react';
import { ToolLayout } from '@/components/tool-layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { GitCommit, Copy, Trash2, Sparkles, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GeminiAPI } from '@/lib/gemini';

interface CommitMessage {
  type: string;
  scope?: string;
  subject: string;
  body?: string;
  footer?: string;
  conventional: string;
}

export default function CommitMessageGeneratorPage() {
  const [diff, setDiff] = useState('');
  const [context, setContext] = useState('');
  const [commitType, setCommitType] = useState('auto');
  const [generatedMessages, setGeneratedMessages] = useState<CommitMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const commitTypes = [
    { value: 'auto', label: 'Auto-detect', description: 'Let AI determine the best type' },
    { value: 'feat', label: 'feat', description: 'A new feature' },
    { value: 'fix', label: 'fix', description: 'A bug fix' },
    { value: 'docs', label: 'docs', description: 'Documentation changes' },
    { value: 'style', label: 'style', description: 'Code style changes' },
    { value: 'refactor', label: 'refactor', description: 'Code refactoring' },
    { value: 'test', label: 'test', description: 'Adding or updating tests' },
    { value: 'chore', label: 'chore', description: 'Maintenance tasks' },
    { value: 'perf', label: 'perf', description: 'Performance improvements' },
    { value: 'ci', label: 'ci', description: 'CI/CD changes' },
  ];

  const generateCommitMessages = async () => {
    if (!diff.trim()) {
      toast({
        title: "Error",
        description: "Please provide a git diff or describe your changes",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const gemini = new GeminiAPI();
      const messages = await gemini.generateCommitMessages(diff, context, commitType === 'auto' ? undefined : commitType);
      
      setGeneratedMessages(messages);
      
      toast({
        title: "Commit Messages Generated",
        description: `Generated ${messages.length} conventional commit messages`,
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate commit messages",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyMessage = async (message: string) => {
    await navigator.clipboard.writeText(message);
    toast({
      title: "Copied!",
      description: "Commit message copied to clipboard",
    });
  };

  const clear = () => {
    setDiff('');
    setContext('');
    setGeneratedMessages([]);
  };

  const loadExample = () => {
    setDiff(`diff --git a/src/components/Button.tsx b/src/components/Button.tsx
index 1234567..abcdefg 100644
--- a/src/components/Button.tsx
+++ b/src/components/Button.tsx
@@ -1,10 +1,15 @@
 import React from 'react';
+import { cn } from '@/lib/utils';
 
-interface ButtonProps {
+interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
   children: React.ReactNode;
+  variant?: 'primary' | 'secondary' | 'outline';
+  size?: 'sm' | 'md' | 'lg';
 }
 
-export const Button: React.FC<ButtonProps> = ({ children }) => {
-  return <button className="btn">{children}</button>;
+export const Button: React.FC<ButtonProps> = ({ 
+  children, variant = 'primary', size = 'md', className, ...props 
+}) => {
+  return <button className={cn('btn', variant, size, className)} {...props}>{children}</button>;
 };`);
    setContext('Improving Button component with better TypeScript types and variant support');
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      feat: 'bg-green-100 text-green-800 border-green-200',
      fix: 'bg-red-100 text-red-800 border-red-200',
      docs: 'bg-blue-100 text-blue-800 border-blue-200',
      style: 'bg-purple-100 text-purple-800 border-purple-200',
      refactor: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      test: 'bg-orange-100 text-orange-800 border-orange-200',
      chore: 'bg-gray-100 text-gray-800 border-gray-200',
      perf: 'bg-pink-100 text-pink-800 border-pink-200',
      ci: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <ToolLayout
      title="Commit Message Generator"
      description="Turn your diffs into meaningful Git commit messages following conventional commit standards"
      icon={<GitCommit className="h-8 w-8 text-green-500" />}
    >
      <div className="space-y-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-purple-500" />
              Generate Commit Messages
            </CardTitle>
            <CardDescription>Provide your git diff or describe your changes to generate conventional commit messages</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Git Diff or Change Description</label>
              <Textarea
                placeholder="Paste your git diff here or describe the changes you made..."
                value={diff}
                onChange={(e) => setDiff(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Additional Context (Optional)</label>
                <Input
                  placeholder="e.g., 'Part of user authentication feature'"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Commit Type</label>
                <Select value={commitType} onValueChange={setCommitType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {commitTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-muted-foreground">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={generateCommitMessages}
                disabled={isGenerating}
                className="flex items-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Generate Messages</span>
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

        {/* Generated Messages */}
        {generatedMessages.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Generated Commit Messages</CardTitle>
              <CardDescription>Click any message to copy it to your clipboard</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {generatedMessages.map((message, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge className={getTypeColor(message.type)}>
                          {message.type}
                        </Badge>
                        {message.scope && (
                          <Badge variant="outline">{message.scope}</Badge>
                        )}
                      </div>
                      <Button
                        onClick={() => copyMessage(message.conventional)}
                        size="sm"
                        variant="ghost"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <div 
                        className="font-mono text-sm bg-muted p-3 rounded cursor-pointer hover:bg-muted/80 transition-colors"
                        onClick={() => copyMessage(message.conventional)}
                      >
                        {message.conventional}
                      </div>
                      
                      {message.body && (
                        <div className="text-sm text-muted-foreground">
                          <strong>Body:</strong> {message.body}
                        </div>
                      )}
                      
                      {message.footer && (
                        <div className="text-sm text-muted-foreground">
                          <strong>Footer:</strong> {message.footer}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Conventional Commits Guide */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Conventional Commits Format</CardTitle>
            <CardDescription>Understanding the structure of conventional commit messages</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="bg-muted p-4 rounded-lg font-mono">
              <type>[optional scope]: <description><br/>
              <br/>
              [optional body]<br/>
              <br/>
              [optional footer(s)]
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Common Types:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• <strong>feat:</strong> New feature</li>
                  <li>• <strong>fix:</strong> Bug fix</li>
                  <li>• <strong>docs:</strong> Documentation</li>
                  <li>• <strong>style:</strong> Formatting, missing semicolons</li>
                  <li>• <strong>refactor:</strong> Code restructuring</li>
                  <li>• <strong>test:</strong> Adding tests</li>
                  <li>• <strong>chore:</strong> Maintenance</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Examples:</h4>
                <ul className="space-y-1 text-muted-foreground font-mono text-xs">
                  <li>feat(auth): add OAuth login</li>
                  <li>fix: resolve memory leak in parser</li>
                  <li>docs: update API documentation</li>
                  <li>style: format code with prettier</li>
                  <li>refactor(ui): simplify button component</li>
                  <li>test: add unit tests for utils</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
}