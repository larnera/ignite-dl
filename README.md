# ignite-dl
A small and simple node module written in TypeScript which allows you to download Microsoft Ignite Sessions Videos and Slidedecks.

The below examples show how to download Ignite 2016 content but I guess it should also return other Channel 9 content if needed.

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


## Useful links

This project is loosly based on on the Powershell script:

https://gallery.technet.microsoft.com/Ignite-2016-Slidedeck-and-296df316



