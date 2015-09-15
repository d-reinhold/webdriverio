/**
 *
 * Select option that display text matching the argument.
 *
 * <example>
    :example.html
    <select id="selectbox">
        <option value="someValue0">uno</option>
        <option value="someValue1">dos</option>
        <option value="someValue2">tres</option>
        <option value="someValue3">cuatro</option>
        <option value="someValue4">cinco</option>
        <option value="someValue5">seis</option>
    </select>

    :selectByVisibleText.js
    client
        .getText('#selectbox option:checked').then(function(value) {
            console.log(value);
            // returns "uno"
        })
        .selectByVisibleText('#selectbox', 'cuatro')
        .getText('#selectbox option:checked').then(function(value) {
            console.log(value);
            // returns "cuatro"
        });
 * </example>
 *
 * @param {String} selectElem select element that contains the options
 * @param {String} text       text of option element to get selected
 *
 * @uses protocol/element, protocol/elementIdClick, protocol/elementIdElement
 * @type action
 *
 */

var ErrorHandler = require('../utils/ErrorHandler.js');
var Q = require('q');
var MAX_RETRIES = 5;

module.exports = function selectByVisibleText (selectElem, text) {
    if(typeof selectElem !== 'string' || typeof text !== 'string') {
        throw new ErrorHandler.CommandError('number or type of arguments don\'t agree with selectByVisibleText command');
    }
    var retryCount = 0, self = this;
    var defer = Q.defer();

    var selectFunc = function() {
        self.element(selectElem).then(function(elem) {
            var normalized = '[normalize-space(.) = "' + text.trim() + '"]';
            return this.elementIdElement(elem.value.ELEMENT, './option' + normalized + '|./optgroup/option' + normalized);
        }).then(function(elem) {
            return this.elementIdClick(elem.value.ELEMENT).then(function(body) {
                defer.resolve(body);
            })}).catch(function(error) {
                if (retryCount < MAX_RETRIES && (error.message.indexOf('stale element reference') !== -1 || error.message.indexOf('not clickable at point') !== -1)) {
                    retryCount++;
                    selectFunc();
                } else {
                    defer.reject(error);
                }
            });;
    };

    selectFunc();
    return defer.promise;
};

