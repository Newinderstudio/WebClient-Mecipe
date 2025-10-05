import { useRef, useState, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
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

export default function usePerformanceMonitor(
  updateInterval: number = 1000,
  thresholds: PerformanceThresholds = defaultThresholds
) {
  const { gl, scene } = useThree()
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
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
  })

  const [alerts, setAlerts] = useState<string[]>([])
  const frameCountRef = useRef(0)
  const lastTimeRef = useRef(performance.now())
  const fpsHistoryRef = useRef<number[]>([])
  const frameTimeHistoryRef = useRef<number[]>([])
  const updateTimerRef = useRef(0)

  const getSceneStats = useCallback(() => {
    let objects = 0
    let materials = 0
    let lights = 0
    let meshes = 0

    scene.traverse((child) => {
      objects++
      if (child instanceof THREE.Mesh) {
        meshes++
        if (child.material) {
          if (Array.isArray(child.material)) {
            materials += child.material.length
          } else {
            materials++
          }
        }
      }
      if (child instanceof THREE.Light) {
        lights++
      }
    })

    return { objects, materials, lights, meshes }
  }, [scene])

  const checkPerformanceAlerts = useCallback((currentMetrics: PerformanceMetrics) => {
    const newAlerts: string[] = []

    // FPS 체크
    if (currentMetrics.fps < thresholds.fps.critical) {
      newAlerts.push(`Critical: FPS is very low (${currentMetrics.fps})`)
    } else if (currentMetrics.fps < thresholds.fps.warning) {
      newAlerts.push(`Warning: FPS is low (${currentMetrics.fps})`)
    }

    // Draw Calls 체크
    if (currentMetrics.drawCalls > thresholds.drawCalls.critical) {
      newAlerts.push(`Critical: Too many draw calls (${currentMetrics.drawCalls})`)
    } else if (currentMetrics.drawCalls > thresholds.drawCalls.warning) {
      newAlerts.push(`Warning: High draw calls (${currentMetrics.drawCalls})`)
    }

    // Triangles 체크
    if (currentMetrics.triangles > thresholds.triangles.critical) {
      newAlerts.push(`Critical: Too many triangles (${currentMetrics.triangles.toLocaleString()})`)
    } else if (currentMetrics.triangles > thresholds.triangles.warning) {
      newAlerts.push(`Warning: High triangle count (${currentMetrics.triangles.toLocaleString()})`)
    }

    // Memory 체크
    const totalMemory = currentMetrics.memory.geometries + currentMetrics.memory.textures
    if (totalMemory > 1000) {
      newAlerts.push(`Warning: High memory usage (${totalMemory} objects)`)
    }

    setAlerts(newAlerts)
  }, [thresholds])

  const getPerformanceStatus = useCallback((metric: keyof PerformanceMetrics, value: number) => {
    switch (metric) {
      case 'fps':
        if (value >= thresholds.fps.good) return 'good'
        if (value >= thresholds.fps.warning) return 'warning'
        return 'critical'
      case 'drawCalls':
        if (value <= thresholds.drawCalls.good) return 'good'
        if (value <= thresholds.drawCalls.warning) return 'warning'
        return 'critical'
      case 'triangles':
        if (value <= thresholds.triangles.good) return 'good'
        if (value <= thresholds.triangles.warning) return 'warning'
        return 'critical'
      default:
        return 'good'
    }
  }, [thresholds])

  const getStatusColor = useCallback((status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good': return '#00ff00'
      case 'warning': return '#ffff00'
      case 'critical': return '#ff0000'
      default: return '#ffffff'
    }
  }, [])

  useFrame((state, delta) => {
    frameCountRef.current++
    updateTimerRef.current += delta * 1000

    // 지정된 간격마다 메트릭 업데이트
    if (updateTimerRef.current >= updateInterval) {
      const currentTime = performance.now()
      const deltaTime = currentTime - lastTimeRef.current
      
      // FPS 계산
      const fps = Math.round((frameCountRef.current * 1000) / deltaTime)
      fpsHistoryRef.current.push(fps)
      
      // 최근 60프레임의 평균 FPS 유지
      if (fpsHistoryRef.current.length > 60) {
        fpsHistoryRef.current.shift()
      }
      
      const avgFps = Math.round(fpsHistoryRef.current.reduce((a, b) => a + b, 0) / fpsHistoryRef.current.length)
      
      // Frame time 계산
      const frameTime = Math.round((deltaTime / frameCountRef.current) * 100) / 100
      frameTimeHistoryRef.current.push(frameTime)
      
      if (frameTimeHistoryRef.current.length > 60) {
        frameTimeHistoryRef.current.shift()
      }

      // 렌더링 통계 수집
      const info = gl.info
      const sceneStats = getSceneStats()

      const currentMetrics: PerformanceMetrics = {
        fps: avgFps,
        frameTime: frameTime,
        drawCalls: info.render.calls,
        triangles: info.render.triangles,
        geometries: info.memory.geometries,
        textures: info.memory.textures,
        memory: {
          geometries: info.memory.geometries,
          textures: info.memory.textures,
          programs: info.memory.geometries || 0,
        },
        gpu: {
          renderCalls: info.render.calls,
          lines: info.render.lines,
          points: info.render.points,
          triangles: info.render.triangles,
        },
        scene: sceneStats
      }

      setMetrics(currentMetrics)
      checkPerformanceAlerts(currentMetrics)

      // 리셋
      frameCountRef.current = 0
      lastTimeRef.current = currentTime
      updateTimerRef.current = 0
    }
  })

  const clearAlerts = useCallback(() => {
    setAlerts([])
  }, [])

  const resetStats = useCallback(() => {
    gl.info.reset()
    setAlerts([])
    fpsHistoryRef.current = []
    frameTimeHistoryRef.current = []
  }, [gl])

  return {
    metrics,
    alerts,
    getPerformanceStatus,
    getStatusColor,
    clearAlerts,
    resetStats,
    thresholds
  }
}

