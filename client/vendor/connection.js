var ConnectionInit = function(socket, $, displayCallback) {
  // this RTCMultiConnection object is used to connect with existing users
  var connection = initRTCMultiConnection();
  connection.displayCallback = displayCallback;

  // using single socket for RTCMultiConnection signaling
  var onMessageCallbacks = {};

  // initializing RTCMultiConnection constructor.
  function initRTCMultiConnection(userid) {
    var connection = new RTCMultiConnection();
    connection.getExternalIceServers = false;
    connection.iceServers = [];

    connection.body = $('#videos-container');
    connection.channel = connection.sessionid = connection.userid = userid || connection.userid;
    connection.sdpConstraints.mandatory = {
      OfferToReceiveAudio: false,
      OfferToReceiveVideo: true
    };
    // using socket.io for signaling
    connection.openSignalingChannel = function(config) {
      var desiredVideo;
      var desiredAudio;
      connection.getDevices(function(devices) {
        for (var device in devices) {
          device = devices[device];

          if (device.kind === 'audio') {
            desiredAudio = device.id;
          } else if (device.kind === 'video') {
            if (!desiredVideo || device.label.indexOf('back') != -1) {
              desiredVideo = device.id;
            }
          }

          // device.kind == 'audio' || 'video'
          console.log(device.id, device.label);
        }
      });

      // select any audio and/or video device
      connection.selectDevices(desiredVideo);
      connection.mediaConstraints.mandatory = {
        maxHeight: 480,
        maxWidth: 640
      };

      var channel = config.channel || this.channel;
      onMessageCallbacks[channel] = config.onmessage;
      if (config.onopen) {
        setTimeout(config.onopen, 1000);
      }
      return {
        send: function(message) {
          socket.emit('message', {
            sender: connection.userid,
            channel: channel,
            message: message
          });
        },
        channel: channel
      };
    };
    connection.onMediaError = function(error) {
      alert(JSON.stringify(error));
    };
    return connection;
  }

  connection.getExternalIceServers = false;

  connection.onstream = function(event) {
    connection.displayCallback(event);

    if (connection.isInitiator === false && !connection.broadcastingConnection) {
      // "connection.broadcastingConnection" global-level object is used
      // instead of using a closure object, i.e. "privateConnection"
      // because sometimes out of browser-specific bugs, browser
      // can emit "onaddstream" event even if remote user didn't attach any stream.
      // such bugs happen often in chrome.
      // "connection.broadcastingConnection" prevents multiple initializations.

      // if current user is broadcast viewer
      // he should create a separate RTCMultiConnection object as well.
      // because node.js server can allot him other viewers for
      // remote-stream-broadcasting.
      connection.broadcastingConnection = initRTCMultiConnection(connection.userid);

      // to fix unexpected chrome/firefox bugs out of sendrecv/sendonly/etc. issues.
      connection.broadcastingConnection.onstream = function() {};

      connection.broadcastingConnection.session = connection.session;
      connection.broadcastingConnection.attachStreams.push(event.stream); // broadcast remote stream
      connection.broadcastingConnection.dontCaptureUserMedia = true;

      // forwarder should always use this!
      connection.broadcastingConnection.sdpConstraints.mandatory = {
        OfferToReceiveVideo: false,
        OfferToReceiveAudio: false
      };

      connection.broadcastingConnection.open({
        dontTransmit: true
      });
    }
  };

  socket.on('message', function(data) {
    if (data.sender === connection.userid) {
      return;
    }
    if (onMessageCallbacks[data.channel]) {
      onMessageCallbacks[data.channel](data.message);
    }
  });

  // this event is emitted when a broadcast is already created.
  socket.on('join-broadcaster', function(broadcaster, typeOfStreams) {
    connection.session = typeOfStreams;
    connection.channel = connection.sessionid = broadcaster.userid;

    connection.sdpConstraints.mandatory = {
      OfferToReceiveVideo: !!connection.session.video,
      OfferToReceiveAudio: !!connection.session.audio
    };

    connection.join({
      sessionid: broadcaster.userid,
      userid: broadcaster.userid,
      extra: {},
      session: connection.session
    });
  });

  // this event is emitted when a broadcast is absent.
  socket.on('start-broadcasting', function(typeOfStreams) {
    // host i.e. sender should always use this!
    connection.sdpConstraints.mandatory = {
      OfferToReceiveVideo: false,
      OfferToReceiveAudio: false
    };
    connection.session = typeOfStreams;
    connection.open({
      dontTransmit: true
    });

    if (connection.broadcastingConnection) {
      // if new person is given the initiation/host/moderation control
      connection.broadcastingConnection.close();
      connection.broadcastingConnection = null;
    }
  });

  return connection;
};
