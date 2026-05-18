import { render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import i18n from "@/i18n";
import NotFound from "@/pages/NotFound";

describe("NotFound page", () => {
  it("shows not-found copy and home link", () => {
    render(
      <MemoryRouter>
        <I18nextProvider i18n={i18n}>
          <NotFound />
        </I18nextProvider>
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /home/i })).toHaveAttribute(
      "href",
      "/",
    );
  });
});
