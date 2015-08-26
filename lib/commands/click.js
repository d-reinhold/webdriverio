/**
 *
 * Click on an element based on given selector.
 *
 * <example>
    :example.html
    <button id="myButton" onclick="document.getElementById('someText').innerHTML='I was clicked'">Click me</button>
    <div id="someText">I was not clicked</div>

    :click.js
    client
        .click('#myButton')
        .getText('#someText').then(function(value) {
            assert(value === 'I was clicked'); // true
        });
 * </example>
 *
 * @param {String} selector element to click on. If it matches with more than one DOM-element it automatically clicks on the first element
 *
 * @uses protocol/element, protocol/elementIdClick, protocol/touchClick
 * @type action
 *
 */
var Q = require('q');
var MAX_RETRIES = 5;

module.exports = function click (selector) {
    var retryCount = 0, self = this;
    var clickMethod = this.isMobile ? 'touchClick' : 'elementIdClick';
    var defer = Q.defer();

    var clickFunc = function() {
        self.element(selector).then(function(elem) {
            self[clickMethod](elem.value.ELEMENT).then(function(body) {
                defer.resolve(body);
            }).catch(function(error) {
                if (retryCount < MAX_RETRIES && (error.message.indexOf('stale element reference') !== -1 || error.message.indexOf('not clickable at point') !== -1)) {
                    retryCount++;
                    clickFunc();
                } else {
                    defer.reject(error);
                }
            });
        });
    };
    clickFunc();
    return defer.promise;
};