import React, { useEffect, useState } from 'react'
import {
  Menu, X, Search, Car, Phone, MapPin, MessageCircle,
  ArrowRight, ShieldCheck, Wrench, Clock, ChevronRight
} from 'lucide-react'
import { supabase } from './supabase'
import Admin from './Admin'
import ResetPassword from './ResetPassword'
const LOGO = '/file_000000008c6881f4b94f05827d02b1c5.png'
const PHONE = '2348100772522'
const WHATSAPP = 'https://wa.me/' + PHONE
const ADDRESS = 'Km 3 Alao Akala Express, near Ire Akali Junction, Oluyole, Ibadan, Oyo State, Nigeria'

const VIDEO = 'https://res.cloudinary.com/dvus6pks/video/upload/v1793436519/Cars4sales_Welcome_Synced_Energetic_Music.mp4'

function App() {
  const [vehicles, setVehicles] = useState([])
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [search, setSearch] = useState('')
  const [bodyType, setBodyType] = useState('All')
  const [menuOpen, setMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadVehicles() {
      try {
        const { data, error } = await supabase
          .from('vehicles')
          .select('*, vehicle_media(*)')
          .eq('is_published', true)
          .order('created_at', { ascending: false })

        if (error) throw error
        setVehicles(data || [])
      } catch (error) {
        console.error('Inventory could not be loaded:', error.message)
      } finally {
        setLoading(false)
      }
    }
    loadVehicles()
  }, [])

  const filteredVehicles = vehicles.filter(vehicle => {
    const text = `${vehicle.make} ${vehicle.model} ${vehicle.year} ${vehicle.trim || ''}`.toLowerCase()
    const matchesSearch = text.includes(search.toLowerCase())
    const matchesType = bodyType === 'All' || vehicle.body_type === bodyType
    return matchesSearch && matchesType
  })

    const openVehicleDetails = (vehicle) => {
    setSelectedVehicle(vehicle)
    }
  const enquiry = (vehicle) => {
    const message = `Hello CARS4SALES, I am interested in the ${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ' ' + vehicle.trim : ''}. Please provide more details.`
    window.open(`${WHATSAPP}?text=${encodeURIComponent(message)}`, '_blank')
  }

  const money = (value) => {
    if (!value) return 'Contact for price'
    return '₦' + Number(value).toLocaleString('en-NG')
  }
  if (window.location.pathname === '/reset-password') {
  return <ResetPassword />
  }
  if (window.location.pathname === '/admin') {
  return <Admin />
}
  return (
    <div className="site-shell">
      <div className="top-strip">
        QUALITY VEHICLES. STRAIGHTFORWARD SERVICE.
      </div>

      <header className="site-header">
        <a className="brand" href="#home">
          <img src={LOGO} alt="CARS4SALES" style={{ height: '54px', width: 'auto', objectFit: 'contain' }} />
          <small>YOUR NEXT DRIVE STARTS HERE</small>
        </a>

        <button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X /> : <Menu />}
        </button>

        <nav className={menuOpen ? 'nav-links open' : 'nav-links'}>
          <a href="#home" onClick={() => setMenuOpen(false)}>Home</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
          <a href="#inventory" onClick={() => setMenuOpen(false)}>Our Cars</a>
          <a href="#services" onClick={() => setMenuOpen(false)}>Services</a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
          <a className="nav-cta" href={WHATSAPP} target="_blank" rel="noreferrer">
            Enquire Now <ArrowRight size={16} />
          </a>
        </nav>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <p className="eyebrow">WELCOME TO CARS4SALES IBADAN</p>
            <h1>YOUR NEXT DRIVE <span>STARTS HERE.</span></h1>
            <p className="hero-copy">
              Discover quality vehicles, honest service and a straightforward
              buying experience. Find the right car for your next journey.
            </p>
            <div className="hero-actions">
              <a href="#inventory" className="gold-button">
                Explore Our Cars <ArrowRight size={18} />
              </a>
              <a href={WHATSAPP} className="outline-button" target="_blank" rel="noreferrer">
                <MessageCircle size={18} /> Talk to Us
              </a>
            </div>
            <div className="hero-note">
              <ShieldCheck size={18} /> Quality vehicles. Straightforward service.
            </div>
                    </div>

          <div className="hero-vehicle">
            <img
              src="/Screenshot_20261101_200921_Maps.jpg"
              alt="Lexus SUV at CARS4SALES Ibadan"
            />
          </div>

          <div className="hero-mark">
            <span>4</span>
            <small>YOUR JOURNEY<br />OUR PRIORITY</small>
          </div>
        </section>
        
                <section style={{
          padding: '60px 6%',
          background: '#0b0b0b',
          textAlign: 'center'
        }}>
          <p className="eyebrow">VISIT OUR DEALERSHIP</p>
          <h2>Welcome to <span>CARS4SALES IBADAN</span></h2>
          <p style={{ marginBottom: '28px' }}>
            Quality vehicles. Straightforward service.
          </p>
          <img
            src="/1793382015136.jpg"
            alt="CARS4SALES dealership showroom and signboard"
            style={{
              width: '100%',
              maxWidth: '1100px',
              height: 'auto',
              borderRadius: '12px',
              display: 'block',
              margin: '0 auto'
            }}
          />
        </section>
        <section className="welcome-video">
          <div>
            <p className="eyebrow">GET TO KNOW US</p>
            <h2>Welcome to <span>CARS4SALES</span></h2>
            <p>We are here to make finding your next vehicle simple and reassuring.</p>
          </div>
          <video controls playsInline preload="metadata">
            <source src={VIDEO} type="video/mp4" />
            Your browser does not support this video.
          </video>
        </section>

        <section className="inventory section-pad" id="inventory">
          <div className="section-heading">
            <div>
              <p className="eyebrow">FIND YOUR NEXT VEHICLE</p>
              <h2>Explore Our <span>Inventory</span></h2>
              <p>Browse available vehicles and contact us for more information.</p>
            </div>
          </div>

          <div className="inventory-tools">
            <div className="search-box">
              <Search size={19} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search make, model, year or trim..."
              />
            </div>
            <select value={bodyType} onChange={e => setBodyType(e.target.value)}>
              {['All', 'SUV', 'Sedan', 'Coupe', 'Hatchback', 'Truck', 'Van'].map(type =>
                <option key={type} value={type}>{type === 'All' ? 'All body types' : type}</option>
              )}
            </select>
          </div>

          {loading ? (
            <p className="inventory-message">Loading vehicles...</p>
          ) : filteredVehicles.length === 0 ? (
            <div className="empty-inventory">
              <Car size={42} />
              <h3>{vehicles.length === 0 ? 'Our inventory is being updated.' : 'No matching vehicles found.'}</h3>
              <p>
                {vehicles.length === 0
                  ? 'Please contact our team to ask about available vehicles.'
                  : 'Try another search or select a different body type.'}
              </p>
              <a href={WHATSAPP} target="_blank" rel="noreferrer" className="gold-button">
                Enquire on WhatsApp <ArrowRight size={17} />
              </a>
            </div>
          ) : (
            <div className="vehicle-grid">
              {filteredVehicles.map(vehicle => {
                const media = (vehicle.vehicle_media || []).find(item => item.media_type === 'image')
                const imageUrl = media
                  ? supabase.storage.from(media.bucket_name).getPublicUrl(media.object_path).data.publicUrl
                  : null

                return (
                  <article
  className="vehicle-card"
  key={vehicle.id}
  onClick={() => openVehicleDetails(vehicle)}
  style={{ cursor: 'pointer' }}
>
                    <div className="vehicle-image">
                      {imageUrl ? <img src={imageUrl} alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`} /> : <Car size={55} />}
                      <span className="vehicle-status">{vehicle.availability || 'Available'}</span>
                    </div>
                    <div className="vehicle-info">
                      <p className="vehicle-year">{vehicle.year} · {vehicle.body_type || 'Vehicle'}</p>
                      <h3>{vehicle.make} {vehicle.model}</h3>
                      {vehicle.trim && <p>{vehicle.trim}</p>}
                      <strong>{vehicle.price_on_request ? 'Contact for price' : money(vehicle.price)}</strong>
                      <button className="gold-button full-button" onClick={() => enquiry(vehicle)}>
                        Enquire on WhatsApp <ArrowRight size={16} />
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>

                {selectedVehicle && (
          <div
            onClick={() => setSelectedVehicle(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.85)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              overflowY: 'auto'
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                background: '#151515',
                border: '1px solid #c9a44c',
                borderRadius: '12px',
                padding: '24px',
                width: '100%',
                maxWidth: '650px',
                maxHeight: '90vh',
                overflowY: 'auto',
                color: '#fff'
              }}
            >
              <button
                onClick={() => setSelectedVehicle(null)}
                style={{
                  float: 'right',
                  background: '#c9a44c',
                  border: 0,
                  padding: '8px 14px',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>

              <h2>
                {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
              </h2>

              {selectedVehicle.vehicle_media?.map((item, index) => {
                const url = supabase.storage
                  .from(item.bucket_name)
                  .getPublicUrl(item.object_path).data.publicUrl

                return item.media_type === 'image' ? (
                  <img
                    key={index}
                    src={url}
                    alt={selectedVehicle.model}
                    style={{ width: '100%', borderRadius: '8px', marginBottom: '12px' }}
                  />
                ) : (
                  <video
                    key={index}
                    src={url}
                    controls
                    playsInline
                    style={{ width: '100%', marginBottom: '12px' }}
                  />
                )
              })}

              <p><strong>Trim:</strong> {selectedVehicle.trim || 'Not specified'}</p>
              <p><strong>Body type:</strong> {selectedVehicle.body_type}</p>
              <p><strong>Mileage:</strong> {selectedVehicle.mileage} {selectedVehicle.mileage_unit}</p>
              <p><strong>Transmission:</strong> {selectedVehicle.transmission}</p>
              <p><strong>Fuel:</strong> {selectedVehicle.fuel_type}</p>
              <p><strong>Price:</strong> {selectedVehicle.price_on_request ? 'Contact for price' : money(selectedVehicle.price)}</p>
              <p><strong>Description:</strong> {selectedVehicle.description || 'Contact us for more details.'}</p>

              <button
                className="gold-button"
                onClick={() => enquiry(selectedVehicle)}
              >
                Enquire on WhatsApp
              </button>
            </div>
          </div>
        )}
        <section className="about-section section-pad" id="about">
          <div>
            <p className="eyebrow">ABOUT CARS4SALES</p>
            <h2>A better way to find your <span>next car.</span></h2>
          </div>
          <p>
            CARS4SALES is committed to helping customers find quality vehicles
            with straightforward service. From your first enquiry to choosing
            your next vehicle, our team is ready to assist.
          </p>
        </section>

        <section className="services section-pad" id="services">
          <div className="section-heading">
            <p className="eyebrow">HERE TO HELP</p>
            <h2>Service you can <span>count on.</span></h2>
          </div>
          <div className="service-grid">
            <article>
              <Car />
              <h3>Quality Vehicles</h3>
              <p>Explore available vehicles from Lexus, Toyota and other makes.</p>
            </article>
            <article>
              <Wrench />
              <h3>After-Sales Support</h3>
              <p>Speak with our team for assistance after your vehicle purchase.</p>
            </article>
            <article>
              <MessageCircle />
              <h3>Personal Assistance</h3>
              <p>Contact us directly for vehicle details and enquiries.</p>
            </article>
          </div>
        </section>

        <section className="contact-section section-pad" id="contact">
          <div>
            <p className="eyebrow">LET'S TALK</p>
            <h2>Ready for your <span>next drive?</span></h2>
            <p>Contact CARS4SALES today. Our team will be happy to assist you.</p>
            <a className="gold-button" href={WHATSAPP} target="_blank" rel="noreferrer">
              Chat with Us on WhatsApp <ArrowRight size={18} />
            </a>
          </div>
          <div className="contact-details">
            <p><Phone /> <a href="tel:+2348100772522">0810 077 2522</a></p>
            <p><MapPin /> {ADDRESS}</p>
            <p><Clock /> Contact us for current availability and enquiries.</p>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <a className="brand" href="#home">
          <span className="brand-name">CARS<span>4</span>SALES</span>
          <small>YOUR NEXT DRIVE STARTS HERE</small>
        </a>
        <p>QUALITY VEHICLES. STRAIGHTFORWARD SERVICE.</p>
        <p>© {new Date().getFullYear()} CARS4SALES. All rights reserved.</p>
        <a href="mailto:carssalesinibadan@gmail.com">carssalesinibadan@gmail.com</a>
      </footer>

      <a className="floating-whatsapp" href={WHATSAPP} target="_blank" rel="noreferrer" aria-label="WhatsApp">
        <MessageCircle />
      </a>
    </div>
  )
}

export default App
