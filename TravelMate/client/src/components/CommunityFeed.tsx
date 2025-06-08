import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import ImageUpload from "@/components/ImageUpload";
import { 
  Plus, 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark,
  MapPin,
  Users,
  TrendingUp 
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { formatDistanceToNow } from "date-fns";

export default function CommunityFeed() {
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    destination: "",
    imageUrl: "",
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch posts
  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ["/api/posts"],
  });

  // Fetch popular destinations
  const { data: popularDestinations = [] } = useQuery({
    queryKey: ["/api/destinations/popular"],
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      await apiRequest("POST", "/api/posts", postData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/destinations/popular"] });
      setNewPost({ title: "", content: "", destination: "", imageUrl: "" });
      setIsDialogOpen(false);
      toast({
        title: "Post Created!",
        description: "Your post has been shared with the community.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Like post mutation
  const likePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      await apiRequest("POST", `/api/posts/${postId}/like`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to like post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreatePost = () => {
    if (!newPost.title || !newPost.content || !newPost.destination) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createPostMutation.mutate(newPost);
  };

  const handleLikePost = (postId: number) => {
    likePostMutation.mutate(postId);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Travel Community</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Share Your Travel Experience</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="post-title">Title</Label>
                <Input
                  id="post-title"
                  placeholder="What's your travel story?"
                  value={newPost.title}
                  onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="post-destination">Destination</Label>
                <Input
                  id="post-destination"
                  placeholder="Where did you go?"
                  value={newPost.destination}
                  onChange={(e) => setNewPost(prev => ({ ...prev, destination: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="post-content">Content</Label>
                <Textarea
                  id="post-content"
                  placeholder="Share your experience, tips, or recommendations..."
                  value={newPost.content}
                  onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="post-image">Image (Optional)</Label>
                <ImageUpload
                  onImageSelect={(imageUrl) => setNewPost(prev => ({ ...prev, imageUrl }))}
                  currentImage={newPost.imageUrl}
                  className="mt-2"
                />
              </div>
              <Button 
                onClick={handleCreatePost}
                disabled={createPostMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {createPostMutation.isPending ? "Creating..." : "Create Post"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Community Boards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Popular Destinations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Popular Destinations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {popularDestinations.slice(0, 5).map((dest: any, index: number) => (
                <div key={dest.destination} className="flex items-center space-x-3 hover:bg-slate-50 p-2 rounded-lg transition-colors cursor-pointer">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                    index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-green-500' : 'bg-orange-500'
                  }`}>
                    {dest.destination.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{dest.destination}</p>
                    <p className="text-sm text-slate-500">{dest.postCount} posts</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {posts.slice(0, 3).map((post: any) => (
                <div key={post.id} className="flex items-start space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={post.author.profileImageUrl} />
                    <AvatarFallback>
                      {post.author.firstName?.[0] || post.author.email?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm text-slate-900">
                      <span className="font-medium">{post.author.firstName || "User"}</span> posted in{" "}
                      <span className="text-blue-600">{post.destination}</span>
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Contributors */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Top Contributors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Mock data for top contributors */}
              <div className="flex items-center space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback>EW</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">Emma Wilson</p>
                  <div className="flex items-center space-x-1">
                    <Badge variant="secondary" className="text-xs">Food Expert</Badge>
                    <span className="text-xs text-slate-500">156 posts</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback>AC</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">Alex Chen</p>
                  <div className="flex items-center space-x-1">
                    <Badge variant="secondary" className="text-xs">Adventure</Badge>
                    <span className="text-xs text-slate-500">132 posts</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Community Feed */}
      <div className="space-y-6">
        {postsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-32"></div>
                      <div className="h-3 bg-slate-200 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-slate-200 rounded mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No posts yet</h3>
              <p className="text-slate-600 mb-4">
                Be the first to share your travel experience with the community!
              </p>
              <Button onClick={() => setIsDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                Create First Post
              </Button>
            </CardContent>
          </Card>
        ) : (
          posts.map((post: any) => (
            <Card key={post.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={post.author.profileImageUrl} />
                    <AvatarFallback>
                      {post.author.firstName?.[0] || post.author.email?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-slate-900">
                      {post.author.firstName || "Anonymous User"}
                    </p>
                    <p className="text-sm text-slate-500">
                      Posted in {post.destination} •{" "}
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-slate-900 mb-3">{post.title}</h3>
                <p className="text-slate-700 mb-4">{post.content}</p>
                
                {post.imageUrl && (
                  <img 
                    src={post.imageUrl} 
                    alt={post.title}
                    className="w-full h-64 object-cover rounded-lg mb-4"
                  />
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <button 
                      onClick={() => handleLikePost(post.id)}
                      className="flex items-center space-x-2 text-slate-600 hover:text-red-500 transition-colors"
                    >
                      <Heart className="w-4 h-4" />
                      <span>{post.likes || 0}</span>
                    </button>
                    <button className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.commentsCount || 0}</span>
                    </button>
                    <button className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 transition-colors">
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </button>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600">
                    <Bookmark className="w-4 h-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
