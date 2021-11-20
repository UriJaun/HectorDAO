import HectorIcon from "../../assets/icons/hector-nav-header.svg";
import "./notfound.scss";

export default function NotFound() {
  return (
    <div id="not-found">
      <div className="not-found-header">
        <a href="https://app.hectordao.com" target="_blank">
          <img className="branding-header-icon" src={HectorIcon} alt="HectorDAO" />
        </a>

        <h2 style={{ textAlign: "center" }}>Page not found</h2>
      </div>
    </div>
  );
}
