import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
export default function App() {
  const [user, setUser] = useState(null),
    [ready, setReady] = useState(false);
  useEffect(() => {
    api
      .get("/user/me")
      .then((r) => setUser(r.data))
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);
  if (!ready) return <p role="status">Loading session…</p>;
  return (
    <BrowserRouter>
      <Header logo={Logo} token={user} setUser={setUser} />
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
        <Route path="/seller/:id" element={<Seller />} />
        <Route
          path="/profile"
          element={<Profile user={user} setUser={setUser} />}
        />
        <Route path="/favourites" element={<Favourites user={user} />} />
        <Route path="/enquiries" element={<Enquiries user={user} />} />
        <Route path="/enquiries/:id" element={<Enquiry user={user} />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
