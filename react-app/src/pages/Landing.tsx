import "./Landing.css";

const Landing = () => {
  return (
    <div className="landing-page">
      <div className="centered-text">
        <h1>DxHub Automated Procurement</h1>
        <h2>Powered by AWS</h2>
        <div className="button-row">
          <ul className="ul-row">
            <li>
              <a href="/sow-intro" className="button">
                Scope of Work Generator
              </a>
            </li>
            <li>
              <a href="/amend-clause" className="button">
                Amend Clause
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Landing;
