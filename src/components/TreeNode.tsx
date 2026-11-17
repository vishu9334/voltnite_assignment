import React from 'react';
import { ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import type { FileNode } from '../types/fileSystem';
import { getNodeIcon } from '../utils/iconMapper';

export interface TreeNodeProps {
  node: FileNode;
  expandedIds: Set<string>;
  loadingIds: Set<string>;
  selectedNode: FileNode | null;
  onToggleDirectory: (node: FileNode) => Promise<void> | void;
  onSelectNode: (node: FileNode) => Promise<void> | void;
  searchQuery: string;
  theme?: 'dark' | 'light';
}

/** Check whether a node or any of its loaded descendants matches the search query. */
function nodeMatchesSearch(node: FileNode, query: string): boolean {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return true;
  if (node.name.toLowerCase().includes(trimmed)) return true;
  if (node.kind === 'directory' && node.children) {
    return node.children.some((child) => nodeMatchesSearch(child, trimmed));
  }
  return false;
}

export const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  expandedIds,
  loadingIds,
  selectedNode,
  onToggleDirectory,
  onSelectNode,
  searchQuery,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const isDirectory = node.kind === 'directory';
  const isSelected = selectedNode?.id === node.id;
  const isLoading = loadingIds.has(node.id);

  const trimmedQuery = searchQuery.trim().toLowerCase();
  const matchesSelf = trimmedQuery.length > 0 && node.name.toLowerCase().includes(trimmedQuery);
  const hasMatchingChild =
    trimmedQuery.length > 0 &&
    isDirectory &&
    Boolean(node.children?.some((child) => nodeMatchesSearch(child, trimmedQuery)));

  // If search query is non-empty and neither this node nor its children match, omit from view
  if (trimmedQuery.length > 0 && !matchesSelf && !hasMatchingChild) {
    return null;
  }

  // Auto-expand directory when a child matches the search query
  const isExpanded =
    isDirectory && (expandedIds.has(node.id) || (trimmedQuery.length > 0 && hasMatchingChild));

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDirectory) {
      void onToggleDirectory(node);
    } else {
      void onSelectNode(node);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (isDirectory) {
        void onToggleDirectory(node);
      } else {
        void onSelectNode(node);
      }
    }
  };

  const renderHighlightedName = (name: string, query: string) => {
    if (!query) return name;
    const lowerName = name.toLowerCase();
    const index = lowerName.indexOf(query);
    if (index === -1) return name;

    const before = name.slice(0, index);
    const match = name.slice(index, index + query.length);
    const after = name.slice(index + query.length);

    return (
      <>
        {before}
        <span
          className={`font-semibold rounded-[2px] px-0.5 ${
            isDark ? 'bg-[#515c6b] text-[#ffffff]' : 'bg-[#ffe082] text-[#1f1f1f]'
          }`}
        >
          {match}
        </span>
        {after}
      </>
    );
  };

  return (
    <div className="flex flex-col select-none">
      {/* Tree Row */}
      <div
        role="treeitem"
        aria-expanded={isDirectory ? isExpanded : undefined}
        aria-selected={isSelected}
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        title={node.relativePath}
        style={{ paddingLeft: `${node.depth * 14 + 8}px` }}
        className={`group flex items-center h-[24px] pr-2 text-xs font-normal cursor-pointer transition-colors outline-none ${
          isSelected
            ? isDark
              ? 'bg-[#37373d] text-[#ffffff] font-medium'
              : 'bg-[#e4e6f1] text-[#1f1f1f] font-medium'
            : isDark
              ? 'text-[#cccccc] hover:bg-[#2a2d2e]'
              : 'text-[#1f1f1f] hover:bg-[#e8e8e8]'
        }`}
      >
        {/* Expand / Collapse Chevron or Spinner */}
        <div className="w-4 h-4 mr-0.5 flex items-center justify-center shrink-0">
          {isDirectory ? (
            isLoading ? (
              <Loader2
                className={`w-3.5 h-3.5 animate-spin ${isDark ? 'text-[#858585]' : 'text-[#616161]'}`}
              />
            ) : isExpanded ? (
              <ChevronDown
                className={`w-3.5 h-3.5 ${
                  isDark
                    ? 'text-[#858585] group-hover:text-[#cccccc]'
                    : 'text-[#616161] group-hover:text-[#1f1f1f]'
                }`}
              />
            ) : (
              <ChevronRight
                className={`w-3.5 h-3.5 ${
                  isDark
                    ? 'text-[#858585] group-hover:text-[#cccccc]'
                    : 'text-[#616161] group-hover:text-[#1f1f1f]'
                }`}
              />
            )
          ) : (
            <span className="w-3.5 h-3.5" aria-hidden="true" />
          )}
        </div>

        {/* Node Icon */}
        <div className="mr-1.5 flex items-center shrink-0">
          {getNodeIcon(node.name, node.kind, isExpanded)}
        </div>

        {/* Node Name */}
        <span className="truncate leading-none">
          {renderHighlightedName(node.name, trimmedQuery)}
        </span>
      </div>

      {/* Expanded Directory Children */}
      {isDirectory && isExpanded && (
        <div role="group" className="flex flex-col">
          {/* Empty Folder Notice */}
          {node.isLoaded && node.children?.length === 0 && (
            <div
              style={{ paddingLeft: `${(node.depth + 1) * 14 + 8}px` }}
              className={`h-[22px] flex items-center text-[11px] italic select-none ${
                isDark ? 'text-[#858585]' : 'text-[#616161]'
              }`}
            >
              Empty folder
            </div>
          )}

          {/* Child Nodes */}
          {node.children?.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              expandedIds={expandedIds}
              loadingIds={loadingIds}
              selectedNode={selectedNode}
              onToggleDirectory={onToggleDirectory}
              onSelectNode={onSelectNode}
              searchQuery={searchQuery}
              theme={theme}
            />
          ))}
        </div>
      )}
    </div>
  );
};
