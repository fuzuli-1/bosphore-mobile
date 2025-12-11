import {
  firstValueFrom
} from "./chunk-QSQAZRTJ.js";
import {
  BehaviorSubject,
  Observable,
  Subject,
  filter,
  first,
  share,
  take
} from "./chunk-56BFLRAQ.js";
import {
  __async,
  __spreadProps,
  __spreadValues
} from "./chunk-SCNEKAWF.js";

// node_modules/@stomp/rx-stomp/esm6/rx-stomp-config.js
var RxStompConfig = class {
};

// node_modules/@stomp/stompjs/esm6/augment-websocket.js
function augmentWebsocket(webSocket, debug) {
  webSocket.terminate = function() {
    const noOp = () => {
    };
    this.onerror = noOp;
    this.onmessage = noOp;
    this.onopen = noOp;
    const ts = /* @__PURE__ */ new Date();
    const id = Math.random().toString().substring(2, 8);
    const origOnClose = this.onclose;
    this.onclose = (closeEvent) => {
      const delay = (/* @__PURE__ */ new Date()).getTime() - ts.getTime();
      debug(`Discarded socket (#${id})  closed after ${delay}ms, with code/reason: ${closeEvent.code}/${closeEvent.reason}`);
    };
    this.close();
    origOnClose?.call(webSocket, {
      code: 4001,
      reason: `Quick discarding socket (#${id}) without waiting for the shutdown sequence.`,
      wasClean: false
    });
  };
}

// node_modules/@stomp/stompjs/esm6/byte.js
var BYTE = {
  // LINEFEED byte (octet 10)
  LF: "\n",
  // NULL byte (octet 0)
  NULL: "\0"
};

// node_modules/@stomp/stompjs/esm6/frame-impl.js
var FrameImpl = class _FrameImpl {
  /**
   * body of the frame
   */
  get body() {
    if (!this._body && this.isBinaryBody) {
      this._body = new TextDecoder().decode(this._binaryBody);
    }
    return this._body || "";
  }
  /**
   * body as Uint8Array
   */
  get binaryBody() {
    if (!this._binaryBody && !this.isBinaryBody) {
      this._binaryBody = new TextEncoder().encode(this._body);
    }
    return this._binaryBody;
  }
  /**
   * Frame constructor. `command`, `headers` and `body` are available as properties.
   *
   * @internal
   */
  constructor(params) {
    const { command, headers, body, binaryBody, escapeHeaderValues, skipContentLengthHeader } = params;
    this.command = command;
    this.headers = Object.assign({}, headers || {});
    if (binaryBody) {
      this._binaryBody = binaryBody;
      this.isBinaryBody = true;
    } else {
      this._body = body || "";
      this.isBinaryBody = false;
    }
    this.escapeHeaderValues = escapeHeaderValues || false;
    this.skipContentLengthHeader = skipContentLengthHeader || false;
  }
  /**
   * deserialize a STOMP Frame from raw data.
   *
   * @internal
   */
  static fromRawFrame(rawFrame, escapeHeaderValues) {
    const headers = {};
    const trim = (str) => str.replace(/^\s+|\s+$/g, "");
    for (const header of rawFrame.headers.reverse()) {
      const idx = header.indexOf(":");
      const key = trim(header[0]);
      let value = trim(header[1]);
      if (escapeHeaderValues && rawFrame.command !== "CONNECT" && rawFrame.command !== "CONNECTED") {
        value = _FrameImpl.hdrValueUnEscape(value);
      }
      headers[key] = value;
    }
    return new _FrameImpl({
      command: rawFrame.command,
      headers,
      binaryBody: rawFrame.binaryBody,
      escapeHeaderValues
    });
  }
  /**
   * @internal
   */
  toString() {
    return this.serializeCmdAndHeaders();
  }
  /**
   * serialize this Frame in a format suitable to be passed to WebSocket.
   * If the body is string the output will be string.
   * If the body is binary (i.e. of type Unit8Array) it will be serialized to ArrayBuffer.
   *
   * @internal
   */
  serialize() {
    const cmdAndHeaders = this.serializeCmdAndHeaders();
    if (this.isBinaryBody) {
      return _FrameImpl.toUnit8Array(cmdAndHeaders, this._binaryBody).buffer;
    } else {
      return cmdAndHeaders + this._body + BYTE.NULL;
    }
  }
  serializeCmdAndHeaders() {
    const lines = [this.command];
    if (this.skipContentLengthHeader) {
      delete this.headers["content-length"];
    }
    for (const name of Object.keys(this.headers || {})) {
      const value = this.headers[name];
      if (this.escapeHeaderValues && this.command !== "CONNECT" && this.command !== "CONNECTED") {
        lines.push(`${name}:${_FrameImpl.hdrValueEscape(`${value}`)}`);
      } else {
        lines.push(`${name}:${value}`);
      }
    }
    if (this.isBinaryBody || !this.isBodyEmpty() && !this.skipContentLengthHeader) {
      lines.push(`content-length:${this.bodyLength()}`);
    }
    return lines.join(BYTE.LF) + BYTE.LF + BYTE.LF;
  }
  isBodyEmpty() {
    return this.bodyLength() === 0;
  }
  bodyLength() {
    const binaryBody = this.binaryBody;
    return binaryBody ? binaryBody.length : 0;
  }
  /**
   * Compute the size of a UTF-8 string by counting its number of bytes
   * (and not the number of characters composing the string)
   */
  static sizeOfUTF8(s) {
    return s ? new TextEncoder().encode(s).length : 0;
  }
  static toUnit8Array(cmdAndHeaders, binaryBody) {
    const uint8CmdAndHeaders = new TextEncoder().encode(cmdAndHeaders);
    const nullTerminator = new Uint8Array([0]);
    const uint8Frame = new Uint8Array(uint8CmdAndHeaders.length + binaryBody.length + nullTerminator.length);
    uint8Frame.set(uint8CmdAndHeaders);
    uint8Frame.set(binaryBody, uint8CmdAndHeaders.length);
    uint8Frame.set(nullTerminator, uint8CmdAndHeaders.length + binaryBody.length);
    return uint8Frame;
  }
  /**
   * Serialize a STOMP frame as per STOMP standards, suitable to be sent to the STOMP broker.
   *
   * @internal
   */
  static marshall(params) {
    const frame = new _FrameImpl(params);
    return frame.serialize();
  }
  /**
   *  Escape header values
   */
  static hdrValueEscape(str) {
    return str.replace(/\\/g, "\\\\").replace(/\r/g, "\\r").replace(/\n/g, "\\n").replace(/:/g, "\\c");
  }
  /**
   * UnEscape header values
   */
  static hdrValueUnEscape(str) {
    return str.replace(/\\r/g, "\r").replace(/\\n/g, "\n").replace(/\\c/g, ":").replace(/\\\\/g, "\\");
  }
};

// node_modules/@stomp/stompjs/esm6/parser.js
var NULL = 0;
var LF = 10;
var CR = 13;
var COLON = 58;
var Parser = class {
  constructor(onFrame, onIncomingPing) {
    this.onFrame = onFrame;
    this.onIncomingPing = onIncomingPing;
    this._encoder = new TextEncoder();
    this._decoder = new TextDecoder();
    this._token = [];
    this._initState();
  }
  parseChunk(segment, appendMissingNULLonIncoming = false) {
    let chunk;
    if (typeof segment === "string") {
      chunk = this._encoder.encode(segment);
    } else {
      chunk = new Uint8Array(segment);
    }
    if (appendMissingNULLonIncoming && chunk[chunk.length - 1] !== 0) {
      const chunkWithNull = new Uint8Array(chunk.length + 1);
      chunkWithNull.set(chunk, 0);
      chunkWithNull[chunk.length] = 0;
      chunk = chunkWithNull;
    }
    for (let i = 0; i < chunk.length; i++) {
      const byte = chunk[i];
      this._onByte(byte);
    }
  }
  // The following implements a simple Rec Descent Parser.
  // The grammar is simple and just one byte tells what should be the next state
  _collectFrame(byte) {
    if (byte === NULL) {
      return;
    }
    if (byte === CR) {
      return;
    }
    if (byte === LF) {
      this.onIncomingPing();
      return;
    }
    this._onByte = this._collectCommand;
    this._reinjectByte(byte);
  }
  _collectCommand(byte) {
    if (byte === CR) {
      return;
    }
    if (byte === LF) {
      this._results.command = this._consumeTokenAsUTF8();
      this._onByte = this._collectHeaders;
      return;
    }
    this._consumeByte(byte);
  }
  _collectHeaders(byte) {
    if (byte === CR) {
      return;
    }
    if (byte === LF) {
      this._setupCollectBody();
      return;
    }
    this._onByte = this._collectHeaderKey;
    this._reinjectByte(byte);
  }
  _reinjectByte(byte) {
    this._onByte(byte);
  }
  _collectHeaderKey(byte) {
    if (byte === COLON) {
      this._headerKey = this._consumeTokenAsUTF8();
      this._onByte = this._collectHeaderValue;
      return;
    }
    this._consumeByte(byte);
  }
  _collectHeaderValue(byte) {
    if (byte === CR) {
      return;
    }
    if (byte === LF) {
      this._results.headers.push([
        this._headerKey,
        this._consumeTokenAsUTF8()
      ]);
      this._headerKey = void 0;
      this._onByte = this._collectHeaders;
      return;
    }
    this._consumeByte(byte);
  }
  _setupCollectBody() {
    const contentLengthHeader = this._results.headers.filter((header) => {
      return header[0] === "content-length";
    })[0];
    if (contentLengthHeader) {
      this._bodyBytesRemaining = parseInt(contentLengthHeader[1], 10);
      this._onByte = this._collectBodyFixedSize;
    } else {
      this._onByte = this._collectBodyNullTerminated;
    }
  }
  _collectBodyNullTerminated(byte) {
    if (byte === NULL) {
      this._retrievedBody();
      return;
    }
    this._consumeByte(byte);
  }
  _collectBodyFixedSize(byte) {
    if (this._bodyBytesRemaining-- === 0) {
      this._retrievedBody();
      return;
    }
    this._consumeByte(byte);
  }
  _retrievedBody() {
    this._results.binaryBody = this._consumeTokenAsRaw();
    try {
      this.onFrame(this._results);
    } catch (e) {
      console.log(`Ignoring an exception thrown by a frame handler. Original exception: `, e);
    }
    this._initState();
  }
  // Rec Descent Parser helpers
  _consumeByte(byte) {
    this._token.push(byte);
  }
  _consumeTokenAsUTF8() {
    return this._decoder.decode(this._consumeTokenAsRaw());
  }
  _consumeTokenAsRaw() {
    const rawResult = new Uint8Array(this._token);
    this._token = [];
    return rawResult;
  }
  _initState() {
    this._results = {
      command: void 0,
      headers: [],
      binaryBody: void 0
    };
    this._token = [];
    this._headerKey = void 0;
    this._onByte = this._collectFrame;
  }
};

