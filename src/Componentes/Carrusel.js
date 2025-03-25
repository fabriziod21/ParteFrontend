import Carousel from 'react-bootstrap/Carousel';
import cxxxImage from '../imagenes/cxxx.jpeg'; // Import the image directly
import vcc from "../imagenes/VCC.jpeg"
import  "../estilos/Carrusel.css"
function Carrusel() {
  return (
    <Carousel>
      <Carousel.Item interval={1000} >
        <img
          className="d-block w-100"
          src={cxxxImage}
          alt="First slide"
        />
        <Carousel.Caption>
          <h3>First slide label</h3>
          <p>Nulla vitae elit libero, a pharetra augue mollis interdum.</p>
        </Carousel.Caption>
      </Carousel.Item>
            <Carousel.Item interval={1000}>
        <img
          className="d-block w-100"
          src={vcc}
          alt="First slide"
        />
        <Carousel.Caption>
          <h3>First slide label</h3>
          <p>Nulla vitae elit libero, a pharetra augue mollis interdum.</p>
        </Carousel.Caption>
      </Carousel.Item>
    </Carousel>
  );
}

export default Carrusel;
