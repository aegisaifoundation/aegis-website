"use client";

import React, { useState, useEffect, useRef } from "react";
import { SEARCH_INDEX, SearchItem } from "@/config/searchIndex";
import { Search, Command, ArrowDown, ArrowUp, CornerDownLeft } from "lucide-react";

export default function SearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Toggle search with ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Autofocus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
      setSelectedIndex(0);
      setQuery("");
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const filteredItems = SEARCH_INDEX.filter((item) => {
    const matchString = `${item.title} ${item.description} ${item.category} ${item.command}`.toLowerCase();
    return matchString.includes(query.toLowerCase());
  });

  const handleSelect = (item: SearchItem) => {
    setIsOpen(false);
    
    // Smooth scroll to the target ID
    const targetElement = document.querySelector(item.targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    if (item.category === "Sector") {
      const cleanTitle = item.title.replace(" Sector Node", "");
      window.dispatchEvent(new CustomEvent("select-sector", { detail: cleanTitle }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === "Tab") {
      e.preventDefault();
      if (e.shiftKey) {
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
      } else {
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  // Add event listener to let the Navbar trigger this global search modal
  useEffect(() => {
    const handleOpenSearch = () => setIsOpen(true);
    window.addEventListener("open-aegis-search", handleOpenSearch);
    return () => window.removeEventListener("open-aegis-search", handleOpenSearch);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#000000]/70 backdrop-blur-sm flex items-start justify-center pt-24 px-4">
      <div
        ref={modalRef}
        onKeyDown={handleKeyDown}
        className="w-full max-w-2xl bg-[#080d16] border border-white/10 rounded-2xl shadow-[0_24px_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col font-body"
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
          <Search className="w-5 h-5 text-gray-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search index (e.g. Healthcare, Federated, Economics)..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full bg-transparent text-white border-none outline-none text-sm placeholder:text-gray-600 focus:ring-0 focus:outline-none"
          />
          <div className="flex items-center gap-1 text-[10px] text-gray-500 font-heading bg-white/5 px-2 py-1 rounded border border-white/10 shrink-0">
            <span className="text-[12px] leading-none">Esc</span>
          </div>
        </div>

        {/* Results List */}
        <div className="max-h-[360px] overflow-y-auto p-2 flex flex-col gap-1">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={`${item.title}-${idx}`}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between text-left p-3.5 rounded-xl transition-colors select-none ${
                    isSelected ? "bg-white/5 text-white" : "text-gray-400"
                  }`}
                >
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold font-heading tracking-wide uppercase px-1.5 py-0.5 bg-white/5 text-[#7DD3FC] border border-white/5 rounded">
                        {item.category}
                      </span>
                      <span className={`text-sm font-semibold ${isSelected ? "text-white" : "text-gray-300"}`}>
                        {item.title}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 font-light truncate max-w-md">
                      {item.description}
                    </span>
                  </div>

                  {/* Actions / Trigger hint */}
                  <div className="flex items-center gap-2 text-[10px] text-gray-500">
                    <span className="font-heading border border-white/5 bg-white/5 px-2 py-0.5 rounded text-gray-400">
                      {item.command}
                    </span>
                    {isSelected && (
                      <CornerDownLeft className="w-3 h-3 text-[#4D7CFE] animate-pulse" />
                    )}
                  </div>
                </button>
              );
            })
          ) : (
            <div className="text-center py-10 text-gray-500 text-xs font-light">
              No results found for "{query}". Try searching "Healthcare" or "Manifesto".
            </div>
          )}
        </div>

        {/* Spotlight Navigation Footer Info */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-white/[0.01] border-t border-white/5 text-[10px] text-gray-500 font-heading">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <ArrowUp className="w-3 h-3" /> <ArrowDown className="w-3 h-3" /> Navigate
            </span>
            <span className="flex items-center gap-1 bg-white/5 border border-white/5 rounded px-1.5 py-0.5">
              Enter
            </span>
            <span>Select</span>
          </div>
          <div className="flex items-center gap-1 text-[11px]">
            <Command className="w-3 h-3" />
            <span>K to search</span>
          </div>
        </div>
      </div>
    </div>
  );
}
