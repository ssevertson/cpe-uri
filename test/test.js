var CPEURI = require('../lib/main'),
    expect = require('chai').expect;

describe('CPE URI', function() {
  it('should unbind simple uris correctly', function() {
    expect(CPEURI.unbind('a')).to.eql({
      part: 'a'
    });
    expect(CPEURI.unbind('a:vendor:product:version:update:edition:lang')).to.eql({
      part: 'a',
      vendor: 'vendor',
      product: 'product',
      version: 'version',
      update: 'update',
      edition: 'edition',
      lang: 'lang'
    });
  });
  it('should unbind escaped uris correctly', function() {
    expect(CPEURI.unbind('a:vendor%24:product%24:version%24:update%24:edition%24:lang%24')).to.eql({
      part: 'a',
      vendor: 'vendor$',
      product: 'product$',
      version: 'version$',
      update: 'update$',
      edition: 'edition$',
      lang: 'lang$'
    });
  });
  it('should unbind packed uris correctly', function() {
    expect(CPEURI.unbind('a:vendor:product:version:update:~edition~sw_edition~target_sw~target_hw~other:lang')).to.eql({
      part: 'a',
      vendor: 'vendor',
      product: 'product',
      version: 'version',
      update: 'update',
      edition: 'edition',
      lang: 'lang',
      sw_edition: 'sw_edition',
      target_sw: 'target_sw',
      target_hw: 'target_hw',
      other: 'other'
    });
    expect(CPEURI.unbind('a:vendor:product:version:update:%7eedition%7esw_edition%7etarget_sw%7etarget_hw%7eother:lang')).to.eql({
      part: 'a',
      vendor: 'vendor',
      product: 'product',
      version: 'version',
      update: 'update',
      edition: 'edition',
      lang: 'lang',
      sw_edition: 'sw_edition',
      target_sw: 'target_sw',
      target_hw: 'target_hw',
      other: 'other'
    });
  });
  it('should bind uris correctly', function() {
    expect(CPEURI.bind({
      part: 'a',
      vendor: 'vendor',
      product: 'product',
      version: 'version',
      update: 'update',
      edition: 'edition',
      lang: 'lang'
    })).to.equal('a:vendor:product:version:update:edition:lang');
  });
  it('should bind escaped uris correctly', function() {
    expect(CPEURI.bind({
      part: 'a',
      vendor: 'vendor$',
      product: 'product$',
      version: 'version$',
      update: 'update$',
      edition: 'edition$',
      lang: 'lang$'
    })).to.equal('a:vendor%24:product%24:version%24:update%24:edition%24:lang%24');
  });
  it('should bind packed uris correctly', function() {
    expect(CPEURI.bind({
      part: 'a',
      vendor: 'vendor',
      product: 'product',
      version: 'version',
      update: 'update',
      edition: 'edition',
      lang: 'lang',
      sw_edition: 'sw_edition',
      target_sw: 'target_sw',
      target_hw: 'target_hw',
      other: 'other'
    })).to.equal('a:vendor:product:version:update:~edition~sw_edition~target_sw~target_hw~other:lang');
  });
  it('should detect the most specific component', function() {
    expect(CPEURI.getMostSpecificComponentName({
      part: 'a',
      vendor: 'vendor',
      product: 'product',
      version: 'version',
      update: 'update'
    })).to.equal('update');
    expect(CPEURI.getMostSpecificComponentName({
      part: 'a',
      vendor: 'vendor',
      product: 'product',
      version: 'version',
      update: 'update',
      edition: 'edition',
      lang: 'lang',
      sw_edition: 'sw_edition',
      target_sw: 'target_sw',
      target_hw: 'target_hw',
      other: 'other'
    })).to.equal('other');
  });
  it('should remove the most specific component correctly', function() {
    expect(CPEURI.makeLessSpecific({
      part: 'a',
      vendor: 'vendor',
      product: 'product',
      version: 'version',
      update: 'update',
      edition: 'edition',
      lang: 'lang',
      sw_edition: 'sw_edition',
      target_sw: 'target_sw'
    })).to.eql({
      part: 'a',
      vendor: 'vendor',
      product: 'product',
      version: 'version',
      update: 'update',
      edition: 'edition',
      lang: 'lang',
      sw_edition: 'sw_edition'
    });
  });
  it('should iterate in the correct order', function() {
    var expectations;

    expectations = ['part', 'vendor', 'product', 'version', 'update', 'edition', 'lang', 'sw_edition', 'target_sw', 'target_hw', 'other'];
    CPEURI.forEach({
      part: 'a',
      vendor: 'vendor',
      product: 'product',
      version: 'version',
      update: 'update',
      edition: 'edition',
      lang: 'lang',
      sw_edition: 'sw_edition',
      target_sw: 'target_sw',
      target_hw: 'target_hw',
      other: 'other'
    }, function(component, value) {
      expect(component).to.equal(expectations.shift());
    });
  });
  it('should generate unique CPE URI components correctly', function() {
    var parsed;
    parsed = CPEURI.generateUniqueComponentLists(['a:vendor:product:version:update:edition:lang', 'o:vendor:product2:version2:update']);
    expect(parsed).to.eql({
      part: ['a', 'o'],
      vendor: ['vendor'],
      product: ['product', 'product2'],
      version: ['version', 'version2'],
      update: ['update'],
      edition: ['edition'],
      lang: ['lang']
    });
  });
  it('should generate unique parent CPE URIs correctly', function() {
    var cpes;
    cpes = CPEURI.generateUniqueAncestors('a:postgresql:postgresql:9.2');
    expect(cpes).to.have.members(['a', 'a:postgresql', 'a:postgresql:postgresql', 'a:postgresql:postgresql:9.2']);
    cpes = CPEURI.generateUniqueAncestors(['a:postgresql:postgresql:9.2', 'a:postgresql:postgresql:9.3']);
    expect(cpes).to.have.members(['a', 'a:postgresql', 'a:postgresql:postgresql', 'a:postgresql:postgresql:9.2', 'a:postgresql:postgresql:9.3']);
  });
});
