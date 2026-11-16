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
import Checkout from "../pages/Checkout";
import OrderDetail from "../pages/OrderDetail";
import Orders from "../pages/Orders";
import { api } from "../api";
vi.mock("../api", () => ({
  api: { get: vi.fn(), post: vi.fn() },
  errorMessage: (error) =>
    error.response?.data?.error || "Unable to connect. Please try again.",
}));
afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});
const quote = {
  listingId: "l1",
  title: "A used book",
  listingVersion: 4,
  itemMinor: 100000,
  platformFeeMinor: 1000,
  deliveryMinor: 0,
  totalMinor: 101000,
  holdMinutes: 15,
  paymentMode: "test",
};
const order = {
  _id: "o1",
  buyer: "b1",
  seller: "s1",
  title: "A used book",
  status: "awaiting_payment",
  revision: 2,
  itemMinor: 100000,
  platformFeeMinor: 1000,
  deliveryMinor: 0,
  totalMinor: 101000,
  expiresAt: "2027-01-01T00:00:00Z",
};
const checkout = () =>
  render(
    <MemoryRouter initialEntries={["/checkout/l1"]}>
      <Routes>
        <Route
          path="/checkout/:id"
          element={<Checkout user={{ _id: "b1", emailVerified: true }} />}
        />
        <Route path="/orders/:id" element={<p>Reserved order</p>} />
      </Routes>
    </MemoryRouter>,
  );
const detail = (user) =>
  render(
    <MemoryRouter initialEntries={["/orders/o1"]}>
      <Routes>
        <Route path="/orders/:id" element={<OrderDetail user={user} />} />
        <Route path="/enquiries/:id" element={<p>Order conversation</p>} />
      </Routes>
    </MemoryRouter>,
  );
test("checkout submits the server quote and preserves its idempotency key across a network retry", async () => {
  api.get.mockResolvedValue({ data: quote });
  api.post
    .mockRejectedValueOnce(new Error())
    .mockResolvedValue({ data: { _id: "o1" } });
  checkout();
  await screen.findByText("A used book");
  expect(
    screen.getByText("Test payments only. No real money is moved."),
  ).toBeTruthy();
  fireEvent.click(screen.getByText("Reserve item"));
  await screen.findByRole("alert");
  fireEvent.click(screen.getByText("Reserve item"));
  await screen.findByText("Reserved order");
  const first = api.post.mock.calls[0][1],
    second = api.post.mock.calls[1][1];
  expect(first).toEqual(second);
  expect(first).toMatchObject({
    listingId: "l1",
    listingVersion: 4,
    expectedTotalMinor: 101000,
  });
  expect(first.idempotencyKey).toMatch(/^[a-f0-9]{32}$/);
  expect(first.amount).toBeUndefined();
});
test("disabled payment configuration prevents checkout reservation", async () => {
  api.get.mockResolvedValue({ data: { ...quote, paymentMode: "disabled" } });
  checkout();
  await screen.findByText("A used book");
  expect(screen.getByText("Reserve item").disabled).toBe(true);
  expect(api.post).not.toHaveBeenCalled();
});
test("buyer test payment uses only the current order revision and updates receipt state", async () => {
  api.get.mockImplementation((url) =>
    Promise.resolve({
      data: url === "/orders/config" ? { paymentMode: "test" } : order,
    }),
  );
  api.post.mockResolvedValue({
    data: {
      ...order,
      status: "confirmed",
      revision: 3,
      paymentMode: "test",
      paymentReference: "test-o1",
    },
  });
  detail({ _id: "b1" });
  await screen.findByText("Simulate successful payment");
  fireEvent.click(screen.getByText("Simulate successful payment"));
  await screen.findByText("Status: confirmed");
  expect(api.post).toHaveBeenCalledWith("/orders/o1/test-success", {
    version: 2,
  });
  expect(screen.queryByText("Cancel reservation")).toBeNull();
  expect(screen.queryByText("Mark ready for collection")).toBeNull();
});
test("seller cannot simulate the buyers payment but can cancel a pending reservation", async () => {
  api.get.mockImplementation((url) =>
    Promise.resolve({
      data: url === "/orders/config" ? { paymentMode: "test" } : order,
    }),
  );
  api.post.mockResolvedValue({
    data: { ...order, status: "cancelled", revision: 3 },
  });
  detail({ _id: "s1" });
  await screen.findByText("Cancel reservation");
  expect(screen.queryByText("Simulate successful payment")).toBeNull();
  fireEvent.click(screen.getByText("Cancel reservation"));
  await screen.findByText("Status: cancelled");
  expect(api.post).toHaveBeenCalledWith("/orders/o1/cancel", { version: 2 });
});
test("collection confirmation is available to the buyer after seller readiness", async () => {
  api.get.mockImplementation((url) =>
    Promise.resolve({
      data:
        url === "/orders/config"
          ? { paymentMode: "test" }
          : { ...order, status: "ready", revision: 4, paymentMode: "test" },
    }),
  );
  api.post.mockResolvedValue({
    data: { ...order, status: "completed", revision: 5, paymentMode: "test" },
  });
  detail({ _id: "b1" });
  await screen.findByText("Confirm collection");
  fireEvent.click(screen.getByText("Confirm collection"));
  await screen.findByText("Status: completed");
  expect(api.post).toHaveBeenCalledWith("/orders/o1/complete", { version: 4 });
});
test("order participants can open a scoped enquiry to arrange collection", async () => {
  api.get.mockImplementation((url) =>
    Promise.resolve({
      data: url === "/orders/config" ? { paymentMode: "test" } : order,
    }),
  );
  api.post.mockResolvedValue({ data: { _id: "e1" } });
  detail({ _id: "b1" });
  await screen.findByLabelText("Message order participant");
  fireEvent.change(screen.getByLabelText("Message order participant"), {
    target: { value: "When can I collect?" },
  });
  fireEvent.click(screen.getByText("Send message"));
  await screen.findByText("Order conversation");
  expect(api.post).toHaveBeenCalledWith("/orders/o1/enquiry", {
    message: "When can I collect?",
  });
});
test("suspended participants can cancel but cannot test payments or send messages", async () => {
  api.get.mockImplementation((url) =>
    Promise.resolve({
      data: url === "/orders/config" ? { paymentMode: "test" } : order,
    }),
  );
  detail({ _id: "b1", suspended: true });
  await screen.findByText("Cancel reservation");
  expect(screen.queryByText("Simulate successful payment")).toBeNull();
  expect(screen.queryByLabelText("Message order participant")).toBeNull();
});
test("order history renders server status and amount without accepting a browser total", async () => {
  api.get.mockResolvedValue({
    data: { orders: [order], count: 1, page: 1, limit: 10 },
  });
  render(
    <MemoryRouter>
      <Orders user={{ _id: "b1" }} />
    </MemoryRouter>,
  );
  await screen.findByText("A used book");
  expect(screen.getByText("You are the buyer")).toBeTruthy();
  expect(api.get).toHaveBeenCalledWith("/user/orders", {
    params: { page: "1" },
  });
});
