import React, { useState } from 'react';
import './Products.css';

const categories = ['All', 'Oils', 'Grains', 'Spices', 'Gas', 'Cleaning', 'Dairy'];

const products = [
  // Oils
  { id: 1, name: 'Refined Sunflower Oil', category: 'Oils', unit: '15L tin', market: 2400, sita: 1750, brand: 'Fortune', icon: '🛢️', popular: true },
  { id: 2, name: 'Groundnut Oil (Refined)', category: 'Oils', unit: '15L tin', market: 2800, sita: 2050, brand: 'Gemini', icon: '🛢️' },
  { id: 3, name: 'Vanaspati Ghee', category: 'Oils', unit: '15kg tin', market: 1900, sita: 1400, brand: 'Rath', icon: '🛢️' },
  { id: 4, name: 'Palm Oil (Refined)', category: 'Oils', unit: '15L tin', market: 1800, sita: 1320, brand: 'Ruchi', icon: '🛢️', popular: true },
  { id: 5, name: 'Pure Desi Ghee', category: 'Oils', unit: '5kg tin', market: 2750, sita: 2100, brand: 'Amul', icon: '🛢️' },

  // Grains
  { id: 6, name: 'Basmati Rice (1121)', category: 'Grains', unit: '25kg bag', market: 2500, sita: 1900, brand: 'India Gate', icon: '🌾', popular: true },
  { id: 7, name: 'Sona Masoori Rice', category: 'Grains', unit: '25kg bag', market: 1600, sita: 1200, brand: 'Local', icon: '🌾' },
  { id: 8, name: 'Wheat Flour (Atta)', category: 'Grains', unit: '50kg bag', market: 1800, sita: 1400, brand: 'Aashirvaad', icon: '🌾' },
  { id: 9, name: 'Toor Dal', category: 'Grains', unit: '25kg bag', market: 3200, sita: 2600, brand: 'Local', icon: '🌾', popular: true },
  { id: 10, name: 'Moong Dal (Split)', category: 'Grains', unit: '25kg bag', market: 3800, sita: 3100, brand: 'Local', icon: '🌾' },

  // Spices
  { id: 11, name: 'Red Chilli Powder', category: 'Spices', unit: '5kg pack', market: 1800, sita: 1350, brand: 'Everest', icon: '🌶️', popular: true },
  { id: 12, name: 'Turmeric Powder', category: 'Spices', unit: '5kg pack', market: 900, sita: 680, brand: 'MDH', icon: '🌶️' },
  { id: 13, name: 'Coriander Powder', category: 'Spices', unit: '5kg pack', market: 750, sita: 560, brand: 'Everest', icon: '🌶️' },
  { id: 14, name: 'Garam Masala', category: 'Spices', unit: '1kg pack', market: 650, sita: 490, brand: 'MDH', icon: '🌶️' },
  { id: 15, name: 'Black Pepper (Whole)', category: 'Spices', unit: '1kg pack', market: 850, sita: 640, brand: 'Local', icon: '🌶️' },

  // Gas
  { id: 16, name: 'Commercial LPG Cylinder', category: 'Gas', unit: 'per cylinder (19kg)', market: 2100, sita: 1820, brand: 'HP Gas', icon: '🔥', popular: true },
  { id: 17, name: 'Natural Gas Connection', category: 'Gas', unit: 'per month (SCMD)', market: 4500, sita: 3800, brand: 'GAIL', icon: '🔥' },

  // Cleaning
  { id: 18, name: 'Floor Cleaner (Phenyl)', category: 'Cleaning', unit: '20L can', market: 1200, sita: 880, brand: 'Harpic', icon: '🧴', popular: true },
  { id: 19, name: 'Dish Wash Liquid', category: 'Cleaning', unit: '5L can', market: 480, sita: 340, brand: 'Vim', icon: '🧴' },
  { id: 20, name: 'Laundry Detergent', category: 'Cleaning', unit: '10kg bag', market: 950, sita: 700, brand: 'Surf Excel', icon: '🧴' },
  { id: 21, name: 'Toilet Cleaner', category: 'Cleaning', unit: '12x500ml', market: 720, sita: 520, brand: 'Harpic', icon: '🧴' },
  { id: 22, name: 'Hand Sanitizer (70%)', category: 'Cleaning', unit: '5L can', market: 650, sita: 480, brand: 'Dettol', icon: '🧴' },

  // Dairy
  { id: 23, name: 'Full Cream Milk', category: 'Dairy', unit: '500ml x 48 packs', market: 1440, sita: 1200, brand: 'Amul', icon: '🥛', popular: true },
  { id: 24, name: 'Paneer (Fresh)', category: 'Dairy', unit: '1kg block', market: 380, sita: 300, brand: 'Amul', icon: '🥛' },
  { id: 25, name: 'Curd / Dahi', category: 'Dairy', unit: '5kg tub', market: 400, sita: 320, brand: 'Amul', icon: '🥛' },
];

export default function Products() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? products
    : products.filter(p => p.category === activeCategory);

  const savings = (p) => Math.round(((p.market - p.sita) / p.market) * 100);

  return (
    <div>
      <div className="page-hero">
        <div className="container">
          <span className="hero-tag">Product Catalogue</span>
          <h1>SITA Price List</h1>
          <p>Compare market prices vs SITA special member prices. Save up to 30% on every order.</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          {/* Filter */}
          <div className="cat-filters">
            {categories.map((c) => (
              <button
                key={c}
                className={`cat-filter-btn ${activeCategory === c ? 'active' : ''}`}
                onClick={() => setActiveCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Legend */}
          <div className="price-legend">
            <div className="legend-item">
              <span className="legend-dot market" />
              Market Price
            </div>
            <div className="legend-item">
              <span className="legend-dot sita" />
              SITA Member Price
            </div>
            <div className="legend-item">
              <span className="legend-dot savings" />
              Your Savings
            </div>
          </div>

          {/* Products Table */}
          <div className="products-grid">
            {filtered.map((p) => (
              <div key={p.id} className={`product-card card ${p.popular ? 'popular' : ''}`}>
                {p.popular && <div className="popular-badge">Popular</div>}
                <div className="product-header">
                  <div className="product-icon">{p.icon}</div>
                  <div>
                    <div className="product-name">{p.name}</div>
                    <div className="product-meta">{p.brand} · {p.unit}</div>
                  </div>
                </div>
                <div className="product-prices">
                  <div className="price-row">
                    <span className="price-label">Market Price</span>
                    <span className="price-market">₹{p.market.toLocaleString()}</span>
                  </div>
                  <div className="price-row sita-row">
                    <span className="price-label">SITA Price</span>
                    <span className="price-sita">₹{p.sita.toLocaleString()}</span>
                  </div>
                  <div className="savings-bar-wrap">
                    <div className="savings-bar">
                      <div className="savings-fill" style={{ width: `${savings(p)}%` }} />
                    </div>
                    <span className="savings-pct">Save {savings(p)}%</span>
                  </div>
                </div>
                <div className="product-saving-amount">
                  You save ₹{(p.market - p.sita).toLocaleString()} per {p.unit}
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="products-cta">
            <div className="cta-inner">
              <h3>Want Access to These Prices?</h3>
              <p>Become a SITA member to place bulk orders at these rates.</p>
              <a href="/membership" className="btn-primary">Join as Member</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
