import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import ImageDefault, { DEFAULT_IMAGE_FALLBACK_SRC, Image } from "./image";

describe("Image", () => {
  it("renders with img role and alt", () => {
    render(<Image src="/photo.jpg" alt="Lake" />);
    const img = screen.getByRole("img", { name: "Lake" });
    expect(img).toHaveAttribute("src", "/photo.jpg");
  });

  it("uses two imgs when preview open (one decorative)", () => {
    render(
      <Image src="/full.jpg" alt="Card" previewSrc="/tiny.jpg" showPreview />,
    );
    expect(screen.getByRole("img", { name: "Card" })).toBeInTheDocument();
    expect(document.querySelectorAll("img")).toHaveLength(2);
  });

  it("row width class with fullWidth", () => {
    render(<Image src="/x.jpg" alt="X" fullWidth />);
    expect(screen.getByRole("img", { name: "X" }).className).toMatch(/w-full/);
  });

  it("previewModal adds trigger button", () => {
    render(
      <Image
        src="/a.jpg"
        alt="Photo"
        previewModal
        previewModalAriaLabel="Enlarge"
      />,
    );
    expect(screen.getByRole("button", { name: "Enlarge" })).toBeInTheDocument();
  });

  it("previewModal uses blurred lightbox backdrop when open", async () => {
    const user = userEvent.setup();
    render(
      <Image
        src="/a.jpg"
        alt="Photo"
        previewModal
        previewModalAriaLabel="Enlarge"
      />,
    );
    await user.click(screen.getByRole("button", { name: "Enlarge" }));
    const dismiss = screen.getByRole("button", { name: "Dismiss" });
    expect(dismiss.className).toMatch(/backdrop-blur/);
  });

  it("previewModal: no zoom/close buttons; image inside dialog", async () => {
    const user = userEvent.setup();
    render(
      <Image
        src="/a.jpg"
        alt="Photo"
        previewModal
        previewModalAriaLabel="Enlarge"
      />,
    );
    await user.click(screen.getByRole("button", { name: "Enlarge" }));
    const dialog = screen.getByRole("dialog");
    const modalImg = within(dialog).getByRole("img", { name: "Photo" });
    fireEvent.load(modalImg);
    expect(
      within(dialog).queryByRole("button", { name: "Zoom in" }),
    ).not.toBeInTheDocument();
    expect(
      within(dialog).queryByRole("button", { name: "Close" }),
    ).not.toBeInTheDocument();
  });

  it("previewModal immersive: no title bar, frameless image", async () => {
    const user = userEvent.setup();
    render(
      <Image
        src="/a.jpg"
        alt="Photo"
        previewModal
        previewModalImmersive
        previewModalAriaLabel="Enlarge"
      />,
    );
    await user.click(screen.getByRole("button", { name: "Enlarge" }));
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-label", "Photo");
    expect(within(dialog).queryByRole("heading")).not.toBeInTheDocument();
    const modalImg = within(dialog).getByRole("img", { name: "Photo" });
    fireEvent.load(modalImg);
    expect(modalImg.className).not.toMatch(/rounded-xl/);
    expect(modalImg.className).not.toMatch(/ring-1/);
    expect(
      within(dialog).queryByRole("button", { name: "Close" }),
    ).not.toBeInTheDocument();
    expect(
      within(dialog).queryByRole("button", { name: "Zoom in" }),
    ).not.toBeInTheDocument();
  });

  it("previewModal immersive: closes on grid gap tap (not on image)", async () => {
    const user = userEvent.setup();
    render(
      <Image
        src="/a.jpg"
        alt="Photo"
        previewModal
        previewModalImmersive
        previewModalAriaLabel="Enlarge"
      />,
    );
    await user.click(screen.getByRole("button", { name: "Enlarge" }));
    const dialog = screen.getByRole("dialog");
    const modalImg = within(dialog).getByRole("img", { name: "Photo" });
    fireEvent.load(modalImg);
    const grid = dialog.querySelector('[role="presentation"]');
    expect(grid).toBeTruthy();
    fireEvent.click(grid!);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Enlarge" }));
    const dialog2 = screen.getByRole("dialog");
    const modalImg2 = within(dialog2).getByRole("img", { name: "Photo" });
    fireEvent.load(modalImg2);
    fireEvent.click(modalImg2);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("exports default fallback data URI", () => {
    expect(DEFAULT_IMAGE_FALLBACK_SRC.startsWith("data:image/svg+xml")).toBe(
      true,
    );
  });

  it("default export matches named component", () => {
    expect(ImageDefault).toBe(Image);
  });
});
