import {
  Bus,
  CalendarCheck,
  Car,
  Clock,
  CreditCard,
  HeartHandshake,
  Luggage,
  MessageCircle,
  MapPin,
  Plane,
  Route,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

/**
 * Mapa de los iconos que puede nombrar `content.json`.
 * Es una lista cerrada a proposito: asi el JSON no puede traer cualquier cosa
 * y solo se empaqueta lo que se usa.
 */
const ICONS = {
  Bus,
  CalendarCheck,
  Car,
  Clock,
  CreditCard,
  HeartHandshake,
  Luggage,
  MessageCircle,
  MapPin,
  Plane,
  Route,
  ShieldCheck,
  Sparkles,
  Users,
};

export default function Icon({ name, className = "size-6" }) {
  const Component = ICONS[name] ?? Sparkles;
  return <Component className={className} aria-hidden="true" focusable="false" />;
}
