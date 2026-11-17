import React from 'react';
import {
  ChevronRight,
  FileText,
  Folder,
  HardDrive,
  Calendar,
  Layers,
  FileCode,
  Loader2,
  Lock,
  AlertTriangle,
} from 'lucide-react';
import type { FileNode, FileProperties } from '../types/fileSystem';
import { formatBytes, formatDate } from '../utils/formatters';
import { getNodeIcon } from '../utils/iconMapper';

export interface PropertiesPanelProps {
  selectedNode: FileNode | null;
  selectedProperties: FileProperties | null;
  isPropertiesLoading: boolean;
  theme?: 'dark' | 'light';
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedNode,
  selectedProperties,
  isPropertiesLoading,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';

  // Empty State: Nothing selected
  if (!selectedNode) {
    return (
      <main
        className={`flex-1 h-full flex flex-col items-center justify-center p-8 text-center select-none transition-colors ${
          isDark ? 'bg-[#1e1e1e] text-[#cccccc]' : 'bg-[#ffffff] text-[#1f1f1f]'
        }`}
      >
        <div
          className={`w-14 h-14 rounded-2xl border flex items-center justify-center mb-4 ${
            isDark
              ? 'bg-[#252526] border-[#333333] text-[#858585]'
              : 'bg-[#f3f3f3] border-[#e5e5e5] text-[#616161]'
          }`}
        >
          <FileText className={`w-7 h-7 ${isDark ? 'text-[#555555]' : 'text-[#888888]'}`} />
        </div>
        <h2
          className={`text-sm font-semibold mb-1.5 ${
            isDark ? 'text-[#cccccc]' : 'text-[#1f1f1f]'
          }`}
        >
          No Item Selected
        </h2>
        <p
          className={`text-xs max-w-sm leading-relaxed ${
            isDark ? 'text-[#858585]' : 'text-[#616161]'
          }`}
        >
          Select a file or folder in the Explorer to view its properties.
        </p>
      </main>
    );
  }

  // Split relative path into breadcrumb items
  const pathSegments = selectedNode.relativePath.split('/');