// node_modules/@stomp/stompjs/esm6/types.js
var StompSocketState;
(function(StompSocketState2) {
  StompSocketState2[StompSocketState2["CONNECTING"] = 0] = "CONNECTING";
  StompSocketState2[StompSocketState2["OPEN"] = 1] = "OPEN";
  StompSocketState2[StompSocketState2["CLOSING"] = 2] = "CLOSING";
  StompSocketState2[StompSocketState2["CLOSED"] = 3] = "CLOSED";
})(StompSocketState || (StompSocketState = {}));
var ActivationState;
(function(ActivationState2) {
  ActivationState2[ActivationState2["ACTIVE"] = 0] = "ACTIVE";
  ActivationState2[ActivationState2["DEACTIVATING"] = 1] = "DEACTIVATING";
  ActivationState2[ActivationState2["INACTIVE"] = 2] = "INACTIVE";
})(ActivationState || (ActivationState = {}));
var ReconnectionTimeMode;
(function(ReconnectionTimeMode2) {
  ReconnectionTimeMode2[ReconnectionTimeMode2["LINEAR"] = 0] = "LINEAR";
  ReconnectionTimeMode2[ReconnectionTimeMode2["EXPONENTIAL"] = 1] = "EXPONENTIAL";
})(ReconnectionTimeMode || (ReconnectionTimeMode = {}));
var TickerStrategy;
(function(TickerStrategy2) {
  TickerStrategy2["Interval"] = "interval";
  TickerStrategy2["Worker"] = "worker";
})(TickerStrategy || (TickerStrategy = {}));

// node_modules/@stomp/stompjs/esm6/ticker.js
var Ticker = class {
  constructor(_interval, _strategy = TickerStrategy.Interval, _debug) {
    this._interval = _interval;
    this._strategy = _strategy;
    this._debug = _debug;
    this._workerScript = `
    var startTime = Date.now();
    setInterval(function() {
        self.postMessage(Date.now() - startTime);
    }, ${this._interval});
  `;
  }
  start(tick) {
    this.stop();
    if (this.shouldUseWorker()) {
      this.runWorker(tick);
    } else {
      this.runInterval(tick);
    }
  }
  stop() {
    this.disposeWorker();
    this.disposeInterval();
  }
  shouldUseWorker() {
    return typeof Worker !== "undefined" && this._strategy === TickerStrategy.Worker;
  }
  runWorker(tick) {
    this._debug("Using runWorker for outgoing pings");
    if (!this._worker) {
      this._worker = new Worker(URL.createObjectURL(new Blob([this._workerScript], { type: "text/javascript" })));
      this._worker.onmessage = (message) => tick(message.data);
    }
  }
  runInterval(tick) {
    this._debug("Using runInterval for outgoing pings");
    if (!this._timer) {
      const startTime = Date.now();
      this._timer = setInterval(() => {
        tick(Date.now() - startTime);
      }, this._interval);
    }
  }
  disposeWorker() {
    if (this._worker) {
      this._worker.terminate();
      delete this._worker;
      this._debug("Outgoing ping disposeWorker");
    }
  }
  disposeInterval() {
    if (this._timer) {
      clearInterval(this._timer);
      delete this._timer;
      this._debug("Outgoing ping disposeInterval");
    }
  }
};

// node_modules/@stomp/stompjs/esm6/versions.js
var Versions = class {
  /**
   * Takes an array of versions, typical elements '1.2', '1.1', or '1.0'
   *
   * You will be creating an instance of this class if you want to override
   * supported versions to be declared during STOMP handshake.
   */
  constructor(versions) {
    this.versions = versions;
  }
  /**
   * Used as part of CONNECT STOMP Frame
   */
  supportedVersions() {
    return this.versions.join(",");
  }
  /**
   * Used while creating a WebSocket
   */
  protocolVersions() {
    return this.versions.map((x) => `v${x.replace(".", "")}.stomp`);
  }
};
Versions.V1_0 = "1.0";
Versions.V1_1 = "1.1";
Versions.V1_2 = "1.2";
Versions.default = new Versions([
  Versions.V1_2,
  Versions.V1_1,
  Versions.V1_0
]);

// node_modules/@stomp/stompjs/esm6/stomp-handler.js
var StompHandler = class {
  get connectedVersion() {
    return this._connectedVersion;
  }
  get connected() {
    return this._connected;
  }
  constructor(_client, _webSocket, config) {
    this._client = _client;
    this._webSocket = _webSocket;
    this._connected = false;
    this._serverFrameHandlers = {
      // [CONNECTED Frame](https://stomp.github.com/stomp-specification-1.2.html#CONNECTED_Frame)
      CONNECTED: (frame) => {
        this.debug(`connected to server ${frame.headers.server}`);
        this._connected = true;
        this._connectedVersion = frame.headers.version;
        if (this._connectedVersion === Versions.V1_2) {
          this._escapeHeaderValues = true;
        }
        this._setupHeartbeat(frame.headers);
        this.onConnect(frame);
      },
      // [MESSAGE Frame](https://stomp.github.com/stomp-specification-1.2.html#MESSAGE)
      MESSAGE: (frame) => {
        const subscription = frame.headers.subscription;
        const onReceive = this._subscriptions[subscription] || this.onUnhandledMessage;
        const message = frame;
        const client = this;
        const messageId = this._connectedVersion === Versions.V1_2 ? message.headers.ack : message.headers["message-id"];
        message.ack = (headers = {}) => {
          return client.ack(messageId, subscription, headers);
        };
        message.nack = (headers = {}) => {
          return client.nack(messageId, subscription, headers);
        };
        onReceive(message);
      },
      // [RECEIPT Frame](https://stomp.github.com/stomp-specification-1.2.html#RECEIPT)
      RECEIPT: (frame) => {
        const callback = this._receiptWatchers[frame.headers["receipt-id"]];
        if (callback) {
          callback(frame);
          delete this._receiptWatchers[frame.headers["receipt-id"]];
        } else {
          this.onUnhandledReceipt(frame);
        }
      },
      // [ERROR Frame](https://stomp.github.com/stomp-specification-1.2.html#ERROR)
      ERROR: (frame) => {
        this.onStompError(frame);
      }
    };
    this._counter = 0;
    this._subscriptions = {};
    this._receiptWatchers = {};
    this._partialData = "";
    this._escapeHeaderValues = false;
    this._lastServerActivityTS = Date.now();
    this.debug = config.debug;
    this.stompVersions = config.stompVersions;
    this.connectHeaders = config.connectHeaders;
    this.disconnectHeaders = config.disconnectHeaders;
    this.heartbeatIncoming = config.heartbeatIncoming;
    this.heartbeatToleranceMultiplier = config.heartbeatGracePeriods;
    this.heartbeatOutgoing = config.heartbeatOutgoing;
    this.splitLargeFrames = config.splitLargeFrames;
    this.maxWebSocketChunkSize = config.maxWebSocketChunkSize;
    this.forceBinaryWSFrames = config.forceBinaryWSFrames;
    this.logRawCommunication = config.logRawCommunication;
    this.appendMissingNULLonIncoming = config.appendMissingNULLonIncoming;
    this.discardWebsocketOnCommFailure = config.discardWebsocketOnCommFailure;
    this.onConnect = config.onConnect;
    this.onDisconnect = config.onDisconnect;
    this.onStompError = config.onStompError;
    this.onWebSocketClose = config.onWebSocketClose;
    this.onWebSocketError = config.onWebSocketError;
    this.onUnhandledMessage = config.onUnhandledMessage;
    this.onUnhandledReceipt = config.onUnhandledReceipt;
    this.onUnhandledFrame = config.onUnhandledFrame;
    this.onHeartbeatReceived = config.onHeartbeatReceived;
    this.onHeartbeatLost = config.onHeartbeatLost;
  }
  start() {
    const parser = new Parser(
      // On Frame
      (rawFrame) => {
        const frame = FrameImpl.fromRawFrame(rawFrame, this._escapeHeaderValues);
        if (!this.logRawCommunication) {
          this.debug(`<<< ${frame}`);
        }
        const serverFrameHandler = this._serverFrameHandlers[frame.command] || this.onUnhandledFrame;
        serverFrameHandler(frame);
      },
      // On Incoming Ping
      () => {
        this.debug("<<< PONG");
        this.onHeartbeatReceived();
      }
    );
    this._webSocket.onmessage = (evt) => {
      this.debug("Received data");
      this._lastServerActivityTS = Date.now();
      if (this.logRawCommunication) {
        const rawChunkAsString = evt.data instanceof ArrayBuffer ? new TextDecoder().decode(evt.data) : evt.data;
        this.debug(`<<< ${rawChunkAsString}`);
      }
      parser.parseChunk(evt.data, this.appendMissingNULLonIncoming);
    };
    this._webSocket.onclose = (closeEvent) => {
      this.debug(`Connection closed to ${this._webSocket.url}`);
      this._cleanUp();
      this.onWebSocketClose(closeEvent);
    };
    this._webSocket.onerror = (errorEvent) => {
      this.onWebSocketError(errorEvent);
    };
    this._webSocket.onopen = () => {
      const connectHeaders = Object.assign({}, this.connectHeaders);
      this.debug("Web Socket Opened...");
      connectHeaders["accept-version"] = this.stompVersions.supportedVersions();
      connectHeaders["heart-beat"] = [
        this.heartbeatOutgoing,
        this.heartbeatIncoming
      ].join(",");
      this._transmit({ command: "CONNECT", headers: connectHeaders });
    };
  }
  _setupHeartbeat(headers) {
    if (headers.version !== Versions.V1_1 && headers.version !== Versions.V1_2) {
      return;
    }
    if (!headers["heart-beat"]) {
      return;
    }
    const [serverOutgoing, serverIncoming] = headers["heart-beat"].split(",").map((v) => parseInt(v, 10));
    if (this.heartbeatOutgoing !== 0 && serverIncoming !== 0) {
      const ttl = Math.max(this.heartbeatOutgoing, serverIncoming);
      this.debug(`send PING every ${ttl}ms`);
      this._pinger = new Ticker(ttl, this._client.heartbeatStrategy, this.debug);
      this._pinger.start(() => {
        if (this._webSocket.readyState === StompSocketState.OPEN) {
          this._webSocket.send(BYTE.LF);
          this.debug(">>> PING");
        }
      });
    }
    if (this.heartbeatIncoming !== 0 && serverOutgoing !== 0) {
      const ttl = Math.max(this.heartbeatIncoming, serverOutgoing);
      this.debug(`check PONG every ${ttl}ms`);
      this._ponger = setInterval(() => {
        const delta = Date.now() - this._lastServerActivityTS;
        if (delta > ttl * this.heartbeatToleranceMultiplier) {
          this.debug(`did not receive server activity for the last ${delta}ms`);
          this.onHeartbeatLost();
          this._closeOrDiscardWebsocket();
        }
      }, ttl);
    }
  }
  _closeOrDiscardWebsocket() {
    if (this.discardWebsocketOnCommFailure) {
      this.debug("Discarding websocket, the underlying socket may linger for a while");
      this.discardWebsocket();
    } else {
      this.debug("Issuing close on the websocket");
      this._closeWebsocket();
    }
  }
  forceDisconnect() {
    if (this._webSocket) {
      if (this._webSocket.readyState === StompSocketState.CONNECTING || this._webSocket.readyState === StompSocketState.OPEN) {
        this._closeOrDiscardWebsocket();
      }
    }
  }
  _closeWebsocket() {
    this._webSocket.onmessage = () => {
    };
    this._webSocket.close();
  }
  discardWebsocket() {
    if (typeof this._webSocket.terminate !== "function") {
      augmentWebsocket(this._webSocket, (msg) => this.debug(msg));
    }
    this._webSocket.terminate();
  }
  _transmit(params) {
    const { command, headers, body, binaryBody, skipContentLengthHeader } = params;
    const frame = new FrameImpl({
      command,
      headers,
      body,
      binaryBody,
      escapeHeaderValues: this._escapeHeaderValues,
      skipContentLengthHeader
    });
    let rawChunk = frame.serialize();
    if (this.logRawCommunication) {
      this.debug(`>>> ${rawChunk}`);
    } else {
      this.debug(`>>> ${frame}`);
    }
    if (this.forceBinaryWSFrames && typeof rawChunk === "string") {
      rawChunk = new TextEncoder().encode(rawChunk);
    }
    if (typeof rawChunk !== "string" || !this.splitLargeFrames) {
      this._webSocket.send(rawChunk);
    } else {
      let out = rawChunk;
      while (out.length > 0) {
        const chunk = out.substring(0, this.maxWebSocketChunkSize);
        out = out.substring(this.maxWebSocketChunkSize);
        this._webSocket.send(chunk);
        this.debug(`chunk sent = ${chunk.length}, remaining = ${out.length}`);
      }
    }
  }
  dispose() {
    if (this.connected) {
      try {
        const disconnectHeaders = Object.assign({}, this.disconnectHeaders);
        if (!disconnectHeaders.receipt) {
          disconnectHeaders.receipt = `close-${this._counter++}`;
        }
        this.watchForReceipt(disconnectHeaders.receipt, (frame) => {
          this._closeWebsocket();
          this._cleanUp();
          this.onDisconnect(frame);
        });
        this._transmit({ command: "DISCONNECT", headers: disconnectHeaders });
      } catch (error) {
        this.debug(`Ignoring error during disconnect ${error}`);
      }
    } else {
      if (this._webSocket.readyState === StompSocketState.CONNECTING || this._webSocket.readyState === StompSocketState.OPEN) {
        this._closeWebsocket();
      }
    }
  }
  _cleanUp() {
    this._connected = false;
    if (this._pinger) {
      this._pinger.stop();
      this._pinger = void 0;
    }
    if (this._ponger) {
      clearInterval(this._ponger);
      this._ponger = void 0;
    }
  }
  publish(params) {
    const { destination, headers, body, binaryBody, skipContentLengthHeader } = params;
    const hdrs = Object.assign({ destination }, headers);
    this._transmit({
      command: "SEND",
      headers: hdrs,
      body,
      binaryBody,
      skipContentLengthHeader
    });
  }
  watchForReceipt(receiptId, callback) {
    this._receiptWatchers[receiptId] = callback;
  }
  subscribe(destination, callback, headers = {}) {
    headers = Object.assign({}, headers);
    if (!headers.id) {
      headers.id = `sub-${this._counter++}`;
    }
    headers.destination = destination;
    this._subscriptions[headers.id] = callback;
    this._transmit({ command: "SUBSCRIBE", headers });
    const client = this;
    return {
      id: headers.id,
      unsubscribe(hdrs) {
        return client.unsubscribe(headers.id, hdrs);
      }
    };
  }
  unsubscribe(id, headers = {}) {
    headers = Object.assign({}, headers);
    delete this._subscriptions[id];
    headers.id = id;
    this._transmit({ command: "UNSUBSCRIBE", headers });
  }
  begin(transactionId) {
    const txId = transactionId || `tx-${this._counter++}`;
    this._transmit({
      command: "BEGIN",
      headers: {
        transaction: txId
      }
    });
    const client = this;
    return {
      id: txId,
      commit() {
        client.commit(txId);
      },
      abort() {
        client.abort(txId);
      }
    };
  }
  commit(transactionId) {
    this._transmit({
      command: "COMMIT",
      headers: {
        transaction: transactionId
      }
    });
  }
  abort(transactionId) {
    this._transmit({
      command: "ABORT",
      headers: {
        transaction: transactionId
      }
    });
  }
  ack(messageId, subscriptionId, headers = {}) {
    headers = Object.assign({}, headers);
    if (this._connectedVersion === Versions.V1_2) {
      headers.id = messageId;
    } else {
      headers["message-id"] = messageId;
    }
    headers.subscription = subscriptionId;
    this._transmit({ command: "ACK", headers });
  }
  nack(messageId, subscriptionId, headers = {}) {
    headers = Object.assign({}, headers);
    if (this._connectedVersion === Versions.V1_2) {
      headers.id = messageId;
    } else {
      headers["message-id"] = messageId;
    }
    headers.subscription = subscriptionId;
    return this._transmit({ command: "NACK", headers });
  }
};

