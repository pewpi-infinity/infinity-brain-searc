/**
 * WebRTC P2P Sync Module (Stub for future implementation)
 * 
 * Provides optional P2P synchronization using WebRTC DataChannel
 * with configurable signaling and TURN servers
 */

export interface P2PConfig {
  signalingUrl?: string;
  iceServers?: RTCIceServer[];
  autoConnect?: boolean;
}

export interface P2PMessage {
  type: 'sync' | 'token_update' | 'wallet_state';
  payload: any;
  timestamp: string;
}

class P2PSyncService {
  private config: P2PConfig;
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private isConnected = false;

  constructor(config: P2PConfig = {}) {
    this.config = {
      signalingUrl: config.signalingUrl || 'wss://pewpi-signaling.example.com',
      iceServers: config.iceServers || [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ],
      autoConnect: config.autoConnect ?? false
    };

    if (this.config.autoConnect) {
      console.log('⚠️ P2P sync is not fully implemented yet');
    }
  }

  /**
   * Initialize P2P connection (Stub)
   */
  async connect(): Promise<boolean> {
    console.log('🔗 P2P Sync: Stub implementation');
    return false;
  }

  /**
   * Send data to peer (Stub)
   */
  async send(message: P2PMessage): Promise<boolean> {
    console.log('P2P: Would send message:', message);
    return false;
  }

  /**
   * Close P2P connection (Stub)
   */
  disconnect(): void {
    console.log('P2P: Disconnected');
  }

  /**
   * Get connection status
   */
  getStatus(): { connected: boolean; config: P2PConfig } {
    return {
      connected: this.isConnected,
      config: this.config
    };
  }
}

export function createP2PSync(config?: P2PConfig): P2PSyncService {
  return new P2PSyncService(config);
}

export const p2pSync = createP2PSync({ autoConnect: false });
export { P2PSyncService };
 * P2P Sync - WebRTC DataChannel shim for peer-to-peer synchronization
 * Includes configurable signaling URL and TURN settings
 */

import { TokenService, Token } from '../token-service';

export interface P2PSyncConfig {
  signalingUrl?: string;
  turnServers?: RTCIceServer[];
  channelName?: string;
  autoSync?: boolean;
}

export interface PeerConnection {
  id: string;
  connection: RTCPeerConnection;
  dataChannel?: RTCDataChannel;
  connected: boolean;
}

export class P2PSync {
  private config: P2PSyncConfig;
  private peers: Map<string, PeerConnection> = new Map();
  private localId: string;
  private signalingConnection?: WebSocket;
  private enabled = false;

