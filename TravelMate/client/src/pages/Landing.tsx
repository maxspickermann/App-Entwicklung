import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Compass, Users, MapPin, Heart, Plane, Camera } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-emerald-500 rounded-2xl flex items-center justify-center">
              <Compass className="text-white text-xl" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900">Travelmate</h1>
          </div>
          
          <h2 className="text-5xl font-bold text-slate-900 mb-6 leading-tight">
            Your All-in-One
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
              Travel Platform
            </span>
          </h2>
          
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Discover unique destinations, build perfect trips with AI assistance, 
            and connect with travelers worldwide. Your next adventure starts here.
          </p>
          
          <Button 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg rounded-xl"
            onClick={() => window.location.href = '/api/login'}
          >
            <Plane className="mr-2" />
            Start Your Journey
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Heart className="text-blue-600" />
              </div>
              <CardTitle className="text-lg">Swipe to Discover</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Swipe through curated trips like Tinder for travel. AI learns your preferences.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="text-emerald-600" />
              </div>
              <CardTitle className="text-lg">AI Trip Builder</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Build perfect trips with intelligent assistance. From flights to activities.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="text-orange-600" />
              </div>
              <CardTitle className="text-lg">Travel Community</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Connect with like-minded travelers. Share tips and experiences.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Camera className="text-purple-600" />
              </div>
              <CardTitle className="text-lg">Share Stories</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Document your journeys and inspire others with your adventures.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-blue-600 to-emerald-500 text-white">
          <CardContent className="p-12 text-center">
            <h3 className="text-3xl font-bold mb-4">Ready to Explore the World?</h3>
            <p className="text-blue-100 mb-6 text-lg">
              Join thousands of travelers who've discovered their perfect trips with Travelmate.
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg rounded-xl"
              onClick={() => window.location.href = '/api/login'}
            >
              Get Started Now
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
