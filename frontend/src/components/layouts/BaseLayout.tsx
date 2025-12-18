
import { Outlet } from "react-router-dom";
import { ThemeToggle } from "../theme-toggle";

const BaseLayout = () => {
  return (
    <div className="min-h-screen bg-background animate-in">
      <header className="border-b">
        <div className="anis2 flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="font-bold text-xl flex items-center">
              <span className="text-primary">Block</span>
              <span className="text-secondary">Vote</span>
            </a>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="anis py-6">
        <Outlet />
      </main>
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} BlockVote. Secured by blockchain technology.
          </p>
          <div className="flex items-center gap-4">
            <a href="/about" className="text-sm text-muted-foreground hover:underline">
              About
            </a>
            <a href="/privacy" className="text-sm text-muted-foreground hover:underline">
              Privacy
            </a>
            <a href="/terms" className="text-sm text-muted-foreground hover:underline">
              Terms
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BaseLayout;