// node_modules/@stomp/stompjs/esm6/client.js
var Client = class {
  /**
   * Provides access to the underlying WebSocket instance.
   * This property is **read-only**.
   *
   * Example:
   * ```javascript
   * const webSocket = client.webSocket;
   * if (webSocket) {
   *   console.log('WebSocket is connected:', webSocket.readyState === WebSocket.OPEN);
   * }
   * ```
   *
   * **Caution:**
   * Directly interacting with the WebSocket instance (e.g., sending or receiving frames)
   * can interfere with the proper functioning of this library. Such actions may cause
   * unexpected behavior, disconnections, or invalid state in the library's internal mechanisms.
   *
   * Instead, use the library's provided methods to manage STOMP communication.
   *
   * @returns The WebSocket instance used by the STOMP handler, or `undefined` if not connected.
   */
  get webSocket() {
    return this._stompHandler?._webSocket;
  }
  /**
   * Allows customization of the disconnection headers.
   *
   * Any changes made during an active session will also be applied immediately.
   *
   * Example:
   * ```javascript
   * client.disconnectHeaders = {
   *   receipt: 'custom-receipt-id'
   * };
   * ```
   */
  get disconnectHeaders() {
    return this._disconnectHeaders;
  }
  set disconnectHeaders(value) {
    this._disconnectHeaders = value;
    if (this._stompHandler) {
      this._stompHandler.disconnectHeaders = this._disconnectHeaders;
    }
  }
  /**
   * Indicates whether there is an active connection to the STOMP broker.
   *
   * Usage:
   * ```javascript
   * if (client.connected) {
   *   console.log('Client is connected to the broker.');
   * } else {
   *   console.log('No connection to the broker.');
   * }
   * ```
   *
   * @returns `true` if the client is currently connected, `false` otherwise.
   */
  get connected() {
    return !!this._stompHandler && this._stompHandler.connected;
  }
  /**
   * The version of the STOMP protocol negotiated with the server during connection.
   *
   * This is a **read-only** property and reflects the negotiated protocol version after
   * a successful connection.
   *
   * Example:
   * ```javascript
   * console.log('Connected STOMP version:', client.connectedVersion);
   * ```
   *
   * @returns The negotiated STOMP protocol version or `undefined` if not connected.
   */
  get connectedVersion() {
    return this._stompHandler ? this._stompHandler.connectedVersion : void 0;
  }
  /**
   * Indicates whether the client is currently active.
   *
   * A client is considered active if it is connected or actively attempting to reconnect.
   *
   * Example:
   * ```javascript
   * if (client.active) {
   *   console.log('The client is active.');
   * } else {
   *   console.log('The client is inactive.');
   * }
   * ```
   *
   * @returns `true` if the client is active, otherwise `false`.
   */
  get active() {
    return this.state === ActivationState.ACTIVE;
  }
  _changeState(state) {
    this.state = state;
    this.onChangeState(state);
  }
  /**
   * Constructs a new STOMP client instance.
   *
   * The constructor initializes default values and sets up no-op callbacks for all events.
   * Configuration can be passed during construction, or updated later using `configure`.
   *
   * Example:
   * ```javascript
   * const client = new Client({
   *   brokerURL: 'wss://broker.example.com',
   *   reconnectDelay: 5000
   * });
   * ```
   *
   * @param conf Optional configuration object to initialize the client with.
   */
  constructor(conf = {}) {
    this.stompVersions = Versions.default;
    this.connectionTimeout = 0;
    this.reconnectDelay = 5e3;
    this._nextReconnectDelay = 0;
    this.maxReconnectDelay = 15 * 60 * 1e3;
    this.reconnectTimeMode = ReconnectionTimeMode.LINEAR;
    this.heartbeatIncoming = 1e4;
    this.heartbeatToleranceMultiplier = 2;
    this.heartbeatOutgoing = 1e4;
    this.heartbeatStrategy = TickerStrategy.Interval;
    this.splitLargeFrames = false;
    this.maxWebSocketChunkSize = 8 * 1024;
    this.forceBinaryWSFrames = false;
    this.appendMissingNULLonIncoming = false;
    this.discardWebsocketOnCommFailure = false;
    this.state = ActivationState.INACTIVE;
    const noOp = () => {
    };
    this.debug = noOp;
    this.beforeConnect = noOp;
    this.onConnect = noOp;
    this.onDisconnect = noOp;
    this.onUnhandledMessage = noOp;
    this.onUnhandledReceipt = noOp;
    this.onUnhandledFrame = noOp;
    this.onHeartbeatReceived = noOp;
    this.onHeartbeatLost = noOp;
    this.onStompError = noOp;
    this.onWebSocketClose = noOp;
    this.onWebSocketError = noOp;
    this.logRawCommunication = false;
    this.onChangeState = noOp;
    this.connectHeaders = {};
    this._disconnectHeaders = {};
    this.configure(conf);
  }
  /**
   * Updates the client's configuration.
   *
   * All properties in the provided configuration object will override the current settings.
   *
   * Additionally, a warning is logged if `maxReconnectDelay` is configured to a
   * value lower than `reconnectDelay`, and `maxReconnectDelay` is adjusted to match `reconnectDelay`.
   *
   * Example:
   * ```javascript
   * client.configure({
   *   reconnectDelay: 3000,
   *   maxReconnectDelay: 10000
   * });
   * ```
   *
   * @param conf Configuration object containing the new settings.
   */
  configure(conf) {
    Object.assign(this, conf);
    if (this.maxReconnectDelay > 0 && this.maxReconnectDelay < this.reconnectDelay) {
      this.debug(`Warning: maxReconnectDelay (${this.maxReconnectDelay}ms) is less than reconnectDelay (${this.reconnectDelay}ms). Using reconnectDelay as the maxReconnectDelay delay.`);
      this.maxReconnectDelay = this.reconnectDelay;
    }
  }
  /**
   * Activates the client, initiating a connection to the STOMP broker.
   *
   * On activation, the client attempts to connect and sets its state to `ACTIVE`. If the connection
   * is lost, it will automatically retry based on `reconnectDelay` or `maxReconnectDelay`. If
   * `reconnectTimeMode` is set to `EXPONENTIAL`, the reconnect delay increases exponentially.
   *
   * To stop reconnection attempts and disconnect, call [Client#deactivate]{@link Client#deactivate}.
   *
   * Example:
   * ```javascript
   * client.activate(); // Connect to the broker
   * ```
   *
   * If the client is currently `DEACTIVATING`, connection is delayed until the deactivation process completes.
   */
  activate() {
    const _activate = () => {
      if (this.active) {
        this.debug("Already ACTIVE, ignoring request to activate");
        return;
      }
      this._changeState(ActivationState.ACTIVE);
      this._nextReconnectDelay = this.reconnectDelay;
      this._connect();
    };
    if (this.state === ActivationState.DEACTIVATING) {
      this.debug("Waiting for deactivation to finish before activating");
      this.deactivate().then(() => {
        _activate();
      });
    } else {
      _activate();
    }
  }
  _connect() {
    return __async(this, null, function* () {
      yield this.beforeConnect(this);
      if (this._stompHandler) {
        this.debug("There is already a stompHandler, skipping the call to connect");
        return;
      }
      if (!this.active) {
        this.debug("Client has been marked inactive, will not attempt to connect");
        return;
      }
      if (this.connectionTimeout > 0) {
        if (this._connectionWatcher) {
          clearTimeout(this._connectionWatcher);
        }
        this._connectionWatcher = setTimeout(() => {
          if (this.connected) {
            return;
          }
          this.debug(`Connection not established in ${this.connectionTimeout}ms, closing socket`);
          this.forceDisconnect();
        }, this.connectionTimeout);
      }
      this.debug("Opening Web Socket...");
      const webSocket = this._createWebSocket();
      this._stompHandler = new StompHandler(this, webSocket, {
        debug: this.debug,
        stompVersions: this.stompVersions,
        connectHeaders: this.connectHeaders,
        disconnectHeaders: this._disconnectHeaders,
        heartbeatIncoming: this.heartbeatIncoming,
        heartbeatGracePeriods: this.heartbeatToleranceMultiplier,
        heartbeatOutgoing: this.heartbeatOutgoing,
        heartbeatStrategy: this.heartbeatStrategy,
        splitLargeFrames: this.splitLargeFrames,
        maxWebSocketChunkSize: this.maxWebSocketChunkSize,
        forceBinaryWSFrames: this.forceBinaryWSFrames,
        logRawCommunication: this.logRawCommunication,
        appendMissingNULLonIncoming: this.appendMissingNULLonIncoming,
        discardWebsocketOnCommFailure: this.discardWebsocketOnCommFailure,
        onConnect: (frame) => {
          if (this._connectionWatcher) {
            clearTimeout(this._connectionWatcher);
            this._connectionWatcher = void 0;
          }
          this._nextReconnectDelay = this.reconnectDelay;
          if (!this.active) {
            this.debug("STOMP got connected while deactivate was issued, will disconnect now");
            this._disposeStompHandler();
            return;
          }
          this.onConnect(frame);
        },
        onDisconnect: (frame) => {
          this.onDisconnect(frame);
        },
        onStompError: (frame) => {
          this.onStompError(frame);
        },
        onWebSocketClose: (evt) => {
          this._stompHandler = void 0;
          if (this.state === ActivationState.DEACTIVATING) {
            this._changeState(ActivationState.INACTIVE);
          }
          this.onWebSocketClose(evt);
          if (this.active) {
            this._schedule_reconnect();
          }
        },
        onWebSocketError: (evt) => {
          this.onWebSocketError(evt);
        },
        onUnhandledMessage: (message) => {
          this.onUnhandledMessage(message);
        },
        onUnhandledReceipt: (frame) => {
          this.onUnhandledReceipt(frame);
        },
        onUnhandledFrame: (frame) => {
          this.onUnhandledFrame(frame);
        },
        onHeartbeatReceived: () => {
          this.onHeartbeatReceived();
        },
        onHeartbeatLost: () => {
          this.onHeartbeatLost();
        }
      });
      this._stompHandler.start();
    });
  }
  _createWebSocket() {
    let webSocket;
    if (this.webSocketFactory) {
      webSocket = this.webSocketFactory();
    } else if (this.brokerURL) {
      webSocket = new WebSocket(this.brokerURL, this.stompVersions.protocolVersions());
    } else {
      throw new Error("Either brokerURL or webSocketFactory must be provided");
    }
    webSocket.binaryType = "arraybuffer";
    return webSocket;
  }
  _schedule_reconnect() {
    if (this._nextReconnectDelay > 0) {
      this.debug(`STOMP: scheduling reconnection in ${this._nextReconnectDelay}ms`);
      this._reconnector = setTimeout(() => {
        if (this.reconnectTimeMode === ReconnectionTimeMode.EXPONENTIAL) {
          this._nextReconnectDelay = this._nextReconnectDelay * 2;
          if (this.maxReconnectDelay !== 0) {
            this._nextReconnectDelay = Math.min(this._nextReconnectDelay, this.maxReconnectDelay);
          }
        }
        this._connect();
      }, this._nextReconnectDelay);
    }
  }
  /**
   * Disconnects the client and stops the automatic reconnection loop.
   *
   * If there is an active STOMP connection at the time of invocation, the appropriate callbacks
   * will be triggered during the shutdown sequence. Once deactivated, the client will enter the
   * `INACTIVE` state, and no further reconnection attempts will be made.
   *
   * **Behavior**:
   * - If there is no active WebSocket connection, this method resolves immediately.
   * - If there is an active connection, the method waits for the underlying WebSocket
   *   to properly close before resolving.
   * - Multiple calls to this method are safe. Each invocation resolves upon completion.
   * - To reactivate, call [Client#activate]{@link Client#activate}.
   *
   * **Experimental Option:**
   * - By specifying the `force: true` option, the WebSocket connection is discarded immediately,
   *   bypassing both the STOMP and WebSocket shutdown sequences.
   * - **Caution:** Using `force: true` may leave the WebSocket in an inconsistent state,
   *   and brokers may not immediately detect the termination.
   *
   * Example:
   * ```javascript
   * // Graceful disconnect
   * await client.deactivate();
   *
   * // Forced disconnect to speed up shutdown when the connection is stale
   * await client.deactivate({ force: true });
   * ```
   *
   * @param options Configuration options for deactivation. Use `force: true` for immediate shutdown.
   * @returns A Promise that resolves when the deactivation process completes.
   */
  deactivate() {
    return __async(this, arguments, function* (options = {}) {
      const force = options.force || false;
      const needToDispose = this.active;
      let retPromise;
      if (this.state === ActivationState.INACTIVE) {
        this.debug(`Already INACTIVE, nothing more to do`);
        return Promise.resolve();
      }
      this._changeState(ActivationState.DEACTIVATING);
      this._nextReconnectDelay = 0;
      if (this._reconnector) {
        clearTimeout(this._reconnector);
        this._reconnector = void 0;
      }
      if (this._stompHandler && // @ts-ignore - if there is a _stompHandler, there is the webSocket
      this.webSocket.readyState !== StompSocketState.CLOSED) {
        const origOnWebSocketClose = this._stompHandler.onWebSocketClose;
        retPromise = new Promise((resolve, reject) => {
          this._stompHandler.onWebSocketClose = (evt) => {
            origOnWebSocketClose(evt);
            resolve();
          };
        });
      } else {
        this._changeState(ActivationState.INACTIVE);
        return Promise.resolve();
      }
      if (force) {
        this._stompHandler?.discardWebsocket();
      } else if (needToDispose) {
        this._disposeStompHandler();
      }
      return retPromise;
    });
  }
  /**
   * Forces a disconnect by directly closing the WebSocket.
   *
   * Unlike a normal disconnect, this does not send a DISCONNECT sequence to the broker but
   * instead closes the WebSocket connection directly. After forcing a disconnect, the client
   * will automatically attempt to reconnect based on its `reconnectDelay` configuration.
   *
   * **Note:** To prevent further reconnect attempts, call [Client#deactivate]{@link Client#deactivate}.
   *
   * Example:
   * ```javascript
   * client.forceDisconnect();
   * ```
   */
  forceDisconnect() {
    if (this._stompHandler) {
      this._stompHandler.forceDisconnect();
    }
  }
  _disposeStompHandler() {
    if (this._stompHandler) {
      this._stompHandler.dispose();
    }
  }
  /**
   * Sends a message to the specified destination on the STOMP broker.
   *
   * The `body` must be a `string`. For non-string payloads (e.g., JSON), encode it as a string before sending.
   * If sending binary data, use the `binaryBody` parameter as a [Uint8Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array).
   *
   * **Content-Length Behavior**:
   * - For non-binary messages, the `content-length` header is added by default.
   * - The `content-length` header can be skipped for text frames by setting `skipContentLengthHeader: true` in the parameters.
   * - For binary messages, the `content-length` header is always included.
   *
   * **Notes**:
   * - Ensure that brokers support binary frames before using `binaryBody`.
   * - Sending messages with NULL octets and missing `content-length` headers can cause brokers to disconnect and throw errors.
   *
   * Example:
   * ```javascript
   * // Basic text message
   * client.publish({ destination: "/queue/test", body: "Hello, STOMP" });
   *
   * // Text message with additional headers
   * client.publish({ destination: "/queue/test", headers: { priority: 9 }, body: "Hello, STOMP" });
   *
   * // Skip content-length header
   * client.publish({ destination: "/queue/test", body: "Hello, STOMP", skipContentLengthHeader: true });
   *
   * // Binary message
   * const binaryData = new Uint8Array([1, 2, 3, 4]);
   * client.publish({
   *   destination: '/topic/special',
   *   binaryBody: binaryData,
   *   headers: { 'content-type': 'application/octet-stream' }
   * });
   * ```
   */
  publish(params) {
    this._checkConnection();
    this._stompHandler.publish(params);
  }
  _checkConnection() {
    if (!this.connected) {
      throw new TypeError("There is no underlying STOMP connection");
    }
  }
  /**
   * Monitors for a receipt acknowledgment from the broker for specific operations.
   *
   * Add a `receipt` header to the operation (like subscribe or publish), and use this method with
   * the same receipt ID to detect when the broker has acknowledged the operation's completion.
   *
   * The callback is invoked with the corresponding {@link IFrame} when the receipt is received.
   *
   * Example:
   * ```javascript
   * const receiptId = "unique-receipt-id";
   *
   * client.watchForReceipt(receiptId, (frame) => {
   *   console.log("Operation acknowledged by the broker:", frame);
   * });
   *
   * // Attach the receipt header to an operation
   * client.publish({ destination: "/queue/test", headers: { receipt: receiptId }, body: "Hello" });
   * ```
   *
   * @param receiptId Unique identifier for the receipt.
   * @param callback Callback function invoked on receiving the RECEIPT frame.
   */
  watchForReceipt(receiptId, callback) {
    this._checkConnection();
    this._stompHandler.watchForReceipt(receiptId, callback);
  }
  /**
   * Subscribes to a destination on the STOMP broker.
   *
   * The callback is triggered for each message received from the subscribed destination. The message
   * is passed as an {@link IMessage} instance.
   *
   * **Subscription ID**:
   * - If no `id` is provided in `headers`, the library generates a unique subscription ID automatically.
   * - Provide an explicit `id` in `headers` if you wish to manage the subscription ID manually.
   *
   * Example:
   * ```javascript
   * const callback = (message) => {
   *   console.log("Received message:", message.body);
   * };
   *
   * // Auto-generated subscription ID
   * const subscription = client.subscribe("/queue/test", callback);
   *
   * // Explicit subscription ID
   * const mySubId = "my-subscription-id";
   * const subscription = client.subscribe("/queue/test", callback, { id: mySubId });
   * ```
   *
   * @param destination Destination to subscribe to.
   * @param callback Function invoked for each received message.
   * @param headers Optional headers for subscription, such as `id`.
   * @returns A {@link StompSubscription} which can be used to manage the subscription.
   */
  subscribe(destination, callback, headers = {}) {
    this._checkConnection();
    return this._stompHandler.subscribe(destination, callback, headers);
  }
  /**
   * Unsubscribes from a subscription on the STOMP broker.
   *
   * Prefer using the `unsubscribe` method directly on the {@link StompSubscription} returned from `subscribe` for cleaner management:
   * ```javascript
   * const subscription = client.subscribe("/queue/test", callback);
   * // Unsubscribe using the subscription object
   * subscription.unsubscribe();
   * ```
   *
   * This method can also be used directly with the subscription ID.
   *
   * Example:
   * ```javascript
   * client.unsubscribe("my-subscription-id");
   * ```
   *
   * @param id Subscription ID to unsubscribe.
   * @param headers Optional headers to pass for the UNSUBSCRIBE frame.
   */
  unsubscribe(id, headers = {}) {
    this._checkConnection();
    this._stompHandler.unsubscribe(id, headers);
  }
  /**
   * Starts a new transaction. The returned {@link ITransaction} object provides
   * methods for [commit]{@link ITransaction#commit} and [abort]{@link ITransaction#abort}.
   *
   * If `transactionId` is not provided, the library generates a unique ID internally.
   *
   * Example:
   * ```javascript
   * const tx = client.begin(); // Auto-generated ID
   *
   * // Or explicitly specify a transaction ID
   * const tx = client.begin("my-transaction-id");
   * ```
   *
   * @param transactionId Optional transaction ID.
   * @returns An instance of {@link ITransaction}.
   */
  begin(transactionId) {
    this._checkConnection();
    return this._stompHandler.begin(transactionId);
  }
  /**
   * Commits a transaction.
   *
   * It is strongly recommended to call [commit]{@link ITransaction#commit} on
   * the transaction object returned by [client#begin]{@link Client#begin}.
   *
   * Example:
   * ```javascript
   * const tx = client.begin();
   * // Perform operations under this transaction
   * tx.commit();
   * ```
   *
   * @param transactionId The ID of the transaction to commit.
   */
  commit(transactionId) {
    this._checkConnection();
    this._stompHandler.commit(transactionId);
  }
  /**
   * Aborts a transaction.
   *
   * It is strongly recommended to call [abort]{@link ITransaction#abort} directly
   * on the transaction object returned by [client#begin]{@link Client#begin}.
   *
   * Example:
   * ```javascript
   * const tx = client.begin();
   * // Perform operations under this transaction
   * tx.abort(); // Abort the transaction
   * ```
   *
   * @param transactionId The ID of the transaction to abort.
   */
  abort(transactionId) {
    this._checkConnection();
    this._stompHandler.abort(transactionId);
  }
  /**
   * Acknowledges receipt of a message. Typically, this should be done by calling
   * [ack]{@link IMessage#ack} directly on the {@link IMessage} instance passed
   * to the subscription callback.
   *
   * Example:
   * ```javascript
   * const callback = (message) => {
   *   // Process the message
   *   message.ack(); // Acknowledge the message
   * };
   *
   * client.subscribe("/queue/example", callback, { ack: "client" });
   * ```
   *
   * @param messageId The ID of the message to acknowledge.
   * @param subscriptionId The ID of the subscription.
   * @param headers Optional headers for the acknowledgment frame.
   */
  ack(messageId, subscriptionId, headers = {}) {
    this._checkConnection();
    this._stompHandler.ack(messageId, subscriptionId, headers);
  }
  /**
   * Rejects a message (negative acknowledgment). Like acknowledgments, this should
   * typically be done by calling [nack]{@link IMessage#nack} directly on the {@link IMessage}
   * instance passed to the subscription callback.
   *
   * Example:
   * ```javascript
   * const callback = (message) => {
   *   // Process the message
   *   if (isError(message)) {
   *     message.nack(); // Reject the message
   *   }
   * };
   *
   * client.subscribe("/queue/example", callback, { ack: "client" });
   * ```
   *
   * @param messageId The ID of the message to negatively acknowledge.
   * @param subscriptionId The ID of the subscription.
   * @param headers Optional headers for the NACK frame.
   */
  nack(messageId, subscriptionId, headers = {}) {
    this._checkConnection();
    this._stompHandler.nack(messageId, subscriptionId, headers);
  }
};

