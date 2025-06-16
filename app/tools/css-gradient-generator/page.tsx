'use client';

import { useState, useEffect } from 'react';
import { ToolLayout } from '@/components/tool-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Palette, Copy, Trash2, Plus, Minus, RotateCcw, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface ColorStop {
  id: string;
  color: string;
  position: number;
  opacity: number;
}

interface GradientConfig {
  type: 'linear' | 'radial';
  angle: number;
  centerX: number;
  centerY: number;
  radius: number;
  colorStops: ColorStop[];
}

export default function CSSGradientGeneratorPage() {
  const [config, setConfig] = useState<GradientConfig>({
    type: 'linear',
    angle: 90,
    centerX: 50,
    centerY: 50,
    radius: 50,
    colorStops: [
      { id: '1', color: '#ff6b6b', position: 0, opacity: 100 },
      { id: '2', color: '#4ecdc4', position: 100, opacity: 100 }
    ]
  });
  const [recentColors, setRecentColors] = useState<string[]>(['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57']);
  const [cssOutput, setCssOutput] = useState('');
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    generateCSS();
  }, [config]);

  useEffect(() => {
    // Load recent colors from localStorage
    const saved = localStorage.getItem('css-gradient-recent-colors');
    if (saved) {
      try {
        setRecentColors(JSON.parse(saved));
      } catch (e) {
        // Ignore parsing errors
      }
    }
  }, []);

  const generateCSS = () => {
    const { type, angle, centerX, centerY, radius, colorStops } = config;
    
    // Sort color stops by position
    const sortedStops = [...colorStops].sort((a, b) => a.position - b.position);
    
    // Generate color stop strings
    const stopStrings = sortedStops.map(stop => {
      const rgba = hexToRgba(stop.color, stop.opacity / 100);
      return `${rgba} ${stop.position}%`;
    });

    let gradient = '';
    let webkitGradient = '';
    let mozGradient = '';

    if (type === 'linear') {
      gradient = `linear-gradient(${angle}deg, ${stopStrings.join(', ')})`;
      webkitGradient = `-webkit-linear-gradient(${angle}deg, ${stopStrings.join(', ')})`;
      mozGradient = `-moz-linear-gradient(${angle}deg, ${stopStrings.join(', ')})`;
    } else {
      gradient = `radial-gradient(circle at ${centerX}% ${centerY}%, ${stopStrings.join(', ')})`;
      webkitGradient = `-webkit-radial-gradient(${centerX}% ${centerY}%, circle, ${stopStrings.join(', ')})`;
      mozGradient = `-moz-radial-gradient(${centerX}% ${centerY}%, circle, ${stopStrings.join(', ')})`;
    }

    const css = `/* Standard syntax */
background: ${gradient};

/* Webkit browsers */
background: ${webkitGradient};

/* Mozilla Firefox */
background: ${mozGradient};

/* Internet Explorer 10+ */
background: -ms-${gradient};`;

    setCssOutput(css);
  };

  const hexToRgba = (hex: string, alpha: number): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const addColorStop = () => {
    const newStop: ColorStop = {
      id: Date.now().toString(),
      color: '#ffffff',
      position: 50,
      opacity: 100
    };
    setConfig(prev => ({
      ...prev,
      colorStops: [...prev.colorStops, newStop]
    }));
  };

  const removeColorStop = (id: string) => {
    if (config.colorStops.length <= 2) {
      toast({
        title: "Cannot Remove",
        description: "A gradient must have at least 2 color stops",
        variant: "destructive"
      });
      return;
    }
    
    setConfig(prev => ({
      ...prev,
      colorStops: prev.colorStops.filter(stop => stop.id !== id)
    }));
  };

  const updateColorStop = (id: string, field: keyof ColorStop, value: any) => {
    setConfig(prev => ({
      ...prev,
      colorStops: prev.colorStops.map(stop =>
        stop.id === id ? { ...stop, [field]: value } : stop
      )
    }));
  };

  const addToRecentColors = (color: string) => {
    const newRecent = [color, ...recentColors.filter(c => c !== color)].slice(0, 10);
    setRecentColors(newRecent);
    localStorage.setItem('css-gradient-recent-colors', JSON.stringify(newRecent));
  };

  const copyCSS = async () => {
    await navigator.clipboard.writeText(cssOutput);
    toast({
      title: "Copied!",
      description: "CSS code copied to clipboard",
    });
  };

  const downloadCSS = () => {
    const blob = new Blob([cssOutput], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gradient.css';
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded!",
      description: "CSS file downloaded successfully",
    });
  };

  const resetGradient = () => {
    setConfig({
      type: 'linear',
      angle: 90,
      centerX: 50,
      centerY: 50,
      radius: 50,
      colorStops: [
        { id: '1', color: '#ff6b6b', position: 0, opacity: 100 },
        { id: '2', color: '#4ecdc4', position: 100, opacity: 100 }
      ]
    });
  };

  const loadPreset = (preset: string) => {
    const presets = {
      sunset: {
        ...config,
        colorStops: [
          { id: '1', color: '#ff9a9e', position: 0, opacity: 100 },
          { id: '2', color: '#fecfef', position: 50, opacity: 100 },
          { id: '3', color: '#fecfef', position: 100, opacity: 100 }
        ]
      },
      ocean: {
        ...config,
        colorStops: [
          { id: '1', color: '#667eea', position: 0, opacity: 100 },
          { id: '2', color: '#764ba2', position: 100, opacity: 100 }
        ]
      },
      forest: {
        ...config,
        colorStops: [
          { id: '1', color: '#134e5e', position: 0, opacity: 100 },
          { id: '2', color: '#71b280', position: 100, opacity: 100 }
        ]
      },
      fire: {
        ...config,
        colorStops: [
          { id: '1', color: '#f12711', position: 0, opacity: 100 },
          { id: '2', color: '#f5af19', position: 100, opacity: 100 }
        ]
      }
    };
    
    setConfig(presets[preset as keyof typeof presets]);
  };

  const gradientStyle = {
    background: config.type === 'linear' 
      ? `linear-gradient(${config.angle}deg, ${config.colorStops.map(stop => 
          `${hexToRgba(stop.color, stop.opacity / 100)} ${stop.position}%`
        ).join(', ')})`
      : `radial-gradient(circle at ${config.centerX}% ${config.centerY}%, ${config.colorStops.map(stop => 
          `${hexToRgba(stop.color, stop.opacity / 100)} ${stop.position}%`
        ).join(', ')})`
  };

  return (
    <ToolLayout
      title="CSS Gradient Generator"
      description="Create beautiful CSS gradients with advanced controls and real-time preview"
      icon={<Palette className="h-8 w-8 text-purple-500" />}
    >
      <div className="space-y-6">
        {/* Gradient Type Toggle */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Gradient Type</CardTitle>
            <CardDescription>Choose between linear and radial gradients</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.type === 'radial'}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, type: checked ? 'radial' : 'linear' }))}
                />
                <Label className="font-medium">
                  {config.type === 'linear' ? 'Linear Gradient' : 'Radial Gradient'}
                </Label>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={() => loadPreset('sunset')} variant="outline" size="sm">
                  Sunset
                </Button>
                <Button onClick={() => loadPreset('ocean')} variant="outline" size="sm">
                  Ocean
                </Button>
                <Button onClick={() => loadPreset('forest')} variant="outline" size="sm">
                  Forest
                </Button>
                <Button onClick={() => loadPreset('fire')} variant="outline" size="sm">
                  Fire
                </Button>
                <Button onClick={resetGradient} variant="outline" size="sm">
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="space-y-6">
            {/* Direction/Position Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {config.type === 'linear' ? 'Direction' : 'Position & Size'}
                </CardTitle>
                <CardDescription>
                  {config.type === 'linear' 
                    ? 'Set the angle of the linear gradient' 
                    : 'Set the center point and radius of the radial gradient'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {config.type === 'linear' ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Angle</Label>
                      <span className="text-sm text-muted-foreground">{config.angle}°</span>
                    </div>
                    <Slider
                      value={[config.angle]}
                      onValueChange={(value) => setConfig(prev => ({ ...prev, angle: value[0] }))}
                      min={0}
                      max={360}
                      step={1}
                      className="w-full"
                    />
                    
                    {/* Visual angle picker */}
                    <div className="relative w-24 h-24 mx-auto mt-4">
                      <div className="absolute inset-0 rounded-full border-2 border-muted"></div>
                      <div 
                        className="absolute top-1/2 left-1/2 w-10 h-0.5 bg-primary origin-left transform -translate-y-0.5"
                        style={{ transform: `translate(-50%, -50%) rotate(${config.angle}deg) translateX(50%)` }}
                      ></div>
                      <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-primary rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Center X</Label>
                          <span className="text-sm text-muted-foreground">{config.centerX}%</span>
                        </div>
                        <Slider
                          value={[config.centerX]}
                          onValueChange={(value) => setConfig(prev => ({ ...prev, centerX: value[0] }))}
                          min={0}
                          max={100}
                          step={1}
                          className="w-full"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Center Y</Label>
                          <span className="text-sm text-muted-foreground">{config.centerY}%</span>
                        </div>
                        <Slider
                          value={[config.centerY]}
                          onValueChange={(value) => setConfig(prev => ({ ...prev, centerY: value[0] }))}
                          min={0}
                          max={100}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Radius</Label>
                        <span className="text-sm text-muted-foreground">{config.radius}%</span>
                      </div>
                      <Slider
                        value={[config.radius]}
                        onValueChange={(value) => setConfig(prev => ({ ...prev, radius: value[0] }))}
                        min={10}
                        max={150}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Color Stops */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Color Stops</CardTitle>
                    <CardDescription>Add and configure gradient color stops</CardDescription>
                  </div>
                  <Button onClick={addColorStop} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Stop
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {config.colorStops.map((stop, index) => (
                  <div key={stop.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Color Stop {index + 1}</span>
                      {config.colorStops.length > 2 && (
                        <Button
                          onClick={() => removeColorStop(stop.id)}
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Color</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="color"
                            value={stop.color}
                            onChange={(e) => {
                              updateColorStop(stop.id, 'color', e.target.value);
                              addToRecentColors(e.target.value);
                            }}
                            className="w-12 h-10 p-1 border rounded"
                          />
                          <Input
                            value={stop.color}
                            onChange={(e) => updateColorStop(stop.id, 'color', e.target.value)}
                            className="flex-1 font-mono text-sm"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Position ({stop.position}%)</Label>
                        <Slider
                          value={[stop.position]}
                          onValueChange={(value) => updateColorStop(stop.id, 'position', value[0])}
                          min={0}
                          max={100}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Opacity ({stop.opacity}%)</Label>
                      <Slider
                        value={[stop.opacity]}
                        onValueChange={(value) => updateColorStop(stop.id, 'opacity', value[0])}
                        min={0}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Colors */}
            {recentColors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Colors</CardTitle>
                  <CardDescription>Click to use in your gradient</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {recentColors.map((color, index) => (
                      <button
                        key={index}
                        className="w-8 h-8 rounded border-2 border-muted hover:border-primary transition-colors"
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          if (config.colorStops.length > 0) {
                            updateColorStop(config.colorStops[0].id, 'color', color);
                          }
                        }}
                        title={color}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Preview and Output */}
          <div className="space-y-6">
            {/* Live Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Live Preview</CardTitle>
                <CardDescription>Real-time gradient preview</CardDescription>
              </CardHeader>
              <CardContent>
                <div 
                  className="w-full h-64 rounded-lg border shadow-inner"
                  style={gradientStyle}
                />
              </CardContent>
            </Card>

            {/* CSS Output */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Generated CSS</CardTitle>
                    <CardDescription>Cross-browser compatible CSS code</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={copyCSS} size="sm" variant="outline">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button onClick={downloadCSS} size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-md overflow-auto text-sm font-mono whitespace-pre-wrap">
                  {cssOutput}
                </pre>
              </CardContent>
            </Card>

            {/* Keyboard Shortcuts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Keyboard Shortcuts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Copy CSS</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl + C</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Add Color Stop</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl + +</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Toggle Gradient Type</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl + T</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Reset Gradient</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl + R</kbd>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}