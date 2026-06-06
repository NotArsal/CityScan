import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, Shield, Users } from "lucide-react";

const Navbar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-primary to-gov-blue-light">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">Public-Eye</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/track" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/track') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Track Complaint
            </Link>
            <Link 
              to="/transparency" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/transparency') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Public Dashboard
            </Link>
            <Link 
              to="/admin" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/admin') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Admin
            </Link>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/track">Track Complaint</Link>
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-primary to-gov-blue-light" asChild>
              <Link to="/report">Report Issue</Link>
            </Button>
            <Button asChild variant="ghost">
            <a href="/rewards">Rewards</a>
            </Button>

          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;