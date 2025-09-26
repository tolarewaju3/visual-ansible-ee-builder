import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ReportProblemDialog } from "@/components/ReportProblemDialog";
import { Bug } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-gray-600">Oops! Page not found</p>
        <p className="mb-6 text-sm text-gray-500">
          The page "{location.pathname}" doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="/" className="text-blue-500 underline hover:text-blue-700">
            Return to Home
          </a>
          <ReportProblemDialog
            errorDetails={{
              error: "404 Not Found",
              context: `User attempted to access non-existent route: ${location.pathname}. Requested URL: ${location.pathname}`
            }}
          >
            <Button variant="outline" size="sm">
              <Bug className="h-4 w-4 mr-2" />
              Report Problem
            </Button>
          </ReportProblemDialog>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
