import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, test, expect, vi } from "vitest";
import AccountStatus from "../pages/AccountStatus";
import AccountModeration from "../pages/AccountModeration";
import PolicyReview from "../pages/PolicyReview";
import Policy from "../pages/Policy";
import { api } from "../api";
vi.mock("../api", () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
  errorMessage: (error) =>
    error.response?.data?.error || "Unable to connect. Please try again.",
}));
afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});
const wrap = (element) => render(<MemoryRouter>{element}</MemoryRouter>);
test("suspended user can submit one versioned appeal", async () => {
  api.get.mockResolvedValue({
    data: { appeals: [], count: 0, page: 1, limit: 10 },
  });
  api.post.mockResolvedValue({});
  wrap(
    <AccountStatus
      user={{
        _id: "u1",
        suspended: true,
        suspensionReason: "Review needed",
        moderationVersion: 3,
      }}
      setUser={vi.fn()}
    />,
  );
  await screen.findByLabelText("Appeal explanation");
  fireEvent.change(screen.getByLabelText("Appeal explanation"), {
    target: { value: "Please reconsider my suspension" },
  });
  fireEvent.click(screen.getByText("Submit appeal"));
  await waitFor(() =>
    expect(api.post).toHaveBeenCalledWith("/user/appeals", {
      text: "Please reconsider my suspension",
      version: 3,
    }),
  );
});
test("moderator acceptance uses the appeal suspension version", async () => {
  api.get.mockResolvedValue({
    data: {
      appeals: [
        {
          appeal: {
            _id: "a1",
            status: "open",
            text: "Please review",
            moderationVersion: 4,
          },
          user: { _id: "u1", username: "Seller" },
        },
      ],
      count: 1,
      page: 1,
      limit: 10,
    },
  });
  api.patch.mockResolvedValue({});
  wrap(<AccountModeration user={{ _id: "admin", isAdmin: true }} />);
  await screen.findByText("Please review");
  fireEvent.change(screen.getByLabelText("Public resolution"), {
    target: { value: "Reviewed and restored" },
  });
  fireEvent.click(screen.getByText("Accept and restore account"));
  await waitFor(() =>
    expect(api.patch).toHaveBeenCalledWith("/admin/appeals/a1", {
      decision: "accepted",
      resolution: "Reviewed and restored",
      version: 4,
    }),
  );
});
test("ordinary users cannot fetch policy moderation queues", async () => {
  wrap(<PolicyReview user={{ _id: "u1", isAdmin: false }} />);
  await screen.findByText("Administrator access required");
  expect(api.get).not.toHaveBeenCalled();
});
test("policy approvals submit the listing version and decision note", async () => {
  api.get.mockResolvedValue({
    data: {
      offers: [
        {
          _id: "l1",
          title: "Review item",
          description: "Review description",
          __v: 2,
          policyVersion: "placeholder-v1",
        },
      ],
      count: 1,
      page: 1,
      limit: 10,
    },
  });
  api.patch.mockResolvedValue({});
  wrap(<PolicyReview user={{ _id: "admin", isAdmin: true }} />);
  await screen.findByText("Review item");
  fireEvent.change(screen.getByLabelText("Moderation note"), {
    target: { value: "Item checked" },
  });
  fireEvent.click(screen.getByText("Approve listing"));
  await waitFor(() =>
    expect(api.patch).toHaveBeenCalledWith("/admin/offers/l1/moderation", {
      hidden: false,
      reason: "Item checked",
      version: 2,
    }),
  );
});
test("public policy displays operator-provided notice and review rules", async () => {
  api.get.mockResolvedValue({
    data: {
      version: "example-v1",
      notice: { en: "Example policy only" },
      rules: [{ id: "r1", action: "review", label: { en: "Example item" } }],
    },
  });
  wrap(<Policy />);
  await screen.findByText("Example policy only");
  expect(screen.getByText("Example item — Requires review")).toBeTruthy();
});

test("application routes suspended sessions to account status instead of publishing", async () => {
  const { default: App } = await import("../App");
  window.history.replaceState({}, "", "/publish");
  api.get.mockImplementation((url) =>
    Promise.resolve({
      data:
        url === "/user/me"
          ? {
              _id: "u1",
              account: { username: "Seller" },
              suspended: true,
              suspensionReason: "Under review",
              moderationVersion: 1,
            }
          : url === "/user/appeals"
            ? { appeals: [], count: 0, page: 1, limit: 10 }
            : {
                notifications: [],
                count: 0,
                unreadCount: 0,
                page: 1,
                limit: 10,
              },
    }),
  );
  render(<App />);
  await screen.findByRole("heading", { name: "Account status" });
  expect(window.location.pathname).toBe("/account-status");
  expect(screen.queryByRole("button", { name: "Publish" })).toBeNull();
  expect(screen.queryByRole("link", { name: "Browse items" })).toBeNull();
});
