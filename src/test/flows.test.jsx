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
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    put: vi.fn(),
  },
  errorMessage: (e) =>
    e.response?.data?.error || "Unable to connect. Please try again.",
  imageUrl: (url) => url,
  loadCatalogue: async () => ({
    categories: ["other", "clothing", "books"],
    locations: [
      {
        id: "sample-district",
        label: "Example district (placeholder)",
        towns: ["Example town"],
      },
    ],
  }),
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
  expect(screen.getByRole("link", { name: "Seller" })).toBeTruthy();
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

test("district changes clear stale town filters while preserving search", async () => {
  api.get.mockResolvedValue({
    data: { offers: [], count: 0, page: 1, limit: 10 },
  });
  renderRoute(
    <Home />,
    "/?title=Book&district=sample-district&town=Example+town",
  );
  await screen.findByText("No listings match your search.");
  fireEvent.change(screen.getByLabelText("District"), {
    target: { value: "" },
  });
  await waitFor(() => {
    const query = api.get.mock.calls.at(-1)[1].params;
    expect(query.get("district")).toBeNull();
    expect(query.get("town")).toBeNull();
    expect(query.get("title")).toBe("Book");
  });
});

test("listing actions save a favourite and open a buyer enquiry", async () => {
  const { default: ListingActions } =
    await import("../components/ListingActions");
  api.get.mockResolvedValue({ data: { saved: false } });
  api.put.mockResolvedValue({});
  api.post.mockResolvedValue({ data: { _id: "thread1" } });
  render(
    <MemoryRouter initialEntries={["/offer/1"]}>
      <Routes>
        <Route
          path="/offer/:id"
          element={
            <ListingActions
              listing={{ _id: "1", status: "active", owner: { _id: "seller" } }}
              user={{ _id: "buyer" }}
            />
          }
        />
        <Route path="/enquiries/:id" element={<p>Conversation opened</p>} />
      </Routes>
    </MemoryRouter>,
  );
  await waitFor(() =>
    expect(screen.getByText("Save to favourites").disabled).toBe(false),
  );
  fireEvent.click(screen.getByText("Save to favourites"));
  await screen.findByText("Remove favourite");
  expect(api.put).toHaveBeenCalledWith("/user/favourites/1");
  fireEvent.change(screen.getByLabelText("Ask the seller"), {
    target: { value: "Is it available?" },
  });
  fireEvent.click(screen.getByText("Send enquiry"));
  await screen.findByText("Conversation opened");
  expect(api.post).toHaveBeenCalledWith("/offer/1/enquiries", {
    message: "Is it available?",
  });
});

test("seller cannot enquire about their own listing", async () => {
  const { default: ListingActions } =
    await import("../components/ListingActions");
  api.get.mockResolvedValue({ data: { saved: false } });
  renderRoute(
    <ListingActions
      listing={{ _id: "1", status: "active", owner: { _id: "seller" } }}
      user={{ _id: "seller" }}
    />,
  );
  await waitFor(() =>
    expect(screen.getByText("Save to favourites").disabled).toBe(false),
  );
  expect(screen.queryByLabelText("Ask the seller")).toBeNull();
});

test("conversation renders plain text and sends replies to the routed thread", async () => {
  const { default: Enquiry } = await import("../pages/Enquiry");
  api.get.mockResolvedValue({
    data: {
      enquiry: {
        title: "Book",
        buyer: { _id: "buyer", account: { username: "Buyer" } },
        seller: { _id: "seller", account: { username: "Seller" } },
      },
      messages: [
        {
          _id: "m1",
          sender: "seller",
          text: "<script>unsafe()</script>",
          createdAt: "2026-01-01T00:00:00Z",
        },
      ],
      count: 1,
      page: 1,
      limit: 10,
    },
  });
  api.post.mockResolvedValue({});
  render(
    <MemoryRouter initialEntries={["/enquiries/t1"]}>
      <Routes>
        <Route
          path="/enquiries/:id"
          element={<Enquiry user={{ _id: "buyer" }} />}
        />
      </Routes>
    </MemoryRouter>,
  );
  await screen.findByText("<script>unsafe()</script>");
  expect(document.querySelector("script")).toBeNull();
  fireEvent.change(screen.getByLabelText("Reply"), {
    target: { value: "Thank you" },
  });
  fireEvent.click(screen.getByText("Send reply"));
  await waitFor(() =>
    expect(api.post).toHaveBeenCalledWith("/enquiry/t1/messages", {
      message: "Thank you",
    }),
  );
});

