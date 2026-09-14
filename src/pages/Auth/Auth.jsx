import { Link, Outlet, useLocation } from "react-router-dom";
import logo from "../../assets/logo.png";

function Auth() {
  const { pathname } = useLocation();
  const isSignupPage = pathname === "/signup";

  return (
    <main id="auth_page">
      <img src={logo} alt="Logo" width={300} />
      <br />
      <div className="auth_content">
        <Outlet />
        <p className="auth_switch">
          {isSignupPage
            ? "Already have an account? "
            : "Don't have an account? "}
          <Link to={isSignupPage ? "/" : "/signup"}>
            {isSignupPage ? "Sign in" : "Sign up"}
          </Link>
        </p>
      </div>
    </main>
  );
}

export default Auth;
