"use client";

import { useState, useEffect } from "react";
import { statsApi, PlatformStats, DashboardStats } from "../../lib/api";

export const usePlatformStats = () => {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await statsApi.getPlatformStats();
        setStats(response.stats);
      } catch (err) {
        console.error("Failed to fetch platform stats:", err);
        setError("Dështoi të ngarkohen statistikat e platformës");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await statsApi.getPlatformStats();
      setStats(response.stats);
    } catch (err) {
      console.error("Failed to refetch platform stats:", err);
      setError("Dështoi të rifreskohen statistikat");
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, error, refetch };
};

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await statsApi.getDashboardStats();
        setStats(response.stats);
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
        setError("Dështoi të ngarkohen statistikat e dashboard-it");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await statsApi.getDashboardStats();
      setStats(response.stats);
    } catch (err) {
      console.error("Failed to refetch dashboard stats:", err);
      setError("Dështoi të rifreskohen statistikat e dashboard-it");
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, error, refetch };
};
