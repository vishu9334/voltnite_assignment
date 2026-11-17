import React, { useState } from 'react';
import { AlertCircle, X, Sun, Moon } from 'lucide-react';
import { useFileSystem } from './hooks/useFileSystem';
import { Header } from './components/Header';
import { SidebarTree } from './components/SidebarTree';
import { PropertiesPanel } from './components/PropertiesPanel';

export const App: React.FC = () => {
  const {
    rootNode,
    expandedIds,
    loadingIds,
    selectedNode,
    selectedProperties,
    isPropertiesLoading,
    isRootLoading,
    error,
    searchQuery,
    openFolder,
    toggleDirectory,
    selectNode,
    clearSelection,
    setSearchQuery,
  } = useFileSystem();

  // Simple React state managing theme: default 'dark'
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const isDark = theme === 'dark';

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Track dismissed error message to allow manual dismiss while resurfacing new errors
  const [dismissedError, setDismissedError] = useState<string | null>(null);
  const activeError = error && error !== dismissedError ? error : null;

  return (
    <div
      data-theme={theme}
      className={`h-screen overflow-hidden flex flex-col font-sans antialiased transition-colors ${
        isDark ? 'bg-[#1e1e1e] text-[#cccccc]' : 'bg-[#ffffff] text-[#1f1f1f]'
      }`}
    >
      {/* Top VS Code Header with Theme Toggle */}
      <Header
        rootNode={rootNode}
        isRootLoading={isRootLoading}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        openFolder={openFolder}
        theme={theme}
        toggleTheme={toggleTheme}
        onToggleTheme={toggleTheme}
      />

      {/* Dismissible Error Banner */}
      {activeError && (
        <div
          role="alert"
          className={`border-b px-3 py-1.5 text-xs flex items-center justify-between shrink-0 select-none animate-fadeIn ${
            isDark
              ? 'bg-[#5a1d1d] text-[#f48771] border-[#be1100]'
              : 'bg-[#fde7e9] text-[#a80000] border-[#f3a8b0]'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <AlertCircle className="w-4 h-4 text-[#f48771] shrink-0" />
            <span className="truncate">{activeError}</span>
          </div>
          <button
            type="button"
            onClick={() => setDismissedError(error)}
            title="Dismiss error message"
            aria-label="Dismiss error message"
            className={`p-1 rounded transition-colors cursor-pointer shrink-0 ml-2 ${
              isDark
                ? 'hover:bg-[#7a2828] text-[#f48771] hover:text-white'
                : 'hover:bg-[#fcd0d5] text-[#a80000] hover:text-black'
            }`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main App Workspace: Sidebar + Properties Area */}
      <div className="flex-1 flex overflow-hidden">
        <SidebarTree
          rootNode={rootNode}
          expandedIds={expandedIds}
          loadingIds={loadingIds}
          selectedNode={selectedNode}
          isRootLoading={isRootLoading}
          searchQuery={searchQuery}
          theme={theme}
          onOpenFolder={openFolder}
          onToggleDirectory={toggleDirectory}
          onSelectNode={selectNode}
          onClearSelection={clearSelection}
        />

        <PropertiesPanel
          selectedNode={selectedNode}
          selectedProperties={selectedProperties}
          isPropertiesLoading={isPropertiesLoading}
          theme={theme}
        />
      </div>

      {/* Bottom VS Code Status Bar */}
      <footer className="h-5.5 bg-[#007acc] text-white text-[11px] px-3 flex items-center justify-between select-none shrink-0 font-sans">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-white opacity-90 inline-block" />
            <span>Local File System</span>
          </span>
          {rootNode && (
            <span className="hidden sm:inline opacity-90">
              Workspace: {rootNode.name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 opacity-90">
          {selectedNode && (
            <span className="hidden md:inline">
              Selected: {selectedNode.name}
            </span>
          )}
          {/* Quick theme trigger in status bar */}
          <button
            type="button"
            onClick={toggleTheme}
            title={isDark ? 'Switch to VS Code Light+ Theme' : 'Switch to VS Code Dark+ Theme'}
            className="flex items-center gap-1 hover:bg-[#0062a3] px-1 py-0.5 rounded transition-colors cursor-pointer"
          >
            {isDark ? (
              <Sun className="w-3 h-3 text-[#ffe082]" />
            ) : (
              <Moon className="w-3 h-3 text-white" />
            )}
            <span className="capitalize">{theme}+</span>
          </button>
          <span>UTF-8</span>
          <span className="hidden sm:inline">LF</span>
          <span>Read-Only</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
