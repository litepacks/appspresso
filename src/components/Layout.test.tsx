import { render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { createMemoryRouter, Outlet, RouterProvider } from "react-router-dom";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { RouteHandle } from "@/app/route-tree";
import { Layout } from "@/components/Layout";
import i18n from "@/i18n";

function shellRoute(handle: RouteHandle) {
  return {
    path: "/",
    element: <Layout />,
    children: [{ index: true, element: <div>page-body</div>, handle }],
  };
}

describe("Layout", () => {
  const origScrollIntoView = HTMLElement.prototype.scrollIntoView;

  beforeAll(() => {
    HTMLElement.prototype.scrollIntoView =
      vi.fn() as unknown as typeof origScrollIntoView;
  });

  afterAll(() => {
    HTMLElement.prototype.scrollIntoView = origScrollIntoView;
  });

  it("renders title from route handle and shows tab bar by default", () => {
    const router = createMemoryRouter(
      [shellRoute({ titleKey: "nav.settings" })],
      {
        initialEntries: ["/"],
      },
    );
    render(
      <I18nextProvider i18n={i18n}>
        <RouterProvider router={router} />
      </I18nextProvider>,
    );
    expect(screen.getByText("page-body")).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: /tab/i }),
    ).toBeInTheDocument();
  });

  it("hides tab bar when showTabBar false", () => {
    const router = createMemoryRouter(
      [
        {
          path: "/",
          element: <Layout />,
          children: [
            {
              index: true,
              element: <Outlet />,
              handle: {
                titleKey: "notifications.detailTitle",
                showTabBar: false,
              } satisfies RouteHandle,
            },
          ],
        },
      ],
      { initialEntries: ["/"] },
    );
    render(
      <I18nextProvider i18n={i18n}>
        <RouterProvider router={router} />
      </I18nextProvider>,
    );
    expect(
      screen.queryByRole("navigation", { name: /tab/i }),
    ).not.toBeInTheDocument();
  });
});
