'use client'

import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Stars, Float, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { useOSStore } from '@/store/os.store'

function ParticleRing() {
  const points = useRef<THREE.Points>(null)
  
  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.elapsedTime * 0.05
      points.current.rotation.x = state.clock.elapsedTime * 0.02
    }
  })

  // Generate a torus knot shaped particle field
  const particleCount = 2000
  const positions = new Float32Array(particleCount * 3)
  for(let i = 0; i < particleCount; i++) {
    const t = i / particleCount * Math.PI * 2
    const p = 3
    const q = 4
    const r = Math.cos(q * t) + 2
    positions[i*3] = r * Math.cos(p * t) * 2 + (Math.random() - 0.5)
    positions[i*3+1] = r * Math.sin(p * t) * 2 + (Math.random() - 0.5)
    positions[i*3+2] = -Math.sin(q * t) * 2 + (Math.random() - 0.5)
  }

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#d4af37" transparent opacity={0.6} blending={THREE.AdditiveBlending} />
    </points>
  )
}

function Scene() {
  return (
    <>
      <color attach="background" args={['#05020a']} />
      <fog attach="fog" args={['#05020a', 10, 50]} />
      
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#7c3aed" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#d4af37" />

      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
        <ParticleRing />
      </Float>
    </>
  )
}

export default function ThreeBackground() {
  return (
    <div className="w-full h-full absolute inset-0 -z-10 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        <Scene />
      </Canvas>
    </div>
  )
}