// node_modules/@stomp/stompjs/esm6/stomp-headers.js
var StompHeaders = class {
};

// node_modules/@stomp/stompjs/esm6/compatibility/heartbeat-info.js
var HeartbeatInfo = class {
  constructor(client) {
    this.client = client;
  }
  get outgoing() {
    return this.client.heartbeatOutgoing;
  }
  set outgoing(value) {
    this.client.heartbeatOutgoing = value;
  }
  get incoming() {
    return this.client.heartbeatIncoming;
  }
  set incoming(value) {
    this.client.heartbeatIncoming = value;
  }
};

// node_modules/@stomp/stompjs/esm6/compatibility/compat-client.js
var CompatClient = class extends Client {
  /**
   * Available for backward compatibility, please shift to using {@link Client}
   * and [Client#webSocketFactory]{@link Client#webSocketFactory}.
   *
   * **Deprecated**
   *
   * @internal
   */
  constructor(webSocketFactory) {
    super();
    this.maxWebSocketFrameSize = 16 * 1024;
    this._heartbeatInfo = new HeartbeatInfo(this);
    this.reconnect_delay = 0;
    this.webSocketFactory = webSocketFactory;
    this.debug = (...message) => {
      console.log(...message);
    };
  }
  _parseConnect(...args) {
    let closeEventCallback;
    let connectCallback;
    let errorCallback;
    let headers = {};
    if (args.length < 2) {
      throw new Error("Connect requires at least 2 arguments");
    }
    if (typeof args[1] === "function") {
      [headers, connectCallback, errorCallback, closeEventCallback] = args;
    } else {
      switch (args.length) {
        case 6:
          [
            headers.login,
            headers.passcode,
            connectCallback,
            errorCallback,
            closeEventCallback,
            headers.host
          ] = args;
          break;
        default:
          [
            headers.login,
            headers.passcode,
            connectCallback,
            errorCallback,
            closeEventCallback
          ] = args;
      }
    }
    return [headers, connectCallback, errorCallback, closeEventCallback];
  }
  /**
   * Available for backward compatibility, please shift to using [Client#activate]{@link Client#activate}.
   *
   * **Deprecated**
   *
   * The `connect` method accepts different number of arguments and types. See the Overloads list. Use the
   * version with headers to pass your broker specific options.
   *
   * overloads:
   * - connect(headers, connectCallback)
   * - connect(headers, connectCallback, errorCallback)
   * - connect(login, passcode, connectCallback)
   * - connect(login, passcode, connectCallback, errorCallback)
   * - connect(login, passcode, connectCallback, errorCallback, closeEventCallback)
   * - connect(login, passcode, connectCallback, errorCallback, closeEventCallback, host)
   *
   * params:
   * - headers, see [Client#connectHeaders]{@link Client#connectHeaders}
   * - connectCallback, see [Client#onConnect]{@link Client#onConnect}
   * - errorCallback, see [Client#onStompError]{@link Client#onStompError}
   * - closeEventCallback, see [Client#onWebSocketClose]{@link Client#onWebSocketClose}
   * - login [String], see [Client#connectHeaders](../classes/Client.html#connectHeaders)
   * - passcode [String], [Client#connectHeaders](../classes/Client.html#connectHeaders)
   * - host [String], see [Client#connectHeaders](../classes/Client.html#connectHeaders)
   *
   * To upgrade, please follow the [Upgrade Guide](../additional-documentation/upgrading.html)
   */
  connect(...args) {
    const out = this._parseConnect(...args);
    if (out[0]) {
      this.connectHeaders = out[0];
    }
    if (out[1]) {
      this.onConnect = out[1];
    }
    if (out[2]) {
      this.onStompError = out[2];
    }
    if (out[3]) {
      this.onWebSocketClose = out[3];
    }
    super.activate();
  }
  /**
   * Available for backward compatibility, please shift to using [Client#deactivate]{@link Client#deactivate}.
   *
   * **Deprecated**
   *
   * See:
   * [Client#onDisconnect]{@link Client#onDisconnect}, and
   * [Client#disconnectHeaders]{@link Client#disconnectHeaders}
   *
   * To upgrade, please follow the [Upgrade Guide](../additional-documentation/upgrading.html)
   */
  disconnect(disconnectCallback, headers = {}) {
    if (disconnectCallback) {
      this.onDisconnect = disconnectCallback;
    }
    this.disconnectHeaders = headers;
    super.deactivate();
  }
  /**
   * Available for backward compatibility, use [Client#publish]{@link Client#publish}.
   *
   * Send a message to a named destination. Refer to your STOMP broker documentation for types
   * and naming of destinations. The headers will, typically, be available to the subscriber.
   * However, there may be special purpose headers corresponding to your STOMP broker.
   *
   *  **Deprecated**, use [Client#publish]{@link Client#publish}
   *
   * Note: Body must be String. You will need to covert the payload to string in case it is not string (e.g. JSON)
   *
   * ```javascript
   *        client.send("/queue/test", {priority: 9}, "Hello, STOMP");
   *
   *        // If you want to send a message with a body, you must also pass the headers argument.
   *        client.send("/queue/test", {}, "Hello, STOMP");
   * ```
   *
   * To upgrade, please follow the [Upgrade Guide](../additional-documentation/upgrading.html)
   */
  send(destination, headers = {}, body = "") {
    headers = Object.assign({}, headers);
    const skipContentLengthHeader = headers["content-length"] === false;
    if (skipContentLengthHeader) {
      delete headers["content-length"];
    }
    this.publish({
      destination,
      headers,
      body,
      skipContentLengthHeader
    });
  }
  /**
   * Available for backward compatibility, renamed to [Client#reconnectDelay]{@link Client#reconnectDelay}.
   *
   * **Deprecated**
   */
  set reconnect_delay(value) {
    this.reconnectDelay = value;
  }
  /**
   * Available for backward compatibility, renamed to [Client#webSocket]{@link Client#webSocket}.
   *
   * **Deprecated**
   */
  get ws() {
    return this.webSocket;
  }
  /**
   * Available for backward compatibility, renamed to [Client#connectedVersion]{@link Client#connectedVersion}.
   *
   * **Deprecated**
   */
  get version() {
    return this.connectedVersion;
  }
  /**
   * Available for backward compatibility, renamed to [Client#onUnhandledMessage]{@link Client#onUnhandledMessage}.
   *
   * **Deprecated**
   */
  get onreceive() {
    return this.onUnhandledMessage;
  }
  /**
   * Available for backward compatibility, renamed to [Client#onUnhandledMessage]{@link Client#onUnhandledMessage}.
   *
   * **Deprecated**
   */
  set onreceive(value) {
    this.onUnhandledMessage = value;
  }
  /**
   * Available for backward compatibility, renamed to [Client#onUnhandledReceipt]{@link Client#onUnhandledReceipt}.
   * Prefer using [Client#watchForReceipt]{@link Client#watchForReceipt}.
   *
   * **Deprecated**
   */
  get onreceipt() {
    return this.onUnhandledReceipt;
  }
  /**
   * Available for backward compatibility, renamed to [Client#onUnhandledReceipt]{@link Client#onUnhandledReceipt}.
   *
   * **Deprecated**
   */
  set onreceipt(value) {
    this.onUnhandledReceipt = value;
  }
  /**
   * Available for backward compatibility, renamed to [Client#heartbeatIncoming]{@link Client#heartbeatIncoming}
   * [Client#heartbeatOutgoing]{@link Client#heartbeatOutgoing}.
   *
   * **Deprecated**
   */
  get heartbeat() {
    return this._heartbeatInfo;
  }
  /**
   * Available for backward compatibility, renamed to [Client#heartbeatIncoming]{@link Client#heartbeatIncoming}
   * [Client#heartbeatOutgoing]{@link Client#heartbeatOutgoing}.
   *
   * **Deprecated**
   */
  set heartbeat(value) {
    this.heartbeatIncoming = value.incoming;
    this.heartbeatOutgoing = value.outgoing;
  }
};

