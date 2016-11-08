"use strict";
var fs = require('fs');
var request = require('requestretry').defaults({ agent: false });
var path = require('path');
var parseString = require('xml2js').parseString;
var Spinner = require('cli-spinner').Spinner;
var sanitize = require("sanitize-filename");
var downloadManager = (function () {
    function downloadManager(config) {
        this.isRunning = false;
        this.downloadsInProgress = 0;
        this.downloadsCompleted = 0;
        this.maxConcurrentDownloads = config.maxConcurrentDownloads - 1;
        this.proxy = config.proxy;
    }
    downloadManager.prototype.startEngine = function (downloadQueue) {
        this.downloadQueue = downloadQueue;
        this.engine();
    };
    downloadManager.prototype.getProxy = function () {
        var proxyAddress;
        if (this.proxy) {
            proxyAddress = "http://" + this.proxy.domain + this.proxy.username + ":" + this.proxy.password + "@" + this.proxy.addressePort;
        }
        else {
            proxyAddress = null;
        }
        return proxyAddress;
    };
    downloadManager.prototype.engine = function () {
        var _this = this;
        var stop = false;
        (this.downloadQueue).forEach(function (downloadItem, index) {
            if (stop) {
                return false;
            }
            if (!_this.isRunning) {
                if (_this.downloadsInProgress <= _this.maxConcurrentDownloads) {
                    console.log('starting download');
                    _this.downloadItem(downloadItem.downloadType, downloadItem);
                    _this.downloadsInProgress++;
                }
            }
            // start next download
            if (_this.downloadsCompleted > 0) {
                console.log(_this.downloadsCompleted + " downloads completed");
                var dlIndex = _this.downloadsCompleted + _this.maxConcurrentDownloads;
                var downloadQueueItem = _this.downloadQueue[dlIndex];
                // exit if no download item exist
                if (!downloadQueueItem) {
                    return false;
                }
                _this.downloadItem(downloadQueueItem.downloadType, downloadQueueItem);
                stop = true;
                _this.isRunning = true;
            }
            if (_this.downloadsCompleted == _this.downloadQueue.length) {
                stop = true;
            }
        });
    };
    downloadManager.prototype.notifyManager = function (downloadQueue) {
        // create download folder
        if (!fs.existsSync('../downloads')) {
            fs.mkdirSync('../downloads');
        }
        this.startEngine(downloadQueue);
    };
    downloadManager.prototype.downloadItem = function (downloadType, downloadItem) {
        var spinner = new Spinner('%s');
        spinner.start();
        var downloadLink;
        if (downloadType == 'video') {
            if (downloadItem.mediaContent[1]) {
                downloadLink = downloadItem.mediaContent[1]['$'].url;
            }
        }
        else {
            downloadLink = downloadItem.slidesLink;
            console.log(downloadLink);
        }
        var _this = this;
        if (!downloadLink) {
            console.log("No download link for " + path.basename(downloadLink));
            _this.downloadsInProgress--;
            _this.downloadsCompleted++;
            _this.engine();
            return false;
        }
        var requestOptions = {
            url: downloadLink,
            maxAttempts: 5,
            retryDelay: 5000,
            "rejectUnauthorized": false
        };
        if (_this.getProxy() !== null) {
            requestOptions.proxy = _this.getProxy();
        }
        request(requestOptions)
            .on('error', function (err) {
            console.log(err);
            _this.downloadsInProgress--;
            _this.downloadsCompleted++;
            _this.engine();
        })
            .on('response', function (response) {
            if (response.statusCode == 200) {
                console.log("Downloading " + downloadItem.title + " (" + path.basename(downloadLink) + ")");
            }
        })
            .on('end', function () {
            spinner.stop();
            console.log("download complete for " + path.basename(downloadLink));
            _this.downloadsInProgress--;
            _this.downloadsCompleted++;
            _this.engine();
        })
            .pipe(fs.createWriteStream("../downloads/" + sanitize(downloadItem.title) + path.extname(downloadLink)));
    };
    return downloadManager;
}());
exports.downloadManager = downloadManager;
