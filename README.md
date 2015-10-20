#Auth0 Rate Widget

This widget targets to provide a way to extend any existing website with the hability to add items rating with webtask.io and Auth0.

Demo: https://github.com/auth0/auth0-rate-widget

##Usage

```
<script src="build/auth0-rate-widget.js"></script>
<script type="text/javascript">
var rating = new Auth0RateWidget({
    container: '#rating-p00001',
    endpoint_url: "https://webtask.it.auth0.com/api/run/wt-5491169046745-0/rating_endpoint",
    product_id: 'p00001',
    user_token: user_token,
    counter_format: 'Based on %s califications.',
    loginRequiredCallback: forceLogin
});
function forceLogin(){
    ...
    //log the user in and set the token to the widget
    ...
}
</script>

```

* container: container selector where the widget will load
* endpoint_url: the url of the API endpoint it will use to store the ratings
* product_id: the related product/item id 
* user_token: the logged user token. Null if the user is not logged in (the user will not be able to rate the item).
* counter_format: The way you want to show the amount of rates. Null to hide it.
* loginRequiredCallback: a callback the widget will call when a user tries to rate the item being logged off.

##API endpoint
This widget needs an API in order to store the rates of the products. You can use webtask.io if you don't have a backend and it is provided with the plugin.

In order to create your webtask, download the [webtask code](https://github.com/auth0/auth0-rate-widget/blob/master/webtasks/rating_endpoint.js) and follow this steps:

  * Follow the instructions to install the `wt-cli` tool and setup it for your [Auth0 account](https://manage.auth0.com/#/account/webtasks).
  * Create your webtask: 
```
wt create --name rating_endpoint \
    --secret client_secret=yourAuth0AppClientSecret \
    --secret mongodb_connection_string=yourMongoConnectionString \
    --output url rating_endpoint.js --no-parse --no-merge
```
  * Parameters:
    * *client_secret*: The secret of your Auth0 app that you are using for your site login. It is used to verify the user token.
    * *mongodb_connection_string*: It is the connection string to connect to your MongoDB database. In the [Demo](https://github.com/auth0/auth0-rate-widget) it is using a mongolab database.
