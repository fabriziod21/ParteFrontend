import Spinner from 'react-bootstrap/Spinner';
import "../estilos/Carga.css";

function Carga() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-zinc-900 z-50">
      <Spinner animation="border" role="status" variant="light">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  );
}

export default Carga;
