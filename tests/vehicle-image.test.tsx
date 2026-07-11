// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/react";
import { VehicleImage } from "@/components/shared/VehicleImage";

afterEach(cleanup);

const SRC = "https://images.autofunds.net/InventoryImages/2026/04/29/a.jpg";

describe("VehicleImage (inventory card image)", () => {
  it("renders an img for a valid src", () => {
    const { container } = render(
      <VehicleImage src={SRC} alt="2024 Honda Civic Si" make="Honda" model="Civic Si" />
    );
    expect(container.querySelector("img")).toBeTruthy();
  });

  it("falls back to the camera placeholder after a load failure (no broken img left)", () => {
    const { container, getByText } = render(
      <VehicleImage src={SRC} alt="2024 Honda Civic Si" make="Honda" model="Civic Si" />
    );
    const img = container.querySelector("img")!;
    fireEvent.error(img);
    // The <img> is gone — no broken-image icon — and make/model show instead.
    expect(container.querySelector("img")).toBeNull();
    expect(getByText("Honda")).toBeTruthy();
    expect(getByText("Civic Si")).toBeTruthy();
  });

  it("shows the placeholder immediately when src is missing", () => {
    const { container, getByText } = render(
      <VehicleImage alt="2024 Honda Civic Si" make="Honda" model="Civic Si" />
    );
    expect(container.querySelector("img")).toBeNull();
    expect(getByText("Honda")).toBeTruthy();
  });
});
