
import React from 'react';
import { Bars } from 'react-loader-spinner';
import "../estilos/Carga.css";

const Carga = () => (
  <div className="loading-spinner">
    <Bars color="#00BFFF" height={80} width={80} />
  </div>
);

export default Carga;
