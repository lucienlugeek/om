// framework based on openlayers Version v4.0.1 by lucien
;
(function (root, factory) {
    if (typeof exports === "object") {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define(['ol'], factory);
    } else {
        root.OpenMap = factory();
    }
}(this, function (ol) {
    var OpenMap = window.OpenMap = function () {
        if (arguments.length) {
            this.init.apply(this, arguments);
        }
    };
    /**
     * @desc 判断是否为 Object,Array,String,RegExp,Boolean,Number,Function
     */
    OpenMap.is = function (arg1, arg2) {
        return Object.prototype.toString.call((arg1)) === '[object ' + arg2 + ']';
    };
    OpenMap.prototype = {
        constructor: OpenMap,
        initParam: {
            projection: new ol.proj.Projection({
                code: 'EPSG:4490',
                units: 'degrees',
            }),
            center: [121.84059516385024, 29.902349218390047]//如不指定，则默认北仑区政府
        },
        /**
         * @desc 根据指定参数，初始化地图到容器中
         */
        init: function (id, options) {
            var ele = document.getElementById(typeof id === 'undefined' ? '' : id);
            if (ele === null) {
                console.error('地图容器的id为空或找不到id = ' + id + '的DOM元素');
                return;
            }
            var self = this;
            if (options) {
                $.extend(self.initParam, options); //地图初始化参数
            }
            var initParam = self.initParam;
            var bounds = [121.64747112300006, 29.702835634000053,
                122.1792500360001, 30.002109405000056];
            //地图底图
            var baseMapKJ = new ol.layer.Tile({
                source:
                new ol.source.TileWMS({
                    url: 'http://192.168.3.233:8180/geowebcache/service/wms',
                    params: {
                        'FORMAT': 'image/png',
                        'VERSION': '1.1.1',
                        'LAYERS': 'beiluncacheKJ',
                        'SRS': 'EPSG:4490'
                    },
                    tileGrid: ol.tilegrid.TileGrid({
                        minZoom: 0,
                        maxZoom: 9,
                        resolutions: [0.00068664552062088911, 0.00034332276031044456, 0.00017166138015522228, 8.5830690077611139e-005, 4.291534503880557e-005, 2.1457672519402785e-005,
                            1.0728836259701392e-005, 5.3644181298506962e-006, 2.6822090649253481e-006, 1.3411045324626741e-006],
                        origin: [-180.0, 90.0]  //
                    })
                }),
                extent: bounds
            });
            //地图标注
            var baseMapBZ = new ol.layer.Tile({
                source:
                new ol.source.TileWMS({
                    url: 'http://192.168.3.233:8180/geowebcache/service/wms',
                    params: {
                        'FORMAT': 'image/png',
                        'VERSION': '1.1.1',
                        'LAYERS': 'beiluncacheBZ',
                        'SRS': 'EPSG:4490'
                    },
                    tileGrid: ol.tilegrid.TileGrid({
                        minZoom: 0,
                        maxZoom: 9,
                        resolutions: [0.00068664552062088911, 0.00034332276031044456, 0.00017166138015522228, 8.5830690077611139e-005, 4.291534503880557e-005, 2.1457672519402785e-005,
                            1.0728836259701392e-005, 5.3644181298506962e-006, 2.6822090649253481e-006, 1.3411045324626741e-006],
                        origin: [-180.0, 90.0]  //
                    })
                }),
                extent: bounds
            });
            self._map = new ol.Map({
                controls: ol.control.defaults({
                    attribution: false
                }),
                target: ele,
                loadTilesWhileAnimating: true,
                view: new ol.View({
                    center: initParam.center,
                    zoom: initParam.zoom || 10,
                    minZoom: initParam.minZoom || 12,
                    maxZoom: initParam.maxZoom || 19,
                    projection: initParam.projection,
                    extent: initParam.extent || undefined
                }),
                layers: [baseMapKJ, baseMapBZ],
                extent: bounds
            });
            //保存所有的layer
            self._layer = {};
            //鼠标在地图上移动到某个feature上的时候，更改cursor样式
            self._map.on('pointermove', function (evt) {
                var jq = $(self._map.getTargetElement());
                jq.css({
                    cursor: self._map.hasFeatureAtPixel(evt.pixel) ? 'pointer' : ''
                });
            });
        },
        /**
         * @desc 获取map对象
         */
        getMap: function () {
            return this._map;
        },
        /**
         * @desc 添加层
         */
        addLayer: function (layer) {
            this._map.addLayer(layer);
        },
        /**
         * @desc 获取层
         */
        getLayer: function (layerName) {
            return this._layer[layerName];
        },
        /**
         * @desc 向地图添加marker标记
         * @returns 返回构建的marker对象
         */
        addMarker: function (option) {
            if (typeof option === 'undefined'
                || typeof option.position === 'undefined'
                || typeof option.layer === 'undefined') {
                console.error('必须指定marker的图层名称！');
                return;
            }
            var self = this;
            var _layer = self.getLayer(option.layer);
            if (!_layer) {
                _layer = self._layer[option.layer] = new ol.layer.Vector({ //存放标注点的layer
                    source: new ol.source.Vector({
                        features: [],
                        overlaps: false//是否允许重叠
                    }),
                    style: function (fea) {
                        return new ol.style.Style({
                            image: new ol.style.Icon({
                                rotation: fea.get('rotation') || 0,
                                src: fea.get('image'),
                                anchor: fea.get('anchor')
                            })
                        });
                    }
                });
                self.addLayer(_layer);
                self.addLayerListener(option.layer);
            }
            var fea = new ol.Feature({
                geometry: new ol.geom.Point(option.position),
                anchor: option.anchor,
                image: option.image,
                onClick: option.onClick,
                extData: option.extData,
                layerName: option.layer,
                rotation: option.rotation
            });
            fea.setId(option.id);
            _layer.getSource().addFeatures([fea]);
            _layer.setVisible(option.visible);
            return fea;
        },
        /**
         * @desc 根据id获取marker
         */
        getMarkerById: function (id) {
            if (typeof id === 'undefined') {
                console.error('请传入marker的id');
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
        },
        /**
         * @desc 添加聚合图层
         */
        addCluster: function (arg) {
            if (typeof arg === 'undefined'
                || !OpenMap.is(arg, 'Array')) {
                console.error('请输入数组类型的参数');
                return;
            }
            var self = this;
            // test data
            // var count = 1000;
            // var features = new Array(count);
            // for (var i = 0; i < count; ++i) {
            //     var coordinates = arg.coordinates || [121 + Math.random() * 2, 29 + Math.random()];
            //     features[i] = new ol.Feature({
            //         geometry: new ol.geom.Point(coordinates),
            //         status: !!arg.isTrue
            //     });
            // }
            var len = arg.length;
            var features = new Array(len);
            var la, vi;//layername visible
            for (var i = 0; i < len; i++) {
                if (!la) { la = arg[i].layerName }
                if (!vi) { vi = arg[i].visible }
                var coordinates = arg[i].coordinates;
                coordinates[0] = Number(coordinates[0]);
                coordinates[1] = Number(coordinates[1]);
                features[i] = new ol.Feature({
                    geometry: new ol.geom.Point(coordinates),
                    status: !!arg[i].isTrue//在线，离线
                });
            }
            var source = new ol.source.Vector({
                features: features
            });
            var clusterSource = new ol.source.Cluster({
                distance: 100,
                source: source
            });
            var styleCache = {};
            var _layer = self.getLayer();
            if (!_layer) {
                _layer = self._layer[la] = new ol.layer.Vector({
                    source: clusterSource,
                    style: function (feature) {
                        var feas = feature.get('features'), i = 0, normalSize = 0;
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
                        // var style = styleCache[size];
                        // if (!style) {
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
                            // text: new ol.style.Text({
                            //     text: normalSize + "/" + size,
                            //     fill: new ol.style.Fill({
                            //         color: 'black'
                            //     })
                            // })
                        });
                        // styleCache[size] = style;
                        // }
                        return style;
                    }
                });
                self.addLayer(_layer);
                _layer.setVisible(vi);
            }
        },
        /**
         * @desc 添加覆盖元素
         */
        addOverLay: function (option) {
            if (!option
                || !option.position
                || !option.eid) {
                console.error('invalid param');
                return;
            }
            var self = this;
            var element = document.getElementById(option.eid);
            if (option.hide) {
                element.style.display = 'none';
            }
            var popup = new ol.Overlay({
                id: option.id,
                element: element,
                stopEvent: typeof option.stopEvent !== 'undefined' ? option.stopEvent : false,
                offset: option.offset || [0, 0],
                positioning: option.positioning || 'center-center' //中心点位于容器的正中间
            });
            popup.setPosition(option.position);
            self._map.addOverlay(popup);
        },
        /**
         * @desc 获取所有的覆盖元素
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
         * @desc 移除marker
         */
        removeMarker: function (m) {
            if (typeof m === 'undefined' || !OpenMap.is(m, 'Object')) {
                console.error('参数错误');
                return;
            }
            var layerName = m.getProperties()['layerName'];
            var self = this;
            self.getLayer(layerName).getSource().removeFeature(m);
        },
        /**
         * @desc 移除指定layer，从而移除依载该layer的所有marker
         * @param arg
         */
        removeMarkerByLayer: function (arg) {
            if (typeof arg === 'undefined') {
                console.error('请传入layer名称');
                return;
            }
            var self = this;
            self._map.removeLayer(self.getLayer(arg));
        },
        /**
         * @desc 移除指定id的marker
         */
        removeMarkerById: function (id) {
            if (typeof id === 'undefined') {
                console.error('请传入marker的id');
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
         * @desc 添加layer的监听事件
         */
        addLayerListener: function (layerName) {
            var self = this;
            var layer = self.getLayer(layerName);
            if (!layer) { return }//找不到指定的layer，就返回
            //单个选择要素
            var layerSelect = new ol.interaction.Select({
                condition: ol.events.condition.click,
                layers: [layer],
                style: function (fea) {//点击marker时不发生样式的变化，还是使用本身的image作为src
                    return new ol.style.Style({
                        image: new ol.style.Icon({
                            anchor: [0.5, 0.5],
                            // offset: option.offset || [0, 0],
                            src: fea.get('image')
                        })
                    });
                }
            });
            layerSelect.on('select', function (evt) { //监听某个layer的选择事件
                if (evt.selected.length === 0) {
                    return;
                }
                // var coordinate = evt.mapBrowserEvent.coordinate;
                evt.selected.forEach(function (feature) {
                    var clickFun = feature.getProperties().onClick;
                    clickFun ? clickFun.call(feature, feature) : null;
                });
            });
            self._map.addInteraction(layerSelect);
        },
        /**
         * @desc 开启绘画功能
         * @param type[Point,LineString,Polygon,Circle]
         */
        openDraw: function (type, drawstart, drawend, change) {
            var self = this;
            var map = self.getMap();
            var features = new ol.Collection();
            self._featureOverlay = new ol.layer.Vector({ //画图所用的layer对象
                source: new ol.source.Vector({
                    features: features
                }),
                style: new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: 'rgba(255, 255, 255, 0.6)'
                    }),
                    stroke: new ol.style.Stroke({
                        color: '#ffcc33',
                        width: 2
                    }),
                    image: new ol.style.Circle({
                        radius: 7,
                        fill: new ol.style.Fill({
                            color: '#ffcc33'
                        })
                    })
                })
            });
            self._featureOverlay.setMap(map);
            var modify = new ol.interaction.Modify({
                features: features,
                deleteCondition: function (event) {
                    return ol.events.condition.shiftKeyOnly(event) &&
                        ol.events.condition.singleClick(event);
                }
            });
            map.addInteraction(modify);
            self._draw = new ol.interaction.Draw({
                features: features,
                type: /** @type {ol.geom.GeometryType} */ (type)
            });
            if (drawstart) {
                self._draw.on('drawstart', drawstart);
            }
            if (drawend) {
                self._draw.on('drawend', drawend);
            }
            if (change) {
                self._draw.on('change', change);
            }
            map.addInteraction(self._draw);
        },
        /**
         * @description 关闭绘画功能
         */
        closeDraw: function () {
            if (this._draw) {
                this._map.removeInteraction(this._draw);
                this._draw = null;
            }
        }
    };
    return OpenMap;
}));
/**
 * 为聚合图层画canvas图
 * @param {*} ele
 * @param {*} data
 */
