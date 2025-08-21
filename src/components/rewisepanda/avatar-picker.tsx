
"use client";

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import FramedAvatar from './framed-avatar';

const preMadeAvatars = [
  'https://placehold.co/128x128/6B8E23/F5F5DC.png?text=A',
  'https://placehold.co/128x128/4682B4/F5F5DC.png?text=B',
  'https://placehold.co/128x128/FF6347/F5F5DC.png?text=C',
  'https://placehold.co/128x128/32CD32/F5F5DC.png?text=D',
  'https://placehold.co/128x128/FFD700/F5F5DC.png?text=E',
  'https://placehold.co/128x128/9370DB/F5F5DC.png?text=F',
];

export default function AvatarPicker() {
  const { user, updateUserPhotoURL } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(user?.photoURL || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.photoURL) {
      setSelectedAvatar(user.photoURL);
    }
  }, [user]);

  const handleUpdateAvatar = async (url: string) => {
    if (!user) return;
    setIsLoading(true);
    try {
      await updateUserPhotoURL(url);
      toast({ title: 'Success', description: 'Profile picture updated!' });
    } catch (error: any) {
      console.error('Failed to update profile picture', error);
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      setSelectedAvatar(user?.photoURL || '');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarSelect = (url: string) => {
    setSelectedAvatar(url);
    handleUpdateAvatar(url);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
        toast({ title: 'Invalid File', description: 'Please upload an image file.', variant: 'destructive'});
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setSelectedAvatar(dataUrl);
        handleUpdateAvatar(dataUrl);
    };
    reader.readAsDataURL(file);
  }
  
  if (!user) {
    return (
        <Card>
            <CardHeader>
                 <CardTitle>Profile Picture</CardTitle>
            </CardHeader>
            <CardContent>
                 <p className="text-muted-foreground">Please log in to change your profile picture.</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Picture</CardTitle>
        <CardDescription>
          Choose a pre-made avatar or upload your own image.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
            disabled={isLoading}
        />
        <div className="flex items-center gap-6">
          <FramedAvatar 
            profile={user} 
            className="h-20 w-20"
            fallbackClassName='text-2xl'
          />
          <Button onClick={handleUploadClick} disabled={isLoading} variant="outline">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
             {isLoading ? 'Saving...' : 'Upload Image'}
          </Button>
        </div>

        <div>
          <h4 className="font-medium mb-4">Or choose an avatar</h4>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
            {preMadeAvatars.map((url) => (
              <button
                key={url}
                onClick={() => handleAvatarSelect(url)}
                className={`rounded-full overflow-hidden border-2 transition-all ${selectedAvatar === url ? 'border-primary ring-2 ring-primary' : 'border-transparent hover:border-primary/50'}`}
                disabled={isLoading}
              >
                <Avatar className="h-16 w-16">
                    <AvatarImage src={url} alt="Avatar option" />
                    <AvatarFallback><ImageIcon /></AvatarFallback>
                </Avatar>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
