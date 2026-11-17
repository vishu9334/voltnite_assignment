/** A tree entry. Directory children stay undefined until they are loaded. */
export interface FileNode {
  /** Unique path from the picked root, such as `root/src/App.tsx`. */
  id: string;
  name: string;
  kind: 'file' | 'directory';
  relativePath: string;
  depth: number;
  handle: FileSystemFileHandle | FileSystemDirectoryHandle;
  children?: FileNode[];
  /** True after a directory's immediate children have been fetched. */
  isLoaded?: boolean;
}

/** Metadata and optional lightweight preview for the selected entry. */
export interface FileProperties {
  name: string;
  kind: 'file' | 'directory';
  relativePath: string;
  extension?: string;
  mimeType?: string;
  size?: number;
  lastModified?: number;
  fileCount?: number;
  folderCount?: number;
  previewText?: string;
  /** Object URLs should be revoked when their preview is discarded. */
  previewImageUrl?: string;
  /** Set when file access is restricted by the OS or browser. */
  readError?: string;
}

declare global {
  interface Window {
    showDirectoryPicker(options?: { mode?: 'read' | 'readwrite' }): Promise<FileSystemDirectoryHandle>;
  }

  interface FileSystemDirectoryHandle {
    /** Iterate over immediate child handles without loading descendants. */
    values(): AsyncIterableIterator<FileSystemFileHandle | FileSystemDirectoryHandle>;
    entries(): AsyncIterableIterator<[string, FileSystemFileHandle | FileSystemDirectoryHandle]>;
  }
}
