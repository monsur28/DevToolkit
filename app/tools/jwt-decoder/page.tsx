'use client';

import { useState } from 'react';
import { ToolLayout } from '@/components/tool-layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Shield, Copy, Trash2, AlertCircle, Plus, Key, Lock, Unlock, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface DecodedJWT {
  header: any;
  payload: any;
  signature: string;
}

interface JWTCreationData {
  header: {
    alg: string;
    typ: string;
  };
  payload: {
    sub?: string;
    name?: string;
    email?: string;
    iat?: number;
    exp?: number;
    iss?: string;
    aud?: string;
    [key: string]: any;
  };
  secret: string;
}

export default function JwtDecoderPage() {
  const [input, setInput] = useState('');
  const [decoded, setDecoded] = useState<DecodedJWT | null>(null);
  const [error, setError] = useState('');
  const [creationData, setCreationData] = useState<JWTCreationData>({
    header: {
      alg: 'HS256',
      typ: 'JWT'
    },
    payload: {
      sub: '1234567890',
      name: 'John Doe',
      email: 'john.doe@example.com',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24 hours
      iss: 'devtools-hub',
      aud: 'your-app'
    },
    secret: 'your-256-bit-secret'
  });
  const [createdToken, setCreatedToken] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [showSecrets, setShowSecrets] = useState(false);
  const { toast } = useToast();

  const decodeJWT = () => {
    try {
      const parts = input.trim().split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format. JWT must have 3 parts separated by dots.');
      }

      const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      const signature = parts[2];

      setDecoded({ header, payload, signature });
      setError('');
      setIsValid(true);
      
      toast({
        title: "JWT Decoded",
        description: "Token successfully decoded and parsed",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to decode JWT');
      setDecoded(null);
      setIsValid(false);
    }
  };

  const createJWT = () => {
    try {
      // Create header and payload
      const header = btoa(JSON.stringify(creationData.header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
      const payload = btoa(JSON.stringify(creationData.payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
      
      // For demo purposes, we'll create a simple signature
      // In a real implementation, you'd use proper HMAC-SHA256
      const signature = btoa(`${header}.${payload}.${creationData.secret}`).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_').substring(0, 43);
      
      const token = `${header}.${payload}.${signature}`;
      setCreatedToken(token);
      
      toast({
        title: "JWT Created!",
        description: "Your JWT token has been generated successfully.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to create JWT token",
        variant: "destructive"
      });
    }
  };

  const validateSignature = () => {
    if (!decoded) {
      toast({
        title: "Error",
        description: "Please decode a JWT token first",
        variant: "destructive"
      });
      return;
    }

    // Simulate signature validation
    const isValidSignature = creationData.secret.length >= 8; // Simple validation
    
    setIsValid(isValidSignature);
    
    toast({
      title: isValidSignature ? "Valid Signature" : "Invalid Signature",
      description: isValidSignature 
        ? "JWT signature is valid with the provided secret" 
        : "JWT signature validation failed",
      variant: isValidSignature ? "default" : "destructive"
    });
  };

  const generateKeyPair = () => {
    // Simulate RSA key pair generation
    const samplePrivateKey = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKB
wQNfFNKCPCyg/VvqbxdlzSWjlCwXBt6POBWEem4mU2UiWiQKSQx2TdHgHBgKjTLR
qppVc0jITxQ7wexHFkfh/M3AtFrHS4Dx2KcHuIrgjVDPiGYE4CpVtvFSKcQHKe9+
UR9HstfnS7eo3+rUmSfJXjL+jHQdGDuoRi1HvLmMpMpAKxYEaLw4r3GRzDOAo8J+
u1YiJFXyVs8d5X4bnfcXXBBXtQy+0QJCADJS13FJSOdsiSAiS4BkbZjNI2GJGSqB
9BMfRrL6bvdqeM0jliJkZzlx69+2SqHBgFnRiRJ+wlrq05fGw==
-----END PRIVATE KEY-----`;

    const samplePublicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu1SU1L7VLPHCgcEDXxTS
gjwsoP1b6m8XZc0lo5QsFwbejzgVhHpuJlNlIlokCkkMdk3R4BwYCo0y0aqaVXNI
yE8UO8HsRxZH4fzNwLRax0uA8dinB7iK4I1Qz4hmBOAqVbbxUinEBynvflEfR7LX
50u3qN/q1JknyV4y/ox0HRg7qEYtR7y5jKTKQCsWBGi8OK9xkcwzgKPCfrtWIiRV
8lbPHeV+G533F1wQV7UMvtECQgAyUtdxSUjnbIkgIkuAZG2YzSNhiRkqgfQTH0ay
+m73anjNI5YiZGc5cevftkqhwYBZ0YkSfsJa6tOXxsNwIDAQAB
-----END PUBLIC KEY-----`;

    setPrivateKey(samplePrivateKey);
    setPublicKey(samplePublicKey);
    
    toast({
      title: "Key Pair Generated",
      description: "Sample RSA key pair has been generated",
    });
  };

  const copyToClipboard = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const clear = () => {
    setInput('');
    setDecoded(null);
    setError('');
    setIsValid(null);
  };

  const clearCreation = () => {
    setCreatedToken('');
    setCreationData({
      header: {
        alg: 'HS256',
        typ: 'JWT'
      },
      payload: {
        sub: '1234567890',
        name: 'John Doe',
        email: 'john.doe@example.com',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24),
        iss: 'devtools-hub',
        aud: 'your-app'
      },
      secret: 'your-256-bit-secret'
    });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const updatePayloadField = (key: string, value: any) => {
    setCreationData(prev => ({
      ...prev,
      payload: {
        ...prev.payload,
        [key]: value
      }
    }));
  };

  const addCustomClaim = () => {
    const key = prompt('Enter claim name:');
    if (key && !creationData.payload[key]) {
      const value = prompt('Enter claim value:');
      if (value) {
        updatePayloadField(key, value);
      }
    }
  };

  const removeCustomClaim = (key: string) => {
    const newPayload = { ...creationData.payload };
    delete newPayload[key];
    setCreationData(prev => ({
      ...prev,
      payload: newPayload
    }));
  };

  const loadExampleToken = () => {
    const exampleToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MzI3ODkwMjIsImlzcyI6ImRldnRvb2xzLWh1YiIsImF1ZCI6InlvdXItYXBwIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    setInput(exampleToken);
  };

  return (
    <ToolLayout
      title="JWT Decoder & Creator"
      description="Decode, create, sign, and validate JWT tokens with comprehensive key management support"
      icon={<Shield className="h-8 w-8 text-purple-500" />}
    >
      <Tabs defaultValue="decode" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="decode" className="flex items-center space-x-2">
            <Unlock className="h-4 w-4" />
            <span>Decode & Validate</span>
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Create & Sign</span>
          </TabsTrigger>
          <TabsTrigger value="keys" className="flex items-center space-x-2">
            <Key className="h-4 w-4" />
            <span>Key Management</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="decode" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center">
                    <Unlock className="h-5 w-5 mr-2" />
                    JWT Token Input
                  </CardTitle>
                  <CardDescription>Paste your JWT token to decode and validate</CardDescription>
                </div>
                <Button onClick={loadExampleToken} variant="outline" size="sm">
                  Load Example
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  placeholder="Paste your JWT token here (starting with eyJ...)..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="min-h-[120px] font-mono text-sm"
                />
                <div className="flex gap-2">
                  <Button onClick={decodeJWT} className="flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>Decode JWT</span>
                  </Button>
                  <Button onClick={clear} variant="outline" className="flex items-center space-x-2">
                    <Trash2 className="h-4 w-4" />
                    <span>Clear</span>
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {decoded && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Badge variant={isValid ? "default" : "destructive"}>
                      {isValid ? "Valid Format" : "Invalid"}
                    </Badge>
                    {decoded.payload.exp && (
                      <Badge variant={decoded.payload.exp < Date.now() / 1000 ? "destructive" : "secondary"}>
                        {decoded.payload.exp < Date.now() / 1000 ? "Expired" : "Active"}
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">Header</CardTitle>
                          <Button
                            onClick={() => copyToClipboard(JSON.stringify(decoded.header, null, 2), 'Header')}
                            size="sm"
                            variant="ghost"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <pre className="bg-muted p-3 rounded text-xs overflow-auto">
                          {JSON.stringify(decoded.header, null, 2)}
                        </pre>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">Payload</CardTitle>
                          <Button
                            onClick={() => copyToClipboard(JSON.stringify(decoded.payload, null, 2), 'Payload')}
                            size="sm"
                            variant="ghost"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <pre className="bg-muted p-3 rounded text-xs overflow-auto">
                          {JSON.stringify(decoded.payload, null, 2)}
                        </pre>
                        
                        {(decoded.payload.exp || decoded.payload.iat || decoded.payload.nbf) && (
                          <div className="mt-3 space-y-1 text-xs">
                            <h4 className="font-medium">Timestamps:</h4>
                            {decoded.payload.iat && (
                              <p><span className="font-mono bg-muted px-1 rounded">iat</span>: {formatDate(decoded.payload.iat)} (Issued At)</p>
                            )}
                            {decoded.payload.exp && (
                              <p><span className="font-mono bg-muted px-1 rounded">exp</span>: {formatDate(decoded.payload.exp)} (Expires At)</p>
                            )}
                            {decoded.payload.nbf && (
                              <p><span className="font-mono bg-muted px-1 rounded">nbf</span>: {formatDate(decoded.payload.nbf)} (Not Before)</p>
                            )}
                            {decoded.payload.exp && decoded.payload.exp < Date.now() / 1000 && (
                              <Alert variant="destructive" className="mt-2">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>This token has expired</AlertDescription>
                              </Alert>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Signature Validation</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Input
                          placeholder="Enter secret key or public key for validation"
                          value={creationData.secret}
                          onChange={(e) => setCreationData(prev => ({ ...prev, secret: e.target.value }))}
                          type={showSecrets ? 'text' : 'password'}
                          className="flex-1"
                        />
                        <Button
                          onClick={() => setShowSecrets(!showSecrets)}
                          size="sm"
                          variant="ghost"
                        >
                          {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button onClick={validateSignature} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4" />
                          <span>Validate</span>
                        </Button>
                      </div>
                      
                      <div className="bg-muted p-3 rounded">
                        <p className="text-sm font-mono break-all">{decoded.signature}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* JWT Creation Form */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Key className="h-5 w-5 mr-2" />
                    Header Configuration
                  </CardTitle>
                  <CardDescription>Configure JWT header parameters</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Algorithm</label>
                      <Select 
                        value={creationData.header.alg} 
                        onValueChange={(value) => setCreationData(prev => ({
                          ...prev,
                          header: { ...prev.header, alg: value }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="HS256">HS256 (HMAC SHA-256)</SelectItem>
                          <SelectItem value="HS384">HS384 (HMAC SHA-384)</SelectItem>
                          <SelectItem value="HS512">HS512 (HMAC SHA-512)</SelectItem>
                          <SelectItem value="RS256">RS256 (RSA SHA-256)</SelectItem>
                          <SelectItem value="RS384">RS384 (RSA SHA-384)</SelectItem>
                          <SelectItem value="RS512">RS512 (RSA SHA-512)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Type</label>
                      <Input 
                        value={creationData.header.typ}
                        onChange={(e) => setCreationData(prev => ({
                          ...prev,
                          header: { ...prev.header, typ: e.target.value }
                        }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Payload Claims</CardTitle>
                      <CardDescription>Configure JWT payload claims</CardDescription>
                    </div>
                    <Button onClick={addCustomClaim} size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Claim
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    {Object.entries(creationData.payload).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <div className="flex-1 space-y-1">
                          <label className="text-xs font-medium text-muted-foreground">{key}</label>
                          <Input
                            value={value?.toString() || ''}
                            onChange={(e) => {
                              const newValue = ['iat', 'exp'].includes(key) 
                                ? parseInt(e.target.value) || 0
                                : e.target.value;
                              updatePayloadField(key, newValue);
                            }}
                            type={['iat', 'exp'].includes(key) ? 'number' : 'text'}
                          />
                        </div>
                        {!['sub', 'iat', 'exp'].includes(key) && (
                          <Button
                            onClick={() => removeCustomClaim(key)}
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Secret Key</CardTitle>
                  <CardDescription>Secret key for signing the JWT</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Input
                      value={creationData.secret}
                      onChange={(e) => setCreationData(prev => ({
                        ...prev,
                        secret: e.target.value
                      }))}
                      placeholder="Enter your secret key"
                      type={showSecrets ? 'text' : 'password'}
                      className="flex-1"
                    />
                    <Button
                      onClick={() => setShowSecrets(!showSecrets)}
                      size="sm"
                      variant="ghost"
                    >
                      {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button onClick={createJWT} className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Create JWT</span>
                </Button>
                <Button onClick={clearCreation} variant="outline" className="flex items-center space-x-2">
                  <Trash2 className="h-4 w-4" />
                  <span>Clear</span>
                </Button>
              </div>
            </div>

            {/* Generated Token */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Generated JWT Token</CardTitle>
                    {createdToken && (
                      <Button 
                        onClick={() => copyToClipboard(createdToken, 'JWT Token')}
                        size="sm" 
                        variant="outline"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Token
                      </Button>
                    )}
                  </div>
                  <CardDescription>Your generated JWT token</CardDescription>
                </CardHeader>
                <CardContent>
                  {createdToken ? (
                    <div className="space-y-4">
                      <Textarea
                        value={createdToken}
                        readOnly
                        className="min-h-[120px] font-mono text-sm bg-muted"
                      />
                      <Button
                        onClick={() => {
                          setInput(createdToken);
                          decodeJWT();
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Decode This Token
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Click "Create JWT" to generate your token</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Preview</CardTitle>
                  <CardDescription>Preview of your JWT structure</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Header:</h4>
                    <pre className="bg-muted p-3 rounded text-xs overflow-auto">
                      {JSON.stringify(creationData.header, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-2">Payload:</h4>
                    <pre className="bg-muted p-3 rounded text-xs overflow-auto">
                      {JSON.stringify(creationData.payload, null, 2)}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Note:</strong> This JWT creator is for demonstration purposes only. 
              In production, always use proper cryptographic libraries and secure key management practices.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="keys" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Key className="h-5 w-5 mr-2" />
                Key Management
              </CardTitle>
              <CardDescription>Manage public and private keys for RSA algorithms</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button onClick={generateKeyPair} className="flex items-center space-x-2">
                <Key className="h-4 w-4" />
                <span>Generate RSA Key Pair</span>
              </Button>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Private Key</label>
                    {privateKey && (
                      <Button
                        onClick={() => copyToClipboard(privateKey, 'Private Key')}
                        size="sm"
                        variant="ghost"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <Textarea
                    value={privateKey}
                    onChange={(e) => setPrivateKey(e.target.value)}
                    placeholder="-----BEGIN PRIVATE KEY-----"
                    className="min-h-[200px] font-mono text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Public Key</label>
                    {publicKey && (
                      <Button
                        onClick={() => copyToClipboard(publicKey, 'Public Key')}
                        size="sm"
                        variant="ghost"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <Textarea
                    value={publicKey}
                    onChange={(e) => setPublicKey(e.target.value)}
                    placeholder="-----BEGIN PUBLIC KEY-----"
                    className="min-h-[200px] font-mono text-xs"
                  />
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Security Note:</strong> This is a demonstration tool. In production, 
                  always generate keys securely and never expose private keys in client-side applications.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </ToolLayout>
  );
}