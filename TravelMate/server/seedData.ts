import { db } from "./db";
import { trips, posts, users } from "@shared/schema";

const sampleUsers = [
  {
    id: "seed_user_1",
    email: "emma.wilson@example.com",
    firstName: "Emma",
    lastName: "Wilson",
    profileImageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b5bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&h=256",
  },
  {
    id: "seed_user_2", 
    email: "alex.chen@example.com",
    firstName: "Alex",
    lastName: "Chen",
    profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&h=256",
  },
  {
    id: "seed_user_3",
    email: "sarah.kim@example.com", 
    firstName: "Sarah",
    lastName: "Kim",
    profileImageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&h=256",
  },
];

const sampleTrips = [
  {
    title: "Bali Cultural Discovery",
    description: "Immerse yourself in Balinese culture with temple visits, traditional cooking classes, and local artisan workshops. Experience the spiritual heart of Indonesia.",
    destination: "Bali, Indonesia",
    country: "Indonesia",
    region: "Bali",
    city: "Ubud",
    duration: 7,
    price: "1250.00",
    imageUrl: "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    tags: ["Culture", "Food", "Relaxation", "Photography"],
    coordinates: { lat: -8.5069, lng: 115.2625 },
    createdBy: "seed_user_1",
  },
  {
    title: "Tokyo Urban Adventure",
    description: "Navigate the electric energy of Tokyo with a perfect blend of modern attractions and traditional experiences. From Shibuya to ancient temples.",
    destination: "Tokyo, Japan",
    country: "Japan", 
    region: "Kanto",
    city: "Tokyo",
    duration: 5,
    price: "1850.00",
    imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    tags: ["Culture", "Food", "Nightlife", "Photography"],
    coordinates: { lat: 35.6762, lng: 139.6503 },
    createdBy: "seed_user_2",
  },
  {
    title: "Thailand Island Paradise",
    description: "Discover pristine beaches, crystal-clear waters, and vibrant marine life. Perfect for relaxation, water sports, and unforgettable sunsets.",
    destination: "Phuket, Thailand",
    country: "Thailand",
    region: "Southern Thailand",
    city: "Phuket",
    duration: 6,
    price: "950.00",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    tags: ["Relaxation", "Adventure", "Party", "Budget"],
    coordinates: { lat: 7.8804, lng: 98.3923 },
    createdBy: "seed_user_1",
  },
  {
    title: "Tuscany Wine & Culture",
    description: "Experience the rolling hills of Tuscany with world-class wine tastings, Renaissance art, and authentic Italian cuisine in charming medieval towns.",
    destination: "Florence, Italy",
    country: "Italy",
    region: "Tuscany", 
    city: "Florence",
    duration: 8,
    price: "2200.00",
    imageUrl: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    tags: ["Culture", "Food", "Romance", "Luxury"],
    coordinates: { lat: 43.7696, lng: 11.2558 },
    createdBy: "seed_user_3",
  },
  {
    title: "Patagonia Wilderness Trek",
    description: "Challenge yourself with breathtaking hikes through glacial landscapes, pristine lakes, and dramatic mountain peaks in South America's most remote region.",
    destination: "Patagonia, Argentina",
    country: "Argentina",
    region: "Patagonia",
    city: "El Calafate",
    duration: 10,
    price: "2800.00",
    imageUrl: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    tags: ["Adventure", "Photography", "Budget"],
    coordinates: { lat: -50.3373, lng: -72.2647 },
    createdBy: "seed_user_2",
  },
  {
    title: "Morocco Desert Adventure",
    description: "Experience the magic of the Sahara with camel treks, desert camping under the stars, and exploration of ancient kasbahs and vibrant souks.",
    destination: "Marrakech, Morocco",
    country: "Morocco",
    region: "Marrakech-Safi",
    city: "Marrakech",
    duration: 7,
    price: "1400.00",
    imageUrl: "https://images.unsplash.com/photo-1539650116574-75c0c6d73aff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    tags: ["Adventure", "Culture", "Photography"],
    coordinates: { lat: 31.6295, lng: -7.9811 },
    createdBy: "seed_user_1",
  },
  {
    title: "Norwegian Fjords Expedition",
    description: "Cruise through stunning fjords, witness the Northern Lights, and explore picturesque fishing villages in one of the world's most dramatic landscapes.",
    destination: "Bergen, Norway",
    country: "Norway",
    region: "Western Norway",
    city: "Bergen",
    duration: 9,
    price: "3200.00",
    imageUrl: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    tags: ["Adventure", "Photography", "Luxury"],
    coordinates: { lat: 60.3913, lng: 5.3221 },
    createdBy: "seed_user_3",
  },
  {
    title: "Peruvian Andes & Machu Picchu",
    description: "Trek the legendary Inca Trail to Machu Picchu, explore colonial Cusco, and immerse yourself in ancient Andean culture and breathtaking mountain scenery.",
    destination: "Cusco, Peru",
    country: "Peru",
    region: "Cusco",
    city: "Cusco",
    duration: 8,
    price: "1650.00",
    imageUrl: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    tags: ["Adventure", "Culture", "Photography"],
    coordinates: { lat: -13.5319, lng: -71.9675 },
    createdBy: "seed_user_2",
  },
  {
    title: "Greek Island Hopping",
    description: "Sail through the Aegean Sea visiting iconic white-washed villages, ancient ruins, and pristine beaches. Perfect blend of history, culture, and relaxation.",
    destination: "Santorini, Greece",
    country: "Greece",
    region: "Cyclades",
    city: "Santorini",
    duration: 7,
    price: "1750.00",
    imageUrl: "https://images.unsplash.com/photo-1533105079780-92b9be482077?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    tags: ["Romance", "Culture", "Relaxation", "Luxury"],
    coordinates: { lat: 36.3932, lng: 25.4615 },
    createdBy: "seed_user_1",
  },
  {
    title: "Australian Outback Safari",
    description: "Discover the raw beauty of the Australian Outback with wildlife encounters, Aboriginal cultural experiences, and iconic landmarks like Uluru.",
    destination: "Alice Springs, Australia",
    country: "Australia",
    region: "Northern Territory",
    city: "Alice Springs",
    duration: 6,
    price: "2100.00",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    tags: ["Adventure", "Culture", "Photography"],
    coordinates: { lat: -23.6980, lng: 133.8807 },
    createdBy: "seed_user_3",
  },
];

