
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MobileNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-background/95 backdrop-blur-sm border-b z-50">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-3">
              <Link
                to="/"
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive('/') 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                Home
              </Link>
              <Link
                to="/blocks"
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive('/blocks') 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                Blocks
              </Link>
              <Link
                to="/transactions"
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive('/transactions') 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                Transactions
              </Link>
              <Link
                to="/nodes"
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive('/nodes') 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                Nodes
              </Link>
              <Link
                to="/address-converter"
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive('/address-converter') 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                Address Converter
              </Link>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileNavigation;
