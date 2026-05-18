import { logger } from "@/lib/logger";
import { resolveFilesystemLocation } from "./path";
import type {
  FilesystemDirectory,
  FilesystemEncoding,
  FilesystemProviderConfig,
  FilesystemReaddirEntry,
  FilesystemScopedReadOptions,
  FilesystemScopedWriteOptions,
} from "./types";

export type FilesystemPluginBundle = {
  Filesystem: typeof import("@capacitor/filesystem").Filesystem;
  Directory: typeof import("@capacitor/filesystem").Directory;
  Encoding: typeof import("@capacitor/filesystem").Encoding;
};

let pluginChecked = false;
let pluginAvailable = false;

export async function isFilesystemAvailable(): Promise<boolean> {
  if (pluginChecked) return pluginAvailable;
  pluginChecked = true;
  try {
    const mod = await import("@capacitor/filesystem");
    pluginAvailable = Boolean(mod.Filesystem?.readFile);
  } catch {
    pluginAvailable = false;
    logger.debug("Filesystem plugin not available");
  }
  return pluginAvailable;
}

export async function loadFilesystemPlugin(): Promise<FilesystemPluginBundle> {
  if (!(await isFilesystemAvailable())) {
    throw new Error(
      "Filesystem is unavailable — install @capacitor/filesystem and run cap sync.",
    );
  }
  const mod = await import("@capacitor/filesystem");
  return {
    Filesystem: mod.Filesystem,
    Directory: mod.Directory,
    Encoding: mod.Encoding,
  };
}

const DIRECTORY_KEY: Record<
  FilesystemDirectory,
  keyof FilesystemPluginBundle["Directory"]
> = {
  DOCUMENTS: "Documents",
  DATA: "Data",
  LIBRARY: "Library",
  CACHE: "Cache",
  EXTERNAL: "External",
  EXTERNAL_STORAGE: "ExternalStorage",
  TEMPORARY: "Temporary",
};

const ENCODING_KEY: Record<
  FilesystemEncoding,
  keyof FilesystemPluginBundle["Encoding"]
> = {
  utf8: "UTF8",
  ascii: "ASCII",
  utf16: "UTF16",
};

function mapDirectory(
  directory: FilesystemDirectory | undefined,
  Directory: FilesystemPluginBundle["Directory"],
): (typeof Directory)[keyof typeof Directory] | undefined {
  if (!directory) return undefined;
  return Directory[DIRECTORY_KEY[directory]];
}

function mapEncoding(
  encoding: FilesystemEncoding | undefined,
  Encoding: FilesystemPluginBundle["Encoding"],
): (typeof Encoding)[keyof typeof Encoding] | undefined {
  if (!encoding) return undefined;
  return Encoding[ENCODING_KEY[encoding]];
}

export async function filesystemCheckPermissions(): Promise<
  import("@capacitor/filesystem").PermissionStatus
> {
  const { Filesystem } = await loadFilesystemPlugin();
  return Filesystem.checkPermissions();
}

export async function filesystemRequestPermissions(): Promise<
  import("@capacitor/filesystem").PermissionStatus
> {
  const { Filesystem } = await loadFilesystemPlugin();
  return Filesystem.requestPermissions();
}

export async function filesystemReadText(
  config: FilesystemProviderConfig,
  path: string,
  options?: FilesystemScopedReadOptions,
): Promise<string> {
  const { Filesystem, Directory, Encoding } = await loadFilesystemPlugin();
  const loc = resolveFilesystemLocation(config, path, options?.directory);
  const result = await Filesystem.readFile({
    path: loc.path,
    directory: mapDirectory(loc.directory, Directory),
    encoding: mapEncoding(options?.encoding ?? "utf8", Encoding),
  });
  if (typeof result.data === "string") return result.data;
  throw new Error("readFile returned Blob; use readFileRaw for binary data.");
}

export async function filesystemWriteText(
  config: FilesystemProviderConfig,
  path: string,
  data: string,
  options?: FilesystemScopedWriteOptions,
): Promise<string> {
  const { Filesystem, Directory, Encoding } = await loadFilesystemPlugin();
  const loc = resolveFilesystemLocation(config, path, options?.directory);
  const result = await Filesystem.writeFile({
    path: loc.path,
    directory: mapDirectory(loc.directory, Directory),
    data,
    encoding: mapEncoding(options?.encoding ?? "utf8", Encoding),
    recursive: options?.recursive ?? true,
  });
  return result.uri;
}

export async function filesystemDelete(
  config: FilesystemProviderConfig,
  path: string,
  directory?: FilesystemDirectory,
): Promise<void> {
  const { Filesystem, Directory } = await loadFilesystemPlugin();
  const loc = resolveFilesystemLocation(config, path, directory);
  await Filesystem.deleteFile({
    path: loc.path,
    directory: mapDirectory(loc.directory, Directory),
  });
}

export async function filesystemMkdir(
  config: FilesystemProviderConfig,
  path: string,
  directory?: FilesystemDirectory,
  recursive = true,
): Promise<void> {
  const { Filesystem, Directory } = await loadFilesystemPlugin();
  const loc = resolveFilesystemLocation(config, path, directory);
  await Filesystem.mkdir({
    path: loc.path,
    directory: mapDirectory(loc.directory, Directory),
    recursive,
  });
}

export async function filesystemReaddir(
  config: FilesystemProviderConfig,
  path: string,
  directory?: FilesystemDirectory,
): Promise<FilesystemReaddirEntry[]> {
  const { Filesystem, Directory } = await loadFilesystemPlugin();
  const loc = resolveFilesystemLocation(config, path, directory);
  const result = await Filesystem.readdir({
    path: loc.path,
    directory: mapDirectory(loc.directory, Directory),
  });
  return result.files.map((f) => ({
    name: f.name,
    type: f.type,
    size: f.size,
    mtime: f.mtime,
    uri: f.uri,
  }));
}

export async function filesystemStat(
  config: FilesystemProviderConfig,
  path: string,
  directory?: FilesystemDirectory,
): Promise<FilesystemReaddirEntry> {
  const { Filesystem, Directory } = await loadFilesystemPlugin();
  const loc = resolveFilesystemLocation(config, path, directory);
  const info = await Filesystem.stat({
    path: loc.path,
    directory: mapDirectory(loc.directory, Directory),
  });
  return {
    name: info.name,
    type: info.type,
    size: info.size,
    mtime: info.mtime,
    uri: info.uri,
  };
}
