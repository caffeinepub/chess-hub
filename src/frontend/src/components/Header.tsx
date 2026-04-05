import { Button } from "@/components/ui/button";
import { Crown, LogIn, LogOut, Search, User, UserPlus } from "lucide-react";
import React from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface HeaderProps {
  onRegister: () => void;
  onLogin: () => void;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const NAV_LINKS = ["Play", "Puzzles", "Learn", "Watch", "Community"];

export function Header({
  onRegister,
  onLogin,
  activeSection,
  onSectionChange,
}: HeaderProps) {
  const { identity, clear } = useInternetIdentity();
  const isLoggedIn = !!identity;
  const principal = identity?.getPrincipal().toString();
  const shortPrincipal = principal
    ? `${principal.slice(0, 5)}...${principal.slice(-3)}`
    : "";

  return (
    <header
      className="header-gradient sticky top-0 z-30 w-full"
      style={{ height: "64px" }}
    >
      <div className="max-w-[1200px] mx-auto px-4 h-full flex items-center gap-4">
        {/* Logo */}
        <a
          href="/"
          className="flex items-center gap-2 flex-shrink-0 group"
          onClick={() => onSectionChange("play")}
          data-ocid="nav.logo_link"
        >
          <div className="w-8 h-8 text-white/90">
            <svg
              viewBox="0 0 45 45"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
              aria-hidden="true"
            >
              <g
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 39h27v-3H9v3zM12.5 32l1.5-2.5h17l1.5 2.5h-20zM12 36v-4h21v4H12z" />
                <path d="M14 29.5v-13h17v13H14z" />
                <path d="M9 9l5-3h17l5 3v5H9V9z" />
              </g>
            </svg>
          </div>
          <span className="font-bold uppercase text-white tracking-widest text-lg hidden sm:block">
            Chess Hub
          </span>
        </a>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1 ml-2">
          {NAV_LINKS.map((link) => (
            <button
              type="button"
              key={link}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                activeSection === link.toLowerCase()
                  ? "text-white bg-white/10"
                  : "text-white/75 hover:text-white hover:bg-white/8"
              }`}
              onClick={() => onSectionChange(link.toLowerCase())}
              data-ocid={`nav.${link.toLowerCase()}_link`}
            >
              {link}
            </button>
          ))}
        </nav>

        {/* Search */}
        <div className="flex-1 max-w-[200px] hidden lg:block">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-8 pr-3 py-1.5 rounded-full text-sm bg-white/10 text-white placeholder-white/40 border border-white/15 focus:outline-none focus:border-white/30 transition-colors"
              data-ocid="nav.search_input"
            />
          </div>
        </div>

        {/* Right side actions */}
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            className="text-sm font-medium text-gold hover:text-gold/80 transition-colors hidden sm:block"
          >
            ★ Upgrade
          </button>

          {isLoggedIn ? (
            <>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-white/80" />
                </div>
                <span className="text-white/70 text-xs hidden sm:block">
                  {shortPrincipal}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-white/70 hover:text-white hover:bg-white/10 text-xs"
                onClick={clear}
                data-ocid="nav.logout_button"
              >
                <LogOut className="w-3.5 h-3.5 mr-1" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="text-white/80 hover:text-white hover:bg-white/10 text-sm rounded-full px-4"
                onClick={onLogin}
                data-ocid="nav.login_button"
              >
                Log In
              </Button>
              <Button
                size="sm"
                className="bg-white text-navy-dark hover:bg-white/90 text-sm rounded-full px-4 font-semibold"
                onClick={onRegister}
                data-ocid="nav.register_button"
              >
                Register
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
