import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock, Send, Sparkles, MessageSquare } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    document.title = `Contact Us | Danny M Restaurant`;
    
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', "Get in touch with Danny M Restaurant. Find our Pretoria Central location, hours of operation, phone, email, and send us a direct message.");
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 4000);
  };

  return (
    <div className="pt-24 md:pt-32 bg-bg-dark animate-fade-in min-h-screen text-white/90 pb-20 relative">
      {/* Background glow elements */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-10 left-1/4 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-16">
        
        {/* Page Title */}
        <div className="text-center space-y-4">
          <span className="text-primary-light font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-primary-light" /> GET IN TOUCH
          </span>
          <h1 className="font-heading text-4xl md:text-6xl font-extrabold text-white tracking-tight">Contact Us</h1>
          <div className="w-20 h-1 bg-primary mx-auto rounded-full mt-2" />
        </div>

        {/* Contact details and Form Grid */}
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          
          {/* Left: Contact Info cards */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-bg-card p-8 rounded-3xl border border-white/5 space-y-6 shadow-xl">
              <h2 className="text-2xl font-heading font-extrabold text-white">Our Details</h2>
              <p className="text-white/60 text-sm leading-relaxed">
                Have questions about our traditional menu, group bookings, or catering services? Reach out directly, or visit us in Pretoria Central!
              </p>
              
              <div className="space-y-4 pt-2">
                {/* Address */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary-light flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Location</h4>
                    <p className="text-xs text-white/60 mt-1 leading-relaxed">
                      Schoeman Street, Pretoria Central,<br />Pretoria, 0002, South Africa
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary-light flex-shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Phone & WhatsApp</h4>
                    <p className="text-xs text-white/60 mt-1">
                      <a href="tel:+27123456789" className="hover:text-primary-light transition-colors">+27 12 345 6789</a>
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary-light flex-shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Email Address</h4>
                    <p className="text-xs text-white/60 mt-1">
                      <a href="mailto:info@dannymrestaurant.co.za" className="hover:text-primary-light transition-colors">info@dannymrestaurant.co.za</a>
                    </p>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary-light flex-shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Service Hours</h4>
                    <p className="text-xs text-white/60 mt-1 leading-relaxed">
                      Monday - Saturday: 09:00 - 17:00<br />Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Parking and Service warning card */}
            <div className="bg-[#151211] p-6 rounded-3xl border border-white/5 border-l-4 border-l-primary shadow-xl">
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary-light" /> Diner Information
              </h4>
              <p className="text-white/60 text-xs mt-2 leading-relaxed">
                Free street parking is available along Schoeman Street. We accept Debit Cards, NFC payments (Apple Pay, Google Pay), and online Yoco checkouts.
              </p>
            </div>
          </div>

          {/* Right: Message Form */}
          <div className="lg:col-span-7 bg-bg-card p-8 md:p-10 rounded-[2.5rem] border border-white/5 shadow-2xl relative">
            <h2 className="text-2xl font-heading font-extrabold text-white mb-6 flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-primary-light" /> Send a Message
            </h2>

            {isSubmitted ? (
              <div className="p-8 bg-primary/10 border border-primary/25 rounded-3xl text-center space-y-4 animate-fade-in my-8">
                <div className="w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center text-primary-light mx-auto">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">Thank You!</h3>
                <p className="text-sm text-white/70 max-w-sm mx-auto leading-relaxed">
                  Your message has been sent successfully. We will get back to you shortly as part of our Ubuntu promise.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-5 py-3.5 rounded-2xl border border-white/10 text-sm focus:border-primary focus:outline-none t-fire-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-5 py-3.5 rounded-2xl border border-white/10 text-sm focus:border-primary focus:outline-none t-fire-input"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="How can we help you?"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-5 py-3.5 rounded-2xl border border-white/10 text-sm focus:border-primary focus:outline-none t-fire-input"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Message</label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Tell us what's on your mind..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-5 py-3.5 rounded-2xl border border-white/10 text-sm focus:border-primary focus:outline-none t-fire-input resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-primary hover:bg-primary-light text-white font-bold rounded-2xl transition-all shadow-lg shadow-primary/20 hover:shadow-primary/45 border border-primary-light/10 text-sm tracking-widest uppercase flex items-center justify-center gap-2 cursor-pointer"
                >
                  Send Message <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Map Section */}
        <div className="bg-bg-card rounded-[2.5rem] p-6 border border-white/5 shadow-2xl relative overflow-hidden space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-heading font-extrabold text-white">Find Us on Google Maps</h2>
              <p className="text-white/60 text-sm mt-1">
                Located on Schoeman Street in the Pretoria Central business district.
              </p>
            </div>
            <a
              href="https://maps.google.com/?q=Schoeman+Street,+Pretoria+Central,+Pretoria"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary-light px-5 py-2.5 rounded-full text-xs font-bold transition-all uppercase tracking-widest"
            >
              Open in Google Navigation <MapPin className="w-4 h-4 text-primary-light" />
            </a>
          </div>

          <div className="relative w-full h-[400px] rounded-[1.5rem] overflow-hidden border border-white/10 shadow-inner bg-bg-dark">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3594.1378342410334!2d28.1880993!3d-25.7483002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1e956222b07ad3df%3A0xe10ad0ee709a341e!2sSchoeman%20St%2C%20Pretoria%20Central%2C%20Pretoria%2C%200002!5e0!3m2!1sen!2sza!4v1700000000000!5m2!1sen!2sza"
              className="absolute inset-0 w-full h-full border-0 opacity-80 hover:opacity-100 transition-opacity duration-300"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Danny M Pretoria Central Map"
            ></iframe>
          </div>
        </div>

      </div>
    </div>
  );
};
