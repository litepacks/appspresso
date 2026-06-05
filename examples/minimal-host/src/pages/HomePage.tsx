import { Button } from "appspresso/components/ui/button";
import { Page } from "appspresso/components/ui/page";
import { Text } from "appspresso/components/ui/text";

export function HomePage() {
  return (
    <Page title="Home">
      <Text variant="lead">Welcome to %%DISPLAY_NAME%%</Text>
      <Text className="mt-2 text-muted-foreground">
        Edit <code className="text-sm">src/pages/HomePage.tsx</code> and run{" "}
        <code className="text-sm">npm run dev</code>.
      </Text>
      <Button
        type="button"
        className="mt-4"
        onClick={() => window.location.reload()}
      >
        Reload
      </Button>
    </Page>
  );
}
