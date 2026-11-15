import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi, afterEach, test, expect } from "vitest";
import Home from "../pages/Home";
import Offer from "../pages/Offer";
import Login from "../pages/Login";
import Payment from "../pages/Payment";
import { api } from "../api";
vi.mock("../api", () => ({
  api: { get: vi.fn(), post: vi.fn() },
  errorMessage: (e) =>
    e.response?.data?.error || "Unable to connect. Please try again.",
  imageUrl: (url) => url,
}));
afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});
const renderRoute = (element, path = "/") =>
  render(<MemoryRouter initialEntries={[path]}>{element}</MemoryRouter>);
test("discovery forwards URL filters and page changes", async () => {
  api.get.mockResolvedValue({
    data: {
      count: 2,
      page: 1,
      limit: 1,
      offers: [
        {
          _id: "1",
          title: "Book",
          price: 100,
          images: [],
          owner: { account: { username: "Seller" } },
        },
      ],
    },
  });
  renderRoute(<Home />, "/?title=Book&sort=price-asc&limit=1");
  await screen.findByText("Book");
  expect(api.get.mock.calls[0][1].params.get("title")).toBe("Book");
  fireEvent.click(screen.getByText("Next"));
  await waitFor(() =>
    expect(api.get.mock.calls.at(-1)[1].params.get("page")).toBe("2"),
  );
});
test("network failure exposes retry and recovery", async () => {
  api.get
    .mockRejectedValueOnce(new Error())
    .mockResolvedValue({ data: { count: 0, page: 1, limit: 10, offers: [] } });
  renderRoute(<Home />);
  await screen.findByRole("alert");
  fireEvent.click(screen.getByText("Retry"));
  await screen.findByText("No listings match your search.");
});
test("listing detail renders the API contract", async () => {
  api.get.mockResolvedValue({
    data: {
      title: "A used book",
      price: 500,
      description: "Good condition book",
      condition: "Used",
      status: "active",
      images: [],
      owner: { account: { username: "Seller" } },
    },
  });
  renderRoute(<Offer />);
  await screen.findByText("A used book");
  expect(screen.getByText("LKR 500")).toBeTruthy();
  expect(screen.getByText("Seller: Seller")).toBeTruthy();
});
test("login reports a network failure without crashing", async () => {
  api.post.mockRejectedValue(new Error());
  renderRoute(<Login setUser={vi.fn()} />);
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "test@example.invalid" },
  });
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: "test-password" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Log in" }));
  await screen.findByRole("alert");
});
test("payment direct navigation is safe and cannot charge", () => {
  renderRoute(<Payment />);
  expect(screen.getByText("Online payments unavailable")).toBeTruthy();
  expect(api.post).not.toHaveBeenCalled();
});

test("signup collects username and sends JSON through the shared client", async () => {
  const { default: SignUp } = await import("../pages/SignUp");
  const setUser = vi.fn();
  api.post.mockResolvedValue({
    data: { _id: "u1", account: { username: "Tester" } },
  });
  renderRoute(<SignUp setUser={setUser} />);
  fireEvent.change(screen.getByLabelText("Username"), {
    target: { value: "Tester" },
  });
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "test@example.invalid" },
  });
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: "test-password" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Sign up" }));
  await waitFor(() => expect(setUser).toHaveBeenCalled());
  expect(api.post).toHaveBeenCalledWith("/user/signup", {
    username: "Tester",
    email: "test@example.invalid",
    password: "test-password",
  });
});
