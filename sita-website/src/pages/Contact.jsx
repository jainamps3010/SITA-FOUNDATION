import React, { useState } from 'react';
import './Contact.css';

const contactInfo = [
  {
    icon: '📍',
    title: 'Office Address',
    lines: ['SITA Foundation Office', 'Near SG Highway, Ahmedabad', 'Gujarat - 380054, India'],
  },
  {
    icon: '📞',
    title: 'Phone',
    lines: [
      { text: '+91 7069924365', link: 'tel:+917069924365' },
      { text: '+91 7069824365', link: 'tel:+917069824365' },
      { text: 'WhatsApp: +91 7069924365', link: 'https://wa.me/917069924365' },
    ],
  },
  {
    icon: '✉️',
    title: 'Email',
    lines: [{ text: 'chairman@sita.foundation', link: 'mailto:chairman@sita.foundation' }],
  },
  {
    icon: '🕐',
    title: 'Working Hours',
    lines: ['Monday – Saturday', '9:00 AM – 6:00 PM IST'],
  },
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', establishment: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!form.phone.trim() || !/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, ''))) e.phone = 'Valid 10-digit Indian mobile number required';
    if (!form.message.trim()) e.message = 'Message is required';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitted(true);
  };

  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => { const n = { ...e }; delete n[field]; return n; });
  };

  return (
    <div>
      <div className="page-hero">
        <div className="container">
          <span className="hero-tag">Get In Touch</span>
          <h1>Contact SITA Foundation</h1>
          <p>Have questions about membership, products, or delivery? We're here to help.</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="contact-grid">
            {/* Form */}
            <div className="contact-form-wrap">
              {submitted ? (
                <div className="success-card">
                  <div className="success-icon">✅</div>
                  <h2>Message Sent!</h2>
                  <p>Thank you for reaching out. Our team will get back to you within 24 hours.</p>
                  <button className="btn-primary" onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', establishment: '', subject: '', message: '' }); }}>
                    Send Another
                  </button>
                </div>
              ) : (
                <>
                  <h2>Send Us a Message</h2>
                  <p className="form-subtitle">Fill out the form below and we'll respond within 24 hours.</p>
                  <form onSubmit={handleSubmit} className="contact-form" noValidate>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Full Name *</label>
                        <input
                          type="text"
                          placeholder="Your full name"
                          value={form.name}
                          onChange={e => handleChange('name', e.target.value)}
                          className={errors.name ? 'error' : ''}
                        />
                        {errors.name && <span className="err">{errors.name}</span>}
                      </div>
                      <div className="form-group">
                        <label>Email Address *</label>
                        <input
                          type="email"
                          placeholder="your@email.com"
                          value={form.email}
                          onChange={e => handleChange('email', e.target.value)}
                          className={errors.email ? 'error' : ''}
                        />
                        {errors.email && <span className="err">{errors.email}</span>}
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Mobile Number *</label>
                        <input
                          type="tel"
                          placeholder="10-digit mobile number"
                          value={form.phone}
                          onChange={e => handleChange('phone', e.target.value)}
                          className={errors.phone ? 'error' : ''}
                        />
                        {errors.phone && <span className="err">{errors.phone}</span>}
                      </div>
                      <div className="form-group">
                        <label>Establishment Name</label>
                        <input
                          type="text"
                          placeholder="Hotel / Restaurant name"
                          value={form.establishment}
                          onChange={e => handleChange('establishment', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Subject</label>
                      <select value={form.subject} onChange={e => handleChange('subject', e.target.value)}>
                        <option value="">Select a topic</option>
                        <option value="membership">Membership Enquiry</option>
                        <option value="products">Product Information</option>
                        <option value="delivery">Delivery Issue</option>
                        <option value="vendor">Vendor Partnership</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Message *</label>
                      <textarea
                        placeholder="Tell us how we can help you..."
                        rows={5}
                        value={form.message}
                        onChange={e => handleChange('message', e.target.value)}
                        className={errors.message ? 'error' : ''}
                      />
                      {errors.message && <span className="err">{errors.message}</span>}
                    </div>
                    <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                      Send Message →
                    </button>
                  </form>
                </>
              )}
            </div>

            {/* Info */}
            <div className="contact-info">
              <h2>Contact Information</h2>
              <p className="info-subtitle">Reach us through any of these channels.</p>
              <div className="info-cards">
                {contactInfo.map((c) => (
                  <div key={c.title} className="info-card">
                    <div className="info-icon">{c.icon}</div>
                    <div>
                      <div className="info-title">{c.title}</div>
                      {c.lines.map((l) => {
                        const text = typeof l === 'string' ? l : l.text;
                        const link = typeof l === 'object' ? l.link : null;
                        return link
                          ? <a key={text} href={link} className="info-line link">{text}</a>
                          : <div key={text} className="info-line">{text}</div>;
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="vendor-cta">
                <h4>Are You a Vendor?</h4>
                <p>List your products on SITA and reach 500+ hotel buyers directly.</p>
                <a href="mailto:chairman@sita.foundation" className="btn-secondary">
                  Partner With Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
