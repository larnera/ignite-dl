interface Array<T> {
        eventPush(item, callback);
    }

declare namespace igniteInterfaces {

    interface config {
        maxConcurrentDownloads: number;
        slidesAddresses?: Array<string>;
        videosAddresses?: Array<string>;
        proxy?: proxy
    }

    interface proxy {
            domain: string;
            username: string;
            password: string;
            addressePort: string;
    }

    interface downloadItem {
        title: string;
        slidesLink: string;
        description: string;
        mediaContent: Array<Object>;
        downloadType: string;
    }

    interface downloadQueue extends Array<Object> { }

}

declare namespace downloadManagerInterfaces {

    interface config {
        maxConcurrentDownloads: number;
        proxy: igniteInterfaces.proxy;
    }

}
