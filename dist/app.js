"use strict";
var ignite_1 = require("./lib/ignite");
var ig = new ignite_1.ignite({
    maxConcurrentDownloads: 8,
    slidesAddresses: ['http://s.ch9.ms/events/ignite/2016/rss/slides', 'http://s.ch9.ms/events/ignite/2016/rss/slides?page=2'],
    videosAddresses: ['http://s.ch9.ms/events/ignite/2016/rss/mp4high', 'http://s.ch9.ms/events/ignite/2016/rss/mp4high?page=2'],
    proxy: {
        domain: process.argv[2],
        username: process.argv[3],
        password: process.argv[4],
        addressePort: process.argv[5]
    }
});
ig.download('slides');
// ig.download('video'); 
