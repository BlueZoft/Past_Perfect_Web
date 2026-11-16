import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { test, expect, vi, afterEach } from "vitest";
import OrderDetail from "../pages/OrderDetail";
import OrderDisputes from "../pages/OrderDisputes";
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
const order = {
  _id: "o1",
  title: "Used book",
  buyer: "b1",
  seller: "s1",
  revision: 2,
  status: "confirmed",
  paymentMode: "test",
  itemMinor: 120000,
  platformFeeMinor: 0,
  deliveryMinor: 0,
  totalMinor: 120000,
};
const dispute = {
  status: "open",
  previousStatus: "confirmed",
  reason: "The item was damaged",
  openedBy: "b1",
  openedAt: "2026-01-01",
};
const open = { ...order, status: "disputed", revision: 3, dispute };
function participant(record, user = { _id: "b1" }, mode = "test") {
  api.get.mockImplementation((url) =>
    Promise.resolve({
      data: url === "/orders/config" ? { paymentMode: mode } : record,
    }),
  );
  render(
    <MemoryRouter initialEntries={["/orders/o1"]}>
      <Routes>
        <Route path="/orders/:id" element={<OrderDetail user={user} />} />
      </Routes>
    </MemoryRouter>,
  );
}
function queue(
  record = open,
  user = { _id: "a1", isAdmin: true },
  mode = "test",
) {
  api.get.mockImplementation((url) =>
    Promise.resolve({
      data:
        url === "/orders/config"
          ? { paymentMode: mode }
          : { orders: [record], count: 1, page: 1, limit: 10 },
    }),
  );
  render(
    <MemoryRouter>
      <OrderDisputes user={user} />
    </MemoryRouter>,
  );
}
test("buyer opens a dispute with the current revision and collection controls disappear", async () => {
  api.post.mockResolvedValue({ data: open });
  participant({ ...order, status: "ready" });
  await screen.findByText("Confirm collection");
  fireEvent.change(screen.getByLabelText("Buyer reason"), {
    target: { value: "The item was damaged" },
  });
  fireEvent.click(screen.getByText("Open order dispute"));
  await screen.findByText("Status: disputed");
  expect(api.post).toHaveBeenCalledWith("/orders/o1/dispute", {
    version: 2,
    reason: "The item was damaged",
  });
  expect(screen.queryByText("Confirm collection")).toBeNull();
  expect(screen.queryByText("Simulate full refund")).toBeNull();
  expect(screen.getByText("The item was damaged")).toBeTruthy();
});
test("seller can record a response and simulate only a full refund without submitting an amount", async () => {
  const responded = {
    ...open,
    revision: 4,
    dispute: {
      ...dispute,
      response: "I agree with the issue",
      respondedAt: "2026-01-02",
    },
  };
  api.post
    .mockResolvedValueOnce({ data: responded })
    .mockResolvedValueOnce({
      data: {
        ...responded,
        status: "refunded",
        revision: 5,
        dispute: {
          ...responded.dispute,
          status: "refunded",
          resolution: "Full refund agreed",
          refundMinor: 120000,
          refundReference: "test-refund-o1",
        },
      },
    });
  participant(open, { _id: "s1" });
  await screen.findByLabelText("Seller response");
  fireEvent.change(screen.getByLabelText("Seller response"), {
    target: { value: "I agree with the issue" },
  });
  fireEvent.click(screen.getByText("Submit seller response"));
  await screen.findByText("I agree with the issue");
  expect(api.post).toHaveBeenCalledWith("/orders/o1/dispute-response", {
    version: 3,
    response: "I agree with the issue",
  });
  expect(screen.queryByText("Submit seller response")).toBeNull();
  fireEvent.change(
    screen.getByLabelText("Resolution shared with both participants"),
    { target: { value: "Full refund agreed" } },
  );
  fireEvent.click(screen.getByText("Simulate full refund"));
  await screen.findByText("Status: refunded");
  expect(api.post).toHaveBeenLastCalledWith("/orders/o1/test-refund", {
    version: 4,
    resolution: "Full refund agreed",
  });
  expect(
    screen.getByText("Test refund reference: test-refund-o1"),
  ).toBeTruthy();
  expect(
    screen.getByText("Refunds are simulated. No real money is returned."),
  ).toBeTruthy();
});
test("admin queue makes versioned decisions using shared resolution text", async () => {
  api.post.mockResolvedValue({});
  queue();
  await screen.findByText("The item was damaged");
  expect(api.get).toHaveBeenCalledWith("/admin/order-disputes", {
    params: { status: "open", page: 1 },
  });
  expect(screen.getByText("Simulate full refund").disabled).toBe(true);
  fireEvent.change(
    screen.getByLabelText("Resolution shared with both participants"),
    { target: { value: "Reviewed and declined" } },
  );
  fireEvent.click(screen.getByText("Decline refund and resume order"));
  await screen.findByText("The item was damaged");
  expect(api.post).toHaveBeenCalledWith("/admin/order-disputes/o1/resolve", {
    version: 3,
    decision: "decline",
    resolution: "Reviewed and declined",
  });
});
test("stale admin decisions display an error and keep the canonical order for refresh", async () => {
  api.post.mockRejectedValue({
    response: { data: { error: "Order changed. Reload before trying again." } },
  });
  queue();
  await screen.findByLabelText("Resolution shared with both participants");
  fireEvent.change(
    screen.getByLabelText("Resolution shared with both participants"),
    { target: { value: "Refund approved" } },
  );
  fireEvent.click(screen.getByText("Simulate full refund"));
  await screen.findByRole("alert");
  expect(screen.getByText("Status: disputed")).toBeTruthy();
  expect(screen.queryByText("Status: refunded")).toBeNull();
});
test("disabled simulator hides refund buttons while admin can still decline a dispute", async () => {
  queue(open, { _id: "a1", isAdmin: true }, "disabled");
  await screen.findByText("The item was damaged");
  expect(screen.queryByText("Simulate full refund")).toBeNull();
  expect(screen.getByText("Decline refund and resume order")).toBeTruthy();
});
test("participants cannot use administrator controls to resolve their own case", async () => {
  queue(open, { _id: "s1", isAdmin: true });
  await screen.findByText("The item was damaged");
  expect(screen.queryByText("Simulate full refund")).toBeNull();
  expect(screen.queryByText("Decline refund and resume order")).toBeNull();
});
test("non-admin views do not fetch the dispute queue", () => {
  queue(open, { _id: "b1" });
  expect(screen.getByText("Administrator access required")).toBeTruthy();
  expect(api.get).not.toHaveBeenCalled();
});
test("suspended buyer can report an order issue while messaging remains unavailable", async () => {
  participant(order, { _id: "b1", suspended: true });
  await screen.findByText("Open order dispute");
  expect(screen.queryByLabelText("Message order participant")).toBeNull();
});
