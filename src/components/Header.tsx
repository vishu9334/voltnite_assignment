import React from 'react';
import { FolderOpen, FolderSync, Search, X, Sun, Moon } from 'lucide-react';
import type { FileNode } from '../types/fileSystem';

export interface HeaderProps {
  rootNode: FileNode | null;
  isRootLoading?: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  openFolder: () => Promise<void>;
  theme?: 'dark' | 'light';
  toggleTheme?: () => void;
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  rootNode,
  isRootLoading = false,
  searchQuery,
  setSearchQuery,
  openFolder,
  theme = 'dark',
  toggleTheme,
  onToggleTheme,
}) => {
  const isDark = theme === 'dark';

  const handleToggleTheme = () => {
    if (toggleTheme) toggleTheme();
    else if (onToggleTheme) onToggleTheme();
  };

  return (
    <header
      className={`h-10 border-b px-3 flex items-center justify-between select-none shrink-0 z-10 transition-colors ${
        isDark ? 'bg-[#1e1e1e] border-[#333333]' : 'bg-[#ffffff] border-[#e5e5e5]'
      }`}
    >
      {/* Left side: Brand and Section Label */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2">
          {/* VS Code accent dot */}
          <div className="w-2.5 h-2.5 rounded-full bg-[#007acc]" />
          <span
            className={`text-xs font-bold tracking-wider uppercase ${
              isDark ? 'text-[#cccccc]' : 'text-[#1f1f1f]'
            }`}
          >
            Explorer
          </span>
        </div>

        {rootNode && (
          <div
            className={`hidden sm:flex items-center gap-1.5 text-xs truncate max-w-xs ${
              isDark ? 'text-[#858585]' : 'text-[#616161]'
            }`}
          >
            <span>/</span>
            <span
              className={`font-medium truncate ${isDark ? 'text-[#cccccc]' : 'text-[#1f1f1f]'}`}
              title={rootNode.name}
            >
              {rootNode.name}
            </span>
          </div>
        )}
      </div>

      {/* Right side: Action controls, Search filter & Theme toggle */}
      <div className="flex items-center gap-2">
        {rootNode ? (
          <>
            {/* Search / Filter input */}
            <div className="relative flex items-center">
              <Search
                className={`w-3.5 h-3.5 absolute left-2 pointer-events-none ${
                  isDark ? 'text-[#858585]' : 'text-[#616161]'
                }`}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setSearchQuery('');
                }}
                placeholder="Filter files..."
                aria-label="Filter tree items"
                className={`w-36 sm:w-52 h-7 text-xs pl-7 pr-6 rounded border transition-colors focus:outline-none focus:border-[#007acc] focus:ring-1 focus:ring-[#007acc] ${
                  isDark
                    ? 'bg-[#252526] text-[#cccccc] placeholder-[#858585] border-[#3c3c3c]'
                    : 'bg-[#ffffff] text-[#1f1f1f] placeholder-[#616161] border-[#cecece]'
                }`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  title="Clear search filter"
                  aria-label="Clear search filter"
                  className={`absolute right-1.5 p-0.5 rounded transition-colors ${
                    isDark
                      ? 'text-[#858585] hover:text-[#cccccc] hover:bg-[#333333]'
                      : 'text-[#616161] hover:text-[#1f1f1f] hover:bg-[#e8e8e8]'
                  }`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Switch Folder button */}
            <button
              type="button"
              onClick={() => void openFolder()}
              disabled={isRootLoading}
              title="Open a different folder"
              className={`h-7 px-2.5 rounded text-xs font-medium inline-flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border ${
                isDark
                  ? 'bg-[#2d2d2d] hover:bg-[#37373d] text-[#cccccc] border-[#3e3e42]'
                  : 'bg-[#f3f3f3] hover:bg-[#e5e5e5] text-[#1f1f1f] border-[#d4d4d4]'
              }`}
            >
              <FolderSync
                className={`w-3.5 h-3.5 ${isDark ? 'text-[#858585]' : 'text-[#616161]'}`}
              />
              <span className="hidden sm:inline">Switch Folder</span>
            </button>
          </>
        ) : (
          /* Prominent Open Folder Button when no root folder is active */
          <button
            type="button"
            onClick={() => void openFolder()}
            disabled={isRootLoading}
            className="h-7 px-3 bg-[#007acc] hover:bg-[#0098ff] text-white rounded text-xs font-medium inline-flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Open Folder</span>
          </button>
        )}

        {/* Lightweight VS Code Theme Toggle Button */}
        <button
          type="button"
          onClick={handleToggleTheme}
          title={isDark ? 'Switch to VS Code Light+ Theme' : 'Switch to VS Code Dark+ Theme'}
          aria-label={isDark ? 'Switch to Light+ Theme' : 'Switch to Dark+ Theme'}
          className={`h-7 w-7 rounded flex items-center justify-center transition-colors cursor-pointer border ${
            isDark
              ? 'bg-[#2d2d2d] hover:bg-[#37373d] text-[#cccccc] border-[#3e3e42]'
              : 'bg-[#f3f3f3] hover:bg-[#e5e5e5] text-[#1f1f1f] border-[#d4d4d4]'
          }`}
        >
          {isDark ? (
            <Sun className="w-3.5 h-3.5 text-[#e5b567]" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-[#007acc]" />
          )}
        </button>
      </div>
    </header>
  );
};
