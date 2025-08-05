
import AppHeader from "@/components/edubuddy/app-header";
import MusicPlayer from "@/components/edubuddy/music-player";
import { SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Music } from "lucide-react";

const tracks = [
    { title: "Peaceful Mind", artist: "Ambient Dreams", src: "/music/sample-1.mp3", image: "https://placehold.co/400x400/A7C7E7/FFFFFF.png", aiHint: "peaceful ambient" },
    { title: "Focus Flow", artist: "Chill Beats", src: "/music/sample-2.mp3", image: "https://placehold.co/400x400/C1E1C1/FFFFFF.png", aiHint: "lofi beats" },
    { title: "Starlight Study", artist: "Cosmic Waves", src: "/music/sample-3.mp3", image: "https://placehold.co/400x400/BDB2FF/FFFFFF.png", aiHint: "cosmic space" },
];

export default function StudyMusicPage() {
  return (
    <SidebarInset>
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-grow container mx-auto p-4 md:p-8 flex items-center justify-center">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center">
                     <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                        <Music className="h-10 w-10 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Study Music</CardTitle>
                    <CardDescription>Select a track to help you focus.</CardDescription>
                </CardHeader>
                <CardContent>
                    <MusicPlayer tracks={tracks} />
                </CardContent>
            </Card>
        </main>
      </div>
    </SidebarInset>
  );
}
