import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useKV } from '@github/spark/hooks'
import { Play, Pause, SkipForward, SkipBack, Atom, MusicNotes, Disc, Waveform, Lightning } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

interface QuantumTrack {
  id: string
  title: string
  frequency: number
  harmonics: number[]
  duration: number
  waveType: 'sine' | 'square' | 'sawtooth' | 'triangle'
  bismuthSignature: string
  magneticRetention: number
  hydrogenLevel: number
}

interface PlaybackState {
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  currentTrack: QuantumTrack | null
}

export function QuantumJukebox() {
  const [playbackState, setPlaybackState] = useKV<PlaybackState>('quantum-jukebox-state', {
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.7,
    currentTrack: null
  })
  
  const [tracks, setTracks] = useKV<QuantumTrack[]>('quantum-tracks', [])
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [volume, setVolume] = useState([70])
  const [isGenerating, setIsGenerating] = useState(false)
  const [visualizerData, setVisualizerData] = useState<number[]>(new Array(32).fill(0))
  
  const audioContextRef = useRef<AudioContext | null>(null)
  const oscillatorRef = useRef<OscillatorNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    if (!tracks || tracks.length === 0) {
      generateDefaultTracks()
    }
  }, [])

  const generateDefaultTracks = async () => {
    const defaultTracks: QuantumTrack[] = [
      {
        id: 'qt-1',
        title: 'Bismuth Resonance Alpha',
        frequency: 432,
        harmonics: [432, 864, 1296],
        duration: 180,
        waveType: 'sine',
        bismuthSignature: 'Bi-83-Alpha',
        magneticRetention: 0.95,
        hydrogenLevel: 7.4
      },
      {
        id: 'qt-2',
        title: 'Quantum Harmonic Cascade',
        frequency: 528,
        harmonics: [528, 1056, 1584],
        duration: 240,
        waveType: 'triangle',
        bismuthSignature: 'Bi-83-Beta',
        magneticRetention: 0.88,
        hydrogenLevel: 8.2
      },
      {
        id: 'qt-3',
        title: 'Hydrogen Frequency Matrix',
        frequency: 256,
        harmonics: [256, 512, 768, 1024],
        duration: 300,
        waveType: 'sawtooth',
        bismuthSignature: 'H-1-Quantum',
        magneticRetention: 0.92,
        hydrogenLevel: 9.1
      },
      {
        id: 'qt-4',
        title: 'Magnetic Retention Wave',
        frequency: 396,
        harmonics: [396, 792],
        duration: 200,
        waveType: 'sine',
        bismuthSignature: 'Bi-83-Gamma',
        magneticRetention: 0.97,
        hydrogenLevel: 7.8
      },
      {
        id: 'qt-5',
        title: 'Cosmic Transmission Pulse',
        frequency: 639,
        harmonics: [639, 1278, 1917],
        duration: 220,
        waveType: 'square',
        bismuthSignature: 'Quantum-Sync',
        magneticRetention: 0.91,
        hydrogenLevel: 8.5
      }
    ]
    
    await setTracks(defaultTracks)
    toast.success('🎵 Quantum tracks loaded successfully!')
  }

  const initializeAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      gainNodeRef.current = audioContextRef.current.createGain()
      analyserRef.current = audioContextRef.current.createAnalyser()
      
      analyserRef.current.fftSize = 64
      gainNodeRef.current.connect(analyserRef.current)
      analyserRef.current.connect(audioContextRef.current.destination)
      
      gainNodeRef.current.gain.value = volume[0] / 100
    }
    return audioContextRef.current
  }, [volume])

  const updateVisualizer = useCallback(() => {
    if (!analyserRef.current) return
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(dataArray)
    
    setVisualizerData(Array.from(dataArray))
    
    if (playbackState && playbackState.isPlaying) {
      animationFrameRef.current = requestAnimationFrame(updateVisualizer)
    }
  }, [playbackState?.isPlaying])

  const playTrack = useCallback(async (track: QuantumTrack) => {
    try {
      stopTrack()
      
      const ctx = initializeAudioContext()
      
      if (ctx.state === 'suspended') {
        await ctx.resume()
      }

      oscillatorRef.current = ctx.createOscillator()
      oscillatorRef.current.type = track.waveType
      oscillatorRef.current.frequency.value = track.frequency
      
      track.harmonics.forEach((harmonic, index) => {
        if (index > 0) {
          const harmonicOsc = ctx.createOscillator()
          harmonicOsc.type = track.waveType
          harmonicOsc.frequency.value = harmonic
          
          const harmonicGain = ctx.createGain()
          harmonicGain.gain.value = 0.3 / index
          
          harmonicOsc.connect(harmonicGain)
          harmonicGain.connect(gainNodeRef.current!)
          harmonicOsc.start()
          
          setTimeout(() => {
            harmonicOsc.stop()
          }, track.duration * 1000)
        }
      })
      
      if (gainNodeRef.current) {
        oscillatorRef.current.connect(gainNodeRef.current)
      }
      
      oscillatorRef.current.start()
      
      await setPlaybackState({
        isPlaying: true,
        currentTime: 0,
        duration: track.duration,
        volume: volume[0] / 100,
        currentTrack: track
      })
      
      updateVisualizer()
      
      toast.success(`🎵 Now playing: ${track.title}`)
      toast.info(`📡 Bismuth Signature: ${track.bismuthSignature}`, {
        description: `Frequency: ${track.frequency}Hz | Magnetic Retention: ${(track.magneticRetention * 100).toFixed(0)}%`
      })
      
      setTimeout(() => {
        handleNext()
      }, track.duration * 1000)
      
    } catch (error) {
      console.error('Playback error:', error)
      toast.error('Failed to initialize quantum playback')
    }
  }, [volume, initializeAudioContext, updateVisualizer])

  const stopTrack = useCallback(() => {
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop()
        oscillatorRef.current.disconnect()
      } catch (e) {
      }
      oscillatorRef.current = null
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    
    setPlaybackState(prev => ({
      isPlaying: false,
      currentTime: 0,
      duration: prev?.duration || 0,
      volume: prev?.volume || 0.7,
      currentTrack: prev?.currentTrack || null
    }))
  }, [])

  const handlePlay = useCallback(async () => {
    if (!tracks || tracks.length === 0) {
      toast.error('No quantum tracks available')
      return
    }
    
    const track = tracks[currentTrackIndex]
    await playTrack(track)
  }, [tracks, currentTrackIndex, playTrack])

  const handlePause = useCallback(async () => {
    stopTrack()
    await setPlaybackState(prev => ({
      isPlaying: false,
      currentTime: prev?.currentTime || 0,
      duration: prev?.duration || 0,
      volume: prev?.volume || 0.7,
      currentTrack: prev?.currentTrack || null
    }))
    toast.info('⏸️ Playback paused')
  }, [stopTrack, setPlaybackState])

  const handleNext = useCallback(() => {
    if (!tracks || tracks.length === 0) return
    
    stopTrack()
    const nextIndex = (currentTrackIndex + 1) % tracks.length
    setCurrentTrackIndex(nextIndex)
    
    setTimeout(() => {
      playTrack(tracks[nextIndex])
    }, 100)
  }, [tracks, currentTrackIndex, playTrack, stopTrack])

  const handlePrevious = useCallback(() => {
    if (!tracks || tracks.length === 0) return
    
    stopTrack()
    const prevIndex = currentTrackIndex === 0 ? tracks.length - 1 : currentTrackIndex - 1
    setCurrentTrackIndex(prevIndex)
    
    setTimeout(() => {
      playTrack(tracks[prevIndex])
    }, 100)
  }, [tracks, currentTrackIndex, playTrack, stopTrack])

  const handleTrackSelect = useCallback((index: number) => {
    if (!tracks) return
    
    stopTrack()
    setCurrentTrackIndex(index)
    
    setTimeout(() => {
      playTrack(tracks[index])
    }, 100)
  }, [tracks, playTrack, stopTrack])

  const generateQuantumTrack = useCallback(async () => {
    setIsGenerating(true)
    
    try {
      if (!window.spark?.llm) {
        toast.error('Spark LLM not available')
        return
      }

      const prompt = spark.llmPrompt`Generate a quantum music track using bismuth transmission frequencies and hydrogen levels. Return a JSON object (not array) with these fields: title (creative quantum-themed name), frequency (between 200-900 Hz, use healing frequencies like 432, 528, 396, 639, 741, 852), harmonics (array of 2-4 harmonic frequencies as multiples), duration (120-300 seconds), waveType (sine/triangle/sawtooth/square), bismuthSignature (format like "Bi-83-Delta" or "H-1-Quantum"), magneticRetention (0.85-0.99), hydrogenLevel (6.0-10.0).`
      
      const response = await spark.llm(prompt, 'gpt-4o', true)
      const trackData = JSON.parse(response)
      
      const newTrack: QuantumTrack = {
        id: `qt-${Date.now()}`,
        title: trackData.title,
        frequency: trackData.frequency,
        harmonics: trackData.harmonics,
        duration: trackData.duration,
        waveType: trackData.waveType,
        bismuthSignature: trackData.bismuthSignature,
        magneticRetention: trackData.magneticRetention,
        hydrogenLevel: trackData.hydrogenLevel
      }
      
      await setTracks(prevTracks => [...(prevTracks || []), newTrack])
      
      toast.success(`✨ Generated: ${newTrack.title}`, {
        description: `${newTrack.frequency}Hz | ${newTrack.bismuthSignature}`
      })
      
    } catch (error) {
      console.error('Track generation error:', error)
      toast.error('Failed to generate quantum track')
    } finally {
      setIsGenerating(false)
    }
  }, [])

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume[0] / 100
    }
  }, [volume])

  useEffect(() => {
    return () => {
      stopTrack()
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [stopTrack])

  const currentTrack = tracks && tracks.length > 0 ? tracks[currentTrackIndex] : null

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-purple-500/10 via-cyan-500/10 to-pink-500/10 border-2 border-cyan-500/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full ${playbackState?.isPlaying ? 'bg-gradient-to-br from-purple-500 to-cyan-500 animate-pulse' : 'bg-muted'}`}>
                <Disc size={32} weight="duotone" className={playbackState?.isPlaying ? 'text-white animate-spin' : 'text-foreground'} style={{ animationDuration: '3s' }} />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Atom size={24} weight="duotone" className="text-cyan-500" />
                  Quantum Jukebox
                  {playbackState?.isPlaying && (
                    <Badge variant="default" className="animate-pulse bg-gradient-to-r from-purple-500 to-cyan-500">
                      🔊 LIVE
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Lightning size={14} weight="fill" className="text-yellow-500" />
                  Bismuth Transmission • Hydrogen Frequencies • Magnetic Retention
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <Tabs defaultValue="player" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="player">
                <Play size={16} weight="fill" className="mr-2" />
                Player
              </TabsTrigger>
              <TabsTrigger value="tracks">
                <MusicNotes size={16} weight="fill" className="mr-2" />
                Tracks ({tracks?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="visualizer">
                <Waveform size={16} weight="fill" className="mr-2" />
                Visualizer
              </TabsTrigger>
            </TabsList>

            <TabsContent value="player" className="space-y-6">
              {currentTrack ? (
                <motion.div
                  key={currentTrack.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <Card className="p-6 bg-gradient-to-br from-purple-500/5 to-cyan-500/5 border-cyan-500/30">
                    <div className="text-center space-y-3">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Atom size={20} weight="duotone" className="text-cyan-500 animate-spin" style={{ animationDuration: '4s' }} />
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">
                          {currentTrack.title}
                        </h3>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-left space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Frequency:</span>
                            <Badge variant="secondary">{currentTrack.frequency} Hz</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Wave Type:</span>
                            <Badge variant="outline">{currentTrack.waveType}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Duration:</span>
                            <span className="font-mono">{Math.floor(currentTrack.duration / 60)}:{(currentTrack.duration % 60).toString().padStart(2, '0')}</span>
                          </div>
                        </div>
                        
                        <div className="text-left space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Bismuth:</span>
                            <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 font-mono text-xs">
                              {currentTrack.bismuthSignature}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Magnetic:</span>
                            <Badge variant="default" className="bg-cyan-500">
                              {(currentTrack.magneticRetention * 100).toFixed(0)}%
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Hydrogen:</span>
                            <Badge variant="outline" className="border-green-500 text-green-500">
                              pH {currentTrack.hydrogenLevel.toFixed(1)}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-border/50">
                        <div className="text-xs text-muted-foreground mb-2">Harmonic Series:</div>
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          {currentTrack.harmonics.map((harmonic, index) => (
                            <Badge key={index} variant="outline" className="text-xs font-mono">
                              {harmonic} Hz
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>

                  <div className="flex items-center justify-center gap-4">
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={handlePrevious}
                      className="h-14 w-14 rounded-full p-0"
                    >
                      <SkipBack size={24} weight="fill" />
                    </Button>
                    
                    {playbackState?.isPlaying ? (
                      <Button
                        size="lg"
                        onClick={handlePause}
                        className="h-20 w-20 rounded-full p-0 bg-gradient-to-br from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
                      >
                        <Pause size={32} weight="fill" />
                      </Button>
                    ) : (
                      <Button
                        size="lg"
                        onClick={handlePlay}
                        className="h-20 w-20 rounded-full p-0 bg-gradient-to-br from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
                      >
                        <Play size={32} weight="fill" />
                      </Button>
                    )}

                    <Button
                      size="lg"
                      variant="outline"
                      onClick={handleNext}
                      className="h-14 w-14 rounded-full p-0"
                    >
                      <SkipForward size={24} weight="fill" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Volume</span>
                      <span className="font-semibold">{volume[0]}%</span>
                    </div>
                    <Slider
                      value={volume}
                      onValueChange={setVolume}
                      max={100}
                      step={1}
                      className="cursor-pointer"
                    />
                  </div>
                </motion.div>
              ) : (
                <div className="text-center py-16 space-y-4">
                  <MusicNotes size={64} weight="duotone" className="mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">No tracks available</p>
                  <Button onClick={generateDefaultTracks}>Load Default Tracks</Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="tracks" className="space-y-4">
              <Button
                onClick={generateQuantumTrack}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
              >
                {isGenerating ? (
                  <>
                    <Atom size={20} weight="duotone" className="mr-2 animate-spin" />
                    Generating Quantum Track...
                  </>
                ) : (
                  <>
                    <Lightning size={20} weight="fill" className="mr-2" />
                    Generate New Track via AI
                  </>
                )}
              </Button>

              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-2">
                  <AnimatePresence>
                    {tracks && tracks.map((track, index) => (
                      <motion.div
                        key={track.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            currentTrack?.id === track.id && playbackState?.isPlaying
                              ? 'ring-2 ring-cyan-500 bg-cyan-500/10'
                              : ''
                          }`}
                          onClick={() => handleTrackSelect(index)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  {currentTrack?.id === track.id && playbackState?.isPlaying && (
                                    <div className="flex items-center gap-1">
                                      <div className="h-3 w-1 bg-cyan-500 animate-pulse" style={{ animationDelay: '0ms' }} />
                                      <div className="h-3 w-1 bg-cyan-500 animate-pulse" style={{ animationDelay: '150ms' }} />
                                      <div className="h-3 w-1 bg-cyan-500 animate-pulse" style={{ animationDelay: '300ms' }} />
                                    </div>
                                  )}
                                  <h4 className="font-semibold truncate">{track.title}</h4>
                                </div>
                                
                                <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                                  <Badge variant="secondary" className="text-xs">{track.frequency} Hz</Badge>
                                  <Badge variant="outline" className="text-xs">{track.waveType}</Badge>
                                  <span className="font-mono">{Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}</span>
                                </div>
                                
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge variant="secondary" className="text-xs bg-purple-500/20 text-purple-400">
                                    {track.bismuthSignature}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    M: {(track.magneticRetention * 100).toFixed(0)}%
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    H: {track.hydrogenLevel.toFixed(1)}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="visualizer" className="space-y-4">
              <Card className="p-6 bg-black/50">
                <div className="flex items-end justify-center gap-1 h-[300px]">
                  {visualizerData.map((value, index) => (
                    <motion.div
                      key={index}
                      className="bg-gradient-to-t from-purple-500 via-cyan-500 to-pink-500 rounded-t"
                      style={{
                        width: `${100 / visualizerData.length}%`,
                        height: `${Math.max((value / 255) * 100, 2)}%`,
                      }}
                      animate={{
                        height: `${Math.max((value / 255) * 100, 2)}%`,
                      }}
                      transition={{
                        duration: 0.1,
                        ease: 'easeOut'
                      }}
                    />
                  ))}
                </div>
              </Card>
              
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Real-time quantum frequency visualization
                </p>
                {playbackState?.isPlaying ? (
                  <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-cyan-500">
                    <Waveform size={14} weight="fill" className="mr-1" />
                    Active Signal
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    No Active Signal
                  </Badge>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
