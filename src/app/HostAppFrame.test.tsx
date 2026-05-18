import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HostAppFrame } from "@/app/HostAppFrame";

describe("HostAppFrame", () => {
  it("renders children when hostBanner disabled", () => {
    render(
      <HostAppFrame host={{ hostBanner: { enabled: false } }}>
        <span>inside</span>
      </HostAppFrame>,
    );
    expect(screen.getByText("inside")).toBeInTheDocument();
  });

  it("shows banner when enabled with title and body", () => {
    render(
      <HostAppFrame
        host={{
          hostBanner: {
            enabled: true,
            title: "Demo",
            body: "Hello",
          },
        }}
      >
        <span>content</span>
      </HostAppFrame>,
    );
    expect(screen.getByText("Demo")).toBeInTheDocument();
    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getByText("content")).toBeInTheDocument();
  });
});
