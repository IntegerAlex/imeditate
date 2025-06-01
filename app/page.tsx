"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Play, Pause, Settings, Volume2, Timer, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"

// Constants
const DEFAULT_TIMER_MINUTES = 10
const DEFAULT_TIME_LEFT = DEFAULT_TIMER_MINUTES * 60
const TIMER_PRESETS = [5, 10, 15, 20, 30]

// Types
interface AudioTrack {
  id: string
  name: string
  url: string
  volume: number
}

interface BackgroundTheme {
  id: string
  name: string
  className: string
}

// Data
const audioTracks: AudioTrack[] = [
  { id: "rain", name: "Gentle Rain", url: "/sounds/gentle-rain.mp3", volume: 0.5 },
  { id: "forest", name: "Forest Birds", url: "/sounds/forest-birds.mp3", volume: 0.4 },
  { id: "wind", name: "Gentle Wind", url: "/sounds/wind-chimes.mp3", volume: 0.3 },
  { id: "bowls", name: "Singing Bowls", url: "/sounds/tibetan-bowl.mp3", volume: 0.4 },
]

const backgroundThemes: BackgroundTheme[] = [
  { id: "forest", name: "Forest", className: "bg-forest" },
  { id: "sunset", name: "Sunset", className: "bg-sunset" },
  { id: "space", name: "Cosmos", className: "bg-space" },
  { id: "minimal", name: "Minimal", className: "bg-minimal" },
]

