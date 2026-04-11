import React from 'react';
import './About.css';

const team = [
  { name: 'Rajesh Patel', role: 'Founder & Chairman', emoji: '👨‍💼', bio: 'Hospitality veteran with 20+ years of experience in hotel operations across Gujarat.' },
  { name: 'Meera Shah', role: 'Co-Founder & CEO', emoji: '👩‍💼', bio: 'Supply chain expert who built distribution networks for FMCG brands across Western India.' },
  { name: 'Amit Verma', role: 'Head of Vendor Relations', emoji: '🤝', bio: 'Manages relationships with 120+ verified vendors to ensure quality and timely delivery.' },
  { name: 'Priya Desai', role: 'Head of Operations', emoji: '⚙️', bio: 'Oversees daily logistics and ensures seamless procurement for every member.' },
  { name: 'Karan Mehta', role: 'Technology Lead', emoji: '💻', bio: 'Built the SITA Business Terminal app and admin platform from the ground up.' },
  { name: 'Sunita Joshi', role: 'Member Success Manager', emoji: '🌟', bio: 'Ensures every member gets maximum value from their SITA membership.' },
];

const milestones = [
  { year: '2021', event: 'SITA Foundation registered as a non-profit trust in Gujarat.' },
  { year: '2022', event: 'Pilot launched with 50 hotels in Ahmedabad — 35% avg. cost savings achieved.' },
  { year: '2023', event: 'Platform expanded statewide. 200+ members, 80+ vendors onboarded.' },
  { year: '2024', event: 'Launched SITA Business Terminal mobile app. Reached ₹2Cr monthly procurement.' },
  { year: '2025', event: '500+ members, 120+ vendors. Expanding to Rajasthan & Maharashtra.' },
];

export default function About() {
  return (
    <div>
      {/* Hero */}
      <div className="page-hero">
        <div className="container">
          <span className="hero-tag">Our Story</span>
          <h1>About SITA Foundation</h1>
          <p>Empowering India's hospitality industry through collective procurement and trusted vendor networks.</p>
        </div>
      </div>

      {/* Mission & Vision */}
      <section className="section">
        <div className="container">
          <div className="mv-grid">
            <div className="mv-card mission">
              <div className="mv-icon">🎯</div>
              <h3>Our Mission</h3>
              <p>
                To empower India's hoteliers and restaurateurs with access to quality products at wholesale prices,
                eliminating the exploitation of small buyers by creating a unified procurement cooperative.
              </p>
            </div>
            <div className="mv-card vision">
              <div className="mv-icon">🔭</div>
              <h3>Our Vision</h3>
              <p>
                To become India's #1 B2B procurement platform for the hospitality sector — covering every city,
                every hotel, every kitchen — reducing costs by 30% industry-wide by 2027.
              </p>
            </div>
            <div className="mv-card values">
              <div className="mv-icon">💎</div>
              <h3>Our Values</h3>
              <p>
                Transparency in pricing. Trust in vendor verification. Integrity in every transaction.
                Community over competition. We grow when our members grow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Content */}
      <section className="section about-story-section">
        <div className="container">
          <div className="story-grid">
            <div className="story-content">
              <span className="tag">The Problem We Solve</span>
              <h2>Why SITA Foundation Was Born</h2>
              <p>
                In 2021, a group of hotel owners in Ahmedabad recognized a common problem — each of them was
                paying retail prices for bulk quantities of daily consumables. Cooking oil, rice, spices, cleaning
                supplies — items they needed in large volumes every week.
              </p>
              <p>
                Individually, they lacked the bargaining power to negotiate wholesale rates. Middlemen took large
                margins. Quality was inconsistent. Delivery was unreliable.
              </p>
              <p>
                SITA Foundation was established to solve this. By aggregating the purchasing power of hundreds of
                hotels under one platform, we negotiate directly with manufacturers and distributors — passing the
                savings directly to our members.
              </p>
              <div className="story-highlights">
                <div className="highlight">
                  <span className="h-num">30%</span>
                  <span className="h-label">Average Cost Savings</span>
                </div>
                <div className="highlight">
                  <span className="h-num">48hr</span>
                  <span className="h-label">Delivery Turnaround</span>
                </div>
                <div className="highlight">
                  <span className="h-num">100%</span>
                  <span className="h-label">Verified Vendors</span>
                </div>
              </div>
            </div>
            <div className="story-visual">
              <div className="visual-card">
                <div className="vc-header">SITA Business Terminal</div>
                <div className="vc-stat-row">
                  <div className="vc-stat">
                    <div className="vc-val">₹2Cr+</div>
                    <div className="vc-lbl">Monthly GMV</div>
                  </div>
                  <div className="vc-stat">
                    <div className="vc-val">500+</div>
                    <div className="vc-lbl">Members</div>
                  </div>
                </div>
                <div className="vc-stat-row">
                  <div className="vc-stat">
                    <div className="vc-val">120+</div>
                    <div className="vc-lbl">Vendors</div>
                  </div>
                  <div className="vc-stat">
                    <div className="vc-val">800+</div>
                    <div className="vc-lbl">Products</div>
                  </div>
                </div>
                <div className="vc-footer">Registered Non-Profit Trust · Gujarat, India</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section className="section milestone-section">
        <div className="container">
          <div className="section-header">
            <span className="tag">Journey</span>
            <h2>Our Milestones</h2>
          </div>
          <div className="timeline">
            {milestones.map((m) => (
              <div key={m.year} className="timeline-item">
                <div className="tl-year">{m.year}</div>
                <div className="tl-dot" />
                <div className="tl-content">{m.event}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section team-section">
        <div className="container">
          <div className="section-header">
            <span className="tag">Leadership</span>
            <h2>Meet Our Team</h2>
            <p>Passionate professionals dedicated to transforming procurement for India's hospitality industry.</p>
          </div>
          <div className="grid-3">
            {team.map((m) => (
              <div key={m.name} className="team-card card">
                <div className="team-avatar">{m.emoji}</div>
                <h3>{m.name}</h3>
                <div className="team-role">{m.role}</div>
                <p>{m.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
