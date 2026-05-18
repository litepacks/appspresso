import { render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import i18n from "@/i18n";
import Referral from "@/pages/Referral";

describe("Referral", () => {
  it("renders code from query string when present", () => {
    render(
      <MemoryRouter initialEntries={["/referral?code=ABC"]}>
        <I18nextProvider i18n={i18n}>
          <Referral />
        </I18nextProvider>
      </MemoryRouter>,
    );
    expect(screen.getByText("ABC")).toBeInTheDocument();
  });

  it("shows fallback when code is missing", () => {
    render(
      <MemoryRouter initialEntries={["/referral"]}>
        <I18nextProvider i18n={i18n}>
          <Referral />
        </I18nextProvider>
      </MemoryRouter>,
    );
    expect(screen.getByText(/no query parameter/i)).toBeInTheDocument();
  });
});
