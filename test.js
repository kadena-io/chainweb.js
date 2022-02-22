const chainweb = require('./src/chainweb');
const HeaderBuffer = require('./src/HeaderBuffer');

/* ************************************************************************** */
/* Test settings */

jest.setTimeout(25000);
const debug = false;
// const streamTest = test.concurrent.skip;
const streamTest = test.concurrent;

/* ************************************************************************** */
/* Test Utils */

const logg = (...args) => { if (debug) { console.log(...args); } };

/* ************************************************************************** */
/* Retries */

describe("retry", () => {
    test("retry 404", async () => {
        let c = 0;
        let opts = { retries: 1, minTimeout: 20, onFailedAttempt: () => ++c };
        const r = chainweb.cut.current('invalid', undefined, { retry404: true, ... opts });
        expect(r).rejects.toThrow(chainweb.ResponseError);
        expect(r).rejects.toThrow("Request https://api.chainweb.com/chainweb/0.0/invalid/cut failed with 404, Not Found");
        await r.catch((e) => { return });
        expect(c).toBe(2);
    });
    test("abort 404", async () => {
        let c = 0;
        let opts = { retries: 1, minTimeout: 20, onFailedAttempt: () => ++c };
        const r = chainweb.cut.current('invalid', undefined, opts);
        expect(r).rejects.toThrow(chainweb.ResponseError);
        expect(r).rejects.toThrow("Request https://api.chainweb.com/chainweb/0.0/invalid/cut failed with 404, Not Found");
        await r.catch((e) => { return });
        expect(c).toBe(0);
    });
});

/* ************************************************************************** */
/* Cuts */

describe("Cuts", () => {
    test("peers", async () => {
        const r = await chainweb.cut.peers("mainnet01", "https://us-e1.chainweb.com");
        logg("Cut Peers:", r);
        expect(r).toBeTruthy();
        expect(r.length).toBeGreaterThan(0);
    });
    test("current", async () => {
        const r = await chainweb.cut.current();
        logg("Current Cut:", r);
        expect(r).toBeTruthy();
        expect(r).toHaveProperty('instance');
        expect(r).toHaveProperty('height');
        expect(r).toHaveProperty('weight');
        expect(r).toHaveProperty('hashes');
        expect(Object.keys(r.hashes).length).toBe(20);
        expect(r.instance).toBe('mainnet01');
        expect(r.height).toBeGreaterThan(30000000);
        expect(r.hashes[0].height).toBeGreaterThan(1800000);
    });
});

/* ************************************************************************** */
/* By Height */

const header = {
    "adjacents": {
        "10": "oT8NLW-IZSziaOgI_1AfCdJ18u3epFpGONrkQ_F6w_Y",
        "15": "ZoBvuaVZWBOKLaDZfM51A9LaKb5B1f2fW83VLftQa3Y",
        "5": "SDj4sXByWVqi9epbPAiz1zqhmBGJrzSY2bPk9-IMaA0",
    },
    "chainId": 0,
    "chainwebVersion": "mainnet01",
    "creationTime": 1617745627822054,
    "epochStart": 1617743254198411,
    "featureFlags": 0,
    "hash": "BsxyrIDE0to4Kn9bjdgR_Q7Ha9bYkzd7Yso8r0zrdOc",
    "height": 1511601,
    "nonce": "299775665679630368",
    "parent": "XtgUmsnF20vMX4Dx9kN2W8cIXXiLNtDdFZLugMoDjrY",
    "payloadHash": "2Skc1JkkBdLPkj5ZoV27nzhR3WjGD-tJiztCFGTaKIQ",
    "target": "9sLMdbnd1x6vtRGpIw5tKMt_1hgprJS0oQkAAAAAAAA",
    "weight": "iFU5b59ACHSOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
};

const pactEvent = {
    "height": 1511601,
    "module": {
        "name": "coin",
        "namespace": null,
    },
    "moduleHash": "ut_J_ZNkoyaPUEJhiwVeWnkSQn9JT9sQCWKdjjVVrWo",
    "name": "TRANSFER",
    "params": [
        "4677a09ea1602e4e09fe01eb1196cf47c0f44aa44aac903d5f61be7da3425128",
        "f6357785d8b147c1fac66cdbd607a0b1208d62996d7d62cc92856d0ab229bea2",
        10462.28,
    ],
};

const height = header.height;
const blockHash = header.hash;

describe("by height", () => {
    test("Header", async () => {
        const r = await chainweb.header.height(0, height);
        logg("Header:", r);
        expect(r).toEqual(header);
    });
    test("Block", async () => {
        const r = await chainweb.block.height(0, height);
        logg("Block:", r);
        expect(r).toHaveProperty('header');
        expect(r.header).toEqual(header);
        expect(r).toHaveProperty('payload');
        expect(r.payload.payloadHash).toEqual(header.payloadHash);
    });
    test("Transactions", async () => {
        const r = await chainweb.transaction.height(0, height);
        logg("Transactions:", r);
        expect(r.length).toBe(1);
        expect(r[0]).toHaveProperty('transaction');
        expect(r[0]).toHaveProperty('output');
        expect(r[0]).toHaveProperty('height');
        expect(r[0].height).toBe(height);
    });
    test("Events", async () => {
        const r = await chainweb.event.height(0, height);
        logg("Events:", r);
        expect(r.length).toBe(1);
        expect(r[0]).toEqual(pactEvent);
    });
});

