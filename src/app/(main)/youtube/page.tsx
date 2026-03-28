
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { YoutubeLogo } from '@/components/shared/youtube-logo';
import { searchYoutubeVideos, type SearchYoutubeVideosOutput } from '@/ai/flows/search-youtube-videos';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search } from 'lucide-react';
import Image from 'next/image';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';

const formSchema = z.object({
  query: z.string().min(2, { message: "Vui lòng nhập ít nhất 2 ký tự." }),
});

type Video = SearchYoutubeVideosOutput['videos'][0];

export default function YoutubePage() {
  const [searchResults, setSearchResults] = useState<Video[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { query: '' },
  });

  const handleSearch = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setSearchResults([]);
    setSelectedVideoId(null);
    try {
      const result = await searchYoutubeVideos({ query: values.query });
      setSearchResults(result.videos);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Lỗi tìm kiếm',
        description: 'Không thể tìm kiếm video. Vui lòng thử lại.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getYouTubeEmbedUrl = (videoId: string) => {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  };

  return (
    <div className="flex-1 flex flex-col p-4 space-y-6 max-w-7xl mx-auto w-full">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <YoutubeLogo className="w-7 h-7 text-red-500" />
            <span>Tìm kiếm trên YouTube</span>
          </CardTitle>
          <CardDescription>
            Nhập từ khóa để tìm kiếm video trên YouTube.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSearch)} className="flex w-full items-center space-x-2">
              <FormField
                control={form.control}
                name="query"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          placeholder="Nhập tên bài hát, nghệ sĩ, hoặc từ khóa..."
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Tìm kiếm
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      )}

      {selectedVideoId && (
        <Card className="w-full aspect-video">
          <iframe
            width="100%"
            height="100%"
            src={getYouTubeEmbedUrl(selectedVideoId)}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="rounded-xl"
          ></iframe>
        </Card>
      )}

      {searchResults.length > 0 && (
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {searchResults.map((video) => (
                <Card key={video.videoId} className="overflow-hidden flex flex-col group">
                    <CardContent className="p-0">
                        <button className="relative w-full aspect-video block" onClick={() => setSelectedVideoId(video.videoId)}>
                           <Image
                             src={video.thumbnailUrl}
                             alt={video.title}
                             fill
                             className="object-cover transition-transform duration-300 group-hover:scale-110"
                             sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                           />
                           <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <YoutubeLogo className="w-12 h-12 text-white" />
                           </div>
                        </button>
                    </CardContent>
                    <CardHeader className="flex-1">
                        <CardTitle className="text-base line-clamp-2">{video.title}</CardTitle>
                        <CardDescription className="text-xs line-clamp-3">{video.description}</CardDescription>
                    </CardHeader>
                </Card>
            ))}
         </div>
      )}
    </div>
  );
}
