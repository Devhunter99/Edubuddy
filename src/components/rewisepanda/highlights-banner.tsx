
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { generateHighlights, type GenerateHighlightsOutput } from "@/ai/flows/generate-highlights";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Lightbulb, Quote } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import { Skeleton } from "../ui/skeleton";

interface HighlightsBannerProps {
    allNotesText: string;
}

const lifeQuotes = [
    "The only way to do great work is to love what you do. - Steve Jobs",
    "Believe you can and you're halfway there. - Theodore Roosevelt",
    "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
    "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
    "It does not matter how slowly you go as long as you do not stop. - Confucius",
    "The secret of getting ahead is getting started. - Mark Twain",
    "Your time is limited, don’t waste it living someone else’s life. - Steve Jobs",
    "The journey of a thousand miles begins with a single step. - Lao Tzu",
    "Strive not to be a success, but rather to be of value. - Albert Einstein",
    "I have not failed. I've just found 10,000 ways that won't work. - Thomas A. Edison",
];

export default function HighlightsBanner({ allNotesText }: HighlightsBannerProps) {
    const { toast } = useToast();
    const [mixedContent, setMixedContent] = useState<(string | { quote: string })[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchHighlights = useCallback(async () => {
        if (!allNotesText.trim()) {
            return;
        }
        setIsLoading(true);
        try {
            const result = await generateHighlights({ text: allNotesText });
            
            // Mix highlights with quotes
            const newMixedContent: (string | { quote: string })[] = [];
            let quoteIndex = 0;
            for (let i = 0; i < result.highlights.length; i++) {
                newMixedContent.push(result.highlights[i]);
                if ((i + 1) % 3 === 0) {
                    newMixedContent.push({ quote: lifeQuotes[quoteIndex % lifeQuotes.length] });
                    quoteIndex++;
                }
            }
            setMixedContent(newMixedContent);

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

    if (mixedContent.length === 0) {
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
                    {mixedContent.map((item, index) => (
                        <CarouselItem key={index} className="flex items-start gap-4">
                            {typeof item === 'string' ? (
                                <Lightbulb className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                            ) : (
                                <Quote className="h-6 w-6 text-primary/80 mt-1 flex-shrink-0" />
                            )}
                            <p className="text-lg font-medium text-foreground-primary flex-grow break-words">
                                {typeof item === 'string' ? item : item.quote}
                            </p>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </Card>
    );
}
