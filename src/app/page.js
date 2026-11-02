import Contact from "@/components/sections/Contact";
import Events from "@/components/sections/Events";
import Faq from "@/components/sections/Faq";
import Hero from "@/components/sections/Hero";
import HowItWorks from "@/components/sections/HowItWorks";
import Services from "@/components/sections/Services";
import Testimonials from "@/components/sections/Testimonials";
import WhyUs from "@/components/sections/WhyUs";
import { assertContact } from "@/lib/contact";
import { getEvents } from "@/lib/events-source";

// Si contact.json quedo mal editado, que rompa el build y no la produccion.
assertContact();

export default async function Home() {
  // Fuente activa: la Google Sheet de `contact.eventsSheet` o, si no hay,
  // `src/data/events.json`. Cacheado con `use cache` (ver events-source.js).
  const eventos = await getEvents();

  return (
    <>
      <Hero />
      <Services />
      <HowItWorks />
      <Events events={eventos} />
      <WhyUs />
      <Testimonials />
      <Faq />
      <Contact />
    </>
  );
}
