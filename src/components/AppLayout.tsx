
import React from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';
import { 
  Building,
  Home, 
  LogOut, 
  MessageSquare, 
  Settings, 
  Shield, 
  User as UserIcon,
  Menu
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export const AppLayout = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // If user is not authenticated, redirect to auth page
  React.useEffect(() => {
    if (user === null && location.pathname !== '/') {
      navigate('/');
    }
  }, [user, location.pathname, navigate]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navigationItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <Home className="h-5 w-5" /> },
    { path: '/messaging', label: 'Messages', icon: <MessageSquare className="h-5 w-5" /> },
    { path: '/profile', label: 'Profile', icon: <UserIcon className="h-5 w-5" /> },
    // Admin link would be conditionally shown in a real app based on user role
    { path: '/admin', label: 'Admin', icon: <Shield className="h-5 w-5" /> }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Desktop Navigation */}
      <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-10">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Building className="h-8 w-8 text-roommate-blue" />
                <span className="ml-2 text-xl font-bold text-gray-900">CityNest</span>
              </div>
              <nav className="hidden md:ml-6 md:flex md:space-x-4 items-center">
                {navigationItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `px-3 py-2 text-sm font-medium rounded-md ${
                        isActive
                          ? 'bg-roommate-paleBlue text-roommate-blue'
                          : 'text-gray-500 hover:bg-gray-100'
                      }`
                    }
                  >
                    <div className="flex items-center gap-2">
                      {item.icon}
                      {item.label}
                    </div>
                  </NavLink>
                ))}
              </nav>
            </div>
            <div className="flex items-center">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-10 w-10 rounded-full p-0">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src="/user-avatar.jpg" alt="User" />
                        <AvatarFallback>{user.email?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <UserIcon className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={() => navigate('/')}>Sign In</Button>
              )}
              
              {/* Mobile menu button */}
              <div className="flex items-center md:hidden ml-4">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-6 w-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right">
                    <nav className="flex flex-col space-y-4 mt-8">
                      {navigationItems.map((item) => (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          className={({ isActive }) =>
                            `px-3 py-2 text-sm font-medium rounded-md ${
                              isActive
                                ? 'bg-roommate-paleBlue text-roommate-blue'
                                : 'text-gray-500 hover:bg-gray-100'
                            }`
                          }
                        >
                          <div className="flex items-center gap-2">
                            {item.icon}
                            {item.label}
                          </div>
                        </NavLink>
                      ))}
                      <Button 
                        variant="outline" 
                        className="flex items-center justify-start gap-2 mt-4"
                        onClick={() => signOut()}
                      >
                        <LogOut className="h-5 w-5" />
                        Logout
                      </Button>
                    </nav>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 mt-16">
        <Outlet />
      </main>
    </div>
  );
};