const samplePosts = [
  {
    title: "Best Street Food in Bangkok - Hidden Gems!",
    content: "Just spent 2 weeks exploring Bangkok's incredible street food scene. Here are my top 5 hidden spots that locals actually go to: 1) Som Tam Nua for papaya salad 2) Thip Samai for the best Pad Thai 3) Jeh O Chula for boat noodles 4) Kuang Heng for pratunam chicken rice 5) And Pak Boong Fai Daeng for morning glory stir fry. Each place costs under $2 and the flavors are absolutely incredible!",
    destination: "Thailand",
    authorId: "seed_user_1",
    imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
  },
  {
    title: "Island Hopping in Indonesia - 3 Week Itinerary",
    content: "Completed an epic 3-week journey through Indonesia's best islands. Started in Java (temples and culture), moved to Bali (beaches and nightlife), then Lombok for hiking Mount Rinjani, and finished in the Gili Islands for diving. Budget was around $1200 total including flights. The diversity is incredible - each island has its own personality. Pro tip: book local boats between islands for authentic experiences and better prices!",
    destination: "Indonesia", 
    authorId: "seed_user_2",
    imageUrl: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
  },
  {
    title: "Solo Female Travel in Chiang Mai - Safety Tips",
    content: "Just returned from a month in Chiang Mai as a solo female traveler. Felt completely safe the entire time! Here's what worked: stayed in well-reviewed hostels in the old city, used Grab for transportation at night, joined group tours for temples and cooking classes, and connected with other travelers through apps. The local community is incredibly welcoming. Don't let fear hold you back - this city is perfect for solo adventures!",
    destination: "Thailand",
    authorId: "seed_user_3",
    imageUrl: "https://images.unsplash.com/photo-1528181304800-259b08848526?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
  },
  {
    title: "Bali vs Lombok - Which Island Should You Choose?",
    content: "Spent 2 months comparing both islands. Bali: better infrastructure, more dining options, great for first-time visitors, amazing nightlife in Seminyak. Lombok: more authentic culture, incredible hiking (Mount Rinjani!), pristine beaches, lower prices, fewer crowds. My recommendation: if you want comfort and variety, choose Bali. If you want adventure and authenticity, go to Lombok. Or better yet - do both! The boat ride between them is only 2 hours.",
    destination: "Indonesia",
    authorId: "seed_user_1",
    imageUrl: "https://images.unsplash.com/photo-1544359410-c89405e0d346?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
  },
  {
    title: "Working Remotely from Canggu - Digital Nomad Guide",
    content: "Just finished 3 months working remotely from Canggu, Bali. Here's the reality: WiFi is decent at most cafes (15-25 Mbps), coworking spaces like Dojo Bali are excellent, cost of living is $800-1200/month, time zone works well with Australia/Asia clients. Challenges: traffic is intense, rainy season affects internet, social life can be expensive. Overall amazing experience - the sunset surfs after work days made it all worth it!",
    destination: "Indonesia",
    authorId: "seed_user_2",
    imageUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
  },
  {
    title: "Melbourne to Sydney Road Trip - 2 Week Adventure",
    content: "Just completed the classic Melbourne to Sydney coastal drive and it exceeded all expectations! Highlights: Great Ocean Road (12 Apostles are breathtaking), wine tasting in Hunter Valley, Byron Bay for the hippie vibes, and Gold Coast for theme parks. Took the inland route back through Canberra. Total distance: 2,200km, budget: $1,800 for two people including car rental, accommodation, and food. Spring is the perfect time - perfect weather and blooming wildflowers everywhere!",
    destination: "Australia",
    authorId: "seed_user_3",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
  },
];

export async function seedDatabase() {
  try {
    console.log("Starting database seeding...");

    // Insert sample users
    for (const user of sampleUsers) {
      await db.insert(users).values(user).onConflictDoNothing();
    }
    console.log("✓ Sample users created");

    // Insert sample trips
    for (const trip of sampleTrips) {
      await db.insert(trips).values(trip).onConflictDoNothing();
    }
    console.log("✓ Sample trips created");

    // Insert sample posts
    for (const post of samplePosts) {
      await db.insert(posts).values(post).onConflictDoNothing();
    }
    console.log("✓ Sample posts created");

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}