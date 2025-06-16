'use client';

import { useState } from 'react';
import { ToolLayout } from '@/components/tool-layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Key, Copy, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Base64Page() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const { toast } = useToast();

  const encode = () => {
    try {
      const encoded = btoa(input);
      setOutput(encoded);
    } catch (err) {
      toast({
        title: "Encoding Error",
        description: "Failed to encode the input text",
        variant: "destructive"
      });
    }
  };

  const decode = () => {
    try {
      const decoded = atob(input);
      setOutput(decoded);
    } catch (err) {
      toast({
        title: "Decoding Error", 
        description: "Invalid Base64 string",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = async () => {
    if (output) {
      await navigator.clipboard.writeText(output);
      toast({
        title: "Copied!",
        description: "Result copied to clipboard",
      });
    }
  };

  const clear = () => {
    setInput('');
    setOutput('');
  };

  const swap = () => {
    const temp = input;
    setInput(output);
    setOutput(temp);
  };

  return (
    <ToolLayout
      title="Base64 Encoder/Decoder"
      description="Encode text to Base64 or decode Base64 strings back to readable text"
      icon={<Key className="h-8 w-8 text-green-500" />}
    >
      <Tabs defaultValue="encode" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="encode" className="flex items-center space-x-2">
            <ArrowRight className="h-4 w-4" />
            <span>Encode</span>
          </TabsTrigger>
          <TabsTrigger value="decode" className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Decode</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="encode" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="text-sm font-medium">Text to Encode</label>
              <Textarea
                placeholder="Enter text to encode to Base64..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[300px]"
              />
              <div className="flex gap-2">
                <Button onClick={encode} className="flex items-center space-x-2">
                  <ArrowRight className="h-4 w-4" />
                  <span>Encode</span>
                </Button>
                <Button onClick={clear} variant="outline" className="flex items-center space-x-2">
                  <Trash2 className="h-4 w-4" />
                  <span>Clear</span>
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Base64 Output</label>
                {output && (
                  <Button onClick={copyToClipboard} size="sm" variant="outline">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                )}
              </div>
              <Textarea
                placeholder="Base64 encoded text will appear here..."
                value={output}
                readOnly
                className="min-h-[300px] font-mono text-sm bg-muted"
              />
              {output && (
                <Button onClick={swap} variant="outline" size="sm">
                  Use as Input
                </Button>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="decode" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="text-sm font-medium">Base64 to Decode</label>
              <Textarea
                placeholder="Enter Base64 string to decode..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
              />
              <div className="flex gap-2">
                <Button onClick={decode} className="flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Decode</span>
                </Button>
                <Button onClick={clear} variant="outline" className="flex items-center space-x-2">
                  <Trash2 className="h-4 w-4" />
                  <span>Clear</span>
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Decoded Text</label>
                {output && (
                  <Button onClick={copyToClipboard} size="sm" variant="outline">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                )}
              </div>
              <Textarea
                placeholder="Decoded text will appear here..."
                value={output}
                readOnly
                className="min-h-[300px] bg-muted"
              />
              {output && (
                <Button onClick={swap} variant="outline" size="sm">
                  Use as Input
                </Button>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </ToolLayout>
  );
}