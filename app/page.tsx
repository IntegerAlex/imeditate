"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import {
  Play,
  Pause,
  Settings,
  Volume2,
  Timer,
  X,
  Sparkles,
  Moon,
  Sun,
  Wind,
  Waves,
  Mountain,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"

// Enhanced Constants
const DEFAULT_TIMER_MINUTES = 10
const DEFAULT_TIME_LEFT = DEFAULT_TIMER_MINUTES * 60
const TIMER_PRESETS = [
  { minutes: 3, label: "Quick", icon: Zap },
  { minutes: 5, label: "Focus", icon: Sun },
  { minutes: 10, label: "Balance", icon: Mountain },
  { minutes: 15, label: "Deep", icon: Moon },
  { minutes: 20, label: "Zen", icon: Waves },
  { minutes: 30, label: "Journey", icon: Sparkles },
]

// Enhanced Types
interface AudioTrack {
  id: string
  name: string
  url: string
  volume: number
  icon: React.ComponentType<any>
  description: string
  color: string
}

interface BackgroundTheme {
  id: string
  name: string
  className: string
  preview: string
  mood: string
}

interface Particle {
  id: string
  x: number
  y: number
  size: number
  speed: number
  opacity: number
  color: string
}

// Enhanced Data
const audioTracks: AudioTrack[] = [
  {
    id: "rain",
    name: "Gentle Rain",
    url: "/sounds/gentle-rain.mp3",
    volume: 0.5,
    icon: Waves,
    description: "Soft rainfall for deep relaxation",
    color: "#4FC3F7",
  },
  {
    id: "forest",
    name: "Forest Birds",
    url: "/sounds/forest-birds.mp3",
    volume: 0.4,
    icon: Wind, // Changed from Mountain to Wind for variety
    description: "Natural forest ambience",
    color: "#66BB6A",
  },
  {
    id: "wind",
    name: "Gentle Wind",
    url: "/sounds/wind-chimes.mp3",
    volume: 0.3,
    icon: Wind,
    description: "Soothing wind chimes",
    color: "#AB47BC",
  },
  {
    id: "bowls",
    name: "Singing Bowls",
    url: "/sounds/tibetan-bowl.mp3",
    volume: 0.4,
    icon: Sparkles,
    description: "Tibetan healing frequencies",
    color: "#FFB74D",
  },
]

const backgroundThemes: BackgroundTheme[] = [
  {
    id: "aurora",
    name: "Aurora",
    className: "bg-aurora",
    preview: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    mood: "Mystical",
  },
  {
    id: "forest",
    name: "Forest",
    className: "bg-forest-enhanced",
    preview: "linear-gradient(135deg, #134e5e 0%, #71b280 100%)",
    mood: "Grounding",
  },
  {
    id: "sunset",
    name: "Sunset",
    className: "bg-sunset-enhanced",
    preview: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    mood: "Warm",
  },
  {
    id: "cosmos",
    name: "Cosmos",
    className: "bg-cosmos",
    preview: "linear-gradient(135deg, #2c3e50 0%, #4a00e0 100%)",
    mood: "Infinite",
  },
  {
    id: "ocean",
    name: "Ocean",
    className: "bg-ocean-enhanced",
    preview: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", // Example, can be unique
    mood: "Flowing",
  },
  {
    id: "minimal",
    name: "Minimal",
    className: "bg-minimal-enhanced",
    preview: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
    mood: "Pure",
  },
]

