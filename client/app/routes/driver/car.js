import Ember from 'ember';

export default Ember.Route.extend({
  socketIOService: Ember.inject.service('socket-io'),

  setupController: function(controller) {
    const socket = this.get('socketIOService').socketFor('http://dragon.pyphy.com/');

    let connection = ConnectionInit(socket, Ember.$);
    controller.set('connection', connection);
  },

  actions: {
    openOrJoin: function() {
      const socket = this.get('socketIOService').socketFor('http://dragon.pyphy.com/');
      const controller = this.get('controller');

      this.disabled = true;

      controller.get('connection').session = {
        video: true,
        screen: false,
        audio: true,
        oneway: true
      };

      socket.emit('join-broadcast', {
        broadcastid: 'testId',
        userid: controller.get('connection').userid,
        typeOfStreams: controller.get('connection').session
      });
    }
  },

  beforeModel() {
    const socket = this.get('socketIOService').socketFor('http://dragon.pyphy.com/');

    socket.on('connect', this.onConnect, this);
    socket.on('action', (data) => {
      //console.log(data);
    });
  },
  onConnect() {
    // const socket = this.get('socketIOService').socketFor('http://dragon.pyphy.com/');

    console.log('Connect');
  },

  willDestroyElement() {
    const socket = this.get('socketService').socketFor('http://dragon.pyphy.com/');
    socket.off('connect', this.onConnect);
    socket.off('message', this.onMessage);
  }
});
