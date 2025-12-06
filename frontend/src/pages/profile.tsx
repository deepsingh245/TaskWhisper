import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateProfile, checkAuth } from "@/store/thunks/authThunks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, RefreshCw, Save, User as UserIcon, Mail } from "lucide-react";
import { successToast, dangerToast } from "@/shared/toast";

const Profile = () => {
    const dispatch = useAppDispatch();
    const { user, isLoading } = useAppSelector((state) => state.auth);
    const [name, setName] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.user_metadata?.full_name || user.name || "");
            const initialAvatar = user.user_metadata?.avatar_url || user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`;
            setAvatarUrl(initialAvatar);
        } else {
            dispatch(checkAuth());
        }
    }, [user]);

    const handleGenerateAvatar = () => {
        const randomSeed = Math.random().toString(36).substring(7);
        setAvatarUrl(`https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}`);
    };

    const handleSave = async () => {
        if (!name.trim()) {
            dangerToast("Name cannot be empty");
            return;
        }

        setIsSaving(true);
        try {
            const resultAction = await dispatch(updateProfile({ name, avatarUrl }));
            if (updateProfile.fulfilled.match(resultAction)) {
                successToast("Profile updated successfully");
            } else {
                dangerToast(resultAction.payload as string || "Failed to update profile");
            }
        } catch (error) {
            dangerToast("An unexpected error occurred");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex-1 p-8 pt-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    Profile Settings
                </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 lg:col-span-3 border-none shadow-xl bg-gradient-to-br from-card to-muted/20">
                    <CardHeader>
                        <CardTitle>Your Avatar</CardTitle>
                        <CardDescription>
                            Click generate to get a new random look or keep the current one.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center space-y-6 py-6">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                            <Avatar className="h-40 w-40 border-4 border-background relative shadow-2xl">
                                <AvatarImage src={avatarUrl} alt={name} />
                                <AvatarFallback className="text-4xl">{name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                        </div>
                        <Button
                            variant="outline"
                            onClick={handleGenerateAvatar}
                            className="gap-2 transition-all hover:border-primary hover:text-primary"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Generate Random Avatar
                        </Button>
                    </CardContent>
                </Card>

                <Card className="col-span-4 border-none shadow-md backdrop-blur-sm bg-card/50">
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>
                            Update your personal details here.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                Email
                            </Label>
                            <Input
                                id="email"
                                value={user?.email || ""}
                                disabled
                                className="bg-muted/50 border-none shadow-inner"
                            />
                            <p className="text-[0.8rem] text-muted-foreground">
                                Email addresses cannot be changed directly.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name" className="flex items-center gap-2">
                                <UserIcon className="h-4 w-4 text-muted-foreground" />
                                Full Name
                            </Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="border-muted-foreground/20 focus-visible:ring-primary"
                                placeholder="Enter your full name"
                            />
                        </div>

                        <div className="pt-4 flex justify-end">
                            <Button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="min-w-[140px] bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg transition-all hover:scale-[1.02]"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Profile;