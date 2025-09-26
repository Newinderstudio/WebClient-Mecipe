"use client"

import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PointerLockControls } from '@react-three/drei'
import { MouseEvent } from 'react'

interface BoxProps {
  position?: [number, number, number]
}

function Box(props: BoxProps) {
  // This reference gives us direct access to the THREE.Mesh object
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ref = useRef<any>(null)
  // Hold state for hovered and clicked events
  const [hovered, hover] = useState(false)
  const [clicked, click] = useState(false)
  // Subscribe this component to the render-loop, rotate the mesh every frame
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x += delta
    }
  })
  // Return the view, these are regular Threejs elements expressed in JSX
  return (
    <mesh
      {...props}
      ref={ref}
      scale={clicked ? 1.5 : 1}
      onClick={() => click(!clicked)}
      onPointerOver={(event: MouseEvent) => (event.stopPropagation(), hover(true))}
      onPointerOut={() => hover(false)}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  )
}

export default function TestThreeScreen() {

  const [pointerLock, setPointerLock] = useState(false);

  const onClickPointerLock = () => {
    setPointerLock(!pointerLock);
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
      }}
    >
      <Canvas camera={{ fov: 45 }} onPointerDown={onClickPointerLock} >
        <PointerLockControls enabled={pointerLock} />
        <ambientLight intensity={Math.PI / 2} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
        <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
        <Box position={[-1.2, 0, 0]} />
        <Box position={[1.2, 0, 0]} />
        <OrbitControls />
      </Canvas>
    </div>

  )
}