// node_modules/@stomp/stompjs/esm6/compatibility/stomp.js
var Stomp = class _Stomp {
  /**
   * This method creates a WebSocket client that is connected to
   * the STOMP server located at the url.
   *
   * ```javascript
   *        var url = "ws://localhost:61614/stomp";
   *        var client = Stomp.client(url);
   * ```
   *
   * **Deprecated**
   *
   * It will be removed in next major version. Please switch to {@link Client}
   * using [Client#brokerURL]{@link Client#brokerURL}.
   */
  static client(url, protocols) {
    if (protocols == null) {
      protocols = Versions.default.protocolVersions();
    }
    const wsFn = () => {
      const klass = _Stomp.WebSocketClass || WebSocket;
      return new klass(url, protocols);
    };
    return new CompatClient(wsFn);
  }
  /**
   * This method is an alternative to [Stomp#client]{@link Stomp#client} to let the user
   * specify the WebSocket to use (either a standard HTML5 WebSocket or
   * a similar object).
   *
   * In order to support reconnection, the function Client._connect should be callable more than once.
   * While reconnecting
   * a new instance of underlying transport (TCP Socket, WebSocket or SockJS) will be needed. So, this function
   * alternatively allows passing a function that should return a new instance of the underlying socket.
   *
   * ```javascript
   *        var client = Stomp.over(function(){
   *          return new WebSocket('ws://localhost:15674/ws')
   *        });
   * ```
   *
   * **Deprecated**
   *
   * It will be removed in next major version. Please switch to {@link Client}
   * using [Client#webSocketFactory]{@link Client#webSocketFactory}.
   */
  static over(ws) {
    let wsFn;
    if (typeof ws === "function") {
      wsFn = ws;
    } else {
      console.warn("Stomp.over did not receive a factory, auto reconnect will not work. Please see https://stomp-js.github.io/api-docs/latest/classes/Stomp.html#over");
      wsFn = () => ws;
    }
    return new CompatClient(wsFn);
  }
};
Stomp.WebSocketClass = null;

