"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lightbulb, Loader2 } from 'lucide-react';

import { generateMusicIdea, type GenerateMusicIdeaOutput } from '@/ai/flows/generate-music-idea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ResultDisplay } from '@/components/shared/result-display';

const formSchema = z.object({
  genre: z.string().min(2, { message: "Thể loại phải có ít nhất 2 ký tự." }),
  mood: z.string().min(2, { message: "Tâm trạng phải có ít nhất 2 ký tự." }),
  instruments: z.string().min(2, { message: "Nhạc cụ phải có ít nhất 2 ký tự." }),
});

export function MusicIdeaGenerator() {
  const [result, setResult] = useState<GenerateMusicIdeaOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      genre: '',
      mood: '',
      instruments: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const output = await generateMusicIdea(values);
      setResult(output);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Đã xảy ra lỗi',
        description: 'Không thể tạo ý tưởng âm nhạc. Vui lòng thử lại.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const resultText = result ? `Vòng hợp âm:\n${result.chordProgression}\n\nGiai điệu:\n${result.melody}\n\nNhịp điệu:\n${result.rhythm}\n\nGhi chú bổ sung:\n${result.additionalNotes}` : "";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-accent" />
            <span>Tạo ý tưởng âm nhạc</span>
          </CardTitle>
          <CardDescription>Tạo ra các ý tưởng âm nhạc dựa trên thông tin bạn nhập vào.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="genre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thể loại</FormLabel>
                    <FormControl>
                      <Input placeholder="VD: Lofi Hip Hop, Cinematic, Jazz" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mood"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tâm trạng</FormLabel>
                    <FormControl>
                      <Input placeholder="VD: Thư giãn, Hùng tráng, U sầu" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="instruments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nhạc cụ</FormLabel>
                    <FormControl>
                      <Input placeholder="VD: Piano, 808s, Violin" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="min-w-[140px]">
                {isLoading ? <Loader2 className="animate-spin" /> : 'Tạo ý tưởng'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {isLoading && (
        <Card className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </Card>
      )}

      {result && <ResultDisplay title="Ý tưởng âm nhạc được tạo" content={resultText} />}
    </div>
  );
}
