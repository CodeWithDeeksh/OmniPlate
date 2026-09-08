// Mirrors docs/data_contract.md and docs/api_contract.md exactly.
// Do not rename fields without checking with backend lead (shared contract rule).

export type Direction =
  | 'NORTH' | 'SOUTH' | 'EAST' | 'WEST'
  | 'NORTH_EAST' | 'NORTH_WEST' | 'SOUTH_EAST' | 'SOUTH_WEST'
  | 'UNKNOWN'

export type VehicleType =
  | 'car' | 'motorcycle' | 'bus' | 'truck' | 'auto' | 'van' | 'other' | 'unknown'

export type CongestionLevel = 'LOW' | 'MEDIUM' | 'HIGH'

export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH'

export type AlertType =
  | 'BLACKLISTED_VEHICLE'
  | 'IMPOSSIBLE_TRAVEL'
  | 'ROUTE_ANOMALY'
  | string

export interface DetectionEvent {
  event_id: string
  plate_number: string
  confidence: number
  camera_id: string
  timestamp: string
  latitude: number
  longitude: number
  direction: Direction
  vehicle_type: VehicleType
  snapshot_path?: string | null
}

export interface Camera {
  camera_id: string
  name: string
  latitude: number
  longitude: number
  road: string
  direction: Direction
}

export interface VehicleSummary {
  plate_number: string
  first_seen: string
  last_seen: string
  detection_count: number
  camera_count: number
}

export interface TrajectoryPoint {
  camera_id: string
  timestamp: string
  latitude: number
  longitude: number
  direction: Direction
}

export interface VehicleTrajectory {
  plate_number: string
  first_seen: string
  last_seen: string
  detections: TrajectoryPoint[]
}

export interface DensityStat {
  camera_id: string
  road: string
  vehicles_per_hour: number
}

export interface CongestionStat {
  from_camera: string
  to_camera: string
  travel_time_minutes: number
  normal_travel_time_minutes: number
  congestion_level: CongestionLevel
}

export interface ODStat {
  origin_zone: string
  destination_zone: string
  vehicle_count: number
}

export interface Alert {
  alert_id: string
  plate_number: string
  type: AlertType
  camera_id: string
  timestamp: string
  severity: AlertSeverity
  message: string
}

export interface ApiError {
  error: {
    code: string
    message: string
  }
}
