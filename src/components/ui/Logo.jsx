import Image from "next/image";

import logo from "../../../public/brand/logo.jpg";

/**
 * Isologo. El archivo es un JPG con fondo negro solido (no hay version
 * transparente), asi que SIEMPRE va sobre superficie oscura o dentro de un
 * contenedor negro. Ver D8/R7 del PLAN.
 *
 * `alt` vacio por defecto: en Navbar y Footer el nombre del negocio ya esta
 * como texto al lado, asi que repetirlo en el alt solo hace que el lector de
 * pantalla lo diga dos veces (y Lighthouse lo marca como image-redundant-alt).
 * Si alguna vez el logo va solo, se pasa `alt` explicito.
 */
export default function Logo({ size = 44, priority = false, className = "", alt = "" }) {
  return (
    <Image
      src={logo}
      alt={alt}
      width={size}
      height={size}
      priority={priority}
      sizes={`${size}px`}
      className={`rounded-lg bg-brand-black object-cover ${className}`}
    />
  );
}
