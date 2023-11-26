import http from "k6/http";
import { SharedArray } from "k6/data";
import { Rate } from "k6/metrics";
import dateFormat from '../../library/dateformat.js'
import { uuidv4 } from "../../library/utils.js";
import { randomItem } from "../../library/randomItem.js";
import papaparse from "../../library/papaparse.js";

const HOST = "pustovetov.mts.tld";

const testid = "mts-" + uuidv4()
export const options = {
  discardResponseBodies: true,
  summaryTrendStats: ["avg", "min", "med", "max", "p(90)", "p(95)", "p(99)"],
  systemTags: ['status'],
  thresholds: {
    http_req_duration: [
      {
        threshold: "p(99) < 6",
        abortOnFail: true,
        delayAbortEval: "30s",
      },
    ],
  },
  scenarios: {
    contacts: {
      executor: 'ramping-arrival-rate',
      timeUnit: '1s',
      startRate: 50,
      preAllocatedVUs: 3000,
      stages: [
        { target: 200, duration: '2m' },
        { target: 500, duration: '2m' },
        { target: 1000, duration: '2m' },
        { target: 2000, duration: '2m' },
      ],
    },
  },
  tags: {
    host: HOST,
    testid: testid
  },
};

const R400 = new Rate("R400");

const ammo = new SharedArray("ammo", function () {
  return papaparse.parse(open("../../ammo/mts.csv"), {
    header: false,
    skipEmptyLines: true,
  }).data;
});

export function setup() {
  console.log('Test ID: ' + testid)
}

export default function () {
  const trace = "loadtest-mts-" + uuidv4();

  const ammo_row = randomItem(ammo);

  const url = ammo_row[0];

  const httpParams = {
    timeout: '30s',
    headers: {
      "Content-Type": "application/json",
      "Accept-Encoding": "gzip",
      'Cache-Control': 'no-cache',
    },
  };

  const res_get_info = http.post('http://' + HOST + url, httpParams);
}