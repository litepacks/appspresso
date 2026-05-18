import { render, screen } from "@testing-library/react";
import i18n from "appspresso/i18n";
import NotFound from "appspresso/pages/NotFound";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

describe("appspresso page (dist-lib)", () => {
  it("NotFound shows heading and home link", async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter>
          <NotFound />
        </MemoryRouter>
      </I18nextProvider>,
    );
    expect(await screen.findByRole("heading")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /home/i })).toBeInTheDocument();
  });
});
