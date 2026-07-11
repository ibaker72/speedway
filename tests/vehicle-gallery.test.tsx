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
    const { container, getByText } = render(
      <VehicleGallery images={makeImages(41)} vehicleTitle="2024 Honda Civic Si" />
    );
    expect(getByText("1 / 41 photos")).toBeTruthy();
    expect(container.querySelectorAll("button").length).toBe(41);
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
    const { container, getByText } = render(
      <VehicleGallery images={makeImages(3)} vehicleTitle="2024 Honda Civic Si" />
    );
    fireEvent.error(container.querySelector("img")!);
    const thumbs = container.querySelectorAll("button");
    fireEvent.click(thumbs[1]);
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