function dcanvas(ele, data) {
    // 一个canvas标签
    var canvas = ele;
    var x = data.centerX;
    var y = data.centerY;
    var rO = data.radiusOutside;
    var rI = data.radiusInside;
    var lineWidth = 8;
    // 拿到绘图上下文,目前只支持"2d"
    var context = canvas.getContext('2d');
    // 将绘图区域清空,如果是第一次在这个画布上画图,画布上没有东西,这步就不需要了
    context.clearRect(0, 0, 2 * rO, 2 * rO);

    //画最大的半透明的圆
    context.beginPath();
    context.moveTo(x, y);//坐标移动到圆心
    context.arc(x, y, rO, 0, Math.PI * 2, false);
    context.closePath();
    context.fillStyle = 'rgba(255,169,76,0.4)';// 填充颜色
    context.fill();

    //画白色轮廓
    context.moveTo(x + rI, y);
    context.beginPath();
    context.lineWidth = lineWidth;
    context.strokeStyle = '#fff';
    context.arc(x, y, rI, 0, 2 * Math.PI);
    context.closePath();
    context.stroke();

    if (data.normalSize) {
        //画橙色进度条的轮廓
        context.moveTo(x, y);
        context.beginPath();
        context.lineWidth = lineWidth;
        context.lineCap = 'round';
        context.strokeStyle = "#ffa94c";
        context.arc(x, y, rI, -Math.PI / 2, Math.PI * (data.normalSize / data.size) * 2 - Math.PI / 2);
        context.stroke();
    }

    //在中间写字
    context.font = "9pt Arial";
    context.fillStyle = '#000';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.moveTo(x, y);
    context.fillText(data.normalSize + '/' + data.size, x, y);
    return canvas;
}
