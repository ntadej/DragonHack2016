import Ember from 'ember';

export default Ember.Route.extend({
  socketIOService: Ember.inject.service('socket-io'),
  settings: Ember.inject.service('settings'),

  setupController: function(controller) {
    const socket = this.get('socketIOService').socketFor(this.get('settings').get('url'));

    let connection = ConnectionInit(socket, Ember.$, function(event) {
      let video = $(event.mediaElement);
      let container = Ember.$('#videos-container');

      container.append('<div class="driver-wrapper"><video class="driver left" src="' + video.attr('src') + '" autoplay></video></div>');
      container.append('<div class="driver-wrapper"><video class="driver right" src="' + video.attr('src') + '" autoplay></video></div>');
    });
    controller.set('connection', connection);
  },

  actions: {
    didTransition: function() {
      window.setTimeout(function() {
        this.send('openOrJoin');
      }.bind(this), 5000);
    },
    openOrJoin: function() {
      const socket = this.get('socketIOService').socketFor(this.get('settings').get('url'));
      const controller = this.get('controller');

      this.disabled = true;

      controller.get('connection').session = {
        video: true,
        screen: false,
        audio: true,
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
