import type { FileNode, FileProperties } from '../types/fileSystem';
import {
  getFileExtension,
  isImagePreviewable,
  isTextPreviewable,
} from '../utils/formatters';

const MAX_TEXT_PREVIEW_BYTES = 50 * 1024;
const MAX_IMAGE_PREVIEW_BYTES = 5 * 1024 * 1024;
const MAX_TEXT_PREVIEW_CHARACTERS = 2000;

/** The picker is available only in supported, secure browser contexts. */
export function isFileSystemAccessSupported(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
}

/** Ask for read access to a folder; picker cancellation is an ordinary result. */
export async function pickRootDirectory(): Promise<FileNode | null> {
  if (!isFileSystemAccessSupported()) {
    throw new Error('Folder access is not supported in this browser.');
  }

  try {
    const handle = await window.showDirectoryPicker({ mode: 'read' });
    return {
      id: handle.name,
      name: handle.name,
      kind: 'directory',
      relativePath: handle.name,
      depth: 0,
      handle,
      isLoaded: false,
    };
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return null;
    }

    if (error instanceof DOMException && error.name === 'NotAllowedError') {
      throw new Error('Permission to open this folder was denied.', { cause: error });
    }

    throw new Error('Could not open the selected folder.', { cause: error });
  }
}

/** Fetch one level of the tree, leaving nested directories unloaded. */
export async function readDirectoryChildren(dirNode: FileNode): Promise<FileNode[]> {
  if (dirNode.kind !== 'directory') {
    throw new Error('Cannot read children of a file.');
  }

  const children: FileNode[] = [];
  for await (const entry of (dirNode.handle as FileSystemDirectoryHandle).values()) {
    const relativePath = `${dirNode.relativePath}/${entry.name}`;
    children.push({
      id: relativePath,
      name: entry.name,
      kind: entry.kind,
      relativePath,
      depth: dirNode.depth + 1,
      handle: entry,
      ...(entry.kind === 'directory' ? { isLoaded: false } : {}),
    });
  }

  // VS Code-style sorting: folders first, then names without case distinctions.
  return children.sort((left, right) => {
    if (left.kind !== right.kind) return left.kind === 'directory' ? -1 : 1;
    return left.name.localeCompare(right.name, undefined, { sensitivity: 'base' }) ||
      left.name.localeCompare(right.name);
  });
}

/** Read metadata and an optional small preview for one entry. */
export async function getNodeProperties(node: FileNode): Promise<FileProperties> {
  const properties: FileProperties = {
    name: node.name,
    kind: node.kind,
    relativePath: node.relativePath,
  };

  if (node.kind === 'file') {
    try {
      const file = await (node.handle as FileSystemFileHandle).getFile();
      properties.extension = getFileExtension(node.name);
      properties.mimeType = file.type;
      properties.size = file.size;
      properties.lastModified = file.lastModified;

      if (isTextPreviewable(node.name) && file.size <= MAX_TEXT_PREVIEW_BYTES) {
        properties.previewText = (await file.text()).slice(0, MAX_TEXT_PREVIEW_CHARACTERS);
      }
      if (isImagePreviewable(node.name) && file.size <= MAX_IMAGE_PREVIEW_BYTES) {
        // The caller owns this URL and should revoke it when the preview is discarded.
        properties.previewImageUrl = URL.createObjectURL(file);
      }

      return properties;
    } catch {
      return {
        name: node.name,
        kind: 'file',
        relativePath: node.relativePath,
        extension: getFileExtension(node.name),
        readError:
          'File content/metadata restricted by OS or browser (e.g., symlink or cloud-synced file).',
      };
    }
  }

  let fileCount = 0;
  let folderCount = 0;
  for await (const entry of (node.handle as FileSystemDirectoryHandle).values()) {
    if (entry.kind === 'file') fileCount += 1;
    else folderCount += 1;
  }
  properties.fileCount = fileCount;
  properties.folderCount = folderCount;
  return properties;
}
