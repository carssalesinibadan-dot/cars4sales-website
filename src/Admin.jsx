import React, { useEffect, useState } from 'react'
import { supabase } from './supabase'

const ADMIN_EMAIL = 'carssalesinibadan@gmail.com'

const inputStyle = {
  width: '100%',
  padding: 12,
  margin: '7px 0 16px',
  background: '#171717',
  color: '#fff',
  border: '1px solid #55452a',
  borderRadius: 5
}

const buttonStyle = {
  padding: '12px 18px',
  background: '#d5ad58',
  color: '#111',
  border: 0,
  borderRadius: 5,
  fontWeight: 700,
  cursor: 'pointer'
}

export default function Admin() {
  const [session, setSession] = useState(null)
  const [checking, setChecking] = useState(true)
  const [email, setEmail] = useState(ADMIN_EMAIL)
  const [password, setPassword] = useState('')
  const [vehicles, setVehicles] = useState([])
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
const [currentPassword, setCurrentPassword] = useState('')
const [newPassword, setNewPassword] = useState('')
const [confirmNewPassword, setConfirmNewPassword] = useState('')
const [passwordBusy, setPasswordBusy] = useState(false)
  const [form, setForm] = useState({
    make: '',
    model: '',
    year: '',
    trim: '',
    body_type: 'SUV',
    mileage: '',
    mileage_unit: 'mi',
    transmission: '',
    fuel_type: '',
    price: '',
    price_on_request: false,
    description: '',
    availability: 'available'
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setChecking(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => setSession(nextSession)
    )

    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session?.user?.email === ADMIN_EMAIL) loadVehicles()
  }, [session])

  async function login(e) {
    e.preventDefault()
    setBusy(true)
    setMessage('Signing in...')

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    })

    setBusy(false)

    if (error) {
      setMessage(error.message)
      return
    }

    if (data.user?.email !== ADMIN_EMAIL) {
      await supabase.auth.signOut()
      setMessage('This account is not authorised.')
      return
    }

    setMessage('Login successful.')
  }

  async function forgotAdminPassword() {
  setMessage('')

  if (email.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    setMessage('Please enter the authorised administrator email address.')
    return
  }

  setBusy(true)

  const { error } = await supabase.auth.resetPasswordForEmail(
    email.trim(),
    {
      redirectTo: `${window.location.origin}/reset-password`
    }
  )

  setBusy(false)

  if (error) {
    setMessage(error.message)
    return
  }

  setMessage('Password reset link sent. Please check your email inbox.')
  }
  async function updateAdminPassword(e) {
  e.preventDefault()
  setMessage('')

  if (newPassword.length < 8) {
    setMessage('Password must contain at least 8 characters.')
    return
  }

  if (newPassword !== confirmNewPassword) {
    setMessage('The new passwords do not match.')
    return
  }

  setPasswordBusy(true)

  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: session.user.email,
    password: currentPassword
  })

  if (verifyError) {
    setPasswordBusy(false)
    setMessage('Current password is incorrect.')
    return
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword
  })

  setPasswordBusy(false)

  if (error) {
    setMessage(error.message)
    return
  }

  setCurrentPassword('')
  setNewPassword('')
  setConfirmNewPassword('')
  setMessage('Password updated successfully.')
  }
  async function loadVehicles() {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setMessage(error.message)
      return
    }

    setVehicles(data || [])
  }

  async function addVehicle(e) {
    e.preventDefault()
    setBusy(true)
    setMessage('Saving vehicle...')

    const record = {
      ...form,
      year: Number(form.year),
      mileage: form.mileage ? Number(form.mileage) : null,
      price: form.price ? Number(form.price) : null,
      slug: `${form.year}-${form.make}-${form.model}-${Date.now()}`
        .toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      is_published: true
    }

    const { data: vehicle, error } = await supabase
      .from('vehicles')
      .insert(record)
      .select()
      .single()

    if (error) {
      setBusy(false)
      setMessage(error.message)
      return
    }

    setBusy(false)
    setMessage('Vehicle added successfully.')
    setForm({
      make: '',
      model: '',
      year: '',
      trim: '',
      body_type: 'SUV',
      mileage: '',
      mileage_unit: 'mi',
      transmission: '',
      fuel_type: '',
      price: '',
      price_on_request: false,
      description: '',
      availability: 'available'
    })

    await loadVehicles()
    document.getElementById('media-' + vehicle.id)?.scrollIntoView()
  }

  async function uploadMedia(vehicleId, files) {
    if (!files?.length) return

    setBusy(true)
    setMessage('Uploading vehicle media...')

    for (const file of Array.from(files)) {
      const isVideo = file.type.startsWith('video/')
      const bucket = isVideo
        ? 'cars4sales-videos.'
        : 'cars4sales-vehicle-media.'

      const path = `${vehicleId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: false })

      if (uploadError) {
        setMessage(uploadError.message)
        setBusy(false)
        return
      }

      const { error: mediaError } = await supabase
        .from('vehicle_media')
        .insert({
          vehicle_id: vehicleId,
          bucket_name: bucket,
          object_path: path,
          media_type: isVideo ? 'video' : 'image'
        })

      if (mediaError) {
        setMessage(mediaError.message)
        setBusy(false)
        return
      }
    }

    setBusy(false)
    setMessage('Media uploaded successfully.')
  }

  async function changeAvailability(vehicle, availability) {
    const { error } = await supabase
      .from('vehicles')
      .update({ availability })
      .eq('id', vehicle.id)

    setMessage(error ? error.message : 'Vehicle status updated.')
    if (!error) loadVehicles()
  }

  async function deleteVehicle(vehicle) {
    if (!window.confirm(`Delete ${vehicle.year} ${vehicle.make} ${vehicle.model}?`)) return

    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', vehicle.id)

    setMessage(error ? error.message : 'Vehicle deleted.')
    if (!error) loadVehicles()
  }

  if (checking) {
    return <main style={{ padding: 30, color: '#d5ad58', background: '#090909' }}>Checking administrator access...</main>
  }

  if (!session) {
    return (
      <main style={{ minHeight: '100vh', background: '#090909', color: '#fff', padding: 25 }}>
        <form onSubmit={login} style={{ maxWidth: 430, margin: '70px auto', padding: 28, background: '#151515', border: '1px solid #55452a' }}>
          <h1 style={{ color: '#d5ad58' }}>CARS4SALES</h1>
          <h2>Administrator Login</h2>
          <p>Private dealership management</p>

          <label>Email address</label>
          <input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} required />

          <label>Password</label>
          <input style={inputStyle} type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button
  type="button"
  onClick={forgotAdminPassword}
  disabled={busy}
  style={{
    background: 'transparent',
    color: '#d5ad58',
    border: 'none',
    padding: '0',
    margin: '0 0 14px',
    cursor: 'pointer'
  }}
>
  Forgot Password?
</button>
          <button style={buttonStyle} disabled={busy}>
            {busy ? 'Please wait...' : 'Sign in'}
          </button>

          <p>{message}</p>
          <a href="/" style={{ color: '#d5ad58' }}>Return to website</a>
        </form>
      </main>
    )
  }

  if (session.user.email !== ADMIN_EMAIL) {
    return <main style={{ padding: 30, background: '#090909', color: '#fff' }}>Unauthorised administrator account.</main>
  }

  return (
    <main style={{ minHeight: '100vh', background: '#090909', color: '#fff', padding: 20 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 15 }}>
        <div>
          <h1 style={{ color: '#d5ad58' }}>CARS4SALES ADMIN</h1>
          <p>Vehicle inventory management</p>
        </div>
        <button style={buttonStyle} onClick={() => supabase.auth.signOut()}>Sign out</button>
      </header>

      <p>{message}</p>
<section style={{
  maxWidth: 700,
  margin: '30px auto',
  padding: 22,
  background: '#151515',
  border: '1px solid #55452a'
}}>
  <h2>Account Settings</h2>
  <h3>Change Administrator Password</h3>

  <form onSubmit={updateAdminPassword}>
    <label>
      Current password
      <input
        style={inputStyle}
        type="password"
        value={currentPassword}
        onChange={e => setCurrentPassword(e.target.value)}
        required
      />
    </label>

    <label>
      New password
      <input
        style={inputStyle}
        type="password"
        minLength={8}
        value={newPassword}
        onChange={e => setNewPassword(e.target.value)}
        required
      />
    </label>

    <label>
      Confirm new password
      <input
        style={inputStyle}
        type="password"
        minLength={8}
        value={confirmNewPassword}
        onChange={e => setConfirmNewPassword(e.target.value)}
        required
      />
    </label>

    <button
      type="submit"
      style={buttonStyle}
      disabled={passwordBusy}
    >
      {passwordBusy ? 'Updating password...' : 'Update Password'}
    </button>
  </form>
</section>
      <section style={{ maxWidth: 700, margin: '30px auto', padding: 22, background: '#151515', border: '1px solid #55452a' }}>
        <h2>Add a vehicle</h2>

        <form onSubmit={addVehicle}>
          {[
  ['make', 'Vehicle make', 'text'],
  ['model', 'Vehicle model', 'text'],
  ['year', 'Year', 'number'],
  ['trim', 'Trim / version', 'text'],
  ['mileage', 'Mileage (Miles)', 'number']
].map(([key, label, type]) => (
            <label key={key} style={{ display: 'block' }}>
              {label}
              <input
                style={inputStyle}
                type={type}
                value={form[key]}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
                required={['make', 'model', 'year'].includes(key)}
              />
            </label>
          ))}

          <label>Body type</label>
          <select style={inputStyle} value={form.body_type} onChange={e => setForm({ ...form, body_type: e.target.value })}>
            {['SUV', 'Sedan', 'Coupe', 'Hatchback', 'Truck', 'Van'].map(x => <option key={x}>{x}</option>)}
          </select>

<label>Transmission</label>
<select
  style={inputStyle}
  value={form.transmission}
  onChange={e => setForm({ ...form, transmission: e.target.value })}
  required
>
  <option value="">Select transmission</option>
  <option value="Automatic">Automatic</option>
  <option value="Manual">Manual</option>
  <option value="CVT">CVT</option>
</select>

<label>Fuel Type</label>
<select
  style={inputStyle}
  value={form.fuel_type}
  onChange={e => setForm({ ...form, fuel_type: e.target.value })}
  required
>
  <option value="">Select fuel type</option>
  <option value="Petrol">Petrol</option>
  <option value="Diesel">Diesel</option>
  <option value="Hybrid">Hybrid</option>
  <option value="Plug-in Hybrid">Plug-in Hybrid</option>
  <option value="Electric">Electric</option>
</select>

<label>Description</label>
          <textarea style={{ ...inputStyle, minHeight: 100 }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />

          <label style={{ display: 'block', marginBottom: 16 }}>
            <input type="checkbox" checked={form.price_on_request} onChange={e => setForm({ ...form, price_on_request: e.target.checked })} />
            {' '}Contact for price
          </label>

          <button style={buttonStyle} disabled={busy}>
            {busy ? 'Saving...' : 'Add vehicle'}
          </button>
        </form>
      </section>

      <section style={{ maxWidth: 700, margin: '30px auto' }}>
        <h2>Current inventory ({vehicles.length})</h2>

        {vehicles.map(vehicle => (
          <article key={vehicle.id} id={'media-' + vehicle.id} style={{ background: '#151515', border: '1px solid #55452a', padding: 18, marginBottom: 15 }}>
            <h3>{vehicle.year} {vehicle.make} {vehicle.model}</h3>
            <p>Status: {vehicle.availability}</p>

            <label>Upload photos or videos</label>
            <input
              style={{ ...inputStyle, marginTop: 10 }}
              type="file"
              accept="image/*,video/*"
              multiple
              disabled={busy}
              onChange={e => uploadMedia(vehicle.id, e.target.files)}
            />

            <button style={buttonStyle} onClick={() => changeAvailability(vehicle, vehicle.availability === 'sold' ? 'available' : 'sold')}>
              Mark as {vehicle.availability === 'sold' ? 'available' : 'sold'}
            </button>

            <button style={{ ...buttonStyle, marginLeft: 8, background: '#8c3333', color: '#fff' }} onClick={() => deleteVehicle(vehicle)}>
              Delete
            </button>
          </article>
        ))}
      </section>
    </main>
  )
      }
