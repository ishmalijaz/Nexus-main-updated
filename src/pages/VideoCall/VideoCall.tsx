"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "../../components/ui/Button"
import { Card, CardBody, CardHeader } from "../../components/ui/Card"
import { Badge } from "../../components/ui/Badge"
import { Mic, MicOff, Video, VideoOff, Phone, PhoneOff, Monitor, Users, Settings } from "lucide-react"

interface Participant {
  id: string
  name: string
  isLocal: boolean
  videoEnabled: boolean
  audioEnabled: boolean
}

export default function VideoCall() {
  const [isCallActive, setIsCallActive] = useState(false)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [participants, setParticipants] = useState<Participant[]>([
    { id: "1", name: "You", isLocal: true, videoEnabled: true, audioEnabled: true },
    { id: "2", name: "John Smith", isLocal: false, videoEnabled: true, audioEnabled: true },
    { id: "3", name: "Sarah Johnson", isLocal: false, videoEnabled: false, audioEnabled: true },
  ])

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const screenShareRef = useRef<HTMLVideoElement>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)

  // Timer for call duration
  useEffect(() => {
    let interval: number
    if (isCallActive) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isCallActive])

  // Format call duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Initialize WebRTC
  const initializeWebRTC = async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled,
        audio: isAudioEnabled,
      })

      localStreamRef.current = stream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      // Create peer connection
      const peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      })

      peerConnectionRef.current = peerConnection

      // Add local stream to peer connection
      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream)
      })

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0]
        }
      }
    } catch (error) {
      console.error("Error accessing media devices:", error)
    }
  }

  // Start call
  const startCall = async () => {
    setIsCallActive(true)
    setCallDuration(0)
    await initializeWebRTC()
  }

  // End call
  const endCall = () => {
    setIsCallActive(false)
    setCallDuration(0)
    setIsScreenSharing(false)

    // Stop all tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop())
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
    }

    // Clear video elements
    if (localVideoRef.current) localVideoRef.current.srcObject = null
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null
    if (screenShareRef.current) screenShareRef.current.srcObject = null
  }

  // Toggle video
  const toggleVideo = async () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled
        setIsVideoEnabled(!isVideoEnabled)

        // Update participant state
        setParticipants((prev) => prev.map((p) => (p.isLocal ? { ...p, videoEnabled: !isVideoEnabled } : p)))
      }
    }
  }

  // Toggle audio
  const toggleAudio = async () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled
        setIsAudioEnabled(!isAudioEnabled)

        // Update participant state
        setParticipants((prev) => prev.map((p) => (p.isLocal ? { ...p, audioEnabled: !isAudioEnabled } : p)))
      }
    }
  }

  // Toggle screen share
  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        })

        if (screenShareRef.current) {
          screenShareRef.current.srcObject = screenStream
        }

        // Replace video track in peer connection
        if (peerConnectionRef.current && localStreamRef.current) {
          const videoTrack = screenStream.getVideoTracks()[0]
          const sender = peerConnectionRef.current.getSenders().find((s) => s.track && s.track.kind === "video")
          if (sender) {
            await sender.replaceTrack(videoTrack)
          }
        }

        setIsScreenSharing(true)

        // Handle screen share end
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false)
          // Switch back to camera
          if (localStreamRef.current && peerConnectionRef.current) {
            const cameraTrack = localStreamRef.current.getVideoTracks()[0]
            const sender = peerConnectionRef.current.getSenders().find((s) => s.track && s.track.kind === "video")
            if (sender && cameraTrack) {
              sender.replaceTrack(cameraTrack)
            }
          }
        }
      } else {
        // Stop screen sharing
        if (screenShareRef.current?.srcObject) {
          const stream = screenShareRef.current.srcObject as MediaStream
          stream.getTracks().forEach((track) => track.stop())
          screenShareRef.current.srcObject = null
        }
        setIsScreenSharing(false)
      }
    } catch (error) {
      console.error("Error with screen sharing:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Video Conference</h1>
          <div className="flex items-center gap-4">
            <Badge variant= "primary" className="px-3 py-1">
              {isCallActive ? "Call Active" : "Ready to Call"}
            </Badge>
            {isCallActive && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                Duration: {formatDuration(callDuration)}
              </div>
            )}
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              {participants.length} participants
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Video Area */}
          <div className="lg:col-span-3">
            <Card className="h-[600px]">
              <CardBody className="p-0 h-full relative">
                {isCallActive ? (
                  <div className="h-full bg-gray-900 rounded-lg overflow-hidden relative">
                    {/* Screen Share or Remote Video */}
                    {isScreenSharing ? (
                      <video ref={screenShareRef} autoPlay playsInline className="w-full h-full object-contain" />
                    ) : (
                      <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    )}

                    {/* Local Video (Picture-in-Picture) */}
                    <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-white shadow-lg">
                      <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                      {!isVideoEnabled && (
                        <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
                          <VideoOff className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Call Controls */}
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                      <div className="flex items-center gap-3 bg-black/50 backdrop-blur-sm rounded-full px-6 py-3">
                        <Button
                          variant= "primary"
                          size="sm"
                          onClick={toggleAudio}
                          className="rounded-full w-12 h-12 p-0"
                        >
                          {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                        </Button>

                        <Button
                          variant= "primary"
                          size="sm"
                          onClick={toggleVideo}
                          className="rounded-full w-12 h-12 p-0"
                        >
                          {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                        </Button>

                        <Button
                          variant={isScreenSharing ? "primary" : "secondary"}
                          size="sm"
                          onClick={toggleScreenShare}
                          className="rounded-full w-12 h-12 p-0"
                        >
                          <Monitor className="w-5 h-5" />
                        </Button>

                        <Button
                          variant="primary"
                          size="sm"
                          onClick={endCall}
                          className="rounded-full w-12 h-12 p-0"
                        >
                          <PhoneOff className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Video className="w-12 h-12 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to start your call</h3>
                      <p className="text-gray-600 mb-6">Click the button below to begin your video conference</p>
                      <Button onClick={startCall} size="lg" className="px-8">
                        <Phone className="w-5 h-5 mr-2" />
                        Start Call
                      </Button>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Participants Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Users className="w-5 h-5" />
                  Participants ({participants.length})
                </div>
              </CardHeader>
              <CardBody className="space-y-3">
                {participants.map((participant) => (
                  <div key={participant.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {participant.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{participant.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        {participant.videoEnabled ? (
                          <Video className="w-3 h-3 text-green-600" />
                        ) : (
                          <VideoOff className="w-3 h-3 text-gray-400" />
                        )}
                        {participant.audioEnabled ? (
                          <Mic className="w-3 h-3 text-green-600" />
                        ) : (
                          <MicOff className="w-3 h-3 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>

            {/* Call Settings */}
            <Card className="mt-4">
              <CardHeader>
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Settings className="w-5 h-5" />
                  Settings
                </div>
              </CardHeader>
              <CardBody className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Camera</span>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={toggleVideo}
                    disabled={!isCallActive}
                  >
                    {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Microphone</span>
                  <Button
                    variant= "primary"
                    size="sm"
                    onClick={toggleAudio}
                    disabled={!isCallActive}
                  >
                    {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Screen Share</span>
                  <Button
                    variant= "primary"
                    size="sm"
                    onClick={toggleScreenShare}
                    disabled={!isCallActive}
                  >
                    <Monitor className="w-4 h-4" />
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
