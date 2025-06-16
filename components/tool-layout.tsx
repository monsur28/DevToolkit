import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ToolLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
  icon?: ReactNode;
}

export function ToolLayout({ title, description, children, icon }: ToolLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted pt-24">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              {icon && <div className="mr-4">{icon}</div>}
              <h1 className="text-4xl font-bold">{title}</h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {description}
            </p>
          </div>

          <Card className="shadow-lg">
            <CardContent className="p-8">
              {children}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}