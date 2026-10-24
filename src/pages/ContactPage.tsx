import React, { useState } from 'react';
import { Mail, Phone, MapPin, Instagram, Send, CheckCircle2 } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const ContactPage: React.FC = () => {
  const { showToast } = useShop();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Order & Sizing Inquiry');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setSent(true);
    showToast('Your message has been sent to our boutique styling team.');
  };

  return (
    <div className="pb-24">
      {/* Header */}
      <section className="bg-[#F5EFE8] py-14 sm:py-16 border-b border-[#E8DFD5] mb-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="text-xs uppercase tracking-[0.25em] text-[#A45543] font-bold block mb-2">
            Get In Touch
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2E221F] mb-3">
            We'd Love To Hear From You
          </h1>
          <p className="text-xs sm:text-sm text-[#7E726D] max-w-lg mx-auto">
            Questions regarding fit, fabric care, or custom event styling? Reach out and we'll be delighted to assist.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Contact Details */}
          <div className="md:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-lg border border-[#E8DFD5] shadow-2xs space-y-4 text-xs">
              <h2 className="font-serif text-lg font-bold text-[#2E221F] border-b border-[#E8DFD5] pb-3">
                Boutique Concierge
              </h2>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#A45543] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[#2E221F]">Email Support</strong>
                  <span className="text-[#7E726D]">care@stylistiq.in</span>
                  <p className="text-[10px] text-[#7E726D]">Mon - Sat: 10:00 AM - 7:00 PM IST</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#A45543] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[#2E221F]">Phone &amp; WhatsApp</strong>
                  <span className="text-[#7E726D]">+91 98765 43210</span>
                  <p className="text-[10px] text-[#7E726D]">Direct assistance for fit &amp; delivery</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Instagram className="w-4 h-4 text-[#A45543] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[#2E221F]">Instagram Direct</strong>
                  <a
                    href="https://www.instagram.com/styl_is_tiq/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#A45543] hover:underline"
                  >
                    @styl_is_tiq
                  </a>
                  <p className="text-[10px] text-[#7E726D]">Drop us a DM for quick sizing guidance</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#A45543] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[#2E221F]">Flagship Studio</strong>
                  <span className="text-[#7E726D]">STYL IS TIQ Atelier, Indiranagar, Bengaluru, KA 560038</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-7 bg-white p-6 sm:p-8 rounded-lg border border-[#E8DFD5] shadow-2xs">
            <h2 className="font-serif text-lg font-bold text-[#2E221F] mb-1">Send a Message</h2>
            <p className="text-xs text-[#7E726D] mb-6">Our boutique stylist typically responds within 2-4 hours.</p>

            {sent ? (
              <div className="p-6 bg-emerald-50 text-emerald-800 rounded-lg text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h3 className="font-serif text-base font-bold">Message Received</h3>
                <p className="text-xs text-emerald-700">
                  Thank you for writing to us. A stylist will review your request and get back to you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-[#2E221F] block mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Nair"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#D4C5B9] rounded focus:outline-none focus:border-[#A45543]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#2E221F] block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="priya@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#D4C5B9] rounded focus:outline-none focus:border-[#A45543]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#2E221F] block mb-1">Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#D4C5B9] rounded focus:outline-none focus:border-[#A45543]"
                  >
                    <option>Order &amp; Sizing Inquiry</option>
                    <option>Shipping &amp; Delivery Tracking</option>
                    <option>Exchange or Return Request</option>
                    <option>Custom Event / Bridal Bulk Order</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-[#2E221F] block mb-1">Message</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell us how we can help..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#D4C5B9] rounded focus:outline-none focus:border-[#A45543]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#A45543] hover:bg-[#8e4737] text-white text-xs font-bold uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
