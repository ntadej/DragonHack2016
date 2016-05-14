import Ember from 'ember';

export default Ember.Route.extend({
  socketIOService: Ember.inject.service('socket-io'),
  settings: Ember.inject.service('settings'),

  setupController: function(controller) {
    const socket = this.get('socketIOService').socketFor(this.get('settings').get('url'));

    let connection = ConnectionInit(socket, Ember.$, function() {});
    controller.set('connection', connection);
  },

  onActivate: function() {
    Ember.$('body').addClass('dark');
  }.on('activate'),

  onDeactivate: function() {
    Ember.$('body').removeClass('dark');
  }.on('deactivate'),

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
