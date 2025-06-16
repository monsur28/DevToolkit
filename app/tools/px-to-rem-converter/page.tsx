'use client';

import { useState, useEffect } from 'react';
import { ToolLayout } from '@/components/tool-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Calculator, Copy, Trash2, Settings, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface ConversionResult {
  px: number;
  rem: number;
  formula: string;
}

interface Settings {
  baseFontSize: number;
  decimalPlaces: number;
}

export default function PxToRemConverterPage() {
  const [singleInput, setSingleInput] = useState('16');
  const [bulkInput, setBulkInput] = useState('');
  const [settings, setSettings] = useState<Settings>({
    baseFontSize: 16,
    decimalPlaces: 3
  });
  const [singleResult, setSingleResult] = useState<ConversionResult | null>(null);
  const [bulkResults, setBulkResults] = useState<ConversionResult[]>([]);
  const [commonValues, setCommonValues] = useState<ConversionResult[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('px-rem-converter-settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        // Ignore parsing errors
      }
    }
  }, []);

  useEffect(() => {
    // Save settings to localStorage
    localStorage.setItem('px-rem-converter-settings', JSON.stringify(settings));
    
    // Recalculate all values when settings change
    if (singleInput) {
      convertSingle();
    }
    if (bulkInput) {
      convertBulk();
    }
    generateCommonValues();
  }, [settings]);

  useEffect(() => {
    generateCommonValues();
  }, []);

  const convertPxToRem = (px: number): ConversionResult => {
    const rem = parseFloat((px / settings.baseFontSize).toFixed(settings.decimalPlaces));
    return {
      px,
      rem,
      formula: `${px}px ÷ ${settings.baseFontSize}px = ${rem}rem`
    };
  };

  const convertSingle = () => {
    const px = parseFloat(singleInput);
    if (isNaN(px)) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid number",
        variant: "destructive"
      });
      return;
    }
    
    setSingleResult(convertPxToRem(px));
  };

  const convertBulk = () => {
    const lines = bulkInput.split('\n').filter(line => line.trim());
    const results: ConversionResult[] = [];
    
    lines.forEach(line => {
      // Support different formats: "16", "16px", "16,20,24", "16 20 24"
      const values = line
        .replace(/px/g, '')
        .split(/[,\s]+/)
        .map(v => v.trim())
        .filter(v => v);
      
      values.forEach(value => {
        const px = parseFloat(value);
        if (!isNaN(px)) {
          results.push(convertPxToRem(px));
        }
      });
    });
    
    setBulkResults(results);
    
    if (results.length === 0) {
      toast({
        title: "No Valid Values",
        description: "Please enter valid pixel values",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Conversion Complete",
        description: `Converted ${results.length} values successfully`,
      });
    }
  };

  const generateCommonValues = () => {
    const common = [8, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 96];
    setCommonValues(common.map(px => convertPxToRem(px)));
  };

  const copyToClipboard = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const copyBulkResults = async () => {
    const text = bulkResults.map(result => `${result.px}px = ${result.rem}rem`).join('\n');
    await navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "All conversion results copied to clipboard",
    });
  };

  const downloadResults = () => {
    const content = `PX to REM Conversion Results
Base Font Size: ${settings.baseFontSize}px
Decimal Places: ${settings.decimalPlaces}
Generated: ${new Date().toLocaleString()}

${bulkResults.map(result => `${result.px}px = ${result.rem}rem`).join('\n')}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'px-to-rem-conversion.txt';
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded!",
      description: "Conversion results downloaded successfully",
    });
  };

  const clear = () => {
    setSingleInput('');
    setBulkInput('');
    setSingleResult(null);
    setBulkResults([]);
  };

  const loadExample = () => {
    setBulkInput(`8, 12, 16, 20, 24
32px 40px 48px
56
64 72 80
96px`);
  };

  const updateSettings = (field: keyof Settings, value: number) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ToolLayout
      title="PX to REM Converter"
      description="Convert pixel values to REM units with bulk conversion and customizable settings"
      icon={<Calculator className="h-8 w-8 text-green-500" />}
    >
      <div className="space-y-6">
        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Conversion Settings
            </CardTitle>
            <CardDescription>Configure base font size and decimal precision</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Base Font Size (px)</Label>
                <Input
                  type="number"
                  value={settings.baseFontSize}
                  onChange={(e) => updateSettings('baseFontSize', parseFloat(e.target.value) || 16)}
                  min="1"
                  max="32"
                  step="1"
                />
                <p className="text-xs text-muted-foreground">
                  Typically 16px (browser default)
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Decimal Places</Label>
                <Select 
                  value={settings.decimalPlaces.toString()} 
                  onValueChange={(value) => updateSettings('decimalPlaces', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0 (1rem)</SelectItem>
                    <SelectItem value="1">1 (1.5rem)</SelectItem>
                    <SelectItem value="2">2 (1.25rem)</SelectItem>
                    <SelectItem value="3">3 (1.125rem)</SelectItem>
                    <SelectItem value="4">4 (1.0625rem)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Formula</Label>
                <div className="p-2 bg-muted rounded text-sm font-mono">
                  px ÷ {settings.baseFontSize} = rem
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="single" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="single">Single Conversion</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Conversion</TabsTrigger>
            <TabsTrigger value="table">Common Values</TabsTrigger>
          </TabsList>

          <TabsContent value="single" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pixel Input</CardTitle>
                  <CardDescription>Enter a pixel value to convert</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Enter pixel value"
                      value={singleInput}
                      onChange={(e) => setSingleInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && convertSingle()}
                      className="flex-1"
                    />
                    <span className="flex items-center text-sm text-muted-foreground">px</span>
                  </div>
                  
                  <Button onClick={convertSingle} className="w-full">
                    <Calculator className="h-4 w-4 mr-2" />
                    Convert to REM
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Conversion Result</CardTitle>
                  <CardDescription>REM value and calculation formula</CardDescription>
                </CardHeader>
                <CardContent>
                  {singleResult ? (
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary">
                          {singleResult.rem}rem
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          from {singleResult.px}px
                        </div>
                      </div>
                      
                      <div className="p-3 bg-muted rounded-md">
                        <div className="text-sm font-mono text-center">
                          {singleResult.formula}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => copyToClipboard(`${singleResult.rem}rem`, 'REM value')}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy REM
                        </Button>
                        <Button 
                          onClick={() => copyToClipboard(singleResult.formula, 'Formula')}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Formula
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Enter a pixel value to see the conversion</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="bulk" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Bulk Input</CardTitle>
                  <CardDescription>
                    Enter multiple values (comma, space, or line separated)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder={`Enter pixel values in any format:
8, 12, 16, 20, 24
32px 40px 48px
56
64 72 80`}
                    value={bulkInput}
                    onChange={(e) => setBulkInput(e.target.value)}
                    className="min-h-[200px] font-mono text-sm"
                  />
                  
                  <div className="flex gap-2">
                    <Button onClick={convertBulk} className="flex-1">
                      <Calculator className="h-4 w-4 mr-2" />
                      Convert All
                    </Button>
                    <Button onClick={clear} variant="outline">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                    <Button onClick={loadExample} variant="outline" size="sm">
                      Example
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Conversion Results</CardTitle>
                      <CardDescription>
                        {bulkResults.length > 0 && `${bulkResults.length} values converted`}
                      </CardDescription>
                    </div>
                    {bulkResults.length > 0 && (
                      <div className="flex gap-2">
                        <Button onClick={copyBulkResults} size="sm" variant="outline">
                          <Copy className="h-4 w-4 mr-2" />
                          Copy All
                        </Button>
                        <Button onClick={downloadResults} size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {bulkResults.length > 0 ? (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {bulkResults.map((result, index) => (
                        <div 
                          key={index}
                          className="flex items-center justify-between p-2 bg-muted rounded hover:bg-muted/80 transition-colors"
                        >
                          <span className="font-mono text-sm">
                            {result.px}px
                          </span>
                          <span className="text-muted-foreground">→</span>
                          <span className="font-mono text-sm font-medium">
                            {result.rem}rem
                          </span>
                          <Button
                            onClick={() => copyToClipboard(`${result.rem}rem`, 'REM value')}
                            size="sm"
                            variant="ghost"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Enter pixel values to see bulk conversions</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="table" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Common Values Reference</CardTitle>
                    <CardDescription>
                      Frequently used pixel to REM conversions
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={() => copyToClipboard(
                      commonValues.map(v => `${v.px}px = ${v.rem}rem`).join('\n'),
                      'Common values table'
                    )}
                    size="sm" 
                    variant="outline"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Table
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {commonValues.map((result, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => copyToClipboard(`${result.rem}rem`, 'REM value')}
                    >
                      <span className="font-mono text-sm text-muted-foreground">
                        {result.px}px
                      </span>
                      <span className="font-mono text-sm font-medium">
                        {result.rem}rem
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Usage Tips:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Click any value to copy the REM equivalent</li>
                    <li>• Use REM for scalable typography and spacing</li>
                    <li>• Base font size affects all REM calculations</li>
                    <li>• Common breakpoints: 768px (48rem), 1024px (64rem), 1280px (80rem)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Keyboard Shortcuts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Keyboard Shortcuts</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex justify-between">
              <span>Convert</span>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">Enter</kbd>
            </div>
            <div className="flex justify-between">
              <span>Clear All</span>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl + Del</kbd>
            </div>
            <div className="flex justify-between">
              <span>Copy Result</span>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl + C</kbd>
            </div>
            <div className="flex justify-between">
              <span>Focus Input</span>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl + /</kbd>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
}