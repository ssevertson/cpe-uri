var CPEURI, Component, Components, components, packed;

CPEURI = module.exports;

function Component(id, name) {
  this.id = id;
  this.name = name;
};

function Components(names) {
  var component, id, name;
  this.ascending = [];
  for(id = 0; id < names.length; id++) {
    name = names[id];
    component = new Component(id, name);
    this.ascending.push(component);
    this[name] = component;
  };
  this.descending = this.ascending.slice().reverse();
};

components = new Components([
  'part',
  'vendor',
  'product',
  'version',
  'update',
  'edition',
  'lang',
  'sw_edition',
  'target_sw',
  'target_hw',
  'other']);

packed = new Components([
  'edition',
  'sw_edition',
  'target_sw',
  'target_hw',
  'other']);

CPEURI.unbind = function(cpeUri) {
  var values, component, value, id, wfn, partId;
  values = cpeUri.replace(/^cpe:?\//, '').split(/:/).map(function(value) {
    return decodeURIComponent(value);
  });
  wfn = {};
  for(id = components.part.id; id < values.length && id <= components.lang.id; id++) {
    value = values[id];
    component = components.ascending[id];
    if(component === components.edition && value && value.charAt(0) === '~') {
      parts = value.slice(1).split(/~/);
      for(partId = 0; partId < parts.length; partId++) {
        wfn[packed.ascending[partId].name] = parts[partId];
      };
    } else {
      wfn[component.name] = value;
    };
  };
  return wfn;
};

CPEURI.bind = function(wfn) {
  var component, cpeUri, value, id;
  cpeUri = [];
  for(id = components.part.id; id <= components.lang.id; id++) {
    component = components.ascending[id];
    value = wfn[component.name] || '';
    if(component === components.edition) {
      hasPackedData = packed.ascending.slice(packed.sw_edition.id).some(function(packed) {
        return wfn[packed.name]
      });
      if(hasPackedData) {
        value = '~' + packed.ascending.map(function(packed) {
          return wfn[packed.name];
        }).join('~');
      };
    };
    cpeUri.push(encodeURIComponent(value));
  };
  return cpeUri.join(':').replace(/:+$/, '');
};

CPEURI.getMostSpecificComponentName = function(wfn) {
  var component, id;
  if (wfn.part === void 0) {
    wfn = CPEURI.unbind(wfn);
  };
  for (id = 0; id < components.descending.length; id++) {
    component = components.descending[id];
    if (wfn[component.name]) {
      return component.name;
    };
  };
  return null;
};

CPEURI.makeLessSpecific = function(wfn) {
  var componentName;
  if (wfn.part === void 0) {
    wfn = CPEURI.unbind(wfn);
  };
  wfn = clone(wfn);
  componentName = CPEURI.getMostSpecificComponentName(wfn);
  if (componentName) {
    delete wfn[componentName];
  };
  return wfn;
};

CPEURI.bindLessSpecific = function(wfn) {
  if (wfn.part === void 0) {
    wfn = CPEURI.unbind(wfn);
  };
  wfn = CPEURI.makeLessSpecific(wfn);
  return CPEURI.bind(wfn);
};

CPEURI.forEach = function(wfn, callback) {
  var component, value, id;
  if (wfn.part === void 0) {
    wfn = CPEURI.unbind(wfn);
  };
  _ref = components.ascending;
  for (id = 0; id < components.ascending.length; id++) {
    component = components.ascending[id];
    value = wfn[component.name];
    if (value) {
      callback(component.name, value);
    };
  };
};

CPEURI.generateUniqueComponentLists = function(wfns) {
  var result, wfn, index, key;
  if (!Array.isArray(wfns)) {
    wfns = [wfns];
  }
  intermediate = {};
  for (index = 0; index < wfns.length; index++) {
    wfn = wfns[index];
    if (wfn.part === void 0) {
      wfn = CPEURI.unbind(wfn);
    };
    CPEURI.forEach(wfn, function(component, value) {
      var current;
      current = intermediate[component];
      if (!current) {
        intermediate[component] = current = {};
      }
      current[value] = true;
    });
  }

  return Object.keys(intermediate).reduce(function(result, key) {
    result[key] = Object.keys(intermediate[key])
    return result;
  }, {})
};

CPEURI.generateUniqueAncestors = function(wfns) {
  var ancestors, wfn, wfnTemp, index;
  if (!Array.isArray(wfns)) {
    wfns = [wfns];
  }
  ancestors = {};
  for (index = 0; index < wfns.length; index++) {
    wfn = wfns[index];
    if (wfn.part === void 0) {
      wfn = CPEURI.unbind(wfn);
    }
    wfnTemp = {};
    CPEURI.forEach(wfn, function(componentName, value) {
      wfnTemp[componentName] = value;
      ancestors[CPEURI.bind(wfnTemp)] = true;
    });
  }
  return Object.keys(ancestors);
};
  
function clone(object) {
  return Object.keys(object).reduce(function (obj, k) {
    obj[k] = object[k];
    return obj;
  }, {});
};
