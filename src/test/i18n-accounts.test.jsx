import React, { useState } from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import { test, expect, vi, afterEach } from "vitest";
import { I18nProvider, messages, setCurrentLanguage, t } from "../i18n";
import LanguagePicker from "../components/LanguagePicker";
import ListingFields from "../components/ListingFields";
import Recovery from "../pages/Recovery";
import AccountLink from "../pages/AccountLink";
import Verification from "../components/Verification";
import Notifications from "../pages/Notifications";
import { api } from "../api";
vi.mock("../api", () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
  errorMessage: (error) =>
    error.response?.data?.error || "Unable to connect. Please try again.",
  loadCatalogue: async () => ({
    categories: ["other", "clothing", "books"],
    locations: [],
  }),
}));
afterEach(() => {
  cleanup();
  vi.resetAllMocks();
  localStorage.clear();
  setCurrentLanguage("en");
  document.documentElement.lang = "en";
});
const wrap = (element) =>
  render(
    <I18nProvider>
      <MemoryRouter>{element}</MemoryRouter>
    </I18nProvider>,
  );
test("all three dictionaries have the same complete nonempty key set", () => {
  for (const locale of ["si", "ta"]) {
    expect(Object.keys(messages[locale]).sort()).toEqual(
      Object.keys(messages.en).sort(),
    );
    for (const text of Object.values(messages[locale]))
      expect(text.trim().length).toBeGreaterThan(0);
  }
  expect(Object.keys(messages.en).length).toBeGreaterThan(250);
});
test("switching languages updates labels but preserves state and canonical API enum values", async () => {
  function Form() {
    const [value, setValue] = useState({
      title: "My user title",
      description: "An English user description",
      price: 100,
      condition: "Used",
      size: "M",
      category: "clothing",
    });
    return (
      <>
        <LanguagePicker />
        <ListingFields value={value} onChange={setValue} />
      </>
    );
  }
  wrap(<Form />);
  fireEvent.change(screen.getByLabelText("Language"), {
    target: { value: "si" },
  });
  expect(document.documentElement.lang).toBe("si");
  expect(screen.getByLabelText("මාතෘකාව").value).toBe("My user title");
  expect(screen.getByLabelText("තත්ත්වය").value).toBe("Used");
  fireEvent.change(screen.getByLabelText("තත්ත්වය"), {
    target: { value: "Like New" },
  });
  expect(screen.getByLabelText("තත්ත්වය").value).toBe("Like New");
  fireEvent.change(screen.getByLabelText("භාෂාව"), { target: { value: "ta" } });
  expect(document.documentElement.lang).toBe("ta");
  expect(screen.getByLabelText("தலைப்பு").value).toBe("My user title");
  expect(screen.getByLabelText("நிலை").value).toBe("Like New");
  expect(localStorage.getItem("language")).toBe("ta");
  cleanup();
  wrap(<LanguagePicker />);
  expect(screen.getByLabelText("மொழி").value).toBe("ta");
});
test("recovery requests the selected email language with a generic success response", async () => {
  api.post.mockResolvedValue({});
  wrap(
    <>
      <LanguagePicker />
      <Recovery />
    </>,
  );
  fireEvent.change(screen.getByLabelText("Language"), {
    target: { value: "ta" },
  });
  fireEvent.change(screen.getByLabelText("மின்னஞ்சல்"), {
    target: { value: "person@example.invalid" },
  });
  fireEvent.click(screen.getByText("மீட்பு இணைப்பை அனுப்பு"));
  await screen.findByRole("status");
  expect(api.post).toHaveBeenCalledWith("/user/recovery/request", {
    email: "person@example.invalid",
    locale: "ta",
  });
});
test("verification link removes its fragment and requires explicit confirmation", async () => {
  function Location() {
    return (
      <output aria-label="fragment">{useLocation().hash || "cleared"}</output>
    );
  }
  api.post.mockResolvedValue({});
  render(
    <I18nProvider>
      <MemoryRouter initialEntries={["/verify-email#token=" + "b".repeat(64)]}>
        <Routes>
          <Route
            path="/verify-email"
            element={
              <>
                <AccountLink mode="verify" setUser={vi.fn()} />
                <Location />
              </>
            }
          />
        </Routes>
      </MemoryRouter>
    </I18nProvider>,
  );
  await waitFor(() =>
    expect(screen.getByLabelText("fragment").textContent).toBe("cleared"),
  );
  expect(api.post).not.toHaveBeenCalled();
  fireEvent.click(screen.getByText("Confirm email"));
  await screen.findByRole("status");
  expect(api.post).toHaveBeenCalledWith("/user/verification/confirm", {
    token: "b".repeat(64),
  });
});
test("password reset clears stale frontend authentication only after confirmation", async () => {
  const setUser = vi.fn();
  api.post.mockResolvedValue({});
  render(
    <I18nProvider>
      <MemoryRouter
        initialEntries={["/reset-password#token=" + "c".repeat(64)]}
      >
        <Routes>
          <Route
            path="/reset-password"
            element={<AccountLink mode="reset" setUser={setUser} />}
          />
        </Routes>
      </MemoryRouter>
    </I18nProvider>,
  );
  fireEvent.change(screen.getByLabelText("New password"), {
    target: { value: "new-secure-password" },
  });
  fireEvent.click(screen.getByText("Set new password"));
  await screen.findByRole("status");
  expect(setUser).toHaveBeenCalledWith(null);
  expect(api.post).toHaveBeenCalledWith("/user/recovery/confirm", {
    token: "c".repeat(64),
    password: "new-secure-password",
  });
});
test("verification controls resend and refresh user state", async () => {
  const setUser = vi.fn();
  api.post.mockResolvedValue({});
  api.get.mockResolvedValue({ data: { emailVerified: true } });
  wrap(<Verification user={{ emailVerified: false }} setUser={setUser} />);
  fireEvent.click(screen.getByText("Send verification link"));
  await screen.findByText("Check your email for a verification link");
  fireEvent.click(screen.getByText("Refresh verification status"));
  await waitFor(() =>
    expect(setUser).toHaveBeenCalledWith({ emailVerified: true }),
  );
});
test("notifications expose unread state and update a single notification", async () => {
  api.get
    .mockResolvedValueOnce({
      data: {
        notifications: [{ _id: "n1", type: "message", link: "/enquiries/e1" }],
        unreadCount: 1,
        count: 1,
        page: 1,
        limit: 10,
      },
    })
    .mockResolvedValue({
      data: {
        notifications: [
          {
            _id: "n1",
            type: "message",
            link: "/enquiries/e1",
            readAt: "2026-01-01",
          },
        ],
        unreadCount: 0,
        count: 1,
        page: 1,
        limit: 10,
      },
    });
  api.patch.mockResolvedValue({});
  wrap(<Notifications user={{ _id: "u1" }} />);
  await screen.findByText("New enquiry message");
  fireEvent.click(screen.getByText("Mark read"));
  await screen.findByText("Read");
  expect(api.patch).toHaveBeenCalledWith("/user/notifications/n1/read");
});

