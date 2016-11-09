let fs = require('fs');
let request = require('requestretry').defaults({ agent: false });
let path = require('path');
let parseString = require('xml2js').parseString;
let Spinner = require('cli-spinner').Spinner;
let sanitize = require("sanitize-filename");

export class downloadManager {

    private maxConcurrentDownloads: number;
    private proxy: igniteInterfaces.proxy;
    private isRunning: Boolean = false;
    private downloadsInProgress = 0;
    private downloadsCompleted: number = 0;

    private downloadQueue: igniteInterfaces.downloadQueue;

    constructor(config: downloadManagerInterfaces.config) {
        this.maxConcurrentDownloads = config.maxConcurrentDownloads -1;
        this.proxy = config.proxy; 
    }

    private startEngine(downloadQueue: igniteInterfaces.downloadQueue): void {
        this.downloadQueue = downloadQueue;
        this.engine();
    }

    private getProxy(): string {
        let proxyAddress: string;
        if (this.proxy) {
            proxyAddress = `http://${this.proxy.domain}${this.proxy.username}:${this.proxy.password}@${this.proxy.addressePort}`;
        } else {
            proxyAddress = null;
        }
        return proxyAddress;
    }

    public engine() {
        let _this = this;
        let stop = false;
        (this.downloadQueue).forEach(function (downloadItem: igniteInterfaces.downloadItem, index) {

            if (stop) { return false }

            if (!_this.isRunning) {
                if (_this.downloadsInProgress <= _this.maxConcurrentDownloads) {
                    _this.downloadItem(downloadItem.downloadType, downloadItem);
                    _this.downloadsInProgress++;
                }
            }

            // detect last running items for download
            if ((_this.downloadQueue.length - _this.downloadsCompleted - 1) < _this.maxConcurrentDownloads) {
                stop = true;
            }

            // start next download
            if (_this.downloadsCompleted > 0) {
                console.log(`${_this.downloadsCompleted - 1} downloads completed of ${_this.downloadQueue.length}`);
                let dlIndex = _this.downloadsCompleted + _this.maxConcurrentDownloads;
                let downloadQueueItem: any = _this.downloadQueue[dlIndex];

                // exit if no download item exist
                if (!downloadQueueItem) { return false }

                _this.downloadItem(downloadQueueItem.downloadType, downloadQueueItem);
                stop = true;
                _this.isRunning = true;
            }

            if (_this.downloadsCompleted == _this.downloadQueue.length) {
                stop = true;
            }
        })
    }

    public notifyManager(downloadQueue: igniteInterfaces.downloadQueue) {

        // create download folder
        if (!fs.existsSync('downloads')) {
            fs.mkdirSync('downloads');
        }

        this.startEngine(downloadQueue);
    }

    public downloadItem(downloadType: string, downloadItem: igniteInterfaces.downloadItem) {

        var spinner = new Spinner('%s');
        spinner.start();

        let downloadLink: string;
        if (downloadType == 'video') {
            if (downloadItem.mediaContent[1]) {
                downloadLink = downloadItem.mediaContent[1]['$'].url;
            }
        } else {
            downloadLink = downloadItem.slidesLink;
            console.log(`Downloading item: ${downloadLink}`);
        }

        let _this = this;

        if (!downloadLink) {
            console.log(`No download link for ${path.basename(downloadLink)}`);
            _this.downloadsInProgress--;
            _this.downloadsCompleted++;
            _this.engine();
            return false;
        }

        let requestOptions: any = {
            url: downloadLink,
            maxAttempts: 5,
            retryDelay: 5000,
            "rejectUnauthorized": false
        }

        if (_this.getProxy() !== null) {
            requestOptions.proxy = _this.getProxy();
        }

        request(requestOptions)
            .on('error', function (err) {
                console.log(err)
                _this.downloadsInProgress--;
                _this.downloadsCompleted++;
                _this.engine();
            })
            .on('response', function (response) {
                if (response.statusCode == 200) {
                    console.log(`Download in progress: ${downloadItem.title} (${path.basename(downloadLink) })`);
                }
            })
            .on('end', function () {
                spinner.stop();
                console.log(`download complete for ${path.basename(downloadLink)}`);
                _this.downloadsInProgress--;
                _this.downloadsCompleted++;
                _this.engine();
            })
            .pipe(fs.createWriteStream(`./downloads/${sanitize(downloadItem.title)}${path.extname(downloadLink)}`)
        )
    }
}