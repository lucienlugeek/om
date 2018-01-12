/**
 * 基于openlayers v4.0.1 的简单封装。
 * simple package based on openlayers v4.0.1.
 * @author lucienlugeek lucienlugeek@gmail.com
 * @description provide common functions on map.
 */

(function (root, factory) {
    if (typeof exports === "object") {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define(['ol'], factory);
    } else {
        root.OpenMap = factory(root.ol);
    }
}(this, function (ol) {
    'use strict';
    /**
     * OpenMap的初始化入口。
     * constructor of OpenMap.
     * @class OpenMap
     * @constructor
     */
    var OpenMap = function () {
        if (arguments.length) {
            this.init.apply(this, arguments);
        } else {
            throw 'Parameter should not be null!';
        }
    };

    /**
     * 检查类型  
     * **注意**：NaN会判断为Number类型  
     * Check type  
     * **Be aware**: NaN belongs to Number
     * @method OpenMap.is
     * @param  {Object} toBeChecked parameter to be checked
     * @param  {String} type Object,Array,String,RegExp,Boolean,Number,Function,Null,Undefined
     */
    OpenMap.is = function (toBeChecked, type) {
        return Object.prototype.toString.call((toBeChecked)) === '[object ' + type + ']';
    };

    /**
     * 根据坐标对象数组获取闭包范围
     * Obtain extent based on data array
     * @method OpenMap.getExtentByDataArray
     * @param {Object[]} data [{lon:131.00,lat:30},...]
     * @return {number[]} extent [minx,miny,maxx, maxy]
     */
    OpenMap.getExtentByDataArray = function (data) {
        var minx = 180;
        var miny = 180;
        var maxx = 0.0;
        var maxy = 0.0;
        var tmpx = 0.0;
        var tmpy = 0.0;
        var len = data.length;
        for (var p = 0; p < len; p++) {
            tmpx = parseFloat(data[p]['lon']);
            if (tmpx >= maxx) {
                maxx = tmpx;
            }
            if (tmpx < minx) {
                minx = tmpx;
            }

            tmpy = parseFloat(data[p]['lat']);
            if (tmpy >= maxy) {
                maxy = tmpy;
            }
            if (tmpy <= miny) {
                miny = tmpy;
            }
        }
        return [minx, miny, maxx, maxy];
    };

    /**
     * 根据坐标数组获取闭包范围
     * Obtain extent based on coordinates array
     * @method OpenMap.getExtentByCoordinates
     * @param {number[][]} data coordinates array [[131.00,30],...]
     * @return {number[]} extent [minx,miny,maxx, maxy]
     */
    OpenMap.getExtentByCoordinates = function (data) {
        var minx = 180;
        var miny = 180;
        var maxx = 0.0;
        var maxy = 0.0;
        var tmpx = 0.0;
        var tmpy = 0.0;
        var len = data.length;
        for (var p = 0; p < len; p++) {
            tmpx = parseFloat(data[p][0]);
            if (tmpx >= maxx) {
                maxx = tmpx;
            }
            if (tmpx < minx) {
                minx = tmpx;
            }

            tmpy = parseFloat(data[p][1]);
            if (tmpy >= maxy) {
                maxy = tmpy;
            }
            if (tmpy <= miny) {
                miny = tmpy;
            }
        }
        return [minx, miny, maxx, maxy];
    };

    /**
     * 计算半径的长度(单位米)
     * Calculate radius(meter)
     * @method OpenMap.calcRadius
     * @param {Object} map object
     * @param {Object} event
     * @return {number} distance(meter)
     */
    OpenMap.calcRadius = function (map, event) {
        event.feature.set("type", 'circle');
        var radius = event.feature.getGeometry().getRadius();
        var center = event.feature.getGeometry().getCenter();
        var lonlat = center[0] + "," + center[1];

        var start = center;
        var end = event.feature.getGeometry().getLastCoordinate();
        var mapProjection = map.getView().getProjection();
        var t1 = ol.proj.transform(start, mapProjection, 'EPSG:4326');
        var t2 = ol.proj.transform(end, mapProjection, 'EPSG:4326');

        // create sphere to measure on
        // one of WGS84 earth radius
        var wgs84sphere = new ol.Sphere(6378137);
        // get distance on sphere
        var dist = wgs84sphere.haversineDistance(t1, t2);
        dist = dist.toFixed(6); //unit meter
        return dist;
    };

    /**
     * 计算两点之间的距离(单位米)
     * Calculate distance of two points(meter)
     * @method OpenMap.calcDistance
     * @param {Object} start
     * @param {Object} end
     * @return {number} distance(meter)
     */
    OpenMap.calcDistance = function (start, end) {
        // create sphere to measure on
        // one of WGS84 earth radius'
        var wgs84sphere = new ol.Sphere(6378137);
        // get distance on sphere
        var dist = wgs84sphere.haversineDistance(start, end);
        dist = dist.toFixed(6); //unit meter
        return dist;
    };

    /**
     * 计算多边形面积(单位平方米)
     * Calculate area of polygon (square meter)
     * @method OpenMap.calcArea
     * @param {Object} polygon
     * @return {number} area(square meter)
     */
    OpenMap.calcArea = function (polygon) {
        var wgs84sphere = new ol.Sphere(6378137);
        var coordinates = polygon.getLinearRing(0).getCoordinates();
        return Math.abs(wgs84sphere.geodesicArea(coordinates));
    };

    OpenMap.prototype = {
        constructor: OpenMap,
        /**
         * 初始化图层组
         * Initialize layer
         * @method globalGroupLayer
         * @param {Object} options
         * @param {String} options.mapUrl url of layer
         * @param {String} options.layers name of layer
         * @return {Object} ol.layer.Group
         */
        globalGroupLayer: function (options) {
            if (typeof options === 'undefined' ||
                typeof options.mapUrl === 'undefined' ||
                typeof options.layers === 'undefined') {
                throw ('invalid options.');
            }
            return new ol.layer.Group({
                layers: [
                    new ol.layer.Image({
                        source: new ol.source.ImageWMS({
                            ratio: 1,
                            url: options.mapUrl,
                            crossOrigin: 'anonymous',
                            params: {
                                'FORMAT': options.format || 'image/png',
                                'VERSION': options.version || '1.1.0',
                                'LAYERS': options.layers
                            }
                        })
                    })
                ]
            });
        },
        /**
         * 初始化图片层
         * Initialize image layer
         * @method globalImageLayer
         * @param {Object} options
         * @param {String} options.mapUrl url of layer
         * @param {String} options.layers name of layer
         * @return {Object} ol.layer.Image
         */
        globalImageLayer: function (options) {
            if (typeof options === 'undefined' ||
                typeof options.mapUrl === 'undefined' ||
                typeof options.layers === 'undefined') {
                throw 'invalid options.'
            }
            return new ol.layer.Image({
                source: new ol.source.ImageWMS({
                    ratio: 1,
                    url: options.mapUrl,
                    crossOrigin: 'anonymous',
                    params: {
                        'FORMAT': options.format || 'image/png',
                        'VERSION': options.version || '1.1.0',
                        'LAYERS': options.layers
                    }
                })
            });
        },
        /**
         * 初始化瓦片层
         * Initialize tile layer
         * @method globalTileLayer
         * @param {Object} options
         * @param {String} options.mapUrl url of layer
         * @param {String} options.layers name of layer
         * @param {String} options.srs coordinate system
         * @param {Object} options.resolutions array of resolution
         * @param {Object} options.origin coordinate array for extent
         * @return {Object} ol.layer.Tile
         */
        globalTileLayer: function (options) {
            if (typeof options === 'undefined' ||
                typeof options.mapUrl === 'undefined' ||
                typeof options.layers === 'undefined' ||
                typeof options.srs === 'undefined' ||
                typeof options.resolutions === 'undefined' ||
                typeof options.origin === 'undefined') {
                throw 'invalid options.'
            }
            return new ol.layer.Tile({
                source: new ol.source.TileWMS({
                    url: options.mapUrl,
                    crossOrigin: 'anonymous',
                    params: {
                        'FORMAT': options.format || 'image/png',
                        'VERSION': options.version || '1.1.0',
                        'LAYERS': options.layers,
                        'SRS': options.srs
                    },
                    tileGrid: ol.tilegrid.TileGrid({
                        minZoom: options.minZoom || 0,
                        maxZoom: options.maxZoom || 9,
                        resolutions: options.resolutions, //[0.00068664552062088911, 0.00034332276031044456, 0.00017166138015522228]
                        origin: options.origin //[-180.0, 90.0]
                    })
                })
            });
        },
        /**
         * 初始化热力图层
         * Initialize thermodynamic diagram layer
         * @method globalHeatmapLayer
         * @param {Object} options
         * @param {String} options.data [{lon:131.00,lat:31.00,weight:11},...]
         * @return {Object} ol.layer.Heatmap
         */
        globalHeatmapLayer: function (options) {
            var features = [];
            if (options && options.data) {
                $.each(options.data, function (index, tempData) {
                    var coordinates = [parseFloat(tempData['lon']), parseFloat(tempData['lat'])];
                    features[index] = new ol.Feature({
                        geometry: new ol.geom.Point(coordinates),
                        weight: tempData['weight']
                    });
                });
            }
            return new ol.layer.Heatmap({
                source: new ol.source.Vector({
                    features: features
                }),
                gradient: options && options.gradient || ['#00f', '#0ff', '#0f0', '#ff0', '#f00'],
                blur: options && options.blur || 30,
                radius: options && options.radius || 30
            });
        },
        /**
         * 初始化vector layer
         * @method globalVectorLayer
         * @param {Object} options
         * @param {String} options.type Point(点), LineString(线),Circle(圆) ,Polygon(多边形)
         * @return {Object} ol.layer.Vector
         */
        globalVectorLayer: function (options) {
            var self = this;
            if (typeof options === 'undefined' ||
                typeof options.type === 'undefined') {
                throw 'invalid options.'
            }
            return new ol.layer.Vector({
                source: new ol.source.Vector(),
                style: options.style || function (feature) {
                    //type: Point(点), LineString(线),Circle(圆) ,Polygon(多边形)
                    if (options.type == 'Point') {
                        return self.getPointStyle();
                    } else {
                        return self.getPolyStyle();
                    }
                }
            });
        },
        /**
         * 根据指定参数，初始化地图到容器中
         * Initialize map to container
         * @method init
         * @param {String} id - The map container's ID
         * @param {Object} options - options
         * @param {number[]} options.center - center i.e: [120.561477,31.883179]
         * @param {number} [options.zoom] - zoom lever i.e: 15
         * @param {Object[]} [options.layers] - layers to be rendered i.e: [grouplayer,poiLayer]
         * @param {Object} [options.projection] - projection i.e: new ol.proj.Projection({code: 'EPSG:4326',units: 'degrees',});
         */
        init: function (id, options) {
            var ele = document.getElementById(typeof id === 'undefined' ? '' : id);
            if (ele === null) {
                console.error('Cannot find DOM which id is ' + id);
                return;
            }
            var self = this,
                param = $.extend({}, options);
            self._map = new ol.Map({
                target: ele,
                loadTilesWhileAnimating: true,
                view: new ol.View({
                    center: param.center,
                    zoom: param.zoom || 10,
                    minZoom: param.minZoom || 12,
                    maxZoom: param.maxZoom || 20,
                    projection: param.projection,
                    extent: param.extent
                }),
                layers: param.layers || [],
                extent: param.extent
            });
            //preserve all layers
            self._layer = {};
        },
        /**
         * 获取地图对象
         * Get map
         * @method getMap
         * @return {Object} map object
         */
        getMap: function () {
            return this._map;
        },
        /**
         * 获取投影
         * Get projection
         * @method getProjection
         * @return {Object} projection
         */
        getProjection: function () {
            return this._map.getView().getProjection();
        },
        /**
         * 获取投影编码
         * Get projection code
         * @method getProjectionCode
         * @return {String} projection code
         */
        getProjectionCode: function () {
            return this.getProjection().getCode();
        },
        /**
         * 设置点默认样式
         * Get default style of Point
         * @method getPointStyle
         * @return {Object} style
         */
        getPointStyle: function () {
            return new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 5,
                    fill: new ol.style.Fill({
                        color: 'rgba(255, 255, 255, 0.6)'
                    }),
                    stroke: new ol.style.Stroke({
                        color: 'rgba(0, 255, 255, 0.6)'
                    }),
                    image: new ol.style.Circle({
                        radius: 4,
                        fill: new ol.style.Fill({
                            color: '#FF0000'
                        })
                    })
                })
            });
        },
        /**
         * 设置线面默认样式
         * Get style of polygon
         * @method getPolyStyle
         * @return {Object} style
         */
        getPolyStyle: function () {
            return new ol.style.Style({
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 255, 0.6)'
                }),
                stroke: new ol.style.Stroke({
                    color: 'rgba(0, 255, 255, 0.6)'
                })
            });
        },
        /**
         * 添加层
         * add layer to map
         * @method addLayer
         * @param  {String} layerName Name of layer
         * @param  {Object} layerObj layer instance
         * @param  {bollean} force whether to force update layer
         * @return {Object} layer
         */
        addLayer: function (layerName, layerObj, force) {
            if (force) {
                if (arguments.length !== 3) return;
                this._layer[layerName] = layerObj;
                this._map.removeLayer(layerName);
                this._map.addLayer(layerObj);
            } else {
                if (arguments.length !== 2) return;
                if (this.getLayer(layerName)) return;
                this._layer[layerName] = layerObj;
                this._map.addLayer(layerObj);
            }
            return layerObj;
        },
        /**
         * 获取层
         * get layer
         * @method getLayer
         * @param  {String} layerName name of layer
         * @return {Object} layer
         */
        getLayer: function (layerName) {
            return this._layer[layerName];
        },
        /**
         * 移除层
         * remove layer
         * @method getLayer
         * @param  {String} layerName name of layer
         */
        removeLayer: function (layerName) {
            this._map.removeLayer(this.getLayer(layerName));
            this._layer[layerName] = null;
            delete this._layer[layerName];
        },
        /**
         * 向地图添加标记
         * add marker to map
         * @method addMarker
         * @param {Object} option options for creating marker
         * @param {string} option.id id for marker
         * @param {string} option.image image url for marker
         * @param {number[]} option.position coordinates for marker
         * @param {string} option.layerName name of the layer which the marker attached to
         * @param {number|undefined} option.zIndex zIndex of layer
         * @param {boolean|undefined} option.visible whether display layer
         * @returns {Object} marker
         */
        addMarker: function (option) {
            if (typeof option === 'undefined' ||
                typeof option.position === 'undefined' ||
                typeof option.layerName === 'undefined') {
                console.error('invalid option');
                return;
            }
            var self = this;
            var _layer = self.getLayer(option.layerName);
            if (!_layer) {
                _layer = new ol.layer.Vector({
                    source: new ol.source.Vector({
                        features: [],
                        overlaps: false
                    }),
                    style: function (fea) {
                        return new ol.style.Style({
                            image: new ol.style.Icon({
                                rotation: fea.get('rotation') || 0,
                                src: fea.get('image'),
                                anchor: fea.get('anchor')
                            })
                        });
                    },
                    zIndex: (typeof option.zIndex !== 'undefined' ? option.zIndex : 0)
                });
                self.addLayer(option.layerName, _layer);
            }
            var prop = $.extend({}, option, {
                geometry: new ol.geom.Point(option.position)
            });
            var fea = new ol.Feature(prop);
            fea.setId(option.id);
            _layer.getSource().addFeature(fea);
            if (option.visible !== undefined) {
                _layer.setVisible(option.visible);
            }
            return fea;
        },
        /**
         * 向地图添加多个标记
         * add markers to map
         * @method addMarkers
         * @param {Object} option
         */
        addMarkers: function (options) {
            if (typeof options === 'undefined' ||
                typeof options.data === 'undefined' ||
                typeof options.layerName === 'undefined') {
                console.error('必须指定marker的图层名称！');
                return;
            }
            var self = this;
            var _layer = this._layer[options.layerName];
            if (!_layer) {
                _layer = new ol.layer.Vector({
                    source: new ol.source.Vector(),
                    projection: self.getProjection(),
                    style: function (feature) {
                        return new ol.style.Style({
                            image: new ol.style.Icon({
                                rotation: feature.get('rotation') || 0,
                                src: feature.get('image'),
                                anchor: feature.get('anchor') || [0, 0]
                            }),
                            text: self.createTextStyle(feature.get('extData').hphm)
                        });
                    }
                });
            }
            var features = [];
            options.data.forEach(function (tempData, index) {
                var coordinates = [parseFloat(tempData['lon']), parseFloat(tempData['lat'])];
                features.push(new ol.Feature({
                    geometry: new ol.geom.Point(coordinates),
                    image: tempData['image'],
                    selfData: tempData
                }));
            });
            _layer.getSource().addFeatures(features);
            this._map.addLayer(_layer);
        },
        /**
         * 根据ID获取标记
         * get marker by ID
         * @method getMarkerById
         * @param  {String} id marker's id
         * @returns {Object} marker
         */
        getMarkerById: function (id) {
            if (typeof id === 'undefined') {
                console.error('id cannot be undefined!');
                return;
            }
            var self = this;
            for (var l in self._layer) {
                if (self._layer.hasOwnProperty(l)) {
                    var f = self._layer[l].getSource().getFeatureById(id);
                    if (f) {
                        return f;
                    } else {
                        continue;
                    }
                }
            }
            return null;
        },
        /**
         * 添加聚合图层  
         * add cluster to map
         * @method addCluster
         * @deprecated this method is not very common for use
         * @param {Object} arg options for creating cluster
         */
        addCluster: function (arg) {
            if (typeof arg === 'undefined' || !OpenMap.is(arg, 'Array')) {
                console.error('arg should be a valid array!');
                return;
            }
            var self = this;
            var len = arg.length;
            var features = new Array(len);
            var la, vi; //layername visible
            for (var i = 0; i < len; i++) {
                if (!la) {
                    la = arg[i].layerName
                }
                if (!vi) {
                    vi = arg[i].visible
                }
                var coordinates = arg[i].coordinates;
                coordinates[0] = Number(coordinates[0]);
                coordinates[1] = Number(coordinates[1]);
                features[i] = new ol.Feature({
                    geometry: new ol.geom.Point(coordinates),
                    status: !!arg[i].isTrue //online offline
                });
            }
            var source = new ol.source.Vector({
                features: features,
                projection: self.getProjection()
            });
            var clusterSource = new ol.source.Cluster({
                distance: 100,
                source: source
            });
            var _layer = new ol.layer.Vector({
                source: clusterSource,
                style: function (feature) {
                    var feas = feature.get('features'),
                        i = 0,
                        normalSize = 0;
                    var size = feas.length;
                    for (; i < size; i++) {
                        normalSize = normalSize + (feas[i].getProperties().status)
                    }
                    var rO, rI;
                    if (size >= 100) {
                        rO = 44;
                        rI = 33;
                    } else if (size >= 10 && size <= 99) {
                        rO = 32;
                        rI = 24;
                    } else {
                        rO = 28;
                        rI = 18;
                    }
                    style = new ol.style.Style({
                        image: new ol.style.Icon({
                            img: dcanvas($('canvas.process').clone().show().get(0), {
                                'centerX': '45',
                                'centerY': '45',
                                'radiusOutside': rO,
                                'radiusInside': rI,
                                'normalSize': normalSize,
                                'size': size
                            }),
                            imgSize: [90, 90]
                        }),
                    });
                    return style;
                }
            });
            self.addLayer(la, _layer).setVisible(vi);
        },
        /**
         * 添加覆盖元素
         * add overlay to map
         * @method addOverLay
         * @param {Object} option options for creating overlay
         */
        addOverLay: function (option) {
            if (!option || !option.position || !option.eid) {
                console.error('invalid param');
                return;
            }
            var self = this;
            var element = document.getElementById(option.eid);
            if (option.hide) {
                element.style.display = 'none';
            } else {
                element.style.display = 'block';
            }

            var popup = new ol.Overlay({
                id: option.id,
                position: option.position,
                element: element,
                stopEvent: typeof option.stopEvent !== 'undefined' ? option.stopEvent : true,
                offset: option.offset || [0, 0],
                positioning: option.positioning || 'center-center' //default center
            });
            self._map.addOverlay(popup);
            return popup;
        },
        /**
         * 获取覆盖元素
         * get overlay
         * @method getOverlay
         * @param {String} id id of overlay
         * @return {(Object|Array)} a specific overlay or all overlays
         */
        getOverlay: function () {
            if (arguments.length === 0) {
                return this._map.getOverlays().getArray();
            } else {
                var id = arguments[0];
                var ov = this._map.getOverlayById(id);
                return ov ? [ov] : [];
            }
        },
        /**
         * 删除Overlay：id 中包含参数domid的所有overlay
         * remove overlay(s) which element's id contains domid
         * @method removeOverlayByIndexOfId
         * @param  {String} domid
         */
        removeOverlayByIndexOfId: function (domid) {
            var self = this;
            var overlayArr = this._map.getOverlays().getArray();
            for (var i = overlayArr.length - 1; i >= 0; i--) {
                var ilid = overlayArr[i].getElement().id;
                if (ilid.indexOf(domid) != -1) {
                    self._map.removeOverlay(overlayArr[i]);
                }
            }
        },
        /**
         * 移除标记
         * remove marker
         * @method removeMarker
         * @param  {Object} m the specific marker instance
         */
        removeMarker: function (m) {
            if (typeof m === 'undefined' || !OpenMap.is(m, 'Object')) {
                console.error('invalid param');
                return;
            }
            var layerName = m.getProperties()['layerName'];
            var layer = this.getLayer(layerName);
            if (layer) {
                layer.getSource().removeFeature(m);
            }
        },
        /**
         * 移除指定图层上的所有标记
         * remove all markers on the specific layer
         * @method removeMarkerByLayer
         * @param {string} layerName
         */
        removeMarkerByLayer: function (layerName) {
            if (typeof layerName === 'undefined') {
                console.error('layer name cannot be null!');
                return;
            }
            var layer = this.getLayer(layerName);
            if (layer) {
                layer.getSource().clear();
            }
        },
        /**
         * 移除指定id的标记
         * remove marker with specific id
         * @method removeMarkerById
         * @param {string} id id of the marker to be removed
         */
        removeMarkerById: function (id) {
            if (typeof id === 'undefined') {
                console.error('marker\'s id cannot be null!');
                return;
            }
            var self = this;
            for (var l in self._layer) {
                if (self._layer.hasOwnProperty(l)) {
                    var f = self._layer[l].getSource().getFeatureById(id);
                    if (f) {
                        self._layer[l].getSource().removeFeature(f);
                        break;
                    }
                }
            }
        },
        /**
         * 添加图层的监听事件
         * add listener on layer
         * @method addLayerListener
         * @param {Object} layer
         */
        addLayerListener: function (layer) {
            var layerSelect = new ol.interaction.Select({
                condition: ol.events.condition.singleClick,
                layers: [layer],
                style: function (fea) { // prevent style change
                    return new ol.style.Style({
                        image: new ol.style.Icon({
                            anchor: fea.get('anchor'),
                            rotation: fea.get('rotation'),
                            src: fea.get('image')
                        })
                    });
                }
            });
            layerSelect.on('select', function (evt) {
                if (evt.selected.length === 0) {
                    return;
                }
                evt.selected.forEach(function (feature) {
                    var clickFun = feature.getProperties().onClick;
                    clickFun ? clickFun.call(feature, feature) : null;
                });
            });
            this._map.addInteraction(layerSelect);
            return layerSelect;
        },
        /**
         * 开启绘画功能
         * open draw function
         * @method openDraw
         * @param {String} type 点、线、矩形、多边形、圆（Point|LineString|Box|Polygon|Circle）
         * @param {events} events drawstart,drawend,change,propertychange
         */
        openDraw: function (type, events) {
            if (typeof type === 'undefined' || ['Point', 'LineString', 'Box', 'Polygon', 'Circle'].indexOf(type) === -1) {
                console.error('draw type is error!');
                return;
            }
            var self = this;
            var map = self.getMap();
            var source = new ol.source.Vector({
                wrapX: false
            });
            var _drawLayer = new ol.layer.Vector({
                source: source
            });
            self.addLayer('_drawLayer', _drawLayer);
            self._draw = new ol.interaction.Draw({
                source: source,
                type: /** @type {ol.geom.GeometryType} */ (type === "Box" ? "Circle" : type),
                geometryFunction: type === "Box" ? ol.interaction.Draw.createBox() : undefined
            });
            map.addInteraction(self._draw);
            if (events && !OpenMap.is(events, 'Object')) {
                console.warn('Event parameter is invalid！');
            } else {
                for (var e in events) {
                    if (events.hasOwnProperty(e)) {
                        // self._draw.dispatchEvent(e);
                        self._draw.on(e, events[e]);
                    }
                }
            }
        },
        /**
         * 返回绘画对象
         * get draw instance
         * @method getDraw
         * @return {Object} draw instance
         */
        getDraw: function () {
            return this._draw;
        },
        /**
         * 关闭绘画功能
         * close draw function
         * @method closeDraw
         */
        closeDraw: function () {
            if (this._draw) {
                this._map.removeInteraction(this._draw);
            }
        }
    };
    return OpenMap;
}));