test("translated browsing retains canonical default sort values", async () => {
  const { default: Home } = await import("../pages/Home");
  api.get.mockResolvedValue({
    data: { offers: [], count: 0, page: 1, limit: 10 },
  });
  wrap(
    <>
      <LanguagePicker />
      <Home />
    </>,
  );
  fireEvent.change(screen.getByLabelText("Language"), {
    target: { value: "si" },
  });
  await screen.findByText("ඔබගේ සෙවුමට ගැළපෙන දැන්වීම් නොමැත.");
  expect(screen.getByLabelText("අනුපිළිවෙළ").value).toBe("newest");
});
test("unknown catalogue identifiers cannot access dictionary prototypes", () => {
  expect(t("constructor")).toBe("constructor");
  setCurrentLanguage("constructor");
  expect(t("Language")).toBe("Language");
});

test("report notification destination shows only the signed-in users status list", async () => {
  const { default: MyReports } = await import("../pages/MyReports");
  api.get.mockResolvedValue({
    data: {
      reports: [
        {
          _id: "r1",
          targetType: "listing",
          reason: "scam",
          status: "resolved",
        },
      ],
      count: 1,
      page: 1,
      limit: 10,
    },
  });
  wrap(<MyReports user={{ _id: "u1" }} />);
  await screen.findByText("listing: scam");
  expect(screen.getByText("Status: resolved")).toBeTruthy();
  expect(api.get).toHaveBeenCalledWith("/user/reports", {
    params: { page: "1" },
  });
});
