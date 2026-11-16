import { t, errorText, useI18n } from "./i18n";
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { api } from "./api";
import "./App.css";
import Header from "./components/Header";
import Logo from "./assets/logo.svg";
import Home from "./pages/Home";
import Offer from "./pages/Offer";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Publish from "./pages/Publish";
import Payment from "./pages/Payment";
import NotFound from "./pages/NotFound";
import MyListings from "./pages/MyListings";
import EditListing from "./pages/EditListing";
import Seller from "./pages/Seller";
import Profile from "./pages/Profile";
import Favourites from "./pages/Favourites";
import Enquiries from "./pages/Enquiries";
import Enquiry from "./pages/Enquiry";
import BlockedUsers from "./pages/BlockedUsers";
import Moderation from "./pages/Moderation";
import AccountLink from "./pages/AccountLink";
import Recovery from "./pages/Recovery";
import Notifications from "./pages/Notifications";
import MyReports from "./pages/MyReports";
import AccountStatus from "./pages/AccountStatus";
import AccountModeration from "./pages/AccountModeration";
import Policy from "./pages/Policy";
import PolicyReview from "./pages/PolicyReview";
import RouteFocus from "./components/RouteFocus";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import OrderDisputes from "./pages/OrderDisputes";
export default function App() {
  useI18n();
  const [user, setUser] = useState(null),
    [ready, setReady] = useState(false);
  useEffect(() => {
    api
      .get("/user/me")
      .then((r) => setUser(r.data))
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);
  if (!ready) return <p role="status">{t("Loading session\u2026")}</p>;
  return (
    <BrowserRouter>
      <a className="skip-link" href="#main-content">
        {t("Skip to content")}
      </a>
      <RouteFocus />
      <Header logo={Logo} token={user} setUser={setUser} />
      <div id="main-content" tabIndex={-1}>
        {user?.suspended ? (
          <Routes>
            <Route path="/orders" element={<Orders user={user} />} />
            <Route path="/orders/:id" element={<OrderDetail user={user} />} />
            <Route
              path="/account-status"
              element={<AccountStatus user={user} setUser={setUser} />}
            />
            <Route
              path="/notifications"
              element={<Notifications user={user} />}
            />
            <Route
              path="*"
              element={<Navigate to="/account-status" replace />}
            />
          </Routes>
        ) : (
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/offer/:id" element={<Offer user={user} />} />
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/signup" element={<SignUp setUser={setUser} />} />
            <Route path="/publish" element={<Publish token={user} />} />
            <Route path="/my-listings" element={<MyListings user={user} />} />
            <Route
              path="/my-listings/:id/edit"
              element={<EditListing user={user} />}
            />
            <Route path="/seller/:id" element={<Seller user={user} />} />
            <Route
              path="/profile"
              element={<Profile user={user} setUser={setUser} />}
            />
            <Route path="/favourites" element={<Favourites user={user} />} />
            <Route path="/enquiries" element={<Enquiries user={user} />} />
            <Route path="/enquiries/:id" element={<Enquiry user={user} />} />
            <Route
              path="/blocked-users"
              element={<BlockedUsers user={user} />}
            />
            <Route
              path="/admin/moderation"
              element={<Moderation user={user} />}
            />
            <Route path="/recover" element={<Recovery />} />
            <Route
              path="/verify-email"
              element={<AccountLink mode="verify" setUser={setUser} />}
            />
            <Route
              path="/reset-password"
              element={<AccountLink mode="reset" setUser={setUser} />}
            />
            <Route path="/reports" element={<MyReports user={user} />} />
            <Route
              path="/notifications"
              element={<Notifications user={user} />}
            />
            <Route path="/orders" element={<Orders user={user} />} />
            <Route path="/orders/:id" element={<OrderDetail user={user} />} />
            <Route
              path="/admin/order-disputes"
              element={<OrderDisputes user={user} />}
            />
            <Route
              path="/admin/order-disputes/:id"
              element={<OrderDisputes user={user} />}
            />
            <Route path="/checkout/:id" element={<Checkout user={user} />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="*" element={<NotFound />} />
            <Route
              path="/account-status"
              element={<AccountStatus user={user} setUser={setUser} />}
            />
            <Route
              path="/admin/accounts"
              element={<AccountModeration user={user} />}
            />
            <Route path="/policy" element={<Policy />} />
            <Route
              path="/admin/policy"
              element={<PolicyReview user={user} />}
            />
          </Routes>
        )}
      </div>
    </BrowserRouter>
  );
}