/* ************************************************************************** */
/* By Block Hash */

describe("by blockHash", () => {
    test("Header", async () => {
        const r = await chainweb.header.blockHash(0, blockHash);
        logg("Header:", r);
        expect(r).toEqual(header);
    });
    test("Block", async () => {
        const r = await chainweb.block.blockHash(0, blockHash);
        logg("Block:", r);
        expect(r).toHaveProperty('header');
        expect(r.header).toEqual(header);
        expect(r).toHaveProperty('payload');
        expect(r.payload.payloadHash).toEqual(header.payloadHash);
    });
    test("Transactions", async () => {
        const r = await chainweb.transaction.blockHash(0, blockHash);
        logg("Transactions:", r);
        expect(r.length).toBe(1);
        expect(r[0]).toHaveProperty('transaction');
        expect(r[0]).toHaveProperty('output');
        expect(r[0]).toHaveProperty('height');
        expect(r[0].height).toBe(height);
    });
    test("Events", async () => {
        const r = await chainweb.event.blockHash(0, blockHash);
        logg("Events:", r);
        expect(r.length).toBe(1);
        expect(r[0]).toEqual(pactEvent);
    });
});

/* ************************************************************************** */
/* Recents */

/* These functions return items from recent blocks in the block history starting
 * at a given depth.
 *
 * The depth parameter is useful to avoid receiving items from orphaned blocks.
 *
 * Currently, there is no support for paging. There is thus a limit on the
 * size of the range that can be handled in a single call. The function simply
 * return whatever fits into a server page.
 */

describe("recents", () => {
    test.each([0,1,2,15])("Header %p", async (n) => {
        const cur = (await chainweb.cut.current()).hashes[0].height;
        const r = await chainweb.header.recent(0, 10, n);
        logg("Header:", r);
        expect(r).toBeTruthy();
        expect(r.length).toBe(n);
        r.forEach((v, i) => {
            expect(v.height).toBeLessThanOrEqual(cur - 10);
            expect(v.chainwebVersion).toBe("mainnet01");
            if (i > 0) {
                expect(v.height).toBe(r[i-1].height + 1);
            }
        });
    });
    test.each([0,10,359,360,361])("Block %p", async (n) => {
        const cur = (await chainweb.cut.current()).hashes[0].height;
        const r = await chainweb.block.recent(0, 10, n);
        logg("Block:", r);
        expect(r).toBeTruthy();
        expect(r.length).toBe(n);
        r.forEach((v, i) => {
            expect(v.header.height).toBeLessThanOrEqual(cur - 10);
            expect(v.payload).toHaveProperty("coinbase");
            expect(v.header.chainwebVersion).toBe("mainnet01");
            expect(v.payload.payloadHash).toEqual(v.header.payloadHash);
            if (i > 0) {
                expect(v.header.height).toBe(r[i-1].header.height + 1);
            }
        });
    });
    test.each([0,10,100])("Transactions %p", async (n) => {
        const cur = (await chainweb.cut.current()).hashes[0].height;
        const r = await chainweb.transaction.recent(0, 10, n);
        logg("Transactions:", r);
        expect(r).toBeTruthy();
        r.forEach((v, i) => {
            expect(v.height).toBeLessThanOrEqual(cur - 10);
            if (i > 0) {
                expect(v.height).toBeGreaterThanOrEqual(r[i-1].height);
            }
        });
    });
    test("Events", async () => {
        const cur = (await chainweb.cut.current()).hashes[0].height;
        const r = await chainweb.event.recent(0, 10, 15);
        logg("Events:", r);
        expect(r).toBeTruthy();
        r.forEach((v, i) => {
            expect(v.height).toBeLessThanOrEqual(cur - 10);
            if (i > 0) {
                expect(v.height).toBeGreaterThanOrEqual(r[i-1].height);
            }
        });
    });
});

/* ************************************************************************** */
/* Ranges */

/* These functions query items from a range of block heights and return the
 * result as an array.
 *
 * Currently, there is no support for paging. There is thus a limit on the
 * size of the range that can be handled in a single call. The function simply
 * return whatever fits into a server page.
 *
 * Streams are online and only return items from blocks that got mined after the
 * stream was started. They are thus useful for prompt notification of new
 * items. In order of exhaustively querying all, including old, items, one
 * should also use `range` or `recent` queries for the respective type of item.
 */

