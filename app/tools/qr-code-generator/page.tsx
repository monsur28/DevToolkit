'use client';

import { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Download, QrCode as QrIcon, Palette, Settings } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';

export default function QrCodeGenerator() {
    const [value, setValue] = useState('https://example.com');
    const [size, setSize] = useState(256);
    const [fgColor, setFgColor] = useState('#000000');
    const [bgColor, setBgColor] = useState('#ffffff');
    const [level, setLevel] = useState('L');
    const canvasRef = useRef<HTMLDivElement>(null);

    const downloadQrCode = (format: 'png' | 'svg') => {
        const canvas = canvasRef.current?.querySelector('canvas');
        if (canvas) {
            if (format === 'png') {
                const url = canvas.toDataURL('image/png');
                const a = document.createElement('a');
                a.href = url;
                a.download = 'qrcode.png';
                a.click();
                toast.success('QR Code downloaded as PNG');
            }
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-6xl mx-auto"
            >
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-primary/10 rounded-xl relative">
                            <QrIcon className="w-10 h-10 text-primary" />
                            <div className="absolute inset-0 bg-primary/20 rounded-xl animate-pulse" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                        QR Code Generator
                    </h1>
                    <p className="text-muted-foreground">
                        Generate customized QR codes instantly.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 items-start">
                    {/* Controls Panel */}
                    <Card className="p-6 space-y-8 bg-card border-border/50">
                        <div className="space-y-4">
                            <Label>Content / URL</Label>
                            <Input
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                placeholder="Enter text or URL"
                                className="font-mono"
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label>Colors</Label>
                                <Palette className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Foreground</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="color"
                                            value={fgColor}
                                            onChange={(e) => setFgColor(e.target.value)}
                                            className="w-12 h-9 p-1"
                                        />
                                        <Input
                                            value={fgColor}
                                            onChange={(e) => setFgColor(e.target.value)}
                                            className="uppercase"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Background</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="color"
                                            value={bgColor}
                                            onChange={(e) => setBgColor(e.target.value)}
                                            className="w-12 h-9 p-1"
                                        />
                                        <Input
                                            value={bgColor}
                                            onChange={(e) => setBgColor(e.target.value)}
                                            className="uppercase"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label>Size ({size}px)</Label>
                                <Settings className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <Slider
                                value={[size]}
                                onValueChange={(val) => setSize(val[0])}
                                min={128}
                                max={512}
                                step={16}
                            />
                        </div>
                    </Card>

                    {/* Preview Panel */}
                    <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-border/50 bg-muted/30 min-h-[400px]">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            key={`${value}-${fgColor}-${bgColor}-${size}`} // Re-animate on change
                            ref={canvasRef}
                            className="bg-white p-4 rounded-xl shadow-xl"
                        >
                            <QRCodeCanvas
                                value={value}
                                size={size}
                                fgColor={fgColor}
                                bgColor={bgColor}
                                level={level as 'L' | 'M' | 'Q' | 'H'}
                                includeMargin={true}
                            />
                        </motion.div>

                        <div className="mt-8 flex gap-4">
                            <Button onClick={() => downloadQrCode('png')} className="gap-2">
                                <Download className="w-4 h-4" />
                                Download PNG
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
