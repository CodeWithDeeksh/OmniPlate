import type { Camera, DensityStat, CongestionStat, ODStat, Alert, VehicleTrajectory, VehicleSummary } from './types'

export const cameras: Camera[] = [
  { camera_id: 'CAM_01', name: 'MG Road Junction', latitude: 12.9716, longitude: 77.5946, road: 'MG Road', direction: 'EAST' },
  { camera_id: 'CAM_02', name: 'Brigade Road', latitude: 12.9712, longitude: 77.6050, road: 'Brigade Road', direction: 'NORTH' },
  { camera_id: 'CAM_04', name: 'Trinity Circle', latitude: 12.9738, longitude: 77.6069, road: 'Trinity Circle', direction: 'NORTH' },
  { camera_id: 'CAM_07', name: 'Richmond Circle', latitude: 12.9634, longitude: 77.5985, road: 'Richmond Road', direction: 'WEST' },
  { camera_id: 'CAM_12', name: 'Cubbon Park Gate', latitude: 12.9763, longitude: 77.5929, road: 'Kasturba Road', direction: 'SOUTH' },
  { camera_id: 'CAM_16', name: 'Vidhana Soudha', latitude: 12.9794, longitude: 77.5912, road: 'Ambedkar Veedhi', direction: 'EAST' },
  { camera_id: 'CAM_17', name: 'Shivajinagar', latitude: 12.9857, longitude: 77.6057, road: 'Queens Road', direction: 'SOUTH_WEST' },
  { camera_id: 'CAM_21', name: 'Hudson Circle', latitude: 12.9695, longitude: 77.5847, road: 'Hudson Circle', direction: 'NORTH_EAST' },
]

export const density: DensityStat[] = [
  { camera_id: 'CAM_01', road: 'MG Road', vehicles_per_hour: 1240 },
  { camera_id: 'CAM_02', road: 'Brigade Road', vehicles_per_hour: 980 },
  { camera_id: 'CAM_04', road: 'Trinity Circle', vehicles_per_hour: 1560 },
  { camera_id: 'CAM_07', road: 'Richmond Road', vehicles_per_hour: 720 },
  { camera_id: 'CAM_12', road: 'Kasturba Road', vehicles_per_hour: 640 },
  { camera_id: 'CAM_16', road: 'Ambedkar Veedhi', vehicles_per_hour: 1105 },
  { camera_id: 'CAM_17', road: 'Queens Road', vehicles_per_hour: 890 },
  { camera_id: 'CAM_21', road: 'Hudson Circle', vehicles_per_hour: 1330 },
]

export const congestion: CongestionStat[] = [
  { from_camera: 'CAM_12', to_camera: 'CAM_16', travel_time_minutes: 18, normal_travel_time_minutes: 9, congestion_level: 'HIGH' },
  { from_camera: 'CAM_01', to_camera: 'CAM_02', travel_time_minutes: 11, normal_travel_time_minutes: 7, congestion_level: 'MEDIUM' },
  { from_camera: 'CAM_04', to_camera: 'CAM_17', travel_time_minutes: 8, normal_travel_time_minutes: 6, congestion_level: 'LOW' },
  { from_camera: 'CAM_07', to_camera: 'CAM_21', travel_time_minutes: 15, normal_travel_time_minutes: 8, congestion_level: 'HIGH' },
]

export const odFlows: ODStat[] = [
  { origin_zone: 'ZONE_A', destination_zone: 'ZONE_D', vehicle_count: 1540 },
  { origin_zone: 'ZONE_B', destination_zone: 'ZONE_A', vehicle_count: 980 },
  { origin_zone: 'ZONE_C', destination_zone: 'ZONE_D', vehicle_count: 720 },
  { origin_zone: 'ZONE_D', destination_zone: 'ZONE_B', vehicle_count: 1105 },
  { origin_zone: 'ZONE_A', destination_zone: 'ZONE_C', vehicle_count: 640 },
]

export const alerts: Alert[] = [
  { alert_id: 'alert_001', plate_number: 'KA01AB1234', type: 'BLACKLISTED_VEHICLE', camera_id: 'CAM_17', timestamp: new Date(Date.now() - 3 * 60000).toISOString(), severity: 'HIGH', message: 'Blacklisted vehicle detected' },
  { alert_id: 'alert_002', plate_number: 'KA05CD5678', type: 'IMPOSSIBLE_TRAVEL', camera_id: 'CAM_04', timestamp: new Date(Date.now() - 14 * 60000).toISOString(), severity: 'HIGH', message: 'Vehicle observed at two locations faster than physically possible' },
  { alert_id: 'alert_003', plate_number: 'KA09EF9012', type: 'ROUTE_ANOMALY', camera_id: 'CAM_12', timestamp: new Date(Date.now() - 32 * 60000).toISOString(), severity: 'MEDIUM', message: 'Unusual route pattern deviates from vehicle history' },
  { alert_id: 'alert_004', plate_number: 'KA02GH3456', type: 'BLACKLISTED_VEHICLE', camera_id: 'CAM_02', timestamp: new Date(Date.now() - 58 * 60000).toISOString(), severity: 'HIGH', message: 'Blacklisted vehicle detected' },
  { alert_id: 'alert_005', plate_number: 'KA11IJ7890', type: 'ROUTE_ANOMALY', camera_id: 'CAM_21', timestamp: new Date(Date.now() - 95 * 60000).toISOString(), severity: 'LOW', message: 'Minor deviation from typical corridor' },
]

export function vehicleSummary(plate: string): VehicleSummary {
  return {
    plate_number: plate,
    first_seen: new Date(Date.now() - 10 * 3600_000).toISOString(),
    last_seen: new Date(Date.now() - 6 * 60_000).toISOString(),
    detection_count: 8,
    camera_count: 6,
  }
}

export function vehicleTrajectory(plate: string): VehicleTrajectory {
  const base = Date.now() - 10 * 3600_000
  const points = cameras.slice(0, 6)
  return {
    plate_number: plate,
    first_seen: new Date(base).toISOString(),
    last_seen: new Date(base + 6 * 3_600_000).toISOString(),
    detections: points.map((c, i) => ({
      camera_id: c.camera_id,
      timestamp: new Date(base + i * 3_600_000).toISOString(),
      latitude: c.latitude,
      longitude: c.longitude,
      direction: c.direction,
    })),
  }
}

export const recentDetections = [
  { plate: 'KA01AB1234', camera: 'CAM_01 · MG Road', vehicle: 'car', time: '2 min ago', confidence: 0.94 },
  { plate: 'KA05CD5678', camera: 'CAM_04 · Trinity Circle', vehicle: 'truck', time: '4 min ago', confidence: 0.88 },
  { plate: 'KA09EF9012', camera: 'CAM_12 · Kasturba Road', vehicle: 'motorcycle', time: '6 min ago', confidence: 0.91 },
  { plate: 'KA02GH3456', camera: 'CAM_02 · Brigade Road', vehicle: 'car', time: '9 min ago', confidence: 0.97 },
  { plate: 'KA11IJ7890', camera: 'CAM_21 · Hudson Circle', vehicle: 'bus', time: '11 min ago', confidence: 0.85 },
]
