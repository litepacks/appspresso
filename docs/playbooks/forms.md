# Forms: React Hook Form + Zod

Appspresso ships a thin **`appspresso/components/form`** layer that pairs with **`react-hook-form`** and **`@hookform/resolvers`** (Zod). Primitives like **`appspresso/components/ui/input`** stay `forwardRef`-compatible.

## Install (consumer)

Ensure peers are installed:

```bash
npm install react-hook-form @hookform/resolvers zod
```

(`zod` may already be pulled in via `appspresso`.)

## Minimal example

```tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "appspresso/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "appspresso/components/form";
import { Input } from "appspresso/components/ui/input";

const schema = z.object({
  email: z.string().email(),
});

export function SignInForm() {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(console.log)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Continue</Button>
      </form>
    </Form>
  );
}
```

## Switches and custom controls

Use **`Controller`** via **`FormField`**’s `render` prop and wire `checked` / `onCheckedChange` for **`Switch`** (or similar) instead of spreading `field` like an input.

## Related

- Motion page transitions: [`README.md`](../README.md) — Motion section.
- Do not stack conflicting CSS **`animate-in`** utilities on the same node as Motion-driven animations.
