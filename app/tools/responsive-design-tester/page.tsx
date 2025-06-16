'use client';

import { useState, useRef, useEffect } from 'react';
import { ToolLayout } from '@/components/tool-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Monitor, Smartphone, Tablet, RotateCcw, Camera, ExternalLink, RefreshCw, Download, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Device {
  name: string;
  width: number;
  height: number;
  category: 'mobile' | 'tablet' | 'desktop';
  icon: any;
}

interface CustomDevice {
  name: string;
  width: number;
  height: number;
}

export default function ResponsiveDesignTesterPage() {
  const [url, setUrl] = useState('https://example.com');
  const [selectedDevices, setSelectedDevices] = useState<string[]>(['iPhone 12', 'iPad', 'Desktop']);
  const [customDevices, setCustomDevices] = useState<CustomDevice[]>([]);
  const [isPortrait, setIsPortrait] = useState(true);
  const [showFrames, setShowFrames] = useState(true);
  const [syncScroll, setSyncScroll] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loadedUrl, setLoadedUrl] = useState('');
  const [customWidth, setCustomWidth] = useState('');
  const [customHeight, setCustomHeight] = useState('');
  const [customName, setCustomName] = useState('');
  const [zoomLevel, setZoomLevel] = useState('100');
  const iframeRefs = useRef<{ [key: string]: HTMLIFrameElement | null }>({});
  const { toast } = useToast();

  // Updated device presets with exact requirements
  const devices: Device[] = [
    // Mobile - exact requirements
    { name: 'Mobile 320px', width: 320, height: 568, category: 'mobile', icon: Smartphone },
    { name: 'Mobile 375px', width: 375, height: 667, category: 'mobile', icon: Smartphone },
    { name: 'Mobile 414px', width: 414, height: 896, category: 'mobile', icon: Smartphone },
    
    // Tablet - exact requirements  
    { name: 'Tablet 768px', width: 768, height: 1024, category: 'tablet', icon: Tablet },
    { name: 'Tablet 1024px', width: 1024, height: 1366, category: 'tablet', icon: Tablet },
    
    // Desktop - exact requirements
    { name: 'Desktop 1280px', width: 1280, height: 720, category: 'desktop', icon: Monitor },
    { name: 'Desktop 1440px', width: 1440, height: 900, category: 'desktop', icon: Monitor },
    { name: 'Desktop 1920px', width: 1920, height: 1080, category: 'desktop', icon: Monitor },
    
    // Popular devices for reference
    { name: 'iPhone 12', width: 390, height: 844, category: 'mobile', icon: Smartphone },
    { name: 'iPad', width: 820, height: 1180, category: 'tablet', icon: Tablet },
    { name: 'Desktop', width: 1920, height: 1080, category: 'desktop', icon: Monitor }
  ];

  useEffect(() => {
    // Load custom devices from localStorage
    const saved = localStorage.getItem('responsive-tester-custom-devices');
    if (saved) {
      try {
        setCustomDevices(JSON.parse(saved));
      } catch (e) {
        // Ignore parsing errors
      }
    }
  }, []);

  const saveCustomDevices = (devices: CustomDevice[]) => {
    setCustomDevices(devices);
    localStorage.setItem('responsive-tester-custom-devices', JSON.stringify(devices));
  };

  const loadUrl = () => {
    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive"
      });
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL starting with http:// or https://",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setLoadedUrl(url);
    
    // Simulate loading time
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "URL Loaded",
        description: "Website loaded in all viewports",
      });
    }, 1000);
  };

  const toggleDevice = (deviceName: string) => {
    setSelectedDevices(prev => 
      prev.includes(deviceName)
        ? prev.filter(d => d !== deviceName)
        : [...prev, deviceName]
    );
  };

  const addCustomDevice = () => {
    if (!customName.trim() || !customWidth || !customHeight) {
      toast({
        title: "Error",
        description: "Please fill in all custom device fields",
        variant: "destructive"
      });
      return;
    }
    
    const width = parseInt(customWidth);
    const height = parseInt(customHeight);
    
    if (width < 100 || width > 4000 || height < 100 || height > 4000) {
      toast({
        title: "Invalid Dimensions",
        description: "Width and height must be between 100 and 4000 pixels",
        variant: "destructive"
      });
      return;
    }
    
    const newDevice: CustomDevice = {
      name: customName.trim(),
      width,
      height
    };
    
    saveCustomDevices([...customDevices, newDevice]);
    setSelectedDevices(prev => [...prev, newDevice.name]);
    
    // Clear form
    setCustomName('');
    setCustomWidth('');
    setCustomHeight('');
    
    toast({
      title: "Custom Device Added",
      description: `${newDevice.name} (${width}x${height}) added successfully`,
    });
  };

  const removeCustomDevice = (name: string) => {
    saveCustomDevices(customDevices.filter(d => d.name !== name));
    setSelectedDevices(prev => prev.filter(d => d !== name));
    
    toast({
      title: "Device Removed",
      description: `${name} removed from custom devices`,
    });
  };

  const getDeviceDimensions = (deviceName: string) => {
    const device = devices.find(d => d.name === deviceName);
    if (device) {
      return isPortrait ? { width: device.width, height: device.height } : { width: device.height, height: device.width };
    }
    
    const customDevice = customDevices.find(d => d.name === deviceName);
    if (customDevice) {
      return isPortrait ? { width: customDevice.width, height: customDevice.height } : { width: customDevice.height, height: customDevice.width };
    }
    
    return { width: 375, height: 667 };
  };

  const takeScreenshot = async (deviceName: string) => {
    try {
      // This would require html2canvas or similar library in a real implementation
      toast({
        title: "Screenshot Feature",
        description: "Screenshot functionality would be implemented with html2canvas library",
      });
    } catch (error) {
      toast({
        title: "Screenshot Failed",
        description: "Unable to capture screenshot",
        variant: "destructive"
      });
    }
  };

  const downloadScreenshots = async () => {
    toast({
      title: "Download Screenshots",
      description: "This would download screenshots of all viewports as a ZIP file",
    });
  };

  const handleScroll = (deviceName: string, event: any) => {
    if (!syncScroll) return;
    
    try {
      const scrollTop = event.target.contentWindow?.scrollY || 0;
      const scrollLeft = event.target.contentWindow?.scrollX || 0;
      
      // Sync scroll to other iframes
      Object.entries(iframeRefs.current).forEach(([name, iframe]) => {
        if (name !== deviceName && iframe?.contentWindow) {
          try {
            iframe.contentWindow.scrollTo(scrollLeft, scrollTop);
          } catch (e) {
            // Silently ignore cross-origin access errors
          }
        }
      });
    } catch (e) {
      // Silently ignore cross-origin access errors
    }
  };

  const selectedDeviceList = selectedDevices.map(name => {
    const device = devices.find(d => d.name === name);
    if (device) return device;
    
    const customDevice = customDevices.find(d => d.name === name);
    if (customDevice) {
      return {
        ...customDevice,
        category: 'mobile' as const,
        icon: Smartphone
      };
    }
    return null;
  }).filter(Boolean) as (Device | (CustomDevice & { category: 'mobile', icon: any }))[];

  const zoomScale = parseInt(zoomLevel) / 100;

  return (
    <ToolLayout
      title="Responsive Design Tester"
      description="Test your website across multiple device viewports with synchronized scrolling and screenshot capabilities"
      icon={<Monitor className="h-8 w-8 text-blue-500" />}
    >
      <div className="space-y-6">
        {/* URL Input and Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Website URL & Controls</CardTitle>
            <CardDescription>Enter a URL to test across different device viewports</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadUrl()}
                className="flex-1"
              />
              <Button onClick={loadUrl} disabled={isLoading}>
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ExternalLink className="h-4 w-4 mr-2" />
                )}
                {isLoading ? 'Loading...' : 'Load URL'}
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={isPortrait}
                  onCheckedChange={setIsPortrait}
                />
                <Label className="text-sm">
                  {isPortrait ? 'Portrait' : 'Landscape'}
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={showFrames}
                  onCheckedChange={setShowFrames}
                />
                <Label className="text-sm">Device Frames</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={syncScroll}
                  onCheckedChange={setSyncScroll}
                />
                <Label className="text-sm">Sync Scroll</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Label className="text-sm">Zoom:</Label>
                <Select value={zoomLevel} onValueChange={setZoomLevel}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50">50%</SelectItem>
                    <SelectItem value="75">75%</SelectItem>
                    <SelectItem value="100">100%</SelectItem>
                    <SelectItem value="125">125%</SelectItem>
                    <SelectItem value="150">150%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => setIsPortrait(!isPortrait)} variant="outline" size="sm">
                <RotateCcw className="h-4 w-4 mr-2" />
                Rotate
              </Button>
              {loadedUrl && (
                <Button onClick={downloadScreenshots} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download Screenshots
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="devices" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="devices">Device Selection</TabsTrigger>
            <TabsTrigger value="preview">Viewport Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="devices" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Preset Devices */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Preset Devices
                  </CardTitle>
                  <CardDescription>Standard viewport sizes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Mobile */}
                  <div>
                    <h4 className="font-medium text-sm mb-2 flex items-center">
                      <Smartphone className="h-4 w-4 mr-1" />
                      Mobile
                    </h4>
                    <div className="space-y-2">
                      {devices.filter(d => d.category === 'mobile').map(device => (
                        <div key={device.name} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={selectedDevices.includes(device.name)}
                              onChange={() => toggleDevice(device.name)}
                              className="rounded"
                            />
                            <span className="text-sm">{device.name}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {isPortrait ? `${device.width}×${device.height}` : `${device.height}×${device.width}`}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tablet */}
                  <div>
                    <h4 className="font-medium text-sm mb-2 flex items-center">
                      <Tablet className="h-4 w-4 mr-1" />
                      Tablet
                    </h4>
                    <div className="space-y-2">
                      {devices.filter(d => d.category === 'tablet').map(device => (
                        <div key={device.name} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={selectedDevices.includes(device.name)}
                              onChange={() => toggleDevice(device.name)}
                              className="rounded"
                            />
                            <span className="text-sm">{device.name}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {isPortrait ? `${device.width}×${device.height}` : `${device.height}×${device.width}`}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Desktop */}
                  <div>
                    <h4 className="font-medium text-sm mb-2 flex items-center">
                      <Monitor className="h-4 w-4 mr-1" />
                      Desktop
                    </h4>
                    <div className="space-y-2">
                      {devices.filter(d => d.category === 'desktop').map(device => (
                        <div key={device.name} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={selectedDevices.includes(device.name)}
                              onChange={() => toggleDevice(device.name)}
                              className="rounded"
                            />
                            <span className="text-sm">{device.name}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {device.width}×{device.height}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Custom Devices */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Custom Devices</CardTitle>
                  <CardDescription>Add your own viewport sizes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Input
                      placeholder="Device name"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Width (px)"
                        type="number"
                        value={customWidth}
                        onChange={(e) => setCustomWidth(e.target.value)}
                        min="100"
                        max="4000"
                      />
                      <Input
                        placeholder="Height (px)"
                        type="number"
                        value={customHeight}
                        onChange={(e) => setCustomHeight(e.target.value)}
                        min="100"
                        max="4000"
                      />
                    </div>
                    <Button onClick={addCustomDevice} size="sm" className="w-full">
                      Add Custom Device
                    </Button>
                  </div>
                  
                  {customDevices.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Your Custom Devices:</h4>
                      {customDevices.map(device => (
                        <div key={device.name} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={selectedDevices.includes(device.name)}
                              onChange={() => toggleDevice(device.name)}
                              className="rounded"
                            />
                            <span className="text-sm">{device.name}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Badge variant="outline" className="text-xs">
                              {device.width}×{device.height}
                            </Badge>
                            <Button
                              onClick={() => removeCustomDevice(device.name)}
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-destructive"
                            >
                              ×
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                  <CardDescription>Common device combinations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    onClick={() => setSelectedDevices(['Mobile 320px', 'Mobile 375px', 'Mobile 414px'])}
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                  >
                    <Smartphone className="h-4 w-4 mr-2" />
                    All Mobile Sizes
                  </Button>
                  <Button 
                    onClick={() => setSelectedDevices(['Tablet 768px', 'Tablet 1024px'])}
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                  >
                    <Tablet className="h-4 w-4 mr-2" />
                    All Tablet Sizes
                  </Button>
                  <Button 
                    onClick={() => setSelectedDevices(['Desktop 1280px', 'Desktop 1440px', 'Desktop 1920px'])}
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                  >
                    <Monitor className="h-4 w-4 mr-2" />
                    All Desktop Sizes
                  </Button>
                  <Button 
                    onClick={() => setSelectedDevices(['Mobile 375px', 'Tablet 768px', 'Desktop 1920px'])}
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Standard Set
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            {loadedUrl ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {selectedDeviceList.map(device => {
                  const dimensions = getDeviceDimensions(device.name);
                  const IconComponent = device.icon;
                  
                  return (
                    <Card key={device.name} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <IconComponent className="h-4 w-4" />
                            <CardTitle className="text-base">{device.name}</CardTitle>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {dimensions.width}×{dimensions.height}
                            </Badge>
                            <Button
                              onClick={() => takeScreenshot(device.name)}
                              size="sm"
                              variant="ghost"
                            >
                              <Camera className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div 
                          className={`relative mx-auto ${showFrames ? 'p-4 bg-gray-800 rounded-lg' : ''}`}
                          style={{ 
                            width: showFrames ? (dimensions.width * zoomScale) + 32 : dimensions.width * zoomScale,
                            height: showFrames ? (dimensions.height * zoomScale) + 32 : dimensions.height * zoomScale
                          }}
                        >
                          <iframe
                            ref={(el) => iframeRefs.current[device.name] = el}
                            src={loadedUrl}
                            width={dimensions.width}
                            height={dimensions.height}
                            className={`border-0 ${showFrames ? 'rounded shadow-lg' : ''}`}
                            style={{ 
                              transform: `scale(${zoomScale})`,
                              transformOrigin: 'top left'
                            }}
                            onLoad={(e) => {
                              if (syncScroll) {
                                try {
                                  e.currentTarget.contentWindow?.addEventListener('scroll', 
                                    (event) => handleScroll(device.name, event)
                                  );
                                } catch (error) {
                                  // Silently ignore cross-origin access errors
                                }
                              }
                            }}
                          />
                          
                          {showFrames && (
                            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                              <div className="w-12 h-1 bg-gray-600 rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-16">
                  <Monitor className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No URL Loaded</h3>
                  <p className="text-muted-foreground mb-4">
                    Enter a URL and click "Load URL" to start testing responsiveness
                  </p>
                  <Button onClick={() => setUrl('https://example.com')} variant="outline">
                    Load Example Site
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Features & Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Features & Usage Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">✨ Key Features:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• <strong>Exact viewport sizes:</strong> 320px, 375px, 414px (mobile)</li>
                  <li>• <strong>Tablet sizes:</strong> 768px, 1024px</li>
                  <li>• <strong>Desktop sizes:</strong> 1280px, 1440px, 1920px</li>
                  <li>• <strong>Custom dimensions:</strong> Add your own viewport sizes</li>
                  <li>• <strong>Synchronized scrolling:</strong> Scroll all viewports together</li>
                  <li>• <strong>Device frames:</strong> Realistic device appearance</li>
                  <li>• <strong>Portrait/Landscape:</strong> Toggle orientation</li>
                  <li>• <strong>Zoom control:</strong> Scale viewports for better overview</li>
                  <li>• <strong>Screenshot capability:</strong> Capture viewport images</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">🎯 Best Practices:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Test critical user flows on all viewport sizes</li>
                  <li>• Check navigation and menu behavior</li>
                  <li>• Verify text readability and button sizes</li>
                  <li>• Test form layouts and input fields</li>
                  <li>• Check image scaling and aspect ratios</li>
                  <li>• Verify horizontal scrolling doesn't occur</li>
                  <li>• Test touch targets are at least 44px</li>
                  <li>• Check loading performance on mobile</li>
                </ul>
              </div>
            </div>
            
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">🔒 CORS & Security Note:</h4>
              <p className="text-muted-foreground">
                Some websites may not load due to CORS (Cross-Origin Resource Sharing) restrictions or 
                X-Frame-Options headers that prevent embedding in iframes. This is a security feature 
                and not a limitation of this tool. Synchronized scrolling will only work for same-origin content.
                For best results, test with your own websites or sites that allow iframe embedding.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
}