'use client';

import { useState } from 'react';
import { ToolLayout } from '@/components/tool-layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { FileCode, Copy, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import * as yaml from 'js-yaml';

export default function YamlJsonConverterPage() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const { toast } = useToast();

  const convertYamlToJson = () => {
    try {
      const parsed = yaml.load(input);
      const jsonOutput = JSON.stringify(parsed, null, 2);
      setOutput(jsonOutput);
      setError('');
      toast({
        title: "Success",
        description: "YAML converted to JSON successfully!",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid YAML format');
      setOutput('');
    }
  };

  const convertJsonToYaml = () => {
    try {
      const parsed = JSON.parse(input);
      const yamlOutput = yaml.dump(parsed, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
        sortKeys: false
      });
      setOutput(yamlOutput);
      setError('');
      toast({
        title: "Success",
        description: "JSON converted to YAML successfully!",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON format');
      setOutput('');
    }
  };

  const copyToClipboard = async () => {
    if (output) {
      await navigator.clipboard.writeText(output);
      toast({
        title: "Copied!",
        description: "Output copied to clipboard",
      });
    }
  };

  const clear = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  const swap = () => {
    const temp = input;
    setInput(output);
    setOutput(temp);
    setError('');
  };

  const loadJsonExample = () => {
    const example = `{
  "name": "DevToolkit",
  "version": "1.0.0",
  "description": "A comprehensive suite of developer utilities",
  "features": [
    "JSON Formatter",
    "Base64 Encoder/Decoder",
    "JWT Decoder",
    "UUID Generator"
  ],
  "config": {
    "theme": "dark",
    "autoSave": true,
    "notifications": {
      "enabled": true,
      "sound": false
    }
  }
}`;
    setInput(example);
  };

  const loadYamlExample = () => {
    const example = `name: DevToolkit
version: 1.0.0
description: A comprehensive suite of developer utilities
features:
  - JSON Formatter
  - Base64 Encoder/Decoder
  - JWT Decoder
  - UUID Generator
config:
  theme: dark
  autoSave: true
  notifications:
    enabled: true
    sound: false`;
    setInput(example);
  };

  return (
    <ToolLayout
      title="YAML ⇄ JSON Converter"
      description="Bi-directional conversion between YAML and JSON formats with live preview"
      icon={<FileCode className="h-8 w-8 text-teal-500" />}
    >
      <Tabs defaultValue="yaml-to-json" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="yaml-to-json" className="flex items-center space-x-2">
            <span>YAML</span>
            <ArrowRight className="h-4 w-4" />
            <span>JSON</span>
          </TabsTrigger>
          <TabsTrigger value="json-to-yaml" className="flex items-center space-x-2">
            <span>JSON</span>
            <ArrowRight className="h-4 w-4" />
            <span>YAML</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="yaml-to-json" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">YAML Input</label>
                <Button onClick={loadYamlExample} variant="outline" size="sm">
                  Load Example
                </Button>
              </div>
              <Textarea
                placeholder="Enter YAML here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[400px] font-mono text-sm"
              />
              <div className="flex gap-2">
                <Button onClick={convertYamlToJson} className="flex items-center space-x-2">
                  <ArrowRight className="h-4 w-4" />
                  <span>Convert to JSON</span>
                </Button>
                <Button onClick={clear} variant="outline" className="flex items-center space-x-2">
                  <Trash2 className="h-4 w-4" />
                  <span>Clear</span>
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">JSON Output</label>
                {output && (
                  <div className="flex gap-2">
                    <Button onClick={copyToClipboard} size="sm" variant="outline">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button onClick={swap} size="sm" variant="outline">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Use as Input
                    </Button>
                  </div>
                )}
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Textarea
                placeholder="JSON output will appear here..."
                value={output}
                readOnly
                className="min-h-[400px] font-mono text-sm bg-muted"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="json-to-yaml" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">JSON Input</label>
                <Button onClick={loadJsonExample} variant="outline" size="sm">
                  Load Example
                </Button>
              </div>
              <Textarea
                placeholder="Enter JSON here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[400px] font-mono text-sm"
              />
              <div className="flex gap-2">
                <Button onClick={convertJsonToYaml} className="flex items-center space-x-2">
                  <ArrowRight className="h-4 w-4" />
                  <span>Convert to YAML</span>
                </Button>
                <Button onClick={clear} variant="outline" className="flex items-center space-x-2">
                  <Trash2 className="h-4 w-4" />
                  <span>Clear</span>
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">YAML Output</label>
                {output && (
                  <div className="flex gap-2">
                    <Button onClick={copyToClipboard} size="sm" variant="outline">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button onClick={swap} size="sm" variant="outline">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Use as Input
                    </Button>
                  </div>
                )}
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Textarea
                placeholder="YAML output will appear here..."
                value={output}
                readOnly
                className="min-h-[400px] font-mono text-sm bg-muted"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </ToolLayout>
  );
}