// node_modules/@stomp/rx-stomp/esm6/rx-stomp-state.js
var RxStompState;
(function(RxStompState2) {
  RxStompState2[RxStompState2["CONNECTING"] = 0] = "CONNECTING";
  RxStompState2[RxStompState2["OPEN"] = 1] = "OPEN";
  RxStompState2[RxStompState2["CLOSING"] = 2] = "CLOSING";
  RxStompState2[RxStompState2["CLOSED"] = 3] = "CLOSED";
})(RxStompState || (RxStompState = {}));

// node_modules/@stomp/rx-stomp/esm6/rx-stomp.js
var RxStomp = class {
  /**
   * Instance of actual
   * [@stomp/stompjs]{@link https://github.com/stomp-js/stompjs}
   * {@link Client}.
   *
   * **Be careful in calling methods on it directly - you may get unintended consequences.**
   */
  get stompClient() {
    return this._stompClient;
  }
  /**
   * Constructor
   *
   * @param stompClient Optional existing {@link Client} to wrap. If omitted, a new instance
   * will be created internally.
   *
   * Tip: Injecting a pre-configured Client is useful for advanced customization or testing.
   */
  constructor(stompClient) {
    this._queuedMessages = [];
    this._stompClient = stompClient ? stompClient : new Client();
    const noOp = () => {
    };
    this._beforeConnect = noOp;
    this._correlateErrors = () => void 0;
    this._debug = noOp;
    this._connectionStatePre$ = new BehaviorSubject(RxStompState.CLOSED);
    this._connectedPre$ = this._connectionStatePre$.pipe(filter((currentState) => {
      return currentState === RxStompState.OPEN;
    }));
    this.connectionState$ = new BehaviorSubject(RxStompState.CLOSED);
    this.connected$ = this.connectionState$.pipe(filter((currentState) => {
      return currentState === RxStompState.OPEN;
    }));
    this.connected$.subscribe(() => {
      this._sendQueuedMessages();
    });
    this._serverHeadersBehaviourSubject$ = new BehaviorSubject(null);
    this.serverHeaders$ = this._serverHeadersBehaviourSubject$.pipe(filter((headers) => {
      return headers !== null;
    }));
    this.stompErrors$ = new Subject();
    this.unhandledMessage$ = new Subject();
    this.unhandledReceipts$ = new Subject();
    this.unhandledFrame$ = new Subject();
    this.webSocketErrors$ = new Subject();
  }
  /**
   * Apply configuration to the underlying STOMP client.
   *
   * - Safe to call multiple times; each call merges with existing configuration.
   * - `beforeConnect` and `correlateErrors` are handled by RxStomp and removed
   *   from the object passed to the underlying {@link Client}.
   * - Unless otherwise documented by @stomp/stompjs, most options take effect
   *   on the next (re)connection.
   *
   * Example:
   * ```typescript
   * const rxStomp = new RxStomp();
   * rxStomp.configure({
   *   brokerURL: 'ws://127.0.0.1:15674/ws',
   *   connectHeaders: {
   *     login: 'guest',
   *     passcode: 'guest'
   *     },
   *   heartbeatIncoming: 0,
   *   heartbeatOutgoing: 20000,
   *   reconnectDelay: 200,
   *   debug: (msg) => console.log(new Date(), msg),
   * });
   * rxStomp.activate();
   * ```
   *
   * Maps to: [Client#configure]{@link Client#configure}.
   */
  configure(rxStompConfig) {
    const stompConfig = Object.assign({}, rxStompConfig);
    if (stompConfig.beforeConnect) {
      this._beforeConnect = stompConfig.beforeConnect;
      delete stompConfig.beforeConnect;
    }
    if (stompConfig.correlateErrors) {
      this._correlateErrors = stompConfig.correlateErrors;
      delete stompConfig.correlateErrors;
    }
    this._stompClient.configure(stompConfig);
    if (stompConfig.debug) {
      this._debug = stompConfig.debug;
    }
  }
  /**
   * Activate the client and initiate connection attempts.
   *
   * - Emits `CONNECTING` followed by `OPEN` on successful connect.
   * - Automatically reconnects, according to configuration.
   *
   * To stop auto-reconnect and close the connection, call {@link deactivate}.
   *
   * Maps to: [Client#activate]{@link Client#activate}.
   */
  activate() {
    this._stompClient.configure({
      beforeConnect: () => __async(this, null, function* () {
        this._changeState(RxStompState.CONNECTING);
        yield this._beforeConnect(this);
      }),
      onConnect: (frame) => {
        this._serverHeadersBehaviourSubject$.next(frame.headers);
        this._changeState(RxStompState.OPEN);
      },
      onStompError: (frame) => {
        this.stompErrors$.next(frame);
      },
      onWebSocketClose: () => {
        this._changeState(RxStompState.CLOSED);
      },
      onUnhandledMessage: (message) => {
        this.unhandledMessage$.next(message);
      },
      onUnhandledReceipt: (frame) => {
        this.unhandledReceipts$.next(frame);
      },
      onUnhandledFrame: (frame) => {
        this.unhandledFrame$.next(frame);
      },
      onWebSocketError: (evt) => {
        this.webSocketErrors$.next(evt);
      }
    });
    this._stompClient.activate();
  }
  /**
   * Gracefully disconnect (if connected) and stop auto-reconnect.
   *
   * Behavior:
   * - Emits `CLOSING` then `CLOSED`.
   * - If no active WebSocket exists, resolves immediately.
   * - If a WebSocket is active, resolves after it is properly closed.
   *
   * Experimental:
   * - `options.force === true` immediately discards the underlying connection.
   *   See [Client#deactivate]{@link Client#deactivate}.
   *
   * You can call {@link activate} again after awa.
   *
   * Maps to: [Client#deactivate]{@link Client#deactivate}.
   */
  deactivate() {
    return __async(this, arguments, function* (options = {}) {
      this._changeState(RxStompState.CLOSING);
      yield this._stompClient.deactivate(options);
      this._changeState(RxStompState.CLOSED);
    });
  }
  /**
   * Whether the broker connection is currently OPEN.
   *
   * Equivalent to checking `connectionState$.value === RxStompState.OPEN`.
   */
  connected() {
    return this.connectionState$.getValue() === RxStompState.OPEN;
  }
  /**
   * True if the client is ACTIVE — i.e., connected or attempting reconnection.
   *
   * Maps to: [Client#active]{@link Client#active}.
   */
  get active() {
    return this.stompClient.active;
  }
  /**
   * Publish a message to a destination on the broker.
   *
   * Destination semantics and supported headers are broker-specific; consult your broker’s docs
   * for naming conventions (queues, topics, exchanges) and header support.
   *
   * Payload
   * - Text: provide `body` as a string. Convert non-strings yourself (e.g., JSON.stringify).
   * - Binary: provide `binaryBody` as a Uint8Array and set an appropriate `content-type` header.
   *   Some brokers may require explicit configuration for binary frames.
   *
   * Frame sizing and content-length
   * - For text messages, a `content-length` header is added by default.
   *   Set `skipContentLengthHeader: true` to omit it for text frames.
   * - For binary messages, `content-length` is always included.
   *
   * Caution
   * - If a message body contains NULL octets and the `content-length` header is omitted,
   *   many brokers will report an error and disconnect.
   *
   * Offline/queueing behavior
   * - If not connected, messages are queued locally and sent upon reconnection.
   * - To disable this behavior, set `retryIfDisconnected: false` in the parameters.
   *   In that case, this method throws if it cannot send immediately.
   *
   * Related
   * - Broker acknowledgment (receipt) can be tracked using `receipt` headers together with {@link asyncReceipt}.
   *
   * Maps to: [Client#publish]{@link Client#publish}
   *
   * See: {@link IRxStompPublishParams} and {@link IPublishParams}
   *
   * Examples:
   * ```javascript
   * // Text with custom headers
   * rxStomp.publish({ destination: "/queue/test", headers: { priority: 9 }, body: "Hello, STOMP" });
   *
   * // Minimal (destination is required)
   * rxStomp.publish({ destination: "/queue/test", body: "Hello, STOMP" });
   *
   * // Skip content-length header for text
   * rxStomp.publish({ destination: "/queue/test", body: "Hello, STOMP", skipContentLengthHeader: true });
   *
   * // Binary payload
   * const binaryData = generateBinaryData(); // Uint8Array
   * rxStomp.publish({
   *   destination: "/topic/special",
   *   binaryBody: binaryData,
   *   headers: { "content-type": "application/octet-stream" }
   * });
   * ```
   */
  publish(parameters) {
    const shouldRetry = parameters.retryIfDisconnected == null ? true : parameters.retryIfDisconnected;
    if (this.connected()) {
      this._stompClient.publish(parameters);
    } else if (shouldRetry) {
      this._debug(`Not connected, queueing`);
      this._queuedMessages.push(parameters);
    } else {
      throw new Error("Cannot publish while broker is not connected");
    }
  }
  /** It will send queued messages. */
  _sendQueuedMessages() {
    const queuedMessages = this._queuedMessages;
    this._queuedMessages = [];
    if (queuedMessages.length === 0) {
      return;
    }
    this._debug(`Will try sending  ${queuedMessages.length} queued message(s)`);
    for (const queuedMessage of queuedMessages) {
      this._debug(`Attempting to send ${queuedMessage}`);
      this.publish(queuedMessage);
    }
  }
  watch(opts, headers = {}) {
    const defaults = {
      subHeaders: {},
      unsubHeaders: {},
      subscribeOnlyOnce: false
    };
    let params;
    if (typeof opts === "string") {
      params = Object.assign({}, defaults, {
        destination: opts,
        subHeaders: headers
      });
    } else {
      params = Object.assign({}, defaults, opts);
    }
    this._debug(`Request to subscribe ${params.destination}`);
    const coldObservable = Observable.create((messages) => {
      let stompSubscription;
      let stompConnectedSubscription;
      let connectedPre$ = this._connectedPre$;
      if (params.subscribeOnlyOnce) {
        connectedPre$ = connectedPre$.pipe(take(1));
      }
      const stompErrorsSubscription = this.stompErrors$.subscribe((error) => {
        const correlatedDestination = this._correlateErrors(error);
        if (correlatedDestination === params.destination) {
          messages.error(error);
        }
      });
      stompConnectedSubscription = connectedPre$.subscribe(() => {
        this._debug(`Will subscribe to ${params.destination}`);
        let subHeaders = params.subHeaders;
        if (typeof subHeaders === "function") {
          subHeaders = subHeaders();
        }
        stompSubscription = this._stompClient.subscribe(params.destination, (message) => {
          messages.next(message);
        }, subHeaders);
      });
      return () => {
        this._debug(`Stop watching connection state (for ${params.destination})`);
        stompConnectedSubscription.unsubscribe();
        stompErrorsSubscription.unsubscribe();
        if (this.connected()) {
          this._debug(`Will unsubscribe from ${params.destination} at Stomp`);
          let unsubHeaders = params.unsubHeaders;
          if (typeof unsubHeaders === "function") {
            unsubHeaders = unsubHeaders();
          }
          stompSubscription.unsubscribe(unsubHeaders);
        } else {
          this._debug(`Stomp not connected, no need to unsubscribe from ${params.destination} at Stomp`);
        }
      };
    });
    return coldObservable.pipe(share());
  }
  /**
   * **Deprecated** Please use {@link asyncReceipt}.
   */
  watchForReceipt(receiptId, callback) {
    this._stompClient.watchForReceipt(receiptId, callback);
  }
  /**
   * Wait for a broker RECEIPT matching the provided receipt-id.
   *
   * How it works
   * - To request an acknowledgment for an operation (e.g., publish, subscribe, unsubscribe),
   *   include a `receipt` header in that operation with a unique value.
   * - A compliant broker will respond with a `RECEIPT` frame whose `receipt-id` header equals
   *   the value you sent in the `receipt` header.
   * - This method returns a Promise that resolves with the matching {@link IFrame} when the
   *   corresponding `RECEIPT` arrives.
   *
   * Receipt identifiers
   * - Must be unique per request; generating a UUID or monotonic sequence is typical.
   *
   * Notes
   * - The Promise resolves once for the first matching receipt and then completes.
   * - No timeout is enforced by default; to add one, wrap with your own timeout logic (e.g., Promise.race).
   *
   * Example:
   * ```javascript
   * // Publish with receipt tracking
   * const receiptId = randomText();
   * rxStomp.publish({
   *   destination: "/topic/special",
   *   headers: { receipt: receiptId },
   *   body: msg
   * });
   * const receiptFrame = await rxStomp.asyncReceipt(receiptId); // resolves with the RECEIPT frame
   * ```
   *
   * Maps to: [Client#watchForReceipt]{@link Client#watchForReceipt}
   */
  asyncReceipt(receiptId) {
    return firstValueFrom(this.unhandledReceipts$.pipe(filter((frame) => frame.headers["receipt-id"] === receiptId)));
  }
  _changeState(state) {
    this._connectionStatePre$.next(state);
    this.connectionState$.next(state);
  }
};

