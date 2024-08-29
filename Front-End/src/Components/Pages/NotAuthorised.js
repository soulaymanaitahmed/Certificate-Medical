import { Link } from "react-router-dom";

import notauto from "../Images/block.png";

function NotAuthorised() {
  return (
    <div className="notadm">
      <img
        src={notauto}
        className="noauto"
        alt="Not-Authorized"
        width="100px"
      />
      <h4>
        <span className="kk77">
          Oops! Vous n'êtes pas autorisé à accéder à cette page !
        </span>
        <br />
        <br />
        Vous devez vous connecter pour accéder à cette page, ou sinon vos
        privilèges ne vous donnent pas accès.
      </h4>
      <Link to="/" className="llnn">
        Aller à la page de connexion
      </Link>
    </div>
  );
}

export default NotAuthorised;
