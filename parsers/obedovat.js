var cheerio = require('cheerio');
require('./parserUtil');

module.exports.parse = function(html, callback) {

    var $ = cheerio.load(html);

    var weekMenu = [];

    global.dates.forEach(function(date) {
        var todayRegex = new RegExp("^\\s*" + date.format("dddd"), "i");

        $('#daily-menu-container').find('.tmi-group').each(function () {
            var $this = $(this);
            var dayMenu = [];
            if (todayRegex.test($this.children('.tmi-group-name').text().trim())) {
                $this.children('.tmi-daily').each(function (index) {
                    var text = $(this).find('.tmi-name').text();
                    if (index === 0 && /\//.test(text)) { // two soups separated by slash
                        var soup1 = {};
                        soup1.text = normalize(text.split('/')[0]);
                        soup1.price = NaN;
                        soup1.isSoup = true;

                        dayMenu.push(soup1);

                        var soup2 = {};
                        soup2.text = normalize(text.split('/')[1]);
                        soup2.price = NaN;
                        soup2.isSoup = true;

                        dayMenu.push(soup2);
                    } else {
                        var menuItem = {};
                        menuItem.text = normalize(text);
                        menuItem.price = parseFloat($(this).find('.tmi-price').text().replace(/,/, '.'));
                        menuItem.isSoup = isNaN(menuItem.price); // soups don't have a price

                        dayMenu.push(menuItem);
                    }
                });
            }
            weekMenu.push({ day: date.format("dddd"), menu: dayMenu });
        });
    });

    callback(weekMenu);

    function normalize(str) {
        return str.normalizeWhitespace()
            .removeItemNumbering()
            .removeMetrics()
            .correctCommaSpacing();
    }
};
