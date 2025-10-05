"use client"

import { useRef, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { usePerformanceStore } from '@/store/THREE/performanceStore'

export default function PerformanceCollector() {
  const { gl, scene } = useThree()
  const { updateMetrics, isEnabled, updateInterval } = usePerformanceStore()
  
  const frameCountRef = useRef(0)
  const lastTimeRef = useRef(performance.now())
  const fpsHistoryRef = useRef<number[]>([])
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

  useFrame((state, delta) => {
    if (!isEnabled) return

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

      // 렌더링 통계 수집
      const info = gl.info
      const sceneStats = getSceneStats()

      const metrics = {
        fps: avgFps,
        frameTime: frameTime,
        drawCalls: info.render.calls,
        triangles: info.render.triangles,
        geometries: info.memory.geometries,
        textures: info.memory.textures,
        memory: {
          geometries: info.memory.geometries,
          textures: info.memory.textures,
          programs: (info.memory as unknown as { programs: number })['programs'] || 0,
        },
        gpu: {
          renderCalls: info.render.calls,
          lines: info.render.lines,
          points: info.render.points,
          triangles: info.render.triangles,
        },
        scene: sceneStats
      }

      updateMetrics(metrics)

      // 리셋
      frameCountRef.current = 0
      lastTimeRef.current = currentTime
      updateTimerRef.current = 0
    }
  })

  return null // 이 컴포넌트는 렌더링하지 않음
}
