import * as ig_dl from "./lib/ignite";

let ig = new ig_dl.ignite({
    maxConcurrentDownloads: 8,
    proxy: {
        domain: process.argv[2],
        username: process.argv[3],
        password: process.argv[4],
        addressePort: process.argv[5]
    },
    slidesAddresses: ['http://s.ch9.ms/Events/Visual-Studio/Visual-Studio-Live-Redmond-2016/RSS/slides'],
//    slidesAddresses: ['http://s.ch9.ms/events/ignite/2016/rss/slides', 'http://s.ch9.ms/events/ignite/2016/rss/slides?page=2'],
//    videosAddresses: ['http://s.ch9.ms/events/ignite/2016/rss/mp4high', 'http://s.ch9.ms/events/ignite/2016/rss/mp4high?page=2'],
    })

ig.download('slides');


/*
let ig = new ignite({
    maxConcurrentDownloads: 8,
    slidesAddresses: ['http://s.ch9.ms/events/ignite/2016/rss/slides', 'http://s.ch9.ms/events/ignite/2016/rss/slides?page=2'],
    videosAddresses: ['http://s.ch9.ms/events/ignite/2016/rss/mp4high', 'http://s.ch9.ms/events/ignite/2016/rss/mp4high?page=2'],
    proxy: {
        domain: process.argv[2],
        username: process.argv[3],
        password: process.argv[4],
        addressePort: process.argv[5]
    }
})

 // ig.download('video');
*/



