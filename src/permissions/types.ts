export type AppPermission = "localNotifications" | "pushNotifications";

export type UnifiedPermissionStatus =
  | "granted"
  | "denied"
  | "prompt"
  | "unavailable";
