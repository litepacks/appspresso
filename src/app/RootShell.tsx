import { Outlet } from "react-router-dom";
import { AppLifecycleSync } from "@/app/AppLifecycleSync";
import { DeepLinkSync } from "@/app/DeepLinkSync";
import { RouteSync } from "@/app/RouteSync";

export function RootShell() {
  return (
    <>
      <AppLifecycleSync />
      <RouteSync />
      <DeepLinkSync />
      <Outlet />
    </>
  );
}
