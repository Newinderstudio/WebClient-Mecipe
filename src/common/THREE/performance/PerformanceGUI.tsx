"use client"

import { useEffect, useState } from 'react'
import usePerformanceMonitor from './hooks/usePerformanceMonitor'
import { Html } from '@react-three/drei'

export default function PerformanceGUI() {
    const {
        metrics,
        alerts,
        getPerformanceStatus,
        getStatusColor,
        clearAlerts,
        resetStats
    } = usePerformanceMonitor(1000)

    const [isVisible, setIsVisible] = useState(true)
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
                resetStats()
            }
        }

        window.addEventListener('keydown', handleKeyPress)
        return () => window.removeEventListener('keydown', handleKeyPress)
    }, [resetStats])

    if (!isVisible) return null

    const getMemoryUsage = () => {
        const totalMemory = metrics.memory.geometries + metrics.memory.textures
        return totalMemory
    }

    return (
        <Html
            fullscreen={true}
            style={{
                position: 'relative',
            }}
        >

            <div
                style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'rgba(0, 0, 0, 0.8)',
                    color: 'white',
                    padding: '10px',
                    borderRadius: '8px',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    zIndex: 1000,
                    minWidth: '200px',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
            >
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                    paddingBottom: '4px'
                }}>
                    <div style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>
                        Performance Monitor
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                            onClick={() => setShowDetails(!showDetails)}
                            style={{
                                background: 'rgba(255, 255, 255, 0.2)',
                                border: 'none',
                                color: 'white',
                                padding: '2px 4px',
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
                                background: alerts.length > 0 ? 'rgba(255, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.2)',
                                border: 'none',
                                color: 'white',
                                padding: '2px 4px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '9px'
                            }}
                        >
                            A
                        </button>
                        <button
                            onClick={resetStats}
                            style={{
                                background: 'rgba(255, 255, 255, 0.2)',
                                border: 'none',
                                color: 'white',
                                padding: '2px 4px',
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
                                background: 'rgba(255, 0, 0, 0.5)',
                                border: 'none',
                                color: 'white',
                                padding: '2px 4px',
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
                        marginBottom: '8px',
                        border: '1px solid rgba(255, 0, 0, 0.5)',
                        borderRadius: '4px',
                        padding: '4px',
                        background: 'rgba(255, 0, 0, 0.1)'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '2px'
                        }}>
                            <span style={{ fontSize: '11px', color: '#ff6666', fontWeight: 'bold' }}>
                                Performance Alerts
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
                        {alerts.map((alert, index) => (
                            <div key={index} style={{ fontSize: '10px', color: '#ffaaaa', marginBottom: '1px' }}>
                                • {alert}
                            </div>
                        ))}
                    </div>
                )}

                {/* 기본 정보 */}
                <div style={{ marginBottom: '8px' }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '2px'
                    }}>
                        <span>FPS:</span>
                        <span style={{
                            color: getStatusColor(getPerformanceStatus('fps', metrics.fps)),
                            fontWeight: 'bold'
                        }}>
                            {metrics.fps}
                        </span>
                    </div>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '2px'
                    }}>
                        <span>Frame Time:</span>
                        <span>{metrics.frameTime}ms</span>
                    </div>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '2px'
                    }}>
                        <span>Draw Calls:</span>
                        <span style={{
                            color: getStatusColor(getPerformanceStatus('drawCalls', metrics.drawCalls))
                        }}>
                            {metrics.drawCalls}
                        </span>
                    </div>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '2px'
                    }}>
                        <span>Triangles:</span>
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
                        paddingTop: '8px',
                        marginTop: '8px'
                    }}>
                        <div style={{ marginBottom: '8px' }}>
                            <h4 style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#00ffff' }}>
                                Memory Usage
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
                                <span>{getMemoryUsage()}</span>
                            </div>
                        </div>

                        <div style={{ marginBottom: '8px' }}>
                            <h4 style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#00ffff' }}>
                                GPU Stats
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

                        <div style={{ marginBottom: '8px' }}>
                            <h4 style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#00ffff' }}>
                                Scene Stats
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
                    paddingTop: '4px',
                    marginTop: '8px'
                }}>
                    <div>P: Toggle GUI</div>
                    <div>D: Toggle Details</div>
                    <div>A: Toggle Alerts</div>
                    <div>R: Reset Stats</div>
                </div>
            </div>
        </Html>
    )
}
