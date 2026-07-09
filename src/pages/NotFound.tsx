
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-20 px-4"
    >
      <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
        <AlertCircle className="w-10 h-10 text-primary" />
      </div>
      
      <h1 className="text-3xl sm:text-4xl font-bold mb-2 title-tech text-gradient">404 NOT FOUND</h1>
      <p className="text-muted-foreground text-center max-w-md mb-8">
        The page you are looking for does not exist or has been moved.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Button variant="outline" className="neon-button" onClick={() => window.history.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
        <Button className="neon-button" asChild>
          <Link to="/">Return to Home</Link>
        </Button>
      </div>
      
      <div className="mt-8 text-sm text-muted-foreground">
        Path: <code className="bg-primary/10 px-2 py-1 rounded">{location.pathname}</code>
      </div>
      
      {/* Tech decorations */}
      <div className="absolute bottom-10 left-10 w-20 h-[1px] bg-gradient-to-r from-primary/20 to-transparent"></div>
      <div className="absolute top-10 right-10 w-20 h-[1px] bg-gradient-to-l from-primary/20 to-transparent"></div>
    </motion.div>
  );
};

export default NotFound;
