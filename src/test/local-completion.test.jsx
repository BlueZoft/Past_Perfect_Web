import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { test, expect, vi, afterEach } from "vitest";
import axe from "axe-core";
import Home from "../pages/Home";
import SavedSearches from "../pages/SavedSearches";
import OrderDetail from "../pages/OrderDetail";
import SellerReviews from "../components/SellerReviews";
import ReviewModeration from "../pages/ReviewModeration";
import SellerAnalytics from "../pages/SellerAnalytics";
import Notifications from "../pages/Notifications";
import { api } from "../api";
vi.mock("../api", () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  errorMessage: (error) =>
    error.response?.data?.error || "Unable to connect. Please try again.",
  imageUrl: (url) => url,
  loadCatalogue: async () => ({
    categories: ["other", "furniture", "electronics"],
    locations: [],
    attributes: {
      furniture: [
        {
          key: "widthCm",
          type: "number",
          min: 1,
          max: 10000,
          label: { en: "Width (cm)", si: "පළල", ta: "அகலம்" },
        },
      ],
      electronics: [
        {
          key: "brand",
          type: "text",
          maxLength: 80,
          label: { en: "Brand", si: "වෙළඳ නාමය", ta: "வணிகப் பெயர்" },
        },
      ],
    },
  }),
}));
afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});
const wrap = (element, path = "/") =>
  render(<MemoryRouter initialEntries={[path]}>{element}</MemoryRouter>);
