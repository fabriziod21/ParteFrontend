import React from 'react';
import Tooltip from "./Tooltip";

const Footer = ({ darkMode }) => {
    return (
        <>
            <div className={`py-8 ${darkMode ? 'bg-[#191919] border-t border-gray-700' : 'bg-gray-100'} footer`}>
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between">
                        <div className="mb-6 md:mb-0 md:w-1/3">
                            <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-white'} font-cursive tracking-wide`}>
                                <span className={darkMode ? 'text-[#ff4d4d]' : 'text-[#ff4d4d]'}>Mor</span>Vic
                            </h3>
                            <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'} font-medium px-0 md:px-20`}>
                                En MorVic, combinamos elegancia y precisión. Nuestros relojes son diseñados para quienes valoran la artesanía y el tiempo.
                            </p>
                            <div className="footer-icons mt-3 flex">
                                <Tooltip />
                            </div>
                        </div>
                        <div className="mb-6 md:mb-0 md:w-1/3">
                            <h5 className={`text-lg font-semibold ${darkMode ? 'text-[#ff4d4d]' : 'text-[#ff4d4d]'}`}>Enlaces Rápidos</h5>
                            <ul className="mt-2 list-none p-0">
                                <li className="nav-item py-1">
                                    <a className={`block ${darkMode ? 'text-white' : 'text-gray-700 '}`} href="/">Nuestra Colección</a>
                                </li>
                                <li className="nav-item py-1">
                                    <a className={`block ${darkMode ? 'text-white hover:text-red-400' : 'text-gray-700 hover:text-red-500'}`} href="/">Historia</a>
                                </li>
                                <li className="nav-item py-1">
                                    <a className={`block ${darkMode ? 'text-white hover:text-red-400' : 'text-gray-700 hover:text-red-500'}`} href="/">Atención al Cliente</a>
                                </li>
                                <li className="nav-item py-1">
                                    <a className={`block ${darkMode ? 'text-white hover:text-red-400' : 'text-gray-700 hover:text-red-500'}`} href="/">Términos y Condiciones</a>
                                </li>
                            </ul>
                        </div>
                        <div className="md:w-1/3">
                            <h5 className={`text-lg font-semibold ${darkMode ? 'text-red-500' : 'text-red-600'}`}>Información de Contacto</h5>
                            <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'} font-medium`}>
                                <i className="fa-solid fa-phone-volume"></i> +92 3121324083
                            </p>
                            <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'} font-medium`}>
                                <i className="fa-solid fa-envelope"></i> contacto@morvic.com
                            </p>
                            <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'} font-medium`}>
                                <i className="fa-solid fa-map-marker-alt"></i> Lima, Perú
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div className={`bg-black text-white text-center py-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <p className="text-lg font-bold">Relojería MorVic</p>
            </div>
        </>
    );
}

export default Footer;
