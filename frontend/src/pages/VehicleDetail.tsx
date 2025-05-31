// frontend/src/pages/VehicleDetail.tsx
import React, { useEffect, useState } from 'react';
import { getVehicle } from '../services/api'; // Ensure this path is correct
import { useRouter } from 'next/router';
import Link from 'next/link';

// Define a simple type for Vehicle for better type safety
interface Vehicle {
  vehicleId: string; // Usually not displayed but good to have
  make: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  status?: string; // Optional, if returned
  createdAt?: string; // Optional, if returned
  updatedAt?: string; // Optional, if returned
  // Add any other relevant fields returned by the getVehicle API
}

function VehicleDetail() {
  const router = useRouter();
  const { vehicleId } = router.query; // Get vehicleId from URL query parameters

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Ensure vehicleId is a string and not an array or undefined
    const id = Array.isArray(vehicleId) ? vehicleId[0] : vehicleId;

    if (id) {
      setIsLoading(true);
      setError('');
      async function fetchVehicle() {
        try {
          const data = await getVehicle(id as string);
          setVehicle(data);
        } catch (err: any) {
          setError(err.message || 'Failed to load vehicle details');
          console.error("Failed to load vehicle details:", err);
        } finally {
          setIsLoading(false);
        }
      }
      fetchVehicle();
    } else {
      // Handle case where vehicleId might not be available immediately or is invalid
      // This might occur if router.query is initially empty
      setIsLoading(false);
      // Optionally set an error or a state indicating vehicleId is missing if it persists
      if (!router.isReady) return; // Wait for router to be ready
      setError('Vehicle ID not found in URL.');
    }
  }, [vehicleId, router.isReady]); // Re-run effect if vehicleId or router.isReady changes

  if (!router.isReady || isLoading) {
    return <p>Loading vehicle details...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>Error: {error}</p>;
  }

  if (!vehicle) {
    return <p>Vehicle not found.</p>; // Or a more specific message if error is not set
  }

  return (
    <div>
      <h1>{vehicle.make} {vehicle.model}</h1>
      <p><strong>Year:</strong> {vehicle.year}</p>
      <p><strong>Mileage:</strong> {vehicle.mileage.toLocaleString()}</p>
      <p><strong>Price:</strong> ${vehicle.price.toFixed(2)}</p>
      {vehicle.status && <p><strong>Status:</strong> {vehicle.status}</p>}
      {vehicle.createdAt && <p><strong>Listed On:</strong> {new Date(vehicle.createdAt).toLocaleDateString()}</p>}

      {/* Future: update/delete buttons */}
      {/*
      <button onClick={() => router.push(`/vehicles/edit/${vehicle.vehicleId}`)}>Edit</button>
      <button onClick={() => handleDelete(vehicle.vehicleId)}>Delete</button>
      */}
      <br />
      <Link href="/vehicles">
        <a>Back to Vehicle List</a>
      </Link>
    </div>
  );
}

export default VehicleDetail;
