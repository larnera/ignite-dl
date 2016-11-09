# ignite-dl
A small and simple node module written in TypeScript which allows you to download Microsoft Ignite Sessions Videos and Slidedecks.

The below examples show how to download Ignite 2016 content from channel 9.

## Install

Install with npm:

```js
npm install ignite-dl
```


## Usage

Download all slidedecks by passing in the RSS addresses:

```js
"use strict";
let ignite_dl = require("ignite-dl");

let ig = new ignite_dl.ignite({
    maxConcurrentDownloads: 8,
    slidesAddresses: ['http://s.ch9.ms/events/ignite/2016/rss/slides',
                      'http://s.ch9.ms/events/ignite/2016/rss/slides?page=2']
    })
     ig.download('slides');
```

Download all videos by passing in the RSS addresses:

```js
"use strict";
let ignite_dl = require("ignite-dl");

let ig = new ignite_dl.ignite({
    maxConcurrentDownloads: 8,
      videosAddresses: ['http://s.ch9.ms/events/ignite/2016/rss/mp4high',
                        'http://s.ch9.ms/events/ignite/2016/rss/mp4high?page=2']
    })   
    ig.download('slides');
```

If you are behind a corporate proxy, you can include your proxy credentials:

```js
"use strict";
let ignite_dl = require("ignite-dl");

let ig = new ignite_dl.ignite({
    maxConcurrentDownloads: 8,
    slidesAddresses: ['http://s.ch9.ms/events/ignite/2016/rss/slides',
                      'http://s.ch9.ms/events/ignite/2016/rss/slides?page=2'],
    proxy: {
        domain: 'yourDomain',
        username: 'yourUserName',
        password: 'yourPassword',
        addressePort: 'proxyaddress:80'
        }
    })

     ig.download('slides');
```


## Other Microsoft Events RSS 

You can also download Slidedecks and Videos for other MS events by changing the RSS addresses:


Build 2016 slides - http://s.ch9.ms/events/Build/2016/rss/slides

Build 2016 videos - http://s.ch9.ms/events/Build/2016/rss/mp4high


## Useful links

This project is loosely based on on the Powershell script:

https://gallery.technet.microsoft.com/Ignite-2016-Slidedeck-and-296df316



