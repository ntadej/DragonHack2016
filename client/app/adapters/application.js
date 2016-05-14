import RESTAdapter from 'ember-data/adapters/rest';

export default RESTAdapter.extend({
  namespace: 'api',
  host: 'http://localhost:3000'
});
