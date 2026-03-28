"use client";

import { Copy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ResultDisplayProps {
  title: string;
  content: string;
  isCode?: boolean;
}

export function ResultDisplay({ title, content, isCode = false }: ResultDisplayProps) {
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    toast({
      title: 'Đã sao chép vào bộ nhớ tạm!',
      description: 'Nội dung đã được sao chép vào bộ nhớ tạm của bạn.',
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
        <Button variant="ghost" size="icon" onClick={handleCopy} aria-label="Sao chép nội dung">
          <Copy className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-auto max-h-[60vh] w-full rounded-md border bg-muted/50 p-4">
          {isCode ? (
            <pre className="font-code text-sm">
              <code>{content}</code>
            </pre>
          ) : (
            <p className="whitespace-pre-wrap text-sm">{content}</p>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
