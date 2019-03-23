/* Copyright (c) 2015 Google Inc. All rights reserved. */
/**
The `google-map` element renders a Google Map.

<b>Example</b>:

    <style>
      google-map {
        height: 600px;
      }
    </style>
    <google-map latitude="37.77493" longitude="-122.41942" api-key="1234"></google-map>

<b>Example</b> - add markers to the map and ensure they're in view:

    <google-map latitude="37.77493" longitude="-122.41942" fit-to-markers>
      <google-map-marker latitude="37.779" longitude="-122.3892"
          draggable="true" title="Go Giants!"></google-map-marker>
      <google-map-marker latitude="37.777" longitude="-122.38911"></google-map-marker>
    </google-map>

<b>Example</b>:

    <google-map disable-default-ui zoom="15"></google-map>
    <script>
      var map = document.querySelector('google-map');
      map.latitude = 37.77493;
      map.longitude = -122.41942;
      map.addEventListener('google-map-ready', function(e) {
        alert('Map loaded!');
      });
    </script>

<b>Example</b> - with Google directions, using data-binding inside another Polymer element

    <google-map map="{{map}}"></google-map>
    <google-map-directions map="[[map]]"
        start-address="San Francisco" end-address="Mountain View">
    </google-map-directions>

Disable dragging by adding `draggable="false"` on the `google-map` element.

<b>Example</b> - loading the Maps API from another origin (China)

    <google-map maps-url="http://maps.google.cn/maps/api/js?callback=%%callback%%">

###  Tips

If you're seeing the message "You have included the Google Maps API multiple times on this page. This may cause unexpected errors." it probably means you're loading other maps elements on the page (`<google-maps-directions>`). Each maps element must include the same set of configuration options (`apiKey`, `clientId`, `language`, `version`, etc.) so the Maps API is loaded from the same URL.

@demo demo/index.html
@demo demo/polys.html
@demo demo/kml.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import '@polymer/polymer/polymer-legacy.js';

import '@google-web-components/google-apis/google-maps-api.js';
import { IronResizableBehavior } from '@polymer/iron-resizable-behavior/iron-resizable-behavior.js';
import '@polymer/iron-selector/iron-selector.js';
import './google-map-marker.js';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';

Polymer({
  _template: html`
    <style>
      :host {
        position: relative;
        display: block;
        height: 100%;
      }

      #map {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
      }
    </style>

    <google-maps-api id="api" api-key="[[apiKey]]" client-id="[[clientId]]" version="[[version]]" signed-in="[[signedIn]]" language="[[language]]" on-api-load="_mapApiLoaded" maps-url="[[mapsUrl]]">
    </google-maps-api>

    <div id="map"></div>

    <iron-selector id="selector" multi="[[!singleInfoWindow]]" selected-attribute="open" activate-event="google-map-marker-open" on-google-map-marker-close="_deselectMarker">
      <slot id="markers" name="markers"></slot>
    </iron-selector>

    <slot id="objects"></slot>
`,

  is: 'google-map',

  /**
   * Fired when the Maps API has fully loaded.
   *
   * @event google-map-ready
   */

  /**
   * Fired when the user clicks on the map (but not when they click on a marker, infowindow, or
   * other object). Requires the clickEvents attribute to be true.
   *
   * @event google-map-click
   * @param {google.maps.MouseEvent} event The mouse event.
   */

  /**
   * Fired when the user double-clicks on the map. Note that the google-map-click event will also fire,
   * right before this one. Requires the clickEvents attribute to be true.
   *
   * @event google-map-dblclick
   * @param {google.maps.MouseEvent} event The mouse event.
   */

  /**
   * Fired repeatedly while the user drags the map. Requires the dragEvents attribute to be true.
   *
   * @event google-map-drag
   */

  /**
   * Fired when the user stops dragging the map. Requires the dragEvents attribute to be true.
   *
   * @event google-map-dragend
   */

  /**
   * Fired when the user starts dragging the map. Requires the dragEvents attribute to be true.
   *
   * @event google-map-dragstart
   */

  /**
   * Fired whenever the user's mouse moves over the map container. Requires the mouseEvents attribute to
   * be true.
   *
   * @event google-map-mousemove
   * @param {google.maps.MouseEvent} event The mouse event.
   */

  /**
   * Fired when the user's mouse exits the map container. Requires the mouseEvents attribute to be true.
   *
   * @event google-map-mouseout
   * @param {google.maps.MouseEvent} event The mouse event.
   */

  /**
   * Fired when the user's mouse enters the map container. Requires the mouseEvents attribute to be true.
   *
   * @event google-map-mouseover
   * @param {google.maps.MouseEvent} event The mouse event.
   */

  /**
   * Fired when the DOM `contextmenu` event is fired on the map container. Requires the clickEvents
   * attribute to be true.
   *
   * @event google-map-rightclick
   * @param {google.maps.MouseEvent} event The mouse event.
   */

  /**
   * Fired when the map becomes idle after panning or zooming.
   *
   * @event google-map-idle
   */

  /**
   * Polymer properties for the google-map custom element.
   */
  properties: {
    /**
     * A Maps API key. To obtain an API key, see https://developers.google.com/maps/documentation/javascript/tutorial#api_key.
     */
    apiKey: String,

    /**
     * Overrides the origin the Maps API is loaded from. Defaults to `https://maps.googleapis.com`.
     */
    mapsUrl: {
      type: String
      // Initial value set in google-maps-api.
    },

    /**
     * A Maps API for Business Client ID. To obtain a Maps API for Business Client ID, see https://developers.google.com/maps/documentation/business/.
     * If set, a Client ID will take precedence over an API Key.
     */
    clientId: String,

    /**
     * A latitude to center the map on.
     */
    latitude: {
      type: Number,
      value: 37.77493,
      notify: true,
      reflectToAttribute: true
    },

    /**
     * A Maps API object.
     */
    map: {
      type: Object,
      notify: true,
      value: null
    },

    /**
     * A longitude to center the map on.
     */
    longitude: {
      type: Number,
      value: -122.41942,
      notify: true,
      reflectToAttribute: true
    },

    /**
     * A kml file to load.
     */
    kml: {
      type: String,
      value: null,
      observer: '_loadKml'
    },

    /**
     * A zoom level to set the map to.
     */
    zoom: {
      type: Number,
      value: 10,
      observer: '_zoomChanged',
      notify: true
    },

    /**
     * When set, prevents the map from tilting (when the zoom level and viewport supports it).
     */
    noAutoTilt: {
      type: Boolean,
      value: false
    },

    /**
     * Map type to display. One of 'roadmap', 'satellite', 'hybrid', 'terrain'.
     */
    mapType: {
      type: String,
      value: 'roadmap', // roadmap, satellite, hybrid, terrain,
      observer: '_mapTypeChanged',
      notify: true
    },

    /**
     * Version of the Google Maps API to use.
     */
    version: {
      type: String,
      value: '3.exp'
    },

    /**
     * If set, removes the map's default UI controls.
     */
    disableDefaultUi: {
      type: Boolean,
      value: false,
      observer: '_disableDefaultUiChanged'
    },

    /**
     * If set, removes the map's 'map type' UI controls.
     */
    disableMapTypeControl: {
      type: Boolean,
      value: false,
      observer: '_disableMapTypeControlChanged'
    },

    /**
     * If set, removes the map's 'street view' UI controls.
     */
    disableStreetViewControl: {
      type: Boolean,
      value: false,
      observer: '_disableStreetViewControlChanged'
    },

    /**
     * If set, the zoom level is set such that all markers (google-map-marker children) are brought into view.
     */
    fitToMarkers: {
      type: Boolean,
      value: false,
      observer: '_fitToMarkersChanged'
    },

    /**
     * If true, prevent the user from zooming the map interactively.
     */
    disableZoom: {
      type: Boolean,
      value: false,
      observer: '_disableZoomChanged'
    },

    /**
     * If set, custom styles can be applied to the map.
     * For style documentation see https://developers.google.com/maps/documentation/javascript/reference#MapTypeStyle
     */
    styles: {
      type: Object,
      value: function() { return {}; }
    },

    /**
     * A maximum zoom level which will be displayed on the map.
     */
    maxZoom: {
      type: Number,
      observer: '_maxZoomChanged'
    },

    /**
     * A minimum zoom level which will be displayed on the map.
     */
    minZoom: {
      type: Number,
      observer: '_minZoomChanged'
    },

    /**
     * If true, sign-in is enabled.
     * See https://developers.google.com/maps/documentation/javascript/signedin#enable_sign_in
     */
    signedIn: {
      type: Boolean,
      value: false
    },

    /**
     * The localized language to load the Maps API with. For more information
     * see https://developers.google.com/maps/documentation/javascript/basics#Language
     *
     * Note: the Maps API defaults to the preffered language setting of the browser.
     * Use this parameter to override that behavior.
     */
    language: {
      type: String
    },

    /**
     * When true, map *click events are automatically registered.
     */
    clickEvents: {
      type: Boolean,
      value: false,
      observer: '_clickEventsChanged'
    },

    /**
     * When true, map drag* events are automatically registered.
     */
    dragEvents: {
      type: Boolean,
      value: false,
      observer: '_dragEventsChanged'
    },

    /**
     * When true, map mouse* events are automatically registered.
     */
    mouseEvents: {
      type: Boolean,
      value: false,
      observer: '_mouseEventsChanged'
    },

    /**
     * Additional map options for google.maps.Map constructor.
     * Use to specify additional options we do not expose as
     * properties.
     * Ex: `<google-map additional-map-options='{"mapTypeId":"satellite"}'>`
     *
     * Note, you can't use API enums like `google.maps.ControlPosition.TOP_RIGHT`
     * when using this property as an HTML attribute. Instead, use the actual
     * value (e.g. `3`) or set `.additionalMapOptions` in JS rather than using
     * the attribute.
     */
    additionalMapOptions: {
      type: Object,
      value: function() { return {}; }
    },

    /**
     * The markers on the map.
     */
    markers: {
      type: Array,
      value: function() { return []; },
      readOnly: true
    },

    /**
     * The non-marker objects on the map.
     */
    objects: {
      type: Array,
      value: function() { return []; },
      readOnly: true
    },

    /**
     * If set, all other info windows on markers are closed when opening a new one.
     */
    singleInfoWindow: {
      type: Boolean,
      value: false
    }
  },

  behaviors: [
    IronResizableBehavior
  ],

  listeners: {
    'iron-resize': 'resize'
  },

  observers: [
    '_debounceUpdateCenter(latitude, longitude)'
  ],

  attached: function() {
    this._initGMap();
  },

  detached: function() {
    if (this._markersChildrenListener) {
      this.unlisten(this.$.selector, 'items-changed', '_updateMarkers');
      this._markersChildrenListener = null;
    }
    if (this._objectsMutationObserver) {
      this._objectsMutationObserver.disconnect();
      this._objectsMutationObserver = null;
    }
  },

  _initGMap: function() {
    if (this.map) {
      return; // already initialized
    }
    if (this.$.api.libraryLoaded !== true) {
      return; // api not loaded
    }
    if (!this.isAttached) {
      return; // not attached
    }

    this.map = new google.maps.Map(this.$.map, this._getMapOptions());
    this._listeners = {};
    this._updateCenter();
    this._loadKml();
    this._updateMarkers();
    this._updateObjects();
    this._addMapListeners();
    this.fire('google-map-ready');
  },

  _mapApiLoaded: function() {
    this._initGMap();
  },

  _getMapOptions: function() {
    var mapOptions = {
      zoom: this.zoom,
      tilt: this.noAutoTilt ? 0 : 45,
      mapTypeId: this.mapType,
      disableDefaultUI: this.disableDefaultUi,
      mapTypeControl: !this.disableDefaultUi && !this.disableMapTypeControl,
      streetViewControl: !this.disableDefaultUi && !this.disableStreetViewControl,
      disableDoubleClickZoom: this.disableZoom,
      scrollwheel: !this.disableZoom,
      styles: this.styles,
      maxZoom: Number(this.maxZoom),
      minZoom: Number(this.minZoom)
    };

    // Only override the default if set.
    // We use getAttribute here because the default value of this.draggable = false even when not set.
    if (this.getAttribute('draggable') != null) {
      mapOptions.draggable = this.draggable
    }
    for (var p in this.additionalMapOptions)
      mapOptions[p] = this.additionalMapOptions[p];

    return mapOptions;
  },

  _attachChildrenToMap: function(children) {
    if (this.map) {
      for (var i = 0, child; child = children[i]; ++i) {
        child.map = this.map;
      }
    }
  },

  // watch for future updates to marker objects
  _observeMarkers: function() {
    // Watch for future updates.
    if (this._markersChildrenListener) {
      return;
    }
    this._markersChildrenListener = this.listen(this.$.selector, 'items-changed', '_updateMarkers');
  },

  _updateMarkers: function() {
    var newMarkers = Array.prototype.slice.call(
        dom(this.$.markers).getDistributedNodes());

    // do not recompute if markers have not been added or removed
    if (newMarkers.length === this.markers.length) {
      var added = newMarkers.filter(function(m) {
        return this.markers && this.markers.indexOf(m) === -1;
      }.bind(this));
      if (added.length === 0) {
        // set up observer first time around
        if (!this._markersChildrenListener) {
          this._observeMarkers();
        }
        return;
      }
    }

    this._observeMarkers();

    this._setMarkers(newMarkers);

    // Set the map on each marker and zoom viewport to ensure they're in view.
    this._attachChildrenToMap(this.markers);
    if (this.fitToMarkers) {
      this._fitToMarkersChanged();
    }
  },

  // watch for future updates to non-marker objects
  _observeObjects: function() {
    if (this._objectsMutationObserver) {
      return;
    }
    this._objectsMutationObserver = new MutationObserver(this._updateObjects.bind(this));
    this._objectsMutationObserver.observe(this, {
      childList: true
    });
  },

  _updateObjects: function() {
    var newObjects = Array.prototype.slice.call(
        dom(this.$.objects).getDistributedNodes());

    // Do not recompute if objects have not been added or removed.
    if (newObjects.length === this.objects.length) {
      var added = newObjects.filter(function(o) {
        return this.objects.indexOf(o) === -1;
      }.bind(this));
      if (added.length === 0) {
        // Set up observer first time around.
        this._observeObjects();
        return;
      }
    }

    this._observeObjects();
    this._setObjects(newObjects);
    this._attachChildrenToMap(this.objects);
  },

  /**
   * Clears all markers from the map.
   *
   * @method clear
   */
  clear: function() {
    for (var i = 0, m; m = this.markers[i]; ++i) {
      m.marker.setMap(null);
    }
  },

  /**
   * Explicitly resizes the map, updating its center. This is useful if the
   * map does not show after you have unhidden it.
   *
   * @method resize
   */
  resize: function() {
    if (this.map) {

      // saves and restores latitude/longitude because resize can move the center
      var oldLatitude = this.latitude;
      var oldLongitude = this.longitude;
      google.maps.event.trigger(this.map, 'resize');
      this.latitude = oldLatitude;  // restore because resize can move our center
      this.longitude = oldLongitude;

      if (this.fitToMarkers) { // we might not have a center if we are doing fit-to-markers
        this._fitToMarkersChanged();
      }
    }
  },

  _loadKml: function() {
    if (this.map && this.kml) {
      var kmlfile = new google.maps.KmlLayer({
        url: this.kml,
        map: this.map
      });
    }
  },

  _debounceUpdateCenter: function() {
    this.debounce('updateCenter', this._updateCenter);
  },

  _updateCenter: function() {
    this.cancelDebouncer('updateCenter');

    if (this.map && this.latitude !== undefined && this.longitude !== undefined) {
      // allow for latitude and longitude to be String-typed, but still Number valued
      var lati = Number(this.latitude);
      if (isNaN(lati)) {
        throw new TypeError('latitude must be a number');
      }
      var longi = Number(this.longitude);
      if (isNaN(longi)) {
        throw new TypeError('longitude must be a number');
      }

      var newCenter = new google.maps.LatLng(lati, longi);
      var oldCenter = this.map.getCenter();

      if (!oldCenter) {
        // If the map does not have a center, set it right away.
        this.map.setCenter(newCenter);
      } else {
        // Using google.maps.LatLng returns corrected lat/lngs.
        oldCenter = new google.maps.LatLng(oldCenter.lat(), oldCenter.lng());

        // If the map currently has a center, slowly pan to the new one.
        if (!oldCenter.equals(newCenter)) {
          this.map.panTo(newCenter);
        }
      }
    }
  },

  _zoomChanged: function() {
    if (this.map) {
      this.map.setZoom(Number(this.zoom));
    }
  },

  _idleEvent: function() {
    if (this.map) {
      this._forwardEvent('idle');
    } else {
      this._clearListener('idle');
    }
  },

  _clickEventsChanged: function() {
    if (this.map) {
      if (this.clickEvents) {
        this._forwardEvent('click');
        this._forwardEvent('dblclick');
        this._forwardEvent('rightclick');
      } else {
        this._clearListener('click');
        this._clearListener('dblclick');
        this._clearListener('rightclick');
      }
    }
  },

  _dragEventsChanged: function() {
    if (this.map) {
      if (this.dragEvents) {
        this._forwardEvent('drag');
        this._forwardEvent('dragend');
        this._forwardEvent('dragstart');
      } else {
        this._clearListener('drag');
        this._clearListener('dragend');
        this._clearListener('dragstart');
      }
    }
  },

  _mouseEventsChanged: function() {
    if (this.map) {
      if (this.mouseEvents) {
        this._forwardEvent('mousemove');
        this._forwardEvent('mouseout');
        this._forwardEvent('mouseover');
      } else {
        this._clearListener('mousemove');
        this._clearListener('mouseout');
        this._clearListener('mouseover');
      }
    }
  },

  _maxZoomChanged: function() {
    if (this.map) {
      this.map.setOptions({maxZoom: Number(this.maxZoom)});
    }
  },

  _minZoomChanged: function() {
    if (this.map) {
      this.map.setOptions({minZoom: Number(this.minZoom)});
    }
  },

  _mapTypeChanged: function() {
    if (this.map) {
      this.map.setMapTypeId(this.mapType);
    }
  },

  _disableDefaultUiChanged: function() {
    if (!this.map) {
      return;
    }
    this.map.setOptions({disableDefaultUI: this.disableDefaultUi});
  },

  _disableMapTypeControlChanged: function() {
    if (!this.map) {
      return;
    }
    this.map.setOptions({mapTypeControl: !this.disableMapTypeControl});
  },

  _disableStreetViewControlChanged: function() {
    if (!this.map) {
      return;
    }
    this.map.setOptions({streetViewControl: !this.disableStreetViewControl});
  },

  _disableZoomChanged: function() {
    if (!this.map) {
      return;
    }
    this.map.setOptions({
      disableDoubleClickZoom: this.disableZoom,
      scrollwheel: !this.disableZoom
    });
  },

  attributeChanged: function(attrName) {
    if (!this.map) {
      return;
    }
    // Cannot use *Changed watchers for native properties.
    switch (attrName) {
      case 'draggable':
        this.map.setOptions({draggable: this.draggable});
        break;
    }
  },

  _fitToMarkersChanged: function() {
    // TODO(ericbidelman): respect user's zoom level.

    if (this.map && this.fitToMarkers && this.markers.length > 0) {
      var latLngBounds = new google.maps.LatLngBounds();
      for (var i = 0, m; m = this.markers[i]; ++i) {
        latLngBounds.extend(
            new google.maps.LatLng(m.latitude, m.longitude));
      }

      // For one marker, don't alter zoom, just center it.
      if (this.markers.length > 1) {
        this.map.fitBounds(latLngBounds);
      }

      this.map.setCenter(latLngBounds.getCenter());
    }
  },

  _addMapListeners: function() {
    google.maps.event.addListener(this.map, 'center_changed', function() {
      var center = this.map.getCenter();
      this.latitude = center.lat();
      this.longitude = center.lng();
    }.bind(this));

    google.maps.event.addListener(this.map, 'zoom_changed', function() {
      this.zoom = this.map.getZoom();
    }.bind(this));

    google.maps.event.addListener(this.map, 'maptypeid_changed', function() {
      this.mapType = this.map.getMapTypeId();
    }.bind(this));

    this._clickEventsChanged();
    this._dragEventsChanged();
    this._mouseEventsChanged();
    this._idleEvent();
  },

  _clearListener: function(name) {
    if (this._listeners[name]) {
      google.maps.event.removeListener(this._listeners[name]);
      this._listeners[name] = null;
    }
  },

  _forwardEvent: function(name) {
    this._listeners[name] = google.maps.event.addListener(this.map, name, function(event) {
      this.fire('google-map-' + name, event);
    }.bind(this));
  },

  _deselectMarker: function(e, detail) {
    // If singleInfoWindow is set, update iron-selector's selected attribute to be null.
    // Else remove the marker from iron-selector's selected array.
    var markerIndex = this.$.selector.indexOf(e.target);

    if (this.singleInfoWindow) {
      this.$.selector.selected = null;
    } else if (this.$.selector.selectedValues) {
      this.$.selector.selectedValues = this.$.selector.selectedValues.filter(function(i) {return i !== markerIndex});
    }
  }
});