describe("range", () => {
    test.each([1,10,359,360,361,730])("Header %p", async (n) => {
        const r = await chainweb.header.range(0, height, height + (n - 1));
        logg("Header:", r);
        expect(r.length).toEqual(n);
        expect(r[0]).toEqual(header);
        r.forEach((v, i) => {
            expect(v.height).toBe(header.height + i);
            expect(v.chainwebVersion).toBe(header.chainwebVersion);
            if (i > 1) {
                expect(v.creationTime).toBeGreaterThan(header.creationTime);
                expect(v.creationTime).toBeGreaterThan(r[i-1].creationTime);
            }
        });
    });
    test.each([1,10,359,360,361,730])("Block %p", async (n) => {
        const r = await chainweb.block.range(0, height, height + (n-1));
        logg("Block:", r);
        expect(r.length).toEqual(n);
        expect(r[0].header).toEqual(header);
        r.forEach((v, i) => {
            expect(v.payload.payloadHash).toEqual(v.header.payloadHash);
            expect(v.header.height).toBe(header.height + i);
            expect(v.header.chainwebVersion).toBe(header.chainwebVersion);
            if (i > 1) {
                expect(v.header.creationTime).toBeGreaterThan(header.creationTime);
                expect(v.header.creationTime).toBeGreaterThan(r[i-1].header.creationTime);
            }
        });
    });
    test.each([10,370])("Transactions %p", async (n) => {
        const r = await chainweb.transaction.range(0, height, height + (n-1));
        logg("Transactions:", r);
        r.forEach((v,i) => {
            expect(v).toHaveProperty('transaction');
            expect(v).toHaveProperty('output');
            expect(v).toHaveProperty('height');
            expect(v.height).toBeGreaterThanOrEqual(header.height + i);
        });
    });
    test.each([10, 370])("Events %p", async (n) => {
        const r = await chainweb.event.range(0, height, height + (n-1));
        logg("Events:", r);
        r.forEach((v,i) => {
            expect(v).toHaveProperty('params');
            expect(v).toHaveProperty('name');
            expect(v).toHaveProperty('module');
            expect(v).toHaveProperty('moduleHash');
            expect(v).toHaveProperty('height');
            expect(v.height).toBeGreaterThanOrEqual(header.height + i);
        });
    });
});

/* ************************************************************************** */
/* Streams */

/* Streams are backed by EventSource clients that retrieve header update
 * events from the Chainweb API.
 *
 * The depth parameter is useful to avoid receiving items from orphaned blocks.
 *
 * The functions buffer, filter, and transform the original events and
 * generate a stream of derived items to which a callback is applied.
 *
 * The functions also return the underlying EventSource object, for more
 * advanced low-level control.
 */

const sleep = (ms) => new Promise((resolve) => setTimeout(() => resolve(), ms));

const chains = [0,2,4,6,8,10,12,14,16,18];
const allChains = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19];

describe("stream", () => {
    streamTest("Header", async () => {
        let count = 0;
        const hs = chainweb.header.stream(1, chains, (h) => {
            logg("new header", h);
            expect(h.chainId % 2).toBe(0);
            count++
        });
        logg("header stream started");
        await sleep(60000);
        hs.close();
        logg("header stream closed");
        expect(count).toBeGreaterThan(4);
    }, 61000);

    streamTest("Block", async () => {
        let count = 0;
        const hs = chainweb.block.stream(1, chains, (h) => {
            logg("new block", h);
            expect(h.header.chainId % 2).toBe(0);
            count++
        });
        logg("block stream started");
        await sleep(60000);
        hs.close();
        logg("block stream closed");
        expect(count).toBeGreaterThan(4);
    }, 61000);

    streamTest("Transactions", async () => {
        let count = 0;
        const hs = chainweb.transaction.stream(1, allChains, (h) => {
            logg("new transaction", h);
            count++
        });
        logg("transaction stream started");
        await sleep(60000);
        hs.close();
        logg("transaction stream closed");
        expect(count).toBeGreaterThanOrEqual(0);
    }, 61000);

    streamTest("Events", async () => {
        let count = 0;
        const hs = chainweb.event.stream(1, allChains, (h) => {
            logg("new event", h);
            count++
        });
        logg("event stream started");
        await sleep(60000);
        hs.close();
        logg("event stream closed");
        expect(count).toBeGreaterThanOrEqual(0);
    }, 61000);

}, 61000);

/* ************************************************************************** */
/* HeaderBuffer */

function testHeaderBuffer () {

    let output = [];
    const hb = new HeaderBuffer(2, x => output.push(x));

    const hdr = i => ({
        header: {
            hash: `${i}`,
            parent: `${i - 1}`,
            height: i
        }
    });

    for (let i = 10; i < 15; ++i) {
        // console.log("i:", i); console.log("buffer:", hb);
        hb.add(hdr(i));
    }

    // reorg
    for (let i = 13; i < 17; ++i) {
        // console.log("i:", i); console.log("buffer:", hb);
        hb.add(hdr(i));
    }

    let a = 10;
    return output.every(x => x.header.hash == a++);
}

test("HeaderBuffer", () => {
    expect(testHeaderBuffer()).toBe(true);
});
