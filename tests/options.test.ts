import { describe, it, expect } from 'vitest';
import { TakeOptions } from '../src/options.js';

describe('TakeOptions', () => {
  describe('static constructors', () => {
    it('creates options with URL', () => {
      const options = TakeOptions.url('https://example.com');
      expect(options.toConfig().url).toBe('https://example.com');
    });

    it('creates options with HTML', () => {
      const options = TakeOptions.html('<h1>Hello</h1>');
      expect(options.toConfig().html).toBe('<h1>Hello</h1>');
    });

    it('creates options from config', () => {
      const options = TakeOptions.from({
        url: 'https://example.com',
        width: 1200,
        format: 'png',
      });
      const config = options.toConfig();

      expect(config.url).toBe('https://example.com');
      expect(config.width).toBe(1200);
      expect(config.format).toBe('png');
    });
  });

  describe('fluent builder pattern', () => {
    it('returns new instance on each method call', () => {
      const options1 = TakeOptions.url('https://example.com');
      const options2 = options1.width(1200);
      const options3 = options2.height(630);

      expect(options1).not.toBe(options2);
      expect(options2).not.toBe(options3);
      expect(options1.toConfig().width).toBeUndefined();
      expect(options2.toConfig().height).toBeUndefined();
      expect(options3.toConfig().width).toBe(1200);
      expect(options3.toConfig().height).toBe(630);
    });

    it('chains multiple methods', () => {
      const options = TakeOptions.url('https://example.com')
        .width(1200)
        .height(630)
        .format('png')
        .quality(90)
        .blockAds();

      const config = options.toConfig();
      expect(config.url).toBe('https://example.com');
      expect(config.width).toBe(1200);
      expect(config.height).toBe(630);
      expect(config.format).toBe('png');
      expect(config.quality).toBe(90);
      expect(config.blockAds).toBe(true);
    });
  });

  describe('viewport options', () => {
    it('sets width', () => {
      const options = TakeOptions.url('https://example.com').width(1920);
      expect(options.toConfig().width).toBe(1920);
    });

    it('sets height', () => {
      const options = TakeOptions.url('https://example.com').height(1080);
      expect(options.toConfig().height).toBe(1080);
    });

    it('sets scale', () => {
      const options = TakeOptions.url('https://example.com').scale(2);
      expect(options.toConfig().scale).toBe(2);
    });

    it('sets mobile', () => {
      const options = TakeOptions.url('https://example.com').mobile();
      expect(options.toConfig().mobile).toBe(true);
    });

    it('sets mobile with explicit value', () => {
      const options = TakeOptions.url('https://example.com').mobile(false);
      expect(options.toConfig().mobile).toBe(false);
    });
  });

  describe('capture options', () => {
    it('sets fullPage', () => {
      const options = TakeOptions.url('https://example.com').fullPage();
      expect(options.toConfig().fullPage).toBe(true);
    });

    it('sets element selector', () => {
      const options = TakeOptions.url('https://example.com').element('.hero');
      expect(options.toConfig().element).toBe('.hero');
    });

    it('sets format', () => {
      const options = TakeOptions.url('https://example.com').format('jpeg');
      expect(options.toConfig().format).toBe('jpeg');
    });

    it('sets quality', () => {
      const options = TakeOptions.url('https://example.com').quality(85);
      expect(options.toConfig().quality).toBe(85);
    });
  });

  describe('wait options', () => {
    it('sets waitFor', () => {
      const options = TakeOptions.url('https://example.com').waitFor('networkidle');
      expect(options.toConfig().waitFor).toBe('networkidle');
    });

    it('sets delay', () => {
      const options = TakeOptions.url('https://example.com').delay(2000);
      expect(options.toConfig().delay).toBe(2000);
    });

    it('sets waitForSelector', () => {
      const options = TakeOptions.url('https://example.com').waitForSelector('.loaded');
      expect(options.toConfig().waitForSelector).toBe('.loaded');
    });

    it('sets waitForTimeout', () => {
      const options = TakeOptions.url('https://example.com').waitForTimeout(30000);
      expect(options.toConfig().waitForTimeout).toBe(30000);
    });
  });

  describe('preset and device options', () => {
    it('sets preset', () => {
      const options = TakeOptions.url('https://example.com').preset('og_card');
      expect(options.toConfig().preset).toBe('og_card');
    });

    it('sets device', () => {
      const options = TakeOptions.url('https://example.com').device('iphone_14_pro');
      expect(options.toConfig().device).toBe('iphone_14_pro');
    });
  });

  describe('blocking options', () => {
    it('sets blockAds', () => {
      const options = TakeOptions.url('https://example.com').blockAds();
      expect(options.toConfig().blockAds).toBe(true);
    });

    it('sets blockTrackers', () => {
      const options = TakeOptions.url('https://example.com').blockTrackers();
      expect(options.toConfig().blockTrackers).toBe(true);
    });

    it('sets blockCookieBanners', () => {
      const options = TakeOptions.url('https://example.com').blockCookieBanners();
      expect(options.toConfig().blockCookieBanners).toBe(true);
    });

    it('sets blockChatWidgets', () => {
      const options = TakeOptions.url('https://example.com').blockChatWidgets();
      expect(options.toConfig().blockChatWidgets).toBe(true);
    });

    it('sets blockUrls', () => {
      const patterns = ['*.analytics.com/*', '*.ads.com/*'];
      const options = TakeOptions.url('https://example.com').blockUrls(patterns);
      expect(options.toConfig().blockUrls).toEqual(patterns);
    });

    it('sets blockResources', () => {
      const types = ['font', 'media'] as const;
      const options = TakeOptions.url('https://example.com').blockResources([...types]);
      expect(options.toConfig().blockResources).toEqual(types);
    });
  });

  describe('page manipulation options', () => {
    it('sets injectScript', () => {
      const script = 'document.body.style.background = "red"';
      const options = TakeOptions.url('https://example.com').injectScript(script);
      expect(options.toConfig().injectScript).toBe(script);
    });

    it('sets injectStyle', () => {
      const style = 'body { font-size: 20px; }';
      const options = TakeOptions.url('https://example.com').injectStyle(style);
      expect(options.toConfig().injectStyle).toBe(style);
    });

    it('sets click', () => {
      const options = TakeOptions.url('https://example.com').click('.accept-cookies');
      expect(options.toConfig().click).toBe('.accept-cookies');
    });

    it('sets hide', () => {
      const selectors = ['.banner', '.popup'];
      const options = TakeOptions.url('https://example.com').hide(selectors);
      expect(options.toConfig().hide).toEqual(selectors);
    });

    it('sets remove', () => {
      const selectors = ['.ads', '.tracking'];
      const options = TakeOptions.url('https://example.com').remove(selectors);
      expect(options.toConfig().remove).toEqual(selectors);
    });
  });

  describe('browser emulation options', () => {
    it('sets darkMode', () => {
      const options = TakeOptions.url('https://example.com').darkMode();
      expect(options.toConfig().darkMode).toBe(true);
    });

    it('sets reducedMotion', () => {
      const options = TakeOptions.url('https://example.com').reducedMotion();
      expect(options.toConfig().reducedMotion).toBe(true);
    });

    it('sets mediaType', () => {
      const options = TakeOptions.url('https://example.com').mediaType('print');
      expect(options.toConfig().mediaType).toBe('print');
    });

    it('sets userAgent', () => {
      const ua = 'Custom User Agent';
      const options = TakeOptions.url('https://example.com').userAgent(ua);
      expect(options.toConfig().userAgent).toBe(ua);
    });

    it('sets timezone', () => {
      const options = TakeOptions.url('https://example.com').timezone('America/New_York');
      expect(options.toConfig().timezone).toBe('America/New_York');
    });

    it('sets locale', () => {
      const options = TakeOptions.url('https://example.com').locale('fr-FR');
      expect(options.toConfig().locale).toBe('fr-FR');
    });

    it('sets geolocation', () => {
      const options = TakeOptions.url('https://example.com').geolocation(40.7128, -74.006);
      expect(options.toConfig().geolocation).toEqual({
        latitude: 40.7128,
        longitude: -74.006,
      });
    });

    it('sets geolocation with accuracy', () => {
      const options = TakeOptions.url('https://example.com').geolocation(40.7128, -74.006, 100);
      expect(options.toConfig().geolocation).toEqual({
        latitude: 40.7128,
        longitude: -74.006,
        accuracy: 100,
      });
    });
  });

  describe('network options', () => {
    it('sets headers', () => {
      const headers = { 'X-Custom': 'value' };
      const options = TakeOptions.url('https://example.com').headers(headers);
      expect(options.toConfig().headers).toEqual(headers);
    });

    it('sets cookies', () => {
      const cookies = [{ name: 'session', value: 'abc123', domain: 'example.com' }];
      const options = TakeOptions.url('https://example.com').cookies(cookies);
      expect(options.toConfig().cookies).toEqual(cookies);
    });

    it('sets authBasic', () => {
      const options = TakeOptions.url('https://example.com').authBasic('user', 'pass');
      expect(options.toConfig().authBasic).toEqual({ username: 'user', password: 'pass' });
    });

    it('sets authBearer', () => {
      const options = TakeOptions.url('https://example.com').authBearer('token123');
      expect(options.toConfig().authBearer).toBe('token123');
    });

    it('sets bypassCsp', () => {
      const options = TakeOptions.url('https://example.com').bypassCsp();
      expect(options.toConfig().bypassCsp).toBe(true);
    });
  });

  describe('cache options', () => {
    it('sets cacheTtl', () => {
      const options = TakeOptions.url('https://example.com').cacheTtl(86400);
      expect(options.toConfig().cacheTtl).toBe(86400);
    });

    it('sets cacheRefresh', () => {
      const options = TakeOptions.url('https://example.com').cacheRefresh();
      expect(options.toConfig().cacheRefresh).toBe(true);
    });
  });

  describe('PDF options', () => {
    it('sets pdfPaperSize', () => {
      const options = TakeOptions.url('https://example.com').format('pdf').pdfPaperSize('a4');
      expect(options.toConfig().pdfPaperSize).toBe('a4');
    });

    it('sets pdfWidth and pdfHeight', () => {
      const options = TakeOptions.url('https://example.com')
        .format('pdf')
        .pdfWidth('8.5in')
        .pdfHeight('11in');
      expect(options.toConfig().pdfWidth).toBe('8.5in');
      expect(options.toConfig().pdfHeight).toBe('11in');
    });

    it('sets pdfLandscape', () => {
      const options = TakeOptions.url('https://example.com').format('pdf').pdfLandscape();
      expect(options.toConfig().pdfLandscape).toBe(true);
    });

    it('sets pdfMargin', () => {
      const options = TakeOptions.url('https://example.com').format('pdf').pdfMargin('1in');
      expect(options.toConfig().pdfMargin).toBe('1in');
    });

    it('sets individual margins', () => {
      const options = TakeOptions.url('https://example.com')
        .format('pdf')
        .pdfMarginTop('1in')
        .pdfMarginRight('0.5in')
        .pdfMarginBottom('1in')
        .pdfMarginLeft('0.5in');

      const config = options.toConfig();
      expect(config.pdfMarginTop).toBe('1in');
      expect(config.pdfMarginRight).toBe('0.5in');
      expect(config.pdfMarginBottom).toBe('1in');
      expect(config.pdfMarginLeft).toBe('0.5in');
    });

    it('sets pdfScale', () => {
      const options = TakeOptions.url('https://example.com').format('pdf').pdfScale(0.8);
      expect(options.toConfig().pdfScale).toBe(0.8);
    });

    it('sets pdfPrintBackground', () => {
      const options = TakeOptions.url('https://example.com').format('pdf').pdfPrintBackground();
      expect(options.toConfig().pdfPrintBackground).toBe(true);
    });

    it('sets pdfPageRanges', () => {
      const options = TakeOptions.url('https://example.com').format('pdf').pdfPageRanges('1-5, 8');
      expect(options.toConfig().pdfPageRanges).toBe('1-5, 8');
    });

    it('sets pdfHeader and pdfFooter', () => {
      const options = TakeOptions.url('https://example.com')
        .format('pdf')
        .pdfHeader('<div>Header</div>')
        .pdfFooter('<div>Page <span class="pageNumber"></span></div>');

      expect(options.toConfig().pdfHeader).toBe('<div>Header</div>');
      expect(options.toConfig().pdfFooter).toBe('<div>Page <span class="pageNumber"></span></div>');
    });

    it('sets pdfFitOnePage', () => {
      const options = TakeOptions.url('https://example.com').format('pdf').pdfFitOnePage();
      expect(options.toConfig().pdfFitOnePage).toBe(true);
    });

    it('sets pdfPreferCssPageSize', () => {
      const options = TakeOptions.url('https://example.com').format('pdf').pdfPreferCssPageSize();
      expect(options.toConfig().pdfPreferCssPageSize).toBe(true);
    });
  });

  describe('storage options', () => {
    it('sets storageEnabled', () => {
      const options = TakeOptions.url('https://example.com').storageEnabled();
      expect(options.toConfig().storageEnabled).toBe(true);
    });

    it('sets storagePath', () => {
      const options = TakeOptions.url('https://example.com').storagePath(
        '{year}/{month}/{hash}.{ext}'
      );
      expect(options.toConfig().storagePath).toBe('{year}/{month}/{hash}.{ext}');
    });

    it('sets storageAcl', () => {
      const options = TakeOptions.url('https://example.com').storageAcl('public-read');
      expect(options.toConfig().storageAcl).toBe('public-read');
    });
  });

  describe('toParams', () => {
    it('converts options to API params format', () => {
      const options = TakeOptions.url('https://example.com')
        .width(1200)
        .height(630)
        .format('png')
        .blockAds()
        .darkMode();

      const params = options.toParams();

      expect(params['url']).toBe('https://example.com');
      expect(params['viewport']).toEqual({ width: 1200, height: 630 });
      expect(params['format']).toBe('png');
      expect(params['block_ads']).toBe(true);
      expect(params['dark_mode']).toBe(true);
    });

    it('converts PDF options to nested format', () => {
      const options = TakeOptions.url('https://example.com')
        .format('pdf')
        .pdfPaperSize('a4')
        .pdfLandscape()
        .pdfMargin('1in');

      const params = options.toParams();

      expect(params['pdf']).toEqual({
        paper_size: 'a4',
        landscape: true,
        margin: '1in',
      });
    });

    it('converts storage options to nested format', () => {
      const options = TakeOptions.url('https://example.com')
        .storageEnabled()
        .storagePath('{hash}.{ext}')
        .storageAcl('public-read');

      const params = options.toParams();

      expect(params['storage']).toEqual({
        enabled: true,
        path: '{hash}.{ext}',
        acl: 'public-read',
      });
    });

    it('omits undefined values', () => {
      const options = TakeOptions.url('https://example.com').width(1200);
      const params = options.toParams();

      expect(params['url']).toBe('https://example.com');
      expect(params['viewport']).toEqual({ width: 1200 });
      expect(Object.keys(params)).toHaveLength(2);
    });
  });

  describe('toQueryString', () => {
    it('converts options to query string', () => {
      const options = TakeOptions.url('https://example.com').width(1200).height(630).format('png');

      const qs = options.toQueryString();

      expect(qs).toContain('url=https%3A%2F%2Fexample.com');
      expect(qs).toContain('width=1200');
      expect(qs).toContain('height=630');
      expect(qs).toContain('format=png');
    });

    it('handles boolean values', () => {
      const options = TakeOptions.url('https://example.com').blockAds().darkMode();
      const qs = options.toQueryString();

      expect(qs).toContain('block_ads=true');
      expect(qs).toContain('dark_mode=true');
    });

    it('handles array values', () => {
      const options = TakeOptions.url('https://example.com')
        .blockUrls(['*.ads.com/*', '*.tracking.com/*'])
        .blockResources(['font', 'media']);

      const qs = options.toQueryString();

      expect(qs).toContain('block_urls=*.ads.com%2F*');
      expect(qs).toContain('block_urls=*.tracking.com%2F*');
      expect(qs).toContain('block_resources=font');
      expect(qs).toContain('block_resources=media');
    });
  });
});
