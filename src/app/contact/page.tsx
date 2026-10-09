import type { Metadata } from "next";
import { Clock3, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { store, hasContact } from "@/config/store";

export const metadata: Metadata = { title: "Contact", description: `Contact ${store.name}.` };

export default function ContactPage() {
  const { email, phone, whatsapp, address, hours } = store.contact;
  const digits = (value: string) => value.replace(/[^\d]/g, "");
  return (
    <main id="main" className="container page prose">
      <h1 className="page-title">Contact us</h1>
      {hasContact ? (
        <>
          <p className="lead">Include your order number and the product name so we can help faster.</p>
          <ul className="contact-list">
            {email && <li><Mail size={18} /><a href={`mailto:${email}`}>{email}</a></li>}
            {phone && <li><Phone size={18} /><a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a></li>}
            {whatsapp && <li><MessageCircle size={18} /><a href={`https://wa.me/${digits(whatsapp)}`} rel="noopener noreferrer" target="_blank">WhatsApp</a></li>}
            {address && <li><MapPin size={18} /><span>{address}</span></li>}
            {hours && <li><Clock3 size={18} /><span>{hours}</span></li>}
          </ul>
        </>
      ) : (
        <p className="banner">Contact details have not been added yet. Set NEXT_PUBLIC_SUPPORT_EMAIL, NEXT_PUBLIC_SUPPORT_PHONE or NEXT_PUBLIC_SUPPORT_WHATSAPP to show them here.</p>
      )}
    </main>
  );
}
