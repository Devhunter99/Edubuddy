
"use client";

import { useState, useEffect, useCallback } from "react";
import { generateHighlights, type GenerateHighlightsOutput } from "@/ai/flows/generate-highlights";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Lightbulb } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import { Skeleton } from "../ui/skeleton";

interface HighlightsBannerProps {
    allNotesText: string;
}

export default function HighlightsBanner({ allNotesText }: HighlightsBannerProps) {
    const { toast } = useToast();
    const [highlights, setHighlights] = useState<GenerateHighlightsOutput['highlights']>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchHighlights = useCallback(async () => {
        if (!allNotesText.trim()) {
            return;
        }
        setIsLoading(true);
        try {
            const result = await generateHighlights({ text: allNotesText });
            setHighlights(result.highlights);
        } catch (error) {
            console.error("Failed to generate highlights:", error);
            toast({
                title: "Error generating highlights",
                description: "Something went wrong. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    }, [allNotesText, toast]);

    useEffect(() => {
        fetchHighlights();
    }, [fetchHighlights]);

    if (isLoading) {
        return <Skeleton className="h-28 w-full" />;
    }

    if (highlights.length === 0) {
        return (
            <Card className="p-6 text-center text-muted-foreground">
                <Lightbulb className="mx-auto h-8 w-8 mb-2" />
                <p>Add some notes to see key highlights here!</p>
            </Card>
        );
    }
    
    return (
        <Card className="p-6 bg-primary/10 border-primary/20">
            <Carousel
                opts={{
                    loop: true,
                    align: "start"
                }}
                plugins={[
                  Autoplay({
                    delay: 5000,
                  }),
                ]}
                className="w-full"
            >
                <CarouselContent>
                    {highlights.map((highlight, index) => (
                        <CarouselItem key={index} className="flex items-start gap-4">
                             <Lightbulb className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                            <p className="text-lg font-medium text-foreground-primary flex-grow break-words">
                                {highlight}
                            </p>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </Card>
    );
}
