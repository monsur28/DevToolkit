'use client';

import { useState } from 'react';
import { ToolLayout } from '@/components/tool-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Hash, Copy, RefreshCw, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function UuidGeneratorPage() {
  const [uuids, setUuids] = useState<string[]>([]);
  const [count, setCount] = useState('1');
  const [version, setVersion] = useState('4');
  const { toast } = useToast();

  const generateUUID = () => {
    const newUuids: string[] = [];
    const numUuids = Math.min(parseInt(count) || 1, 100);

    for (let i = 0; i < numUuids; i++) {
      if (version === '4') {
        newUuids.push(generateUUIDv4());
      } else if (version === '1') {
        newUuids.push(generateUUIDv1());
      } else {
        newUuids.push(generateUUIDv4()); // fallback
      }
    }

    setUuids(newUuids);
  };

  const generateUUIDv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const generateUUIDv1 = () => {
    // Simplified UUID v1 implementation
    const timestamp = Date.now();
    const random = Math.random().toString(16).substring(2, 15);
    return `${timestamp.toString(16).padStart(8, '0').substring(0, 8)}-${random.substring(0, 4)}-1${random.substring(4, 7)}-${random.substring(7, 11)}-${random.substring(11, 23)}`;
  };

  const copyToClipboard = async (uuid: string) => {
    await navigator.clipboard.writeText(uuid);
    toast({
      title: "Copied!",
      description: "UUID copied to clipboard",
    });
  };

  const copyAllToClipboard = async () => {
    const allUuids = uuids.join('\n');
    await navigator.clipboard.writeText(allUuids);
    toast({
      title: "Copied!",
      description: `${uuids.length} UUIDs copied to clipboard`,
    });
  };

  const clear = () => {
    setUuids([]);
  };

  return (
    <ToolLayout
      title="UUID Generator"
      description="Generate universally unique identifiers (UUIDs) in various formats and quantities"
      icon={<Hash className="h-8 w-8 text-orange-500" />}
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Generator Settings</CardTitle>
            <CardDescription>Configure your UUID generation preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">UUID Version</label>
                <Select value={version} onValueChange={setVersion}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">Version 4 (Random)</SelectItem>
                    <SelectItem value="1">Version 1 (Time-based)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Count (max 100)</label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  placeholder="Number of UUIDs"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Actions</label>
                <div className="flex gap-2">
                  <Button onClick={generateUUID} className="flex items-center space-x-2">
                    <RefreshCw className="h-4 w-4" />
                    <span>Generate</span>
                  </Button>
                  {uuids.length > 0 && (
                    <Button onClick={clear} variant="outline" className="flex items-center space-x-2">
                      <Trash2 className="h-4 w-4" />
                      <span>Clear</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {uuids.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Generated UUIDs</CardTitle>
                  <CardDescription>
                    {uuids.length} UUID{uuids.length > 1 ? 's' : ''} generated
                  </CardDescription>
                </div>
                <Button onClick={copyAllToClipboard} variant="outline" className="flex items-center space-x-2">
                  <Copy className="h-4 w-4" />
                  <span>Copy All</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {uuids.map((uuid, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-md">
                    <code className="font-mono text-sm flex-1">{uuid}</code>
                    <Button
                      onClick={() => copyToClipboard(uuid)}
                      size="sm"
                      variant="ghost"
                      className="ml-2"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">About UUIDs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p><strong>Version 1:</strong> Time-based UUIDs that include timestamp and MAC address information. These are sequential and can reveal information about when and where they were generated.</p>
            <p><strong>Version 4:</strong> Random UUIDs that are generated using random or pseudo-random numbers. These are the most commonly used type and provide good uniqueness without revealing system information.</p>
            <p>UUIDs are 128-bit values typically displayed as 32 hexadecimal digits in groups of 8-4-4-4-12 format.</p>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
}