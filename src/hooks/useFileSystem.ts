import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getNodeProperties,
  pickRootDirectory,
  readDirectoryChildren,
} from '../services/fileSystemService';
import type { FileNode, FileProperties } from '../types/fileSystem';

/** Replace one directory without mutating any node in the existing tree. */
export function updateNodeInTree(
  root: FileNode,
  targetId: string,
  children: FileNode[],
): FileNode {
  if (root.id === targetId && root.kind === 'directory') {
    return { ...root, children, isLoaded: true };
  }
  const currentChildren = root.children;
  if (!currentChildren) return root;

  const updatedChildren = currentChildren.map((child) =>
    updateNodeInTree(child, targetId, children),
  );
  return updatedChildren.some((child, index) => child !== currentChildren[index])
    ? { ...root, children: updatedChildren }
    : root;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'A file system operation failed.';
}

export interface UseFileSystemResult {
  rootNode: FileNode | null;
  expandedIds: Set<string>;
  loadingIds: Set<string>;
  selectedNode: FileNode | null;
  selectedProperties: FileProperties | null;
  isPropertiesLoading: boolean;
  isRootLoading: boolean;
  error: string | null;
  searchQuery: string;
  openFolder: () => Promise<void>;
  toggleDirectory: (node: FileNode) => Promise<void>;
  selectNode: (node: FileNode) => Promise<void>;
  clearSelection: () => void;
  setSearchQuery: (query: string) => void;
}

/** Owns the explorer tree, selection, and temporary preview URL. */
export function useFileSystem(): UseFileSystemResult {
  const [rootNode, setRootNode] = useState<FileNode | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());
  const [loadingIds, setLoadingIds] = useState<Set<string>>(() => new Set());
  const [selectedNode, setSelectedNode] = useState<FileNode | null>(null);
  const [selectedProperties, setSelectedProperties] = useState<FileProperties | null>(null);
  const [isPropertiesLoading, setIsPropertiesLoading] = useState(false);
  const [isRootLoading, setIsRootLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const expandedIdsRef = useRef(expandedIds);
  const pendingDirectoryIdsRef = useRef(new Set<string>());
  const previewUrlRef = useRef<string | null>(null);
  const selectionVersionRef = useRef(0);
  const rootVersionRef = useRef(0);
  const pickerVersionRef = useRef(0);
  const mountedRef = useRef(true);

  const revokePreview = useCallback(() => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      selectionVersionRef.current += 1;
      rootVersionRef.current += 1;
      pickerVersionRef.current += 1;
      revokePreview();
    };
  }, [revokePreview]);

  const clearSelection = useCallback(() => {
    selectionVersionRef.current += 1;
    revokePreview();
    setSelectedNode(null);
    setSelectedProperties(null);
    setIsPropertiesLoading(false);
  }, [revokePreview]);

  const selectNode = useCallback(async (node: FileNode): Promise<void> => {
    const selectionVersion = ++selectionVersionRef.current;
    revokePreview();
    setSelectedNode(node);
    setSelectedProperties(null);
    setIsPropertiesLoading(true);
    setError(null);

    try {
      const properties = await getNodeProperties(node);
      if (!mountedRef.current || selectionVersion !== selectionVersionRef.current) {
        if (properties.previewImageUrl) URL.revokeObjectURL(properties.previewImageUrl);
        return;
      }
      previewUrlRef.current = properties.previewImageUrl ?? null;
      setSelectedProperties(properties);
    } catch (cause: unknown) {
      if (mountedRef.current && selectionVersion === selectionVersionRef.current) {
        setError(errorMessage(cause));
      }
    } finally {
      if (mountedRef.current && selectionVersion === selectionVersionRef.current) {
        setIsPropertiesLoading(false);
      }
    }
  }, [revokePreview]);

  const openFolder = useCallback(async (): Promise<void> => {
    const pickerVersion = ++pickerVersionRef.current;
    setIsRootLoading(true);
    try {
      const newRoot = await pickRootDirectory();
      // Closing the picker leaves the current explorer state as it was.
      if (!newRoot || !mountedRef.current || pickerVersion !== pickerVersionRef.current) return;

      const rootVersion = ++rootVersionRef.current;
      pendingDirectoryIdsRef.current = new Set([newRoot.id]);
      expandedIdsRef.current = new Set([newRoot.id]);
      clearSelection();
      setRootNode(newRoot);
      setExpandedIds(new Set(expandedIdsRef.current));
      setLoadingIds(new Set([newRoot.id]));
      setSearchQuery('');
      setError(null);
      void selectNode(newRoot);

      try {
        const children = await readDirectoryChildren(newRoot);
        if (!mountedRef.current || rootVersion !== rootVersionRef.current) return;
        const loadedRoot = updateNodeInTree(newRoot, newRoot.id, children);
        setRootNode(loadedRoot);
        setSelectedNode((current) => current?.id === newRoot.id ? loadedRoot : current);
      } catch (cause: unknown) {
        if (mountedRef.current && rootVersion === rootVersionRef.current) {
          setError(errorMessage(cause));
        }
      } finally {
        if (mountedRef.current && rootVersion === rootVersionRef.current) {
          pendingDirectoryIdsRef.current.delete(newRoot.id);
          setLoadingIds((current) => {
            const next = new Set(current);
            next.delete(newRoot.id);
            return next;
          });
        }
      }
    } catch (cause: unknown) {
      if (mountedRef.current && pickerVersion === pickerVersionRef.current) {
        setError(errorMessage(cause));
      }
    } finally {
      if (mountedRef.current && pickerVersion === pickerVersionRef.current) {
        setIsRootLoading(false);
      }
    }
  }, [clearSelection, selectNode]);

  const toggleDirectory = useCallback(async (node: FileNode): Promise<void> => {
    if (node.kind !== 'directory') return;
    void selectNode(node);

    const nextExpanded = new Set(expandedIdsRef.current);
    if (nextExpanded.has(node.id)) {
      nextExpanded.delete(node.id);
      expandedIdsRef.current = nextExpanded;
      setExpandedIds(nextExpanded);
      return;
    }

    nextExpanded.add(node.id);
    expandedIdsRef.current = nextExpanded;
    setExpandedIds(nextExpanded);
    if (node.isLoaded || pendingDirectoryIdsRef.current.has(node.id)) return;

    const rootVersion = rootVersionRef.current;
    pendingDirectoryIdsRef.current.add(node.id);
    setLoadingIds((current) => new Set(current).add(node.id));
    try {
      const children = await readDirectoryChildren(node);
      if (mountedRef.current && rootVersion === rootVersionRef.current) {
        setRootNode((current) => current && updateNodeInTree(current, node.id, children));
      }
    } catch (cause: unknown) {
      if (mountedRef.current && rootVersion === rootVersionRef.current) {
        setError(errorMessage(cause));
      }
    } finally {
      if (mountedRef.current && rootVersion === rootVersionRef.current) {
        pendingDirectoryIdsRef.current.delete(node.id);
        setLoadingIds((current) => {
          const next = new Set(current);
          next.delete(node.id);
          return next;
        });
      }
    }
  }, [selectNode]);

  return {
    rootNode, expandedIds, loadingIds, selectedNode, selectedProperties,
    isPropertiesLoading, isRootLoading, error, searchQuery,
    openFolder, toggleDirectory, selectNode, clearSelection, setSearchQuery,
  };
}
