import SignUp from "../../components/SignUp";
import logo from "../../assets/logo.png";

function Sign_Up() {
  return (
    <section className="auth_form_page">

      <div className="auth_intro">
        <h1>Join Us Today</h1>
        <p>Who do we have the pleasure of meeting?</p>
      </div>

      <SignUp />
    </section>
  );
}

export default Sign_Up;
