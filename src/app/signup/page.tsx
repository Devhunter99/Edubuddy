
"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getAuth, createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { app } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Upload, Image as ImageIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";


const preMadeAvatars = [
  'https://placehold.co/128x128/6B8E23/F5F5DC.png?text=A',
  'https://placehold.co/128x128/4682B4/F5F5DC.png?text=B',
  'https://placehold.co/128x128/FF6347/F5F5DC.png?text=C',
  'https://placehold.co/128x128/32CD32/F5F5DC.png?text=D',
  'https://placehold.co/128x128/FFD700/F5F5DC.png?text=E',
  'https://placehold.co/128x128/9370DB/F5F5DC.png?text=F',
];

const formSchema = z.object({
  username: z.string().min(2, { message: "Username must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  studyLevel: z.enum(["school", "high-school", "undergraduate", "postgraduate", "phd-candidate", "professional"]),
  photoURL: z.string().optional(),
});

const auth = getAuth(app);

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { uploadAndSetProfilePicture } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(preMadeAvatars[0]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      studyLevel: "undergraduate",
      photoURL: preMadeAvatars[0],
    },
  });

  const handleAvatarSelect = (url: string) => {
    setSelectedAvatar(url);
    setUploadedFile(null); // Clear uploaded file if pre-made is selected
    form.setValue('photoURL', url);
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        toast({ title: 'Invalid File', description: 'Please upload an image file.', variant: 'destructive'});
        return;
    }

    setUploadedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setSelectedAvatar(dataUrl);
        form.setValue('photoURL', dataUrl);
    };
    reader.readAsDataURL(file);
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      
      let photoURL = values.photoURL;
      if (uploadedFile) {
        // If a file was uploaded, upload it now and get the URL
        await uploadAndSetProfilePicture(uploadedFile, userCredential.user);
        // The photoURL is now updated on the user object by the hook, so no need to pass it to updateProfile again
      }

      await updateProfile(userCredential.user, {
        displayName: values.username,
        // Only set photoURL here if it's a pre-made one and no file was uploaded
        ...(!uploadedFile && { photoURL }),
      });

      // Store studyLevel in localStorage
      localStorage.setItem(`user_study_level_${userCredential.user.uid}`, values.studyLevel);

      toast({ title: "Success", description: "Account created successfully." });
      router.push("/");
    } catch (error: any) {
      console.error("Signup failed:", error);
      toast({
        title: "Signup Failed",
        description: error.code === 'auth/configuration-not-found' 
            ? "Email sign-up is not enabled. Please use Google Sign-In or contact support."
            : error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        localStorage.setItem(`user_study_level_${result.user.uid}`, 'undergraduate');
        toast({ title: "Success", description: "Signed up successfully with Google." });
        router.push('/');
    } catch (error: any) {
        console.error("Google sign-in failed:", error);
        toast({
            title: "Google Sign-In Failed",
            description: error.message || "Could not sign in with Google.",
            variant: "destructive",
        });
    } finally {
        setIsLoading(false);
    }
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create an Account</CardTitle>
          <CardDescription>
            Join EduBuddy and start your AI-powered learning journey.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="studyLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Study Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your study level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="school">School</SelectItem>
                        <SelectItem value="high-school">High School</SelectItem>
                        <SelectItem value="undergraduate">Undergraduate</SelectItem>
                        <SelectItem value="postgraduate">Postgraduate</SelectItem>
                        <SelectItem value="phd-candidate">PhD Candidate</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Avatar Picker */}
              <div className="space-y-4">
                <Label>Profile Picture</Label>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                />
                 <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedAvatar} alt="Selected profile picture" />
                    <AvatarFallback>
                        <ImageIcon />
                    </AvatarFallback>
                  </Avatar>
                  <Button type="button" onClick={handleUploadClick} disabled={isLoading} variant="outline">
                    <Upload className="mr-2 h-4 w-4" /> Upload Image
                  </Button>
                </div>
                 <div className="grid grid-cols-6 gap-2">
                    {preMadeAvatars.map((url) => (
                    <button
                        type="button"
                        key={url}
                        onClick={() => handleAvatarSelect(url)}
                        className={`rounded-full overflow-hidden border-2 transition-all ${selectedAvatar === url ? 'border-primary ring-2 ring-primary' : 'border-transparent hover:border-primary/50'}`}
                        disabled={isLoading}
                    >
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={url} alt="Avatar option" />
                            <AvatarFallback><ImageIcon /></AvatarFallback>
                        </Avatar>
                    </button>
                    ))}
                </div>
              </div>


              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
            </form>
          </Form>

           <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          
          <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
             {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> :
            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 173.4 54.7l-73.3 67.4C309.6 95.5 280.2 83 248 83c-84.3 0-152.3 67.8-152.3 151.3s68 151.3 152.3 151.3c92.2 0 128.2-59.5 132.8-93.5H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path></svg>
            }
            Sign up with Google
          </Button>

          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
