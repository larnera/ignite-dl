"use strict";
var cheerio = require('cheerio');
var request = require('requestretry').defaults({ agent: false });
var parseString = require('xml2js').parseString;
var ignite_dl_man_1 = require("./ignite-dl-man");
var ignite = (function () {
    function ignite(config) {
        this.slidesAddresses = config.slidesAddresses;
        this.videosAddresses = config.videosAddresses;
        this.proxy = config.proxy;
        this.downloadQueue = [];
        // set proxy properties
        if (config.proxy) {
            this.proxy.domain = config.proxy.domain;
            this.proxy.username = config.proxy.username;
            this.proxy.password = config.proxy.password;
            this.proxy.addressePort = config.proxy.addressePort;
        }
        this.dl = new ignite_dl_man_1.downloadManager({
            maxConcurrentDownloads: config.maxConcurrentDownloads,
            proxy: this.proxy
        });
    }
    ignite.prototype.download = function (downloadType) {
        downloadType == 'slides' ? this.getDownloads(downloadType, this.slidesAddresses) : this.getDownloads(downloadType, this.videosAddresses);
    };
    ignite.prototype.getProxy = function () {
        var proxyAddress;
        if (this.proxy) {
            proxyAddress = "http://" + this.proxy.domain + this.proxy.username + ":" + this.proxy.password + "@" + this.proxy.addressePort;
        }
        else {
            proxyAddress = null;
        }
        return proxyAddress;
    };
    ignite.prototype.getDownloads = function (downloadType, addresses) {
        console.log('Fetching bulk download metadata');
        if (!addresses) {
            console.log("No " + downloadType + " addresses provided.");
            return false;
        }
        var _this = this;
        var requestCount = 0;
        addresses.forEach(function (item, index) {
            var requestOptions = {
                url: item,
                maxAttempts: 5,
                retryDelay: 5000
            };
            if (_this.getProxy() !== null) {
                requestOptions.proxy = _this.getProxy();
            }
            request.get(requestOptions, function (error, response, body) {
                if (error) {
                    console.log(error);
                }
                var $ = cheerio.load(body, {
                    normalizeWhitespace: true,
                    xmlMode: true
                });
                var data = parseString(body, function (err, result) {
                    var rssItem = result.rss.channel[0].item;
                    (rssItem).forEach(function (item, index) {
                        var mediaContent;
                        if (item['media:group']) {
                            mediaContent = item['media:group'][0]['media:content'];
                        }
                        else {
                            mediaContent = [];
                        }
                        var downloadItem = {
                            title: (item.title).toString(),
                            slidesLink: item.enclosure[0].$.url,
                            mediaContent: mediaContent,
                            downloadType: downloadType,
                            description: (item.description).toString()
                        };
                        _this.downloadQueue.push(downloadItem);
                    });
                    requestCount++;
                    if (addresses.length == requestCount) {
                        console.log(_this.downloadQueue.length);
                        _this.dl.notifyManager(_this.downloadQueue);
                    }
                });
            });
        });
    };
    return ignite;
}());
exports.ignite = ignite;
