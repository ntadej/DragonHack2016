import Ember from 'ember';

export default Ember.Route.extend({
  socketIOService: Ember.inject.service('socket-io'),

  setupController: function(controller) {
    const socket = this.get('socketIOService').socketFor('http://dragon.pyphy.com/');

    let connection = ConnectionInit(socket, Ember.$);
    controller.set('connection', connection);
  },

  actions: {
    didTransition: function() {
      this.send('openOrJoin');
    },
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
        broadcastid: 'testDev',
        userid: controller.get('connection').userid,
        typeOfStreams: controller.get('connection').session
      });
    }
  }
});
