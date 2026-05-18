import { createContext, type ReactNode, useCallback, useMemo } from "react";
import {
  filesystemCheckPermissions,
  filesystemDelete,
  filesystemMkdir,
  filesystemReaddir,
  filesystemReadText,
  filesystemRequestPermissions,
  filesystemStat,
  filesystemWriteText,
  isFilesystemAvailable,
  loadFilesystemPlugin,
} from "./filesystem.service";
import type {
  FilesystemDirectory,
  FilesystemProviderConfig,
  FilesystemReaddirEntry,
  FilesystemScopedReadOptions,
  FilesystemScopedWriteOptions,
} from "./types";

export type FilesystemCtx = {
  config: FilesystemProviderConfig;
  available: Promise<boolean>;
  readText: (
    path: string,
    options?: FilesystemScopedReadOptions,
  ) => Promise<string>;
  writeText: (
    path: string,
    data: string,
    options?: FilesystemScopedWriteOptions,
  ) => Promise<string>;
  deleteFile: (path: string, directory?: FilesystemDirectory) => Promise<void>;
  mkdir: (
    path: string,
    directory?: FilesystemDirectory,
    recursive?: boolean,
  ) => Promise<void>;
  readdir: (
    path: string,
    directory?: FilesystemDirectory,
  ) => Promise<FilesystemReaddirEntry[]>;
  stat: (
    path: string,
    directory?: FilesystemDirectory,
  ) => Promise<FilesystemReaddirEntry>;
  checkPermissions: typeof filesystemCheckPermissions;
  requestPermissions: typeof filesystemRequestPermissions;
  getPlugin: typeof loadFilesystemPlugin;
};

export const FilesystemContext = createContext<FilesystemCtx | null>(null);

export type FilesystemProviderProps = {
  children: ReactNode;
  /** Default directory and path prefix — `useFilesystem` applies to all operations. */
  config?: FilesystemProviderConfig;
};

const defaultConfig: FilesystemProviderConfig = {
  defaultDirectory: "DATA",
  basePath: "appspresso",
};

export function FilesystemProvider({
  children,
  config: configProp,
}: FilesystemProviderProps) {
  const config = useMemo(
    () => ({ ...defaultConfig, ...configProp }),
    [configProp],
  );

  const readText = useCallback(
    (path: string, options?: FilesystemScopedReadOptions) =>
      filesystemReadText(config, path, options),
    [config],
  );

  const writeText = useCallback(
    (path: string, data: string, options?: FilesystemScopedWriteOptions) =>
      filesystemWriteText(config, path, data, options),
    [config],
  );

  const deleteFile = useCallback(
    (path: string, directory?: FilesystemDirectory) =>
      filesystemDelete(config, path, directory),
    [config],
  );

  const mkdir = useCallback(
    (path: string, directory?: FilesystemDirectory, recursive = true) =>
      filesystemMkdir(config, path, directory, recursive),
    [config],
  );

  const readdir = useCallback(
    (path: string, directory?: FilesystemDirectory) =>
      filesystemReaddir(config, path, directory),
    [config],
  );

  const stat = useCallback(
    (path: string, directory?: FilesystemDirectory) =>
      filesystemStat(config, path, directory),
    [config],
  );

  const value = useMemo<FilesystemCtx>(
    () => ({
      config,
      available: isFilesystemAvailable(),
      readText,
      writeText,
      deleteFile,
      mkdir,
      readdir,
      stat,
      checkPermissions: filesystemCheckPermissions,
      requestPermissions: filesystemRequestPermissions,
      getPlugin: loadFilesystemPlugin,
    }),
    [config, readText, writeText, deleteFile, mkdir, readdir, stat],
  );

  return (
    <FilesystemContext.Provider value={value}>
      {children}
    </FilesystemContext.Provider>
  );
}
