"use client"

import { useEffect, useState } from 'react'
import { usePerformanceStore } from '@/store/THREE/performanceStore'

export default function PerformanceDisplay() {
  const {
    metrics,
    alerts,
    thresholds,
    isEnabled,
    clearAlerts,
    reset,
    setEnabled
  } = usePerformanceStore()
  
  const [isVisible, setIsVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [showAlerts, setShowAlerts] = useState(true)

  // 키보드 단축키
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'p' || event.key === 'P') {
        setIsVisible(prev => !prev)
      }
      if (event.key === 't' || event.key === 'T') {
        setShowDetails(prev => !prev)
      }
      if (event.key === 'l' || event.key === 'L') {
        setShowAlerts(prev => !prev)
      }
      if (event.key === 'y' || event.key === 'Y') {
        reset()
      }
      if (event.key === 'o' || event.key === 'O') {
        setEnabled(!isEnabled)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [reset, isEnabled, setEnabled])

  if (!isVisible || !isEnabled) return null

  const getPerformanceStatus = (metric: 'fps' | 'drawCalls' | 'triangles', value: number) => {
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
  }

  const getStatusColor = (status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good': return '#00ff00'
      case 'warning': return '#ffff00'
      case 'critical': return '#ff0000'
      default: return '#ffffff'
    }
  }

  const getMemoryUsage = () => {
    const totalMemory = metrics.memory.geometries + metrics.memory.textures
    return totalMemory
  }

  const getAlertColor = (type: 'warning' | 'critical') => {
    return type === 'critical' ? '#ff4444' : '#ffaa44'
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: 'rgba(0, 0, 0, 0.85)',
        color: 'white',
        padding: '12px',
        borderRadius: '8px',
        fontFamily: 'monospace',
        fontSize: '12px',
        zIndex: 1000,
        minWidth: '220px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* 헤더 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '10px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        paddingBottom: '6px'
      }}>
        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#00ffff' }}>
          🚀 Performance Monitor
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={() => setShowDetails(!showDetails)}
            style={{
              background: showDetails ? 'rgba(0, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: 'white',
              padding: '3px 6px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '9px'
            }}
          >
            {showDetails ? 'Simple' : 'Details'}
          </button>
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            style={{
              background: alerts.length > 0 ? 'rgba(255, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: 'white',
              padding: '3px 6px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '9px'
            }}
          >
            A
          </button>
          <button
            onClick={reset}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: 'white',
              padding: '3px 6px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '9px'
            }}
          >
            R
          </button>
          <button
            onClick={() => setIsVisible(false)}
            style={{
              background: 'rgba(255, 68, 68, 0.5)',
              border: 'none',
              color: 'white',
              padding: '3px 6px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '9px'
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* 알림 */}
      {showAlerts && alerts.length > 0 && (
        <div style={{ 
          marginBottom: '10px',
          border: '1px solid rgba(255, 68, 68, 0.5)',
          borderRadius: '6px',
          padding: '6px',
          background: 'rgba(255, 68, 68, 0.1)'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '4px'
          }}>
            <span style={{ fontSize: '11px', color: '#ff6666', fontWeight: 'bold' }}>
              ⚠️ Performance Alerts
            </span>
            <button
              onClick={clearAlerts}
              style={{
                background: 'none',
                border: 'none',
                color: '#ff6666',
                cursor: 'pointer',
                fontSize: '10px'
              }}
            >
              ✕
            </button>
          </div>
          {alerts.slice(-3).map((alert) => (
            <div 
              key={alert.id} 
              style={{ 
                fontSize: '10px', 
                color: getAlertColor(alert.type), 
                marginBottom: '2px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>{alert.type === 'critical' ? '🔴' : '🟡'}</span>
              <span>{alert.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* 기본 정보 */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginBottom: '3px',
          alignItems: 'center'
        }}>
          <span>🎯 FPS:</span>
          <span style={{ 
            color: getStatusColor(getPerformanceStatus('fps', metrics.fps)), 
            fontWeight: 'bold',
            fontSize: '13px'
          }}>
            {metrics.fps}
          </span>
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginBottom: '3px'
        }}>
          <span>⏱️ Frame Time:</span>
          <span>{metrics.frameTime}ms</span>
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginBottom: '3px'
        }}>
          <span>📊 Draw Calls:</span>
          <span style={{ 
            color: getStatusColor(getPerformanceStatus('drawCalls', metrics.drawCalls))
          }}>
            {metrics.drawCalls}
          </span>
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginBottom: '3px'
        }}>
          <span>🔺 Triangles:</span>
          <span style={{ 
            color: getStatusColor(getPerformanceStatus('triangles', metrics.triangles))
          }}>
            {metrics.triangles.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 상세 정보 */}
      {showDetails && (
        <div style={{ 
          borderTop: '1px solid rgba(255, 255, 255, 0.2)',
          paddingTop: '10px',
          marginTop: '10px'
        }}>
          {/* 메모리 사용량 */}
          <div style={{ marginBottom: '10px' }}>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '12px', color: '#00ffff' }}>
              💾 Memory Usage
            </h4>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '2px'
            }}>
              <span>Geometries:</span>
              <span>{metrics.memory.geometries}</span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '2px'
            }}>
              <span>Textures:</span>
              <span>{metrics.memory.textures}</span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '2px'
            }}>
              <span>Programs:</span>
              <span>{metrics.memory.programs}</span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '2px'
            }}>
              <span>Total Memory:</span>
              <span style={{ fontWeight: 'bold' }}>{getMemoryUsage()}</span>
            </div>
          </div>

          {/* GPU 통계 */}
          <div style={{ marginBottom: '10px' }}>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '12px', color: '#00ffff' }}>
              🎮 GPU Stats
            </h4>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '2px'
            }}>
              <span>Render Calls:</span>
              <span>{metrics.gpu.renderCalls}</span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '2px'
            }}>
              <span>Lines:</span>
              <span>{metrics.gpu.lines}</span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '2px'
            }}>
              <span>Points:</span>
              <span>{metrics.gpu.points}</span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '2px'
            }}>
              <span>Triangles:</span>
              <span>{metrics.gpu.triangles.toLocaleString()}</span>
            </div>
          </div>

          {/* 씬 통계 */}
          <div style={{ marginBottom: '10px' }}>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '12px', color: '#00ffff' }}>
              🌍 Scene Stats
            </h4>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '2px'
            }}>
              <span>Objects:</span>
              <span>{metrics.scene.objects}</span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '2px'
            }}>
              <span>Meshes:</span>
              <span>{metrics.scene.meshes}</span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '2px'
            }}>
              <span>Materials:</span>
              <span>{metrics.scene.materials}</span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '2px'
            }}>
              <span>Lights:</span>
              <span>{metrics.scene.lights}</span>
            </div>
          </div>
        </div>
      )}

      {/* 키보드 단축키 안내 */}
      <div style={{ 
        fontSize: '10px', 
        color: 'rgba(255, 255, 255, 0.6)',
        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
        paddingTop: '6px',
        marginTop: '10px'
      }}>
        <div style={{ marginBottom: '2px' }}>P: Toggle GUI</div>
        <div style={{ marginBottom: '2px' }}>T: Toggle Details</div>
        <div style={{ marginBottom: '2px' }}>L: Toggle Alerts</div>
        <div style={{ marginBottom: '2px' }}>Y: Reset Stats</div>
        <div>O: Enable/Disable</div>
      </div>
    </div>
  )
}
