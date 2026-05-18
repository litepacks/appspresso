import { render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { describe, expect, it } from "vitest";
import { LoadingFallback } from "@/components/LoadingFallback";
import i18n from "@/i18n";

describe("LoadingFallback", () => {
  it("renders loading copy", () => {
    render(
      <I18nextProvider i18n={i18n}>
        <LoadingFallback />
      </I18nextProvider>,
    );
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });
});
