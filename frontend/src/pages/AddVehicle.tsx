// frontend/src/pages/AddVehicle.tsx
import React, { useState } from 'react';
import { createVehicle } from '../services/api'; // Ensure this path is correct
import { useRouter } from 'next/router'; // Assuming Next.js router

function AddVehicle() {
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [mileage, setMileage] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Basic client-side validation (can be enhanced)
    if (!make || !model || !year || !mileage || !price) {
      setError('All fields are required.');
      return;
    }
    if (isNaN(Number(year)) || isNaN(Number(mileage)) || isNaN(Number(price))) {
        setError('Year, mileage, and price must be valid numbers.');
        return;
    }


    try {
      const vehicleData = {
        make,
        model,
        year: Number(year),
        mileage: Number(mileage),
        price: parseFloat(price), // Use parseFloat for price to handle decimals
      };
      const result = await createVehicle(vehicleData);
      setSuccessMessage(`Vehicle added successfully! ID: ${result.vehicleId}`);
      // Clear form
      setMake('');
      setModel('');
      setYear('');
      setMileage('');
      setPrice('');
      // Optionally redirect after a delay or on user action
      // router.push(`/vehicles/${result.vehicleId}`);
      // For now, just show success message and let user navigate or add another.
    } catch (err: any) {
      setError(err.message || 'Error creating vehicle');
      console.error("Error creating vehicle:", err);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add New Vehicle</h2>
      <div>
        <label htmlFor="make">Make:</label>
        <input id="make" value={make} onChange={e => setMake(e.target.value)} placeholder="Make" required />
      </div>
      <div>
        <label htmlFor="model">Model:</label>
        <input id="model" value={model} onChange={e => setModel(e.target.value)} placeholder="Model" required />
      </div>
      <div>
        <label htmlFor="year">Year:</label>
        <input id="year" type="number" value={year} onChange={e => setYear(e.target.value)} placeholder="Year" required />
      </div>
      <div>
        <label htmlFor="mileage">Mileage:</label>
        <input id="mileage" type="number" value={mileage} onChange={e => setMileage(e.target.value)} placeholder="Mileage" required />
      </div>
      <div>
        <label htmlFor="price">Price:</label>
        <input id="price" type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="Price" required />
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      <button type="submit">Add Vehicle</button>
    </form>
  );
}

export default AddVehicle;
