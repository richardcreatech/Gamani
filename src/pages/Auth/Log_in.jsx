import Login from "../../components/Login";

function Log_In() {
  return (
    <section className="auth_form_page">
      <div className="auth_intro">
        <h1>Welcome back</h1>
        <p>Please enter your details</p>
      </div>

      <Login />
    </section>
  );
}

export default Log_In;
