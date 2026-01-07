/**
 * PeerSync - WebRTC DataChannel shim for P2P token synchronization
 * Provides optional P2P sync with configurable signaling and TURN
 */

import { tokenService, type Token } from '../services/token-service';
import { ECDHKeyExchange } from '../utils/encryption';

export interface PeerSyncConfig {
  signalingUrl?: string;
  iceServers?: RTCIceServer[];
  autoSync?: boolean;
  encryptionEnabled?: boolean;
}

export interface PeerConnection {
  id: string;
  connection: RTCPeerConnection;
  channel: RTCDataChannel | null;
  connected: boolean;
}

export class PeerSync {
  private config: PeerSyncConfig;
  private peers: Map<string, PeerConnection> = new Map();
  private keyExchange: ECDHKeyExchange | null = null;
  private isInitialized = false;

  constructor(config: PeerSyncConfig = {}) {
    this.config = {
      signalingUrl: config.signalingUrl || 'wss://signaling.pewpi.local',
      iceServers: config.iceServers || [
        { urls: 'stun:stun.l.google.com:19302' },
        // Add TURN servers if needed
      ],
      autoSync: config.autoSync ?? true,
      encryptionEnabled: config.encryptionEnabled ?? false,
    };
  }

  /**
   * Initialize P2P sync
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.warn('PeerSync: Already initialized');
      return;
    }

    console.log('PeerSync: Initializing with config:', this.config);

    if (this.config.encryptionEnabled) {
      this.keyExchange = new ECDHKeyExchange();
      await this.keyExchange.initialize();
    }

    if (this.config.autoSync) {
      this.startAutoSync();
    }

    this.isInitialized = true;
    console.log('PeerSync: Initialized successfully');
  }

  /**
   * Connect to a peer
   */
  async connectToPeer(peerId: string): Promise<void> {
    if (this.peers.has(peerId)) {
      console.warn('PeerSync: Already connected to peer', peerId);
      return;
    }

    try {
      const connection = new RTCPeerConnection({
        iceServers: this.config.iceServers,
      });

      const channel = connection.createDataChannel('token-sync', {
        ordered: true,
      });

      this.setupDataChannel(channel, peerId);
      this.setupConnection(connection, peerId);

      this.peers.set(peerId, {
        id: peerId,
        connection,
        channel,
        connected: false,
      });

      // Create and send offer
      const offer = await connection.createOffer();
      await connection.setLocalDescription(offer);

      console.log('PeerSync: Created offer for peer', peerId);
      // In production, send offer via signaling server
      this.sendSignalingMessage(peerId, { type: 'offer', offer });
    } catch (error) {
      console.error('PeerSync: Failed to connect to peer', peerId, error);
      throw error;
    }
  }

  /**
   * Disconnect from a peer
   */
  disconnectFromPeer(peerId: string): void {
    const peer = this.peers.get(peerId);
    if (!peer) return;

    if (peer.channel) {
      peer.channel.close();
    }
    peer.connection.close();
    this.peers.delete(peerId);

    console.log('PeerSync: Disconnected from peer', peerId);
  }

  /**
   * Disconnect from all peers
   */
  disconnectAll(): void {
    for (const peerId of this.peers.keys()) {
      this.disconnectFromPeer(peerId);
    }
  }

  /**
   * Send token to peer
   */
  async sendToken(peerId: string, token: Token): Promise<void> {
    const peer = this.peers.get(peerId);
    if (!peer || !peer.connected || !peer.channel) {
      throw new Error('Peer not connected');
    }

    try {
      let message = JSON.stringify({
        type: 'token',
        data: token,
        timestamp: Date.now(),
      });

      if (this.config.encryptionEnabled && this.keyExchange) {
        message = await this.keyExchange.encryptMessage(message);
      }

      peer.channel.send(message);
      console.log('PeerSync: Sent token to peer', peerId, token.id);
    } catch (error) {
      console.error('PeerSync: Failed to send token', error);
      throw error;
    }
  }

