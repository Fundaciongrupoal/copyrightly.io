const YouTubeEvidences = artifacts.require("YouTubeEvidences");
const Manifestations = artifacts.require('Manifestations');
const Proxy = artifacts.require("AdminUpgradeabilityProxy");

const web3 = require('web3');

contract('YouTubeEvidences - Check YouTube video ownership', function (accounts) {

  const OWNER = accounts[0];
  const PROXYADMIN = accounts[1];
  const MANIFESTER = accounts[2];
  const TITLE = "Snow Againg in Mollerussa";
  const HASH1 = "QmPP8X2rWc2uanbnKpxfzEAAuHPuThQRtxpoY8CYVJxDj8";
  const HASH2 = "QmPP8X2rWc2uanbnKpxfzEAAuHPuThQRtxpoY8CYVJxdJ9";
  const VIDEO_ID1 = "ZwVNLDIJKVA";
  const VIDEO_ID2 = "3ANLBcUwizg";
  const ORACLIZE_GASLIMIT = 100000;
  const ORACLIZE_GASPRICE = 10000000000; // 10 GWei
  const ORACLIZE_DELAY = 30*1000; // 30 seconds


  let evidences, proxy, manifestations, evidenceId, evidencedIdHash, evidenceVideoId, exception, price;

  before('setup contracts for each test', async () => {
    evidences = await YouTubeEvidences.new(ORACLIZE_GASPRICE);
    proxy = await Proxy.deployed();
    manifestations = await Manifestations.at(proxy.address);
    manifestations.addEvidenceProvider(evidences.address);

    await manifestations.manifestAuthorship(HASH1, TITLE, {from: MANIFESTER});

    price = await evidences.getPrice(ORACLIZE_GASLIMIT);
    console.log("Oraclize price: " + web3.utils.fromWei(price + "") + " ether");
    console.log("Prefixed gas limit: " + ORACLIZE_GASLIMIT);
    console.log("Custom gas price: " + ORACLIZE_GASPRICE);
  });

  it("should add evidence for YouTube video linked to manifestation", async () => {

    let eventEmitted = false;
    const event = evidences.YouTubeEvidenceEvent();
    await event.watch((error, result) => {
      evidenceId = result.args.evidenceId;
      evidencedIdHash = result.args.evidencedIdHash;
      evidenceVideoId = result.args.videoId;
      eventEmitted = true;
    });

    await evidences.check(manifestations.address, HASH1, VIDEO_ID1, ORACLIZE_GASLIMIT, {value: price});

    await sleep(ORACLIZE_DELAY); // Wait for Oraclize callback

    assert.equal(eventEmitted, true,
        'YouTube video linked to its manifestation should emit a YouTubeEvidenceEvent');
    assert.equal(evidencedIdHash, web3.utils.soliditySha3(HASH1),
        'unexpected evidence event hash');
    assert.equal(evidenceVideoId, VIDEO_ID1,
        'unexpected evidence event video id');
  });

  it("shouldn't add evidence for YouTube video not linked to manifestation", async () => {

    let eventEmitted = false;
    const event = evidences.YouTubeEvidenceEvent();
    await event.watch((error, result) => {
      evidenceId = result.args.evidenceId;
      evidencedIdHash = result.args.evidencedIdHash;
      evidenceVideoId = result.args.videoId;
      eventEmitted = true;
    });

    await evidences.check(manifestations.address, HASH1, VIDEO_ID2, ORACLIZE_GASLIMIT, {value: price});

    await sleep(ORACLIZE_DELAY); // Wait for Oraclize callback

    assert.equal(eventEmitted, false,
      'YouTube video not linked to its manifestation shouldn\'t emit a YouTubeEvidenceEvent');
  });

  it("shouldn't add evidence if manifestation does not exist", async () => {

    let eventEmitted = false;
    const event = evidences.YouTubeEvidenceEvent();
    await event.watch((error, result) => {
      evidenceId = result.args.evidenceId;
      evidencedIdHash = result.args.evidencedIdHash;
      evidenceVideoId = result.args.videoId;
      eventEmitted = true;
    });

    await evidences.check(manifestations.address, HASH2, VIDEO_ID1, ORACLIZE_GASLIMIT, {value: price});

    await sleep(ORACLIZE_DELAY); // Wait for Oraclize callback

    assert.equal(eventEmitted, false,
      'Evidence for non-existing manifestation shouldn\'t emit a YouTubeEvidenceEvent');
  });


  it("shouldn't add evidence if not enough ether for Oraclize call", async () => {
    exception = false;

    try {
      await evidences.check(manifestations.address, HASH1, VIDEO_ID1, ORACLIZE_GASLIMIT, {value: price - 1});
    } catch(e) {
      assert(e.message, "Error: VM Exception while processing transaction: revert");
      exception = true;
    }

    assert.equal(exception, true,
      'Not providing enough ether for Oraclize call should raise revert exception');
  });

  it("should be able to get a callback gas estimate", async () => {

    let eventEmitted = false;
    const event = evidences.OraclizeQuery();
    await event.watch((error, result) => {
      evidenceId = result.args.evidenceId;
      eventEmitted = true;
    });

    await evidences.check(manifestations.address, HASH1, VIDEO_ID1, ORACLIZE_GASLIMIT, {value: price});

    assert.equal(eventEmitted, true, 'Oraclize query event should be emitted');
    const gasEstimate = await evidences.__callback.estimateGas(evidenceId, "1.0");
    console.log("Gas estimate: " + gasEstimate);
    assert(gasEstimate > 0, 'Gas estimate for callback should be higher than 0');
  });

});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
