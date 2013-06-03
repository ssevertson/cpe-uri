CPE-URI
=======

Bind/Unbind [CPE URIs](http://csrc.nist.gov/publications/nistir/ir7695/NISTIR-7695-CPE-Naming.pdf)

To unbind/parse a CPE URI:
    var cpe_uri = require('cpe-uri');
    console.log(cpe_uri.parse('a:vendor:product:version:update:edition:lang'));
    /* {
      part: 'a',
      vendor: 'vendor',
      product: 'product',
      version: 'version',
      update: 'update',
      edition: 'edition',
      lang: 'lang'
    } */

To bind/format a CPE URI:
    var cpe_uri = require('cpe-uri');
    console.log(cpe_uri.format({
      part: 'a',
      vendor: 'vendor',
      product: 'product',
      version: 'version',
      update: 'update',
      edition: 'edition',
      lang: 'lang'
    }));
    /* a:vendor:product:version:update:edition:lang */

All methods support "packed" extended attributes from the CPE 2.3 specification.

A handful of utility/convenience methods are provided:
    var cpe_uri = require('cpe-uri');

    console.log(cpe_uri.getMostSpecificComponentName('a:vendor:product:version:update:edition:lang'));
    /* edition */
    
    console.log(cpe_uri.makeLessSpecific('a:vendor:product:version:update:edition:lang'));
    /* {
      part: 'a',
      vendor: 'vendor',
      product: 'product',
      version: 'version',
      update: 'update',
      edition: 'edition'
    } */
    
    console.log(cpe_uri.bindLessSpecific('a:vendor:product:version:update:edition:lang'));
    /* a:vendor:product:version:update:edition */

    cpe_uri.forEach('a:vendor:product:version:update:edition:lang', function(name, value) {
      console.log(name + ' = ' value);
    });
    /*
      part = a
      vendor = vendor
      product = product
      version = version
      update = update
      edition = edition
    */
    
    console.log(cpe_uri.generateUniqueComponentLists(['a:vendor:product:version:update:edition:lang', 'o:vendor:product2:version2:update']));
    /* {
      part: ['a', 'o'],
      vendor: ['vendor'],
      product: ['product', 'product2'],
      version: ['version', 'version2'],
      update: ['update'],
      edition: ['edition'],
      lang: ['lang']
    } */

    console.log(cpe_uri.generateUniqueAncestors('a:postgresql:postgresql:9.2'));
    /* [
      'a',
      'a:postgresql',
      'a:postgresql:postgresql',
      'a:postgresql:postgresql:9.2'
    ] */

Pull Requests are welcome, but please be sure to include Mocha tests which exercise any additions/changes.
