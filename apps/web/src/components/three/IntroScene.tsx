'use client'

import React, { useMemo, useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface IntroSceneProps {
  onComplete: () => void
}

const vertexShader = `
uniform float uTime;
uniform float uMorph;
attribute vec3 targetPosition;
attribute float size;

varying vec3 vColor;

void main() {
  // Interpolate between initial position and target position
  vec3 pos = mix(position, targetPosition, uMorph);
  
  // Add some gentle floating motion
  pos.x += sin(uTime * 0.5 + position.y) * 0.1 * (1.0 - uMorph);
  pos.y += cos(uTime * 0.3 + position.x) * 0.1 * (1.0 - uMorph);
  pos.z += sin(uTime * 0.4 + position.z) * 0.1 * (1.0 - uMorph);

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  
  // Size attenuation
  gl_PointSize = size * (30.0 / -mvPosition.z);
  
  // Color based on depth and morph state
  vColor = mix(vec3(0.48, 0.22, 0.92), vec3(0.83, 0.68, 0.21), uMorph); // Purple to Gold
}
`

const fragmentShader = `
varying vec3 vColor;

void main() {
  // Circular particle
  float dist = length(gl_PointCoord - vec2(0.5));
  if (dist > 0.5) discard;
  
  // Soft edge glow
  float alpha = 1.0 - (dist * 2.0);
  alpha = pow(alpha, 1.5);
  
  gl_FragColor = vec4(vColor, alpha * 0.8);
}
`

function ParticleMorph({ onComplete }: { onComplete: () => void }) {
  const pointsRef = useRef<THREE.Points>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const completedRef = useRef(false)
  
  const particleCount = 50000

  // Generate geometry
  const { positions, targetPositions, sizes } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3)
    const target = new Float32Array(particleCount * 3)
    const sz = new Float32Array(particleCount)

    for (let i = 0; i < particleCount; i++) {
      // Start shape: large dispersed sphere / chaos
      const r1 = 20 * Math.cbrt(Math.random())
      const theta1 = Math.random() * 2 * Math.PI
      const phi1 = Math.acos(2 * Math.random() - 1)
      pos[i * 3] = r1 * Math.sin(phi1) * Math.cos(theta1)
      pos[i * 3 + 1] = r1 * Math.sin(phi1) * Math.sin(theta1)
      pos[i * 3 + 2] = r1 * Math.cos(phi1)

      // Target shape: A dense galaxy/torus-knot hybrid
      const t = (i / particleCount) * Math.PI * 2
      const p = 3
      const q = 4
      const r2 = Math.cos(q * t) + 3
      const noise = 0.5
      target[i * 3] = r2 * Math.cos(p * t) * 3 + (Math.random() - 0.5) * noise
      target[i * 3 + 1] = r2 * Math.sin(p * t) * 3 + (Math.random() - 0.5) * noise
      target[i * 3 + 2] = -Math.sin(q * t) * 3 + (Math.random() - 0.5) * noise

      // Random sizes
      sz[i] = Math.random() * 2.0 + 0.5
    }

    return { positions: pos, targetPositions: target, sizes: sz }
  }, [particleCount])

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMorph: { value: 0 }
  }), [])

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
      
      const morphDuration = 4.0 // 4 seconds morph
      const morphProgress = Math.min(state.clock.elapsedTime / morphDuration, 1.0)
      const easeOut = 1 - Math.pow(1 - morphProgress, 3)
      materialRef.current.uniforms.uMorph.value = easeOut

      // If animation finishes, trigger onComplete
      if (morphProgress >= 1.0 && !completedRef.current) {
        completedRef.current = true
        // Add a slight delay before triggering to let user admire the final shape
        setTimeout(onComplete, 500)
      }
    }
    
    if (pointsRef.current) {
      // Rotation and zoom in over time
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05
      pointsRef.current.rotation.x = state.clock.elapsedTime * 0.025
      
      const scale = 1 + state.clock.elapsedTime * 0.05
      pointsRef.current.scale.set(scale, scale, scale)
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-targetPosition"
          count={particleCount}
          args={[targetPositions, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          count={particleCount}
          args={[sizes, 1]}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

export default function IntroScene({ onComplete }: IntroSceneProps) {
  return (
    <div className="w-full h-full bg-[#060310] absolute inset-0 z-[100] cursor-none">
      <Canvas camera={{ position: [0, 0, 20], fov: 60 }}>
        <ParticleMorph onComplete={onComplete} />
      </Canvas>
    </div>
  )
}