// node_modules/@stomp/rx-stomp/esm6/rx-stomp-rpc-config.js
var RxStompRPCConfig = class {
};

// node_modules/uuid/dist/esm-browser/regex.js
var regex_default = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/i;

// node_modules/uuid/dist/esm-browser/validate.js
function validate(uuid) {
  return typeof uuid === "string" && regex_default.test(uuid);
}
var validate_default = validate;

// node_modules/uuid/dist/esm-browser/parse.js
function parse(uuid) {
  if (!validate_default(uuid)) {
    throw TypeError("Invalid UUID");
  }
  let v;
  return Uint8Array.of((v = parseInt(uuid.slice(0, 8), 16)) >>> 24, v >>> 16 & 255, v >>> 8 & 255, v & 255, (v = parseInt(uuid.slice(9, 13), 16)) >>> 8, v & 255, (v = parseInt(uuid.slice(14, 18), 16)) >>> 8, v & 255, (v = parseInt(uuid.slice(19, 23), 16)) >>> 8, v & 255, (v = parseInt(uuid.slice(24, 36), 16)) / 1099511627776 & 255, v / 4294967296 & 255, v >>> 24 & 255, v >>> 16 & 255, v >>> 8 & 255, v & 255);
}
var parse_default = parse;

// node_modules/uuid/dist/esm-browser/stringify.js
var byteToHex = [];
for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 256).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
  return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
}

// node_modules/uuid/dist/esm-browser/rng.js
var getRandomValues;
var rnds8 = new Uint8Array(16);
function rng() {
  if (!getRandomValues) {
    if (typeof crypto === "undefined" || !crypto.getRandomValues) {
      throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
    }
    getRandomValues = crypto.getRandomValues.bind(crypto);
  }
  return getRandomValues(rnds8);
}

// node_modules/uuid/dist/esm-browser/md5.js
function md5(bytes) {
  const words = uint8ToUint32(bytes);
  const md5Bytes = wordsToMd5(words, bytes.length * 8);
  return uint32ToUint8(md5Bytes);
}
function uint32ToUint8(input) {
  const bytes = new Uint8Array(input.length * 4);
  for (let i = 0; i < input.length * 4; i++) {
    bytes[i] = input[i >> 2] >>> i % 4 * 8 & 255;
  }
  return bytes;
}
function getOutputLength(inputLength8) {
  return (inputLength8 + 64 >>> 9 << 4) + 14 + 1;
}
function wordsToMd5(x, len) {
  const xpad = new Uint32Array(getOutputLength(len)).fill(0);
  xpad.set(x);
  xpad[len >> 5] |= 128 << len % 32;
  xpad[xpad.length - 1] = len;
  x = xpad;
  let a = 1732584193;
  let b = -271733879;
  let c = -1732584194;
  let d = 271733878;
  for (let i = 0; i < x.length; i += 16) {
    const olda = a;
    const oldb = b;
    const oldc = c;
    const oldd = d;
    a = md5ff(a, b, c, d, x[i], 7, -680876936);
    d = md5ff(d, a, b, c, x[i + 1], 12, -389564586);
    c = md5ff(c, d, a, b, x[i + 2], 17, 606105819);
    b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330);
    a = md5ff(a, b, c, d, x[i + 4], 7, -176418897);
    d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426);
    c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341);
    b = md5ff(b, c, d, a, x[i + 7], 22, -45705983);
    a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416);
    d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417);
    c = md5ff(c, d, a, b, x[i + 10], 17, -42063);
    b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162);
    a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682);
    d = md5ff(d, a, b, c, x[i + 13], 12, -40341101);
    c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290);
    b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329);
    a = md5gg(a, b, c, d, x[i + 1], 5, -165796510);
    d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632);
    c = md5gg(c, d, a, b, x[i + 11], 14, 643717713);
    b = md5gg(b, c, d, a, x[i], 20, -373897302);
    a = md5gg(a, b, c, d, x[i + 5], 5, -701558691);
    d = md5gg(d, a, b, c, x[i + 10], 9, 38016083);
    c = md5gg(c, d, a, b, x[i + 15], 14, -660478335);
    b = md5gg(b, c, d, a, x[i + 4], 20, -405537848);
    a = md5gg(a, b, c, d, x[i + 9], 5, 568446438);
    d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690);
    c = md5gg(c, d, a, b, x[i + 3], 14, -187363961);
    b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501);
    a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467);
    d = md5gg(d, a, b, c, x[i + 2], 9, -51403784);
    c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473);
    b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734);
    a = md5hh(a, b, c, d, x[i + 5], 4, -378558);
    d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463);
    c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562);
    b = md5hh(b, c, d, a, x[i + 14], 23, -35309556);
    a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060);
    d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353);
    c = md5hh(c, d, a, b, x[i + 7], 16, -155497632);
    b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640);
    a = md5hh(a, b, c, d, x[i + 13], 4, 681279174);
    d = md5hh(d, a, b, c, x[i], 11, -358537222);
    c = md5hh(c, d, a, b, x[i + 3], 16, -722521979);
    b = md5hh(b, c, d, a, x[i + 6], 23, 76029189);
    a = md5hh(a, b, c, d, x[i + 9], 4, -640364487);
    d = md5hh(d, a, b, c, x[i + 12], 11, -421815835);
    c = md5hh(c, d, a, b, x[i + 15], 16, 530742520);
    b = md5hh(b, c, d, a, x[i + 2], 23, -995338651);
    a = md5ii(a, b, c, d, x[i], 6, -198630844);
    d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415);
    c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905);
    b = md5ii(b, c, d, a, x[i + 5], 21, -57434055);
    a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571);
    d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606);
    c = md5ii(c, d, a, b, x[i + 10], 15, -1051523);
    b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799);
    a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359);
    d = md5ii(d, a, b, c, x[i + 15], 10, -30611744);
    c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380);
    b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649);
    a = md5ii(a, b, c, d, x[i + 4], 6, -145523070);
    d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379);
    c = md5ii(c, d, a, b, x[i + 2], 15, 718787259);
    b = md5ii(b, c, d, a, x[i + 9], 21, -343485551);
    a = safeAdd(a, olda);
    b = safeAdd(b, oldb);
    c = safeAdd(c, oldc);
    d = safeAdd(d, oldd);
  }
  return Uint32Array.of(a, b, c, d);
}
function uint8ToUint32(input) {
  if (input.length === 0) {
    return new Uint32Array();
  }
  const output = new Uint32Array(getOutputLength(input.length * 8)).fill(0);
  for (let i = 0; i < input.length; i++) {
    output[i >> 2] |= (input[i] & 255) << i % 4 * 8;
  }
  return output;
}
function safeAdd(x, y) {
  const lsw = (x & 65535) + (y & 65535);
  const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return msw << 16 | lsw & 65535;
}
function bitRotateLeft(num, cnt) {
  return num << cnt | num >>> 32 - cnt;
}
function md5cmn(q, a, b, x, s, t) {
  return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
}
function md5ff(a, b, c, d, x, s, t) {
  return md5cmn(b & c | ~b & d, a, b, x, s, t);
}
function md5gg(a, b, c, d, x, s, t) {
  return md5cmn(b & d | c & ~d, a, b, x, s, t);
}
function md5hh(a, b, c, d, x, s, t) {
  return md5cmn(b ^ c ^ d, a, b, x, s, t);
}
function md5ii(a, b, c, d, x, s, t) {
  return md5cmn(c ^ (b | ~d), a, b, x, s, t);
}
var md5_default = md5;