  return (
    <main
      className={`flex-1 h-full flex flex-col overflow-hidden transition-colors ${
        isDark ? 'bg-[#1e1e1e] text-[#cccccc]' : 'bg-[#ffffff] text-[#1f1f1f]'
      }`}
    >
      {/* Top Breadcrumb Bar */}
      <nav
        aria-label="Breadcrumb"
        className={`h-9 border-b px-4 flex items-center gap-1.5 text-xs overflow-x-auto shrink-0 select-none transition-colors ${
          isDark
            ? 'bg-[#1e1e1e] border-[#333333] text-[#858585]'
            : 'bg-[#ffffff] border-[#e5e5e5] text-[#616161]'
        }`}
      >
        {pathSegments.map((segment, index) => {
          const isLast = index === pathSegments.length - 1;
          return (
            <React.Fragment key={index}>
              {index > 0 && (
                <ChevronRight
                  className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-[#555555]' : 'text-[#a0a0a0]'}`}
                />
              )}
              <span
                className={`truncate flex items-center gap-1.5 ${
                  isLast
                    ? isDark
                      ? 'text-[#cccccc] font-medium'
                      : 'text-[#1f1f1f] font-medium'
                    : isDark
                      ? 'text-[#858585]'
                      : 'text-[#616161]'
                }`}
                title={segment}
              >
                {isLast && getNodeIcon(selectedNode.name, selectedNode.kind, false, 'w-3.5 h-3.5')}
                <span>{segment}</span>
              </span>
            </React.Fragment>
          );
        })}
      </nav>

      {/* Main Properties Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Loading Spinner for Properties */}
        {isPropertiesLoading ? (
          <div
            className={`flex flex-col items-center justify-center py-20 gap-3 ${
              isDark ? 'text-[#858585]' : 'text-[#616161]'
            }`}
          >
            <Loader2 className="w-6 h-6 animate-spin text-[#007acc]" />
            <span className="text-xs">Loading metadata...</span>
          </div>
        ) : selectedProperties ? (
          <>
            {/* Header Title & Read-Only Badge */}
            <div
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b ${
                isDark ? 'border-[#2d2d2d]' : 'border-[#e5e5e5]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`p-2.5 rounded-lg border shrink-0 ${
                    isDark
                      ? 'bg-[#252526] border-[#333333]'
                      : 'bg-[#f3f3f3] border-[#e5e5e5]'
                  }`}
                >
                  {getNodeIcon(
                    selectedProperties.name,
                    selectedProperties.kind,
                    false,
                    'w-7 h-7',
                  )}
                </div>
                <div className="min-w-0">
                  <h1
                    className={`text-base font-semibold truncate ${
                      isDark ? 'text-[#ffffff]' : 'text-[#1f1f1f]'
                    }`}
                    title={selectedProperties.name}
                  >
                    {selectedProperties.name}
                  </h1>
                  <span
                    className={`text-xs capitalize ${isDark ? 'text-[#858585]' : 'text-[#616161]'}`}
                  >
                    {selectedProperties.kind === 'directory' ? 'Folder' : 'File'}
                  </span>
                </div>
              </div>

              {/* Read-Only Badge */}
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] shrink-0 self-start sm:self-auto ${
                  isDark
                    ? 'bg-[#252526] border-[#3c3c3c] text-[#858585]'
                    : 'bg-[#f3f3f3] border-[#d4d4d4] text-[#616161]'
                }`}
              >
                <Lock className="w-3 h-3 text-[#007acc]" />
                <span>Read-Only Mode • Local File System Access API</span>
              </div>
            </div>

            {/* Subtle amber info notice when access is restricted (e.g. symlinks, OS/browser restrictions) */}
            {selectedProperties.readError && (
              <div
                role="status"
                className={`p-3 rounded-md border flex items-start gap-2.5 text-xs select-text ${
                  isDark
                    ? 'bg-[#332b00] border-[#665500] text-[#ffcc00]'
                    : 'bg-[#fff9e6] border-[#ffe082] text-[#855700]'
                }`}
              >
                <AlertTriangle
                  className={`w-4 h-4 mt-0.5 shrink-0 ${
                    isDark ? 'text-[#ffcc00]' : 'text-[#d97706]'
                  }`}
                />
                <div>
                  <div className="font-semibold mb-0.5">Access Restricted</div>
                  <div className={`leading-relaxed ${isDark ? 'text-[#e6c200]' : 'text-[#8c6200]'}`}>
                    {selectedProperties.readError}
                  </div>
                </div>
              </div>
            )}

            {/* Metadata Cards Grid */}
            <section aria-labelledby="metadata-heading">
              <h2
                id="metadata-heading"
                className={`text-xs font-semibold uppercase tracking-wider mb-3 ${
                  isDark ? 'text-[#858585]' : 'text-[#616161]'
                }`}
              >
                Details & Metadata
              </h2>

              {selectedProperties.kind === 'file' ? (
                /* File Metadata Cards */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div
                    className={`border p-3.5 rounded-md flex items-start gap-3 ${
                      isDark
                        ? 'bg-[#252526] border-[#333333]'
                        : 'bg-[#f8f8f8] border-[#e5e5e5]'
                    }`}
                  >
                    <FileCode className="w-4 h-4 text-[#007acc] mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <div className={`text-[11px] ${isDark ? 'text-[#858585]' : 'text-[#616161]'}`}>
                        Type / Extension
                      </div>
                      <div
                        className={`text-xs font-medium truncate mt-0.5 ${
                          isDark ? 'text-[#cccccc]' : 'text-[#1f1f1f]'
                        }`}
                      >
                        {selectedProperties.extension || 'No extension'}
                        {selectedProperties.mimeType ? ` (${selectedProperties.mimeType})` : ''}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`border p-3.5 rounded-md flex items-start gap-3 ${
                      isDark
                        ? 'bg-[#252526] border-[#333333]'
                        : 'bg-[#f8f8f8] border-[#e5e5e5]'
                    }`}
                  >
                    <Folder className="w-4 h-4 text-[#007acc] mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <div className={`text-[11px] ${isDark ? 'text-[#858585]' : 'text-[#616161]'}`}>
                        Relative Path
                      </div>
                      <div
                        className={`text-xs font-medium font-mono truncate mt-0.5 ${
                          isDark ? 'text-[#cccccc]' : 'text-[#1f1f1f]'
                        }`}
                        title={selectedProperties.relativePath}
                      >
                        {selectedProperties.relativePath}
                      </div>
                    </div>
                  </div>

                  {selectedProperties.size !== undefined && (
                    <div
                      className={`border p-3.5 rounded-md flex items-start gap-3 ${
                        isDark
                          ? 'bg-[#252526] border-[#333333]'
                          : 'bg-[#f8f8f8] border-[#e5e5e5]'
                      }`}
                    >
                      <HardDrive className="w-4 h-4 text-[#007acc] mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <div className={`text-[11px] ${isDark ? 'text-[#858585]' : 'text-[#616161]'}`}>
                          Size
                        </div>
                        <div
                          className={`text-xs font-medium mt-0.5 ${
                            isDark ? 'text-[#cccccc]' : 'text-[#1f1f1f]'
                          }`}
                        >
                          {formatBytes(selectedProperties.size)}{' '}
                          <span
                            className={`font-normal text-[11px] ${
                              isDark ? 'text-[#858585]' : 'text-[#616161]'
                            }`}
                          >
                            ({selectedProperties.size.toLocaleString()} bytes)
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedProperties.lastModified !== undefined && (
                    <div
                      className={`border p-3.5 rounded-md flex items-start gap-3 ${
                        isDark
                          ? 'bg-[#252526] border-[#333333]'
                          : 'bg-[#f8f8f8] border-[#e5e5e5]'
                      }`}
                    >
                      <Calendar className="w-4 h-4 text-[#007acc] mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <div className={`text-[11px] ${isDark ? 'text-[#858585]' : 'text-[#616161]'}`}>
                          Last Modified
                        </div>
                        <div
                          className={`text-xs font-medium mt-0.5 ${
                            isDark ? 'text-[#cccccc]' : 'text-[#1f1f1f]'
                          }`}
                        >
                          {formatDate(selectedProperties.lastModified)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Folder Metadata Cards */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div
                    className={`border p-3.5 rounded-md flex items-start gap-3 ${
                      isDark
                        ? 'bg-[#252526] border-[#333333]'
                        : 'bg-[#f8f8f8] border-[#e5e5e5]'
                    }`}
                  >
                    <Folder className="w-4 h-4 text-[#dcb67a] mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <div className={`text-[11px] ${isDark ? 'text-[#858585]' : 'text-[#616161]'}`}>
                        Folder Name
                      </div>
                      <div
                        className={`text-xs font-medium truncate mt-0.5 ${
                          isDark ? 'text-[#cccccc]' : 'text-[#1f1f1f]'
                        }`}
                      >
                        {selectedProperties.name}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`border p-3.5 rounded-md flex items-start gap-3 ${
                      isDark
                        ? 'bg-[#252526] border-[#333333]'
                        : 'bg-[#f8f8f8] border-[#e5e5e5]'
                    }`}
                  >
                    <Layers className="w-4 h-4 text-[#007acc] mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <div className={`text-[11px] ${isDark ? 'text-[#858585]' : 'text-[#616161]'}`}>
                        Relative Path
                      </div>
                      <div
                        className={`text-xs font-medium font-mono truncate mt-0.5 ${
                          isDark ? 'text-[#cccccc]' : 'text-[#1f1f1f]'
                        }`}
                        title={selectedProperties.relativePath}
                      >
                        {selectedProperties.relativePath}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`border p-3.5 rounded-md flex items-start gap-3 ${
                      isDark
                        ? 'bg-[#252526] border-[#333333]'
                        : 'bg-[#f8f8f8] border-[#e5e5e5]'
                    }`}
                  >
                    <FileText className="w-4 h-4 text-[#70a5fd] mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <div className={`text-[11px] ${isDark ? 'text-[#858585]' : 'text-[#616161]'}`}>
                        Immediate Files
                      </div>
                      <div
                        className={`text-xs font-medium mt-0.5 ${
                          isDark ? 'text-[#cccccc]' : 'text-[#1f1f1f]'
                        }`}
                      >
                        {(selectedProperties.fileCount ?? 0).toLocaleString()} files
                      </div>
                    </div>
                  </div>

                  <div
                    className={`border p-3.5 rounded-md flex items-start gap-3 ${
                      isDark
                        ? 'bg-[#252526] border-[#333333]'
                        : 'bg-[#f8f8f8] border-[#e5e5e5]'
                    }`}
                  >
                    <Folder className="w-4 h-4 text-[#dcb67a] mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <div className={`text-[11px] ${isDark ? 'text-[#858585]' : 'text-[#616161]'}`}>
                        Immediate Subfolders
                      </div>
                      <div
                        className={`text-xs font-medium mt-0.5 ${
                          isDark ? 'text-[#cccccc]' : 'text-[#1f1f1f]'
                        }`}
                      >
                        {(selectedProperties.folderCount ?? 0).toLocaleString()} subfolders
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Read-Only Preview Section */}
            {selectedProperties.kind === 'file' && !selectedProperties.readError && (
              <section aria-labelledby="preview-heading" className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h2
                    id="preview-heading"
                    className={`text-xs font-semibold uppercase tracking-wider ${
                      isDark ? 'text-[#858585]' : 'text-[#616161]'
                    }`}
                  >
                    File Preview
                  </h2>
                  <span className={`text-[11px] ${isDark ? 'text-[#858585]' : 'text-[#616161]'}`}>
                    Read-Only Mode
                  </span>
                </div>

                {selectedProperties.previewText !== undefined ? (
                  <div
                    className={`border rounded-md overflow-hidden ${
                      isDark ? 'bg-[#1e1e1e] border-[#333333]' : 'bg-[#f8f8f8] border-[#e5e5e5]'
                    }`}
                  >
                    <div
                      className={`px-3 py-1.5 border-b flex items-center justify-between text-[11px] ${
                        isDark
                          ? 'bg-[#252526] border-[#333333] text-[#858585]'
                          : 'bg-[#f0f0f0] border-[#e5e5e5] text-[#616161]'
                      }`}
                    >
                      <span className="font-mono truncate">{selectedProperties.name}</span>
                      <span>UTF-8</span>
                    </div>
                    <pre
                      className={`font-mono text-xs p-4 overflow-auto max-h-[420px] leading-relaxed select-text whitespace-pre tab-4 ${
                        isDark ? 'text-[#cccccc]' : 'text-[#1f1f1f]'
                      }`}
                    >
                      <code>{selectedProperties.previewText}</code>
                    </pre>
                  </div>
                ) : selectedProperties.previewImageUrl ? (
                  <div
                    className={`border rounded-md p-4 flex flex-col items-center justify-center ${
                      isDark ? 'bg-[#252526] border-[#333333]' : 'bg-[#f8f8f8] border-[#e5e5e5]'
                    }`}
                  >
                    <img
                      src={selectedProperties.previewImageUrl}
                      alt={selectedProperties.name}
                      className={`max-w-full max-h-[400px] object-contain rounded border shadow-sm ${
                        isDark
                          ? 'border-[#333333] bg-[#181818]'
                          : 'border-[#e5e5e5] bg-[#ffffff]'
                      }`}
                    />
                    <div
                      className={`mt-2 text-[11px] ${
                        isDark ? 'text-[#858585]' : 'text-[#616161]'
                      }`}
                    >
                      {selectedProperties.name} ({formatBytes(selectedProperties.size ?? 0)})
                    </div>
                  </div>
                ) : (
                  <div
                    className={`border rounded-md p-6 text-center ${
                      isDark
                        ? 'bg-[#252526] border-[#333333] text-[#858585]'
                        : 'bg-[#f8f8f8] border-[#e5e5e5] text-[#616161]'
                    }`}
                  >
                    <p className="text-xs">
                      No inline preview available for this file type or size.
                    </p>
                    <p
                      className={`text-[11px] mt-1 ${
                        isDark ? 'text-[#666666]' : 'text-[#888888]'
                      }`}
                    >
                      Text files up to 50 KB and images up to 5 MB are previewable.
                    </p>
                  </div>
                )}
              </section>
            )}
          </>
        ) : null}
      </div>
    </main>
  );
};
