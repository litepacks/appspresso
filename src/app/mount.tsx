import type { ComponentType } from "react";
import {
  type BootAppspressoHostOptions,
  bootAppspressoHost,
} from "@/app/mount-host";

export type BootAppspressoOptions = Partial<
  Omit<BootAppspressoHostOptions, "rootComponent">
> & {
  rootComponent?: ComponentType;
};

/**
 * Mount the full Appspresso template (router, providers, bootstrap).
 * `App` is loaded only when `rootComponent` is omitted.
 */
export async function bootAppspresso(
  options?: BootAppspressoOptions,
): Promise<void> {
  if (options?.rootComponent) {
    bootAppspressoHost(
      options as BootAppspressoHostOptions & { rootComponent: ComponentType },
    );
    return;
  }
  const { default: DefaultApp } = await import("./App");
  bootAppspressoHost({ ...options, rootComponent: DefaultApp });
}

export { bootAppspressoHost } from "@/app/mount-host";
export type { BootAppspressoHostOptions };
