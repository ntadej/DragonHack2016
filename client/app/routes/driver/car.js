import Ember from 'ember';

export default Ember.Route.extend({
  socketIOService: Ember.inject.service('socket-io'),
  settings: Ember.inject.service('settings'),

  onActivate: function() {
    Ember.$('body').addClass('ddd');
  }.on('activate'),

  onDeactivate: function() {
    Ember.$('body').removeClass('ddd');
  }.on('deactivate'),

  setupController: function(controller) {
    const socket = this.get('socketIOService').socketFor(this.get('settings').get('url'));

    let connection = ConnectionInit(socket, Ember.$, function(event) {
      let video = $(event.mediaElement);
      let container = Ember.$('#videos-container');

      container.append('<div class="driver-wrapper"><video class="driver left" src="' + video.attr('src') + '" autoplay></video></div>');
      container.append('<div class="driver-wrapper"><video class="driver right" src="' + video.attr('src') + '" autoplay></video></div>');

      if (!window.DeviceMotionEvent) {
        console.log('Device does not support motion');
      } else {
        var degreesToChange = 25; // How much does the phone have to turn, to change the direction [°]
        var firstPositionFlag = true; // Flag to know, if we need to set first position
        var firstPosition; // First position. Direction change depends on this

        function getDiff(pos1, pos2) {
          return (pos2 - pos1 + 540) % 360 - 180;
        }

        window.ondeviceorientation = function(event) {
          var alpha = Math.round(event.alpha);
          var beta = Math.round(event.beta);
          var gamma = Math.round(event.gamma);

          var alphaDiff, betaDiff, gammaDiff;

          if (firstPositionFlag) {
            firstPositionFlag = false;
            firstPosition = {
              "alpha": alpha,
              "beta": beta,
              "gamma": gamma
            };
          } else {
            if (gamma >= 0) {
              alphaDiff = getDiff(firstPosition.alpha, alpha + 180);
            } else {
              alphaDiff = getDiff(firstPosition.alpha, alpha);
            }
            betaDiff = getDiff(firstPosition.beta, beta);
            gammaDiff = getDiff(firstPosition.gamma, gamma);

            if (gamma > 0 && gamma < 50) {
              socket.emit('directionChange', 's');
            } else if (gamma < 0 && gamma > -50) {
              socket.emit('directionChange', 'b');
            } else {
              if (alphaDiff > degreesToChange) {
                socket.emit('directionChange', 'l');
              } else if (alphaDiff < -degreesToChange) {
                socket.emit('directionChange', 'r');
              } else {
                socket.emit('directionChange', 'f');
              }
            }
          }
        };
      }
    });
    controller.set('connection', connection);
  },

  actions: {
    didTransition: function() {
      this.send('openOrJoin');
    },
    openOrJoin: function() {
      const socket = this.get('socketIOService').socketFor(this.get('settings').get('url'));
      const controller = this.get('controller');

      this.disabled = true;

      controller.get('connection').session = {
        video: true,
        screen: false,
        audio: false,
        oneway: true
      };

      socket.emit('join-broadcast', {
        broadcastid: 'testDev',
        userid: controller.get('connection').userid,
        typeOfStreams: controller.get('connection').session
      });
    }
  },

  beforeModel() {
    const socket = this.get('socketIOService').socketFor(this.get('settings').get('url'));

    socket.on('connect', this.onConnect, this);
    socket.on('action', (data) => {
      //console.log(data);
    });
  },
  onConnect() {
    // const socket = this.get('socketIOService').socketFor(this.get('settings').get('url'));

    console.log('Connect');
  },

  willDestroyElement() {
    const socket = this.get('socketService').socketFor(this.get('settings').get('url'));
    socket.off('connect', this.onConnect);
    socket.off('message', this.onMessage);
  }
});
