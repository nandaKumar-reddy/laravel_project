import { Link } from "react-router-dom";
import React from "react";
import DarkModeToggle from "./DarkModeToggle";

export default function Header() {
  return (
    <header className="w-full bg-white dark:bg-gray-900 shadow-md dark:text-white">
      <div className="container mx-auto flex items-center justify-between py-4 px-6">
        <Link to="/">
          <img
            src="/images/fidelis-logo.png"
            alt="Fidelis Logo"
            className="sm:h-10 h-8"
          />
        </Link>
        <DarkModeToggle /> {/* Add dark mode toggle button */}
      </div>
    </header>
  );
}