const empty = { offers: [], page: 1, limit: 10, count: 0 };
const order = {
  _id: "o1",
  buyer: "b1",
  seller: "s1",
  title: "Test desk",
  status: "completed",
  revision: 3,
  paymentMode: "test",
  itemMinor: 10000,
  platformFeeMinor: 0,
  deliveryMinor: 0,
  totalMinor: 10000,
};
test("numeric attribute filters persist in the URL and clear when category changes", async () => {
  api.get.mockResolvedValue({ data: empty });
  wrap(<Home />, "/?category=furniture");
  const input = await screen.findByLabelText("Minimum Width (cm)");
  fireEvent.change(input, { target: { value: "50" } });
  await waitFor(() =>
    expect(
      JSON.parse(api.get.mock.calls.at(-1)[1].params.get("attributeFilters")),
    ).toEqual({ widthCm: { min: 50 } }),
  );
  fireEvent.change(screen.getByLabelText("Category"), {
    target: { value: "electronics" },
  });
  await screen.findByLabelText("Brand");
  await waitFor(() =>
    expect(api.get.mock.calls.at(-1)[1].params.has("attributeFilters")).toBe(
      false,
    ),
  );
});
test("save opts in to alerts explicitly and includes attribute filters", async () => {
  api.get.mockResolvedValue({ data: empty });
  api.post.mockResolvedValue({});
  const attrs = JSON.stringify({ brand: "Example" });
  wrap(
    <Home user={{ _id: "u1" }} />,
    "/?category=electronics&attributeFilters=" + encodeURIComponent(attrs),
  );
  await screen.findByText("No listings match your search.");
  expect(screen.getByLabelText("New listing alerts").checked).toBe(false);
  fireEvent.change(screen.getByLabelText("Search name"), {
    target: { value: "Devices" },
  });
  fireEvent.click(screen.getByLabelText("New listing alerts"));
  fireEvent.click(screen.getByRole("button", { name: "Save this search" }));
  await screen.findByText("Search saved.");
  expect(api.post).toHaveBeenCalledWith("/user/saved-searches", {
    name: "Devices",
    alertsEnabled: true,
    query: { category: "electronics", attributeFilters: attrs },
  });
});
test("saved-search opt out submits revision and reflects server state", async () => {
  const record = {
    _id: "x1",
    revision: 2,
    name: "Devices",
    alertsEnabled: true,
    query: {},
  };
  api.get.mockResolvedValue({
    data: { searches: [record], count: 1, limit: 25 },
  });
  api.patch.mockResolvedValue({
    data: { ...record, revision: 3, alertsEnabled: false },
  });
  wrap(<SavedSearches user={{ _id: "u1" }} />);
  const checkbox = await screen.findByLabelText("New listing alerts");
  expect(checkbox.checked).toBe(true);
  fireEvent.click(checkbox);
  await waitFor(() =>
    expect(screen.getByLabelText("New listing alerts").checked).toBe(false),
  );
  expect(api.patch).toHaveBeenCalledWith("/user/saved-searches/x1", {
    alertsEnabled: false,
    version: 2,
  });
});
test("completed buyer submits a numeric rating and current order version", async () => {
  api.get.mockImplementation((url) =>
    Promise.resolve({
      data: url === "/orders/config" ? { paymentMode: "test" } : order,
    }),
  );
  api.post.mockResolvedValue({
    data: { ...order, revision: 4, review: { rating: 4, text: "Useful desk" } },
  });
  render(
    <MemoryRouter initialEntries={["/orders/o1"]}>
      <Routes>
        <Route
          path="/orders/:id"
          element={<OrderDetail user={{ _id: "b1" }} />}
        />
      </Routes>
    </MemoryRouter>,
  );
  await screen.findByLabelText("Rating");
  fireEvent.change(screen.getByLabelText("Rating"), { target: { value: "4" } });
  fireEvent.change(screen.getByLabelText("Review text"), {
    target: { value: "Useful desk" },
  });
  fireEvent.click(screen.getByText("Submit review"));
  await screen.findByText("Useful desk");
  expect(api.post).toHaveBeenCalledWith("/orders/o1/review", {
    version: 3,
    rating: 4,
    text: "Useful desk",
  });
  expect(screen.queryByText("Submit review")).toBeNull();
  expect(
    screen.getByText("Test order review. This is not a real customer rating."),
  ).toBeTruthy();
});
test("public seller reviews display test labels and average separately", async () => {
  api.get.mockResolvedValue({
    data: {
      reviews: [
        { rating: 4, text: "Useful desk", reviewer: "Buyer", test: true },
      ],
      summary: {
        test: { count: 1, average: 4 },
        live: { count: 0, average: null },
      },
      page: 1,
      limit: 10,
      count: 1,
    },
  });
  wrap(<SellerReviews id="s1" />);
  await screen.findByText("Useful desk");
  expect(
    screen.getByText("Test order review. This is not a real customer rating."),
  ).toBeTruthy();
  expect(api.get).toHaveBeenCalledWith("/seller/s1/reviews", {
    params: { page: 1 },
  });
});
test("review moderation forwards current version and shared reason", async () => {
  api.get.mockResolvedValue({
    data: {
      reviews: [
        {
          _id: "o1",
          revision: 4,
          buyer: "b1",
          seller: "s1",
          title: "Desk",
          status: "completed",
          review: { rating: 4, text: "Useful", hidden: false },
        },
      ],
      count: 1,
      page: 1,
      limit: 10,
    },
  });
  api.patch.mockResolvedValue({});
  wrap(<ReviewModeration user={{ _id: "a1", isAdmin: true }} />);
  await screen.findByText("Hide review");
  expect(screen.getByText("Hide review").disabled).toBe(true);
  fireEvent.change(screen.getByLabelText("Shared moderation reason"), {
    target: { value: "Policy review" },
  });
  fireEvent.click(screen.getByText("Hide review"));
  await waitFor(() =>
    expect(api.patch).toHaveBeenCalledWith("/admin/reviews/o1", {
      version: 4,
      hidden: true,
      reason: "Policy review",
    }),
  );
});
test("analytics is private and explicitly labels simulated amounts", async () => {
  api.get.mockResolvedValue({
    data: {
      listings: { active: 2 },
      hiddenListings: 1,
      orders: { completed: 1 },
      simulated: { paidMinor: 10000, refundedMinor: 0 },
    },
  });
  const { container } = wrap(<SellerAnalytics user={{ _id: "s1" }} />);
  await screen.findByText(
    "These are test checkout amounts, not seller earnings or payouts.",
  );
  expect(api.get).toHaveBeenCalledWith("/user/analytics");
  expect(screen.getByText("Listings by status")).toBeTruthy();
  const result = await axe.run(container, {
    rules: { "color-contrast": { enabled: false } },
  });
  expect(result.violations).toEqual([]);
});
test("search notifications open the matched listing", async () => {
  api.get.mockResolvedValue({
    data: {
      notifications: [{ _id: "n1", type: "search", link: "/offer/l1" }],
      unreadCount: 1,
      count: 1,
      page: 1,
      limit: 10,
    },
  });
  wrap(<Notifications user={{ _id: "b1" }} />);
  const link = await screen.findByRole("link", {
    name: "New listing matching a saved search",
  });
  expect(link.getAttribute("href")).toBe("/offer/l1");
});
