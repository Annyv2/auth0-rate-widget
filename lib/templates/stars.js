module.exports = function(element, id, counter_format) {
  var html = '<div class="auth0-rate-widget '+id+'">';
  
  html += '<div class="stars">';
  html += '<span class="rate rate1" rate-value="1" ><i class="fa fa-star">&nbsp;</i></span>';
  html += '<span class="rate rate2" rate-value="2" ><i class="fa fa-star">&nbsp;</i></span>';
  html += '<span class="rate rate3" rate-value="3" ><i class="fa fa-star">&nbsp;</i></span>';
  html += '<span class="rate rate4" rate-value="4" ><i class="fa fa-star">&nbsp;</i></span>';
  html += '<span class="rate rate5" rate-value="5" ><i class="fa fa-star">&nbsp;</i></span>';
  html += '</div>';

  if (counter_format) {

    html += '<div class="counter-wrapper hidden">';
    html += counter_format.replace( /%s/, '<span class="counter"></span>' );    
    html += '</div>';

  }

  html += '</div>';
  element.html(html);
}