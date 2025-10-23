'use client';

import { useState, useEffect } from 'react';

export function useAvailabilityToggle(doctorId: string, initialStatus: string) {
  const [isAvailable, setIsAvailable] = useState(initialStatus === 'AVAILABLE');

  // Sync with prop changes
  useEffect(() => {
    const shouldBeAvailable = initialStatus === 'AVAILABLE';
    if (isAvailable !== shouldBeAvailable) {
      setIsAvailable(shouldBeAvailable);
    }
  }, [initialStatus, isAvailable]);

  const toggleAvailability = async () => {
    const newStatus = !isAvailable;
    const newAvailabilityStatus = newStatus ? 'AVAILABLE' : 'BUSY';
    
    console.log('🔄 Toggling doctor availability:', {
      doctorId,
      currentStatus: isAvailable,
      newStatus,
      newAvailabilityStatus
    });
    
    setIsAvailable(newStatus);
    
    try {
      const response = await fetch('/api/doctors/availability', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId,
          availability_status: newAvailabilityStatus
        })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to update availability');
      }
      
      console.log('✅ Availability updated successfully');
    } catch (error) {
      console.error('❌ Failed to update availability:', error);
      setIsAvailable(!newStatus); // Revert on error
    }
  };

  return { isAvailable, toggleAvailability };
}


