import nfd from "../Images/no-results.png";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="notadm">
      <img src={nfd} className="ntf" alt="Not-Authorized" width="150px" />
      <h3>Oops! Cette page n'a pas été trouvée !</h3>
      <Link to="/home" className="llnn">
        Aller à Home page
      </Link>
      <Link to="/" className="llnn">
        Aller à la page de connexion
      </Link>
    </div>
  );
}

export default NotFound;
