import Contact from "@/components/sections/Contact";
import Events from "@/components/sections/Events";
import Faq from "@/components/sections/Faq";
import Hero from "@/components/sections/Hero";
import HowItWorks from "@/components/sections/HowItWorks";
import Services from "@/components/sections/Services";
import Testimonials from "@/components/sections/Testimonials";
import WhyUs from "@/components/sections/WhyUs";
import { assertContact } from "@/lib/contact";

// Si contact.json quedo mal editado, que rompa el build y no la produccion.
assertContact();

export default function Home() {
  return (
    <>
      <Hero />
      <Services />
      <HowItWorks />
      <Events />
      <WhyUs />
      <Testimonials />
      <Faq />
      <Contact />
    </>
  );
}
