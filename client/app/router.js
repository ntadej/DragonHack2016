import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('car');
  this.route('driver', function() {
    this.route('car', {
      path: ':car_id'
    });
  });
  this.route('spectator');
});

export default Router;
