// wt create --name rating_endpoint \
//   --secret client_secret=mHvmZbDIGDURKbdYui8nTRjfIQkLc3NJ1uQpl1UDlfNr0T6G-O-E-RDg6jYO0E1Y \
//   --secret mongodb_connection_string=mongodb://webtasks:123456@ds051873.mongolab.com:51873/dashboard \
//   --output url rating_endpoint.js --no-parse --no-merge

var jwt = require('jsonwebtoken');
var Express = require('express');
var Webtask = require('webtask-tools');
var bodyParser = require('body-parser');
var _ = require('lodash');
var MongoClient = require('mongodb').MongoClient;

var app = Express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
  });

app.use(function(req,res,next) {

  if (!req.headers.authorization) {
    req.user = null;
    return next();
  }

  var parts = req.headers.authorization.split(' ');
  if (parts.length != 2) { 
    req.user = null;
    return next();
  }

  jwt.verify(parts[1], new Buffer(req.webtaskContext.data.client_secret, 'base64'), function(err, decoded) {

    if (err) {
      req.user = null;
    }
    else {
      req.user = decoded;
    }
    return next();

  });

});

app.use(function(req, res, next) {
    if (req.method.toLowerCase() === 'options') {
      req.end();
    } else {
      next();
    }
  });

app.use(function (req, res, next) {
    if (global.db) {
      next();
    } else {
      MongoClient.connect(req.webtaskContext.data.mongodb_connection_string, function(err, db) {
        global.db = db;
        if (err) {
          res.json(err).end();
        } else {
          next();
        }
      });
    }
  });

function get_product(req, res, next) {
  global.db.collection('ratings').findOne({product_id:req.params.product_id}, function(err, doc) {
    req.product = doc;
    next();
  });
}
function get_user_rate(req, res, next) {

  if (!req.product) next();
  
  req.user_rate = req.user ? _.find(req.product.rates,function(rate) { return rate.user_id === req.user.sub;}) : null;
  next();

}

function get_rate_reponse(req, res) {

  res.json({
    product_id: req.product && req.product.product_id || req.params.product_id,
    rate: req.product && req.product.rate || 0,
    votes: req.product && req.product.rates.length || 0,
    user_rate: req.user_rate && req.user_rate.rate || null
  }).end();

}

// GET
app.get('/:product_id',
  get_product, 
  get_user_rate,
  get_rate_reponse);

// GET
app.post('/:product_id',
  function(req,res,next) {
    if (req.user === null) {
      return res.status(401).json({error:'Unauthorized'}).end();
    }
    next();
  },
  function(req,res,next) {

    if (!req.body.rate) {
      return res.status(400).json({error:'Rate is required'}).end();
    }
    var rate = parseInt(req.body.rate);
    if (isNaN(rate) || (rate > 5) || (rate <= 0)) {
      return res.status(400).json({error:'Invalid rate, it should be an int between 1 and 5.'}).end();
    }
    req.rate = rate;
    next();

  },
  get_product, 
  function (req, res, next) {

    var product = req.product || {
      product_id: req.params.product_id,
      rates:[]
    };

    product.rates = _.filter(product.rates, function(rate) { return rate.user_id !== req.user.sub;});

    var user_rate = {
      user_id: req.user.sub,
      rate: req.rate
    };

    product.rates.push(user_rate);

    product.rate = _.sum(product.rates, 'rate') / product.rates.length;

    global.db.collection('ratings').update({ product_id:product.product_id }, product, {upsert:true});

    req.product = product;
    req.user_rate = user_rate;

    next();
  },
  get_rate_reponse);



module.exports = Webtask.fromExpress(app);