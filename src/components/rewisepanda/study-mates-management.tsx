
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, UserPlus, Users, Trash2 } from "lucide-react";
import {
  findUserByEmail,
  sendFriendRequest,
  getStudyMates,
  acceptFriendRequest,
  removeFriend,
  type StudyMate,
} from "@/services/user-service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function StudyMatesManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMates, setIsFetchingMates] = useState(true);
  const [mates, setMates] = useState<StudyMate[]>([]);

  const fetchMates = useCallback(async () => {
    if (!user) return;
    setIsFetchingMates(true);
    try {
      const userMates = await getStudyMates(user.uid);
      setMates(userMates);
    } catch (error) {
      console.error("Error fetching study mates:", error);
      toast({ title: "Error", description: "Could not fetch your study mates.", variant: "destructive" });
    } finally {
      setIsFetchingMates(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchMates();
  }, [fetchMates]);

  const handleAddMate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    if (email === user.email) {
      toast({ title: "Error", description: "You cannot add yourself as a study mate.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const targetUser = await findUserByEmail(email);
      if (!targetUser) {
        toast({ title: "Not Found", description: "No user found with that email address.", variant: "destructive" });
        return;
      }

      await sendFriendRequest(user.uid, targetUser.uid);
      toast({ title: "Success", description: "Study mate request sent!" });
      setEmail("");
    } catch (error: any) {
      console.error("Error sending friend request:", error);
      toast({ title: "Error", description: error.message || "Could not send request.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAcceptRequest = async (requesterId: string) => {
    if (!user) return;
    try {
        await acceptFriendRequest(requesterId, user.uid);
        toast({ title: "Success", description: "Study mate added!" });
        fetchMates(); // Refresh the list
    } catch (error: any) {
        console.error("Error accepting request:", error);
        toast({ title: "Error", description: error.message || "Could not accept request.", variant: "destructive" });
    }
  }

  const handleRemoveFriend = async (friendId: string) => {
    if (!user) return;
     try {
        await removeFriend(user.uid, friendId);
        toast({ title: "Success", description: "Study mate removed." });
        fetchMates(); // Refresh the list
    } catch (error: any) {
        console.error("Error removing mate:", error);
        toast({ title: "Error", description: error.message || "Could not remove study mate.", variant: "destructive" });
    }
  }

  const pendingRequests = mates.filter(m => m.status === 'pending' && m.requesterId !== user?.uid);
  const currentMates = mates.filter(m => m.status === 'accepted');

  return (
    <div className="max-w-4xl mx-auto space-y-8 pt-6">
        <Card>
            <CardHeader>
            <CardTitle className="flex items-center gap-2"><UserPlus /> Add a Study Mate</CardTitle>
            <CardDescription>
                Enter the email address of the user you want to add as a study mate.
            </CardDescription>
            </CardHeader>
            <CardContent>
            <form onSubmit={handleAddMate} className="flex items-end gap-2">
                <div className="flex-grow">
                <Label htmlFor="email" className="sr-only">Email</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="friend@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                />
                </div>
                <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Request
                </Button>
            </form>
            </CardContent>
        </Card>

        {isFetchingMates && <Loader2 className="mx-auto h-8 w-8 animate-spin" />}

        {!isFetchingMates && pendingRequests.length > 0 && (
            <Card>
                <CardHeader>
                    <CardTitle>Pending Requests</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {pendingRequests.map(req => (
                        <div key={req.uid} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={req.photoURL ?? undefined} alt={req.displayName} />
                                    <AvatarFallback>{req.displayName?.[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{req.displayName}</p>
                                    <p className="text-sm text-muted-foreground">{req.email}</p>
                                </div>
                            </div>
                            <Button size="sm" onClick={() => handleAcceptRequest(req.uid)}>Accept</Button>
                        </div>
                    ))}
                </CardContent>
            </Card>
        )}

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users /> Your Study Mates</CardTitle>
            </CardHeader>
            <CardContent>
                {!isFetchingMates && currentMates.length > 0 ? (
                    <div className="space-y-4">
                        {currentMates.map(mate => (
                            <div key={mate.uid} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <Link href={`/profile/${mate.uid}`} className="flex items-center gap-3 flex-grow">
                                    <Avatar>
                                        <AvatarImage src={mate.photoURL ?? undefined} alt={mate.displayName} />
                                        <AvatarFallback>{mate.displayName?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">{mate.displayName}</p>
                                        <p className="text-sm text-muted-foreground">{mate.email}</p>
                                    </div>
                                </Link>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive/70 hover:text-destructive" /></Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Remove {mate.displayName}?</AlertDialogTitle>
                                            <AlertDialogDescription>Are you sure you want to remove this study mate?</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleRemoveFriend(mate.uid)}>Remove</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground text-center py-8">
                        {isFetchingMates ? "Loading..." : "You haven't added any study mates yet."}
                    </p>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
