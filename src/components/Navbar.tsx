import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "../contexts/AuthContext";
import { Shield, Coins, LogOut, LogIn, Menu, QrCode, FileText, BarChart3, UserCheck, LayoutDashboard } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  
  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const navLinks = [
    { to: "/", label: "Home", icon: Shield, show: true },
    { to: "/track", label: "Track", icon: FileText, show: true },
    { to: "/transparency", label: "Transparency", icon: BarChart3, show: true },
    { to: "/rewards", label: "Rewards", icon: Coins, show: !!user },
    { to: "/admin", label: "Admin Console", icon: LayoutDashboard, show: user?.role === "admin" },
    { to: "/generate-qr", label: "Generate QR", icon: QrCode, show: user?.role === "admin" },
  ];
  
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md supports-[backdrop-filter]:bg-slate-950/60 text-slate-100">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md shadow-indigo-500/20">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-blue-400 via-indigo-200 to-white bg-clip-text text-transparent">CityScan</span>
          </Link>
          
          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.filter(link => link.show).map(link => (
              <Link 
                key={link.to}
                to={link.to} 
                className={`text-sm font-medium transition-colors hover:text-white ${
                  isActive(link.to) ? 'text-blue-400' : 'text-slate-400'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          
          {/* Desktop Actions / Auth Status */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                <Link to="/scan" className="flex items-center gap-1.5 text-xs text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20 hover:bg-indigo-500/20 transition-all">
                  <QrCode className="h-3.5 w-3.5" /> Scan QR
                </Link>
                
                <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
                  <Coins className="h-4 w-4 text-amber-400 animate-pulse" />
                  <span className="text-xs font-semibold text-amber-300">{user.points} pts</span>
                  <div className="h-3 w-px bg-slate-800"></div>
                  <span className="text-xs font-medium text-slate-300 flex items-center gap-1">
                    <UserCheck className="h-3 w-3 text-emerald-400" /> {user.displayName}
                  </span>
                </div>

                <Button 
                  onClick={handleLogout}
                  variant="ghost" 
                  size="sm" 
                  className="text-slate-400 hover:text-white hover:bg-slate-900"
                >
                  <LogOut className="h-4 w-4 mr-1.5" /> Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild className="text-slate-400 hover:text-white hover:bg-slate-900">
                  <Link to="/login">
                    <LogIn className="h-4 w-4 mr-1.5" /> Login
                  </Link>
                </Button>
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg" asChild>
                  <Link to="/register">Get Started</Link>
                </Button>
              </>
            )}
            
            <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium shadow-md shadow-indigo-500/10" asChild>
              <Link to="/report">Report Issue</Link>
            </Button>
          </div>

          {/* Mobile Navigation Drawer */}
          <div className="flex items-center md:hidden space-x-2">
            {user && (
              <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-full text-xs">
                <Coins className="h-3.5 w-3.5 text-amber-400" />
                <span className="font-semibold text-amber-300">{user.points}</span>
              </div>
            )}
            
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white hover:bg-slate-900">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-slate-950 border-l border-slate-800 text-slate-100 p-6 flex flex-col justify-between">
                <div className="space-y-6">
                  <SheetHeader className="text-left">
                    <SheetTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-200 bg-clip-text text-transparent">
                      CityScan Menu
                    </SheetTitle>
                  </SheetHeader>
                  
                  {user && (
                    <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800/80 flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-400">
                        {user.displayName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-100">{user.displayName}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                          <Coins className="h-3 w-3 text-amber-400" /> {user.points} points balance
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col space-y-3">
                    {navLinks.filter(link => link.show).map(link => {
                      const Icon = link.icon;
                      return (
                        <Link 
                          key={link.to}
                          to={link.to}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                            isActive(link.to) 
                              ? 'bg-indigo-600/10 text-blue-400 border border-indigo-500/20' 
                              : 'text-slate-300 hover:bg-slate-900 hover:text-white border border-transparent'
                          }`}
                        >
                          <Icon className="h-4.5 w-4.5" />
                          <span className="text-sm font-medium">{link.label}</span>
                        </Link>
                      );
                    })}

                    {user && (
                      <Link 
                        to="/scan"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-indigo-400 bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/10 transition-all"
                      >
                        <QrCode className="h-4.5 w-4.5" />
                        <span className="text-sm font-medium">Scan QR Code</span>
                      </Link>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white" asChild onClick={() => setIsOpen(false)}>
                    <Link to="/report">Report New Issue</Link>
                  </Button>
                  
                  {user ? (
                    <Button 
                      onClick={handleLogout}
                      variant="outline" 
                      className="w-full border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900"
                    >
                      <LogOut className="h-4 w-4 mr-2" /> Logout
                    </Button>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" className="border-slate-800 text-slate-300" asChild onClick={() => setIsOpen(false)}>
                        <Link to="/login">Login</Link>
                      </Button>
                      <Button className="bg-slate-800 hover:bg-slate-700 text-white" asChild onClick={() => setIsOpen(false)}>
                        <Link to="/register">Register</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;