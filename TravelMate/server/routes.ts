import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertTripSchema, 
  insertPostSchema, 
  insertCommentSchema,
  insertTripSwipeSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Trip routes
  app.get('/api/trips', async (req, res) => {
    try {
      const trips = await storage.getTrips();
      res.json(trips);
    } catch (error) {
      console.error("Error fetching trips:", error);
      res.status(500).json({ message: "Failed to fetch trips" });
    }
  });

  app.get('/api/trips/swipeable', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const trips = await storage.getSwipeableTrips(userId);
      res.json(trips);
    } catch (error) {
      console.error("Error fetching swipeable trips:", error);
      res.status(500).json({ message: "Failed to fetch swipeable trips" });
    }
  });

  app.get('/api/trips/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const trip = await storage.getTripById(id);
      if (!trip) {
        return res.status(404).json({ message: "Trip not found" });
      }
      res.json(trip);
    } catch (error) {
      console.error("Error fetching trip:", error);
      res.status(500).json({ message: "Failed to fetch trip" });
    }
  });

  app.post('/api/trips', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tripData = insertTripSchema.parse({ ...req.body, createdBy: userId });
      const trip = await storage.createTrip(tripData);
      res.status(201).json(trip);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid trip data", errors: error.errors });
      }
      console.error("Error creating trip:", error);
      res.status(500).json({ message: "Failed to create trip" });
    }
  });

  app.post('/api/trips/:id/swipe', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tripId = parseInt(req.params.id);
      const { liked } = req.body;
      
      const swipeData = insertTripSwipeSchema.parse({
        userId,
        tripId,
        liked: Boolean(liked),
      });
      
      const swipe = await storage.recordTripSwipe(swipeData);
      res.json(swipe);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid swipe data", errors: error.errors });
      }
      console.error("Error recording trip swipe:", error);
      res.status(500).json({ message: "Failed to record swipe" });
    }
  });

  app.get('/api/user/trips', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userTrips = await storage.getTripsForUser(userId);
      res.json(userTrips);
    } catch (error) {
      console.error("Error fetching user trips:", error);
      res.status(500).json({ message: "Failed to fetch user trips" });
    }
  });

  app.delete('/api/user/trips/:tripId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tripId = parseInt(req.params.tripId);
      
      if (!tripId || isNaN(tripId)) {
        return res.status(400).json({ message: "Invalid trip ID" });
      }

      await storage.deleteUserTrip(userId, tripId);
      res.json({ message: "Trip removed successfully" });
    } catch (error) {
      console.error("Error deleting user trip:", error);
      res.status(500).json({ message: "Failed to remove trip" });
    }
  });

  // Community routes
  app.get('/api/posts', async (req, res) => {
    try {
      const destination = req.query.destination as string;
      const posts = await storage.getPosts(destination);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.get('/api/posts/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.getPostById(id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Error fetching post:", error);
      res.status(500).json({ message: "Failed to fetch post" });
    }
  });

  app.post('/api/posts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postData = insertPostSchema.parse({ ...req.body, authorId: userId });
      const post = await storage.createPost(postData);
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid post data", errors: error.errors });
      }
      console.error("Error creating post:", error);
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  app.post('/api/posts/:id/comments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postId = parseInt(req.params.id);
      const { content } = req.body;
      
      if (!content || content.trim() === '') {
        return res.status(400).json({ message: "Comment content is required" });
      }
      
      const comment = await storage.createComment({ postId, authorId: userId, content: content.trim() });
      res.status(201).json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  app.post('/api/posts/:id/like', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postId = parseInt(req.params.id);
      
      await storage.togglePostLike(postId, userId);
      res.json({ message: "Like toggled successfully" });
    } catch (error) {
      console.error("Error toggling like:", error);
      res.status(500).json({ message: "Failed to toggle like" });
    }
  });

  app.get('/api/destinations/popular', async (req, res) => {
    try {
      const destinations = await storage.getPopularDestinations();
      res.json(destinations);
    } catch (error) {
      console.error("Error fetching popular destinations:", error);
      res.status(500).json({ message: "Failed to fetch popular destinations" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
