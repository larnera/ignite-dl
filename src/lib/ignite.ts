
let cheerio = require('cheerio');
let request = require('requestretry').defaults({ agent: false });
let parseString = require('xml2js').parseString;

import {downloadManager} from "./ignite-dl-man";

export class ignite {
    public saveLocation: string;
    public slidesAddresses: Array<string>;
    public videosAddresses: Array<string>;
    public dl: downloadManager;

    private downloadQueue: igniteInterfaces.downloadQueue;

    private proxy: {
        domain: string;
        username: string;
        password: string;
        addressePort: string;
    }

    constructor(config: igniteInterfaces.config) {
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

        this.dl = new downloadManager({
            maxConcurrentDownloads: config.maxConcurrentDownloads,
            proxy: this.proxy
        })
    }

    public download(downloadType: string) : void {
        downloadType == 'slides' ? this.getDownloads(downloadType, this.slidesAddresses) : this.getDownloads(downloadType, this.videosAddresses);
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

    private getDownloads(downloadType: string, addresses: Array<string>) {
        console.log('Fetching bulk download metadata');

        if (!addresses) { console.log(`No ${downloadType} addresses provided.`); return false; }
        let _this = this;
        let requestCount = 0;
        addresses.forEach(function (item, index) {

            let requestOptions: any = {
                url: item,
                maxAttempts: 5,
                retryDelay: 5000,
            }

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
                })
                var data = parseString(body, function (err, result) {
                    let rssItem = result.rss.channel[0].item;
                    (rssItem).forEach(function (item, index) {
                        let mediaContent: Array<Object>;
                        if (item['media:group']) {
                            mediaContent = item['media:group'][0]['media:content'];
                        } else {
                            mediaContent = [];
                        }

                        let downloadItem: igniteInterfaces.downloadItem = {
                            title: (item.title).toString(),
                            slidesLink: item.enclosure[0].$.url,
                            mediaContent: mediaContent,
                            downloadType: downloadType,
                            description: (item.description).toString()
                        }
                        _this.downloadQueue.push(downloadItem);
                    })
                    requestCount++;
                    if (addresses.length == requestCount) {
                        console.log(_this.downloadQueue.length);
                        _this.dl.notifyManager(_this.downloadQueue);
                    }
                })
            })
        })
    }
}