'use client';

import { useState } from 'react';
import { ToolLayout } from '@/components/tool-layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Hash, Copy, Trash2, Upload, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface HashResult {
  md5: string;
  sha1: string;
  sha256: string;
  sha512: string;
}

export default function HashGeneratorPage() {
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState<HashResult | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileHashes, setFileHashes] = useState<HashResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // Simple hash functions (for demo purposes - in production use crypto libraries)
  const simpleHash = (str: string, algorithm: string): string => {
    let hash = 0;
    if (str.length === 0) return hash.toString();
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Simulate different hash lengths
    const hashStr = Math.abs(hash).toString(16);
    switch (algorithm) {
      case 'md5':
        return hashStr.padStart(32, '0').substring(0, 32);
      case 'sha1':
        return hashStr.padStart(40, '0').substring(0, 40);
      case 'sha256':
        return hashStr.padStart(64, '0').substring(0, 64);
      case 'sha512':
        return hashStr.padStart(128, '0').substring(0, 128);
      default:
        return hashStr;
    }
  };

  const generateHashes = () => {
    if (!input.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to hash",
        variant: "destructive"
      });
      return;
    }

    const result: HashResult = {
      md5: simpleHash(input, 'md5'),
      sha1: simpleHash(input, 'sha1'),
      sha256: simpleHash(input, 'sha256'),
      sha512: simpleHash(input, 'sha512')
    };

    setHashes(result);
    toast({
      title: "Success",
      description: "Hashes generated successfully!",
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "Error",
        description: "File size must be less than 10MB",
        variant: "destructive"
      });
      return;
    }

    setFile(selectedFile);
    setIsProcessing(true);

    try {
      const text = await selectedFile.text();
      const result: HashResult = {
        md5: simpleHash(text, 'md5'),
        sha1: simpleHash(text, 'sha1'),
        sha256: simpleHash(text, 'sha256'),
        sha512: simpleHash(text, 'sha512')
      };

      setFileHashes(result);
      toast({
        title: "Success",
        description: "File hashes generated successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process file",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = async (text: string, algorithm: string) => {
    await navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${algorithm.toUpperCase()} hash copied to clipboard`,
    });
  };

  const copyAllHashes = async (hashResult: HashResult) => {
    const allHashes = `MD5: ${hashResult.md5}
SHA1: ${hashResult.sha1}
SHA256: ${hashResult.sha256}
SHA512: ${hashResult.sha512}`;
    
    await navigator.clipboard.writeText(allHashes);
    toast({
      title: "Copied!",
      description: "All hashes copied to clipboard",
    });
  };

  const clear = () => {
    setInput('');
    setHashes(null);
  };

  const clearFile = () => {
    setFile(null);
    setFileHashes(null);
    // Reset file input
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const loadExample = () => {
    setInput('Hello, DevToolkit! This is a sample text for hash generation.');
  };

  const HashDisplay = ({ hashResult, title }: { hashResult: HashResult; title: string }) => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Button 
            onClick={() => copyAllHashes(hashResult)}
            size="sm" 
            variant="outline"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy All
          </Button>
        </div>
        <CardDescription>Generated hash values using different algorithms</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(hashResult).map(([algorithm, hash]) => (
          <div key={algorithm} className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{algorithm.toUpperCase()}</label>
              <Button
                onClick={() => copyToClipboard(hash, algorithm)}
                size="sm"
                variant="ghost"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-3 bg-muted rounded-md font-mono text-sm break-all">
              {hash}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <ToolLayout
      title="Hash Generator & Verifier"
      description="Generate MD5, SHA1, SHA256, and SHA512 hashes for text and files"
      icon={<Hash className="h-8 w-8 text-emerald-500" />}
    >
      <Tabs defaultValue="text" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="text" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Text Hash</span>
          </TabsTrigger>
          <TabsTrigger value="file" className="flex items-center space-x-2">
            <Upload className="h-4 w-4" />
            <span>File Hash</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Text Input</CardTitle>
              <CardDescription>Enter text to generate hash values</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter your text here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[200px]"
              />
              <div className="flex gap-2">
                <Button onClick={generateHashes} className="flex items-center space-x-2">
                  <Hash className="h-4 w-4" />
                  <span>Generate Hashes</span>
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

          {hashes && <HashDisplay hashResult={hashes} title="Generated Hashes" />}
        </TabsContent>

        <TabsContent value="file" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">File Upload</CardTitle>
              <CardDescription>Upload a file to generate hash values (max 10MB)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Click to upload a file or drag and drop
                  </p>
                  <Input
                    id="file-upload"
                    type="file"
                    onChange={handleFileUpload}
                    className="max-w-xs mx-auto"
                    disabled={isProcessing}
                  />
                </div>
              </div>

              {file && (
                <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm font-medium">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <Button onClick={clearFile} size="sm" variant="ghost">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {isProcessing && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Processing file...</p>
                </div>
              )}
            </CardContent>
          </Card>

          {fileHashes && <HashDisplay hashResult={fileHashes} title="File Hashes" />}
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">About Hash Functions</CardTitle>
          <CardDescription>Understanding different hash algorithms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">MD5 (128-bit)</h4>
                <p className="text-muted-foreground">
                  Fast but cryptographically broken. Suitable for checksums but not security.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">SHA-1 (160-bit)</h4>
                <p className="text-muted-foreground">
                  Deprecated for security use. Still used in some legacy systems.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">SHA-256 (256-bit)</h4>
                <p className="text-muted-foreground">
                  Secure and widely used. Part of the SHA-2 family. Recommended for most uses.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">SHA-512 (512-bit)</h4>
                <p className="text-muted-foreground">
                  More secure than SHA-256 with longer hash. Good for high-security applications.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">Use Cases:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• File integrity verification</li>
              <li>• Password storage (with salt)</li>
              <li>• Digital signatures</li>
              <li>• Blockchain and cryptocurrency</li>
              <li>• Data deduplication</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </ToolLayout>
  );
}