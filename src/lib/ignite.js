"use strict";
let cheerio = require('cheerio');
let request = require('requestretry').defaults({ agent: false });
let parseString = require('xml2js').parseString;
const ignite_dl_man_1 = require("./ignite-dl-man");
class ignite {
    constructor(config) {
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
    download(downloadType) {
        downloadType == 'slides' ? this.getDownloads(downloadType, this.slidesAddresses) : this.getDownloads(downloadType, this.videosAddresses);
    }
    getProxy() {
        let proxyAddress;
        if (this.proxy) {
            proxyAddress = `http://${this.proxy.domain}${this.proxy.username}:${this.proxy.password}@${this.proxy.addressePort}`;
        }
        else {
            proxyAddress = null;
        }
        return proxyAddress;
    }
    getDownloads(downloadType, addresses) {
        console.log('Starting...');
        if (!addresses) {
            console.log(`No ${downloadType} addresses provided.`);
            return false;
        }
        let _this = this;
        let requestCount = 0;
        addresses.forEach(function (item, index) {
            console.log(`Getting RSS data from ${item}`);
            let requestOptions = {
                url: item,
                maxAttempts: 5,
                retryDelay: 5000,
                "rejectUnauthorized": false
            };
            if (_this.getProxy() !== null) {
                requestOptions.proxy = _this.getProxy();
            }
            request.get(requestOptions, function (error, response, body) {
                if (error) {
                    console.log(error);
                }
                let $ = cheerio.load(body, {
                    normalizeWhitespace: true,
                    xmlMode: true
                });
                var data = parseString(body, function (err, result) {
                    let rssItem;
                    if (result.rss) {
                        rssItem = result.rss.channel[0].item;
                    }
                    else {
                        console.log('Unable to read RSS Data');
                        return false;
                    }
                    (rssItem).forEach(function (item, index) {
                        let mediaContent;
                        if (item['media:group']) {
                            mediaContent = item['media:group'][0]['media:content'];
                        }
                        else {
                            mediaContent = [];
                        }
                        let downloadItem = {
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
                        console.log(`Retrieved ${_this.downloadQueue.length} items for download`);
                        _this.dl.notifyManager(_this.downloadQueue);
                    }
                });
            });
        });
    }
}
exports.ignite = ignite;
//# sourceMappingURL=ignite.js.map