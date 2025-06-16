'use client';

import { useState } from 'react';
import { ToolLayout } from '@/components/tool-layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { FileText, Copy, Trash2, Check, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function JsonFormatterPage() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const { toast } = useToast();

  const formatJson = () => {
    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, 2);
      setOutput(formatted);
      setError('');
      setIsValid(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON');
      setOutput('');
      setIsValid(false);
    }
  };

  const minifyJson = () => {
    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setError('');
      setIsValid(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON');
      setOutput('');
      setIsValid(false);
    }
  };

  const validateJson = () => {
    try {
      JSON.parse(input);
      setError('');
      setIsValid(true);
      toast({
        title: "Valid JSON",
        description: "Your JSON is valid!",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON');
      setIsValid(false);
    }
  };

  const copyToClipboard = async () => {
    if (output) {
      await navigator.clipboard.writeText(output);
      toast({
        title: "Copied!",
        description: "JSON copied to clipboard",
      });
    }
  };

  const clear = () => {
    setInput('');
    setOutput('');
    setError('');
    setIsValid(null);
  };

  return (
    <ToolLayout
      title="JSON Formatter & Validator"
      description="Format, validate, and beautify your JSON data with syntax highlighting and error detection"
      icon={<FileText className="h-8 w-8 text-blue-500" />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Input JSON</label>
            <div className="flex items-center space-x-2">
              {isValid === true && <Check className="h-4 w-4 text-green-500" />}
              {isValid === false && <AlertCircle className="h-4 w-4 text-red-500" />}
            </div>
          </div>
          <Textarea
            placeholder="Paste your JSON here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[400px] font-mono text-sm"
          />
          <div className="flex flex-wrap gap-2">
            <Button onClick={formatJson} className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Format</span>
            </Button>
            <Button onClick={minifyJson} variant="outline" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Minify</span>
            </Button>
            <Button onClick={validateJson} variant="outline" className="flex items-center space-x-2">
              <Check className="h-4 w-4" />
              <span>Validate</span>
            </Button>
            <Button onClick={clear} variant="outline" className="flex items-center space-x-2">
              <Trash2 className="h-4 w-4" />
              <span>Clear</span>
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Output</label>
            {output && (
              <Button onClick={copyToClipboard} size="sm" variant="outline">
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            )}
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Textarea
            placeholder="Formatted JSON will appear here..."
            value={output}
            readOnly
            className="min-h-[400px] font-mono text-sm bg-muted"
          />
        </div>
      </div>
    </ToolLayout>
  );
}