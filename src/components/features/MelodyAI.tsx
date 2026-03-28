
"use client"

import { PulsingBorder } from "@paper-design/shaders-react"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

function isWebGLSupported(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    const canvas = document.createElement("canvas")
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
    return !!gl
  } catch (e) {
    console.error("WebGL support check failed:", e);
    return false
  }
}

export interface PulsingCircleProps {
  position?: "bottom-right" | "center" | "bottom"
  size?: number
  isLoading?: boolean
  onClick?: () => void
}

const positionClasses = {
  "bottom-right": "fixed bottom-8 right-8 z-30",
  "bottom": "fixed bottom-24 z-30",
  center: "relative",
}

export default function Melody({
  position = "center",
  size = 200,
  isLoading = false,
  onClick
}: PulsingCircleProps) {
  const [webglSupported, setWebglSupported] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [speed, setSpeed] = useState(1.5)

  useEffect(() => {
    // This effect runs only on the client, after the component has mounted.
    setIsClient(true)
    setWebglSupported(isWebGLSupported());
  }, [])

  useEffect(() => {
    if (isLoading) {
      setSpeed(0.5); // Slow down when loading
    } else {
      // Speed up for 1 second, then return to normal
      setSpeed(5);
      const timer = setTimeout(() => {
        setSpeed(1.5);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (!isClient) {
    // Render a static placeholder on the server and during the initial client render.
    // This avoids the hydration mismatch.
    return <div style={{width: size, height: size}} className={position ? positionClasses[position] : ''} />;
  }

  const containerSize = Math.round(size * 1.33)

  const motionProps = {
    layout: true,
    initial: false,
    transition: { type: "spring", stiffness: 100, damping: 20 },
    onClick,
    className: position ? positionClasses[position] : '' + (onClick ? ' cursor-pointer' : '')
  };

  const showText = size > 50;

  return (
    <motion.div {...motionProps} style={{ width: size, height: size }}>
      <motion.div
        layout
        className="relative flex items-center justify-center w-full h-full"
      >
        { showText &&
          <motion.div
            layout
            className="absolute inset-0 animate-spin"
            style={{ animationDuration: '20s', animationDirection: 'reverse' }}
          >
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <path
                id="circlePath"
                fill="none"
                d="
                    M 100, 100
                    m -75, 0
                    a 75,75 0 1,1 150,0
                    a 75,75 0 1,1 -150,0
                "
              />
              <text fill="hsl(var(--foreground))" fontSize="16" letterSpacing="1">
                <textPath href="#circlePath" startOffset="50%" textAnchor="middle">
                • MELODY AI • MELODY AI • MELODY AI • MELODY AI • MELODY AI • MELODY AI • MELODY AI 
                </textPath>
              </text>
            </svg>
          </motion.div>
        }
        {webglSupported ? (
          <PulsingBorder
            colors={["#BEECFF", "#E77EDC", "#FF4C3E", "#00FF88", "#FFD700", "#FF6B35", "#8A2BE2"]}
            colorBack="#00000000"
            speed={speed}
            roundness={1}
            thickness={0.1}
            softness={0.2}
            intensity={5}
            spotSize={0.1}
            pulse={0.1}
            smoke={0.5}
            smokeSize={4}
            scale={0.65}
            rotation={0}
            frame={9161408.251009725}
            style={{
              width: `${size}px`,
              height: `${size}px`,
              borderRadius: "50%",
            }}
          />
        ) : (
          <motion.div
            layout
            className="w-full h-full rounded-full border-2 border-violet-400/60 animate-pulse bg-gradient-to-r from-violet-500/20 to-indigo-500/20"
          />
        )}
      </motion.div>
    </motion.div>
  )
}
