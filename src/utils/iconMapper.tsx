import React from 'react';
import {
  Folder,
  FolderOpen,
  FileCode,
  FileJson,
  FileText,
  Image,
  FileType,
  File,
} from 'lucide-react';

/**
 * Return an authentic VS Code Dark+ styled icon for a file or directory node.
 *
 * @param name File or directory name with extension
 * @param kind 'file' | 'directory'
 * @param isExpanded Whether the directory is currently expanded in the tree
 * @param className Optional extra classes for sizing or positioning
 */
export function getNodeIcon(
  name: string,
  kind: 'file' | 'directory',
  isExpanded = false,
  className = 'w-4 h-4 shrink-0',
): React.ReactElement {
  if (kind === 'directory') {
    return isExpanded ? (
      <FolderOpen className={`${className} text-[#dcb67a]`} aria-hidden="true" />
    ) : (
      <Folder className={`${className} text-[#dcb67a]`} aria-hidden="true" />
    );
  }

  const lowerName = name.toLowerCase();
  const lastDot = lowerName.lastIndexOf('.');
  const extension = lastDot > 0 ? lowerName.slice(lastDot) : '';

  // TypeScript / JavaScript
  if (extension === '.ts' || extension === '.tsx') {
    return <FileCode className={`${className} text-[#388bfd]`} aria-hidden="true" />;
  }
  if (extension === '.js' || extension === '.jsx' || extension === '.mjs' || extension === '.cjs') {
    return <FileCode className={`${className} text-[#f1e05a]`} aria-hidden="true" />;
  }

  // Config and Data formats
  if (['.json', '.yml', '.yaml', '.toml', '.xml'].includes(extension)) {
    return <FileJson className={`${className} text-[#cb7832]`} aria-hidden="true" />;
  }

  // Documentation and Text
  if (['.md', '.markdown', '.txt', '.log'].includes(extension)) {
    return <FileText className={`${className} text-[#70a5fd]`} aria-hidden="true" />;
  }

  // Images and Vector Graphics
  if (['.png', '.jpg', '.jpeg', '.svg', '.gif', '.webp', '.ico', '.bmp'].includes(extension)) {
    return <Image className={`${className} text-[#bc8cff]`} aria-hidden="true" />;
  }

  // Styles and Markup
  if (['.css', '.scss', '.sass', '.less', '.html', '.htm'].includes(extension)) {
    return <FileType className={`${className} text-[#e37996]`} aria-hidden="true" />;
  }

  // Default Fallback
  return <File className={`${className} text-[#858585]`} aria-hidden="true" />;
}
