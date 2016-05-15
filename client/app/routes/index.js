import Ember from 'ember';

export default Ember.Route.extend({
  onActivate: function() {
    Ember.$('body').addClass('index');
  }.on('activate'),

  onDeactivate: function() {
    Ember.$('body').removeClass('index');
  }.on('deactivate')
});
