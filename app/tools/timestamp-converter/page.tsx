'use client';

import { useState, useEffect } from 'react';
import { ToolLayout } from '@/components/tool-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Clock, Copy, RefreshCw, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function TimestampConverterPage() {
  const [timestamp, setTimestamp] = useState('');
  const [humanDate, setHumanDate] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const convertToHuman = () => {
    try {
      const ts = parseInt(timestamp);
      if (isNaN(ts)) {
        toast({
          title: "Error",
          description: "Please enter a valid timestamp",
          variant: "destructive"
        });
        return;
      }

      // Handle both seconds and milliseconds
      const date = new Date(ts > 1e10 ? ts : ts * 1000);
      
      if (isNaN(date.getTime())) {
        toast({
          title: "Error",
          description: "Invalid timestamp",
          variant: "destructive"
        });
        return;
      }

      setHumanDate(date.toISOString());
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to convert timestamp",
        variant: "destructive"
      });
    }
  };

  const convertToTimestamp = () => {
    try {
      const date = new Date(humanDate);
      
      if (isNaN(date.getTime())) {
        toast({
          title: "Error",
          description: "Please enter a valid date",
          variant: "destructive"
        });
        return;
      }

      setTimestamp(Math.floor(date.getTime() / 1000).toString());
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to convert date",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const useCurrentTime = () => {
    const now = new Date();
    setTimestamp(Math.floor(now.getTime() / 1000).toString());
    setHumanDate(now.toISOString());
  };

  const formatDate = (date: Date) => {
    return {
      iso: date.toISOString(),
      utc: date.toUTCString(),
      local: date.toLocaleString(),
      date: date.toDateString(),
      time: date.toTimeString(),
      unix: Math.floor(date.getTime() / 1000),
      unixMs: date.getTime()
    };
  };

  const currentFormatted = formatDate(currentTime);
  const timestampFormatted = timestamp ? formatDate(new Date(parseInt(timestamp) > 1e10 ? parseInt(timestamp) : parseInt(timestamp) * 1000)) : null;
  const humanFormatted = humanDate ? formatDate(new Date(humanDate)) : null;

  return (
    <ToolLayout
      title="Timestamp Converter"
      description="Convert Unix timestamps to human-readable dates and vice versa"
      icon={<Clock className="h-8 w-8 text-pink-500" />}
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Current Time</span>
            </CardTitle>
            <CardDescription>Live current timestamp and date</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Unix Timestamp:</span>
                  <Button
                    onClick={() => copyToClipboard(currentFormatted.unix.toString(), 'Unix timestamp')}
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <code className="block bg-muted p-2 rounded text-xs">{currentFormatted.unix}</code>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Unix (ms):</span>
                  <Button
                    onClick={() => copyToClipboard(currentFormatted.unixMs.toString(), 'Unix timestamp (ms)')}
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <code className="block bg-muted p-2 rounded text-xs">{currentFormatted.unixMs}</code>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">ISO 8601:</span>
                  <Button
                    onClick={() => copyToClipboard(currentFormatted.iso, 'ISO date')}
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <code className="block bg-muted p-2 rounded text-xs">{currentFormatted.iso}</code>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Local:</span>
                  <Button
                    onClick={() => copyToClipboard(currentFormatted.local, 'Local date')}
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <code className="block bg-muted p-2 rounded text-xs">{currentFormatted.local}</code>
              </div>
            </div>
            <Button onClick={useCurrentTime} variant="outline" size="sm">
              Use Current Time
            </Button>
          </CardContent>
        </Card>

        <Tabs defaultValue="to-human" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="to-human">Timestamp → Human</TabsTrigger>
            <TabsTrigger value="to-timestamp">Human → Timestamp</TabsTrigger>
          </TabsList>

          <TabsContent value="to-human" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Convert Timestamp to Human Date</CardTitle>
                <CardDescription>Enter Unix timestamp (seconds or milliseconds)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter Unix timestamp (e.g., 1640995200)"
                    value={timestamp}
                    onChange={(e) => setTimestamp(e.target.value)}
                    className="font-mono"
                  />
                  <Button onClick={convertToHuman}>Convert</Button>
                </div>

                {timestampFormatted && (
                  <div className="space-y-3 mt-4">
                    <h4 className="font-medium">Converted Formats:</h4>
                    <div className="grid grid-cols-1 gap-3 text-sm">
                      {[
                        { label: 'ISO 8601', value: timestampFormatted.iso },
                        { label: 'UTC', value: timestampFormatted.utc },
                        { label: 'Local', value: timestampFormatted.local },
                        { label: 'Date Only', value: timestampFormatted.date },
                        { label: 'Time Only', value: timestampFormatted.time }
                      ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between items-center p-2 bg-muted rounded">
                          <span className="font-medium">{label}:</span>
                          <div className="flex items-center space-x-2">
                            <code className="text-xs">{value}</code>
                            <Button
                              onClick={() => copyToClipboard(value, label)}
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="to-timestamp" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Convert Human Date to Timestamp</CardTitle>
                <CardDescription>Enter date in any standard format</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter date (e.g., 2024-01-01T00:00:00Z)"
                    value={humanDate}
                    onChange={(e) => setHumanDate(e.target.value)}
                    className="font-mono"
                  />
                  <Button onClick={convertToTimestamp}>Convert</Button>
                </div>

                {humanFormatted && (
                  <div className="space-y-3 mt-4">
                    <h4 className="font-medium">Converted Timestamps:</h4>
                    <div className="grid grid-cols-1 gap-3 text-sm">
                      {[
                        { label: 'Unix Timestamp (seconds)', value: humanFormatted.unix.toString() },
                        { label: 'Unix Timestamp (milliseconds)', value: humanFormatted.unixMs.toString() }
                      ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between items-center p-2 bg-muted rounded">
                          <span className="font-medium">{label}:</span>
                          <div className="flex items-center space-x-2">
                            <code className="text-xs">{value}</code>
                            <Button
                              onClick={() => copyToClipboard(value, label)}
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ToolLayout>
  );
}