import { authModule } from "@appspresso/module-auth";
import { onboardingModule } from "@appspresso/module-onboarding";
import { settingsModule } from "@appspresso/module-settings";

export const modules = [
  onboardingModule(),
  authModule(),
  settingsModule({ showDebugSection: true }),
];
