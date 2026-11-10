// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/react";
import { VehicleGallery } from "@/components/shared/VehicleGallery";

afterEach(cleanup);

function makeImages(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    url: `https://images.autofunds.net/InventoryImages/2026/04/29/photo_${i + 1}.jpg`,
    alt: `2024 Honda Civic Si photo ${i + 1}`,
    isPrimary: i === 0,
  }));
}

describe("VehicleGallery", () => {
  it("renders the main image, thumbnails, and photo count", () => {
    const { container, getByText } = render(
      <VehicleGallery images={makeImages(4)} vehicleTitle="2024 Honda Civic Si" />
    );
    expect(getByText("1 / 4 photos")).toBeTruthy();
    // main + 4 thumbnails
    expect(container.querySelectorAll("img").length).toBe(5);
  });

  it("handles a vehicle with 41 valid photos", () => {
    const { getByText, getAllByRole } = render(
      <VehicleGallery images={makeImages(41)} vehicleTitle="2024 Honda Civic Si" />
    );
    expect(getByText("1 / 41 photos")).toBeTruthy();
    expect(getAllByRole("button", { name: /^Show photo \d+$/ }).length).toBe(41);
  });

  it("replaces a failed main image with a placeholder, keeping count and navigation", () => {
    const { container, getByText, queryAllByTestId } = render(
      <VehicleGallery images={makeImages(4)} vehicleTitle="2024 Honda Civic Si" />
    );
    const mainImg = container.querySelector("img")!;
    fireEvent.error(mainImg);

    // Failed slots render placeholders (main + its thumbnail), never a broken <img>.
    expect(queryAllByTestId("gallery-image-fallback").length).toBe(2);
    expect(getByText("1 / 4 photos")).toBeTruthy();
    // Other thumbnails are still real images.
    expect(container.querySelectorAll("img").length).toBe(3);
  });

  it("navigating to a healthy image after a failure shows the image again", () => {
    const { container, getByText, getByRole } = render(
      <VehicleGallery images={makeImages(3)} vehicleTitle="2024 Honda Civic Si" />
    );
    fireEvent.error(container.querySelector("img")!);
    fireEvent.click(getByRole("button", { name: "Show photo 2" }));
    expect(getByText("2 / 3 photos")).toBeTruthy();
    // Main slot shows image 2 (healthy): total imgs = main + 2 healthy thumbs
    expect(container.querySelectorAll("img").length).toBe(3);
  });

  it("failed thumbnails render placeholder tiles", () => {
    const { container, queryAllByTestId } = render(
      <VehicleGallery images={makeImages(3)} vehicleTitle="2024 Honda Civic Si" />
    );
    const imgs = container.querySelectorAll("img");
    // imgs[0] is the main image; imgs[1..] are thumbnails
    fireEvent.error(imgs[2]);
    expect(queryAllByTestId("gallery-image-fallback").length).toBe(1);
  });

  it("renders a placeholder when there are no images at all", () => {
    const { container, queryAllByTestId } = render(
      <VehicleGallery images={[]} vehicleTitle="2024 Honda Civic Si" />
    );
    expect(container.querySelector("img")).toBeNull();
    expect(queryAllByTestId("gallery-image-fallback").length).toBe(1);
  });
});

describe("VehicleGallery accessibility and navigation", () => {
  it("uses per-photo alt text, keyboard-reachable controls, and marks the current thumbnail", () => {
    const alts = ["2012 Jeep Wrangler Unlimited in Dozer — photo 1 of 3", "… photo 2 of 3", "… photo 3 of 3"];
    const { container, getByRole } = render(<VehicleGallery images={makeImages(3)} vehicleTitle="2012 Jeep Wrangler Unlimited" alts={alts} />);
    expect(container.querySelector("img")!.getAttribute("alt")).toBe(alts[0]);
    expect(getByRole("button", { name: "Show photo 1" }).getAttribute("aria-current")).toBe("true");
    fireEvent.click(getByRole("button", { name: "Next photo" }));
    expect(getByRole("button", { name: "Show photo 2" }).getAttribute("aria-current")).toBe("true");
    expect(container.querySelector("img")!.getAttribute("alt")).toBe(alts[1]);
  });

  it("opens an accessible full-screen dialog and closes it with Escape", () => {
    const { getByRole, queryByRole } = render(<VehicleGallery images={makeImages(2)} vehicleTitle="2012 Jeep" />);
    fireEvent.click(getByRole("button", { name: /full screen/ }));
    expect(getByRole("dialog").getAttribute("aria-modal")).toBe("true");
    expect(document.activeElement).toBe(getByRole("button", { name: "Close full-screen photos" }));
    fireEvent.keyDown(window, { key: "Escape" });
    expect(queryByRole("dialog")).toBeNull();
  });

  it("supports swiping on the main photo", () => {
    const { container, getByText } = render(<VehicleGallery images={makeImages(3)} vehicleTitle="2012 Jeep" />);
    const main = container.querySelector(".aspect-16\\/10")!;
    fireEvent.touchStart(main, { touches: [{ clientX: 300 }] });
    fireEvent.touchEnd(main, { changedTouches: [{ clientX: 100 }] });
    expect(getByText("2 / 3 photos")).toBeTruthy();
  });

  it("hides thumbnails and arrows for a single photo", () => {
    const { queryByRole } = render(<VehicleGallery images={makeImages(1)} vehicleTitle="2012 Jeep" />);
    expect(queryByRole("button", { name: "Next photo" })).toBeNull();
    expect(queryByRole("list", { name: "Photo thumbnails" })).toBeNull();
  });
});
