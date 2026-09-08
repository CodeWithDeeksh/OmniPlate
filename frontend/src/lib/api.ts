import axios from 'axios'
import type {
  Camera,
  VehicleSummary,
  VehicleTrajectory,
  DensityStat,
  CongestionStat,
  ODStat,
  Alert,
} from './types'
import * as mock from './mockData'

// Base URL per docs/api_contract.md — override with VITE_API_BASE_URL in .env
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const client = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 8000,
})

// Tracks whether the real backend is reachable. When it isn't (e.g. backend
// not running yet, or ANPR/data pipeline not producing events), the UI falls
// back to representative mock data instead of showing a blank dashboard.
// This is a development/demo aid — remove USE_MOCK_FALLBACK once the
// backend is deployed and reliably reachable in every environment.
export let backendReachable = true

async function withFallback<T>(request: () => Promise<T>, fallback: () => T): Promise<T> {
  try {
    const result = await request()
    backendReachable = true
    return result
  } catch {
    backendReachable = false
    return fallback()
  }
}

export const api = {
  async health(): Promise<boolean> {
    try {
      const res = await client.get('/health')
      return res.data?.status === 'ok'
    } catch {
      return false
    }
  },

  async getCameras(): Promise<Camera[]> {
    return withFallback(
      async () => (await client.get<Camera[]>('/cameras')).data,
      () => mock.cameras,
    )
  },

  async getVehicle(plateNumber: string): Promise<VehicleSummary> {
    const res = await client.get<VehicleSummary>(`/vehicles/${encodeURIComponent(plateNumber)}`)
    return res.data
  },

  async getVehicleTrajectory(plateNumber: string): Promise<VehicleTrajectory> {
    const res = await client.get<VehicleTrajectory>(
      `/vehicles/${encodeURIComponent(plateNumber)}/trajectory`,
    )
    return res.data
  },

  async getDensity(params?: { camera_id?: string; start_time?: string; end_time?: string }): Promise<DensityStat[]> {
    return withFallback(
      async () => (await client.get<DensityStat[]>('/analytics/density', { params })).data,
      () => mock.density,
    )
  },

  async getCongestion(params?: { start_time?: string; end_time?: string }): Promise<CongestionStat[]> {
    return withFallback(
      async () => (await client.get<CongestionStat[]>('/analytics/congestion', { params })).data,
      () => mock.congestion,
    )
  },

  async getOD(params?: { start_time?: string; end_time?: string }): Promise<ODStat[]> {
    return withFallback(
      async () => (await client.get<ODStat[]>('/analytics/od', { params })).data,
      () => mock.odFlows,
    )
  },

  async getAlerts(params?: { severity?: string; type?: string; start_time?: string; end_time?: string }): Promise<Alert[]> {
    return withFallback(
      async () => (await client.get<Alert[]>('/alerts', { params })).data,
      () => mock.alerts,
    )
  },
}

export { BASE_URL }
