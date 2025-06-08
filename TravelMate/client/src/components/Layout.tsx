import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import UserProfile from "@/components/UserProfile";
import { useAuth } from "@/hooks/useAuth";
import { 
  Compass, 
  Search, 
  Users, 
  Briefcase, 
  User, 
  Plus,
  Globe,
  LogOut
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function Layout({ children, activeSection, onSectionChange }: LayoutProps) {
  const { user } = useAuth();

  const navItems = [
    { id: "explore", label: "Explore", icon: Compass },
    { id: "search", label: "Search", icon: Search },
    { id: "community", label: "Community", icon: Users },
    { id: "trips", label: "My Trips", icon: Briefcase },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-emerald-500 rounded-lg flex items-center justify-center">
                <Globe className="text-white w-4 h-4" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">Travelmate</h1>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSectionChange(item.id)}
                  className={`font-medium pb-1 transition-colors ${
                    activeSection === item.id
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-slate-600 hover:text-blue-600"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
            
            {/* User Actions */}
            <div className="flex items-center space-x-3">
              <Button className="hidden md:flex bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Trip
              </Button>
              <UserProfile />
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.location.href = '/api/logout'}
                className="hidden md:flex text-slate-600 hover:text-slate-900"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        {children}
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2 z-50">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-lg transition-colors ${
                  activeSection === item.id
                    ? "text-blue-600"
                    : "text-slate-600"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </button>
            );
          })}
          <button
            onClick={() => window.location.href = '/api/logout'}
            className="flex flex-col items-center space-y-1 py-2 px-3 rounded-lg text-slate-600"
          >
            <User className="w-5 h-5" />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
