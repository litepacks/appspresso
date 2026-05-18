import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type SearchInputProps = Omit<
  React.ComponentPropsWithoutRef<typeof Input>,
  "className" | "type"
> & {
  className?: string;
  inputClassName?: string;
  /**
   * Browser suggestion list (`<datalist>`). If empty / omitted, `list` is not attached.
   * Most browsers filter options as you type.
   */
  suggestions?: readonly string[];
  /** `datalist` `id` when `suggestions` is set; consumes `useId` if omitted */
  datalistId?: string;
};

/**
 * Search field with magnifier on the left, matching app-wide pill `Input` style.
 * Optional local autocomplete via `suggestions` (`list` + `<datalist>`).
 */
const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      className,
      inputClassName,
      autoComplete = "off",
      suggestions,
      datalistId: datalistIdProp,
      ...props
    },
    ref,
  ) => {
    const genId = React.useId();
    const datalistId = datalistIdProp ?? genId;
    const hasSuggestions = suggestions != null && suggestions.length > 0;

    return (
      <div className={cn("relative w-full min-w-0", className)}>
        <MagnifyingGlassIcon
          className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          ref={ref}
          type="search"
          autoComplete={autoComplete}
          list={hasSuggestions ? datalistId : undefined}
          className={cn(
            "pl-10 [&::-webkit-search-cancel-button]:appearance-none",
            inputClassName,
          )}
          {...props}
        />
        {hasSuggestions ? (
          <datalist id={datalistId}>
            {suggestions.map((value, i) => (
              <option
                // Index needed for duplicate labels; datalist options are ordered.
                /* biome-ignore lint/suspicious/noArrayIndexKey: duplicate value */
                key={`${i}-${value}`}
                value={value}
              />
            ))}
          </datalist>
        ) : null}
      </div>
    );
  },
);
SearchInput.displayName = "SearchInput";

export { SearchInput };
