import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { vi, afterEach, test, expect } from "vitest";
import Home from "../pages/Home";
import Offer from "../pages/Offer";
import Login from "../pages/Login";
import Payment from "../pages/Payment";
import { api } from "../api";
vi.mock("../api", () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
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

test("publishing reports API errors instead of crashing on a shadowed helper", async () => {
  const { default: Publish } = await import("../pages/Publish");
  const create = URL.createObjectURL,
    revoke = URL.revokeObjectURL;
  URL.createObjectURL = vi.fn(() => "blob:photo");
  URL.revokeObjectURL = vi.fn();
  try {
    api.post.mockRejectedValue({
      response: { data: { error: "Upload temporarily unavailable" } },
    });
    renderRoute(<Publish token={{ _id: "seller" }} />);
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "A used book" },
    });
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "A good book in used condition" },
    });
    fireEvent.change(screen.getByLabelText("Price (LKR)"), {
      target: { value: "100" },
    });
    fireEvent.change(screen.getByLabelText("Condition"), {
      target: { value: "Used" },
    });
    fireEvent.change(screen.getByLabelText("Add photos"), {
      target: {
        files: [new File(["image"], "book.png", { type: "image/png" })],
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Publish" }));
    expect((await screen.findByRole("alert")).textContent).toContain(
      "Upload temporarily unavailable",
    );
    cleanup();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:photo");
  } finally {
    URL.createObjectURL = create;
    URL.revokeObjectURL = revoke;
  }
});

test("seller actions send listing versions and removal needs confirmation", async () => {
  const { default: MyListings } = await import("../pages/MyListings");
  const listing = {
    _id: "listing1",
    title: "Book",
    price: 100,
    status: "active",
    __v: 3,
  };
  api.get.mockResolvedValue({
    data: { offers: [listing], count: 1, page: 1, limit: 10 },
  });
  api.patch.mockResolvedValue({
    data: { ...listing, status: "reserved", __v: 4 },
  });
  api.delete.mockResolvedValue({});
  renderRoute(<MyListings user={{ _id: "seller" }} />);
  await screen.findByText("Book");
  fireEvent.click(screen.getByText("Reserve"));
  await waitFor(() =>
    expect(api.patch).toHaveBeenCalledWith("/offer/listing1/status", {
      status: "reserved",
      version: 3,
    }),
  );
  await waitFor(() => expect(screen.queryByRole("status")).toBeNull());
  fireEvent.click(screen.getByText("Remove listing"));
  expect(api.delete).not.toHaveBeenCalled();
  fireEvent.click(screen.getByText("Cancel"));
  expect(api.delete).not.toHaveBeenCalled();
  fireEvent.click(screen.getByText("Remove listing"));
  fireEvent.click(screen.getByText("Confirm removal"));
  await waitFor(() =>
    expect(api.delete).toHaveBeenCalledWith("/offer/listing1", {
      data: { version: 3 },
    }),
  );
});

test("seller dashboard exposes conflicts with reload and does not silently discard them", async () => {
  const { default: MyListings } = await import("../pages/MyListings");
  api.get.mockResolvedValue({
    data: {
      offers: [
        { _id: "1", title: "Book", price: 100, status: "active", __v: 0 },
      ],
      count: 1,
      page: 1,
      limit: 10,
    },
  });
  api.patch.mockRejectedValue({
    response: {
      status: 409,
      data: { error: "Listing changed. Reload before trying again." },
    },
  });
  renderRoute(<MyListings user={{ _id: "seller" }} />);
  await screen.findByText("Book");
  fireEvent.click(screen.getByText("Mark sold"));
  expect((await screen.findByRole("alert")).textContent).toContain(
    "Listing changed",
  );
  fireEvent.click(screen.getByText("Reload listings"));
  await waitFor(() => expect(api.get).toHaveBeenCalledTimes(2));
});

test("edit form preserves the original version when saving", async () => {
  const { default: EditListing } = await import("../pages/EditListing");
  api.get.mockResolvedValue({
    data: {
      _id: "1",
      title: "Book",
      description: "A book in good condition",
      price: 100,
      condition: "Used",
      size: "",
      status: "active",
      owner: { _id: "seller" },
      __v: 7,
    },
  });
  api.patch.mockResolvedValue({});
  render(
    <MemoryRouter initialEntries={["/my-listings/1/edit"]}>
      <Routes>
        <Route
          path="/my-listings/:id/edit"
          element={<EditListing user={{ _id: "seller" }} />}
        />
        <Route path="/my-listings" element={<p>Saved dashboard</p>} />
      </Routes>
    </MemoryRouter>,
  );
  await screen.findByLabelText("Title");
  fireEvent.change(screen.getByLabelText("Price (LKR)"), {
    target: { value: "200" },
  });
  fireEvent.click(screen.getByText("Save changes"));
  await waitFor(() =>
    expect(api.patch).toHaveBeenCalledWith(
      "/offer/1",
      expect.objectContaining({ price: 200, version: 7 }),
    ),
  );
  await screen.findByText("Saved dashboard");
});

test("seller management redirects anonymous users before fetching private data", async () => {
  const { default: MyListings } = await import("../pages/MyListings");
  render(
    <MemoryRouter initialEntries={["/my-listings"]}>
      <Routes>
        <Route path="/my-listings" element={<MyListings user={null} />} />
        <Route path="/login" element={<p>Please log in</p>} />
      </Routes>
    </MemoryRouter>,
  );
  await screen.findByText("Please log in");
  expect(api.get).not.toHaveBeenCalled();
});