test("profile form saves public fields only", async () => {
  const { default: Profile } = await import("../pages/Profile");
  const setUser = vi.fn();
  api.patch.mockResolvedValue({
    data: { _id: "u1", account: { username: "New name", bio: "Bio" } },
  });
  renderRoute(
    <Profile
      user={{ _id: "u1", account: { username: "Old name" } }}
      setUser={setUser}
    />,
  );
  fireEvent.change(screen.getByLabelText("Username"), {
    target: { value: "New name" },
  });
  fireEvent.change(screen.getByLabelText("Bio"), { target: { value: "Bio" } });
  fireEvent.click(screen.getByText("Save profile"));
  await screen.findByText("Profile saved.");
  expect(api.patch).toHaveBeenCalledWith("/user/profile", {
    username: "New name",
    bio: "Bio",
  });
  expect(setUser).toHaveBeenCalled();
});

test("photo replacement sends the current version and all selected files", async () => {
  const { default: ReplaceImages } =
    await import("../components/ReplaceImages");
  const onSaved = vi.fn();
  const create = URL.createObjectURL,
    revoke = URL.revokeObjectURL;
  URL.createObjectURL = vi.fn(() => "blob:replacement");
  URL.revokeObjectURL = vi.fn();
  try {
    api.put.mockResolvedValue({ data: { _id: "1", __v: 5, images: [] } });
    renderRoute(
      <ReplaceImages
        listing={{ _id: "1", __v: 4, images: [] }}
        onSaved={onSaved}
      />,
    );
    fireEvent.change(screen.getByLabelText("Replacement photos"), {
      target: {
        files: [new File(["photo"], "image.png", { type: "image/png" })],
      },
    });
    fireEvent.click(screen.getByText("Replace all photos"));
    await screen.findByText("Photos replaced.");
    expect(api.put.mock.calls[0][0]).toBe("/offer/1/images");
    const form = api.put.mock.calls[0][1];
    expect(form.get("version")).toBe("4");
    expect(form.getAll("images")).toHaveLength(1);
    expect(onSaved).toHaveBeenCalled();
    cleanup();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:replacement");
  } finally {
    URL.createObjectURL = create;
    URL.revokeObjectURL = revoke;
  }
});

test("avatar editor sends a private versioned upload and updates session user state", async () => {
  const { default: AvatarEditor } = await import("../components/AvatarEditor");
  const setUser = vi.fn();
  const create = URL.createObjectURL,
    revoke = URL.revokeObjectURL;
  URL.createObjectURL = vi.fn(() => "blob:avatar");
  URL.revokeObjectURL = vi.fn();
  try {
    api.put.mockResolvedValue({
      data: {
        _id: "u1",
        account: { avatar: { url: "/uploads/new.png" } },
        avatarVersion: 2,
      },
    });
    renderRoute(
      <AvatarEditor
        user={{ _id: "u1", account: {}, avatarVersion: 1 }}
        setUser={setUser}
      />,
    );
    fireEvent.change(screen.getByLabelText("New avatar"), {
      target: {
        files: [new File(["photo"], "avatar.png", { type: "image/png" })],
      },
    });
    fireEvent.click(screen.getByText("Save avatar"));
    await waitFor(() => expect(setUser).toHaveBeenCalled());
    expect(api.put.mock.calls[0][0]).toBe("/user/avatar");
    expect(api.put.mock.calls[0][1].get("version")).toBe("1");
    cleanup();
  } finally {
    URL.createObjectURL = create;
    URL.revokeObjectURL = revoke;
  }
});

