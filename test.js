const chainweb = require('./src/chainweb');
const HeaderBuffer = require('./src/HeaderBuffer');

/* ************************************************************************** */
/* Cuts */

// chainweb.cut.peers().then(x => console.log("Cut Peers:", x));
// chainweb.cut.current().then(x => console.log("Current Cut:", x));

/* ************************************************************************** */
/* By Height */

// chainweb.header.height(0, 1000000).then(x => console.log("Header:", x));
// chainweb.block.height(0, 1000000).then(x => console.log("Block:", x));
// chainweb.transaction.height(0, 1000000).then(x => console.log("Transactions:", x));
// chainweb.event.height(0, 1000000).then(x => console.log("Events:", x));

/* ************************************************************************** */
/* By Block Hash */

const bh = 'k0an0qEORusqQg9ZjKrxa-0Bo0-hQVYLXqWi5LHxg3k';
// chainweb.header.blockHash(0, bh).then(x => console.log("Header:", x));
// chainweb.block.blockHash(0, bh).then(x => console.log("Block:", x));
// chainweb.transaction.blockHash(0, bh).then(x => console.log("Transactions:", x));
// chainweb.event.blockHash(0, bh).then(x => console.log("Events:", x));

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

// chainweb.header.recent(0, 3, 10).then(x => console.log("Headers:", x));
// chainweb.block.recent(0, 3, 10).then(x => console.log("Blocks:", x));
// chainweb.transaction.recent(0, 3, 50).then(x => console.log("Transactions:", x));
// chainweb.event.recent(0, 3, 1000).then(x => console.log("Events:", x));

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

// chainweb.header.range(0, 1500000, 1500010).then(x => console.log("Headers:", x));
// chainweb.block.range(0, 1500000, 1500010).then(x => console.log("Blocks:", x));
// chainweb.transaction.range(0, 1500000, 1500010).then(x => console.log("Transactions:", x));
// chainweb.event.range(0, 1500000, 1500010).then(x => console.log("Events:", x));

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

const chains = [0,1,9];
// const hs = chainweb.header.stream(2, chains, console.log);
// const bs = chainweb.block.stream(2, chains, console.log);
// const ts = chainweb.transaction.stream(2, chains, x => { console.log(x); });
// const es = chainweb.event.stream(2, chains, x => console.log(x));

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

console.log(testHeaderBuffer());
