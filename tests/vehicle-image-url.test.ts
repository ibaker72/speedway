import { describe, it, expect } from "vitest";
import {
  normalizeVehicleImageUrl,
  pickFirstValidImageUrl,
} from "@/lib/images/vehicle-image-url";

const AF = "https://images.autofunds.net/InventoryImages/2026/04/29/4952_2776129_12883649_6583529582026.jpg";

describe("normalizeVehicleImageUrl", () => {
  it("passes through a normal Autofunds image URL", () => {
    expect(normalizeVehicleImageUrl(AF)).toBe(AF);
  });

  it("rewrites decommissioned InvImg* autofunds hosts to images.autofunds.net", () => {
    expect(
      normalizeVehicleImageUrl(
        "https://InvImg2B.autofunds.net/InventoryImages/2026/04/29/4952_2776129_12883649_6583529582026.jpg"
      )
    ).toBe(AF);
    expect(
      normalizeVehicleImageUrl("http://invimg1a.autofunds.net/InventoryImages/x.jpg")
    ).toBe("https://images.autofunds.net/InventoryImages/x.jpg");
  });

  it("resolves protocol-relative URLs to https", () => {
    expect(normalizeVehicleImageUrl("//images.autofunds.net/a/b.jpg")).toBe(
      "https://images.autofunds.net/a/b.jpg"
    );
  });

  it("upgrades http to https", () => {
    expect(normalizeVehicleImageUrl("http://images.autofunds.net/a.jpg")).toBe(
      "https://images.autofunds.net/a.jpg"
    );
  });

  it("trims whitespace and wrapping quotes", () => {
    expect(normalizeVehicleImageUrl(`  "${AF}"  `)).toBe(AF);
    expect(normalizeVehicleImageUrl(`'${AF}'`)).toBe(AF);
    expect(normalizeVehicleImageUrl(`“${AF}”`)).toBe(AF);
  });

  it("decodes basic HTML entities and preserves query strings", () => {
    expect(
      normalizeVehicleImageUrl("https://images.autofunds.net/a.jpg?w=800&amp;v=2")
    ).toBe("https://images.autofunds.net/a.jpg?w=800&v=2");
    expect(normalizeVehicleImageUrl(`${AF}?id=123&sig=a%2Fb=`)).toBe(`${AF}?id=123&sig=a%2Fb=`);
  });

  it("rejects unusable values", () => {
    expect(normalizeVehicleImageUrl(undefined)).toBeNull();
    expect(normalizeVehicleImageUrl(null)).toBeNull();
    expect(normalizeVehicleImageUrl(42)).toBeNull();
    expect(normalizeVehicleImageUrl("")).toBeNull();
    expect(normalizeVehicleImageUrl("   ")).toBeNull();
    expect(normalizeVehicleImageUrl('""')).toBeNull();
    expect(normalizeVehicleImageUrl("not a url")).toBeNull();
    expect(normalizeVehicleImageUrl("https://")).toBeNull();
  });

  it("rejects dangerous protocols", () => {
    expect(normalizeVehicleImageUrl("javascript:alert(1)")).toBeNull();
    expect(normalizeVehicleImageUrl("data:image/png;base64,AAAA")).toBeNull();
    expect(normalizeVehicleImageUrl("file:///etc/passwd")).toBeNull();
    expect(normalizeVehicleImageUrl("ftp://images.autofunds.net/a.jpg")).toBeNull();
  });

  it("rejects localhost and IP hosts", () => {
    expect(normalizeVehicleImageUrl("https://localhost/a.jpg")).toBeNull();
    expect(normalizeVehicleImageUrl("https://127.0.0.1/a.jpg")).toBeNull();
    expect(normalizeVehicleImageUrl("https://[::1]/a.jpg")).toBeNull();
    expect(normalizeVehicleImageUrl("https://foo.localhost/a.jpg")).toBeNull();
  });

  it("rejects hosts outside the approved list", () => {
    expect(normalizeVehicleImageUrl("https://evil.example.com/a.jpg")).toBeNull();
    expect(normalizeVehicleImageUrl("https://autofunds.net.evil.com/a.jpg")).toBeNull();
    // apex domains are not approved (config allows subdomains only)
    expect(normalizeVehicleImageUrl("https://autofunds.net/a.jpg")).toBeNull();
  });

  it("accepts the other approved CDN hosts", () => {
    expect(normalizeVehicleImageUrl("https://d123.cloudfront.net/a.jpg")).toBeTruthy();
    expect(normalizeVehicleImageUrl("https://dealer.imgix.net/a.jpg")).toBeTruthy();
    expect(normalizeVehicleImageUrl("https://images.dealer.com/a.jpg")).toBeTruthy();
    expect(normalizeVehicleImageUrl("https://placehold.co/600x400")).toBeTruthy();
  });

  it("passes through local public assets untouched", () => {
    expect(normalizeVehicleImageUrl("/brands/honda.svg")).toBe("/brands/honda.svg");
  });
});

describe("pickFirstValidImageUrl", () => {
  it("selects the first valid image", () => {
    expect(pickFirstValidImageUrl(["", "javascript:x", `  ${AF}`, "https://also.valid.imgix.net/b.jpg"])).toBe(AF);
  });

  it("returns null when nothing is usable", () => {
    expect(pickFirstValidImageUrl(["", null, "https://evil.example.com/a.jpg"])).toBeNull();
  });
});
