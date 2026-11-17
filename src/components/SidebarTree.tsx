import React from 'react';
import {
  AlertTriangle,
  FolderOpen,
  Loader2,
  X,
  FolderX,
  ChevronDown,
} from 'lucide-react';
import { isFileSystemAccessSupported } from '../services/fileSystemService';
import type { FileNode } from '../types/fileSystem';
import { TreeNode } from './TreeNode';

export interface SidebarTreeProps {
  rootNode: FileNode | null;
  expandedIds: Set<string>;
  loadingIds: Set<string>;
  selectedNode: FileNode | null;
  isRootLoading: boolean;
  searchQuery: string;
  theme?: 'dark' | 'light';
  onOpenFolder: () => Promise<void>;
  onToggleDirectory: (node: FileNode) => Promise<void>;
  onSelectNode: (node: FileNode) => Promise<void>;
  onClearSelection: () => void;
}

export const SidebarTree: React.FC<SidebarTreeProps> = ({
  rootNode,
  expandedIds,
  loadingIds,
  selectedNode,
  isRootLoading,
  searchQuery,
  theme = 'dark',
  onOpenFolder,
  onToggleDirectory,
  onSelectNode,
  onClearSelection,
}) => {
  const isSupported = isFileSystemAccessSupported();
  const isDark = theme === 'dark';

  return (
    <aside
      className={`w-80 h-full border-r flex flex-col select-none shrink-0 overflow-hidden transition-colors ${
        isDark ? 'bg-[#252526] border-[#333333] text-[#cccccc]' : 'bg-[#f3f3f3] border-[#e5e5e5] text-[#1f1f1f]'
      }`}
    >
      {/* Sidebar Section Header */}
      <div
        className={`h-7 px-3 flex items-center justify-between border-b shrink-0 transition-colors ${
          isDark ? 'bg-[#252526] border-[#2d2d2d]' : 'bg-[#f3f3f3] border-[#e5e5e5]'
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <ChevronDown
            className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-[#858585]' : 'text-[#616161]'}`}
          />
          <span
            className={`text-[11px] font-bold uppercase tracking-wider truncate ${
              isDark ? 'text-[#cccccc]' : 'text-[#1f1f1f]'
            }`}
          >
            {rootNode ? rootNode.name : 'Folders'}
          </span>
        </div>

        {/* Clear Selection Button */}
        {selectedNode && (
          <button
            type="button"
            onClick={onClearSelection}
            title="Clear selection"
            aria-label="Clear selection"
            className={`flex items-center gap-1 text-[11px] px-1 py-0.5 rounded transition-colors cursor-pointer ${
              isDark
                ? 'text-[#858585] hover:text-[#cccccc] hover:bg-[#333333]'
                : 'text-[#616161] hover:text-[#1f1f1f] hover:bg-[#e0e0e0]'
            }`}
          >
            <X className="w-3 h-3" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* State 1: Browser Unsupported */}
        {!isSupported ? (
          <div className="p-4 flex flex-col items-center text-center justify-center h-full text-xs">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${
                isDark ? 'bg-[#3a2e1d]' : 'bg-[#fff4ce]'
              }`}
            >
              <AlertTriangle className="w-5 h-5 text-[#cca700]" />
            </div>
            <h3
              className={`font-semibold mb-1 ${
                isDark ? 'text-[#cccccc]' : 'text-[#1f1f1f]'
              }`}
            >
              Browser Unsupported
            </h3>
            <p
              className={`text-xs leading-relaxed mb-3 ${
                isDark ? 'text-[#858585]' : 'text-[#616161]'
              }`}
            >
              The File System Access API is not supported in this browser.
            </p>
            <div
              className={`p-2.5 rounded border text-[11px] leading-normal text-left ${
                isDark
                  ? 'bg-[#1e1e1e] border-[#3c3c3c] text-[#858585]'
                  : 'bg-[#ffffff] border-[#cecece] text-[#616161]'
              }`}
            >
              Please open this app in{' '}
              <span className={`font-medium ${isDark ? 'text-[#cccccc]' : 'text-[#1f1f1f]'}`}>
                Google Chrome
              </span>
              ,{' '}
              <span className={`font-medium ${isDark ? 'text-[#cccccc]' : 'text-[#1f1f1f]'}`}>
                Microsoft Edge
              </span>
              , or another Chromium-based desktop browser.
            </div>
          </div>
        ) : isRootLoading ? (
          /* State 2: Root Folder Loading */
          <div
            className={`flex-1 flex flex-col items-center justify-center p-4 gap-2 ${
              isDark ? 'text-[#858585]' : 'text-[#616161]'
            }`}
          >
            <Loader2 className="w-5 h-5 animate-spin text-[#007acc]" />
            <span className="text-xs">Reading folder contents...</span>
          </div>
        ) : !rootNode ? (
          /* State 3: No Folder Selected */
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div
              className={`w-12 h-12 rounded-lg border flex items-center justify-center mb-3 ${
                isDark
                  ? 'bg-[#1e1e1e] border-[#333333] text-[#858585]'
                  : 'bg-[#ffffff] border-[#e5e5e5] text-[#616161]'
              }`}
            >
              <FolderOpen className="w-6 h-6" />
            </div>
            <p
              className={`text-xs mb-4 max-w-[200px] leading-relaxed ${
                isDark ? 'text-[#858585]' : 'text-[#616161]'
              }`}
            >
              No folder is currently open. Select a local folder to browse its files.
            </p>
            <button
              type="button"
              onClick={() => void onOpenFolder()}
              className="px-3 py-1.5 bg-[#007acc] hover:bg-[#0098ff] text-white rounded text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Open Folder</span>
            </button>
          </div>
        ) : rootNode.isLoaded && rootNode.children?.length === 0 ? (
          /* State 4: Root Folder is Empty */
          <div
            className={`flex-1 flex flex-col items-center justify-center p-6 text-center ${
              isDark ? 'text-[#858585]' : 'text-[#616161]'
            }`}
          >
            <FolderX className={`w-8 h-8 mb-2 ${isDark ? 'text-[#555555]' : 'text-[#a0a0a0]'}`} />
            <p
              className={`text-xs font-medium mb-1 ${
                isDark ? 'text-[#cccccc]' : 'text-[#1f1f1f]'
              }`}
            >
              This folder is empty
            </p>
            <p className="text-[11px] max-w-[220px]">
              No files or subdirectories were found inside this directory.
            </p>
          </div>
        ) : (
          /* State 5: Active Tree View */
          <div
            role="tree"
            aria-label="File Explorer"
            className="flex-1 overflow-y-auto overflow-x-hidden py-1"
          >
            <TreeNode
              node={rootNode}
              expandedIds={expandedIds}
              loadingIds={loadingIds}
              selectedNode={selectedNode}
              onToggleDirectory={onToggleDirectory}
              onSelectNode={onSelectNode}
              searchQuery={searchQuery}
              theme={theme}
            />
          </div>
        )}
      </div>
    </aside>
  );
};
