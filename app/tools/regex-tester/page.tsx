'use client';

import { useState, useEffect } from 'react';
import { ToolLayout } from '@/components/tool-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Search, Copy, Trash2, AlertCircle, Check } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

interface Match {
  match: string;
  index: number;
  groups: string[];
}

export default function RegexTesterPage() {
  const [pattern, setPattern] = useState('');
  const [testString, setTestString] = useState('');
  const [flags, setFlags] = useState({
    global: true,
    ignoreCase: false,
    multiline: false,
    dotAll: false
  });
  const [matches, setMatches] = useState<Match[]>([]);
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const { toast } = useToast();

  const testRegex = () => {
    try {
      if (!pattern) {
        setError('Please enter a regex pattern');
        return;
      }

      let flagString = '';
      if (flags.global) flagString += 'g';
      if (flags.ignoreCase) flagString += 'i';
      if (flags.multiline) flagString += 'm';
      if (flags.dotAll) flagString += 's';

      const regex = new RegExp(pattern, flagString);
      const foundMatches: Match[] = [];

      if (flags.global) {
        let match;
        while ((match = regex.exec(testString)) !== null) {
          foundMatches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1)
          });
          if (!flags.global) break; // Prevent infinite loop for non-global regex
        }
      } else {
        const match = regex.exec(testString);
        if (match) {
          foundMatches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1)
          });
        }
      }

      setMatches(foundMatches);
      setError('');
      setIsValid(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid regex pattern');
      setMatches([]);
      setIsValid(false);
    }
  };

  const validateRegex = () => {
    try {
      let flagString = '';
      if (flags.global) flagString += 'g';
      if (flags.ignoreCase) flagString += 'i';
      if (flags.multiline) flagString += 'm';
      if (flags.dotAll) flagString += 's';

      new RegExp(pattern, flagString);
      setError('');
      setIsValid(true);
      toast({
        title: "Valid Regex",
        description: "Your regex pattern is valid!",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid regex pattern');
      setIsValid(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const clear = () => {
    setPattern('');
    setTestString('');
    setMatches([]);
    setError('');
    setIsValid(null);
  };

  const highlightMatches = (text: string) => {
    if (!matches.length) return text;

    let highlightedText = '';
    let lastIndex = 0;

    matches.forEach((match, index) => {
      highlightedText += text.slice(lastIndex, match.index);
      highlightedText += `<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">${match.match}</mark>`;
      lastIndex = match.index + match.match.length;
    });

    highlightedText += text.slice(lastIndex);
    return highlightedText;
  };

  useEffect(() => {
    if (pattern && testString) {
      testRegex();
    }
  }, [pattern, testString, flags]);

  return (
    <ToolLayout
      title="Regex Tester"
      description="Test and validate regular expressions with real-time matching and detailed results"
      icon={<Search className="h-8 w-8 text-red-500" />}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <span>Regex Pattern</span>
                {isValid === true && <Check className="h-4 w-4 text-green-500" />}
                {isValid === false && <AlertCircle className="h-4 w-4 text-red-500" />}
              </CardTitle>
              <CardDescription>Enter your regular expression pattern</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="text-lg font-mono">/</span>
                <Input
                  placeholder="Enter regex pattern..."
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  className="font-mono"
                />
                <span className="text-lg font-mono">/</span>
                <span className="text-sm text-muted-foreground">
                  {flags.global ? 'g' : ''}
                  {flags.ignoreCase ? 'i' : ''}
                  {flags.multiline ? 'm' : ''}
                  {flags.dotAll ? 's' : ''}
                </span>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium">Flags:</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="global"
                      checked={flags.global}
                      onCheckedChange={(checked) => setFlags({...flags, global: checked as boolean})}
                    />
                    <label htmlFor="global" className="text-sm">Global (g)</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="ignoreCase"
                      checked={flags.ignoreCase}
                      onCheckedChange={(checked) => setFlags({...flags, ignoreCase: checked as boolean})}
                    />
                    <label htmlFor="ignoreCase" className="text-sm">Ignore Case (i)</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="multiline"
                      checked={flags.multiline}
                      onCheckedChange={(checked) => setFlags({...flags, multiline: checked as boolean})}
                    />
                    <label htmlFor="multiline" className="text-sm">Multiline (m)</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="dotAll"
                      checked={flags.dotAll}
                      onCheckedChange={(checked) => setFlags({...flags, dotAll: checked as boolean})}
                    />
                    <label htmlFor="dotAll" className="text-sm">Dot All (s)</label>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={testRegex} className="flex items-center space-x-2">
                  <Search className="h-4 w-4" />
                  <span>Test</span>
                </Button>
                <Button onClick={validateRegex} variant="outline" className="flex items-center space-x-2">
                  <Check className="h-4 w-4" />
                  <span>Validate</span>
                </Button>
                <Button onClick={clear} variant="outline" className="flex items-center space-x-2">
                  <Trash2 className="h-4 w-4" />
                  <span>Clear</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Test String</CardTitle>
              <CardDescription>Enter text to test against your regex</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter test string here..."
                value={testString}
                onChange={(e) => setTestString(e.target.value)}
                className="min-h-[200px]"
              />
            </CardContent>
          </Card>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {matches.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Matches</CardTitle>
                  <CardDescription>
                    Found {matches.length} match{matches.length > 1 ? 'es' : ''}
                  </CardDescription>
                </div>
                <Badge variant="secondary">{matches.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {matches.map((match, index) => (
                  <div key={index} className="p-3 bg-muted rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Match {index + 1}</span>
                      <Button
                        onClick={() => copyToClipboard(match.match, `Match ${index + 1}`)}
                        size="sm"
                        variant="ghost"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Text:</span> <code className="bg-background px-1 rounded">{match.match}</code></p>
                      <p><span className="font-medium">Position:</span> {match.index} - {match.index + match.match.length - 1}</p>
                      {match.groups.length > 0 && (
                        <div>
                          <span className="font-medium">Groups:</span>
                          <div className="ml-4 mt-1 space-y-1">
                            {match.groups.map((group, groupIndex) => (
                              <p key={groupIndex}>
                                Group {groupIndex + 1}: <code className="bg-background px-1 rounded">{group || '(empty)'}</code>
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {testString && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Highlighted Text:</p>
                  <div 
                    className="p-3 bg-muted rounded-md text-sm font-mono whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: highlightMatches(testString) }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {pattern && testString && matches.length === 0 && !error && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>No matches found for the given pattern and test string.</AlertDescription>
          </Alert>
        )}
      </div>
    </ToolLayout>
  );
}