export default function MeditationApp() {
  // Enhanced State Management
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTheme, setCurrentTheme] = useState("aurora")
  const [tracks, setTracks] = useState(audioTracks)
  const [timerMinutes, setTimerMinutes] = useState(DEFAULT_TIMER_MINUTES)
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIME_LEFT)
  const [isTimerActive, setIsTimerActive] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [masterVolume, setMasterVolume] = useState(70) // Not used in UI, but kept for logic
  const [breathingPhase, setBreathingPhase] = useState<
    "inhale" | "hold" | "exhale"
  >("inhale")
  const [showBreathingGuide, setShowBreathingGuide] = useState(false)
  const [particles, setParticles] = useState<Particle[]>([])
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Enhanced Refs
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map())
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const breathingRef = useRef<NodeJS.Timeout | null>(null)
  const particleAnimationRef = useRef<number>(0)

  // Enhanced Memoized Functions
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`
  }, [])

  const updateTrackVolume = useCallback((trackId: string, volume: number) => {
    setTracks(prev =>
      prev.map(track =>
        track.id === trackId ? { ...track, volume: volume / 100 } : track,
      ),
    )
  }, [])

  // Enhanced Particle System
  const generateParticles = useCallback(() => {
    if (typeof window === "undefined") return // Guard against SSR
    const newParticles: Particle[] = Array.from({ length: 20 }, (_, i) => ({
      id: `particle-${Date.now()}-${i}`, // More unique key
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 3 + 1, // Slightly smaller particles
      speed: Math.random() * 0.3 + 0.1, // Slower speed
      opacity: Math.random() * 0.5 + 0.1, // More subtle
      color: `hsla(${Math.random() * 60 + 180}, 70%, 80%, ${
        Math.random() * 0.5 + 0.3
      })`, // Use hsla for opacity control
    }))
    setParticles(newParticles)
  }, [])

  const animateParticles = useCallback(() => {
    setParticles(prevParticles =>
      prevParticles
        .map(particle => {
          let newY = particle.y - particle.speed
          let newX = particle.x + Math.sin(newY * 0.01 + particle.id.length) * 0.3 // Add some variation
          let newOpacity = particle.opacity * 0.998 // Slower fade

          if (newY < -particle.size) {
            // Reset particle from bottom
            newY = window.innerHeight + particle.size
            newX = Math.random() * window.innerWidth
            newOpacity = Math.random() * 0.5 + 0.1
          }

          return {
            ...particle,
            y: newY,
            x: newX,
            opacity: newOpacity,
          }
        })
        .filter(p => p.opacity > 0.01),
    ) // Filter out very transparent particles

    particleAnimationRef.current = requestAnimationFrame(animateParticles)
  }, [])

  // Enhanced Breathing Guide
  const startBreathingCycle = useCallback(() => {
    const cycle = () => {
      setBreathingPhase("inhale")
      setTimeout(() => setBreathingPhase("hold"), 4000) // 4s inhale
      setTimeout(() => setBreathingPhase("exhale"), 7000) // 3s hold
      // 4s exhale, then immediate restart
    }

    cycle() // Start immediately
    breathingRef.current = setInterval(cycle, 11000) // Total cycle 4+3+4 = 11s
  }, [])

  // Enhanced Effects
  useEffect(() => {
    generateParticles()
    // No need to call animateParticles here, it will be called by isPlaying effect
    return () => {
      if (particleAnimationRef.current) {
        cancelAnimationFrame(particleAnimationRef.current)
      }
    }
  }, [generateParticles]) // generateParticles is stable

  useEffect(() => {
    if (isPlaying) {
      animateParticles()
    } else {
      if (particleAnimationRef.current) {
        cancelAnimationFrame(particleAnimationRef.current)
      }
    }
    return () => {
      if (particleAnimationRef.current) {
        cancelAnimationFrame(particleAnimationRef.current)
      }
    }
  }, [isPlaying, animateParticles])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  useEffect(() => {
    if (isPlaying && showBreathingGuide) {
      startBreathingCycle()
    } else if (breathingRef.current) {
      clearInterval(breathingRef.current)
      setBreathingPhase("inhale") // Reset phase when stopped
    }

    return () => {
      if (breathingRef.current) clearInterval(breathingRef.current)
    }
  }, [isPlaying, showBreathingGuide, startBreathingCycle])

  // Enhanced Audio Management
  useEffect(() => {
    const audioMap = new Map<string, HTMLAudioElement>()

    tracks.forEach(track => {
      const audio = new Audio(track.url)
      audio.loop = true
      audio.preload = "auto"
      // Initial volume set when playing
      audioMap.set(track.id, audio)
    })

    audioElementsRef.current = audioMap

    return () => {
      audioMap.forEach(audio => {
        audio.pause()
        audio.src = "" // Release resource
      })
      audioElementsRef.current.clear()
    }
  }, [tracks]) // Only re-initialize if tracks array itself changes

  useEffect(() => {
    audioElementsRef.current.forEach((audio, trackId) => {
      const track = tracks.find(t => t.id === trackId)
      if (!track) return

      const targetVolume = isPlaying ? track.volume : 0 // Master volume removed for simplicity here
      // Smooth volume transition (optional, can be complex)
      audio.volume = targetVolume

      if (isPlaying && targetVolume > 0 && audio.paused) {
        audio.play().catch(e => console.error(`Error playing ${trackId}:`, e))
      } else if ((!isPlaying || targetVolume === 0) && !audio.paused) {
        audio.pause()
      }
    })
  }, [isPlaying, tracks]) // Removed masterVolume from deps for now

  // Enhanced Timer Logic
  useEffect(() => {
    if (!isTimerActive || timeLeft <= 0) {
      if (timeLeft === 0 && isTimerActive) {
        setIsTimerActive(false)
        setIsPlaying(false) // Also stop playing
        showCompletionNotification()
      }
      if (timerRef.current) clearTimeout(timerRef.current) // Clear any existing timer
      return
    }

    timerRef.current = setTimeout(() => setTimeLeft(prevTime => prevTime - 1), 1000)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isTimerActive, timeLeft]) // timeLeft is a dependency

  // Enhanced Progress Calculation
  const { circumference, offset } = useMemo(() => {
    const radius = 45
    const circumferenceValue = 2 * Math.PI * radius
    const progress =
      timerMinutes > 0 ? Math.max(0, timeLeft / (timerMinutes * 60)) : 0
    const offsetValue = circumferenceValue - progress * circumferenceValue
    return { circumference: circumferenceValue, offset: offsetValue }
  }, [timeLeft, timerMinutes])

  // Enhanced Helper Functions
  const showCompletionNotification = () => {
    if (typeof window === "undefined" || typeof Notification === "undefined") return

    if ("vibrate" in navigator) {
      navigator.vibrate([200, 100, 200])
    }

    if (Notification.permission === "granted") {
      new Notification("🧘 Session Complete", {
        body: "Take a moment to appreciate your practice.",
        icon: "/favicon.ico", // Replace with your app icon
        silent: false,
      })
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification("🧘 Session Complete", {
            body: "Take a moment to appreciate your practice.",
            icon: "/favicon.ico",
            silent: false,
          })
        }
      })
    }
  }

  const togglePlayPause = () => {
    const newIsPlaying = !isPlaying
    setIsPlaying(newIsPlaying)
    if (timeLeft > 0) {
      setIsTimerActive(newIsPlaying) // Only activate timer if there's time left
    } else if (!newIsPlaying && isTimerActive) {
      setIsTimerActive(false) // Deactivate timer if paused and was active
    }


    if ("vibrate" in navigator) {
      navigator.vibrate(50)
    }
  }

  const setTimer = (minutes: number) => {
    setTimerMinutes(minutes)
    const newTimeLeft = minutes * 60
    setTimeLeft(newTimeLeft)
    
    // Start playing and activate timer only if not already playing or if time was 0
    if (!isPlaying || timeLeft === 0) {
      setIsPlaying(true)
    }
    setIsTimerActive(true)


    if ("vibrate" in navigator) {
      navigator.vibrate([50, 50, 50])
    }
  }

  const getBreathingInstruction = () => {
    switch (breathingPhase) {
      case "inhale":
        return "Breathe In"
      case "hold":
        return "Hold"
      case "exhale":
        return "Breathe Out"
      default:
        return "Breathe"
    }
  }

  return (
    <div
      className={`meditation-container ${
        backgroundThemes.find(t => t.id === currentTheme)?.className ||
        "bg-aurora"
      }`}
    >
      {/* Enhanced Particle System */}
      <div className="particle-system">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="enhanced-particle"
            style={{
              left: `${particle.x}px`,
              top: `${particle.y}px`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              opacity: particle.opacity,
            }}
          />
        ))}
      </div>

      {/* Enhanced Mouse Follower */}
      <div
        className="mouse-follower"
        style={{
          left: `${mousePosition.x}px`,
          top: `${mousePosition.y}px`,
        }}
      />

      {/* Enhanced Breathing Circle */}
      <div
        className={`enhanced-breathing-circle ${breathingPhase}`}
        style={{
          transform: `translate(-50%, -50%) scale(${
            breathingPhase === "inhale"
              ? 1.1
              : breathingPhase === "hold"
              ? 1.05
              : 0.95
          })`,
          opacity: showBreathingGuide && isPlaying ? (breathingPhase === "hold" ? 0.2 : 0.25) : 0.1,
        }}
      />

      {/* Enhanced Main Content - Centering controlled by main-content flexbox */}
      <div className="main-content">
        {/* Enhanced Header - Absolute positioned, not in flex flow */}
        <header className="app-header">
          <div className="header-controls">
            <Button
              onClick={() => setShowBreathingGuide(!showBreathingGuide)}
              variant="ghost"
              size="icon"
              className={`breathing-toggle ${
                showBreathingGuide ? "active" : ""
              }`}
              aria-label={showBreathingGuide ? "Hide breathing guide" : "Show breathing guide"}
            >
              <Wind className="w-5 h-5" />
            </Button>

            <Button
              onClick={() => setShowSettings(true)}
              variant="ghost"
              size="icon"
              className="settings-button"
              aria-label="Open settings"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* Enhanced App Title - Centered by main-content */}
        <div className="title-section">
          <h1 className="app-title">
            <span className="title-main">i</span>
            <span className="title-accent">Meditate</span>
          </h1>
          <p className="app-subtitle">Relax and reset</p>
        </div>

        {/* Enhanced Timer Section */}
        <div className="timer-section">
          <div className="timer-circle-container">
            {/* SVG now only for the circles */}
            <svg className="timer-svg" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="timerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="50%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#2563eb" />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="45" className="timer-bg" />
              <circle
                cx="50"
                cy="50"
                r="45"
                className="timer-progress"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                stroke="url(#timerGradient)"
              />
            </svg>

            {/* Play Button remains inside the container */}
            <Button
              onClick={togglePlayPause}
              className="enhanced-play-button"
              aria-label={isPlaying ? "Pause meditation" : "Start meditation"}
            >
              <div className="button-content">
                {isPlaying ? (
                  <Pause className="w-7 h-7" />
                ) : (
                  <Play className="w-7 h-7 ml-1" />
                )}
              </div>
              {!isPlaying && <div className="button-ripple" />}
            </Button>
          </div>

          {/* Timer Display - Moved outside timer-circle-container */}
          <div className="timer-display">
            <div className="time-text">{formatTime(timeLeft)}</div>
            {showBreathingGuide && isPlaying && (
              <div className="breathing-instruction">
                {getBreathingInstruction()}
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Timer Presets - Centered by main-content */}
        <div className="timer-presets">
          {TIMER_PRESETS.map(preset => {
            const IconComponent = preset.icon
            return (
              <Button
                key={preset.minutes}
                onClick={() => setTimer(preset.minutes)}
                className={`preset-button ${
                  timerMinutes === preset.minutes && isTimerActive ? "active" : ""
                }`}
                aria-label={`Set timer for ${preset.minutes} minutes (${preset.label})`}
                aria-pressed={timerMinutes === preset.minutes && isTimerActive}
              >
                <IconComponent className="lucide" />
                <span className="preset-time">{preset.minutes}m</span>
                <span className="preset-label">{preset.label}</span>
              </Button>
            )
          })}
        </div>

        {/* Enhanced Status - Centered by main-content */}
        {isPlaying && timeLeft > 0 && (
          <div className="status-section">
            <div className="status-indicator">
              <div className="pulse-dot" />
              <span>Session in progress</span>
            </div>
          </div>
        )}
         {timeLeft === 0 && isTimerActive === false && timerMinutes > 0 && (
          <div className="status-section">
            <div className="status-indicator" style={{color: "#66BB6A"}}>
              <Sparkles className="w-4 h-4 mr-1" />
              <span>Session Complete!</span>
            </div>
          </div>
        )}
         {/* Placeholder for vertical space when status is hidden */}
         {!((isPlaying && timeLeft > 0) || (timeLeft === 0 && isTimerActive === false && timerMinutes > 0)) && (
           <div className="status-section-placeholder"></div>
         )}
      </div>

      {/* Enhanced Settings Panel - Fixed positioned, not in flex flow */}
      {showSettings && (
        <div
          className="settings-overlay"
          onClick={() => setShowSettings(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="settings-title"
        >
          <Card
            className="settings-panel"
            onClick={e => e.stopPropagation()}
          >
            <div className="settings-header">
              <h2 id="settings-title" className="settings-title">Customize Experience</h2>
              <Button
                onClick={() => setShowSettings(false)}
                variant="ghost"
                size="icon"
                className="close-button"
                aria-label="Close settings"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <CardContent className="settings-content">
              <div className="settings-grid">
                {/* Enhanced Audio Controls */}
                <div className="settings-section">
                  <div className="section-header">
                    <Volume2 className="lucide" />
                    <h3>Soundscape</h3>
                  </div>
                  <div className="audio-controls">
                    {tracks.map(track => {
                      const IconComponent = track.icon
                      return (
                        <div key={track.id} className="audio-track">
                          <div className="track-header">
                            <div className="track-info">
                              <IconComponent
                                className="lucide"
                                style={{ color: track.color }}
                              />
                              <div>
                                <div className="track-name">{track.name}</div>
                                <div className="track-description">
                                  {track.description}
                                </div>
                              </div>
                            </div>
                            <div className="track-volume">
                              {Math.round(track.volume * 100)}%
                            </div>
                          </div>
                          <Slider
                            value={[track.volume * 100]}
                            onValueChange={value =>
                              updateTrackVolume(track.id, value[0])
                            }
                            max={100}
                            step={1}
                            className="enhanced-slider"
                            style={
                              {
                                "--slider-color": track.color,
                              } as React.CSSProperties
                            }
                            aria-label={`${track.name} volume`}
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Enhanced Theme Selection */}
                <div className="settings-section">
                  <div className="section-header">
                    <Sparkles className="lucide" />
                    <h3>Ambiance</h3>
                  </div>
                  <div className="theme-grid">
                    {backgroundThemes.map(theme => (
                      <button
                        key={theme.id}
                        onClick={() => setCurrentTheme(theme.id)}
                        className={`theme-card ${
                          currentTheme === theme.id ? "active" : ""
                        }`}
                        aria-label={`Select ${theme.name} theme (${theme.mood})`}
                        aria-pressed={currentTheme === theme.id}
                      >
                        <div
                          className="theme-preview"
                          style={{ background: theme.preview }}
                        />
                        <div className="theme-info">
                          <div className="theme-name">{theme.name}</div>
                          <div className="theme-mood">{theme.mood}</div>
                        </div>
                        {currentTheme === theme.id && (
                          <div className="theme-check">
                            <Sparkles className="lucide" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
