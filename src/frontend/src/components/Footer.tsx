import { Heart } from "lucide-react";
import React from "react";
import { SiDiscord, SiGithub, SiX } from "react-icons/si";

export function Footer() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`;

  return (
    <footer
      className="w-full mt-12"
      style={{ backgroundColor: "oklch(0.185 0.038 243)" }}
    >
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Links */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-white/50">
            {[
              "About",
              "Contact",
              "Privacy Policy",
              "Terms of Service",
              "Help",
            ].map((link) => (
              <a
                key={link}
                href="https://caffeine.ai"
                className="hover:text-white/80 transition-colors"
              >
                {link}
              </a>
            ))}
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-4">
            <a
              href="https://caffeine.ai"
              className="text-white/50 hover:text-white/80 transition-colors"
            >
              <SiGithub className="w-4 h-4" />
            </a>
            <a
              href="https://caffeine.ai"
              className="text-white/50 hover:text-white/80 transition-colors"
            >
              <SiX className="w-4 h-4" />
            </a>
            <a
              href="https://caffeine.ai"
              className="text-white/50 hover:text-white/80 transition-colors"
            >
              <SiDiscord className="w-4 h-4" />
            </a>
          </div>

          {/* Copyright */}
          <p className="text-xs text-white/40">
            &copy; {year}. Built with{" "}
            <Heart className="inline w-3 h-3 text-red-400 mx-0.5" /> using{" "}
            <a
              href={caffeineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white/80 transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
