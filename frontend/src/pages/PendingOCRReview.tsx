// frontend/src/pages/PendingOCRReview.tsx
import React, { useState, useEffect } from 'react';

// TODO: Define interface for OCR pending item structure
interface PendingItem {
  id: string;
  imageUrl?: string;
  extractedData: Record<string, any>; // e.g., { make: 'Toyota', model: 'Camry', year: '2021' }
  ocrConfidence?: Record<string, number>;
  // Add other relevant fields
}

function PendingOCRReview() {
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Implement API call to fetch pending OCR review items
    // setIsLoading(true);
    // fetchPendingItems()
    //   .then(data => setPendingItems(data))
    //   .catch(err => setError('Failed to load pending items.'))
    //   .finally(() => setIsLoading(false));
    console.log('TODO: Fetch pending OCR items');
  }, []);

  const handleApprove = (itemId: string, correctedData: Record<string, any>) => {
    // TODO: Implement API call to approve/correct an item
    console.log('TODO: Approve item', itemId, correctedData);
  };

  const handleReject = (itemId: string) => {
    // TODO: Implement API call to reject an item
    console.log('TODO: Reject item', itemId);
  };

  if (isLoading) return <p>Loading pending reviews...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Pending OCR Review</h1>
      <p> {/* TODO: This page will display vehicles/data extracted via OCR that require manual review and confirmation. */} </p>
      <p> {/* TODO: Implement UI to display items, show extracted vs. corrected values, and allow for approval or rejection. */} </p>
      {pendingItems.length === 0 ? (
        <p>No items currently pending review.</p>
      ) : (
        pendingItems.map(item => (
          <div key={item.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
            {/* TODO: Render item details and editing form */}
            <p>Item ID: {item.id}</p>
            <pre>{JSON.stringify(item.extractedData, null, 2)}</pre>
            <button onClick={() => handleApprove(item.id, item.extractedData)}>Approve (Correct if needed)</button>
            <button onClick={() => handleReject(item.id)}>Reject</button>
          </div>
        ))
      )}
    </div>
  );
}

export default PendingOCRReview;
