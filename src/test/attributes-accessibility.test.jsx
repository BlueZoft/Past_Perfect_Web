import React, { useState } from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { MemoryRouter, Routes, Route, Link } from "react-router-dom";
import { test, expect, vi, afterEach } from "vitest";
import axe from "axe-core";
import ListingFields from "../components/ListingFields";
import CategoryAttributes from "../components/CategoryAttributes";
import RouteFocus from "../components/RouteFocus";
vi.mock("../api", () => ({
  loadCatalogue: async () => ({
    categories: ["other", "electronics", "furniture"],
    locations: [],
    attributes: {
      electronics: [
        {
          key: "brand",
          type: "text",
          maxLength: 80,
          label: { en: "Brand", si: "වෙළඳ නාමය", ta: "வணிகப் பெயர்" },
        },
      ],
      furniture: [
        {
          key: "widthCm",
          type: "number",
          min: 1,
          max: 10000,
          label: { en: "Width (cm)", si: "පළල", ta: "அகலம்" },
        },
      ],
    },
  }),
}));
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
function Editor() {
  const [value, setValue] = useState({
    category: "electronics",
    district: "",
    town: "",
    title: "User title",
    description: "User description",
    price: 100,
    condition: "Used",
    size: "",
    attributes: { brand: "Original" },
  });
  return (
    <main>
      <h1>Edit item</h1>
      <form>
        <ListingFields value={value} onChange={setValue} />
        <button type="submit">Save</button>
      </form>
      <output aria-label="payload">{JSON.stringify(value)}</output>
    </main>
  );
}
test("category attributes use bounded typed controls and clear stale category fields", async () => {
  render(<Editor />);
  await screen.findByLabelText("Brand");
  fireEvent.change(screen.getByLabelText("Brand"), {
    target: { value: "Example" },
  });
  expect(
    JSON.parse(screen.getByLabelText("payload").textContent).attributes.brand,
  ).toBe("Example");
  fireEvent.change(screen.getByLabelText("Category"), {
    target: { value: "furniture" },
  });
  await screen.findByLabelText("Width (cm)");
  expect(screen.queryByLabelText("Brand")).toBeNull();
  expect(
    JSON.parse(screen.getByLabelText("payload").textContent).attributes,
  ).toEqual({});
  const field = screen.getByLabelText("Width (cm)");
  expect(field.type).toBe("number");
  expect(field.min).toBe("1");
  expect(field.max).toBe("10000");
  fireEvent.change(field, { target: { value: "125.5" } });
  expect(
    JSON.parse(screen.getByLabelText("payload").textContent).attributes.widthCm,
  ).toBe("125.5");
});
test("read-only attributes render metadata labels and user values as text", async () => {
  render(
    <main>
      <CategoryAttributes
        readOnly
        value={{
          category: "electronics",
          attributes: { brand: "<script>test</script>" },
        }}
      />
    </main>,
  );
  await screen.findByText("Brand");
  expect(screen.getByText("<script>test</script>")).toBeTruthy();
  expect(document.querySelector("script")).toBeNull();
});
test("representative listing form passes automated DOM accessibility rules", async () => {
  render(<Editor />);
  await screen.findByLabelText("Brand");
  const result = await axe.run(document.body, {
    rules: { "color-contrast": { enabled: false } },
  });
  expect(
    result.violations.map((item) => ({
      id: item.id,
      nodes: item.nodes.length,
    })),
  ).toEqual([]);
});
test("route changes focus the content target for keyboard and screen-reader navigation", async () => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  render(
    <MemoryRouter>
      <RouteFocus />
      <Link to="/next">Next route</Link>
      <div id="main-content" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<h1>Home</h1>} />
          <Route path="/next" element={<h1>Next page</h1>} />
        </Routes>
      </div>
    </MemoryRouter>,
  );
  expect(document.activeElement.id).toBe("main-content");
  fireEvent.click(screen.getByText("Next route"));
  await screen.findByText("Next page");
  await waitFor(() => expect(document.activeElement.id).toBe("main-content"));
});
