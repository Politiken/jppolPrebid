# JPPOL Prebid
On-going project...
The same goes for this readme file..

**Work-in-progress:**

* Custom parameters sent to `jppolPrebid.init();`
* Site specific load times, `jppolPrebid.loadTimes`
* How to handle site specific functions, like `jppolPrebid.dacmoduleAddKvToPlacement()` and `jppolPrebid.dacmodulePlacementCallback()`
* Better logging functions and performance tracking

## Shared prebid.js implementation
This still an alpha-version and *not* all functions are fully implemented and working as intended yet.
This is also targeted towards Politiken.dk primarily, but should be somewhat usable for JP/EB in this state.

## Dependencies
Prebid.js framework: http://prebid.org/



# Table of Contents
1. [Quick-start guide](#quick-start-guide)
2. [Setup and build prebid.js](#setup-and-install-prebid.js)
3. [Config jppolPrebid](#config-jppolprebid)
4. [jppolPrebid functions](#jppolPrebid-functions)

# Quick-start guide
* Load `prebid.js` and `jppolPrebid.js` in your `<head>`-tag
* Create the your adUnits with [jppolPrebid.createAdUnit()](#createAdUnit())
* Initialize prebid with:
```
var prebidPresent = window.hasOwnProperty('jppolPrebid') && window.hasOwnProperty('pbjs');
if (prebidPresent) {
  jppolPrebid.debugPerformance ? console.log('performance|pbjs.que: initialized.', '| time:', performance.now()) : null;
  jppolPrebid.init();
  pbjs.setConfig(jppolPrebid.prebidConfig);
  pbjs.addAdUnits(jppolPrebid.adUnits);
  pbjs.requestBids({
      timeout: jppolPrebid.prebidTimeout,
      bidsBackHandler: typeof(jppolPrebid.bidsBackHandler === 'function') ? jppolPrebid.bidsBackHandler : console.log("pbjs.requestBids: Missing 'bidsBackHandler'-function")
  });
} else {
  console.log('pbjs or jppolPrebid is not loaded yet.');
}
```



# Setup and build prebid.js
We are currently using version `0.34.*` because some of our bidder-adapters are *not* supported in version `1.*.*` yet, namely `Xaxis` and `Criteo`.

## Build prebid.js
Check the `./prebid/bidderAdapters.json`-file and run `npm run build-prebid`, and `prebid.js` should complie to `./prebid/prebid.js`.

## Configure prebid.js
`Prebid.js` can be configured with [pbjs.setConfig()](http://prebid.org/dev-docs/publisher-api-reference.html#module_pbjs.setConfig).
*Bidder-deals note:* When working with custom bidder deals, remember to set enableSendAllBids to `true`, so that `hb_deal_XXXXX` (*XXXXX* would be your bidder-adapter's name) becomes available in `pbjs.getAdserverTargeting()`.


# Config jppolPrebid
**NOTE:**
config is hardcoded in `jppolPrebid.js` at the moment.
EB and JP should just overwrite config params, if needed.



# jppolPrebid functions
Below is an overview of functions available in the `jppolPrebid`-objcet and how to use them.

## init(config)
**NOTE:** The `config`-arguement is *NOT* implemented yet.
This should initialize jppolPrebid with optional `config`-parameters

### Example
```
var prebidConfigObject = {},
var arrayOfBannerTypes = [];
var arrayOfLoadTimes = [];
var config = {
  debug: true,
  debugPerformance: false,
  deviceType: 'mobile',
  prebidConfig: prebidConfigObject,
  bannerTypes: arrayOfBannerTypes,
  loadTimes: arrayOfLoadTimes
};
jppolPrebid.init(config)
```

## createAdUnit()
### loadTime
`loadTime`, in the example below, should correspond to a function in the `Loadtimes`-object set in `config` when framework was initialized with `jppolPrebid.init(config)`.
If `loadTime` is not defined, it will default to `pageLoad`, meaning when DOM content is ready.
### hideOnTablet
This parameter is probably only useful for Politiken.dk and should probably be removed from the jppolPrebid-object and added as "custom"-parameter.
### Examples
```
var adUnitParams = {
  // general params
  loadTime: '${ad.content.loadtime}',
  hideOnTablet: '${ad.content.hiddenOnTablets}',
  // prebid specific
  prebid: {
    code: '${model.adLabel}',
    type: '${ad.content.prebidType}',
    bidders: {
      adform: '${model.adformId}',
      rubicon: '${ad.content.rubiconId}',
      pubmatic: '${ad.content.pubmaticId}',
      xaxis: '${ad.content.xaxisId}',
      criteo: '${ad.content.criteoId}'
    }
  }
};
jppolPrebid.createAdUnit(adUnitParams);
```
or with performance logging:
```
;(function() {
  // create prebid adUnit
  if (window.jppolPrebid) {
    var performanceTestStart = jppolPrebid.debugPerformance ? performance.now() : null;
    var adUnitParams = {
      // general params
      loadTime: '${ad.content.loadtime}',
      hideOnTablet: '${ad.content.hiddenOnTablets}',
      // prebid specific
      prebid: {
        code: '${model.adLabel}',
        type: '${ad.content.prebidType}',
        bidders: {
          adform: '${model.adformId}',
          rubicon: '${ad.content.rubiconId}',
          pubmatic: '${ad.content.pubmaticId}',
          xaxis: '${ad.content.xaxisId}',
          criteo: '${ad.content.criteoId}'
        }
      }
    };
    jppolPrebid.createAdUnit(adUnitParams);
    jppolPrebid.debugPerformance ? console.log('performance|createAdUnit: Finished.', "milliseconds:", (performance.now() - performanceTestStart), '| time:', performance.now()) : null;
  }
})();
```



# Debug and logging

## Syntax
You can tell which function is logged what by looking at the beginning of logged data.
For example, `init: <some text>`, means that the log is inside `jppolPrebid.init()`.

Everything that starts with `performance|` is only logged when `debugPerformance: true` and has to do with event-timing and DOM-timing.

## URL params
Debugging can be turned simply by using the following query string: `?prebiddebug`.
And the for performance/timing debugging, with the following query string: `?prebidperformance`.
This can be very useful for debugging on the fly and when troubleshooting in live-environments.
Note that query strings are all lowercase.

Example: `https://politiken.dk/?prebiddebug&prebidperformance`

### prebiddebug
`?prebiddebug`: Will show all main event and errors in the console.

### prebidperformance
`?prebidperformance`: Logs timing for events

### prebidcpm
`?prebidcpm=<value>`: This will set a fixed cpm for each winning bid that is sent to AdTech, useful for forcing "winning"-bids. (`<value>` is *required* and should be an *integer*).

## Enable with debugging with 'config'-object
When working in dev-environments, you can turn on "debug" and "performance debugging" when jppolPrebid is initialized with [jppolPrebid.init()](##init(config)).

### Example
```
var config = {
	debug: true,
  debugPerformance: true,
  adtechFixedCpm: 1000
};
jppolPrebid.init(config);
```
Take a look at [Config jppolPrebid](#config-jppolprebid) for more config options.

## Debug functions
You can always call debug function manually, especially useful for debugging after the webpage has finished loading.
Data is logged in the browser console.

### showBidResponses
`jppolPrebid.showBidResponses()`: Shows a table of all bids returned by prebid (pbjs);

### showHighestCpmBids
`jppolPrebid.showHighestCpmBids()`: Shows all the highest bids, these are usually the bids sent to the ad-server.

### showRenderedBids
`jppolPrebid.showHighestCpmBids()`: Shows bids that have won the auction and have been rendered as an ad.
