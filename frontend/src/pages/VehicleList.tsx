// frontend/src/pages/VehicleList.tsx
import React, { useEffect, useState } from 'react';
import { listVehicles } from '../services/api'; // Ensure this path is correct
import Link from 'next/link'; // Assuming Next.js for linking

// Define a simple type for Vehicle for better type safety
interface Vehicle {
  vehicleId: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  // Add other properties if they are returned by the listVehicles API and needed for display
  // e.g., status, createdAt
}

function VehicleList() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchVehicles() {
      setIsLoading(true);
      setError('');
      try {
        const data = await listVehicles();
        setVehicles(data || []); // Ensure data is an array, default to empty if null/undefined
      } catch (err: any) {
        setError(err.message || 'Failed to load vehicles');
        console.error("Failed to load vehicles:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchVehicles();
  }, []); // Empty dependency array means this runs once on component mount

  if (isLoading) {
    return <p>Loading vehicles...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>Error: {error}</p>;
  }

  return (
    <div>
      <h1>Vehicles</h1>
      {vehicles.length === 0 && !isLoading && <p>No vehicles found.</p>}
      <ul>
        {vehicles.map(v => (
          <li key={v.vehicleId}>
            <Link href={`/vehicles/${v.vehicleId}`}>
              <a>{v.make} {v.model} ({v.year}) - ${v.price.toFixed(2)}</a>
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/add-vehicle">
        <a style={{ marginTop: '20px', display: 'inline-block' }}>Add New Vehicle</a>
      </Link>
    </div>
  );
}

export default VehicleList;