  /**
   * Sync all tokens with peer
   */
  async syncWithPeer(peerId: string): Promise<void> {
    try {
      const tokens = await tokenService.getAll();
      
      for (const token of tokens) {
        await this.sendToken(peerId, token);
      }

      console.log('PeerSync: Synced', tokens.length, 'tokens with peer', peerId);
    } catch (error) {
      console.error('PeerSync: Failed to sync with peer', error);
      throw error;
    }
  }

  /**
   * Get list of connected peers
   */
  getConnectedPeers(): string[] {
    return Array.from(this.peers.entries())
      .filter(([_, peer]) => peer.connected)
      .map(([id, _]) => id);
  }

  // Private helper methods

  private setupDataChannel(channel: RTCDataChannel, peerId: string): void {
    channel.onopen = () => {
      console.log('PeerSync: Data channel opened with peer', peerId);
      const peer = this.peers.get(peerId);
      if (peer) {
        peer.connected = true;
      }

      // Auto-sync if enabled
      if (this.config.autoSync) {
        this.syncWithPeer(peerId).catch(console.error);
      }
    };

    channel.onclose = () => {
      console.log('PeerSync: Data channel closed with peer', peerId);
      const peer = this.peers.get(peerId);
      if (peer) {
        peer.connected = false;
      }
    };

    channel.onmessage = async (event) => {
      try {
        let message = event.data;

        if (this.config.encryptionEnabled && this.keyExchange) {
          message = await this.keyExchange.decryptMessage(message);
        }

        const data = JSON.parse(message);
        
        if (data.type === 'token') {
          await this.handleReceivedToken(data.data);
        }
      } catch (error) {
        console.error('PeerSync: Failed to handle message', error);
      }
    };

    channel.onerror = (error) => {
      console.error('PeerSync: Data channel error with peer', peerId, error);
    };
  }

  private setupConnection(connection: RTCPeerConnection, peerId: string): void {
    connection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('PeerSync: ICE candidate for peer', peerId);
        // In production, send candidate via signaling server
        this.sendSignalingMessage(peerId, {
          type: 'ice-candidate',
          candidate: event.candidate,
        });
      }
    };

    connection.onconnectionstatechange = () => {
      console.log('PeerSync: Connection state changed:', connection.connectionState);
      
      if (connection.connectionState === 'disconnected' || 
          connection.connectionState === 'failed' ||
          connection.connectionState === 'closed') {
        this.disconnectFromPeer(peerId);
      }
    };

    connection.ondatachannel = (event) => {
      console.log('PeerSync: Received data channel from peer', peerId);
      const peer = this.peers.get(peerId);
      if (peer) {
        peer.channel = event.channel;
        this.setupDataChannel(event.channel, peerId);
      }
    };
  }

  private async handleReceivedToken(token: Token): Promise<void> {
    try {
      // Check if token already exists
      const existing = await tokenService.getById(token.id);
      
      if (!existing) {
        // Create new token from peer
        await tokenService.createToken({
          name: token.name,
          symbol: token.symbol,
          amount: token.amount,
          creator: token.creator,
          metadata: {
            ...token.metadata,
            receivedFromPeer: true,
            receivedAt: Date.now(),
          },
        });
        console.log('PeerSync: Received and saved token from peer', token.id);
      } else {
        console.log('PeerSync: Token already exists, skipping', token.id);
      }
    } catch (error) {
      console.error('PeerSync: Failed to handle received token', error);
    }
  }

  private sendSignalingMessage(peerId: string, message: any): void {
    // Stub: In production, this would send via WebSocket to signaling server
    console.log('PeerSync: [STUB] Would send signaling message to', peerId, message.type);
  }

  private startAutoSync(): void {
    // Subscribe to token creation events
    tokenService.on('created', async (event) => {
      // Broadcast new tokens to all connected peers
      const connectedPeers = this.getConnectedPeers();
      
      for (const peerId of connectedPeers) {
        try {
          await this.sendToken(peerId, event.token);
        } catch (error) {
          console.error('PeerSync: Failed to broadcast token to peer', peerId, error);
        }
      }
    });

    console.log('PeerSync: Auto-sync enabled');
  }
}

/**
 * Create a PeerSync instance with configuration
 */
export function createPeerSync(config?: PeerSyncConfig): PeerSync {
  return new PeerSync(config);
}
