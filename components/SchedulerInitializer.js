'use client'

import { useEffect, useState } from 'react';

export default function SchedulerInitializer() {
  const [schedulerStatus, setSchedulerStatus] = useState(null);

  useEffect(() => {
    // Initialize scheduler when component mounts
    const initializeScheduler = async () => {
      try {
        const response = await fetch('/api/scheduler', {
          method: 'POST'
        });
        const data = await response.json();
        setSchedulerStatus(data);
        
        if (data.success) {
          console.log('✅ Daily notification scheduler initialized');
        } else {
          console.error('❌ Failed to initialize scheduler:', data.error);
        }
      } catch (error) {
        console.error('❌ Error initializing scheduler:', error);
      }
    };

    initializeScheduler();
  }, []);

  // This component doesn't render anything visible
  return null;
}