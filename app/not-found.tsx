import { Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-5">
      <div className="text-center max-w-lg">
        <div className="text-8xl font-bold text-accent/20 mb-4">404</div>
        <h1 className="text-3xl font-bold text-white mb-3">Page Not Found</h1>
        <p className="text-zinc-400 mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button href="/" variant="primary" size="lg">
            <Home className="h-4 w-4" />
            Back to Home
          </Button>
          <Button href="/inventory" variant="outline" size="lg">
            <Search className="h-4 w-4" />
            Browse Inventory
          </Button>
        </div>
      </div>
    </div>
  );
}
