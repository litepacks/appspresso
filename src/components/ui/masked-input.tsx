import * as React from "react";
import { IMaskInput, type IMaskInputProps } from "react-imask";
import { mergeRefs } from "@/lib/merge-refs";
import { cn } from "@/lib/utils";

export type MaskedInputProps = IMaskInputProps<HTMLInputElement>;

const maskedInputClassName =
  "flex h-11 w-full rounded-full border-0 bg-muted px-4 py-2 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/**
 * Same look as `Input` component; [`imask`](https://imask.js.org/) masks.
 * e.g. in patterns `0` is a digit placeholder: `"(000) 000-0000"`, `"0000-0000-0000-0000"`.
 * Extra ref merged via `inputRef`; `react-hook-form` `register` receives `ref` directly.
 */
export const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ className, type = "text", inputRef, ...props }, ref) => (
    <IMaskInput
      type={type}
      className={cn(maskedInputClassName, className)}
      inputRef={mergeRefs(ref, inputRef)}
      {...props}
    />
  ),
);
MaskedInput.displayName = "MaskedInput";

export default MaskedInput;
