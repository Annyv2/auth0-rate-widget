require('./lib/insert-css');
var $ = require('jQuery');
var stars_template = require('./lib/templates/stars');
var UnauthorizedError = require('./lib/errors/UnauthorizedError');

var fetch = require('fetchify')(Promise).fetch;

export default class Auth0RateWidget {
    
  constructor (options) {
    if (!(this instanceof Auth0RateWidget)) {
        return new Auth0RateWidget(options);
    }

    this.setOptions(options);
  }

  on(event, callback) {
    if (! this.events[event]) {
      throw "Invalid event";
    }

    if (callback) {
      this.events[event].push(callback);
    } else {
      this.events[event].forEach(event => event() );
    }
    return this;
  }

  setOptions(options) {

    this.events = {
      loading:[],
      loaded:[]
    };

    this.endpoint_url = options.endpoint_url;
    this.product_id = options.product_id;
    this.id = 'auth0-rate-'+options.product_id;
    this.user_token = options.user_token;
    this.container = $(options.container);
    this.data = null;
    this.loginRequiredCallback = options.loginRequiredCallback;
    this.counter_format = options.counter_format;

    if (options.onLoading) {
      this.on('loading', options.onLoading);
    }
    if (options.onLoaded) {
      this.on('loaded', options.onLoaded);
    }

    this.init();

  }

  init () {
    var _this = this;

    stars_template(this.container, this.id, this.counter_format);
    this.container.find(".rate").click( function() {
      _this.rateClick(this);
    } );

    var headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };

    if (this.user_token) {
      headers['Authorization'] = 'Bearer ' + this.user_token;
    }
    this.on('loading');

    var fetch_promise = fetch(this.endpoint_url + '/' + this.product_id, {
      method: 'get',
      headers: headers
    });

    this.load(fetch_promise);
  }
  load (promise) {
    var _this = this;

    promise
      .then( response => {
        this.on('loaded');
        if (response.status === 401) {
          throw new UnauthorizedError();
        }
        return response;
      } )
      .then( response => response.json() )
      .then( response => {
        response.rate = Math.round(response.rate)

        if (this.data) {
          $('.' + _this.id).removeClass('rate' + this.data.rate);
        }

        $('.' + _this.id).find('.counter-wrapper').removeClass('hidden');
        $('.' + _this.id).find('.counter').html(response.votes);

        $('.' + _this.id).addClass('rate' + response.rate);
        
        this.data = response;
      })
      .catch(function(e){
        _this.loginRequiredCallback();
      });
  }
  rateClick(ele) {
    var rate = $(ele).attr('rate-value');
    this.rate(rate);
  }
  rate(rate) {

    var headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };

    if (this.user_token) {
      headers['Authorization'] = 'Bearer ' + this.user_token;
    }

    this.on('loading');
    var fetch_promise = fetch(this.endpoint_url + '/' + this.product_id, {
        method: 'post',
        headers: headers,
        body: JSON.stringify({
          rate:rate,
        })
      });
    this.load(fetch_promise);

  }

}

