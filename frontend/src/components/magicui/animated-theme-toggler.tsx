"use client";

import { cn } from "@/lib/utils";
import { Moon, SunDim } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

type props = {
  className?: string;
};

export const AnimatedThemeToggler = ({ className }: props) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  // Initialize theme state from localStorage or system preference
  useEffect(() => {
    const theme = localStorage.getItem("theme");
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (theme === "dark" || (!theme && systemDark)) {
      document.documentElement.classList.add("dark");
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDarkMode(false);
    }
  }, []);

  const changeTheme = async () => {
    if (!buttonRef.current) return;

    const toggleTheme = () => {
      const isDark = document.documentElement.classList.toggle("dark");
      setIsDarkMode(isDark);
      localStorage.setItem("theme", isDark ? "dark" : "light");
      return isDark;
    };

    const supportsViewTransitions = "startViewTransition" in document;

    if (supportsViewTransitions) {
      await document.startViewTransition(() => {
        flushSync(() => {
          toggleTheme();
        });
      }).ready;

      const { top, left, width, height } =
        buttonRef.current.getBoundingClientRect();
      const y = top + height / 2;
      const x = left + width / 2;

      const right = window.innerWidth - left;
      const bottom = window.innerHeight - top;
      const maxRad = Math.hypot(Math.max(left, right), Math.max(top, bottom));

      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${maxRad}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 500,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    } else {
      toggleTheme();
    }
  };

  return (
    <button
      ref={buttonRef}
      onClick={changeTheme}
      className={cn(
        "p-3 rounded-lg border border-border hover:bg-accent transition-all duration-300 shadow-lg hover:shadow-xl",
        "flex items-center justify-center cursor-pointer",
        className
      )}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDarkMode ? (
        <SunDim className="h-5 w-5 text-foreground" />
      ) : (
        <Moon className="h-5 w-5 text-foreground" />
      )}
    </button>
  );
};
