import {
  users,
  trips,
  posts,
  comments,
  userTrips,
  tripSwipes,
  postLikes,
  type User,
  type UpsertUser,
  type Trip,
  type InsertTrip,
  type Post,
  type InsertPost,
  type Comment,
  type InsertComment,
  type UserTrip,
  type InsertUserTrip,
  type TripSwipe,
  type InsertTripSwipe,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, ne, notInArray } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Trip operations
  getTrips(): Promise<Trip[]>;
  getTripById(id: number): Promise<Trip | undefined>;
  createTrip(trip: InsertTrip): Promise<Trip>;
  getTripsForUser(userId: string): Promise<UserTrip[]>;
  saveUserTrip(userTrip: InsertUserTrip): Promise<UserTrip>;
  deleteUserTrip(userId: string, tripId: number): Promise<void>;
  getSwipeableTrips(userId: string): Promise<Trip[]>;
  recordTripSwipe(swipe: InsertTripSwipe): Promise<TripSwipe>;
  
  // Community operations
  getPosts(destination?: string): Promise<(Post & { author: User })[]>;
  createPost(post: InsertPost): Promise<Post>;
  getPostById(id: number): Promise<(Post & { author: User; comments: (Comment & { author: User })[] }) | undefined>;
  createComment(comment: InsertComment): Promise<Comment>;
  togglePostLike(postId: number, userId: string): Promise<void>;
  getPopularDestinations(): Promise<{ destination: string; postCount: number }[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Trip operations
  async getTrips(): Promise<Trip[]> {
    return await db.select().from(trips).where(eq(trips.isPublic, true)).orderBy(desc(trips.createdAt));
  }

  async getTripById(id: number): Promise<Trip | undefined> {
    const [trip] = await db.select().from(trips).where(eq(trips.id, id));
    return trip;
  }

  async createTrip(tripData: InsertTrip): Promise<Trip> {
    const [trip] = await db.insert(trips).values(tripData).returning();
    return trip;
  }

  async getTripsForUser(userId: string): Promise<UserTrip[]> {
    return await db
      .select({
        id: userTrips.id,
        userId: userTrips.userId,
        tripId: userTrips.tripId,
        status: userTrips.status,
        savedAt: userTrips.savedAt,
        trip: trips,
      })
      .from(userTrips)
      .innerJoin(trips, eq(userTrips.tripId, trips.id))
      .where(eq(userTrips.userId, userId))
      .orderBy(desc(userTrips.savedAt)) as UserTrip[];
  }

  async saveUserTrip(userTripData: InsertUserTrip): Promise<UserTrip> {
    const [userTrip] = await db.insert(userTrips).values(userTripData).returning();
    return userTrip;
  }

  async deleteUserTrip(userId: string, tripId: number): Promise<void> {
    await db
      .delete(userTrips)
      .where(
        and(
          eq(userTrips.userId, userId),
          eq(userTrips.tripId, tripId)
        )
      );
  }

  async getSwipeableTrips(userId: string): Promise<Trip[]> {
    // Get trips that user hasn't swiped on yet
    const swipedTripIds = await db
      .select({ tripId: tripSwipes.tripId })
      .from(tripSwipes)
      .where(eq(tripSwipes.userId, userId));

    const swipedIds = swipedTripIds.map(s => s.tripId);

    if (swipedIds.length === 0) {
      return await db.select().from(trips).where(eq(trips.isPublic, true)).orderBy(desc(trips.createdAt));
    }

    return await db
      .select()
      .from(trips)
      .where(and(
        eq(trips.isPublic, true),
        notInArray(trips.id, swipedIds)
      ))
      .orderBy(desc(trips.createdAt));
  }

  async recordTripSwipe(swipeData: InsertTripSwipe): Promise<TripSwipe> {
    const [swipe] = await db.insert(tripSwipes).values(swipeData).returning();
    
    // If user liked the trip, automatically save it
    if (swipeData.liked) {
      await this.saveUserTrip({
        userId: swipeData.userId,
        tripId: swipeData.tripId,
        status: "saved",
      });
    }
    
    return swipe;
  }

  // Community operations
  async getPosts(destination?: string): Promise<(Post & { author: User })[]> {
    const query = db
      .select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        imageUrl: posts.imageUrl,
        destination: posts.destination,
        authorId: posts.authorId,
        likes: posts.likes,
        commentsCount: posts.commentsCount,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        author: users,
      })
      .from(posts)
      .innerJoin(users, eq(posts.authorId, users.id))
      .orderBy(desc(posts.createdAt));

    if (destination) {
      return await query.where(eq(posts.destination, destination));
    }

    return await query;
  }

  async createPost(postData: InsertPost): Promise<Post> {
    const [post] = await db.insert(posts).values(postData).returning();
    return post;
  }

  async getPostById(id: number): Promise<(Post & { author: User; comments: (Comment & { author: User })[] }) | undefined> {
    const [post] = await db
      .select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        imageUrl: posts.imageUrl,
        destination: posts.destination,
        authorId: posts.authorId,
        likes: posts.likes,
        commentsCount: posts.commentsCount,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        author: users,
      })
      .from(posts)
      .innerJoin(users, eq(posts.authorId, users.id))
      .where(eq(posts.id, id));

    if (!post) return undefined;

    const postComments = await db
      .select({
        id: comments.id,
        content: comments.content,
        postId: comments.postId,
        authorId: comments.authorId,
        createdAt: comments.createdAt,
        author: users,
      })
      .from(comments)
      .innerJoin(users, eq(comments.authorId, users.id))
      .where(eq(comments.postId, id))
      .orderBy(desc(comments.createdAt));

    return { ...post, comments: postComments };
  }

  async createComment(commentData: InsertComment): Promise<Comment> {
    const [comment] = await db.insert(comments).values(commentData).returning();
    
    // Update comment count
    await db
      .update(posts)
      .set({ commentsCount: sql`${posts.commentsCount} + 1` })
      .where(eq(posts.id, commentData.postId));
    
    return comment;
  }

  async togglePostLike(postId: number, userId: string): Promise<void> {
    const [existingLike] = await db
      .select()
      .from(postLikes)
      .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)));

    if (existingLike) {
      // Remove like
      await db
        .delete(postLikes)
        .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)));
      
      await db
        .update(posts)
        .set({ likes: sql`${posts.likes} - 1` })
        .where(eq(posts.id, postId));
    } else {
      // Add like
      await db.insert(postLikes).values({ postId, userId });
      
      await db
        .update(posts)
        .set({ likes: sql`${posts.likes} + 1` })
        .where(eq(posts.id, postId));
    }
  }

  async getPopularDestinations(): Promise<{ destination: string; postCount: number }[]> {
    return await db
      .select({
        destination: posts.destination,
        postCount: sql<number>`count(*)`,
      })
      .from(posts)
      .groupBy(posts.destination)
      .orderBy(desc(sql`count(*)`))
      .limit(10);
  }
}

export const storage = new DatabaseStorage();
