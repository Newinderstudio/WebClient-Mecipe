import { create } from 'zustand'
import * as THREE from 'three'

export interface PerformanceMetrics {
  fps: number
  frameTime: number
  drawCalls: number
  triangles: number
  geometries: number
  textures: number
  memory: {
    geometries: number
    textures: number
    programs: number
  }
  gpu: {
    renderCalls: number
    lines: number
    points: number
    triangles: number
  }
  scene: {
    objects: number
    materials: number
    lights: number
    meshes: number
  }
}

export interface PerformanceThresholds {
  fps: {
    good: number
    warning: number
    critical: number
  }
  drawCalls: {
    good: number
    warning: number
    critical: number
  }
  triangles: {
    good: number
    warning: number
    critical: number
  }
}

export interface PerformanceAlert {
  id: string
  message: string
  type: 'warning' | 'critical'
  timestamp: number
}

const defaultThresholds: PerformanceThresholds = {
  fps: {
    good: 55,
    warning: 30,
    critical: 15
  },
  drawCalls: {
    good: 50,
    warning: 100,
    critical: 200
  },
  triangles: {
    good: 10000,
    warning: 50000,
    critical: 100000
  }
}

interface PerformanceState {
  metrics: PerformanceMetrics
  alerts: PerformanceAlert[]
  thresholds: PerformanceThresholds
  isEnabled: boolean
  updateInterval: number
  
  // Actions
  updateMetrics: (metrics: Partial<PerformanceMetrics>) => void
  addAlert: (alert: Omit<PerformanceAlert, 'id' | 'timestamp'>) => void
  clearAlerts: () => void
  setThresholds: (thresholds: Partial<PerformanceThresholds>) => void
  setEnabled: (enabled: boolean) => void
  setUpdateInterval: (interval: number) => void
  reset: () => void
}

const initialMetrics: PerformanceMetrics = {
  fps: 0,
  frameTime: 0,
  drawCalls: 0,
  triangles: 0,
  geometries: 0,
  textures: 0,
  memory: {
    geometries: 0,
    textures: 0,
    programs: 0,
  },
  gpu: {
    renderCalls: 0,
    lines: 0,
    points: 0,
    triangles: 0,
  },
  scene: {
    objects: 0,
    materials: 0,
    lights: 0,
    meshes: 0,
  }
}

export const usePerformanceStore = create<PerformanceState>((set, get) => ({
  metrics: initialMetrics,
  alerts: [],
  thresholds: defaultThresholds,
  isEnabled: true,
  updateInterval: 1000,

  updateMetrics: (newMetrics) => {
    const currentState = get()
    const updatedMetrics = { ...currentState.metrics, ...newMetrics }
    
    set({ metrics: updatedMetrics })
    
    // 성능 알림 체크
    currentState.checkPerformanceAlerts(updatedMetrics)
  },

  addAlert: (alert) => {
    const newAlert: PerformanceAlert = {
      ...alert,
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    }
    
    set((state) => ({
      alerts: [...state.alerts.filter(a => a.message !== alert.message), newAlert]
    }))
  },

  clearAlerts: () => {
    set({ alerts: [] })
  },

  setThresholds: (newThresholds) => {
    set((state) => ({
      thresholds: { ...state.thresholds, ...newThresholds }
    }))
  },

  setEnabled: (enabled) => {
    set({ isEnabled: enabled })
  },

  setUpdateInterval: (interval) => {
    set({ updateInterval: interval })
  },

  reset: () => {
    set({
      metrics: initialMetrics,
      alerts: []
    })
  },

  // 성능 알림 체크 함수
  checkPerformanceAlerts: (metrics: PerformanceMetrics) => {
    const { thresholds, addAlert } = get()
    const newAlerts: Omit<PerformanceAlert, 'id' | 'timestamp'>[] = []

    // FPS 체크
    if (metrics.fps < thresholds.fps.critical && metrics.fps > 0) {
      newAlerts.push({
        message: `Critical: FPS is very low (${metrics.fps})`,
        type: 'critical'
      })
    } else if (metrics.fps < thresholds.fps.warning && metrics.fps > 0) {
      newAlerts.push({
        message: `Warning: FPS is low (${metrics.fps})`,
        type: 'warning'
      })
    }

    // Draw Calls 체크
    if (metrics.drawCalls > thresholds.drawCalls.critical) {
      newAlerts.push({
        message: `Critical: Too many draw calls (${metrics.drawCalls})`,
        type: 'critical'
      })
    } else if (metrics.drawCalls > thresholds.drawCalls.warning) {
      newAlerts.push({
        message: `Warning: High draw calls (${metrics.drawCalls})`,
        type: 'warning'
      })
    }

    // Triangles 체크
    if (metrics.triangles > thresholds.triangles.critical) {
      newAlerts.push({
        message: `Critical: Too many triangles (${metrics.triangles.toLocaleString()})`,
        type: 'critical'
      })
    } else if (metrics.triangles > thresholds.triangles.warning) {
      newAlerts.push({
        message: `Warning: High triangle count (${metrics.triangles.toLocaleString()})`,
        type: 'warning'
      })
    }

    // Memory 체크
    const totalMemory = metrics.memory.geometries + metrics.memory.textures
    if (totalMemory > 1000) {
      newAlerts.push({
        message: `Warning: High memory usage (${totalMemory} objects)`,
        type: 'warning'
      })
    }

    // 알림 추가
    newAlerts.forEach(alert => addAlert(alert))
  }
}))
