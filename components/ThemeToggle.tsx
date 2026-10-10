"use client";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";
export function ThemeToggle() {
  const [dark, setDark] = useState(true);
  useEffect(() => {
    try {
      const next = localStorage.getItem("aij_theme") !== "light";
      setDark(next);
      document.documentElement.classList.toggle("dark", next);
    } catch {}
  }, []);
  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("aij_theme", next ? "dark" : "light");
    } catch {}
  }
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={toggle}
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </Button>
  );
}