test("report UI submits only the selected target and review details", async () => {
  const { default: ReportControl } =
    await import("../components/ReportControl");
  api.post.mockResolvedValue({ data: { _id: "r1" } });
  renderRoute(
    <ReportControl targetType="listing" target="l1" label="Report listing" />,
  );
  fireEvent.click(screen.getByText("Report listing"));
  fireEvent.change(screen.getByLabelText("Report reason"), {
    target: { value: "scam" },
  });
  fireEvent.change(screen.getByLabelText("Report details"), {
    target: { value: "Please review this item" },
  });
  fireEvent.click(screen.getByText("Submit report"));
  await screen.findByText("Report received for review.");
  expect(api.post).toHaveBeenCalledWith("/reports", {
    targetType: "listing",
    target: "l1",
    reason: "scam",
    details: "Please review this item",
  });
});

test("block control can block and unblock without exposing another users block list", async () => {
  const { default: BlockControl } = await import("../components/BlockControl");
  api.get.mockResolvedValue({ data: { blocked: false } });
  api.put.mockResolvedValue({});
  api.delete.mockResolvedValue({});
  renderRoute(<BlockControl target="u2" />);
  await waitFor(() =>
    expect(screen.getByText("Block user").disabled).toBe(false),
  );
  fireEvent.click(screen.getByText("Block user"));
  await screen.findByText("Unblock user");
  expect(api.put).toHaveBeenCalledWith("/user/blocks/u2");
  fireEvent.click(screen.getByText("Unblock user"));
  await screen.findByText("Block user");
  expect(api.delete).toHaveBeenCalledWith("/user/blocks/u2");
});

test("ordinary users cannot load the moderation queue", async () => {
  const { default: Moderation } = await import("../pages/Moderation");
  renderRoute(<Moderation user={{ _id: "u1", isAdmin: false }} />);
  await screen.findByText("Administrator access required");
  expect(api.get).not.toHaveBeenCalled();
});

test("admin listing visibility and report resolution are explicit versioned decisions", async () => {
  const { default: Moderation } = await import("../pages/Moderation");
  api.get.mockImplementation((url) =>
    Promise.resolve({
      data:
        url === "/admin/reports"
          ? {
              reports: [
                {
                  _id: "r1",
                  targetType: "listing",
                  target: "l1",
                  reason: "scam",
                  snapshot: "A listing",
                  status: "open",
                  __v: 2,
                },
              ],
              count: 1,
              page: 1,
              limit: 10,
            }
          : {
              _id: "l1",
              title: "Book",
              status: "active",
              moderationHidden: false,
              __v: 7,
            },
    }),
  );
  api.patch.mockResolvedValue({
    data: {
      _id: "l1",
      title: "Book",
      status: "active",
      moderationHidden: true,
      __v: 8,
    },
  });
  renderRoute(<Moderation user={{ _id: "admin", isAdmin: true }} />);
  await screen.findByText("Load current listing");
  fireEvent.click(screen.getByText("Load current listing"));
  await screen.findByText("Hide listing");
  fireEvent.change(screen.getByLabelText("Moderation note"), {
    target: { value: "Under investigation" },
  });
  fireEvent.click(screen.getByText("Hide listing"));
  await screen.findByText("Restore visibility");
  expect(api.patch).toHaveBeenCalledWith("/admin/offers/l1/moderation", {
    hidden: true,
    reason: "Under investigation",
    version: 7,
  });
  fireEvent.click(screen.getByText("Resolve report"));
  await waitFor(() =>
    expect(api.patch).toHaveBeenCalledWith("/admin/reports/r1", {
      status: "resolved",
      resolution: "Under investigation",
      version: 2,
    }),
  );
});