  constructor(config: P2PSyncConfig = {}) {
    this.config = {
      signalingUrl: config.signalingUrl || 'wss://signal.pewpi.local',
      turnServers: config.turnServers || [
        {
          urls: 'stun:stun.l.google.com:19302'
        }
      ],
      channelName: config.channelName || 'pewpi-token-sync',
      autoSync: config.autoSync !== false
    };
    
    this.localId = `peer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log('[P2PSync] Initialized with ID:', this.localId);
  }

  /**
   * Enable P2P synchronization
   */
  async enable(): Promise<boolean> {
    if (this.enabled) {
      console.log('[P2PSync] Already enabled');
      return true;
    }

    try {
      // Connect to signaling server
      await this.connectToSignaling();

      // Subscribe to token events
      if (this.config.autoSync) {
        TokenService.on('created', (event) => {
          this.broadcastTokenEvent('created', event.token);
        });

        TokenService.on('updated', (event) => {
          this.broadcastTokenEvent('updated', event.token);
        });

        TokenService.on('deleted', (event) => {
          this.broadcastTokenEvent('deleted', event.token);
        });
      }

      this.enabled = true;
      console.log('[P2PSync] Enabled successfully');
      return true;
    } catch (error) {
      console.error('[P2PSync] Failed to enable:', error);
      return false;
    }
  }

  /**
   * Disable P2P synchronization
   */
  disable(): void {
    if (!this.enabled) {
      return;
    }

    // Close all peer connections
    this.peers.forEach((peer) => {
      this.closePeerConnection(peer.id);
    });

    // Close signaling connection
    if (this.signalingConnection) {
      this.signalingConnection.close();
      this.signalingConnection = undefined;
    }

    this.enabled = false;
    console.log('[P2PSync] Disabled');
  }

  /**
   * Connect to signaling server (stub)
   */
  private async connectToSignaling(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // This is a stub - in production, connect to actual signaling server
        console.log('[P2PSync] Connecting to signaling server:', this.config.signalingUrl);
        
        // Simulate connection
        setTimeout(() => {
          console.log('[P2PSync] Connected to signaling server (stub)');
          resolve();
        }, 100);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Create peer connection
   */
  private async createPeerConnection(peerId: string): Promise<PeerConnection> {
    const connection = new RTCPeerConnection({
      iceServers: this.config.turnServers
    });

    const peerConnection: PeerConnection = {
      id: peerId,
      connection,
      connected: false
    };

    // Handle ICE candidates
    connection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('[P2PSync] New ICE candidate for peer:', peerId);
        // In production, send to signaling server
      }
    };

    // Handle connection state changes
    connection.onconnectionstatechange = () => {
      console.log('[P2PSync] Connection state:', connection.connectionState);
      if (connection.connectionState === 'connected') {
        peerConnection.connected = true;
      } else if (connection.connectionState === 'disconnected' || connection.connectionState === 'failed') {
        peerConnection.connected = false;
        this.handlePeerDisconnect(peerId);
      }
    };

    // Create data channel
    const dataChannel = connection.createDataChannel(this.config.channelName!);
    peerConnection.dataChannel = dataChannel;

    dataChannel.onopen = () => {
      console.log('[P2PSync] Data channel opened with peer:', peerId);
    };

    dataChannel.onmessage = (event) => {
      this.handlePeerMessage(peerId, event.data);
    };

    dataChannel.onerror = (error) => {
      console.error('[P2PSync] Data channel error:', error);
    };

    this.peers.set(peerId, peerConnection);
    return peerConnection;
  }

  /**
   * Handle incoming message from peer
   */
  private handlePeerMessage(peerId: string, message: string): void {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'token-event') {
        console.log('[P2PSync] Received token event from peer:', peerId, data.event);
        
        // Process token event (would update local state in production)
        window.dispatchEvent(new CustomEvent('pewpi.p2p.token', {
          detail: {
            peerId,
            event: data.event,
            token: data.token
          }
        }));
      }
    } catch (error) {
      console.error('[P2PSync] Failed to handle peer message:', error);
    }
  }

  /**
   * Handle peer disconnect
   */
  private handlePeerDisconnect(peerId: string): void {
    console.log('[P2PSync] Peer disconnected:', peerId);
    this.closePeerConnection(peerId);
  }

  /**
   * Close peer connection
   */
  private closePeerConnection(peerId: string): void {
    const peer = this.peers.get(peerId);
    if (peer) {
      if (peer.dataChannel) {
        peer.dataChannel.close();
      }
      peer.connection.close();
      this.peers.delete(peerId);
      console.log('[P2PSync] Closed connection to peer:', peerId);
    }
  }

  /**
   * Broadcast token event to all peers
   */
  private broadcastTokenEvent(eventType: string, token: Token): void {
    const message = JSON.stringify({
      type: 'token-event',
      event: eventType,
      token,
      timestamp: new Date().toISOString(),
      from: this.localId
    });

    this.peers.forEach((peer, peerId) => {
      if (peer.connected && peer.dataChannel?.readyState === 'open') {
        try {
          peer.dataChannel.send(message);
          console.log('[P2PSync] Sent token event to peer:', peerId);
        } catch (error) {
          console.error('[P2PSync] Failed to send to peer:', peerId, error);
        }
      }
    });
  }

  /**
   * Connect to a specific peer (stub)
   */
  async connectToPeer(peerId: string): Promise<boolean> {
    try {
      console.log('[P2PSync] Connecting to peer:', peerId);
      const peer = await this.createPeerConnection(peerId);
      
      // Create offer (stub - in production, exchange via signaling)
      const offer = await peer.connection.createOffer();
      await peer.connection.setLocalDescription(offer);
      
      console.log('[P2PSync] Created offer for peer:', peerId);
      return true;
    } catch (error) {
      console.error('[P2PSync] Failed to connect to peer:', error);
      return false;
    }
  }

  /**
   * Get connected peers
   */
  getConnectedPeers(): string[] {
    return Array.from(this.peers.values())
      .filter(peer => peer.connected)
      .map(peer => peer.id);
  }

  /**
   * Get local peer ID
   */
  getLocalId(): string {
    return this.localId;
  }

  /**
   * Check if P2P is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}

// Singleton instance
export const p2pSync = new P2PSync();

// Helper function to initialize P2P with custom config
export function initP2PSync(config?: P2PSyncConfig): P2PSync {
  return new P2PSync(config);
}
