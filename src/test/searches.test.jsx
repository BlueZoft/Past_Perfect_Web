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
import { searchUrl } from "../search";
import { api } from "../api";
vi.mock("../api", () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  errorMessage: (error) =>
    error.response?.data?.error || "Unable to connect. Please try again.",
  imageUrl: (url) => url,
  loadCatalogue: async () => ({
    categories: ["other", "clothing", "books"],
    locations: [],
  }),
}));
afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});
const empty = { offers: [], count: 0, page: 1, limit: 10 };
const record = {
  _id: "s1",
  name: "Books",
  revision: 2,
  query: {
    q: "book",
    category: "books",
    condition: "Used",
    priceMax: "500",
    sort: "relevance",
  },
};
const home = (path = "/", user) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Home user={user} />
    </MemoryRouter>,
  );
const saved = (user = { _id: "u1" }) =>
  render(
    <MemoryRouter>
      <SavedSearches user={user} />
    </MemoryRouter>,
  );
test("keyword search uses q, resets pagination, and supports relevance or literal title mode", async () => {
  api.get.mockResolvedValue({ data: empty });
  home("/?q=book&page=3");
  await screen.findByText("No listings match your search.");
  expect(screen.getByLabelText("Sort").value).toBe("relevance");
  fireEvent.change(screen.getByLabelText("Search"), {
    target: { value: "lamp" },
  });
  await waitFor(() =>
    expect(api.get.mock.calls.at(-1)[1].params.get("q")).toBe("lamp"),
  );
  expect(api.get.mock.calls.at(-1)[1].params.get("page")).toBe("1");
  fireEvent.change(screen.getByLabelText("Search in"), {
    target: { value: "title" },
  });
  await waitFor(() =>
    expect(api.get.mock.calls.at(-1)[1].params.get("title")).toBe("lamp"),
  );
  expect(api.get.mock.calls.at(-1)[1].params.has("q")).toBe(false);
  expect(screen.getByLabelText("Sort").value).toBe("newest");
});
test("changing away from clothing clears a stale size and filters use canonical values", async () => {
  api.get.mockResolvedValue({ data: empty });
  home("/?category=clothing&size=M&q=shirt");
  await screen.findByText("No listings match your search.");
  fireEvent.change(screen.getByLabelText("Condition"), {
    target: { value: "Like New" },
  });
  await waitFor(() =>
    expect(api.get.mock.calls.at(-1)[1].params.get("condition")).toBe(
      "Like New",
    ),
  );
  fireEvent.change(screen.getByLabelText("Category"), {
    target: { value: "books" },
  });
  await waitFor(() =>
    expect(api.get.mock.calls.at(-1)[1].params.get("category")).toBe("books"),
  );
  expect(api.get.mock.calls.at(-1)[1].params.has("size")).toBe(false);
  expect(screen.getByLabelText("Size").disabled).toBe(true);
});
test("save captures only supported filters, omits pagination and preserves them across a network retry", async () => {
  api.get.mockResolvedValue({ data: empty });
  api.post
    .mockRejectedValueOnce(new Error())
    .mockResolvedValueOnce({ data: record });
  home(
    "/?q=book&condition=Used&category=books&priceMax=500&sort=price-asc&page=3&limit=20&owner=ignored",
    { _id: "u1" },
  );
  await screen.findByText("No listings match your search.");
  fireEvent.change(screen.getByLabelText("Search name"), {
    target: { value: "Affordable books" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Save this search" }));
  await screen.findByRole("alert");
  fireEvent.click(screen.getByRole("button", { name: "Save this search" }));
  await screen.findByText("Search saved.");
  expect(api.post).toHaveBeenLastCalledWith("/user/saved-searches", {
    name: "Affordable books",
    alertsEnabled: false,
    query: {
      q: "book",
      condition: "Used",
      category: "books",
      priceMax: "500",
      sort: "price-asc",
    },
  });
  expect(api.post.mock.calls[0][1]).toEqual(api.post.mock.calls[1][1]);
});
test("anonymous and suspended browsing has no save controls", async () => {
  api.get.mockResolvedValue({ data: empty });
  home();
  await screen.findByText("No listings match your search.");
  expect(screen.queryByRole("button", { name: "Save this search" })).toBeNull();
  cleanup();
  home("/", { _id: "u1", suspended: true });
  await screen.findByText("No listings match your search.");
  expect(screen.queryByLabelText("Search name")).toBeNull();
});
test("saved search links restore filters without pagination or arbitrary redirect fields", async () => {
  api.get.mockResolvedValue({
    data: { searches: [record], count: 1, limit: 25 },
  });
  saved();
  const link = await screen.findByRole("link", { name: "Run saved search" });
  const url = new URL(link.getAttribute("href"), "http://localhost");
  expect(url.pathname).toBe("/");
  expect(url.searchParams.get("q")).toBe("book");
  expect(url.searchParams.get("condition")).toBe("Used");
  expect(url.searchParams.has("page")).toBe(false);
  expect(
    searchUrl({ q: "book", url: "https://example.invalid", page: "10" }),
  ).toBe("/?q=book");
  expect(
    screen.getByText(
      "Enable in-app alerts for new matching listings. Existing listings are not backfilled.",
    ),
  ).toBeTruthy();
});
test("rename and removal submit current saved-search revisions", async () => {
  api.get.mockResolvedValue({
    data: { searches: [record], count: 1, limit: 25 },
  });
  api.patch.mockResolvedValue({
    data: { ...record, name: "Reading list", revision: 3 },
  });
  api.delete.mockResolvedValue({});
  saved();
  await screen.findByLabelText("Search name");
  fireEvent.change(screen.getByLabelText("Search name"), {
    target: { value: "Reading list" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Rename search" }));
  await screen.findByRole("heading", { name: "Reading list" });
  expect(api.patch).toHaveBeenCalledWith("/user/saved-searches/s1", {
    name: "Reading list",
    version: 2,
  });
  fireEvent.click(screen.getByRole("button", { name: "Delete saved search" }));
  await screen.findByText("No saved searches yet.");
  expect(api.delete).toHaveBeenCalledWith("/user/saved-searches/s1", {
    data: { version: 3 },
  });
});
test("stale writes retain the saved item until refreshed", async () => {
  api.get
    .mockResolvedValueOnce({
      data: { searches: [record], count: 1, limit: 25 },
    })
    .mockResolvedValueOnce({
      data: {
        searches: [{ ...record, name: "Changed elsewhere", revision: 3 }],
        count: 1,
        limit: 25,
      },
    });
  api.delete.mockRejectedValue({
    response: {
      data: { error: "Saved search changed. Refresh before trying again." },
    },
  });
  saved();
  await screen.findByRole("heading", { name: "Books" });
  fireEvent.click(screen.getByRole("button", { name: "Delete saved search" }));
  await screen.findByRole("alert");
  expect(screen.getByRole("heading", { name: "Books" })).toBeTruthy();
  fireEvent.click(
    screen.getByRole("button", { name: "Refresh saved searches" }),
  );
  await screen.findByRole("heading", { name: "Changed elsewhere" });
});
test("signed-out saved-search route redirects to login without private requests", async () => {
  render(
    <MemoryRouter initialEntries={["/saved-searches"]}>
      <Routes>
        <Route path="/saved-searches" element={<SavedSearches user={null} />} />
        <Route path="/login" element={<p>Sign in first</p>} />
      </Routes>
    </MemoryRouter>,
  );
  await screen.findByText("Sign in first");
  expect(api.get).not.toHaveBeenCalled();
});
test("saved-search controls pass an automated DOM accessibility check", async () => {
  api.get.mockResolvedValue({
    data: { searches: [record], count: 1, limit: 25 },
  });
  const { container } = saved();
  await screen.findByText("Run saved search");
  const result = await axe.run(container, {
    rules: { "color-contrast": { enabled: false } },
  });
  expect(result.violations).toEqual([]);
});
