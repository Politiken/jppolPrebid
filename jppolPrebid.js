;(function (window) {
  window.jppolPrebid = {
    /////////////////////////////
    // settings
    /////////////////////////////
    debug: false,
    debugPerformance: false,
    adtechFixedCpm: false,
    deviceType: 'desktop',
    prebidTimeout: 1200,
    // prebidConfig: http://prebid.org/dev-docs/publisher-api-reference.html#module_pbjs.setConfig
    prebidConfig: {
      debug: false,
      bidderTimeout: 3000,
      cookieSyncDelay: 100,
      publisherDomain: "https://politiken.dk",
      priceGranularity: "medium",
      enableSendAllBids: true
    },
    // bidderAdapters: http://prebid.org/dev-docs/bidder-adaptor.html
    bidderAdapters: {
      // AdForm: http://prebid.org/dev-docs/bidders.html#adform
      adform: {},
      // Criteo: http://prebid.org/dev-docs/bidders.html#criteo
      criteo: {},
      // PubMatic: http://prebid.org/dev-docs/bidders.html#pubmatic
      pubmatic: {
        publisherId: 156010
      },
      // Rubicon: http://prebid.org/dev-docs/bidders.html#rubicon
      rubicon: {
        accountId: 10093,
        siteIdPhone: 167670,
        siteIdTablet: 167670,
        siteIdDesktop: 167672,
        sizeMap: {
          1: '468x60',
          2: '728x90',
          8: '120x600',
          9: '160x600',
          10: '300x600',
          14: '250x250',
          15: '300x250',
          16: '336x280',
          19: '300x100',
          31: '980x120',
          32: '250x360',
          33: '180x500',
          35: '980x150',
          37: '468x400',
          38: '930x180',
          43: '320x50',
          44: '300x50',
          48: '300x300',
          54: '300x1050',
          55: '970x90',
          57: '970x250',
          58: '1000x90',
          59: '320x80',
          60: '320x150',
          61: '1000x1000',
          65: '640x480',
          67: '320x480',
          68: '1800x1000',
          72: '320x320',
          73: '320x160',
          78: '980x240',
          79: '980x300',
          80: '980x400',
          83: '480x300',
          94: '970x310',
          96: '970x210',
          101: '480x320',
          102: '768x1024',
          103: '480x280',
          113: '1000x300',
          117: '320x100',
          125: '800x250',
          126: '200x600'
        }
      },
      // Xaxis: http://prebid.org/dev-docs/bidders.html#xhb
      xaxis: {}
    },
    // banner types and corresponding sizes
    bannerTypes: {
      megaboard: [[930, 180]],
      skyscraper: [[160, 600], [300, 600]],
      monster: [[930, 180], [930, 600]],
      rectangle: [[300, 250]],
      halfpage: [[160, 600], [300, 600]],
      swedish: [[160, 320], [250, 320], [320, 320]]
    },
    // TODO: IMPLEMENT THIS or find a better method
    // banner load times, used in renderPrebidAd()
    loadTimes: {
      instant: function(iframeDoc, bid) {
        var pbjs = window.pbjs;
        var adId = bid.adId;
        var adUnitCode = bid.adUnitCode;

        this.debug ? console.log("renderPrebidAd: loadTimes.instant()", 'adUnitCode:', adUnitCode) : null;
        pbjs.renderAd(iframeDoc, adId);
      },
      pageload: function(iframeDoc, bid) {
        var pbjs = window.pbjs;
        var adId = bid.adId;
        var adUnitCode = bid.adUnitCode;

        this.debug ? console.log("renderPrebidAd: loadTimes.pageload()", 'adUnitCode:', adUnitCode) : null;
        if (/complete|loaded|interactive/.test(document.readyState)) {
          pbjs.renderAd(iframeDoc, adId);
        } else {
          document.addEventListener('DOMContentLoaded', function() {
            pbjs.renderAd(iframeDoc, adId);
          });
        }
      },
      lazy: function(iframeDoc, bid) {
        var self = this;
        var pbjs = window.pbjs;
        var adId = bid.adId;
        var adUnitCode = bid.adUnitCode;
        var container = getElementByid(adUnitCode);

        this.debug ? console.log("renderPrebidAd: loadTimes.lazy()", 'adId:', adId, 'adUnitCode:', adUnitCode) : null;
        // get top of ad container
        var containerPostion = container.getBoundingClientRect();
        var bannerTop = containerPostion.top ? containerPostion.top : 1;

        // check if user alrady scrolled past this ad, and should load ad on pageload
        if ((window.pageYOffset + window.innerHeight + 1000) > bannerTop) {
          pbjs.renderAd(iframeDoc, adId);
        } else {
          var lazyLoadDone = false;
          var updateScroll = true;

          // add scrollListener
          function scrollListener() {
            if (lazyLoadDone) {
              self.debug ? console.log('renderPrebidAd: lazy-loading done for AdUnit:', adUnitCode, ', removing eventListener') : null;
              window.removeEventListener("scroll", scrollListener);
            } else {
              if (updateScroll && bannerTop) {
                window.requestAnimationFrame(function () {
                  if ((window.pageYOffset + window.innerHeight + 1000) > bannerTop) {
                    self.debug ? console.log('renderPrebidAd: lazy-loading AdUnit:', adUnitCode) : null;
                    pbjs.renderAd(iframeDoc, adId);
                    lazyLoadDone = true;
                  }
                  updateScroll = true;
                });
                updateScroll = false;
              }
            }
          }
          window.addEventListener("scroll", scrollListener);
        }
      },
      afterWallpaper: function(iframeDoc, bid) {
        var self = this;
        var pbjs = window.pbjs;
        var adId = bid.adId;
        var adUnitCode = bid.adUnitCode;

        this.debug ? console.log('renderPrebidAd: loadTimes.afterWallpaper()', 'adUnitCode:', adUnitCode) : null;
        if (window.dacmodule && typeof(window.dacmodule.getWallpaperStatus) === 'function') {
          // get wallpaper status
          var wallpaperStatus = window.dacmodule.getWallpaperStatus();
          if (wallpaperStatus.wallpaperPlacementLoaded && wallpaperStatus.wallpaperStylingPresent) {
            this.debug ? console.log('renderPrebidAd: afterWallpaper adUnit will not be loaded', 'adUnitCode:', adUnitCode) : null;
          } else if (wallpaperStatus.wallpaperPlacementLoaded && !wallpaperStatus.wallpaperStylingPresent) {
            this.debug ? console.log('renderPrebidAd: afterWallpaper rendering.', 'adId:', adId) : null;
            pbjs.renderAd(iframeDoc, adId);
          } else {
            var timer = setInterval(function() {
              // get updated wallpaper status
              wallpaperStatus = window.dacmodule.getWallpaperStatus();

              // wait for wallpaper-position to load
              if (wallpaperStatus.wallpaperPlacementLoaded) {
                self.debug ? console.log('renderPrebidAd: afterWallpaper waiting for wallpaper-position.', 'adUnitCode:', adUnitCode) : null;
                if (wallpaperStatus.wallpaperStylingPresent) {
                  self.debug ? console.log('renderPrebidAd: afterWallpaper adUnit will not be loaded', 'adUnitCode:', adUnitCode) : null;
                  clearInterval(timer);
                } else {
                  self.debug ? console.log('renderPrebidAd: afterWallpaper rendering after waiting for wallpaper-position.', 'adUnitCode:', adUnitCode) : null;
                  pbjs.renderAd(iframeDoc, adId);
                  clearInterval(timer);
                }
              }
            }, 200);
          }
        } else {
          this.debug ? console.log("renderPrebidAd: loadTimes.afterWallpaper(), 'dacmodule' not found or 'dacmodule.getWallpaperStatus()' is not a function", 'dacmodule:', window.dacmodule, 'adUnitCode:', adUnitCode) : null;
          // TODO: fallback
        }
      }
    },
    // callback function for prebid.js, used after requesting bids
    bidsBackHandler: function() {
      // performance test
      var performanceTestStart = window.jppolPrebid.debugPerformance ? performance.now() : null;

      // NOTICE:
      // 'this' refers to 'pbjs'-object, since this function will be called within 'pbjs.requestBids'
      // therefore 'self' is set to 'window.jppolPrebid', and NOT 'this'
      var pbjs = this;
      var self = window.jppolPrebid;

      // find bids
      var winningBids = pbjs.getHighestCpmBids();
      var adServerTargets = pbjs.getAdserverTargeting();
      var bidResponses = pbjs.getBidResponses();

      // loop bids
      for (var key in adServerTargets) {
        var adUnitCode = key;
        var adServerTarget = adServerTargets[adUnitCode];
        var adStatus = self.adUnitsStatus[adUnitCode];

        // default values adTech values
        var adTechCpm = 0;
        var xhbDeal = false;
        var adformDeal = '';
        var kvObject = {};

        // get "normal" prebid bid winners
        if (adServerTarget.hasOwnProperty('hb_adid')) {
          var winningBid = winningBids.find(function(obj) {return obj['adUnitCode'] === adUnitCode;});

          // store winning bid for later use
          if (winningBid && typeof(adStatus) === 'object' && adStatus.hasOwnProperty('highestBid')) {
            adStatus['highestBid'] = winningBid;
          }

          // update CPM send to adTech
          if (winningBid && winningBid.hasOwnProperty('cpm')) {
            // overwrite adTechCpm, only used for testing
            // otherwise send the actual winning CPM
            adTechCpm = self.adtechFixedCpm ? self.adtechFixedCpm : self.getAdtechCpm(winningBid['cpm']);
          }
        }

        // check for XHB deal on this bid
        // TODO: If possible, handle this like we handle adform deals
        if (adServerTarget.hasOwnProperty('hb_xhb_adid') && adServerTarget.hasOwnProperty('hb_xhb_deal')) {
          xhbDeal = (adServerTarget['hb_xhb_deal'] === '99999999');

          if (xhbDeal) {
            var xhbBids = pbjs.getBidResponsesForAdUnitCode(adUnitCode.toString());

            if (xhbBids.bids.length) {
              var xhbWinner = xhbBids.bids.find(function(obj) {return obj['bidder'] === 'xhb';});
              // store xhb bid for later use
              if (xhbWinner && typeof(adStatus) === 'object' && adStatus.hasOwnProperty('xhbBid')) {
                adStatus['xhbBid'] = xhbWinner;
              }
            }
          }
        }

        // check for AdForm deal on this bid
        // NOTE: this only works when pbjs.setConfig enableSendAllBids is true
        if (adServerTarget.hasOwnProperty('hb_bidder_adform') && adServerTarget.hasOwnProperty('hb_deal_adform')) {
          adformDeal = adServerTarget.hb_deal_adform;
        }

        self.debug ? console.log('bidsBackHandler: adUnitCode:', adUnitCode, 'adTechCpm:', adTechCpm, 'xhbDeal:', xhbDeal, 'hb_deal_adform:', adformDeal) : null;

        // send key/values to dacmodule/AdTech
        if (adTechCpm > 0 || xhbDeal || adformDeal) {
          kvObject = {
            prebid: adTechCpm,
            prebidXHB: xhbDeal ? 1 : 0,
            hb_deal_adform: adformDeal
          };
          adStatus['adTechData'] = kvObject;
          self.debug ? console.log('bidsBackHandler: Adding kvObject to adTech placement.', 'kvObject:', kvObject) : null;
          self.dacmoduleAddKvToPlacement(adUnitCode, kvObject);
        }
      }

      // debugging data
      if (self.debug) {
        self.showBidResponses();
        self.showHighestCpmBids();
        //self.showRenderedBids();
      }
      self.debugPerformance ? console.log("performance|bidsBackHandler: looping adServerTargets done.", "milliseconds:", (performance.now() - performanceTestStart)) : null;

      // load remaining dacmodule ads after prebid.js
      self.debugPerformance ? console.log("performance|bidsBackHandler: dacmoduleLoadPlacements() initialize.", "milliseconds:", (performance.now() - performanceTestStart)) : null;
      self.dacmoduleLoadPlacements();
      self.debugPerformance ? console.log("performance|bidsBackHandler: dacmoduleLoadPlacements() done.", "milliseconds:", (performance.now() - performanceTestStart)) : null;

      // debug performance finished
      self.debugPerformance ? console.log("performance|bidsBackHandler: Finished.", "milliseconds:", (performance.now() - performanceTestStart), ' | time:', performance.now()) : null;
    },
    // depends od dacmodule.js/AdTech: add extra kv to placement
    dacmoduleAddKvToPlacement: function(placementId, kvObject) {
      // TODO: figure out a more reliable way of getting dacmodule/AdTech placements
      // maybe set window.placements on jppolPrebid-object, inside jppolPrebid.init() ??
      var self = this;
      var dacmodulePlacements = window.placements;

      if (dacmodulePlacements) {
        if (placementId && typeof(kvObject) && kvObject !== null) {
          if (dacmodulePlacements.length && Array.isArray(dacmodulePlacements)) {
            for (var i = 0; i < dacmodulePlacements.length; i++) {
              var placement = dacmodulePlacements[i];

              if (placement.hasOwnProperty('placementId')) {
                if (parseInt(placement['placementId']) === parseInt(placementId)) {
                  // custom adTech key/values
                  // send highest prebid cpm to adTech, example: kv:{prebid: 123}.
                  // and set if placement has an xhb deal, example kv:{xhb: 1}.
                  this.debug ? console.log('dacmoduleAddKvToPlacement: Addding kv to placement in dacmodule.', 'placementId:', placementId, 'kvObject:', kvObject) : null;
                  placement['kv'] = kvObject;
                  break;
                }
              }
            }
          } else if (this.debug) {
            console.log('dacmoduleAddKvToPlacement: Could not find "placements" for dacmodule, or "placements" is empty.', 'window.placements:', dacmodulePlacements);
          }
        } else if (this.debug) {
          console.log('dacmoduleAddKvToPlacement: Invalid parameters.', 'placementId:', placementId, 'kvObject:', kvObject);
        }
      } else if (this.debug) {
        console.log('dacmoduleAddKvToPlacement: "window.placements" is undefined or invalid', 'window.placements:', dacmodulePlacements);
        console.log("dacmoduleAddKvToPlacement: Will wait for 'placements' to become ready.");

        setTimeout(function() {
          console.log('dacmoduleAddKvToPlacement: setTimeout triggered');
          self.dacmoduleAddKvToPlacement();
        }, 100);
      }
    },
    // depends od dacmodule.js/AdTech: load all placements
    dacmoduleLoadPlacements: function() {
      // performance test
      var self = this;
      var performanceTestStart = this.debugPerformance ? performance.now() : null;

      // look for dacmodule
      if (window.dacmodule && typeof(window.dacmodule.enqueueAds) === 'function' && typeof(window.pageConfigParams) === 'object' && window.placements.length) {
        var placementsToLoad = window.placements.slice();

        if (/complete|loaded|interactive/.test(document.readyState)) {
          window.dacmodule.enqueueAds(window.pageConfigParams, placementsToLoad);
        } else {
          document.addEventListener('DOMContentLoaded', function() {
            window.dacmodule.enqueueAds(window.pageConfigParams, placementsToLoad);
          });
        }
        // debug performance finished
        this.debugPerformance ? console.log("performance|dacmoduleLoadPlacements: Finished.", "milliseconds:", (performance.now() - performanceTestStart)) : null;

      } else {
        this.debug ? console.log('dacmoduleLoadPlacements: failed to load ads') : null;
        setTimeout(function() {
          console.log('dacmoduleLoadPlacements: setTimeout triggered');
          self.dacmoduleLoadPlacements();
        }, 100);
      }
    },
    // depends od dacmodule.js/AdTech: callback to check if prebid won
    dacmodulePlacementCallback: function(placementId) {
      // look for placement in DOM
      var placement = document.getElementById(placementId);
      if (placement) {
        var winningBid = null;
        var prebidNormal = placement.getElementsByClassName('prebidPlaceholder');
        var prebidXhb = placement.getElementsByClassName('prebidPlaceholder_xhb');

        if (prebidNormal.length || prebidXhb.length) {

          // get winning bid
          if (prebidNormal.length) {
            this.debug ? console.log('dacmodulePlacementCallback: Render placement as PREBID.', 'placementId:', placementId, 'placement:', placement) : null;
            winningBid = this.adUnitsStatus[placementId]['highestBid'];
          } else if (prebidXhb.length) {
            this.debug ? console.log('dacmodulePlacementCallback: Render placement as XHB.', 'placementId:', placementId, 'placement:', placement) : null;
            winningBid = this.adUnitsStatus[placementId]['xhbBid'];
          }

          // render as prebid
          if (typeof(winningBid) === 'object' && winningBid !== null) {
            var PerformanceRenderPrebid = this.debugPerformance ? performance.now() : null;
            this.renderPrebidAd(winningBid);
            this.debugPerformance ? console.log('performance|dacmodulePlacementCallback: renderPrebidAd() for placementId: ' + placementId + ' done.', "milliseconds:", (performance.now() - PerformanceRenderPrebid)) : null;
          } else if (this.debug) {
            console.log('dacmodulePlacementCallback: Invalid winning bid', 'placementId:', placementId, 'winningBid:', winningBid);
          }

        } else if (this.debug) {
          console.log('dacmodulePlacementCallback: No prebid div found inside placement.', 'placementId:', placementId, 'placement:', placement);
        }
      } else if (this.debug) {
        console.log('dacmodulePlacementCallback: Placement not found.', 'placementId:', placementId, 'placement:', placement);
      }
    },

    /////////////////////////////
    // data returned by functions
    /////////////////////////////
    // adUnits that are send to prebid.js
    adUnits: [],
    // used with custom values (lazyLoad etc.) and performance tracking etc.
    adUnitsStatus: {},

    /////////////////////////////
    // functions
    /////////////////////////////
    init: function(config) {
      // TODO: set framework config from 'config', and merge with 'defaultConfig'?
      var defaultConfig = {
        debug: this.debug,
        debugPerformance: this.debugPerformance,
        deviceType: this.deviceType,
        prebidConfig: this.prebidConfig,
        bannerTypes: this.bannerTypes,
        loadTimes: this.loadTimes
      };
      // set device, can be done by merging config
      window.polContext__.page.deviceType ? this.deviceType = window.polContext__.page.deviceType : null;

      // set debug-mode on the fly
      var urlParams = this.getUrlParams();
      if (urlParams) {
        // debugging
        urlParams.has('prebiddebug') ? this.debug = true : null;
        urlParams.has('prebidperformance') ? this.debugPerformance = true : null;

        // fixed adTech CPM
        if (urlParams.has('prebidcpm')) {
          var adtechCpm = parseInt(urlParams.get('prebidcpm'));
          if (typeof(adtechCpm) === 'number' && adtechCpm > 0) {
           this.adtechFixedCpm = parseInt(adtechCpm);
          }
        }
      }
    },
    // prebid.js related functions
    createAdUnit: function(object) {
      if (typeof(object) === 'object' && object !== null) {
        // look for prebid data in object
        var data = object;
        if (object.hasOwnProperty('prebid')) {
          data = object['prebid'];
        }

        // check if adUnit should be created
        var createAdUnit = true;
        var hideOnTablet = false;
        if (object.hasOwnProperty('hideOnTablet')) {
          hideOnTablet = (object['hideOnTablet'] === 'true' || false);
          if (this.deviceType === 'tablet' && hideOnTablet) {
           createAdUnit = false;
          }
        }

        // check adForm USD or DKK
        var adformReturnCurrency = 'USD';
        if (object.hasOwnProperty('adformCurrency')) {
          adformReturnCurrency = object['adformCurrency'];
        }

        // custom checks
        var loadTime = (object.hasOwnProperty('loadTime')) ? object['loadTime'] : 'pageload';

        // create initial status
        var status = {
            id: data.code,
            response: null,
            responseTime: null,
            renderAsPrebid: createAdUnit,
            renderFinished: false,
            renderStatus: 'AdUnit not yet created',
            loadTime: loadTime,
            hideOnTablet: hideOnTablet,
            adTechData: {},
            highestBid: null,
            xhbBid: null
        };

        // create unit
        if (createAdUnit) {
          // get banner sizes
          var sizes = this.getBannerSizeFromType(data.type) || [];
          if (sizes.length) {

            // prepare prebid adUnit
            var adUnit = {
              code: data.code,
              sizes: sizes,
              bids: []
            };

            // loop bidders for this adUnit
            for (var key in data.bidders) {
              var id = data.bidders[key];
              if (typeof(id) === 'number' || (typeof(id) === 'string' && id !== '')) {
                switch(key) {
                  // adForm
                  // Link: http://prebid.github.io/dev-docs/bidders.html#adform
                  case 'adform':
                    adUnit.bids.push({
                      bidder: 'adform',
                      params: {
                        mid: id,
                        rcur: adformReturnCurrency
                      }
                    });
                    break;
                  // Criteo
                  // Link: http://prebid.org/dev-docs/bidders.html#criteo
                  case 'criteo':
                    adUnit.bids.push({
                      bidder: 'criteo',
                      params: {
                        zoneId: parseInt(id)
                      }
                    });
                    break;
                  // PubMatic
                  // Link: http://prebid.org/dev-docs/bidders.html#pubmatic
                  case 'pubmatic':
                    for (var i = 0; i < sizes.length; i++) {
                      var size = sizes[i];
                      adUnit.bids.push({
                        bidder: 'pubmatic',
                        params: {
                          publisherId: this.bidderAdapters.pubmatic.publisherId,
                          adSlot: this.getAdSlotPubmatic(size[0], size[1], id)
                        }
                      });
                    }
                    break;
                  // Rubicon
                  // Link: http://prebid.org/dev-docs/bidders.html#rubicon
                  case 'rubicon':
                    var rubiconSiteId;
                    switch (this.deviceType) {
                      case 'smartphone':
                        rubiconSiteId = this.bidderAdapters.rubicon.siteIdPhone;
                        break;
                      case 'tablet':
                        rubiconSiteId = this.bidderAdapters.rubicon.siteIdTablet;
                        break;
                      default:
                        rubiconSiteId = this.bidderAdapters.rubicon.siteIdDesktop;
                    }
                    adUnit.bids.push({
                      bidder: 'rubicon',
                      params: {
                        accountId: this.bidderAdapters.rubicon.accountId,
                        siteId: rubiconSiteId,
                        zoneId: parseInt(id),
                        sizes: this.getBannerSizeRubicon(sizes)
                      }
                    });
                    break;
                  // Xaxis
                  // Link: http://prebid.org/dev-docs/bidders.html#xaxis
                  case 'xaxis':
                    adUnit.bids.push({
                      bidder: 'xhb',
                      params: {
                        placementId: parseInt(id)
                      }
                    });
                    break;
                  default:
                    console.log('createAdUnit: No matching case for "key".', 'key:', key);
                }
              } else if (this.debug) {
                console.log('createAdUnit: "id" is not a number/string or is empty.', 'key:', key + ', id:', id + ', adUnit:', object);
              }
            }

            // push adUnit to array,
            // used for pageLoad and lazyLoad ads.
            this.adUnits.push(adUnit);

            // update adUnit status
            status.renderStatus = 'adUnit created';

            // return adUnit for use in frontend,
            // used with instantLoad ads etc.
            //return adUnit;
          } else if (this.debug) {
            console.log('createAdUnit: "sizes" is empty.', 'sizes:', sizes,', will not add adUnit:', object);
            status.renderStatus = 'AdUnit not yet created, missing sizes';
          }

        } else if (this.debug) {
          console.log('createAdUnit: will not create adUnit, as it should not be loaded according to params', 'adUnit:', object);
          status.renderStatus = 'AdUnit will not be created according to params';
        }

        // push to status array
        this.adUnitsStatus[data.code] = status;

      } else if (this.debug) {
        console.log('createAdUnit: is not an "object".', 'object:', object);
      }

      // return empty object when unable to create adUnit
      //return {};
    },
    getPbjs: function() {
      var pbjs = window.pbjs;
      if (typeof(pbjs) === 'undefined') {
        this.debug ? console.log('getPbjs: "pbjs" is undefined'): null;
        // TODO: fallback
      }

      return pbjs;
    },
    getBannerSizeFromType: function(string) {
      // object from config
      if (typeof(string) === 'string' && string !== '') {
        var type = string.toLowerCase();
        if (this.bannerTypes.hasOwnProperty(type)) {
          return this.bannerTypes[type];
        } else {
          this.debug ? console.log('getBannerSizeFromType: No sizes found for "type".', 'type: ', type) : null;
          return [];
        }
      }
    },
    getBannerSizeRubicon: function(array) {
      var rubicon = this.bidderAdapters.rubicon;

      // convert array of sizes into rubicon size-ids
      var sizeIds = [];
      if (Array.isArray(array) && array.length) {
        array.forEach(function(size, index) {
          if (size[0] && size[1]) {
            var rubiconSize = size[0] + 'x' + size[1];

            // find size-id in rubicon size map
            for (var key in rubicon.sizeMap) {
              if (rubicon.sizeMap[key] === rubiconSize) {
                sizeIds.push(key);
                continue;
              }
            }
          }
        });
      } else if (this.debug) {
        console.log("getBannerSizeRubicon: 'array' is not an array", "array: ", array);
      }

      return sizeIds;
    },
    getAdSlotPubmatic: function(width, height, id) {
      var w = 0;
      var h = 0;
      if (typeof(width) !== 'undefined' && typeof(height) !== 'undefined') {
        // check passed type
        if (typeof(width) === 'number' || typeof(width) === 'string') {
          w = parseInt(width);
        }
        if (typeof(height) === 'number' || typeof(height) === 'string') {
          h = parseInt(height);
        }

        // format size for prebid
        if (typeof(id) === 'number' || typeof(id) === 'string') {
          if (w > 0 && h > 0) {
            return id + '@' + w + 'x' + h;
          }
        } else if (this.debug) {
          console.log('getAdSlotPubmatic: id is not a number or a string. ', 'id: ', id);
        }
      } else if (this.debug) {
        console.log('getAdSlotPubmatic: missing parameters. ', 'width: ', width, 'height: ', height, 'id: ', id);
      }
    },
    getAdtechCpm: function(cpm) {
      // cpm * 100, and then remove decimals
      return parseInt(parseFloat(cpm) * 100);
    },
    // logging related functions
    getUrlParams: function(url) {
      var testUrl = (url === '' || url === undefined) ? window.location.href : url;
      if (testUrl) {
        var parsedUrl = new URL(testUrl);
        return parsedUrl.searchParams;
      } else if (this.debug) {
        console.log("getUrlParams: 'testUrl' not found.", 'testUrl:', testUrl);
      }

      return null;
    },
    showBidResponses: function(sortBy) {
      var pbjs = window.pbjs;
      if (typeof(pbjs) === 'undefined') {
        console.log('showBidResponses: "pbjs" is undefined');
        return true;
      }

      var responses = pbjs.getBidResponses();
      var output = [];
      for (var adunit in responses) {
        if (responses.hasOwnProperty(adunit)) {
          var bids = responses[adunit].bids;
          var adStatus = this.adUnitsStatus[adunit];

          for (var i = 0; i < bids.length; i++) {
            var b = bids[i];
            var xhbDeal = 0;
            var adformDeal = '';

            // look for custom deals
            if (adStatus.hasOwnProperty('adTechData')) {
              xhbDeal = (adStatus.adTechData.hasOwnProperty('prebidXHB') && b.bidder === "xhb") ? adStatus.adTechData['prebidXHB'] : 0;
              adformDeal = (adStatus.adTechData.hasOwnProperty('hb_deal_adform') && b.bidder === "adform") ? adStatus.adTechData['hb_deal_adform'] : '';
            }

            output.push({
              adunit: adunit,
              adId: b.adId,
              bidder: b.bidder,
              cpm: b.cpm,
              adtech_cpm: this.getAdtechCpm(b.cpm),
              adform_deal: adformDeal,
              xhb_deal: xhbDeal,
              time: b.timeToRespond,
              msg: b.statusMessage
            });
          }
        }
      }
      // optional sorting of array
      if (typeof(sortBy) === 'string' && sortBy !== '') {
        output = this.sortArrayOfObjects(output, sortBy);
      }
      // log array
      if (output.length) {
        console.log('showBidResponses:');
        this.logArrayOfObjectsAsTable(output);
      } else {
        console.log('showBidResponses: No prebid responses');
      }
    },
    showHighestCpmBids: function(sortBy) {
      var pbjs = window.pbjs;
      if (typeof(pbjs) === 'undefined') {
        console.log('showHighestCpmBids: "pbjs" is undefined');
        return true;
      }

      var bids = pbjs.getHighestCpmBids();
      var output = [];
      for (var i = 0; i < bids.length; i++) {
        var b = bids[i];
        var adStatus = this.adUnitsStatus[b.adUnitCode];
        var xhbDeal = 0;
        var adformDeal = '';

        // look for custom deals
        if (adStatus.hasOwnProperty('adTechData')) {
          xhbDeal = adStatus.adTechData.hasOwnProperty('prebidXHB') ? adStatus.adTechData['prebidXHB'] : 0;
          adformDeal = adStatus.adTechData.hasOwnProperty('hb_deal_adform') ? adStatus.adTechData['hb_deal_adform'] : '';
        }

        output.push({
          adunit: b.adUnitCode,
          adId: b.adId,
          bidder: b.bidder,
          cpm: b.cpm,
          adtech_cpm: this.getAdtechCpm(b.cpm),
          adform_deal: adformDeal,
          xhb_deal: xhbDeal,
          time: b.timeToRespond
        });
      }
      // optional sorting of array
      if (typeof(sortBy) === 'string' && sortBy !== '') {
        output = this.sortArrayOfObjects(output, sortBy);
      }
      // log array
      if (output.length) {
        console.log('showHighestCpmBids:');
        this.logArrayOfObjectsAsTable(output);
      } else {
          console.log('showHighestCpmBids: No "highest CPM bids" found.');
      }
    },
    showRenderedBids: function(sortBy) {
      var pbjs = window.pbjs;
      if (typeof(pbjs) === 'undefined') {
        console.log('showRenderedBids: "pbjs" is undefined');
        return true;
      }

      var bids = pbjs.getAllWinningBids();
      var output = [];
      for (var i = 0; i < bids.length; i++) {
        var b = bids[i];
        var adStatus = this.adUnitsStatus[b.adUnitCode];
        var xhbDeal = 0;
        var adformDeal = '';

        // look for custom deals
        if (adStatus.hasOwnProperty('adTechData')) {
          xhbDeal = adStatus.adTechData.hasOwnProperty('prebidXHB') ? adStatus.adTechData['prebidXHB'] : 0;
          adformDeal = adStatus.adTechData.hasOwnProperty('hb_deal_adform') ? adStatus.adTechData['hb_deal_adform'] : '';
        }

        output.push({
          adunit: b.adUnitCode,
          adId: b.adId,
          bidder: b.bidder,
          cpm: b.cpm,
          adtech_cpm: this.getAdtechCpm(b.cpm),
          adform_deal: adformDeal,
          xhb_deal: xhbDeal,
          time: b.timeToRespond
        });
      }
      // optional sorting of array
      if (typeof(sortBy) === 'string' && sortBy !== '') {
        output = this.sortArrayOfObjects(output, sortBy);
      }
      // log array
      if (output.length) {
        console.log('showRenderedBids:');
        this.logArrayOfObjectsAsTable(output);
      } else {
          console.log('showRenderedBids: No "bid winners" was selected for rendering');
      }
    },
    sortArrayOfObjects: function(array, key) {
      if (Array.isArray(array) && array.length && array[0].hasOwnProperty(key)) {
        var isNumber = typeof(array[0][key]) === 'number';
        var isString = typeof(array[0][key]) === 'string';

        array.sort(function (a, b) {
          // sort by number
          if (isNumber) {
            return a[key] - b[key];
          }
          // sort by alphabetically
          else if (isString) {
            var nameA = a[key].toLowerCase();
            var nameB = b[key].toLowerCase();
            if (nameA < nameB) {
              return -1;
            }
            if (nameA > nameB) {
              return 1;
            }
            return 0;
          }
        });
      } else {
        console.log("sortArrayOfObjects: Could not sort 'array'.", 'array:', array, 'key: ', key);
      }

      return array;
    },
    // TODO: custom functions for debugging, needs to accept multiple strings
    log: function(string, type) {
      if (this.debug) {
        if (type) {

        } else {
          // default logging
          console.log(string);
        }
      }
    },
    // TODO: custom functions for debugging, needs to accept multiple strings
    logPerformance: function(string, type) {
      if (this.debug) {
        if (type) {
          // TODO: logging types, error, warning, etc.
        } else {
          // default logging
          console.log(string);
        }
      }
    },
    logArrayOfObjectsAsTable: function(array) {
      if (Array.isArray(array) && array.length) {
        if (console.table) {
          console.table(array);
        } else {
          if (this.debug) {
            console.log("logArrayOfObjectsAsTable: your browser does not support 'console.table'.");
          }
          for (var i = 0; i < array.length; i++) {
            console.log(array[i]);
          }
        }
      } else {
        console.log("logArrayOfObjectsAsTable: 'array' is empty or not an array.", 'array:', array);
      }
    },
    // render function
    renderPrebidAd: function(bid) {
      var self = this;
      var pbjs = this.getPbjs();

      // check for prebid render function
      if (typeof(pbjs.renderAd) === 'function') {
        if (typeof(bid) === 'object' && bid !== null && !Array.isArray(bid)) {
          // get bid paramenters
          var adId = bid.adId;
          var adUnitCode = bid.adUnitCode;
          var width = bid.width || 0;
          var height = bid.height || 0;
          var style = 'border:0;margin:0 auto;' + 'width:' + width + 'px;' + 'height:' + height + 'px;';
          // get custom bid parameters
          var adUnitStatus = this.adUnitsStatus[adUnitCode];
          var loadTime = adUnitStatus['loadTime'] || 'pageload';

          // debug
          this.debug ? console.log("renderPrebidAd: render with params,", 'adId:', adId, 'adUnitCode:', adUnitCode, 'width:', width, 'height:', height) : null;

          // create iframe
          var iframe = document.createElement('iframe');
          iframe.setAttribute('style', style);
          iframe.setAttribute('scrolling', 'no');


          // get DOM element container for ad and clean-up container
          var container = document.getElementById(adUnitCode);
          var prebidContainer = container.getElementsByClassName('prebidPlaceholder')[0] || container.getElementsByClassName('prebidPlaceholder_xhb')[0];
          //var prebidContainer = container.querySelectorAll('.prebidPlaceholder, .prebidPlaceholder_xhb')[0];
          if (prebidContainer) {
            while (prebidContainer.firstChild) {
              prebidContainer.removeChild(prebidContainer.firstChild);
            }
            prebidContainer.appendChild(iframe);
          } else if (container) {
            container.appendChild(iframe);
          } else if (this.debug) {
            console.log("renderPrebidAd: container for iframe not found", 'prebidContainer:', prebidContainer, 'container:', container);
          }

          // get iframe document
          // WARNING: Do not move this upwards in code,
          // it will cause iframeDoc to become 'undefined' for some reason.
          // TODO: fix issue above
          var iframeDoc = iframe.contentWindow.document;
          iframeDoc.body.setAttribute('style', style);

          // set style when iframe body has loaded
          iframe.addEventListener('load', function () {
            iframeDoc.body.setAttribute('style', style);
          }, false);

          // TESTING LOAD TIME
          /*
          if (typeof(loadTime) === 'string' && loadTime !== '') {
            console.log('this.loadTimes:', this.loadTimes);
            console.log('this.loadTimes.hasOwnProperty(loadTime):', this.loadTimes.hasOwnProperty(loadTime));
            console.log('this.loadTimes is function:', typeof(this.loadTimes[loadTime]) === 'function');
            if (this.loadTimes.hasOwnProperty(loadTime) && typeof(this.loadTimes[loadTime]) === 'function') {
              this.loadTimes[loadTime](iframeDoc, bid);
            } else {
              this.debug ? console.log('LOAD TIME NOT FOUND: loadtime:', loadTime) : null;
            }
          }
          */

          // render ad, determined by loadTime
          switch (loadTime) {
            // instant-load
            case 'instant':
              this.debug ? console.log('renderPrebidAd: instant-loading', 'adUnit:', adUnitCode) : null;
              pbjs.renderAd(iframeDoc, adId);
              break;

            // lazy-load
            case 'lazy':
              this.debug ? console.log('renderPrebidAd: Will lazy-load AdUnit:', adUnitCode) : null;
              // get top of ad container
              var containerPostion = container.getBoundingClientRect();
              var bannerTop = containerPostion.top ? containerPostion.top : 1;

              // check if user alrady scrolled past this ad, and should load ad on pageload
              if ((window.pageYOffset + window.innerHeight + 1000) > bannerTop) {
                pbjs.renderAd(iframeDoc, adId);
              } else {
                var lazyLoadDone = false;
                var updateScroll = true;

                // add scrollListener
                function scrollListener() {
                  if (lazyLoadDone) {
                    self.debug ? console.log('renderPrebidAd: lazy-loading done for AdUnit:', adUnitCode, ', removing eventListener') : null;
                    window.removeEventListener("scroll", scrollListener);
                  } else {
                    if (updateScroll && bannerTop) {
                      window.requestAnimationFrame(function () {
                        if ((window.pageYOffset + window.innerHeight + 1000) > bannerTop) {
                          self.debug ? console.log('renderPrebidAd: lazy-loading AdUnit:', adUnitCode) : null;
                          pbjs.renderAd(iframeDoc, adId);
                          lazyLoadDone = true;
                        }
                        updateScroll = true;
                      });
                      updateScroll = false;
                    }
                  }
                }
                window.addEventListener("scroll", scrollListener);
              }
              break;

            // "special-edition"-code for politiken's wallpaper-position
            case 'afterWallpaper':
              this.debug ? console.log('renderPrebidAd: afterWallpaper-load init', 'adUnitCode:', adUnitCode) : null;
              if (window.dacmodule && typeof(window.dacmodule.getWallpaperStatus) === 'function') {
                // get wallpaper status
                var wallpaperStatus = window.dacmodule.getWallpaperStatus();
                if (wallpaperStatus.wallpaperPlacementLoaded && wallpaperStatus.wallpaperStylingPresent) {
                  this.debug ? console.log('renderPrebidAd: afterWallpaper adUnit will not be loaded', 'adUnitCode:', adUnitCode) : null;
                } else if (wallpaperStatus.wallpaperPlacementLoaded && !wallpaperStatus.wallpaperStylingPresent) {
                  this.debug ? console.log('renderPrebidAd: afterWallpaper rendering.', 'adUnitCode:', adUnitCode) : null;
                  pbjs.renderAd(iframeDoc, adId);
                } else {
                  var timer = setInterval(function() {
                    // get updated wallpaper status
                    wallpaperStatus = window.dacmodule.getWallpaperStatus();

                    // wait for wallpaper-position to load
                    if (wallpaperStatus.wallpaperPlacementLoaded) {
                      self.debug ? console.log('renderPrebidAd: afterWallpaper waiting for wallpaper-position.', 'adUnitCode:', adUnitCode) : null;
                      if (wallpaperStatus.wallpaperStylingPresent) {
                        self.debug ? console.log('renderPrebidAd: afterWallpaper adUnit will not be loaded', 'adUnitCode:', adUnitCode) : null;
                        clearInterval(timer);
                      } else {
                        self.debug ? console.log('renderPrebidAd: afterWallpaper rendering after waiting for wallpaper-position.', 'adUnitCode:', adUnitCode) : null;
                        pbjs.renderAd(iframeDoc, adId);
                        clearInterval(timer);
                      }
                    }
                  }, 200);
                }
              } else {
                this.debug ? console.log("renderPrebidAd: afterWallpaper-load, 'dacmodule' not found or 'dacmodule.getWallpaperStatus()' is not a function", 'dacmodule:', window.dacmodule, 'adUnitCode:', adUnitCode) : null;
                // TODO: fallback
              }
              break;

            // page-load
            default:
              this.debug ? console.log('renderPrebidAd: page-loading adUnit:', adUnitCode) : null;
              if (/complete|loaded|interactive/.test(document.readyState)) {
                pbjs.renderAd(iframeDoc, adId);
              } else {
                document.addEventListener('DOMContentLoaded', function() {
                  pbjs.renderAd(iframeDoc, adId);
                });
              }
          }
        } else if (this.debug) {
          console.log("renderPrebidAd: 'bid' must be an object", 'bid: ', bid);
        }
      } else if (this.debug) {
        console.log("renderPrebidAd: 'pbjs.renderAd' is not a function.");
      }
    }
  };
}(window));
