"use client";

import { useState, useEffect, useCallback } from 'react';
import { getDonations } from '@/lib/donations';
import type { Donation } from '@/lib/types';

// State management for donations
let donationsCache: Donation[] = [];
let listeners: Array<(donations: Donation[]) => void> = [];
let isFetching = false;

// Function to notify all subscribed components of an update
const notifyListeners = () => {
  for (const listener of listeners) {
    listener(donationsCache);
  }
};

// Function to fetch or refetch donations and update the cache
const fetchAndCacheDonations = async () => {
  if (isFetching) return;
  isFetching = true;
  try {
    const newDonations = await getDonations();
    donationsCache = newDonations;
    notifyListeners();
  } catch (error) {
    console.error("Failed to fetch donations:", error);
  } finally {
    isFetching = false;
  }
};

// Function that can be called from anywhere to trigger a refresh
export const triggerDonationsUpdate = () => {
  fetchAndCacheDonations();
};

// Custom hook for components to use
export const useDonations = () => {
  const [donations, setDonations] = useState<Donation[]>(donationsCache);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const newListener = (updatedDonations: Donation[]) => {
      setDonations(updatedDonations);
      setLoading(false);
    };
    
    listeners.push(newListener);

    // If cache is empty, fetch donations on initial mount
    if (donationsCache.length === 0) {
      setLoading(true);
      fetchAndCacheDonations();
    }

    // Cleanup function to remove the listener when the component unmounts
    return () => {
      listeners = listeners.filter(l => l !== newListener);
    };
  }, []);

  return { donations, loading };
};
