// SuperSeymour P2P Comment Network
// The complete architecture for unstoppable, uncensorable comments
// "Every website is now a forum, whether they like it or not"

(function() {
  'use strict';

  // ============================================
  // CORE P2P NETWORK LAYER
  // ============================================

  class SeymourP2PNetwork {
    constructor() {
      this.peers = new Map();           // Active peer connections
      this.rooms = new Map();           // URL-based rooms
      this.dht = new DistributedHashTable();
      this.ipfs = null;                 // IPFS node
      this.signalServers = [
        'wss://signal.seymouros.com',
        'wss://signal2.seymouros.com',
        'wss://backup.nostr.wine',     // Fallback to Nostr
      ];
      this.config = {
        maxPeersPerRoom: 50,
        replicationFactor: 5,
        heartbeatInterval: 30000,
        reconnectDelay: 5000
      };
    }

    // Initialize the entire P2P stack
    async init() {
      console.log('🌐 Initializing SuperSeymour P2P Network...');

      // 1. Generate or load peer identity
      this.identity = await this.loadOrCreateIdentity();

      // 2. Initialize IPFS node
      await this.initIPFS();

      // 3. Connect to signal servers
      await this.connectToSignalServers();

      // 4. Initialize DHT
      await this.dht.init(this.identity);

      // 5. Start network discovery
      this.startDiscovery();

      console.log('✅ P2P Network initialized with ID:', this.identity.id);
    }

    // Generate cryptographic identity
    async loadOrCreateIdentity() {
      let identity = localStorage.getItem('seymour-identity');

      if (!identity) {
        // Generate new Ed25519 keypair
        const keyPair = await crypto.subtle.generateKey(
          {
            name: 'Ed25519',
            namedCurve: 'Ed25519',
          },
          true,
          ['sign', 'verify']
        );

        identity = {
          id: this.generatePeerId(),
          publicKey: await crypto.subtle.exportKey('jwk', keyPair.publicKey),
          privateKey: await crypto.subtle.exportKey('jwk', keyPair.privateKey),
          created: Date.now()
        };

        localStorage.setItem('seymour-identity', JSON.stringify(identity));
      } else {
        identity = JSON.parse(identity);
      }

      return identity;
    }

    // Generate unique peer ID
    generatePeerId() {
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      return 'peer_' + Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
    }
  }

  // ============================================
  // DISTRIBUTED HASH TABLE (DHT)
  // ============================================

  class DistributedHashTable {
    constructor() {
      this.buckets = new Map();        // K-buckets for Kademlia routing
      this.storage = new Map();        // Local storage
      this.alpha = 3;                  // Parallel lookup parameter
      this.k = 20;                     // Bucket size
      this.republishInterval = 3600000; // 1 hour
    }

    async init(identity) {
      this.nodeId = await this.hash(identity.id);
      this.initBuckets();
      this.startRepublishing();
    }

    // Initialize K-buckets for Kademlia
    initBuckets() {
      for (let i = 0; i < 256; i++) {
        this.buckets.set(i, []);
      }
    }

    // XOR distance metric for Kademlia
    distance(id1, id2) {
      const buf1 = this.hexToBytes(id1);
      const buf2 = this.hexToBytes(id2);
      const result = new Uint8Array(32);

      for (let i = 0; i < 32; i++) {
        result[i] = buf1[i] ^ buf2[i];
      }

      return this.bytesToHex(result);
    }

    // Find K closest nodes to a key
    async findNode(key) {
      const targetId = await this.hash(key);
      const closest = new Set();
      const queried = new Set();
      const active = new Map();

      // Start with alpha closest known nodes
      const initial = this.getClosestNodes(targetId, this.alpha);
      initial.forEach(node => active.set(node.id, node));

      while (active.size > 0 && closest.size < this.k) {
        const batch = Array.from(active.values()).slice(0, this.alpha);

        await Promise.all(batch.map(async node => {
          if (queried.has(node.id)) return;

          queried.add(node.id);
          active.delete(node.id);

          try {
            const response = await this.queryNode(node, 'FIND_NODE', targetId);

            response.nodes.forEach(newNode => {
              if (!queried.has(newNode.id)) {
                const dist = this.distance(targetId, newNode.id);

                if (closest.size < this.k) {
                  closest.add({ ...newNode, distance: dist });
                  active.set(newNode.id, newNode);
                }
              }
            });
          } catch (error) {
            // Node is offline, remove from routing table
            this.removeFromBucket(node);
          }
        }));
      }

      return Array.from(closest).sort((a, b) =>
        a.distance.localeCompare(b.distance)
      ).slice(0, this.k);
    }

    // Store value in DHT
    async store(key, value) {
      const keyHash = await this.hash(key);
      const nodes = await this.findNode(key);

      // Store on k closest nodes
      const stored = await Promise.allSettled(
        nodes.map(node => this.storeOnNode(node, keyHash, value))
      );

      // Also store locally
      this.storage.set(keyHash, {
        value,
        timestamp: Date.now(),
        republish: Date.now() + this.republishInterval
      });

      return stored.filter(r => r.status === 'fulfilled').length;
    }

    // Retrieve value from DHT
    async retrieve(key) {
      const keyHash = await this.hash(key);

      // Check local storage first
      const local = this.storage.get(keyHash);
      if (local) return local.value;

      // Query network
      const nodes = await this.findNode(key);

      for (const node of nodes) {
        try {
          const value = await this.queryNode(node, 'GET', keyHash);
          if (value) {
            // Cache locally
            this.storage.set(keyHash, {
              value,
              timestamp: Date.now(),
              republish: Date.now() + this.republishInterval
            });
            return value;
          }
        } catch (error) {
          continue;
        }
      }

      return null;
    }

    // Hash function for DHT keys
    async hash(input) {
      const encoder = new TextEncoder();
      const data = encoder.encode(input);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      return this.bytesToHex(new Uint8Array(hashBuffer));
    }

    // Utility functions
    hexToBytes(hex) {
      const bytes = new Uint8Array(hex.length / 2);
      for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
      }
      return bytes;
    }

    bytesToHex(bytes) {
      return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
    }
  }

  // ============================================
  // WEBRTC MESH NETWORK
  // ============================================

  class WebRTCMesh {
    constructor(identity, signalServer) {
      this.identity = identity;
      this.signalServer = signalServer;
      this.peers = new Map();
      this.dataChannels = new Map();
      this.messageHandlers = new Map();

      this.rtcConfig = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun.stunprotocol.org:3478' },
          {
            urls: 'turn:turn.seymouros.com:3478',
            username: 'seymour',
            credential: 'liberation'
          }
        ],
        iceCandidatePoolSize: 10
      };
    }

    // Join a room (URL-based)
    async joinRoom(roomId) {
      console.log(`Joining room: ${roomId}`);

      // Connect to signal server
      const ws = new WebSocket(this.signalServer);

      ws.onopen = () => {
        // Announce presence
        ws.send(JSON.stringify({
          type: 'join',
          room: roomId,
          peerId: this.identity.id,
          publicKey: this.identity.publicKey
        }));
      };

      ws.onmessage = async (event) => {
        const message = JSON.parse(event.data);

        switch (message.type) {
          case 'peers':
            // Connect to existing peers in room
            for (const peer of message.peers) {
              await this.connectToPeer(peer, true);
            }
            break;

          case 'offer':
            await this.handleOffer(message);
            break;

          case 'answer':
            await this.handleAnswer(message);
            break;

          case 'ice-candidate':
            await this.handleIceCandidate(message);
            break;

          case 'peer-joined':
            // New peer joined, they will initiate connection
            console.log('New peer joined:', message.peerId);
            break;
        }
      };

      this.signalSocket = ws;
      return ws;
    }

    // Create peer connection
    async connectToPeer(peerInfo, isInitiator = false) {
      const pc = new RTCPeerConnection(this.rtcConfig);
      const peerId = peerInfo.id;

      this.peers.set(peerId, {
        connection: pc,
        info: peerInfo,
        isInitiator,
        state: 'connecting'
      });

      // Set up ICE candidate handling
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          this.signalSocket.send(JSON.stringify({
            type: 'ice-candidate',
            candidate: event.candidate,
            to: peerId,
            from: this.identity.id
          }));
        }
      };

      // Create data channel
      if (isInitiator) {
        const channel = pc.createDataChannel('comments', {
          ordered: true,
          reliable: true
        });
        this.setupDataChannel(channel, peerId);

        // Create and send offer
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        this.signalSocket.send(JSON.stringify({
          type: 'offer',
          offer: offer,
          to: peerId,
          from: this.identity.id
        }));
      } else {
        // Wait for data channel from peer
        pc.ondatachannel = (event) => {
          this.setupDataChannel(event.channel, peerId);
        };
      }

      // Monitor connection state
      pc.onconnectionstatechange = () => {
        console.log(`Connection state with ${peerId}: ${pc.connectionState}`);

        if (pc.connectionState === 'connected') {
          this.peers.get(peerId).state = 'connected';
          this.onPeerConnected(peerId);
        } else if (pc.connectionState === 'failed') {
          this.reconnectToPeer(peerId);
        }
      };

      return pc;
    }

    // Set up data channel
    setupDataChannel(channel, peerId) {
      channel.onopen = () => {
        console.log(`Data channel opened with ${peerId}`);
        this.dataChannels.set(peerId, channel);

        // Send initial sync request
        this.sendToPeer(peerId, {
          type: 'sync-request',
          url: window.location.href,
          lastSync: 0
        });
      };

      channel.onmessage = (event) => {
        this.handlePeerMessage(peerId, JSON.parse(event.data));
      };

      channel.onerror = (error) => {
        console.error(`Data channel error with ${peerId}:`, error);
      };

      channel.onclose = () => {
        console.log(`Data channel closed with ${peerId}`);
        this.dataChannels.delete(peerId);
      };
    }

    // Handle peer messages
    async handlePeerMessage(peerId, message) {
      // Verify message signature
      if (!await this.verifyMessage(peerId, message)) {
        console.warn('Invalid message signature from', peerId);
        return;
      }

      switch (message.type) {
        case 'sync-request':
          await this.handleSyncRequest(peerId, message);
          break;

        case 'sync-response':
          await this.handleSyncResponse(peerId, message);
          break;

        case 'new-comment':
          await this.handleNewComment(peerId, message);
          break;

        case 'gossip':
          await this.handleGossip(peerId, message);
          break;

        default:
          // Custom handlers
          const handler = this.messageHandlers.get(message.type);
          if (handler) {
            await handler(peerId, message);
          }
      }
    }

    // Send message to specific peer
    sendToPeer(peerId, message) {
      const channel = this.dataChannels.get(peerId);
      if (channel && channel.readyState === 'open') {
        // Sign message
        const signedMessage = this.signMessage(message);
        channel.send(JSON.stringify(signedMessage));
        return true;
      }
      return false;
    }

    // Broadcast to all peers
    broadcast(message, excludePeer = null) {
      const signedMessage = this.signMessage(message);
      const serialized = JSON.stringify(signedMessage);

      this.dataChannels.forEach((channel, peerId) => {
        if (peerId !== excludePeer && channel.readyState === 'open') {
          channel.send(serialized);
        }
      });
    }

    // Sign message with identity
    signMessage(message) {
      // In production, use actual cryptographic signing
      return {
        ...message,
        sender: this.identity.id,
        timestamp: Date.now(),
        signature: 'TODO: Implement Ed25519 signature'
      };
    }

    // Verify message signature
    async verifyMessage(peerId, message) {
      // TODO: Implement actual signature verification
      // For now, just check sender matches peer
      return message.sender === peerId;
    }
  }

  // ============================================
  // IPFS INTEGRATION
  // ============================================

  class IPFSComments {
    constructor() {
      this.node = null;
      this.gateways = [
        'https://ipfs.io/ipfs/',
        'https://gateway.pinata.cloud/ipfs/',
        'https://cloudflare-ipfs.com/ipfs/',
        'https://gateway.ipfs.io/ipfs/'
      ];
    }

    async init() {
      try {
        // Load IPFS library dynamically
        if (typeof window.Ipfs === 'undefined') {
          await this.loadIPFSLibrary();
        }

        // Create IPFS node
        this.node = await window.Ipfs.create({
          repo: 'seymour-ipfs-' + Math.random(),
          config: {
            Addresses: {
              Swarm: [
                '/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
                '/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star'
              ]
            },
            Bootstrap: [
              '/dns4/node0.preload.ipfs.io/tcp/443/wss/p2p/QmZMxNdpWtFPNW9P7bG6Wi3WnVDHqVnNWGHCkfVGqBDKSA',
              '/dns4/node1.preload.ipfs.io/tcp/443/wss/p2p/QmaCpDwFXZBgKLxZKCwLTNi2BgDdgYLnCRmGFRqRENzqq2'
            ]
          }
        });

        console.log('IPFS node created with ID:', (await this.node.id()).id);
        return true;
      } catch (error) {
        console.error('Failed to initialize IPFS:', error);
        return false;
      }
    }

    // Load IPFS library from CDN
    async loadIPFSLibrary() {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/ipfs/dist/index.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    // Store comment on IPFS
    async storeComment(comment) {
      if (!this.node) return null;

      try {
        // Add to IPFS
        const result = await this.node.add(JSON.stringify(comment));
        const cid = result.cid.toString();

        // Pin locally to prevent garbage collection
        await this.node.pin.add(cid);

        console.log('Comment stored on IPFS:', cid);
        return cid;
      } catch (error) {
        console.error('Failed to store on IPFS:', error);
        return null;
      }
    }

    // Retrieve comment from IPFS
    async retrieveComment(cid) {
      try {
        // Try local node first
        if (this.node) {
          const chunks = [];
          for await (const chunk of this.node.cat(cid)) {
            chunks.push(chunk);
          }
          const data = new TextDecoder().decode(Buffer.concat(chunks));
          return JSON.parse(data);
        }

        // Fallback to gateways
        for (const gateway of this.gateways) {
          try {
            const response = await fetch(gateway + cid);
            if (response.ok) {
              return await response.json();
            }
          } catch (error) {
            continue;
          }
        }

        return null;
      } catch (error) {
        console.error('Failed to retrieve from IPFS:', error);
        return null;
      }
    }

    // Create IPNS name for user's comments
    async publishToIPNS(comments) {
      if (!this.node) return null;

      try {
        // Create DAG of comments
        const dag = {
          comments: comments,
          timestamp: Date.now(),
          version: '1.0.0'
        };

        // Add to IPFS
        const result = await this.node.add(JSON.stringify(dag));
        const cid = result.cid.toString();

        // Publish to IPNS
        const name = await this.node.name.publish(cid);
        console.log('Published to IPNS:', name);

        return name;
      } catch (error) {
        console.error('Failed to publish to IPNS:', error);
        return null;
      }
    }
  }

  // ============================================
  // GOSSIP PROTOCOL
  // ============================================

  class GossipProtocol {
    constructor(network) {
      this.network = network;
      this.seen = new Map();         // Message IDs we've seen
      this.pending = new Map();      // Messages awaiting confirmation
      this.fanout = 6;              // Number of peers to relay to
      this.ttl = 3;                 // Message time-to-live (hops)
      this.timeout = 30000;         // Message timeout
    }

    // Broadcast message using gossip
    async gossip(message) {
      // Generate unique message ID
      const messageId = await this.generateMessageId(message);

      // Check if we've seen this before
      if (this.seen.has(messageId)) {
        return false;
      }

      // Mark as seen
      this.seen.set(messageId, Date.now());

      // Add gossip metadata
      const gossipMessage = {
        ...message,
        gossip: {
          id: messageId,
          ttl: this.ttl,
          origin: this.network.identity.id,
          path: [this.network.identity.id],
          timestamp: Date.now()
        }
      };

      // Select random peers for relay
      const peers = this.selectPeers(this.fanout, gossipMessage.gossip.path);

      // Send to selected peers
      peers.forEach(peerId => {
        this.network.sendToPeer(peerId, {
          type: 'gossip',
          message: gossipMessage
        });
      });

      // Track pending confirmation
      this.pending.set(messageId, {
        message: gossipMessage,
        peers: peers,
        timestamp: Date.now()
      });

      // Cleanup old messages
      this.cleanup();

      return true;
    }

    // Handle incoming gossip
    async handleGossip(fromPeer, gossipData) {
      const message = gossipData.message;
      const messageId = message.gossip.id;

      // Check if we've seen this
      if (this.seen.has(messageId)) {
        // Send acknowledgment
        this.network.sendToPeer(fromPeer, {
          type: 'gossip-ack',
          messageId: messageId
        });
        return false;
      }

      // Verify message hasn't expired
      if (Date.now() - message.gossip.timestamp > this.timeout) {
        return false;
      }

      // Mark as seen
      this.seen.set(messageId, Date.now());

      // Process the actual message
      await this.processMessage(message);

      // Decrement TTL
      message.gossip.ttl--;

      // Add ourselves to path
      message.gossip.path.push(this.network.identity.id);

      // Continue gossiping if TTL > 0
      if (message.gossip.ttl > 0) {
        // Select peers (excluding path)
        const peers = this.selectPeers(
          this.fanout - 1, // One less since we received from one
          message.gossip.path
        );

        peers.forEach(peerId => {
          this.network.sendToPeer(peerId, {
            type: 'gossip',
            message: message
          });
        });
      }

      // Send acknowledgment
      this.network.sendToPeer(fromPeer, {
        type: 'gossip-ack',
        messageId: messageId
      });

      return true;
    }

    // Select random peers for gossip
    selectPeers(count, exclude = []) {
      const available = Array.from(this.network.peers.keys())
        .filter(peerId => !exclude.includes(peerId));

      // Fisher-Yates shuffle
      for (let i = available.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [available[i], available[j]] = [available[j], available[i]];
      }

      return available.slice(0, Math.min(count, available.length));
    }

    // Generate unique message ID
    async generateMessageId(message) {
      const text = JSON.stringify({
        content: message.content,
        sender: message.sender,
        timestamp: message.timestamp
      });

      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // Process received message
    async processMessage(message) {
      // Extract actual content
      const content = {
        type: message.type,
        data: message.data,
        sender: message.gossip.origin,
        timestamp: message.gossip.timestamp
      };

      // Handle based on type
      switch (content.type) {
        case 'new-comment':
          await this.handleNewComment(content);
          break;

        case 'comment-vote':
          await this.handleCommentVote(content);
          break;

        case 'comment-delete':
          await this.handleCommentDelete(content);
          break;
      }
    }

    // Cleanup old seen messages
    cleanup() {
      const now = Date.now();
      const maxAge = 300000; // 5 minutes

      // Clean seen messages
      this.seen.forEach((timestamp, id) => {
        if (now - timestamp > maxAge) {
          this.seen.delete(id);
        }
      });

      // Clean pending messages
      this.pending.forEach((data, id) => {
        if (now - data.timestamp > this.timeout) {
          this.pending.delete(id);
        }
      });
    }
  }

  // ============================================
  // CRYPTO & SECURITY LAYER
  // ============================================

  class CryptoLayer {
    constructor() {
      this.keyPair = null;
    }

    async init() {
      // Generate or load key pair
      this.keyPair = await this.loadOrGenerateKeys();
    }

    // Generate Ed25519 key pair
    async generateKeyPair() {
      // Note: Web Crypto API doesn't support Ed25519 yet
      // Using RSA-PSS as fallback
      const keyPair = await crypto.subtle.generateKey(
        {
          name: 'RSA-PSS',
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: 'SHA-256'
        },
        true,
        ['sign', 'verify']
      );

      return keyPair;
    }

    // Sign data
    async sign(data) {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(JSON.stringify(data));

      const signature = await crypto.subtle.sign(
        {
          name: 'RSA-PSS',
          saltLength: 32
        },
        this.keyPair.privateKey,
        dataBuffer
      );

      return this.arrayBufferToBase64(signature);
    }

    // Verify signature
    async verify(data, signature, publicKey) {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(JSON.stringify(data));
      const signatureBuffer = this.base64ToArrayBuffer(signature);

      return await crypto.subtle.verify(
        {
          name: 'RSA-PSS',
          saltLength: 32
        },
        publicKey,
        signatureBuffer,
        dataBuffer
      );
    }

    // Encrypt data for specific peer
    async encrypt(data, peerPublicKey) {
      // Generate ephemeral key for this message
      const ephemeralKey = await crypto.subtle.generateKey(
        {
          name: 'AES-GCM',
          length: 256
        },
        true,
        ['encrypt', 'decrypt']
      );

      // Encrypt data with ephemeral key
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(JSON.stringify(data));

      const encrypted = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        ephemeralKey,
        dataBuffer
      );

      // Export ephemeral key
      const exportedKey = await crypto.subtle.exportKey('raw', ephemeralKey);

      // Encrypt ephemeral key with peer's public key
      // (In real implementation, use ECDH or RSA-OAEP)

      return {
        encrypted: this.arrayBufferToBase64(encrypted),
        iv: this.arrayBufferToBase64(iv),
        ephemeralKey: this.arrayBufferToBase64(exportedKey)
      };
    }

    // Helper functions
    arrayBufferToBase64(buffer) {
      const bytes = new Uint8Array(buffer);
      let binary = '';
      bytes.forEach(byte => binary += String.fromCharCode(byte));
      return btoa(binary);
    }

    base64ToArrayBuffer(base64) {
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes.buffer;
    }

    // Load or generate keys
    async loadOrGenerateKeys() {
      const stored = localStorage.getItem('seymour-keys');

      if (stored) {
        const parsed = JSON.parse(stored);

        // Import keys
        const publicKey = await crypto.subtle.importKey(
          'jwk',
          parsed.publicKey,
          {
            name: 'RSA-PSS',
            hash: 'SHA-256'
          },
          true,
          ['verify']
        );

        const privateKey = await crypto.subtle.importKey(
          'jwk',
          parsed.privateKey,
          {
            name: 'RSA-PSS',
            hash: 'SHA-256'
          },
          true,
          ['sign']
        );

        return { publicKey, privateKey };
      }

      // Generate new keys
      const keyPair = await this.generateKeyPair();

      // Export and store
      const exported = {
        publicKey: await crypto.subtle.exportKey('jwk', keyPair.publicKey),
        privateKey: await crypto.subtle.exportKey('jwk', keyPair.privateKey)
      };

      localStorage.setItem('seymour-keys', JSON.stringify(exported));

      return keyPair;
    }
  }

  // ============================================
  // COMMENT SYNCHRONIZATION ENGINE
  // ============================================

  class CommentSync {
    constructor(network) {
      this.network = network;
      this.db = null;
      this.syncInterval = 30000; // Sync every 30 seconds
      this.lastSync = new Map();
    }

    async init() {
      // Open IndexedDB
      await this.openDatabase();

      // Start sync timer
      this.startSync();
    }

    async openDatabase() {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open('SeymourComments', 2);

        request.onsuccess = (event) => {
          this.db = event.target.result;
          resolve();
        };

        request.onupgradeneeded = (event) => {
          const db = event.target.result;

          // Comments store
          if (!db.objectStoreNames.contains('comments')) {
            const commentStore = db.createObjectStore('comments', { keyPath: 'id' });
            commentStore.createIndex('url', 'url', { unique: false });
            commentStore.createIndex('timestamp', 'timestamp', { unique: false });
            commentStore.createIndex('sender', 'sender', { unique: false });
          }

          // Sync metadata store
          if (!db.objectStoreNames.contains('sync')) {
            const syncStore = db.createObjectStore('sync', { keyPath: 'peerId' });
            syncStore.createIndex('lastSync', 'lastSync', { unique: false });
          }
        };

        request.onerror = () => reject(request.error);
      });
    }

    // Start periodic sync
    startSync() {
      setInterval(() => {
        this.syncWithPeers();
      }, this.syncInterval);

      // Initial sync
      this.syncWithPeers();
    }

    // Sync with all connected peers
    async syncWithPeers() {
      const url = this.normalizeUrl(window.location.href);

      this.network.peers.forEach(async (peer, peerId) => {
        if (peer.state === 'connected') {
          await this.syncWithPeer(peerId, url);
        }
      });
    }

    // Sync with specific peer
    async syncWithPeer(peerId, url) {
      const lastSync = this.lastSync.get(peerId) || 0;

      // Request comments since last sync
      this.network.sendToPeer(peerId, {
        type: 'sync-request',
        url: url,
        since: lastSync
      });

      // Update last sync time
      this.lastSync.set(peerId, Date.now());
    }

    // Handle sync request from peer
    async handleSyncRequest(peerId, request) {
      const { url, since } = request;

      // Get comments for URL since timestamp
      const comments = await this.getCommentsSince(url, since);

      // Send response
      this.network.sendToPeer(peerId, {
        type: 'sync-response',
        url: url,
        comments: comments,
        timestamp: Date.now()
      });
    }

    // Handle sync response from peer
    async handleSyncResponse(peerId, response) {
      const { comments } = response;

      // Store new comments
      for (const comment of comments) {
        await this.storeComment(comment);
      }

      // Update UI if viewing same URL
      if (this.normalizeUrl(window.location.href) === response.url) {
        this.updateUI(comments);
      }
    }

    // Get comments since timestamp
    async getCommentsSince(url, since) {
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['comments'], 'readonly');
        const store = transaction.objectStore('comments');
        const index = store.index('url');

        const range = IDBKeyRange.only(url);
        const request = index.openCursor(range);

        const results = [];

        request.onsuccess = (event) => {
          const cursor = event.target.result;

          if (cursor) {
            if (cursor.value.timestamp > since) {
              results.push(cursor.value);
            }
            cursor.continue();
          } else {
            resolve(results);
          }
        };

        request.onerror = () => reject(request.error);
      });
    }

    // Store comment
    async storeComment(comment) {
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['comments'], 'readwrite');
        const store = transaction.objectStore('comments');

        const request = store.put(comment);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }

    // Normalize URL
    normalizeUrl(url) {
      const parsed = new URL(url);
      return parsed.origin + parsed.pathname.replace(/\/$/, '');
    }

    // Update UI with new comments
    updateUI(comments) {
      // Trigger UI update event
      window.dispatchEvent(new CustomEvent('seymour-new-comments', {
        detail: { comments }
      }));
    }
  }

  // ============================================
  // MASTER CONTROLLER
  // ============================================

  window.SeymourP2P = {
    network: null,
    crypto: null,
    sync: null,
    ipfs: null,
    gossip: null,

    async init() {
      console.log('🚀 Initializing SuperSeymour P2P Comment Network...');

      // Initialize crypto layer
      this.crypto = new CryptoLayer();
      await this.crypto.init();

      // Initialize P2P network
      this.network = new SeymourP2PNetwork();
      await this.network.init();

      // Initialize IPFS
      this.ipfs = new IPFSComments();
      await this.ipfs.init();

      // Initialize gossip protocol
      this.gossip = new GossipProtocol(this.network);

      // Initialize sync engine
      this.sync = new CommentSync(this.network);
      await this.sync.init();

      console.log('✨ P2P Comment Network ready!');
      console.log('- Peer ID:', this.network.identity.id);
      console.log('- Connected peers:', this.network.peers.size);
      console.log('- IPFS status:', this.ipfs.node ? 'online' : 'offline');

      return true;
    },

    // Post a comment
    async postComment(text, url = window.location.href) {
      const comment = {
        id: this.generateCommentId(),
        url: this.sync.normalizeUrl(url),
        text: text,
        sender: this.network.identity.id,
        timestamp: Date.now(),
        signature: await this.crypto.sign({ text, url, timestamp: Date.now() })
      };

      // Store locally
      await this.sync.storeComment(comment);

      // Store on IPFS
      const cid = await this.ipfs.storeComment(comment);
      if (cid) {
        comment.ipfsCid = cid;
      }

      // Gossip to network
      await this.gossip.gossip({
        type: 'new-comment',
        data: comment
      });

      return comment;
    },

    // Generate unique comment ID
    generateCommentId() {
      return `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },

    // Get stats
    getStats() {
      return {
        peerId: this.network.identity.id,
        connectedPeers: this.network.peers.size,
        ipfsOnline: !!this.ipfs.node,
        messagesGossiped: this.gossip.seen.size,
        commentsStored: 'TODO'
      };
    }
  };

  // Auto-initialize when loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.SeymourP2P.init();
    });
  } else {
    window.SeymourP2P.init();
  }

})();