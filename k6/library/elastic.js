import http from 'k6/http';
import papaparse from './papaparse.js';

import {
    SharedArray
} from "k6/data";
import {
    uuidv4,
    randomItem
} from "./utils.js";
import {
    group,
    check
} from 'k6';


// HOST,HOSTNAME
// 0,1
const HOSTS = new SharedArray("hosts", function () {
    return papaparse.parse(open('../ammo/elastic-catalog.csv'), {
        header: false
    }).data;
});

const URL_TYPE = "http"
// Import json to memory
// not using SharedArray here will mean that the code in the function call (that is what loads and
// parses the json) will be executed per each VU which also means that there will be a complete copy
// per each VU
const ELASTIC_QUERIES = new SharedArray('elastic-requests', function () {
    return JSON.parse(open('./elastic_queries.json'));
  });
  
export default function elastic_shooter(URLS, SERVICE) {

    let host = HOSTS[Math.floor(Math.random() * HOSTS.length)];
    
    var params = {
        redirects: 10,
        timeout: '30s',
        cookies: {},
        headers: {
            'Content-Encoding': 'utf-8',
            'Content-Type': 'application/json'
        },
    };

    let trace = "loadtest-" + SERVICE + "-" + uuidv4()
    group(SERVICE, function () {
        URLS.forEach(element => {
            //Randomize Requests from JSON
            let body = randomItem(ELASTIC_QUERIES)

            params.headers['X-Trace-Id'] = trace + "-" + uuidv4()
            let res = http.post(URL_TYPE + '://' + host[0] + ':9200' + '/' + element['url'], JSON.stringify(body), params)
            
            check(res, {
                'code 200': (res) => res.status === 200,
                'code 3XX': (res) => (res.status >= 300 && res.status <= 400),
                'code 4XX': (res) => (res.status >= 400 && res.status <= 500),
                'code 5XX': (res) => (res.status >= 500 && res.status <= 600)
            }, {
                endpoint: element['url'],
                status: res.status
            });
        });
    });

}

