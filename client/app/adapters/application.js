import RESTAdapter from 'ember-data/adapters/rest';

export default RESTAdapter.extend({
  namespace: 'api',
  host: 'http://dragon.pyphy.com'
});