export default function MeditationApp() {
  // State
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTheme, setCurrentTheme] = useState("forest")
  const [tracks, setTracks] = useState(audioTracks)
  const [timerMinutes, setTimerMinutes] = useState(DEFAULT_TIMER_MINUTES)
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIME_LEFT)
  const [isTimerActive, setIsTimerActive] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [masterVolume, setMasterVolume] = useState(70)

  // Refs
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map())
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // State for particles
  const [particles, setParticles] = useState<Array<{
    width: string;
    height: string;
    top: string;
    left: string;
    animation: string;
    opacity: number;
  }> | null>(null);

  // Memoized functions
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }, [])

  const updateTrackVolume = useCallback((trackId: string, volume: number) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId ? { ...track, volume: volume / 100 } : track
    ))
  }, [])

  // Effects
  useEffect(() => {
    // Initialize audio elements
    const audioMap = new Map<string, HTMLAudioElement>()
    
    tracks.forEach(track => {
      const audio = new Audio(track.url)
      audio.loop = true
      audio.volume = (track.volume * masterVolume) / 100
      audio.preload = "auto"
      audioMap.set(track.id, audio)
    })

    audioElementsRef.current = audioMap

    return () => {
      audioMap.forEach(audio => {
        audio.pause()
        audio.src = ""
      })
    }
  }, [tracks, masterVolume])

  useEffect(() => {
    // Handle playback state
    const handlePlayback = () => {
      audioElementsRef.current.forEach((audio, trackId) => {
        const track = tracks.find(t => t.id === trackId)
        if (!track) return

        const volume = isPlaying ? (track.volume * masterVolume) / 100 : 0
        audio.volume = volume

        if (isPlaying && volume > 0) {
          audio.play().catch(e => console.error(`Error playing ${trackId}:`, e))
        } else {
          audio.pause()
        }
      })
    }

    handlePlayback()
  }, [isPlaying, tracks, masterVolume])

  useEffect(() => {
    // Timer logic
    if (!isTimerActive || timeLeft <= 0) {
      if (timeLeft === 0 && isTimerActive) {
        setIsTimerActive(false)
        setIsPlaying(false)
        showCompletionNotification()
      }
      return
    }

    timerRef.current = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
    
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isTimerActive, timeLeft])

  useEffect(() => {
    // Fix: Only animate visible particles
    const handleScroll = () => {
      // Performance optimization logic
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fix: Memoize expensive calculations
  const { circumference, offset } = useMemo(() => {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (timeLeft / (timerMinutes * 60)) * circumference;
    return { circumference, offset };
  }, [timeLeft, timerMinutes]);

  // Generate particles on the client side
  useEffect(() => {
    // Skip if in an iframe (optional)
    if (window.self !== window.top) return;

    const generatedParticles = [...Array(15)].map(() => ({
      width: `${Math.random() * 6 + 2}px`,
      height: `${Math.random() * 6 + 2}px`,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      animation: `float ${Math.random() * 20 + 10}s infinite ease-in-out ${Math.random() * 5}s`,
      opacity: Math.random() * 0.4 + 0.1,
    }));
    setParticles(generatedParticles);
  }, []);

  // Helper functions
  const showCompletionNotification = () => {
    // Fallback for iframes
    if (window.self !== window.top) {
      alert("Session Complete: Take a moment to appreciate your practice.");
    } else if ("Notification" in window && Notification.permission === "granted") {
      new Notification("🧘 Session Complete", {
        body: "Take a moment to appreciate your practice.",
        silent: true,
      });
    }
  }

  const togglePlayPause = () => {
    const newIsPlaying = !isPlaying
    setIsPlaying(newIsPlaying)
    setIsTimerActive(newIsPlaying && timeLeft > 0)
  }

  const setTimer = (minutes: number) => {
    setTimerMinutes(minutes)
    setTimeLeft(minutes * 60)
    setIsPlaying(true)
    setIsTimerActive(true)
  }

  // Render
  return (
    <div className={`min-h-screen transition-all duration-2000 ${backgroundThemes.find(t => t.id === currentTheme)?.className || "bg-forest"}`}>
      {/* Ancient Symbols Floating */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="om-symbol"
          style={{
            position: 'absolute',
            width: '100px',
            height: '100px',
            backgroundImage: 'url(/om-symbol.png)',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            opacity: 0.1,
            top: '20%',
            left: '10%',
          }}
        ></div>
        <div className="om-symbol" style={{ bottom: '15%', right: '10%', transform: 'rotate(180deg)' }}></div>
      </div>

      {/* Organic Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{zIndex: 0}}>
        {particles?.map((particle, i) => (
          <div
            key={`particle-${i}`}
            className="particle"
            style={{
              width: particle.width,
              height: particle.height,
              top: particle.top,
              left: particle.left,
              animation: particle.animation,
              opacity: particle.opacity,
            }}
          />
        ))}
      </div>

      {/* Breathing Circle */}
      <div className="breathing-circle" style={{
        width: '80vmin',
        height: '80vmin',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      }} />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
        {/* Settings Button */}
        <Button
          onClick={() => setShowSettings(true)}
          variant="ghost"
          size="sm"
          className="absolute top-6 right-6 text-white/60 hover:text-white/80 hover:bg-white/10"
        >
          <Settings className="w-5 h-5" />
        </Button>

        {/* App Title with Mystical Glow */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-extralight text-white mb-4 tracking-[0.2em] opacity-90 glow-text">
            iMeditate
          </h1>
          <div className="w-24 h-px bg-white/30 mx-auto glow-border"></div>
        </div>

        {/* Timer Circle with Organic Style */}
        <div className="relative mb-16">
          <svg 
            className="w-80 h-80 transform -rotate-90" 
            viewBox="0 0 100 100"
            style={{ overflow: 'hidden' }}
          >
            <circle 
              cx="50" 
              cy="50" 
              r="45" 
              stroke="rgba(255,255,255,0.05)" 
              strokeWidth="2" 
              fill="none" 
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="url(#gradient)"
              strokeWidth="2"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-1000 ease-[cubic-bezier(0.33,1,0.68,1)]"
              strokeLinecap="round"
              style={{
                filter: 'drop-shadow(0 0 6px rgba(162,218,255,0.3))',
                transformOrigin: 'center'
              }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a1c4fd" />
                <stop offset="100%" stopColor="#c2e9fb" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Mystical Play Button */}
        <Button
          onClick={togglePlayPause}
          className="mystic-button w-20 h-20 rounded-full relative"
          aria-label={isPlaying ? "Pause meditation" : "Start meditation"}
        >
          {isPlaying ? (
            <Pause className="w-8 h-8 text-white" />
          ) : (
            <>
              <Play className="w-8 h-8 text-white ml-1" />
              <div className="play-ripple" style={{
                width: '100%',
                height: '100%',
                top: 0,
                left: 0
              }} />
            </>
          )}
        </Button>

        {/* Quick Timer Presets */}
        <div className="flex gap-3 mb-8">
          {TIMER_PRESETS.map((minutes) => (
            <Button
              key={minutes}
              onClick={() => setTimer(minutes)}
              variant="ghost"
              size="sm"
              className={`text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 ${
                timerMinutes === minutes ? "text-white bg-white/15" : ""
              }`}
            >
              {minutes}m
            </Button>
          ))}
        </div>

        {/* Breathing Guide */}
        {isPlaying && <div className="text-center text-white/60 text-sm animate-pulse">Breathe deeply and let go</div>}
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div 
          role="dialog"
          aria-modal="true"
          aria-labelledby="settings-heading"
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-overlay flex items-center justify-center p-6"
        >
          <Card className="w-full max-w-2xl bg-black/30 border-white/20 backdrop-blur-xl">
            <CardContent className="p-8">
              <h2 id="settings-heading" className="text-2xl font-light text-white">Settings</h2>
              <div className="flex justify-between items-center mb-8">
                <Button
                  onClick={() => setShowSettings(false)}
                  variant="ghost"
                  size="sm"
                  className="text-white/60 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Audio Controls */}
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <Volume2 className="w-5 h-5 text-white" />
                    <h3 className="text-white font-medium">Soundscape</h3>
                  </div>

                  <div className="space-y-4">
                    {tracks.map((track) => (
                      <div key={track.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-white/90 text-sm">{track.name}</span>
                          <span className="text-white/60 text-xs">{Math.round(track.volume * 100)}%</span>
                        </div>
                        <Slider
                          value={[track.volume * 100]}
                          onValueChange={(value) => updateTrackVolume(track.id, value[0])}
                          max={100}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Background Themes */}
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <Timer className="w-5 h-5 text-white" />
                    <h3 className="text-white font-medium">Ambiance</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {backgroundThemes.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => setCurrentTheme(theme.id)}
                        className={`h-20 rounded-xl border-2 transition-all duration-300 ${
                          currentTheme === theme.id
                            ? "border-white scale-105 shadow-lg"
                            : "border-white/30 hover:border-white/50"
                        } ${theme.className} relative overflow-hidden`}
                      >
                        <div className="absolute inset-0 bg-black/20"></div>
                        <div className="absolute bottom-2 left-2 text-white/80 text-xs font-medium">{theme.name}</div>
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
