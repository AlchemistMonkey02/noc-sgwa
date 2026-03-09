import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/AuthContext';
import { useNotifications } from '../../../context/NotificationContext';
import { useToast } from '../../../context/ToastContext';
import { nocApplicationService } from '../services/nocApplicationService';
import './NativeConsultation.css';

// No module-level singleton — socket is now owned by NotificationContext and injected via ref

// ─── Utilities ────────────────────────────────────────────────────────────────
const initials = (name) => {
    if (!name || typeof name !== 'string') return 'U';
    return name
        .trim()
        .split(/\s+/)
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
};

const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return [
        hrs > 0 ? String(hrs).padStart(2, '0') : null,
        String(mins).padStart(2, '0'),
        String(secs).padStart(2, '0')
    ].filter(Boolean).join(':');
};

const NativeConsultation = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { user, userType, isOfficer } = useAuth();
    const { activeCall, closeCall, setCallMinimized, notifSocket, socketReady } = useNotifications();
    const roomID = activeCall?.roomID;

    // Use the shared socket from NotificationContext — avoids creating a second connection
    // which would give us a different socket ID and break signaling routing on the server.
    const socketRef2 = useRef(null); // alias for cleaner access inside callbacks

    // --- State & Refs (Must be at the top level, no conditional returns above) ---
    const [hasJoined, setHasJoined] = useState(false);
    const [streams, setStreams] = useState({}); // remote streams
    const [partnerNames, setPartnerNames] = useState({});
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [remoteVideoOff, setRemoteVideoOff] = useState({}); // partnerId -> bool
    const [remoteScreenSharing, setRemoteScreenSharing] = useState({}); // partnerId -> bool
    const [chatOpen, setChatOpen] = useState(true);
    const [callMode, setCallMode] = useState('video'); // 'video' | 'voice'
    const [mediaError, setMediaError] = useState(null);
    const [connectedPeers, setConnectedPeers] = useState([]); // Track all socket IDs in room
    const [remoteAudioOff, setRemoteAudioOff] = useState({}); // partnerId -> bool
    const [rtcConnectionState, setRtcConnectionState] = useState({}); // partnerId -> string
    const [isSpeaking, setIsSpeaking] = useState({}); // partnerId -> bool
    const { success: toastSuccess, error: toastError, info: toastInfo, warning: toastWarning } = useToast();

    // New constraints state
    const [isWaiting, setIsWaiting] = useState(false);
    const [isAlreadyOnCall, setIsAlreadyOnCall] = useState(false);
    const [isUnauthorized, setIsUnauthorized] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [callEndedByPeer, setCallEndedByPeer] = useState(false);
    const [callEndedByTimeout, setCallEndedByTimeout] = useState(false);
    const [timeLeft, setTimeLeft] = useState(45 * 60); // 45 minutes in seconds
    const chatEndRef = useRef(null);

    // Recording state
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef(null);
    const recordedChunksRef = useRef([]);
    const recordingStreamRef = useRef(null);
    const recordingEngineRef = useRef({ start: null, stop: null }); // kept fresh each render
    const localVideoRef = useRef(null);

    const myStreamRef = useRef(null);
    const screenStreamRef = useRef(null);
    const localPreviewStreamRef = useRef(null);
    const pcRef = useRef({}); // peer connections
    const pendingCandidates = useRef({}); // Queuing ICE candidates until remote description is set
    const mediaReadyPromiseRef = useRef(null); // Promise that resolves when local media is ready
    const mediaReadyResolverRef = useRef(null); // Resolver for the media promise
    const makingOfferRef = useRef({}); // Track if we are in the middle of making an offer for a specific peer
    const ignoreOfferRef = useRef({}); // Track if we should ignore a received offer (collision handling)
    const socketIdRef = useRef('');
    const endCallRef = useRef(null); // always points to the latest endCall function
    const randomNumber = useRef(Math.random().toString(36).substring(2, 6)); // Short ID for identity

    // Build display name from profile safely (will be used in effects)
    const profileFirstName = user?.firstName?.trim() || '';
    const profileLastName = user?.lastName?.trim() || '';
    const composedName = [profileFirstName, profileLastName].filter(Boolean).join(' ');
    const displayName = composedName
        || user?.fullName?.trim()
        || user?.name?.trim()
        || user?.username
        || (user?.email ? user.email.split('@')[0] : '')
        || 'User';

    // Append unique tag to display name for this session to distinguish identical roles
    const uniqueDisplayName = `${displayName} (${randomNumber.current})`;

    // --- WebRTC Configuration ---
    const getIceServer = () => ({
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            // TURN servers — allows connections across strict NAT / firewalls
            {
                urls: [
                    'turn:openrelay.metered.ca:80',
                    'turn:openrelay.metered.ca:443',
                    'turn:openrelay.metered.ca:443?transport=tcp',
                ],
                username: 'openrelayproject',
                credential: 'openrelayproject',
            },
        ]
    });

    // --- Media Setup ---
    const getUserFullMedia = async (videoEnabled = true, audioEnabled = true) => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('getUserMedia is not supported on your browser');
        }
        return await navigator.mediaDevices.getUserMedia({
            video: videoEnabled ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false,
            audio: audioEnabled
        });
    };

    const analyzeAudio = (stream, partnerId) => {
        if (!stream || stream.getAudioTracks().length === 0) return;
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            const audioContext = new AudioCtx();
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 64;
            source.connect(analyser);

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const checkVolume = () => {
                if (!pcRef.current[partnerId]) {
                    audioContext.close();
                    return;
                }
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
                const average = sum / bufferLength;

                setIsSpeaking(prev => {
                    const currentlySpeaking = average > 15; // threshold
                    if (prev[partnerId] !== currentlySpeaking) {
                        return { ...prev, [partnerId]: currentlySpeaking };
                    }
                    return prev;
                });
                setTimeout(checkVolume, 200);
            };
            checkVolume();
        } catch (e) {
            console.warn('[AudioAnalysis] Failed:', e);
        }
    };

    const initMediaAccess = useCallback(async (requireVideo = true) => {
        try {
            setMediaError(null);
            const stream = await getUserFullMedia(requireVideo, true);
            myStreamRef.current = stream;
            setLocalStream(stream);
            setHasJoined(true);
            analyzeAudio(stream, 'local');
            toastSuccess("Media access granted.");

            // Resolve the media promise so signaling can proceed
            if (mediaReadyResolverRef.current) {
                mediaReadyResolverRef.current();
            }
            return true;
        } catch (e) {
            console.error("Media access denied:", e);
            let errorMsg = "Permission denied";
            if (e.name === 'NotAllowedError') {
                errorMsg = "Browser blocked camera/mic access. Please click the icon in your address bar to allow permissions.";
            } else if (e.name === 'NotFoundError') {
                errorMsg = "No camera or microphone found on this device.";
            }
            setMediaError(errorMsg);

            if (requireVideo) {
                toastInfo("Camera failed, trying microphone only...");
                try {
                    const audioStream = await getUserFullMedia(false, true);
                    myStreamRef.current = audioStream;
                    setIsVideoOff(true);
                    setHasJoined(true);
                    analyzeAudio(audioStream, 'local');
                    toastInfo("Joining with Microphone only.");
                    if (socketRef2.current && socketRef2.current.connected) {
                        socketRef2.current.emit('video_state', { enabled: false });
                    }
                    return true;
                } catch (err) {
                    console.error("Audio access also denied:", err);
                    setMediaError(`${errorMsg} (Audio also failed)`);
                }
            }
            return false;
        }
    }, [toastSuccess, toastInfo, socketIdRef]);

    const joinAsViewer = () => {
        setIsVideoOff(true);
        setIsMuted(true);
        setHasJoined(true);
        toastWarning("Joining in Viewer Mode (No Camera/Mic).");
        if (socketRef2.current && socketRef2.current.connected) {
            socketRef2.current.emit('video_state', { enabled: false });
        }
    };

    const setLocalStream = (stream) => {
        localPreviewStreamRef.current = stream;
        if (localVideoRef.current && localVideoRef.current.srcObject !== stream) {
            localVideoRef.current.srcObject = stream;
        }
    };

    // Helper for rendering local video elements safely across layout swaps
    const setLocalVideoRef = (el) => {
        localVideoRef.current = el;
        if (el && el.srcObject !== localPreviewStreamRef.current) {
            el.srcObject = localPreviewStreamRef.current;
        }
    };

    // --- Authorization Check ---
    useEffect(() => {
        if (!roomID) return;
        const verifyAccess = async () => {
            if (isOfficer()) return; // Officers can join any room
            try {
                // roomID might be 'consultation-APP001-DGO', but service expects 'APP001'
                let appId = roomID.includes('consultation-') ? roomID.split('consultation-')[1] : roomID;
                // Remove officer type suffixes if present
                appId = appId.replace(/-(DGO|SGWA|ENFORCEMENT|INSPECTION)$/, '');

                const response = await nocApplicationService.getApplication(appId);
                if (response.success && response.data) {
                    const rawUserId = response.data.userId || response.data.user;
                    const appUserId = typeof rawUserId === 'object'
                        ? String(rawUserId?._id || rawUserId?.id || '')
                        : String(rawUserId || '');
                    const currentUserId = String(user?.id || user?._id || '');
                    if (appUserId && currentUserId && appUserId !== currentUserId) {
                        setIsUnauthorized(true);
                    }
                }
            } catch (err) {
                console.warn("Authorization check skipped due to error:", err?.message || err);
            }
        };
        verifyAccess();
    }, [roomID, user, isOfficer]);

    useEffect(() => {
        if (!roomID) return;

        // Reset call state on new room
        setHasJoined(false);
        setCallEnded(false);
        setCallEndedByPeer(false);
        setCallEndedByTimeout(false);
        setIsWaiting(false);
        setIsAlreadyOnCall(false);
        setMediaError(null);
        setChatMessages([]);
        setConnectedPeers([]);
        setPartnerNames({});
        setChatOpen(true);
        setIsVideoOff(false);
        setIsMuted(false);

        // ─── Reuse the shared socket from NotificationContext ──────────────────
        const sock = notifSocket?.current;
        if (!sock || !sock.connected) {
            // Socket not ready yet — the effect will re-run when socketReady changes
            console.warn('[NativeConsultation] Socket not ready yet, waiting for socketReady...');
            return;
        }
        socketRef2.current = sock;

        const handleConnect = async () => {
            console.log('[Socket] Connected, initializing media first...');
            socketIdRef.current = sock.id;

            // Guard: avoid double-subscribing the same socket to the same room
            // (happens when socketReady changes and re-triggers this effect)
            if (socketRef2._subscribedRoom === roomID) {
                console.log('[Socket] Already subscribed to room:', roomID, '— skipping duplicate');
                return;
            }
            socketRef2._subscribedRoom = roomID;

            // CRITICAL: Ensure media is ready BEFORE joining room to avoid missing early offers
            if (!myStreamRef.current) {
                const mediaReady = await initMediaAccess();
                if (!mediaReady) {
                    console.warn('[Socket] Joining room without media');
                }
            }

            console.log('[Socket] Subscribing to room:', roomID);
            sock.emit('subscribe', {
                room: roomID,
                socketId: sock.id,
                userId: user?.id || user?._id || user?.email || displayName,
                name: uniqueDisplayName
            });
        };

        const handleNewUser = async (data) => {
            console.log(`[Socket] New user: ${data.name} (${data.socketId})`);
            // Wait for local media to be ready before initiating connection
            if (mediaReadyPromiseRef.current) await mediaReadyPromiseRef.current;

            setConnectedPeers(prev => [...new Set([...prev, data.socketId])]);
            if (data.name) setPartnerNames(prev => ({ ...prev, [data.socketId]: data.name }));
            initPeerConnection(true, data.socketId);
        };

        const handleRoomUsers = (users) => {
            console.log('[Socket] Room users:', users);
            const isObject = users && typeof users === 'object' && !Array.isArray(users);
            if (isObject) {
                setPartnerNames(prev => ({ ...prev, ...users }));
                const currentSid = sock.id;
                const peerIds = Object.keys(users).filter(id => id !== currentSid);
                setConnectedPeers(peerIds);
            }
        };

        const handleUserDisconnected = (socketId) => {
            console.log('[Socket] Peer disconnected:', socketId);
            setConnectedPeers(prev => prev.filter(id => id !== socketId));
            closeVideo(socketId);
        };


        const handleIceCandidates = async (data) => {
            try {
                const pc = pcRef.current[data.sender];
                if (!pc) return;

                if (data.candidate) {
                    // Queue candidate if remote description is not yet set
                    if (!pc.remoteDescription || !pc.remoteDescription.type) {
                        if (!pendingCandidates.current[data.sender]) pendingCandidates.current[data.sender] = [];
                        pendingCandidates.current[data.sender].push(data.candidate);
                        return;
                    }
                    await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
                }
            } catch (err) {
                console.error("ICE Candidate Error:", err);
            }
        };

        const handleSdp = async (data) => {
            try {
                // Wait for local media to be ready so we have tracks to attach
                if (mediaReadyPromiseRef.current) await mediaReadyPromiseRef.current;

                if (!pcRef.current[data.sender]) initPeerConnection(false, data.sender);
                const pc = pcRef.current[data.sender];
                if (!pc) return;

                const description = new RTCSessionDescription(data.description);
                const isOffer = description.type === 'offer';

                // --- Perfect Negotiation / Collision Handling ---
                const isPolite = isOfficer(); // Officers are polite (they yield in collisions)
                const readyForOffer = !makingOfferRef.current[data.sender] &&
                    (pc.signalingState === 'stable' || isOffer);
                const offerCollision = isOffer && !readyForOffer;

                ignoreOfferRef.current[data.sender] = !isPolite && offerCollision;
                if (ignoreOfferRef.current[data.sender]) {
                    console.log(`[WebRTC] Collision detected, ignoring impolite offer from ${data.sender}`);
                    return;
                }

                if (offerCollision) {
                    // We are polite and there's a collision - rollback local offer
                    console.log(`[WebRTC] Collision detected, polite peer rolling back offer to accept incoming from ${data.sender}`);
                    await Promise.all([
                        pc.setLocalDescription({ type: 'rollback' }),
                        pc.setRemoteDescription(description)
                    ]);
                } else {
                    await pc.setRemoteDescription(description);
                }

                if (isOffer) {
                    console.log(`[WebRTC] Received OFFER from ${data.name || data.sender}`);
                    // Process queued candidates
                    if (pendingCandidates.current[data.sender]) {
                        for (const cand of pendingCandidates.current[data.sender]) {
                            await pc.addIceCandidate(new RTCIceCandidate(cand)).catch(e => console.warn('Delayed ICE failed:', e));
                        }
                        delete pendingCandidates.current[data.sender];
                    }

                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);
                    sock.emit('sdp', {
                        description: pc.localDescription,
                        to: data.sender,
                        sender: socketIdRef.current,
                        name: uniqueDisplayName
                    });
                } else {
                    console.log(`[WebRTC] Received ANSWER from ${data.name || data.sender}`);
                    // Process queued candidates
                    if (pendingCandidates.current[data.sender]) {
                        for (const cand of pendingCandidates.current[data.sender]) {
                            await pc.addIceCandidate(new RTCIceCandidate(cand)).catch(e => console.warn('Delayed ICE failed:', e));
                        }
                        delete pendingCandidates.current[data.sender];
                    }
                }
            } catch (err) {
                console.error("[WebRTC] SDP Error:", err);
            }
        };

        const handleChat = (data) => setChatMessages(prev => [...prev, { sender: data.sender, msg: data.msg, type: 'remote' }]);

        const handlePeerStartRecording = (data) => { console.log('Peer started recording'); startRecordingEngine(); };
        const handlePeerStopRecording = (data) => { console.log('Peer stopped recording'); stopRecordingEngine(); };

        const handleVideoState = (data) => setRemoteVideoOff(p => ({ ...p, [data.socketId]: !data.enabled }));
        const handleAudioState = (data) => setRemoteAudioOff(p => ({ ...p, [data.socketId]: !data.enabled }));
        const handleScreenShare = (data) => setRemoteScreenSharing(p => ({ ...p, [data.socketId]: data.sharing }));

        sock.on('connect', handleConnect);
        sock.on('new_user', handleNewUser);
        sock.on('room_users', handleRoomUsers);
        sock.on('user_disconnected', handleUserDisconnected);
        sock.on('ice candidates', handleIceCandidates);
        sock.on('sdp', handleSdp);
        sock.on('chat', handleChat);
        sock.on('room_full', () => setIsWaiting(true));
        sock.on('already_on_call', (data) => {
            console.error('[WebRTC Trace] received "already_on_call" from server.', data);
            if (data.replaced) {
                toastInfo("Joined from another device/tab. This session is now inactive.");
                console.error('[WebRTC Trace] Setting callEnded = true because data.replaced is true');
                setCallEnded(true);
            } else {
                console.error('[WebRTC Trace] Setting isAlreadyOnCall = true');
                setIsAlreadyOnCall(true);
            }
        });
        sock.on('peer_disconnected', () => { setCallEndedByPeer(true); stopRecordingEngine(); });
        sock.on('peer_start_recording', handlePeerStartRecording);
        sock.on('peer_stop_recording', handlePeerStopRecording);
        sock.on('peer_video_state', handleVideoState);
        sock.on('peer_audio_state', handleAudioState);
        sock.on('peer_screen_share_state', handleScreenShare);

        // If already connected, subscribe to the room immediately; otherwise wait for 'connect' event
        if (sock.connected) {
            handleConnect();
        }

        return () => {
            console.log('[NativeConsultation] Cleaning up listeners for room:', roomID);
            // Only remove OUR listeners — do NOT disconnect the shared socket
            // (NotificationContext owns the socket lifecycle)
            sock.off('connect', handleConnect);
            sock.off('new_user', handleNewUser);
            sock.off('room_users', handleRoomUsers);
            sock.off('user_disconnected', handleUserDisconnected);
            sock.off('ice candidates', handleIceCandidates);
            sock.off('sdp', handleSdp);
            sock.off('chat', handleChat);
            sock.off('room_full');
            sock.off('already_on_call');
            sock.off('peer_disconnected');
            sock.off('peer_start_recording');
            sock.off('peer_stop_recording');
            sock.off('peer_video_state');
            sock.off('peer_audio_state');
            sock.off('peer_screen_share_state');
            // Clear the guard so a future call (different room) re-subscribes properly
            if (socketRef2._subscribedRoom === roomID) {
                socketRef2._subscribedRoom = null;
            }
        };
    }, [roomID, socketReady, user, displayName]);

    // Load initial media (Only run once when room changes)
    useEffect(() => {
        if (!roomID || isUnauthorized) return;

        // Initialize the media promise
        mediaReadyPromiseRef.current = new Promise(resolve => {
            mediaReadyResolverRef.current = resolve;
        });

        // Attempt automatic join once on mount
        if (!myStreamRef.current) {
            initMediaAccess();
        }

        return () => {
            console.log('[NativeConsultation] Cleaning up streams on unmount/room change');
            // Do NOT disconnect socket here. Socket cleanup belongs to the other useEffect.
            if (myStreamRef.current) {
                myStreamRef.current.getTracks().forEach(track => track.stop());
                myStreamRef.current = null;
            }
            if (screenStreamRef.current) {
                screenStreamRef.current.getTracks().forEach(track => track.stop());
                screenStreamRef.current = null;
            }
            Object.values(pcRef.current).forEach(pc => {
                if (pc) pc.close();
            });
            pcRef.current = {};
        };
    }, [roomID, isUnauthorized]);

    // --- Time Limit Enforcer ---
    useEffect(() => {
        if (!roomID || !hasJoined || isWaiting) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    // Mark as timeout-ended and trigger full cleanup via ref
                    setCallEndedByTimeout(true);
                    if (endCallRef.current) endCallRef.current();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [hasJoined, isWaiting]);

    // --- Recording Timer ---
    useEffect(() => {
        if (!roomID || !isRecording) return;
        const timer = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
        return () => clearInterval(timer);
    }, [roomID, isRecording]);

    // --- Core Recording Engine (shared by local start and peer-triggered start) ---
    const startRecordingEngine = async () => {
        try {
            const audioContext = new AudioContext();
            const destination = audioContext.createMediaStreamDestination();

            // Mix local audio
            if (myStreamRef.current) {
                const localSource = audioContext.createMediaStreamSource(myStreamRef.current);
                localSource.connect(destination);
            }

            // Mix remote audio from all peer connections
            Object.values(pcRef.current).forEach(pc => {
                if (!pc) return;
                pc.getReceivers().forEach(receiver => {
                    if (receiver.track && receiver.track.kind === 'audio') {
                        const remoteStream = new MediaStream([receiver.track]);
                        const remoteSource = audioContext.createMediaStreamSource(remoteStream);
                        remoteSource.connect(destination);
                    }
                });
            });

            // Local video + combined audio
            const activeVideoTrack = screenStreamRef.current?.getVideoTracks()[0] || myStreamRef.current?.getVideoTracks()[0];
            const combinedStream = new MediaStream([
                ...(activeVideoTrack ? [activeVideoTrack] : []),
                ...destination.stream.getAudioTracks()
            ]);
            recordingStreamRef.current = combinedStream;

            recordedChunksRef.current = [];
            const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
                ? 'video/webm;codecs=vp9,opus'
                : MediaRecorder.isTypeSupported('video/webm')
                    ? 'video/webm'
                    : 'video/mp4';

            const recorder = new MediaRecorder(combinedStream, { mimeType });
            recorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data);
            };
            recorder.onstop = () => {
                const blob = new Blob(recordedChunksRef.current, { type: mimeType });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
                a.download = `Consultation-Recording-${timestamp}.webm`;
                a.href = url;
                a.click();
                URL.revokeObjectURL(url);
                setRecordingTime(0);
            };

            recorder.start(1000);
            mediaRecorderRef.current = recorder;
            setIsRecording(true);
        } catch (err) {
            console.error('Recording engine error:', err);
        }
    };

    const stopRecordingEngine = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
    };

    // --- Synchronized: User clicks Record — tell BOTH sides to start ---
    const startRecording = async () => {
        const sock2 = socketRef2.current;
        if (sock2 && sock2.connected) sock2.emit('start_recording');
        await startRecordingEngine();
    };

    const stopRecording = () => {
        const sock2 = socketRef2.current;
        if (sock2 && sock2.connected) sock2.emit('stop_recording');
        stopRecordingEngine();
    };

    // Keep refs fresh every render so socket closures always have live functions
    recordingEngineRef.current = {
        start: startRecordingEngine,
        stop: stopRecordingEngine
    };

    // --- WebRTC Logic ---
    const initPeerConnection = (isInitiator, partnerId) => {
        const pc = new RTCPeerConnection(getIceServer());
        pcRef.current[partnerId] = pc;

        // --- Perfect Negotiation: onnegotiationneeded ---
        pc.onnegotiationneeded = async () => {
            try {
                makingOfferRef.current[partnerId] = true;
                const offer = await pc.createOffer();
                if (pc.signalingState !== "stable") return;
                await pc.setLocalDescription(offer);
                socketRef2.current?.emit('sdp', {
                    description: pc.localDescription,
                    to: partnerId,
                    sender: socketIdRef.current,
                    name: uniqueDisplayName
                });
            } catch (err) {
                console.error(`[WebRTC] Offer error for ${partnerId}:`, err);
            } finally {
                makingOfferRef.current[partnerId] = false;
            }
        };

        // Handle ICE Candidates
        pc.onicecandidate = ({ candidate }) => {
            if (candidate) {
                socketRef2.current?.emit('ice candidates', { candidate, to: partnerId, sender: socketIdRef.current });
            }
        };

        // Handle Incoming Tracks
        pc.ontrack = (e) => {
            console.log(`[WebRTC] Received track for ${partnerId}:`, e.track.kind);
            const remoteStream = e.streams[0];
            setStreams(prev => ({
                ...prev,
                [partnerId]: remoteStream
            }));
            if (e.track.kind === 'audio') {
                analyzeAudio(remoteStream, partnerId);
            }
        };

        // Handle State Changes
        pc.onconnectionstatechange = () => {
            const state = pc.connectionState;
            console.log(`[WebRTC] Connection state for ${partnerId}:`, state);
            setRtcConnectionState(prev => ({ ...prev, [partnerId]: state }));

            if (state === 'disconnected' || state === 'failed' || state === 'closed') {
                closeVideo(partnerId);
            }
        };

        // Add local tracks BEFORE assigning event handlers to prevent missing negotiation events
        const activeStream = (isScreenSharing && screenStreamRef.current) ? screenStreamRef.current : myStreamRef.current;
        if (activeStream) {
            console.log(`[WebRTC] Adding ${activeStream.getTracks().length} tracks to ${partnerId}`);
            activeStream.getTracks().forEach(track => {
                pc.addTrack(track, activeStream);
            });
        }

        pc.onsignalingstatechange = () => {
            if (pc.signalingState === 'closed') {
                closeVideo(partnerId);
            }
        };
    };

    const closeVideo = (partnerId) => {
        setStreams(prev => {
            const newStreams = { ...prev };
            delete newStreams[partnerId];
            return newStreams;
        });
        setRtcConnectionState(prev => {
            const newState = { ...prev };
            delete newState[partnerId];
            return newState;
        });
        setIsSpeaking(prev => {
            const newState = { ...prev };
            delete newState[partnerId];
            return newState;
        });
        if (pcRef.current[partnerId]) {
            pcRef.current[partnerId].close();
            delete pcRef.current[partnerId];
        }
    };

    const retryConnection = (partnerId) => {
        toastInfo(`Retrying connection...`);
        closeVideo(partnerId);
        const sock2 = socketRef2.current;
        if (sock2 && sock2.connected) {
            sock2.emit('new_user', { room: roomID, user, name: displayName });
        }
    };

    const broadcastNewTracks = (stream) => {
        setLocalStream(stream);

        // Replace tracks on all active peer connections
        Object.values(pcRef.current).forEach(pc => {
            if (pc) {
                // Audio
                const audioSender = pc.getSenders().find(s => s.track && s.track.kind === 'audio');
                if (audioSender && stream.getAudioTracks().length > 0) {
                    audioSender.replaceTrack(stream.getAudioTracks()[0]);
                }

                // Video
                const videoSender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
                if (videoSender && stream.getVideoTracks().length > 0) {
                    videoSender.replaceTrack(stream.getVideoTracks()[0]);
                }
            }
        });
    };

    // --- Media Controls ---
    const toggleMute = () => {
        if (myStreamRef.current && myStreamRef.current.getAudioTracks().length > 0) {
            const enabled = myStreamRef.current.getAudioTracks()[0].enabled;
            myStreamRef.current.getAudioTracks()[0].enabled = !enabled;
            setIsMuted(!enabled);
            const sock2 = socketRef2.current;
            if (sock2 && sock2.connected) {
                sock2.emit('audio_state', { enabled: !enabled });
            }
            broadcastNewTracks(myStreamRef.current);
        }
    };

    const toggleVideo = () => {
        if (myStreamRef.current && myStreamRef.current.getVideoTracks().length > 0) {
            const enabled = myStreamRef.current.getVideoTracks()[0].enabled;
            myStreamRef.current.getVideoTracks()[0].enabled = !enabled;
            setIsVideoOff(enabled);
            const sock2 = socketRef2.current;
            if (sock2 && sock2.connected) {
                sock2.emit('video_state', { enabled: !enabled });
            }
            broadcastNewTracks(myStreamRef.current);
        }
    };

    const shareScreen = async () => {
        // ── STOP sharing ─────────────────────────────────────────────────────
        if (isScreenSharing && screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach(t => t.stop());
            screenStreamRef.current = null;
            localPreviewStreamRef.current = myStreamRef.current; // revert local preview
            setIsScreenSharing(false);
            // Update recording stream if active
            if (recordingStreamRef.current) {
                const oldTrack = recordingStreamRef.current.getVideoTracks()[0];
                if (oldTrack) recordingStreamRef.current.removeTrack(oldTrack);
                const camTrack = myStreamRef.current?.getVideoTracks()[0];
                if (camTrack) recordingStreamRef.current.addTrack(camTrack);
            }

            // Tell remote side: screen sharing stopped → show avatar again
            const sock2 = socketRef2.current;
            if (sock2 && sock2.connected) {
                sock2.emit('screen_share_state', { sharing: false });
            }
            // Restore camera track to local preview
            if (myStreamRef.current) {
                setLocalStream(myStreamRef.current);
                // Replace back to camera track on all peers
                const camVideoTrack = myStreamRef.current.getVideoTracks()[0];
                Object.values(pcRef.current).forEach(pc => {
                    if (!pc) return;
                    const videoSender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
                    if (videoSender && camVideoTrack) {
                        videoSender.replaceTrack(camVideoTrack);
                    }
                });
            }
            return;
        }

        // ── START sharing ─────────────────────────────────────────────────────
        try {
            if (!navigator.mediaDevices?.getDisplayMedia) {
                alert('Screen sharing is not supported in this browser. Please use Chrome, Edge, or Firefox.');
                return;
            }

            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: { cursor: 'always' },
                audio: false  // browser screen audio is unreliable; use mic instead
            });

            screenStreamRef.current = screenStream;
            setIsScreenSharing(true);
            // Update recording stream if active
            if (recordingStreamRef.current) {
                const oldTrack = recordingStreamRef.current.getVideoTracks()[0];
                if (oldTrack) recordingStreamRef.current.removeTrack(oldTrack);
                recordingStreamRef.current.addTrack(screenStream.getVideoTracks()[0]);
            }

            // Tell remote side: screen share is now active → show video, not avatar
            const sock2Start = socketRef2.current;
            if (sock2Start && sock2Start.connected) {
                sock2Start.emit('screen_share_state', { sharing: true });
            }

            const screenVideoTrack = screenStream.getVideoTracks()[0];

            // Show the screen in our local preview
            // Create a combined stream: screen video + mic audio (so local preview looks right)
            const micAudioTrack = myStreamRef.current?.getAudioTracks()[0];
            const previewTracks = [screenVideoTrack, ...(micAudioTrack ? [micAudioTrack] : [])];
            const previewStream = new MediaStream(previewTracks);
            setLocalStream(previewStream);

            // Replace / add the video track on every peer connection
            Object.values(pcRef.current).forEach(pc => {
                if (!pc) return;
                const videoSender = pc.getSenders().find(s => s.track && s.track.kind === 'video');

                if (videoSender) {
                    // Fast path: replace the existing video track (no renegotiation)
                    videoSender.replaceTrack(screenVideoTrack).catch(err =>
                        console.warn('[ScreenShare] replaceTrack failed:', err)
                    );
                } else {
                    // Fallback: add a new track (triggers renegotiation via onnegotiationneeded)
                    try {
                        pc.addTrack(screenVideoTrack, screenStream);
                    } catch (err) {
                        console.warn('[ScreenShare] addTrack failed:', err);
                    }
                }
            });

            // Auto-stop when user clicks "Stop sharing" in the browser's built-in bar
            screenVideoTrack.addEventListener('ended', () => {
                screenStreamRef.current = null;
                localPreviewStreamRef.current = myStreamRef.current;
                setIsScreenSharing(false);
                // Tell remote side: screen share stopped
                if (socket && socket.connected) {
                    socket.emit('screen_share_state', { sharing: false });
                }

                // Restore recording stream to camera if active
                if (recordingStreamRef.current) {
                    const oldTrack = recordingStreamRef.current.getVideoTracks()[0];
                    if (oldTrack) recordingStreamRef.current.removeTrack(oldTrack);
                    const camTrack = myStreamRef.current?.getVideoTracks()[0];
                    if (camTrack) recordingStreamRef.current.addTrack(camTrack);
                }
                // Restore camera to local preview and all peers
                if (myStreamRef.current) {
                    setLocalStream(myStreamRef.current);
                    const camTrack = myStreamRef.current.getVideoTracks()[0];
                    Object.values(pcRef.current).forEach(pc => {
                        if (!pc) return;
                        const vSender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
                        if (vSender && camTrack) vSender.replaceTrack(camTrack).catch(() => { });
                    });
                }
            });

        } catch (e) {
            // User cancelled the screen picker — not a real error
            if (e.name === 'NotAllowedError' || e.name === 'AbortError') {
                console.log('[ScreenShare] User cancelled screen picker.');
            } else {
                console.error('[ScreenShare] Unexpected error:', e);
                alert(`Screen sharing failed: ${e.message}`);
            }
            setIsScreenSharing(false);
            screenStreamRef.current = null;
        }
    };

    const endCall = () => {
        console.error('[WebRTC Trace] endCall invoked!');
        const sock2 = socketRef2.current;
        if (sock2 && sock2.connected) {
            console.error('[WebRTC Trace] Emitting "end_call" to server for room:', roomID);
            sock2.emit('end_call', { room: roomID });
            // Do NOT disconnect — NotificationContext owns the socket lifecycle
        }
        if (myStreamRef.current) {
            myStreamRef.current.getTracks().forEach(track => track.stop());
            myStreamRef.current = null;
        }
        if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach(track => track.stop());
            screenStreamRef.current = null;
        }
        Object.values(pcRef.current).forEach(pc => { if (pc) pc.close(); });
        pcRef.current = {};
        socketRef2.current = null;
        console.error('[WebRTC Trace] Setting callEnded = true from endCall()');
        setCallEnded(true);
        stopRecordingEngine();
    };

    const goToDashboard = () => {
        closeCall();
    };

    // Always keep the ref pointing to the latest endCall so closures don't go stale
    endCallRef.current = endCall;

    // --- Chat Logic ---
    const sendChatMessage = (e) => {
        e.preventDefault();
        if (chatInput.trim()) {
            const data = {
                room: roomID,
                msg: chatInput.trim(),
                sender: uniqueDisplayName
            };
            socketRef2.current?.emit('chat', data);
            setChatMessages(prev => [...prev, { sender: 'You', msg: data.msg, type: 'local' }]);
            setChatInput('');
        }
    };

    // --- Dynamic Track Management ---
    // Swaps tracks for all peers whenever local media state changes
    useEffect(() => {
        const stream = (isScreenSharing && screenStreamRef.current) ? screenStreamRef.current : myStreamRef.current;
        if (!stream) return;

        const tracks = stream.getTracks();
        Object.keys(pcRef.current).forEach(pid => {
            const pc = pcRef.current[pid];
            if (!pc || pc.connectionState === 'closed') return;

            const senders = pc.getSenders();
            tracks.forEach(track => {
                const sender = senders.find(s => s.track && s.track.kind === track.kind);
                if (sender) {
                    sender.replaceTrack(track).catch(err => console.warn(`[WebRTC] replaceTrack failed for ${pid}:`, err));
                } else {
                    try {
                        pc.addTrack(track, stream);
                    } catch (e) {
                        console.warn(`[WebRTC] addTrack failed for ${pid}:`, e);
                    }
                }
            });
        });
    }, [hasJoined, isScreenSharing]);

    // --- Redirection Logic (Effect-based, not in render) ---
    useEffect(() => {
        let timer;
        if (callEndedByPeer || callEnded) {
            timer = setTimeout(() => goToDashboard(), 3000);
        }
        return () => clearTimeout(timer);
    }, [callEndedByPeer, callEnded]);

    // --- Render Content ---
    const hasRemote = connectedPeers.length > 0;

    // Scroll chat to bottom whenever new messages arrive
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    // ── Inline SVG Icons ───────────────────────────────────────────────────────
    const IconMic = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
    );
    const IconMicOff = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="1" y1="1" x2="23" y2="23" />
            <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
            <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
    );
    const IconCamera = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 7l-7 5 7 5V7z" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
    );
    const IconCameraOff = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10" />
            <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
    );
    const IconScreen = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
    );
    const IconRecord = () => (
        <svg width="10" height="10" viewBox="0 0 10 10">
            <circle cx="5" cy="5" r="5" fill="currentColor" />
        </svg>
    );
    const IconPhone = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.42 19.42 0 0 1 4.43 9.55a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 3.34 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.32 8.91" />
            <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
    );
    const IconChat = () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    );
    const IconSend = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
    );
    const IconClock = () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    );
    const IconVideo = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="23 7 16 12 23 17 23 7" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
    );
    const IconVoice = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 14.1a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 3.32h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.5a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.04z" />
        </svg>
    );
    const IconX = () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    );

    const IconMuted = () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="1" y1="1" x2="23" y2="23" />
            <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
            <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
        </svg>
    );

    // ── Main Consultation UI Logic (Must be after ALL hooks) ──────────────────
    // --- Safety Check ---
    if (!roomID || !activeCall) return null;

    const myInitials = initials(displayName);
    const myRole = isOfficer() ? 'Officer' : 'Applicant';
    const partnerNamesFlat = Object.values(partnerNames).join(', ') || (isOfficer() ? 'Applicant' : 'Officer');

    // ── State screens ─────────────────────────────────────────────────────────
    if (!hasJoined && !isUnauthorized && !isWaiting && !isAlreadyOnCall) {
        return (
            <div className={`nc-outer ${activeCall.isMinimized ? 'minimized' : ''}`}>
                <div className="nc-container">
                    <div className="nc-state-screen">
                        <div className="nc-state-icon blue">
                            <IconClock />
                        </div>
                        <h2>Setting up secure connection…</h2>
                        <p>Initializing WebRTC and requesting media access. Please allow camera & microphone.</p>

                        {mediaError && (
                            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', color: '#f87171', fontSize: '0.88rem' }}>
                                ⚠️ {mediaError}
                            </div>
                        )}

                        <div className="nc-setup-actions" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '300px' }}>
                            <button className="nc-state-btn primary" onClick={() => initMediaAccess()}>
                                🎥 Enable Camera & Mic
                            </button>
                            <button className="nc-state-btn secondary" onClick={joinAsViewer}>
                                👤 Join in Viewer Mode
                            </button>
                        </div>

                        {!mediaError && (
                            <div style={{ marginTop: '2rem', width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(59,130,246,0.2)', borderTopColor: '#3b82f6', animation: 'spin 1s linear infinite' }} />
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (isWaiting) {
        return (
            <div className={`nc-outer ${activeCall.isMinimized ? 'minimized' : ''}`}>
                <div className="nc-container">
                    <div className="nc-state-screen">
                        <div className="nc-state-icon yellow">
                            <IconClock />
                        </div>
                        <h2>Consultation In Progress</h2>
                        <p>Another participant is already in this room. The session will be available once they're done.</p>
                        <button className="nc-state-btn primary" onClick={goToDashboard}>Go Back to Dashboard</button>
                    </div>
                </div>
            </div>
        );
    }

    if (isUnauthorized) {
        return (
            <div className={`nc-outer ${activeCall.isMinimized ? 'minimized' : ''}`}>
                <div className="nc-container">
                    <div className="nc-state-screen">
                        <div className="nc-state-icon red">
                            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                        </div>
                        <h2>Access Denied</h2>
                        <p>You are not authorised to join this consultation room. Only the applicant and designated officers have access.</p>
                        <button className="nc-state-btn primary" onClick={goToDashboard}>Go Back to Dashboard</button>
                    </div>
                </div>
            </div>
        );
    }

    if (isAlreadyOnCall) {
        return (
            <div className={`nc-outer ${activeCall.isMinimized ? 'minimized' : ''}`}>
                <div className="nc-container">
                    <div className="nc-state-screen">
                        <div className="nc-state-icon yellow">
                            <IconPhone />
                        </div>
                        <h2>Already In a Consultation</h2>
                        <p>You are currently active in another consultation session. Please end that call before joining a new one.</p>
                        <button className="nc-state-btn primary" onClick={goToDashboard}>Go Back to Dashboard</button>
                    </div>
                </div>
            </div>
        );
    }

    if (callEndedByPeer) {
        return (
            <div className={`nc-outer ${activeCall.isMinimized ? 'minimized' : ''}`}>
                <div className="nc-container">
                    <div className="nc-state-screen">
                        <div className="nc-state-icon red">
                            <IconPhone />
                        </div>
                        <h2>Call Ended by the Other Party</h2>
                        <p>The other participant has left the consultation. Your session has been closed.</p>
                        <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.3)', margin: 0 }}>Redirecting in 3 seconds…</p>
                        <button className="nc-state-btn primary" onClick={goToDashboard}>Return to Dashboard</button>
                    </div>
                </div>
            </div>
        );
    }

    // Default return for safety
    if (!activeCall) return null;

    if (callEnded) {
        return (
            <div className={`nc-outer ${activeCall.isMinimized ? 'minimized' : ''}`}>
                <div className="nc-container">
                    <div className="nc-state-screen">
                        <div className={`nc-state-icon ${callEndedByTimeout ? 'yellow' : 'blue'}`}>
                            {callEndedByTimeout ? <IconClock /> : (
                                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            )}
                        </div>
                        <h2>{callEndedByTimeout ? 'Session Time Limit Reached' : 'Consultation Ended'}</h2>
                        <p>{callEndedByTimeout
                            ? 'The 45-minute consultation limit was reached. The session has been automatically closed for both participants.'
                            : 'Your consultation session was successfully closed. Thank you!'}
                        </p>
                        <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.3)', margin: 0 }}>Redirecting in 3 seconds…</p>
                        <button className="nc-state-btn primary" onClick={goToDashboard}>Return to Dashboard</button>
                    </div>
                </div>
            </div>
        );
    }

    const mainContent = (
        <div className={`nc-outer ${activeCall.isMinimized ? 'minimized' : ''}`}>
            <div className="nc-container">
                {/* TOP BAR */}
                <div className="nc-topbar">
                    <div className="nc-topbar-left">
                        <div className="nc-logo-pill">
                            <span className="nc-logo-dot" />
                            <span>Live</span>
                        </div>
                        <div className="nc-room-info">
                            <span className="room-label">Room</span>
                            <span className="room-id">{roomID}</span>
                        </div>
                    </div>

                    <div className="nc-topbar-center">
                        <div className={`nc-timer ${timeLeft < 300 ? 'urgent' : ''}`}>
                            <IconClock />
                            {formatTime(timeLeft)}
                        </div>
                        {isRecording && (
                            <div className="nc-recording-badge">
                                <span className="nc-rec-dot" />
                                REC &nbsp;{formatTime(recordingTime)}
                            </div>
                        )}
                        {/* Screen sharing indicator — shown to ALL participants */}
                        {(isScreenSharing || Object.values(remoteScreenSharing).some(Boolean)) && (
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                background: 'rgba(16,185,129,0.15)',
                                border: '1px solid rgba(16,185,129,0.45)',
                                borderRadius: '20px', padding: '4px 12px',
                                fontSize: '0.75rem', fontWeight: 700, color: '#34d399',
                                animation: '_ss_pulse 2s ease-in-out infinite',
                            }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="3" width="20" height="14" rx="2" />
                                    <line x1="8" y1="21" x2="16" y2="21" />
                                    <line x1="12" y1="17" x2="12" y2="21" />
                                </svg>
                                {isScreenSharing ? 'You are sharing your screen' : 'Screen is being shared'}
                            </div>
                        )}
                    </div>

                    <div className="nc-topbar-right">
                        {isRecording && (
                            <div className="nc-recording-banner-mini">
                                <span className="nc-rec-dot" />
                                Recording...
                            </div>
                        )}
                        {/* Video / Voice toggle */}
                        <div className="nc-mode-pill">
                            <button
                                className={`nc-mode-btn ${callMode === 'video' ? 'active' : ''}`}
                                onClick={() => setCallMode('video')}
                            >
                                <IconVideo /> Video
                            </button>
                            <button
                                className={`nc-mode-btn ${callMode === 'voice' ? 'active' : ''}`}
                                onClick={() => setCallMode('voice')}
                            >
                                <IconVoice /> Voice
                            </button>
                        </div>
                        {/* Chat toggle */}
                        <button
                            className={`nc-btn ${chatOpen ? 'active-blue' : ''}`}
                            style={{ width: 38, height: 38 }}
                            onClick={() => setChatOpen(o => !o)}
                            data-tip="Toggle Chat"
                        >
                            <IconChat />
                        </button>
                    </div>
                </div>

                {/* BODY */}
                <div className="nc-body">
                    {/* VIDEO STAGE */}
                    <div className="nc-stage">
                        {/* Recording banner (large) */}
                        {isRecording && (
                            <div className="nc-recording-banner">
                                <div className="nc-rec-dot" />
                                <span>RECORDING IN PROGRESS — THIS SESSION IS BEING MONITORED</span>
                            </div>
                        )}

                        {/* Voice-only overlay */}
                        {callMode === 'voice' && (
                            <div className="nc-voice-overlay">
                                <div className="nc-voice-ripple-wrap">
                                    <span className="nc-voice-ripple" />
                                    <span className="nc-voice-ripple" />
                                    <span className="nc-voice-ripple" />
                                    <div className="nc-voice-avatar">{myInitials}</div>
                                </div>
                                <h2 className="nc-voice-name">{displayName}</h2>
                                <p className="nc-voice-role">{myRole}</p>
                                <p className="nc-voice-status">
                                    <span className="pulse-dot" />
                                    {hasRemote ? 'Connected' : 'Waiting for participant…'}
                                </p>
                            </div>
                        )}

                        {/* ── SCREEN SHARE PRESENTATION MODE (LOCAL) ────────────────
                        Shown when THIS user is sharing. */}
                        {callMode === 'video' && isScreenSharing && (
                            <div className="nc-video-item main" style={{ zIndex: 1, border: 'none' }}>
                                <video
                                    ref={setLocalVideoRef}
                                    autoPlay muted playsInline
                                    style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }}
                                />
                                <div style={{
                                    position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)',
                                    background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.5)',
                                    borderRadius: 20, padding: '5px 16px',
                                    fontSize: '0.78rem', color: '#34d399', fontWeight: 700,
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    backdropFilter: 'blur(6px)', zIndex: 10
                                }}>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                        <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
                                    </svg>
                                    You are presenting
                                </div>
                                <button
                                    className="nc-stop-presenting-btn"
                                    onClick={shareScreen}
                                    style={{
                                        position: 'absolute', bottom: 100, left: '50%', transform: 'translateX(-50%)',
                                        zIndex: 10
                                    }}>
                                    Stop Presenting
                                </button>
                            </div>
                        )}

                        {/* ── REMOTE SCREEN SHARE / CAMERA VIEW ──────────────────
                        Shown when a remote participant is connected (socket level) */}
                        {callMode === 'video' && !isScreenSharing && connectedPeers.map((partnerId) => {
                            const stream = streams[partnerId];
                            const partnerName = partnerNames[partnerId] || (isOfficer() ? 'Applicant' : 'Officer');
                            const partnerRole = isOfficer() ? 'Applicant' : 'Officer';
                            const partnerConnState = rtcConnectionState[partnerId] || 'new';
                            const partnerIsConnecting = !stream || (partnerConnState !== 'connected' && partnerConnState !== 'completed');
                            const partnerIsSpeaking = isSpeaking[partnerId] || false;
                            const partnerIsScreenSharing = remoteScreenSharing[partnerId] || false;
                            const partnerVideoOff = (remoteVideoOff[partnerId] || false) && !partnerIsScreenSharing;
                            const partnerAudioOff = remoteAudioOff[partnerId] || false;

                            if (partnerIsScreenSharing) {
                                return (
                                    <div key={partnerId} className="nc-video-item main" style={{ zIndex: 1, border: 'none' }}>
                                        <video
                                            autoPlay playsInline
                                            style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }}
                                            ref={el => { if (el && el.srcObject !== stream) el.srcObject = stream; }}
                                        />
                                        {/* Presenter badge */}
                                        <div style={{
                                            position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)',
                                            background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.5)',
                                            borderRadius: 20, padding: '5px 16px',
                                            fontSize: '0.78rem', color: '#34d399', fontWeight: 700,
                                            display: 'flex', alignItems: 'center', gap: 6,
                                            backdropFilter: 'blur(6px)', zIndex: 10
                                        }}>
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                                <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
                                            </svg>
                                            {partnerName} is presenting
                                        </div>
                                        <div className={`nc-name-tag ${partnerIsSpeaking ? 'speaking' : ''}`} style={{ position: 'absolute', bottom: 100, left: 24, zIndex: 10 }}>
                                            <span className="nt-dot" /><span>{partnerName} · {partnerRole}</span>
                                        </div>
                                    </div>
                                );
                            }

                            // Normal camera view
                            const anyScreenSharing = isScreenSharing || Object.values(remoteScreenSharing).some(Boolean);
                            return (
                                <div key={partnerId} className={`nc-video-item ${anyScreenSharing ? 'pip' : 'main'}`}>
                                    {partnerIsConnecting ? (
                                        <div className="nc-avatar-overlay connecting">
                                            <div className="nc-waiting-ring sm" />
                                            <p className="nc-avatar-name">Connecting to {partnerName}...</p>
                                            <button
                                                className="nc-retry-btn"
                                                onClick={() => retryConnection(partnerId)}
                                                style={{
                                                    marginTop: '12px',
                                                    padding: '6px 16px',
                                                    borderRadius: '20px',
                                                    background: 'rgba(255,255,255,0.1)',
                                                    border: '1px solid rgba(255,255,255,0.2)',
                                                    color: '#fff',
                                                    fontSize: '0.75rem',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Retry Connection
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <video
                                                autoPlay playsInline
                                                style={{ display: partnerVideoOff ? 'none' : 'block', width: '100%', height: '100%', objectFit: 'cover', background: '#000' }}
                                                ref={el => { if (el && el.srcObject !== stream) el.srcObject = stream; }}
                                            />
                                            {partnerVideoOff && (
                                                <div className="nc-avatar-overlay">
                                                    <div className="nc-avatar lg green">{initials(partnerName)}</div>
                                                    <p className="nc-avatar-name">{partnerName}</p>
                                                    <p className="nc-avatar-role">
                                                        <span className="cam-off-icon">
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10" />
                                                                <line x1="1" y1="1" x2="23" y2="23" />
                                                            </svg>
                                                        </span>
                                                        {partnerAudioOff && (
                                                            <span className="muted-pill">
                                                                <IconMuted /> Muted
                                                            </span>
                                                        )}
                                                        {partnerRole} · Camera Off
                                                    </p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                    <div className={`nc-name-tag ${partnerAudioOff ? 'muted' : ''} ${partnerIsSpeaking ? 'speaking' : ''}`}>
                                        <span className="nt-dot" />
                                        <span>{partnerName} · {partnerRole}{partnerAudioOff ? ' (Muted)' : ''}</span>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Waiting overlay — hidden when screen sharing is active */}
                        {callMode === 'video' && !hasRemote && !isScreenSharing && (
                            <div className="nc-waiting">
                                <div className="nc-waiting-ring" />
                                <h3>Waiting for participant…</h3>
                                <p>Room ID: {roomID}</p>
                            </div>
                        )}

                        {/* Local video PiP — hidden when I am screen sharing (screen fills stage instead) */}
                        {callMode === 'video' && !isScreenSharing && (
                            <div className={`nc-video-item ${hasRemote || Object.values(remoteScreenSharing).some(Boolean) ? 'pip' : 'main'}`}>
                                <video
                                    ref={setLocalVideoRef}
                                    autoPlay muted playsInline
                                    style={{ display: isVideoOff ? 'none' : 'block', width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                {isVideoOff && (
                                    <div className="nc-avatar-overlay">
                                        <div className={`nc-avatar ${hasRemote ? 'sm' : 'lg'}`}>{myInitials}</div>
                                        {!hasRemote && <p className="nc-avatar-name">{displayName}</p>}
                                        {!hasRemote && (
                                            <p className="nc-avatar-role">
                                                {isMuted && (
                                                    <span className="muted-pill">
                                                        <IconMuted /> Muted
                                                    </span>
                                                )}
                                                {myRole} · Camera Off
                                            </p>
                                        )}
                                    </div>
                                )}
                                <div className={`nc-name-tag ${isMuted ? 'muted' : ''} ${isSpeaking['local'] ? 'speaking' : ''}`}>
                                    <span className="nt-dot" />
                                    <span>{displayName} · You{isMuted ? ' (Muted)' : ''}</span>
                                </div>
                            </div>
                        )}

                        {/* Local camera PiP thumbnail while screen sharing ────────
                        Small camera view overlay in top-right corner of the stage */}
                        {callMode === 'video' && isScreenSharing && (
                            <div style={{
                                position: 'absolute', bottom: 16, right: 16, zIndex: 10,
                                width: 160, height: 90,
                                borderRadius: 10,
                                overflow: 'hidden',
                                border: '2px solid rgba(255,255,255,0.25)',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                                background: '#0d1b2e',
                            }}>
                                {/* Show remote cam during screenshare */}
                                {hasRemote && Object.entries(streams).map(([pid, st]) => (
                                    <video key={pid} autoPlay playsInline muted={false}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        ref={el => { if (el && el.srcObject !== st) el.srcObject = st; }}
                                    />
                                ))}
                                {!hasRemote && (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d1b2e' }}>
                                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#059669,#10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>
                                            {myInitials}
                                        </div>
                                    </div>
                                )}
                                <div style={{
                                    position: 'absolute', bottom: 0, left: 0, right: 0,
                                    background: 'rgba(0,0,0,0.55)', padding: '2px 6px',
                                    fontSize: '0.65rem', color: 'rgba(255,255,255,0.8)', textAlign: 'center',
                                }}>
                                    {hasRemote ? partnerNamesFlat : displayName}
                                </div>
                            </div>
                        )}

                        {/* CONTROLS BAR */}
                        <div className="nc-controls">
                            {/* Mic */}
                            <div className="nc-ctrl-group">
                                <button
                                    className={`nc-btn ${isMuted ? 'off' : ''}`}
                                    onClick={toggleMute}
                                    data-tip={isMuted ? 'Unmute' : 'Mute'}
                                >
                                    {isMuted ? <IconMicOff /> : <IconMic />}
                                </button>

                                {/* Camera (video mode only) */}
                                {callMode === 'video' && (
                                    <button
                                        className={`nc-btn ${isVideoOff ? 'off' : ''}`}
                                        onClick={toggleVideo}
                                        data-tip={isVideoOff ? 'Start Camera' : 'Stop Camera'}
                                    >
                                        {isVideoOff ? <IconCameraOff /> : <IconCamera />}
                                    </button>
                                )}

                                {/* Screen Share */}
                                {callMode === 'video' && (
                                    <button
                                        className={`nc-btn ${isScreenSharing ? 'active-blue' : ''}`}
                                        onClick={shareScreen}
                                        data-tip={isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
                                    >
                                        <IconScreen />
                                    </button>
                                )}
                            </div>

                            <div className="nc-ctrl-divider" />

                            {/* Record */}
                            <div className="nc-ctrl-group">
                                {isRecording ? (
                                    <button className="nc-btn recording-btn" onClick={stopRecording}>
                                        <span className="nc-rec-dot" style={{ margin: 0 }} />
                                        {formatTime(recordingTime)}
                                    </button>
                                ) : (
                                    <button className="nc-btn" onClick={startRecording} data-tip="Record">
                                        <IconRecord />
                                        <span style={{ fontSize: '0.72rem', fontWeight: 700, marginLeft: 4, letterSpacing: '0.5px' }}>REC</span>
                                    </button>
                                )}
                            </div>

                            <div className="nc-ctrl-divider" />

                            {/* End call */}
                            <button className="nc-btn-end" onClick={endCall}>
                                <IconPhone />
                                End
                            </button>
                        </div>
                    </div>

                    {/* CHAT SIDEBAR */}
                    <div className={`nc-sidebar ${chatOpen ? '' : 'collapsed'}`}>
                        <div className="nc-sidebar-header">
                            <h3><IconChat /> Consultation Chat</h3>
                            <button className="nc-close-btn" onClick={() => setChatOpen(false)}>
                                <IconX />
                            </button>
                        </div>
                        <div className="nc-msgs">
                            {chatMessages.length === 0 && (
                                <p className="nc-no-msgs">No messages yet.<br />Start the conversation!</p>
                            )}
                            {chatMessages.map((msg, idx) => (
                                <div key={idx} className={`nc-bubble ${msg.type}`}>
                                    <span className="bubble-sender">{msg.sender}</span>
                                    <p>{msg.msg}</p>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>
                        <form onSubmit={sendChatMessage} className="nc-chat-form">
                            <input
                                type="text"
                                className="nc-chat-input"
                                placeholder="Type a message…"
                                value={chatInput}
                                onChange={e => setChatInput(e.target.value)}
                            />
                            <button type="submit" className="nc-chat-send">
                                <IconSend />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );

    return mainContent;
};


// SVG icons moved inside or used via common components

export default NativeConsultation;