// node_modules/uuid/dist/esm-browser/v35.js
function stringToBytes(str) {
  str = unescape(encodeURIComponent(str));
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; ++i) {
    bytes[i] = str.charCodeAt(i);
  }
  return bytes;
}
var DNS = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
var URL2 = "6ba7b811-9dad-11d1-80b4-00c04fd430c8";
function v35(version, hash, value, namespace, buf, offset) {
  const valueBytes = typeof value === "string" ? stringToBytes(value) : value;
  const namespaceBytes = typeof namespace === "string" ? parse_default(namespace) : namespace;
  if (typeof namespace === "string") {
    namespace = parse_default(namespace);
  }
  if (namespace?.length !== 16) {
    throw TypeError("Namespace must be array-like (16 iterable integer values, 0-255)");
  }
  let bytes = new Uint8Array(16 + valueBytes.length);
  bytes.set(namespaceBytes);
  bytes.set(valueBytes, namespaceBytes.length);
  bytes = hash(bytes);
  bytes[6] = bytes[6] & 15 | version;
  bytes[8] = bytes[8] & 63 | 128;
  if (buf) {
    offset = offset || 0;
    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = bytes[i];
    }
    return buf;
  }
  return unsafeStringify(bytes);
}

// node_modules/uuid/dist/esm-browser/v3.js
function v3(value, namespace, buf, offset) {
  return v35(48, md5_default, value, namespace, buf, offset);
}
v3.DNS = DNS;
v3.URL = URL2;

// node_modules/uuid/dist/esm-browser/native.js
var randomUUID = typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID.bind(crypto);
var native_default = { randomUUID };

// node_modules/uuid/dist/esm-browser/v4.js
function v4(options, buf, offset) {
  if (native_default.randomUUID && !buf && !options) {
    return native_default.randomUUID();
  }
  options = options || {};
  const rnds = options.random ?? options.rng?.() ?? rng();
  if (rnds.length < 16) {
    throw new Error("Random bytes length must be >= 16");
  }
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  if (buf) {
    offset = offset || 0;
    if (offset < 0 || offset + 16 > buf.length) {
      throw new RangeError(`UUID byte range ${offset}:${offset + 15} is out of buffer bounds`);
    }
    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }
    return buf;
  }
  return unsafeStringify(rnds);
}
var v4_default = v4;

// node_modules/uuid/dist/esm-browser/sha1.js
function f(s, x, y, z) {
  switch (s) {
    case 0:
      return x & y ^ ~x & z;
    case 1:
      return x ^ y ^ z;
    case 2:
      return x & y ^ x & z ^ y & z;
    case 3:
      return x ^ y ^ z;
  }
}
function ROTL(x, n) {
  return x << n | x >>> 32 - n;
}
function sha1(bytes) {
  const K = [1518500249, 1859775393, 2400959708, 3395469782];
  const H = [1732584193, 4023233417, 2562383102, 271733878, 3285377520];
  const newBytes = new Uint8Array(bytes.length + 1);
  newBytes.set(bytes);
  newBytes[bytes.length] = 128;
  bytes = newBytes;
  const l = bytes.length / 4 + 2;
  const N = Math.ceil(l / 16);
  const M = new Array(N);
  for (let i = 0; i < N; ++i) {
    const arr = new Uint32Array(16);
    for (let j = 0; j < 16; ++j) {
      arr[j] = bytes[i * 64 + j * 4] << 24 | bytes[i * 64 + j * 4 + 1] << 16 | bytes[i * 64 + j * 4 + 2] << 8 | bytes[i * 64 + j * 4 + 3];
    }
    M[i] = arr;
  }
  M[N - 1][14] = (bytes.length - 1) * 8 / Math.pow(2, 32);
  M[N - 1][14] = Math.floor(M[N - 1][14]);
  M[N - 1][15] = (bytes.length - 1) * 8 & 4294967295;
  for (let i = 0; i < N; ++i) {
    const W = new Uint32Array(80);
    for (let t = 0; t < 16; ++t) {
      W[t] = M[i][t];
    }
    for (let t = 16; t < 80; ++t) {
      W[t] = ROTL(W[t - 3] ^ W[t - 8] ^ W[t - 14] ^ W[t - 16], 1);
    }
    let a = H[0];
    let b = H[1];
    let c = H[2];
    let d = H[3];
    let e = H[4];
    for (let t = 0; t < 80; ++t) {
      const s = Math.floor(t / 20);
      const T = ROTL(a, 5) + f(s, b, c, d) + e + K[s] + W[t] >>> 0;
      e = d;
      d = c;
      c = ROTL(b, 30) >>> 0;
      b = a;
      a = T;
    }
    H[0] = H[0] + a >>> 0;
    H[1] = H[1] + b >>> 0;
    H[2] = H[2] + c >>> 0;
    H[3] = H[3] + d >>> 0;
    H[4] = H[4] + e >>> 0;
  }
  return Uint8Array.of(H[0] >> 24, H[0] >> 16, H[0] >> 8, H[0], H[1] >> 24, H[1] >> 16, H[1] >> 8, H[1], H[2] >> 24, H[2] >> 16, H[2] >> 8, H[2], H[3] >> 24, H[3] >> 16, H[3] >> 8, H[3], H[4] >> 24, H[4] >> 16, H[4] >> 8, H[4]);
}
var sha1_default = sha1;

// node_modules/uuid/dist/esm-browser/v5.js
function v5(value, namespace, buf, offset) {
  return v35(80, sha1_default, value, namespace, buf, offset);
}
v5.DNS = DNS;
v5.URL = URL2;

// node_modules/@stomp/rx-stomp/esm6/rx-stomp-rpc.js
var RxStompRPC = class {
  /**
   * Construct a new RxStompRPC.
   *
   * @param rxStomp The active {@link RxStomp} instance to use for publishing and receiving.
   * @param stompRPCConfig Optional hooks to customize reply queue name and setup.
   *
   * Notes
   * - If `replyQueueName` is provided, it is used in the `reply-to` header for all requests.
   * - If `setupReplyQueue` is provided, it must return a hot Observable of all reply messages.
   *   RxStompRPC will subscribe internally to keep it alive across consumers.
   *
   * See the guide for broker-specific considerations.
   */
  constructor(rxStomp, stompRPCConfig) {
    this.rxStomp = rxStomp;
    this.stompRPCConfig = stompRPCConfig;
    this._replyQueueName = "/temp-queue/rpc-replies";
    this._setupReplyQueue = () => {
      return this.rxStomp.unhandledMessage$;
    };
    this._customReplyQueue = false;
    if (stompRPCConfig) {
      if (stompRPCConfig.replyQueueName) {
        this._replyQueueName = stompRPCConfig.replyQueueName;
      }
      if (stompRPCConfig.setupReplyQueue) {
        this._customReplyQueue = true;
        this._setupReplyQueue = stompRPCConfig.setupReplyQueue;
      }
    }
  }
  /**
   * Perform a unary RPC request that resolves with the first matching reply.
   *
   * Behavior
   * - Sends a single request using {@link stream} and returns an Observable that emits the first
   *   reply whose `correlation-id` matches the request.
   * - The returned Observable completes after emitting the first message.
   *
   * Use {@link stream} if you expect multiple replies for a single request.
   */
  rpc(params) {
    return this.stream(params).pipe(first());
  }
  /**
   * Perform an RPC request and receive a stream of matching replies.
   *
   * How it matches replies
   * - A `correlation-id` is attached to the request and used to filter messages
   *   from the reply stream. If you pass `headers['correlation-id']`, it is preserved;
   *   otherwise, a UUID is generated.
   *
   * Headers set by RxStompRPC
   * - `reply-to`: set to {@link _replyQueueName}.
   * - `correlation-id`: set or preserved as described above.
   *
   * Observability
   * - The returned Observable is cold with respect to the request; the request is sent
   *   upon subscription, and the filtered replies are forwarded to the subscriber.
   * - Unsubscribe to stop receiving further replies for the request; the underlying
   *   reply-queue subscription remains active and shared.
   *
   * When to use
   * - Use this when the server responds with multiple messages (progress events, partials).
   * - Prefer {@link rpc} if exactly one reply is expected.
   */
  stream(params) {
    const headers = __spreadValues({}, params.headers || {});
    if (!this._repliesObservable) {
      const repliesObservable = this._setupReplyQueue(this._replyQueueName, this.rxStomp);
      if (this._customReplyQueue) {
        this._dummySubscription = repliesObservable.subscribe(() => {
        });
      }
      this._repliesObservable = repliesObservable;
    }
    return Observable.create((rpcObserver) => {
      let defaultMessagesSubscription;
      const correlationId = headers["correlation-id"] || v4_default();
      defaultMessagesSubscription = this._repliesObservable.pipe(filter((message) => {
        return message.headers["correlation-id"] === correlationId;
      })).subscribe((message) => {
        rpcObserver.next(message);
      });
      headers["reply-to"] = this._replyQueueName;
      headers["correlation-id"] = correlationId;
      this.rxStomp.publish(__spreadProps(__spreadValues({}, params), { headers }));
      return () => {
        defaultMessagesSubscription.unsubscribe();
      };
    });
  }
};
export {
  ReconnectionTimeMode,
  RxStomp,
  RxStompConfig,
  RxStompRPC,
  RxStompRPCConfig,
  RxStompState,
  StompHeaders,
  StompSocketState,
  TickerStrategy,
  Versions
};
//# sourceMappingURL=@stomp_rx-stomp.js.map
