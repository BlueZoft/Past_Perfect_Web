import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, errorMessage } from "../api";
export default function Header({ logo, token, setUser }) {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  async function logout() {
    try {
      await api.post("/user/logout");
      setUser(null);
      navigate("/");
    } catch (err) {
      if (err.response?.status === 401) {
        setUser(null);
        navigate("/");
      } else setError(errorMessage(err));
    }
  }
  return (
    <header className="header container">
      <Link to="/">
        <img className="logo" src={logo} alt="PastPerfect home" />
      </Link>
      <nav>
        <Link to="/">Browse items</Link> {" · "}
        <Link to="/publish">Sell an item</Link> {" · "}
        {token ? (
          <>
            <Link to="/profile">My profile</Link> {" · "}
            <Link to="/favourites">Favourites</Link> {" · "}
            <Link to="/enquiries">Enquiries</Link> {" · "}
            <Link to="/my-listings">My listings</Link> {" · "}
            <button onClick={logout}>Sign out</button>
          </>
        ) : (
          <>
            <Link to="/login">Log in</Link> {" · "}
            <Link to="/signup">Sign up</Link>
          </>
        )}
      </nav>
      {error && <p role="alert">{error}</p>}
    </header>
  );
}
