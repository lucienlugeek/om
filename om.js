// framework based on openlayers Version v4.0.1 with jQuery
/**
    基于openlayers的工具模块；
    * 提供了常用的地图相关操作
    @module om
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
		/**
     * OpenMap 
     * @class OpenMap
     * @constructor
     * @param  {String} mapId 需要渲染的map的html documentId
     * @param  {Object} ops 
     *			@param {List} ops.center 地图的中心点 例：[120.561477,31.883179]
     *      @param {int} ops.zoom 地图层级 例：15
     *      @param {List} ops.layers 初始渲染的图层 例：[grouplayer,poiLayer]
     *      @param {Object} ops.projection 坐标系对象 例：new ol.proj.Projection({code: 'EPSG:4326',units: 'degrees',});
     */
    var OpenMap = this.OpenMap = function () {
        if (arguments.length) {
            this.init.apply(this, arguments);
        }
    };
    
    /**
		 * 判断是否为 Object,Array,String,RegExp,Boolean,Number,Function
		 * @method OpenMap.is
		 * @param  {Object} arg1 需要判断的对象
		 * @param  {String} content 需要判别是否的目标对象类型(Object,Array,String,RegExp,Boolean,Number,Function)
		 */
    OpenMap.is = function (arg1, arg2) {
        return Object.prototype.toString.call((arg1)) === '[object ' + arg2 + ']';
    };
    
    /**
     * 将wkt格式的字符串转换为Feature
     * @method OpenMap.wkt2Feature
     * @param {String} wktStr wkt格式的字符串
     * @param {String} source 源投影
     * @param {String} destination 目标投影
     */
    OpenMap.wkt2Feature = function(wktStr,source, destination){
    	var format = new ol.format.WKT();
        var feature = format.readFeature(wktStr);
        if(source && destination){
        	//feature.getGeometry().transform('EPSG:4326', 'EPSG:4326');
        	feature.getGeometry().transform(source, destination);
        }
        return feature;        
    };
    
    /**
     * 将openlayers 的geometry 转换为 jsts 对应的Geometry
     * @method OpenMap.olGeometry2JstsGeometry
     * @param {Object} geometry openlayers对应的geometry 
     */
    OpenMap.olGeometry2JstsGeometry = function(geometry){
    	//convert the OpenLayers geometry to a JSTS geometry
    	var parser = new jsts.io.OL3Parser();    	
        return parser.read(geometry);        
    };
    
    /**
     * 将openlayers 的geometry 转换为 jsts 对应的Geometry
     * @method OpenMap.JstsGeometry2olGeometry
     * @param {Object} geometry openlayers对应的geometry 
     */
    OpenMap.JstsGeometry2olGeometry = function(jtstGeometry){
    	//convert the JSTS geometry to a OpenLayers geometry
    	var parser = new jsts.io.OL3Parser();    	
        return parser.write(jtstGeometry);        
    };
    
    /**
     * geometry对象的buffer运算(缓冲区分析)
     * @method OpenMap.buffer
     * @param {Object} parser jsts.io.OL3Parser()
     * @param {Object} geometry ol geometry
     * @param {Double} distance 距离
     * @return 返回包含所有的点在一个指定距离内的多边形和多多边形
     */
    OpenMap.buffer = function(parser,geometry,distance){    	
    	//var parser = new jsts.io.OL3Parser();
    	var jstsGeom =parser.read(geometry);
    	var bufferGeo = jstsGeom.buffer(distance);  
        return parser.write(bufferGeo);      
    };
    
    /**
     * geometry对象的convexHull运算(凸壳分析)
     * @method OpenMap.convexHull
     * @param {Object} parser jsts.io.OL3Parser()
     * @param {Object} geometry ol geometry
     * @return {Object} 返回包含几何形体的所有点的最小凸壳多边形（外包多边形） 
     */
    OpenMap.convexHull = function(parser,geometry){    	
    	//var parser = new jsts.io.OL3Parser();
    	var jstsGeom =parser.read(geometry);
    	var geo = jstsGeom.convexHull();  
        return parser.write(geo);      
    };
    
    /**
     * geometry对象的intersection运算(交叉分析)
     * @method OpenMap.intersection
     * @param {Object} parser jsts.io.OL3Parser()
     * @param {Object} geometry1 ol geometry
     * @param {Object} geometry2 ol geometry
     * @return {Object} 返回两个同维度几何对象的交集
     */
    OpenMap.intersection = function(parser,geometry1,geometry2){    	
    	var geo = parser.read(geometry1).intersection(parser.read(geometry2));  
        return parser.write(geo);      
    };
    
    /**
     * geometry对象的union运算(联合分析)
     * @method OpenMap.union
     * @param {Object} parser jsts.io.OL3Parser()
     * @param {Object} geometry1 ol geometry
     * @param {Object} geometry2 ol geometry
     * @return {Object} 返回两个同维度几何对象的并集
     */
    OpenMap.union = function(parser,geometry1,geometry2){    	
    	var geo = parser.read(geometry1).union(parser.read(geometry2));  
        return parser.write(geo);      
    };
    
    /**
     * geometry对象的difference运算(差异分析)
     * @method OpenMap.difference
     * @param {Object} parser jsts.io.OL3Parser()
     * @param {Object} geometry1 ol geometry
     * @param {Object} geometry2 ol geometry
     * @return {Object} 返回两个几何对象的差集
     */
    OpenMap.difference = function(parser,geometry1,geometry2){    	
    	var geo = parser.read(geometry1).difference(parser.read(geometry2));  
        return parser.write(geo);      
    };
    
    /**
     * geometry对象的symDifference运算(对称差异分析)
     * @method OpenMap.symDifference
     * @param {Object} parser jsts.io.OL3Parser()
     * @param {Object} geometry1 ol geometry
     * @param {Object} geometry2 ol geometry
     * @return {Object} 返回两个几何图形的对称差分，即两个几何的并集部分减去两个几何的交集部分
     */
    OpenMap.symDifference = function(parser,geometry1,geometry2){    	
    	var geo = parser.read(geometry1).symDifference(parser.read(geometry2));  
        return parser.write(geo);      
    };
    
    /**
     * geometry对象的空间关系-交叉:crosses
     * @method OpenMap.crosses
     * @param {Object} parser jsts.io.OL3Parser()
     * @param {Object} geometry1 ol geometry
     * @param {Object} geometry2 ol geometry
     */
    OpenMap.crosses = function(parser,geometry1,geometry2){    	
        return parser.read(geometry1).crosses(parser.read(geometry2));      
    };
    
    /**
     * geometry对象的空间关系-相离:disjoint
     * @method OpenMap.disjoint
     * @param {Object} parser jsts.io.OL3Parser()
     * @param {Object} geometry1 ol geometry
     * @param {Object} geometry2 ol geometry
     */
    OpenMap.disjoint = function(parser,geometry1,geometry2){    	
        return parser.read(geometry1).disjoint(parser.read(geometry2));      
    };
    
    /**
     * geometry对象的空间关系-相交:intersects
     * @method OpenMap.intersects
     * @param {Object} parser jsts.io.OL3Parser()
     * @param {Object} geometry1 ol geometry
     * @param {Object} geometry2 ol geometry
     */
    OpenMap.intersects = function(parser,geometry1,geometry2){    	
        return parser.read(geometry1).intersects(parser.read(geometry2));      
    };
    
    /**
     * geometry对象的空间关系-相接:touches
     * @method OpenMap.touches
     * @param {Object} parser jsts.io.OL3Parser()
     * @param {Object} geometry1 ol geometry
     * @param {Object} geometry2 ol geometry
     */
    OpenMap.touches = function(parser,geometry1,geometry2){    	
        return parser.read(geometry1).touches(parser.read(geometry2));      
    };
    
    /**
     * geometry对象的空间关系-被包含:within
     * @method OpenMap.within
     * @param {Object} parser jsts.io.OL3Parser()
     * @param {Object} geometry1 ol geometry
     * @param {Object} geometry2 ol geometry
     */
    OpenMap.within = function(parser,geometry1,geometry2){    	
        return parser.read(geometry1).within(parser.read(geometry2));      
    };
    
    /**
     * geometry对象的空间关系-包含:contains
     * @method OpenMap.contains
     * @param {Object} parser jsts.io.OL3Parser()
     * @param {Object} geometry1 ol geometry
     * @param {Object} geometry2 ol geometry
     */
    OpenMap.contains = function(parser,geometry1,geometry2){
        return parser.read(geometry1).contains(parser.read(geometry2));      
    };
    
    /**
     * geometry对象的空间关系-重叠:overlaps
     * @method OpenMap.overlaps
     * @param {Object} parser jsts.io.OL3Parser()
     * @param {Object} geometry1 ol geometry
     * @param {Object} geometry2 ol geometry
     */
    OpenMap.overlaps = function(parser,geometry1,geometry2){    	
        return parser.read(geometry1).overlaps(parser.read(geometry2));      
    };
    
    /**
    * 根据坐标对象数组获取闭包范围
    * @method OpenMap.getExtentByData
    * @param {Object} 坐标对象数组[{lon:131.00,lat:30},...]
    * @return {Object} [minx,miny,maxx, maxy] 
    */
    OpenMap.getExtentByData=function(data){
    	var minx=180;
		var miny=180;
		var maxx =0.0;
		var maxy =0.0;
		var tmpx =0.0;	
		var tmpy =0.0;	
		var len =data.length;
		for(var p=0;p<len;p++){
			tmpx =parseFloat(data[p]['lon']);			
			if(tmpx >=maxx){
				maxx =tmpx;
			}
			if(tmpx <minx){
				minx =tmpx;
			}
			
			tmpy =parseFloat(data[p]['lat']);
			if(tmpy >= maxy){
				maxy = tmpy;
			}
			if(tmpy <= miny){
				miny = tmpy;
			}
		}
		return [minx,miny,maxx, maxy]; 
    };
    
    /**
    * 根据坐标数组获取闭包范围
    * @method OpenMap.getExtentByCoordinates
    * @param {Object} 坐标数组 [[131.00,30],...]
    * @return {Object} [minx,miny,maxx, maxy] 
    */
    OpenMap.getExtentByCoordinates=function(data){
    	var minx=180;
		var miny=180;
		var maxx =0.0;
		var maxy =0.0;
		var tmpx =0.0;	
		var tmpy =0.0;	
		var len =data.length;
		for(var p=0;p<len;p++){
			tmpx =parseFloat(data[p][0]);			
			if(tmpx >=maxx){
				maxx =tmpx;
			}
			if(tmpx <minx){
				minx =tmpx;
			}
			
			tmpy =parseFloat(data[p][1]);
			if(tmpy >= maxy){
				maxy = tmpy;
			}
			if(tmpy <= miny){
				miny = tmpy;
			}
		}
		return [minx,miny,maxx, maxy]; 
    };
    
    /**
    * 计算半径的长度(单位米)
    * @method OpenMap.calcRadius
    * @param {Object} map对象
    * @param {event} event事件
    * @return {Double} 长度(单位米)
    */
    OpenMap.calcRadius = function (map, event) {
        event.feature.set("type", 'circle');
        var radius = event.feature.getGeometry().getRadius();
        var center = event.feature.getGeometry().getCenter();
        var lonlat = center[0] + "," + center[1];

        //var coordinates = event.feature.getGeometry().v;
        var start = center;//new ol.Coordinate();
        var end = event.feature.getGeometry().getLastCoordinate(); //new ol.Coordinate();
        var mapProjection = map.getView().getProjection();
        var t1 = ol.proj.transform(start, mapProjection, 'EPSG:4326');
        var t2 = ol.proj.transform(end, mapProjection, 'EPSG:4326');

        // create sphere to measure on
        var wgs84sphere = new ol.Sphere(6378137); // one of WGS84 earth radius'
        // get distance on sphere
        var dist = wgs84sphere.haversineDistance(t1, t2);
        dist = dist.toFixed(6);//单位是 米
        return dist;
    };
    
    /**
     * 计算两点之间的距离(单位米)
     * @method OpenMap.calcDistance
     * @param {Object} start
     * @param {Object} end
     * @return {Double} 长度(单位米)
     */
     OpenMap.calcDistance = function (start,end) {
         // create sphere to measure on
         var wgs84sphere = new ol.Sphere(6378137); // one of WGS84 earth radius'
         // get distance on sphere
         var dist = wgs84sphere.haversineDistance(start, end);
         dist = dist.toFixed(6);//单位是 米
         return dist;
     };
     
     /**
      *  计算多边形面积(单位平方米)
      * @method OpenMap.calcArea
      * @param {Object} polygon 
      * @return {Double} 面积(单位平方米)
      */
     OpenMap.calcArea = function(polygon){    	 
    	 var wgs84sphere = new ol.Sphere(6378137);
    	 var coordinates = polygon.getLinearRing(0).getCoordinates();
		 return Math.abs(wgs84sphere.geodesicArea(coordinates));
     };
     
    OpenMap.prototype = {
        constructor: OpenMap,
        /**
         * 初始化图层组layer
         * @method globalGroupLayer
         * @param {Object} options
         * @param {String} options.mapUrl 图层url地址
         * @param {String} options.layers 图层组名称
         * @return {Object} ol.layer.Group
         */
        globalGroupLayer: function (options) {
            if (typeof options === 'undefined'
                || typeof options.mapUrl === 'undefined'
                || typeof options.layers === 'undefined') {
                console.error('必须指定图层配置！');
                return null;
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
                                LAYERS: options.layers
                            }
                        })
                    })
                ]
            });
        },
        /**
         * 初始化Image layer
         * @method globalImageLayer
         * @param {Object} options
         * @param {String} options.mapUrl 图层url地址
         * @param {String} options.layers 图层组名称
         * @return {Object} ol.layer.Image
         */
        globalImageLayer: function (options) {
            if (typeof options === 'undefined'
                || typeof options.mapUrl === 'undefined'
                || typeof options.layers === 'undefined') {
                console.error('必须指定图层配置！');
                return null;
            }
            return new ol.layer.Image({
                source: new ol.source.ImageWMS({
                    ratio: 1,
                    url: options.mapUrl,
                    crossOrigin: 'anonymous',
                    params: {
                        'FORMAT': options.format || 'image/png',
                        'VERSION': options.version || '1.1.0',
                        LAYERS: options.layers
                    }
                })
            });
        },
        /**
         * 初始化瓦片Layer
         * @method globalTileLayer
         * @param {Object} options
         * @param {String} options.mapUrl 图层url地址
         * @param {String} options.layers 图层组名称
         * @param {String} options.srs 坐标系
         * @param {Object} options.resolutions 解析度数组
         * @param {Object} options.origin 切片范围坐标数组
         * @return {Object} ol.layer.Tile
         */
        globalTileLayer: function (options) {
            if (typeof options === 'undefined'
                || typeof options.mapUrl === 'undefined'
                || typeof options.layers === 'undefined'
                || typeof options.srs === 'undefined'
                || typeof options.resolutions === 'undefined'
                || typeof options.origin === 'undefined') {
                console.error('必须指定图层配置！');
                return null;
            }
            return new ol.layer.Tile({
                source:
                new ol.source.TileWMS({
                    url: options.mapUrl,
                    crossOrigin: 'anonymous',
                    params: {
                        'FORMAT': options.format || 'image/png',
                        'VERSION': options.version || '1.1.0',
                        'LAYERS': options.layers,  // 'beiluncacheKJ',
                        'SRS': options.srs //'EPSG:4490'
                    },
                    tileGrid: ol.tilegrid.TileGrid({
                        minZoom: options.minZoom || 0,
                        maxZoom: options.maxZoom || 9,
                        resolutions: options.resolutions, //[0.00068664552062088911, 0.00034332276031044456, 0.00017166138015522228]
                        origin: options.origin //[-180.0, 90.0]
                    })
                })
                //extent: bounds  //根据需要有范围限制添加extent，没有就 不添加
            });
        },
        /**
         * 初始化热力图：heatmap layer
         * @method globalHeatmapLayer
         * @param {Object} options
         * @param {String} options.data 热力数据[{lon:131.00,lat:31.00,weight:11},...]
         * @return {Object} ol.layer.Heatmap
         */
        globalHeatmapLayer: function (options) {
            /*if (typeof options === 'undefined'
                  || typeof options.type === 'undefined') {
                  console.error('必须指定图层配置！');
                  return null;
              }*/
            var features = [];
            if (options && options.data) {
                $.each(options.data, function (index, tempData) {
                    var coordinates = [parseFloat(tempData['lon']), parseFloat(tempData['lat'])];
                    features[index] = new ol.Feature({ geometry: new ol.geom.Point(coordinates), weight: tempData['weight'] });
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
         * 初始化聚合图：Cluster layer
         * @method globalClusterLayer
         * @param {Object} options
         * @param {String} options.data 热力数据[{lon:131.00,lat:31.00,image:'/xxxx'},...]
         * @return {Object} ol.layer.Heatmap
         */
        globalClusterLayer: function (options) {
            /*if (typeof options === 'undefined'
                  || typeof options.type === 'undefined') {
                  console.error('必须指定图层配置！');
                  return null;
              }*/
            var self = this;
            var features = [];
            if (options && options.data) {
                $.each(options.data, function (index, tempData) {
                    var coordinates = [parseFloat(tempData['lon']), parseFloat(tempData['lat'])];
                    features[index] = new ol.Feature({ geometry: new ol.geom.Point(coordinates), image:tempData['image'], extData:tempData});
                });
            }
            return new ol.layer.Vector({
                source: new ol.source.Cluster({
                    distance: options && options.distance || 40, //pix
                    source: new ol.source.Vector({
                        features: features
                    })
                }),
                projection: self.getProjection(),
                style: function (feature) {
                    var feas = feature.get('features'), i = 0;
                    var size = feas.length;
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
                    //判断是否当前只有一个feature，若是只有一个则check 是否有默认图标设置
                    var icon;
                    var textStyle;
                    if (feas.length == 1) {
                        var img = feas[0].get("image");
                        if (img) {
                            icon = new ol.style.Icon(({
                                rotation: 0,
                                src: img
                            }));
                        }
                        
                        if(feas[0].get("extData").hphm){
                            textStyle = self.createTextStyle(feas[0].get("extData").hphm);
                        }
                    }

                    if (icon) {
                        style = new ol.style.Style({
                            image: size == 1 ? icon : new ol.style.Icon({
                                img: dcanvasCircle($('canvas.process').clone().show().get(0), {
                                    'centerX': '45',
                                    'centerY': '45',
                                    'radiusOutside': rO,
                                    'radiusInside': rI,
                                    'size': size
                                }),
                                imgSize: [90, 90]
                            }),
                            text:size == 1 ? textStyle : ""
                        });
                    } else {
                        style = new ol.style.Style({
                            image: new ol.style.Icon({
                                img: dcanvasCircle($('canvas.process').clone().show().get(0), {
                                    'centerX': '45',
                                    'centerY': '45',
                                    'radiusOutside': rO,
                                    'radiusInside': rI,
                                    'size': size
                                }),
                                imgSize: [90, 90]
                            }),
                        });
                    }
                    return style;
                }
            });
        },
        /**
         * 初始化vector layer
         * @method globalClusterLayer
         * @param {Object} options
         * @param {String} options.type Point(点), LineString(线),Circle(圆) ,Polygon(多边形)
         * @return {Object} ol.layer.Vector
         */
        globalVectorLayer: function (options) {
            if (typeof options === 'undefined'
                || typeof options.type === 'undefined') {
                console.error('必须指定图层配置！');
                return null;
            }
            return new ol.layer.Vector({
                source: new ol.source.Vector(),
                style: options.style || function (feature) {
                    //type: Point(点), LineString(线),Circle(圆) ,Polygon(多边形)
                    if (options.type == 'Point') {
                        return getPointStyle();
                    } else {
                        return getPolyStyle();
                    }
                }
            });
        },
         /**
		     * 根据指定参数，初始化地图到容器中 
		     * @method init
		     * @param  {String} id 需要渲染的map的html documentId
		     * @param  {Object} options 
		     *			@param {List} options.center 地图的中心点 例：[120.561477,31.883179]
		     *      @param {int} options.zoom 地图层级 例：15
		     *      @param {List} options.layers 初始渲染的图层 例：[grouplayer,poiLayer]
		     *      @param {Object} options.projection 坐标系对象 例：new ol.proj.Projection({code: 'EPSG:4326',units: 'degrees',});
		     */
        init: function (id, options) {
            var ele = document.getElementById(typeof id === 'undefined' ? '' : id);
            if (ele === null) {
                console.error('地图容器的id为空或找不到id = ' + id + '的DOM元素');
                return;
            }
            var self = this,param;
            if (options) {
                param = $.extend({}, window.omOptions, options); //地图初始化参数
            }else{
                param = window.omOptions;
            }
            self._map = new ol.Map({
                controls: ol.control.defaults({
                    attribution: false
                }),
                target: ele,
                loadTilesWhileAnimating: true,
                view: new ol.View({
                    center: param.center,
                    zoom: param.zoom || 10,
                    minZoom: param.minZoom || 12,
                    maxZoom: param.maxZoom || 20,
                    projection: param.projection,
                    extent: param.extent || undefined
                }),
                interactions: ol.interaction.defaults().extend([
                                                                new ol.interaction.DragRotateAndZoom({
                                                                	condition:ol.events.condition.shiftKeyOnly
                                                                })
                                                              ]),
                layers: param.layers || [],
                extent: param.extent || undefined //[121.64747112300006, 29.702835634000053, 122.1792500360001, 30.002109405000056]
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
            
            self._map.addControl(new ol.control.ScaleLine());
            //添加组件 显示鼠标值
            self._map.addControl(
            	new ol.control.MousePosition({
            	 className: 'custom-mouse-position',  
                 target: document.getElementById('location') ,  
                 coordinateFormat: ol.coordinate.createStringXY(6),//保留5位小数  
                 undefinedHTML: ' '
                	 }));            
            self._map.addControl(new ol.control.ZoomSlider());
            self._map.addControl(new ol.control.OverviewMap({
            	layers: param.layers || [],
            	view: new ol.View({
                    projection: param.projection
                }),
            }));            
        },
        /**
         * 获取map对象
         * @method getMap
         * @return {Object} 返回map对象
         */
        getMap: function () {
            return this._map;
        },
        /**
         * 获取投影
         * @method getProjection
         * @return {Object} 返回投影对象
         */
        getProjection: function () {
            return this._map.getView().getProjection();
        },
        /**
         * 获取投影编码
         * @method getProjectionCode
         * @return {String} 返回投影编码
         */
        getProjectionCode: function () {
            return this.getProjection().getCode();
        },
        /**
         * 设置点默认样式
         * @method getPointStyle
         * @return {Object} 返回点默认样式对象
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
         * 设置点图标默认样式
         * @method getIconStyle
         * @return {Object} 返回点图标默认样式对象
         */
        getIconStyle: function () {
            return new ol.style.Style({
                image: new ol.style.Icon(({
                    anchor: [0.5, 1],
                    //anchorXUnits: 'fraction',
                    //anchorYUnits: 'pixels',
                    //imgSize:[50,50],
                    rotation: 0,
                    src: 'images/marker.png'
                }))
            });
        },
        /**
         * 设置线面默认样式
         * @method getPolyStyle
         * @return {Object} 返回点线面默认样式对象
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
         *  添加层
         * @method addLayer
         * @param  {String} layerName 层的名字key（可通过此key找到此层）
         * @param  {Object} layerObj 需要添加的层对象
         * @param  {bollean} force 是否强制重新创建
         * @return {Object} 返回层对象
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
         * @method getLayer
         * @param  {String} layerName 层的名字key
         * @return {Object} 返回对应名称的层对象
         */
        getLayer: function (layerName) {
            return this._layer[layerName];
        },
        /**
         * 移除layer对象
         * @method getLayer
         * @param  {String} layerName 层的名字key
         */
        removeLayer: function (layerName) {
            this._map.removeLayer(this.getLayer(layerName));
            this._layer[layerName] = null;
            delete this._layer[layerName];
        },
        /**
         * 向地图添加marker标记
         * @method addMarker
         * @param  {Object} option 需要创建的marker参数
         * @returns {Object} 返回构建的marker对象
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
            if (!_layer) {//如果没有指定层，则创建
                _layer = new ol.layer.Vector({ //存放标注点的layer
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
                    },
                    zIndex: (typeof option.zIndex !== 'undefined' ? option.zIndex : 0)
                });
                self.addLayer(option.layer, _layer);
            }
            var prop = $.extend({}, option,
                { geometry: new ol.geom.Point(option.position) }
            );
            var fea = new ol.Feature(prop);
            fea.setId(option.id);
            _layer.getSource().addFeatures([fea]);
            if (option.visible !== undefined) {
                _layer.setVisible(option.visible);
            }
            return fea;
        },
        /**
         * 向地图添加多个marker标记
         * @method addMarkers
         * @param  {Object} option 需要创建的marker参数
         * @returns {Object} 返回构建的marker对象
         */
        addMarkers: function (options) {
            if (typeof options === 'undefined'
                || typeof options.data === 'undefined'
                || typeof options.layerName === 'undefined') {
                console.error('必须指定marker的图层名称！');
                return;
            }
            var self = this;
            var _layer = this._layer[options.layerName] = new ol.layer.Vector({ //存放标注点的layer
                source: new ol.source.Vector(),
                projection: self.getProjection(),
                style: function (feature) {
                    return new ol.style.Style({
                        image: new ol.style.Icon({
                            // rotation: fea.get('rotation') || 0,
                            src: feature.get('image')//,
                            //anchor: [10,10]
                        }),
                        text:self.createTextStyle(feature.get('extData').hphm)
                    });
                }
            });

            var features = [];
            if (options.data) {
                $.each(options.data, function (index, tempData) {
                    var coordinates = [parseFloat(tempData['lon']), parseFloat(tempData['lat'])];
                    features[index] = new ol.Feature({ geometry: new ol.geom.Point(coordinates), image: tempData['image'],extData:tempData});
                });
            }
            _layer.getSource().addFeatures(features);
            this._map.addLayer(_layer);
        },
        /**
         * 根据id获取marker
         * @method getMarkerById
         * @param  {String} id 
         * @returns {Object} 返回id对应marker对象
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
         * 添加聚合图层
         * @method addCluster
         * @param  {Object} arg 需要创建的聚合图层参数
         */
        addCluster: function (arg) {
            if (typeof arg === 'undefined' || !OpenMap.is(arg, 'Array')) {
                console.error('请输入数组类型的参数');
                return;
            }
            var self = this;
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
		 * 根据数据获取蜂巢图形要素
		 * @method getHoneycombGraphFeatures
     * @param  {Object} option 需要创建的蜂巢图形参数
		 */
		getHoneycombGraphFeatures:function(option){			
			if (!option || !option.layerName || !option.data) {
                console.error('必须指定绘制蜂巢图信息！');
                return;
            }
			var self =this;
			var map =self._map;
			var honeyCombLayer = self.getLayer(option.layerName);
			//1.根据数据设置绘制蜂巢图的范围
			var bounds = OpenMap.getExtentByData(option.data);
			var tempHoneycombResult = option.data;
			//2.重新设置地图中心点
			var mapCenter = [(bounds[0]+ bounds[2])/2,(bounds[1]+ bounds[3])/2];
			map.getView().setCenter(mapCenter);
	    	
			var features = [];
	    	//var cnt =0;
	    	
	    	//3.绘制蜂巢图，绘制前先设置数据对应的中心点，然后以此点为中心点，以所有数据范围来画蜂巢图
			setTimeout(function(){
		    	var zoom= map.getView().getZoom();
		    	var CurrentExtent = map.getView().calculateExtent(map.getSize());
		    	
		    	//honeyCombLayer.getSource().clear();
		    	    	
		    	var pixSize = 50;//(zoom - 8) * 4 ;//Math.pow(2,zoom - 10) * 5 ; //50;
		    	var mapCenter =map.getView().getCenter();
		    	//取实际地图数据范围大小像素
		    	var minSize = map.getPixelFromCoordinate([bounds[0],bounds[1]]);
		    	var maxSize = map.getPixelFromCoordinate([bounds[2],bounds[3]]);
		    	
		    	var size = [maxSize[0]-minSize[0],minSize[1]-maxSize[1]];
		    	//console.info("size" + size[0]  + " " + size[1]);
		    	//设置六边形每行的个数
		    	var widthLen = Math.ceil((size[0]- Math.sqrt(3) * pixSize) /(2* Math.sqrt(3) *pixSize));
		    	//设置六边形每列的个数
		    	var heightLen= Math.ceil((size[1] -3/2 * pixSize)/(3* pixSize));
		    	
		    	//地图中心点对应的屏幕分辨率
		    	var centerPixel = map.getPixelFromCoordinate([mapCenter[0],mapCenter[1]]);
		    	var rowCenter;
		    	var key;
		    	var startTime =new Date().getTime();
		    	console.info("honeyComb start time " + new Date().getTime());
		    	//根据地图高度来设置行
		    	for(var row= -heightLen;row<heightLen +1;row++) {
		    		//根据地图中心点来设置蜂巢行中心点
		    		//从地图中心往外发散的奇偶行来设置中心点位置
		    		if(row%2==0){    			
		    			rowCenter =[centerPixel[0],centerPixel[1]+row * 3/2 * pixSize];
		    		}else{
		    			rowCenter =[centerPixel[0] +Math.sqrt(3)/2 * pixSize,centerPixel[1]+row * 3/2 * pixSize];
		    		} 
		    	
			    	for(var i= -widthLen;i<widthLen +1;i++) {	           
			    		key ='honeycomb_' + (row + heightLen) + "_" + (i + widthLen);
			    		var tempCenter =[rowCenter[0] +i * Math.sqrt(3) * pixSize,rowCenter[1]];
			            
			            var points=[];	        
				         for(var j = 0; j < 6; j++){
				             var angle = j*60 + 30;
				             var coordinate =[tempCenter[0] + Math.cos(angle/ 180 * Math.PI) * (pixSize),tempCenter[1] - Math.sin(angle / 180 * Math.PI) * (pixSize)];
				             points[j] = map.getCoordinateFromPixel(coordinate);
				         }
				         points[6]=points[0]; //闭合的多边形
				         var polygon = new ol.geom.Polygon([points]);
				         
				         var count =0;
				         for(var k=0;k<tempHoneycombResult.length;k++){
				        	 if(!tempHoneycombResult[k]['isContains']){
					        	 var coordinate = [parseFloat(tempHoneycombResult[k]['lon']), parseFloat(tempHoneycombResult[k]['lat'])];			        	  
					             if(polygon.intersectsCoordinate(coordinate)){
					        		 count+=parseInt(tempHoneycombResult[k]['count'])
					            	 tempHoneycombResult[k]['isContains'] ="1";
					        	 }
				        	 } 
				         }
				        
				         //根据多边形来计算传入的数据对应的count // 待补充
				         if(count>0){
			         		features.push(new ol.Feature({geometry:polygon,id:key,count:count}));				            	
			         		/*features[cnt] = new ol.Feature({geometry:polygon,id:key,count:count});
				            cnt++;*/
				         }            
			   	 	}			    	
		    	}
		    	console.info("features size " + features.length);
		    	tempHoneycombResult =null;
		        honeyCombLayer.getSource().addFeatures(features);
		        var endTime = new Date().getTime() - startTime;
		        console.info("honeyComb end time " + new Date().getTime());
		        console.info("honeyComb total time " + endTime + "ms");
		    	//return features;
			},2000);
		},
		/**
		 * 根据数据获取网格图形要素
		 * @method getGridFeatures
     * @param  {Object} option 需要创建的网格图形参数
		 */
		getGridFeatures:function(option){			
			if (!option || !option.layerName || !option.data) {
                console.error('必须指定绘制蜂巢图信息！');
                return;
            }
			var self =this;
			var map =self._map;
			var gridLayer = self.getLayer(option.layerName);
			cols = option.data.cols/2;
			rows = option.data.rows/2;
			center = option.data.center;
			width = option.data.width;
			var m=1,n=1;
			var features = [];	
			
			var startTime =new Date().getTime();
	    	console.info("grid start time " + new Date().getTime());
	    	
			map.getView().setCenter([center[0],center[1]]);
			//通过pixel大小计算实际距离
			var centerPixel = map.getPixelFromCoordinate([center[0],center[1]]);
			var sourceProj = map.getView().getProjection();
		    var newPixel =[centerPixel[0]-1,centerPixel[1]];
		    var newPixelCoordinate =map.getCoordinateFromPixel(newPixel); 
		    //计算一个pixel的实际距离
		    var distance =OpenMap.calcDistance(center,newPixelCoordinate);		    
		    var distancePixel = width/distance;
		    newPixel=[centerPixel[0]-distancePixel,centerPixel[1]];
		    newPixelCoordinate=map.getCoordinateFromPixel(newPixel);
		    width = parseFloat(parseFloat(center[0] - newPixelCoordinate[0]).toFixed(10));
			//中心点
			features[0] = new ol.Feature({geometry:new ol.geom.Point([center[0],center[1]]),id:"center",factor:"0"});
			features[0].setStyle(new ol.style.Style({  
		        fill : new ol.style.Fill({  
		            color : "rgba(255, 255, 255, 0.9)" 
		        }),  
		        stroke : new ol.style.Stroke({  
		            color : "#319FD3",
		            width : 1  
		        }),
		        image: new ol.style.Circle({
		            radius: 4,
		            fill: new ol.style.Fill({
		                color: '#ffcc33'
		            })
		        })  
		        })
			);
			var col_y =-cols;
			for(var i=0;i<option.data.rows;i++){
				//自动设置row_x 从-rows开始计算位置，col_y从cols开始，每循环一次col_y自减
				var row_x =rows;		
				for(var j=0;j<option.data.cols;j++){			
					var start = [center[0]+col_y*width,center[1]+row_x*width];
					var end = [center[0]+(col_y+1)*width,center[1]+(row_x-1)*width];
					//输出列后，row_x自增
					col_y++;
					var id ="rect_"+m + "_" + n;
					var rect = new ol.geom.Polygon([
						   	                         [start, [start[0], end[1]], end, [end[0], start[1]], start]
						   		                     ]);
					rect.setProperties("id",id);
					//通过feature属性来设置text
					features.push(new ol.Feature({geometry:rect,id:id,factor:n}));
					n++;
				}
				rows--;
				col_y =-cols;
				m++;
				n=1;
			}	
			console.info("features size " + features.length);
			gridLayer.getSource().clear();
			gridLayer.getSource().addFeatures(features);
			
			var endTime = new Date().getTime() - startTime;
	        console.info("grid end time " + new Date().getTime());
	        console.info("grid total time " + endTime + "ms");
		},
        /**
         * 添加覆盖元素
         * @method addOverLay
     		 * @param  {Object} option 需要创建的覆盖元素参数
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
            }else{
            	element.style.display = 'block';
            }
            
            var popup = new ol.Overlay({
                id: option.id,
                position:option.position,
                element: element,
                stopEvent: typeof option.stopEvent !== 'undefined' ? option.stopEvent : true,
                offset: option.offset || [0, 0],
                positioning: option.positioning || 'center-center' //中心点位于容器的正中间
            });
            self._map.addOverlay(popup);
            
            //非初始化状态下加载overlay的情况下，全部加载完毕记得用下面的语句刷新下
            //self._map.renderSync();
        },
        /**
         * 获取所有的覆盖元素
         * @method getOverlay
         * @param  {String} id 覆盖元素id,如没传就返回所有
     		 * @return  {Object|[]} 单个id覆盖元素or所有的覆盖元素
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
         * 增加饼状图
         * @method addChartOverlay
         * @param  {Object} option 增加饼状图的参数
         */
		addChartOverlay:function(option){
        	if (typeof option === 'undefined'
                || typeof option.data === 'undefined'
                || typeof option.domid === 'undefined') {
                console.error('必须指定chart数据信息！');
                return;
            }
        	 var self = this;
        	 for(var i=0;i<option.data.length;i++){  
                 var data = option.data[i];  
                 var pt = [parseFloat(data.lon), parseFloat(data.lat)];  
                 var domid = option.domid +i;   //option.domid为map页面中增加overlay的div
                 $("#" + option.domid).append("<div id='"+domid+"'></div>");  
                 //positioning:Possible values are 'bottom-left', 'bottom-center', 'bottom-right', 'center-left', 'center-center', 'center-right', 'top-left', 'top-center', and 'top-right'. 
                 //Default is 'top-left'.
                 self.addChart(domid,data,100);    
                 
                 var chart = new ol.Overlay({  
                     position: pt,  
                     positioning: 'center-center',
                     offset: [0, 0],
                     autoPan:true,
                     element: document.getElementById(domid)  
                 });  
                 self._map.addOverlay(chart);
                                  
             }
        	 $("#" + option.domid).css("display","block");
        },
        /**
         * 添加饼状图
         * @method addChart
         * @param  {Object} option 增加饼状图的参数
         */
        addChart:function(domid,data,size){
        	$('#'+domid).highcharts({  
     	         chart: {  
     	             backgroundColor: 'rgba(255, 255, 255, 0)',  
     	             plotBorderColor: null,  
     	             plotBackgroundColor: null,  
     	             plotBackgroundImage: null,  
     	             plotBorderWidth: null,  
     	             plotShadow: false,  
     	             width: size,  
     	             height: size  
     	         },  
     	         tooltip: {  
     	            //pointFormat: '{series.name}<b>{point.percentage:.1f}%</b>' 
     	        	formatter: function() {  
                        return this.series.name +'<br/>' +'<b>'+ this.point.name +'</b>: '+ parseInt(this.percentage) +' %';  
                    }  
     	         },  
     	         credits:{  
     	             enabled:false
     	         }, 
     	       	legend: {
     	            align: 'right',
     	            verticalAlign: 'top',
     	            x: 0,
     	            y: 100
     	        },
     	         title: {  
     	             text: ''  
     	         },  
     	         plotOptions:{  
     	             pie: { 
     	            	   allowPointSelect: true,
                           cursor: 'pointer',
     	              	   dataLabels: {  
     	                   enabled: false,
     	                   color: '#000000',  
                           connectorColor: '#000000',
                           formatter: function() {  
                              return this.series.name +'<b>'+ this.point.name +'</b>: '+ this.percentage +' %';  
                          }   
     	                 }  
     	             }  
     	         },  
     	         series: [{  
     	             type: 'pie',  //pie
     	             name: data.name,  
     	             data: data.data  
     	         }]  
     	     });
        },
        /**
         * 删除Overlay：id 中包含参数domid的所有overlay
         * @method removeOverlayByIndexOfId
         * @param  {String} domid 需要删除的覆盖物domId
         */
        removeOverlayByIndexOfId:function(domid){
        	var self = this;
        	var overlayArr = this._map.getOverlays().getArray();
        	for(var i=overlayArr.length-1;i>=0;i--){
        		var ilid = overlayArr[i].getElement().id;
        		if(ilid.indexOf(domid)!=-1){
        			self._map.removeOverlay(overlayArr[i]);
        		}
        	}
        },
        /**
         * 增加柱状图
         * @method addBarGraphOverlay
         * @param  {Object} option 需要创建的柱状图参数
         */
		addBarGraphOverlay:function(option){
        	if (typeof option === 'undefined'
                || typeof option.data === 'undefined'
                || typeof option.domid === 'undefined') {
                console.error('必须指定chart数据信息！');
                return;
            }
        	 var self = this;
        	 for(var i=0;i<option.data.length;i++){  
                 var data = option.data[i];  
                 var pt = [data.lon,data.lat];  
                 var domid = option.domid +i;   //option.domid为map页面中增加overlay的div
                 $("#" + option.domid).append("<div id='"+domid+"'></div>");  
                 var chart = new ol.Overlay({  
                     position: pt,  
                     positioning: 'center-left',
                     element: document.getElementById(domid)  
                 });  
                 self._map.addOverlay(chart);
                 self.addBarGraph(domid,data,option.height,option.width,option.categories,option.unit,option.ytitle,option.color);                     
             }
        	 $("#" + option.domid).css("display","block");
		},
		/**
    * 添加柱状图
    * @method addBarGraph
    * @param  {Object} option 需要创建的柱状图参数
    */
		addBarGraph:function(domid,data,height,width,categories,unit,ytitle,color){
			 $('#'+domid).highcharts({  
	  	         chart: {  
	  	             backgroundColor: 'rgba(255, 255, 255, 0)',  
	  	             plotBorderColor: null,  
	  	             plotBackgroundColor: null,  
	  	             plotBackgroundImage: null,  
	  	             plotBorderWidth: null,  
	  	             plotShadow: false,  
	  	             width: width || 100,  
	  	             height: height || 100
	  	         },
	  	        xAxis: { //x轴 
	  	            categories: categories, //['柑橘', '香蕉','苹果', '梨子'],  //X轴类别 
	  	            labels:{y:18},  //x轴标签位置：距X轴下方18像素 
	  	            visible:false
	  	        }, 
	  	        yAxis: {  //y轴 
	  	            title: {text:ytitle }, //y轴标题  '消费量（万吨）'
	  	            lineWidth: 2, //基线宽度 
	  	            visible:false
	  	        }, 
	  	         tooltip: {  
	  	             //pointFormat: '' + this.x + ': ' + this.y + '万吨' //'<b>{point.percentage:.1f}%</b>'  
	  	            formatter: function () {
	                 return '<b>' + this.x +
	                     '</b>:<b>' + this.y + unit + '</b>';
	             	}
	  	         },  
	  	         credits:{  
	  	             enabled:false  
	  	         },  
	  	         title: {  
	  	             text: ''  
	  	         },  
	  	         plotOptions:{
	  	             /*pie: {  
	  	                 dataLabels: {  
	  	                     enabled: true  
	  	                 }  
	  	             },*/   
		  	       	series: {
		  	            allowPointSelect: true
		  	        }
	  	         },  
	  	         series: [{
	  	        	 color:color,//'#e6c727',
	  	             type: 'column',  //pie
	  	             name: data.name,  
	  	             data: data.data  
	  	         }]  
	  	     }); 	
        },
        /**
         * 增加3d柱状图,需要引用3d.js包
    		 * @method add3dBarGraphOverlay
    		 * @param  {Object} option 需要创建的3d柱状图参数
         */
		add3dBarGraphOverlay:function(option){
        	if (typeof option === 'undefined'
                || typeof option.data === 'undefined'
                || typeof option.domid === 'undefined') {
                console.error('必须指定chart数据信息！');
                return;
            }
        	 var self = this;
        	 for(var i=0;i<option.data.length;i++){  
                 var data = option.data[i];  
                 var pt = [data.lon,data.lat];  
                 var domid = option.domid +i;   //option.domid为map页面中增加overlay的div
                 $("#" + option.domid).append("<div id='"+domid+"'></div>");  
                 var chart = new ol.Overlay({  
                     position: pt,  
                     positioning: 'center-left',
                     element: document.getElementById(domid)  
                 });  
                 self._map.addOverlay(chart);
                 self.add3dBarGraph(domid,data,option.height,option.width,option.categories,option.unit,option.ytitle,option.color);                     
             }
        	 $("#" + option.domid).css("display","block");
		},
		/**
         * 添加3d柱状图
         * @method add3dBarGraph
    		 * @param  {Object} option 需要创建的3d柱状图参数
         */
		add3dBarGraph:function(domid,data,height,width,categories,unit,ytitle,color){
			 $('#'+domid).highcharts({  
	  	         chart: {  
	  	             backgroundColor: 'rgba(255, 255, 255, 0)',  
	  	             plotBorderColor: null,  
	  	             plotBackgroundColor: null,  
	  	             plotBackgroundImage: null,  
	  	             plotBorderWidth: null,  
	  	             plotShadow: false,  
	  	             width: width || 100,  
	  	             height: height || 100,
		  	         options3d: {
		  	                enabled: true,
		  	                alpha: 15,
		  	                beta: 15,
		  	                depth:50
		  	            }
	  	         },
	  	        xAxis: { //x轴 
	  	            categories: categories, //['柑橘', '香蕉','苹果', '梨子'],  //X轴类别 
	  	            //labels:{y:18},  //x轴标签位置：距X轴下方18像素 
	  	            visible:false
	  	        }, 
	  	        yAxis: {  //y轴 
	  	            title: {text:ytitle }, //y轴标题  '消费量（万吨）'
	  	            lineWidth: 2, //基线宽度 
	  	            visible:false
	  	        },		  	    
	  	         tooltip: {  
	  	             //pointFormat: '' + this.x + ': ' + this.y + '万吨' //'<b>{point.percentage:.1f}%</b>'  
	  	            formatter: function () {
	                 return '<b>' + this.x +
	                     '</b>:<b>' + this.y + unit + '</b>';
	             	}
	  	         },  
	  	         credits:{  
	  	             enabled:false  
	  	         },  
	  	         title: {  
	  	             text: ''  
	  	         },  
	  	         plotOptions:{ 
	  	        	column: {
	  	                dataLabels: {
	  	                    format: '{y}' + unit,
	  	                    enabled: true,          // 开启数据标签
	  	                    color:'white',
	  	                    y:-25,
	  	                    x:0,
	  	                },
	  	                depth: 50,
	  	                enableMouseTracking: false // 关闭鼠标跟踪，对应的提示框、点击事件会失效
	  	            },
	  	            /*pie: {  
	  	                 dataLabels: {  
	  	                     enabled: true  
	  	                 }  
	  	             }, */  
		  	       	series: {
		  	            allowPointSelect: true
		  	        }
	  	         },  
	  	         series: [{  
	  	        	 color:color,//'#e6c727',设置柱状体颜色效果
	  	             edgeWidth:1,
	  	             type: 'column',  //pie
	  	             name: data.name,  
	  	             data: data.data  
	  	         }]  
	  	     }); 	
        },
        /**
         * 移除marker
         * @method removeMarker
    		 * @param  {Object} m 需要移除marker对象
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
         * 增加动画效果Overlay
         * @method addAnimationOverlay
    		 * @param  {Object} option 需要增加动画效果Overlay参数
         */
		addAnimationOverlay:function(option){
        	if (typeof option === 'undefined'
                || typeof option.data === 'undefined'
                || typeof option.domid === 'undefined') {
                console.error('必须指定animation数据信息！');
                return;
            }
        	 var self = this;
        	 for(var i=0;i<option.data.length;i++){  
                 var data = option.data[i];  
                 var pt = [data.lon,data.lat];  
                 var domid = option.domid +i;   //option.domid为map页面中增加overlay的div
                 $("#" + option.domid).append("<div id='"+domid+"' class='animateIcon scaled'>"+data.data+"</div>");  
                 var chart = new ol.Overlay({  
                     position: pt,  
                     positioning: option.positioning || 'center-center',
                     element: document.getElementById(domid)  
                 });  
                 self._map.addOverlay(chart);
                 
                 //希望动画持续的时间与data数值有关。
                 $('#'+domid).css({
                     'animation-delay':i*0.2+'s'
                     /*'height':parseInt(data.data) + 'px',
                     'width':parseInt(data.data) + 'px'*/                     
                 })                     
             }
        	 $("#" + option.domid).css("display","block");
		},
        /**
         * 增加图片Overlay
         * @method addImageOverlay
    		 * @param  {Object} option 增加图片Overlay参数
         */
		addImageOverlay:function(option){
        	if (typeof option === 'undefined'
                || typeof option.data === 'undefined'
                || typeof option.domid === 'undefined') {
                console.error('必须指定image数据信息！');
                return;
            }
        	 var self = this;
        	 for(var i=0;i<option.data.length;i++){  
                 var data = option.data[i];  
                 var pt = [data.lon,data.lat];
                 var img;
                 if(option.imageheight && option.imagewidth){
                	 img = new Image(option.imageheight,option.imagewidth);
                 }else{
                	 img = new Image();//69,52 设置大小会自动缩放图片，不设置则根据实际大小显示 
                 }
                 img.src = data.src;
                 img.style.border=option.border || "0px solid #058a8f";
                 
                 var domid = option.domid +i;   //option.domid为map页面中增加overlay的div
                 var chart = new ol.Overlay({
                	 id:domid,
                     position: pt,  
                     positioning: option.positioning || 'center-center', //'center-left',
                     offset: option.offset || [0,0], //[50,-30]
                     element: img,
                     autoPan:true
                 });  
                 self._map.addOverlay(chart);                                      
             }
        	 $("#" + option.domid).css("display","block");
		},
		/**
		 * 导出图片,需要引用FileSaver.min.js
		 * @method exportPicture
		 */
		exportPicture:function(){
			var self = this;
			self._map.once('postcompose', function(event) {
		          var canvas = event.context.canvas;
		          if (navigator.msSaveBlob) {
		            navigator.msSaveBlob(canvas.msToBlob(), 'map.png');
		          } else {
		            canvas.toBlob(function(blob) {
		              saveAs(blob, 'map.png');
		            });
		          }
		        });
			self._map.renderSync();
		},
		/**
		 * 导出pdf
		 * @method exportPdf
		 */
		exportPdf:function(source,buttonId,format,resolution){
		 var self = this;
		 var map =self._map;
		 /*<select id="format">
	        <option value="a0">A0 (slow)</option>
	        <option value="a1">A1</option>
	        <option value="a2">A2</option>
	        <option value="a3">A3</option>
	        <option value="a4" selected>A4</option>
	        <option value="a5">A5 (fast)</option>
	      </select>
	      <label>Resolution </label>
	      <select id="resolution">
	        <option value="72">72 dpi (fast)</option>
	        <option value="150">150 dpi</option>
	        <option value="300">300 dpi (slow)</option>
	      </select>*/	      
		 var dims = {
			        a0: [1189, 841],
			        a1: [841, 594],
			        a2: [594, 420],
			        a3: [420, 297],
			        a4: [297, 210],
			        a5: [210, 148]
			      };

		 var loading = 0;
	     var loaded = 0;
	     var exportButton = document.getElementById(buttonId);
	     exportButton.disabled = true;
	     document.body.style.cursor = 'progress';

	      //var format = document.getElementById('format').value;
	      //var resolution = document.getElementById('resolution').value;
	      var dim = dims[format];
	      var width = Math.round(dim[0] * resolution / 25.4);
	      var height = Math.round(dim[1] * resolution / 25.4);
	      var size = /** @type {ol.Size} */ (map.getSize());
	      var extent = map.getView().calculateExtent(size);

	        //var source = baseMap.getSource();
	        var tileLoadStart = function() {
	          ++loading;
	        };

	        var tileLoadEnd = function() {
	          ++loaded;
	          if (loading === loaded) {
	            var canvas = this;
	            window.setTimeout(function() {
	              loading = 0;
	              loaded = 0;
	              var data = canvas.toDataURL('image/png');
	              var pdf = new jsPDF('landscape', undefined, format);
	              pdf.addImage(data, 'JPEG', 0, 0, dim[0], dim[1]);
	              pdf.save('map.pdf');
	              source.un('tileloadstart', tileLoadStart);
	              source.un('tileloadend', tileLoadEnd, canvas);
	              source.un('tileloaderror', tileLoadEnd, canvas);
	              map.setSize(size);
	              map.getView().fit(extent,size);
	              map.renderSync();
	              exportButton.disabled = false;
	              document.body.style.cursor = 'auto';
	            }, 100);
	          }
	        };        
	        
	        map.once('postcompose', function(event) {
	          source.on('tileloadstart', tileLoadStart);
	          source.on('tileloadend', tileLoadEnd, event.context.canvas);
	          source.on('tileloaderror', tileLoadEnd, event.context.canvas);
	        });
	        
	        map.setSize([width, height]);	       
	        map.getView().fit(extent,map.getSize());
	        map.renderSync();
		},
		measure:function(measureType,layerName){
			var self = this;
			/**
			 * Currently drawn feature.
			 * @type {ol.Feature}
			 */
			//self.sketch =null;
			/**
			 * The help tooltip element.
			 * @type {Element}
			 */
			//self.helpTooltipElement=null;
			/**
			 * Overlay to show the help messages.
			 * @type {ol.Overlay}
			 */
			//self.helpTooltip=null;
			/**
			 * The measure tooltip element.
			 * @type {Element}
			 */
			//self.measureTooltipElement=null;
			/**
			 * Overlay to show the measurement.
			 * @type {ol.Overlay}
			 */
			//self.measureTooltip=null;
			//self.measuredraw=null;// global so we can remove it later
			if(self.measuredraw){
				self._map.removeInteraction(self.measuredraw);
			}
			
			/**
			 * Message to show when the user is drawing a polygon.
			 * @type {string}
			 */
			var continuePolygonMsg = 'Click to continue drawing the polygon';

			/**
			 * Message to show when the user is drawing a line.
			 * @type {string}
			 */
			var continueLineMsg = 'Click to continue drawing the line';
			var map = self._map;
			
			var measureLayer = self.getLayer(layerName);
			if(null ==measureLayer) return;
			/**
			 * Handle pointer move.
			 * @param {ol.MapBrowserEvent} evt The event.
			 */			
			var pointerMoveHandler = function(evt) {
			  if (evt.dragging) {
			    return;
			  }
			  /** @type {string} */
			  var helpMsg = 'Click to start drawing';

			  if (self.sketch) {
			    var geom = (self.sketch.getGeometry());
			    if (geom instanceof ol.geom.Polygon) {
			      helpMsg = continuePolygonMsg;
			    } else if (geom instanceof ol.geom.LineString) {
			      helpMsg = continueLineMsg;
			    }
			  }

			  self.helpTooltipElement.innerHTML = helpMsg;
			  self.helpTooltip.setPosition(evt.coordinate);

			  self.helpTooltipElement.classList.remove('hidden');
			};
			
			/**
			 * 计算线的长度（内部函数）
			 * @method formatLength
			 * @param {ol.geom.LineString} 线对象.
			 * @return {string} 返回线的长度.
			 */
			var formatLength = function(line) {
			  var length;
			  if (true) {
			    var coordinates = line.getCoordinates();
			    length = 0;
			    //var sourceProj = map.getView().getProjection();
			    for (var i = 0, ii = coordinates.length - 1; i < ii; ++i) {
			      /*var c1 = ol.proj.transform(coordinates[i], sourceProj, 'EPSG:4326');
			      var c2 = ol.proj.transform(coordinates[i + 1], sourceProj, 'EPSG:4326');
			      length += wgs84Sphere.haversineDistance(c1, c2);*/
			      length += parseFloat(OpenMap.calcDistance(coordinates[i],coordinates[i + 1]));
			    }
			  } else {
			    length = Math.round(line.getLength() * 100) / 100;
			  }
			  var output;
			  if (length > 100) {
			    output = (Math.round(length / 1000 * 100) / 100) +
			        ' ' + 'km';
			  } else {
			    output = (Math.round(length * 100) / 100) +
			        ' ' + 'm';
			  }
			  return output;
			};


			/**
			 * 计算面面积（内部函数）
			 * @method formatArea
			 * @param {ol.geom.Polygon} 面对象.
			 * @return {string} 返回面积.
			 */
			var formatArea = function(polygon) {
			  var area;
			  if (true) {
			    /*var sourceProj = map.getView().getProjection();
			    var geom = *//** @type {ol.geom.Polygon} *//*(polygon.clone().transform(
			        sourceProj, 'EPSG:4326'));
			    var coordinates = geom.getLinearRing(0).getCoordinates();
			    area = Math.abs(wgs84Sphere.geodesicArea(coordinates));*/
			    area = parseFloat(OpenMap.calcArea(polygon));
			  } else {
			    area = polygon.getArea();
			  }
			  var output;
			  if (area > 10000) {
			    output = (Math.round(area / 1000000 * 100) / 100) +
			        ' ' + 'km<sup>2</sup>';
			  } else {
			    output = (Math.round(area * 100) / 100) +
			        ' ' + 'm<sup>2</sup>';
			  }
			  return output;
			};
			
			map.on('pointermove', pointerMoveHandler);

			map.getViewport().addEventListener('mouseout', function() {
			  self.helpTooltipElement.classList.add('hidden');
			});
			  var type = (measureType == 'area' ? 'Polygon' : 'LineString');
			  self.measuredraw = new ol.interaction.Draw({
			    source: measureLayer.getSource(),
			    type: /** @type {ol.geom.GeometryType} */ (type),
			    style: new ol.style.Style({
			      fill: new ol.style.Fill({
			        color: 'rgba(255, 255, 255, 0.2)'
			      }),
			      stroke: new ol.style.Stroke({
			        color: 'rgba(0, 0, 0, 0.5)',
			        lineDash: [10, 10],
			        width: 2
			      }),
			      image: new ol.style.Circle({
			        radius: 5,
			        stroke: new ol.style.Stroke({
			          color: 'rgba(0, 0, 0, 0.7)'
			        }),
			        fill: new ol.style.Fill({
			          color: 'rgba(255, 255, 255, 0.2)'
			        })
			      })
			    })
			  });
			  map.addInteraction(self.measuredraw);

			  self.createMeasureTooltip();
			  self.createHelpTooltip();
			  var listener;
			  self.measuredraw.on('drawstart',
			      function(evt) {
			        // set sketch
			        self.sketch = evt.feature;

			        /** @type {ol.Coordinate|undefined} */
			        var tooltipCoord = evt.coordinate;

			        listener = self.sketch.getGeometry().on('change', function(evt) {
			          var geom = evt.target;
			          var output;
			          if (geom instanceof ol.geom.Polygon) {
			            output = formatArea(geom);
			            tooltipCoord = geom.getInteriorPoint().getCoordinates();
			          } else if (geom instanceof ol.geom.LineString) {
			            output = formatLength(geom);
			            tooltipCoord = geom.getLastCoordinate();
			          }
			          self.measureTooltipElement.innerHTML = output;
			          self.measureTooltip.setPosition(tooltipCoord);
			        });
			      }, this);

			  self.measuredraw.on('drawend',
			      function() {
			        self.measureTooltipElement.className = 'tooltip tooltip-static';
			        self.measureTooltip.setOffset([0, -7]);
			        // unset sketch
			        self.sketch = null;
			        // unset tooltip so that a new one can be created
			        self.measureTooltipElement = null;
			        self.createMeasureTooltip();
			        ol.Observable.unByKey(listener);
			        
			       // Global_Map.un('pointermove', pointerMoveHandler);
			      }, this);
		},
		createHelpTooltip:function(){
			var self =this;
			if (self.helpTooltipElement) {
				self.helpTooltipElement.parentNode.removeChild(self.helpTooltipElement);
			  }
			self.helpTooltipElement = document.createElement('div');
			self.helpTooltipElement.className = 'tooltip hidden';
			self.helpTooltip = new ol.Overlay({
				//id:"measure" +new Date().getTime(),
			    element: self.helpTooltipElement,
			    offset: [15, 0],
			    positioning: 'center-left'
			  });
			  self._map.addOverlay(self.helpTooltip);
		},
		createMeasureTooltip:function(){
		  var self =this;
		  if (self.measureTooltipElement) {
			  self.measureTooltipElement.parentNode.removeChild(self.measureTooltipElement);
		  }
		  self.measureTooltipElement = document.createElement('div');
		  self.measureTooltipElement.className = 'tooltip tooltip-measure';
		   
		  self.measureTooltip = new ol.Overlay({
			//id:"measure" +new Date().getTime(),
		    element: self.measureTooltipElement,
		    offset: [0, -15],
		    positioning: 'bottom-center'
		  });
		  self._map.addOverlay(self.measureTooltip);
		},
		clearMeasure:function(layerName){
			var self =this;
			if(self.measuredraw){
				self._map.removeInteraction(self.measuredraw);
			}
			//清除图形
			var measureLayer = self.getLayer(layerName);
			if(null ==measureLayer) return;
			
			measureLayer.getSource().clear();
			 
			$('div .tooltip').parent().remove();
		},
        /**
         *  移除指定layer，从而移除依载该layer的所有marker
         * @method removeMarkerByLayer
			 	 * @param {string} layerName 需要移除对应层上的所有marker的层名
         */
        removeMarkerByLayer: function (layerName) {
            if (typeof layerName === 'undefined') {
                console.error('请传入layer名称');
                return;
            }
            var layer = this.getLayer(layerName);
            if (layer) {
                layer.getSource().clear();
            }
        },
        /**
         *  移除指定id的marker
         * @method removeMarkerById
			 	 * @param {string} id 需要移除指定id的marker
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
         * 左移：移动距离为当前屏幕长度的1/6
         * @method moveLeft
         */
        moveLeft:function(){
          var self = this;
          var map = self.getMap();
       	  var center =map.getView().getCenter();
       	  var pixSize = map.getPixelFromCoordinate(center);
       	  var newCenter =map.getCoordinateFromPixel([pixSize[0]-parseInt(pixSize[0]/3),pixSize[1]]);
       	  map.getView().setCenter(newCenter);
        },
        /**
         * 右移：移动距离为当前屏幕长度的1/6
         * @method moveRight
         */
        moveRight:function(){
          var self = this;
          var map = self.getMap();
       	  var center =map.getView().getCenter();
       	  var pixSize = map.getPixelFromCoordinate(center);
       	  var newCenter =map.getCoordinateFromPixel([pixSize[0]+parseInt(pixSize[0]/3),pixSize[1]]);
       	  map.getView().setCenter(newCenter);
        },
        /**
         * 上移：移动距离为当前屏幕宽度的1/6
         * @method moveUp
         */
        moveUp:function(){
          var self = this;
          var map = self.getMap();
       	  var center =map.getView().getCenter();
       	  var pixSize = map.getPixelFromCoordinate(center);
       	  var newCenter =map.getCoordinateFromPixel([pixSize[0],pixSize[1]+parseInt(pixSize[1]/3)]);
       	  map.getView().setCenter(newCenter);
        },
        /**
         * 下移：移动距离为当前屏幕宽度的1/6
         * @method moveDown
         */
        moveDown:function(){
          var self = this;
          var map = self.getMap();
       	  var center =map.getView().getCenter();
       	  var pixSize = map.getPixelFromCoordinate(center);
       	  var newCenter =map.getCoordinateFromPixel([pixSize[0],pixSize[1]-parseInt(pixSize[1]/3)]);
       	  map.getView().setCenter(newCenter);
        },
        /**
         *  添加layer的监听事件
         * @method addLayerListener
         * @param {Object} layer 添加layer的监听事件的层对象
         */
        addLayerListener: function (layer) {
            //单个选择要素
            var layerSelect = new ol.interaction.Select({
                condition: ol.events.condition.singleClick,
                layers: [layer],
                style: function (fea) {//点击marker时不发生样式的变化，还是使用本身的image作为src
                    return new ol.style.Style({
                        image: new ol.style.Icon({
                            anchor: fea.get('anchor'),
                            rotation: fea.get('rotation'),
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
            this._map.addInteraction(layerSelect);
            return layerSelect;
        },
        /**
         *  开启绘画功能
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
            var source = new ol.source.Vector({ wrapX: false });
            var _drawLayer = new ol.layer.Vector({
                source: source
            });
            self.addLayer('_drawLayer', _drawLayer);
            // self._featureOverlay = new ol.layer.Vector({ //画图所用的layer对象
            //     source: new ol.source.Vector({
            //         features: features
            //     }),
            //     style: new ol.style.Style({
            //         fill: new ol.style.Fill({
            //             color: 'rgba(255, 255, 255, 0.6)'
            //         }),
            //         stroke: new ol.style.Stroke({
            //             color: '#ffcc33',
            //             width: 2
            //         }),
            //         image: new ol.style.Circle({
            //             radius: 7,
            //             fill: new ol.style.Fill({
            //                 color: '#ffcc33'
            //             })
            //         })
            //     })
            // });
            // self._featureOverlay.setMap(map);
            // var modify = new ol.interaction.Modify({
            //     features: features,
            //     deleteCondition: function (event) {
            //         return ol.events.condition.shiftKeyOnly(event) &&
            //             ol.events.condition.singleClick(event);
            //     }
            // });
            // map.addInteraction(modify);
            self._draw = new ol.interaction.Draw({
                source: source,
                type: /** @type {ol.geom.GeometryType} */ (type === "Box" ? "Circle" : type),
                geometryFunction: type === "Box" ? ol.interaction.Draw.createBox() : undefined
            });

            map.addInteraction(self._draw);
            if (events && !OpenMap.is(events, 'Object')) {
                console.warn('事件参数错误！');
                return;
            } else {
                for (var e in events) {
                    if (events.hasOwnProperty(e)) {
                        self._draw.dispatchEvent(e);
                        self._draw.on(e, events[e]);
                    }
                }
            }
        },
        /**
         *  返回绘画对象
         * @method getDraw
         * @return {Object} 返回绘画对象
         */
        getDraw: function () {
            return this._draw;
        },
        /**
         *  关闭绘画功能
         * @method closeDraw
         */
        closeDraw: function () {
            if (this._draw) {
                this._map.removeInteraction(this._draw);
            }
        },
        /**
         *  开启绘画功能
         * @method oDraw
         * @param {String} type 点、线、矩形、多边形、圆（Point|LineString|Box|Polygon|Circle） 
         * @param {events} events drawstart,drawend,change,propertychange
         */
        oDraw: function (layerName,type, events) {
            if (typeof layerName === 'undefined') {
                console.error('draw layer is error!');
                return;
            }
            if (typeof type === 'undefined' || ['Point', 'LineString', 'Box', 'Polygon', 'Circle'].indexOf(type) === -1) {
                console.error('draw type is error!');
                return;
            }
            var self = this;
            var map = self.getMap();
            var layer = self.getLayer(layerName);
            if(layer == null) return;           
            self._draw = new ol.interaction.Draw({
                source: layer.getSource(),
                snapTolerance:15, //默认 12
                type: /** @type {ol.geom.GeometryType} */ (type === "Box" ? "Circle" : type),
                geometryFunction: type === "Box" ? ol.interaction.Draw.createBox() : undefined
            });

            self.setDoubleClickZoomState(false);
            map.addInteraction(self._draw);
            
            //开启捕捉功能
            self.editSnap = new ol.interaction.Snap({
            	source: layer.getSource(),
    			//features: self.selectSource,  
    			pixelTolerance:15   
    		 });
            map.addInteraction(self.editSnap);
            if (events && !OpenMap.is(events, 'Object')) {
                console.warn('事件参数错误！');
                return;
            } else {
                for (var e in events) {
                    if (events.hasOwnProperty(e)) {
                        self._draw.dispatchEvent(e);
                        self._draw.on(e, events[e]);
                    }
                }
            }
        },
        /**
         * 关闭编辑元素功能
         * @method closeEditor
         */
        closeEditor:function(){
        	var self = this;
            var map = self.getMap();
            
            /*if(self.editSelectFeature){
            	map.removeInteraction(self.editSelectFeature);
            }*/
            //选择作为默认工具
            if(self.editFeatureInteraction){
            	map.removeInteraction(self.editFeatureInteraction);
            }
            if(self.editSnap){
            	map.removeInteraction(self.editSnap);
            }
        },
        /**
         * 清空选择元素
         * @method clearSelect
         */
        clearSelect:function(){
        	var self = this;
        	
            var selectedFeatures = self.editSelectFeature.getFeatures().clear();
            self.selectSource = new ol.Collection();   	
            self.currentFeature=null; 
           /* selectedFeatures.on(['remove'], function() {
                var names = selectedFeatures.getArray().map(function(feature) {
                  return feature.get('ID');
                });
                 
              });*/
            /*self.editSelectFeature.getFeatures()=[];
            self.selectSource = new ol.Collection();   	
            self.currentFeature=null;*/
        },
        /**
         * 关闭选择元素功能
         * @method closeSelect
         */
        closeSelect:function(){
        	var self = this;
            var map = self.getMap();
         
            self.selectSource = new ol.Collection();   	
            self.currentFeature=null;
            //移除选择交互设置
            if(self.editSelectFeature){
            	map.removeInteraction(self.editSelectFeature);
            }           
        },
        /**
         * 选择要素
         * @method oSelect
         * @param {String} layerName 需要选中的层名称
         */
        oSelect:function(layerName){
        	if (typeof layerName === 'undefined') {
                console.error('select layer is error!');
                return;
            } 
        	var self = this;
        	var map = self.getMap();
            var layer = self.getLayer(layerName);
        	//初始化变量
            self.selectSource = new ol.Collection();   	
            self.currentFeature=null;
            
            //self.closeEditor();
            if(self.editSelectFeature){
            	map.removeInteraction(self.editSelectFeature);
            }
            self.editSelectFeature = new ol.interaction.Select({
    		    condition: ol.events.condition.singleClick,
    			layers:[layer],
    		    style:new ol.style.Style({
    		        
    		    	fill:new ol.style.Fill({
    		            color:'rgba(255, 255, 255, 0.6)'
    		          }),
    		          stroke:new ol.style.Stroke({
    		            color:'#00ffff',
    		            width : 2
    		          })
    		        })
    		});
            
    		if (self.editSelectFeature != null) {
        		map.addInteraction(self.editSelectFeature);
        		self.editSelectFeature.on('select', function(evt) {
        			
        			self.selectSource.forEach(function (feature){
        			if(!feature){
        				self.selectSource.remove(feature);	
        			}			
        			});
        		
	        		if(evt.selected.length>0){
	        			evt.selected.forEach(function (feature) {
	        				if(feature){
	        					self.selectSource.push(feature);
	        		       }
	        		    });
	        		}
	        		
	        		if(evt.deselected.length>0){
	        			evt.deselected.forEach(function (feature) {
	        				if(feature){
	        					self.selectSource.remove(feature);
	        				}
	        		    });
	        		}
	        		
	        		if(self.selectSource.getLength()>0){
	        			self.currentFeature = self.selectSource.getArray()[0];
	        		}else{
	        			if(self.tempEditLayer){
	        				self.tempEditLayer.getSource().clear();	
	        			}	        			
	        		}   		
	        		
	        		//显示信息框
                });
        	}
        },
        /**
         *  开启编辑功能
         * @method oEditor
         * @param {String} layerName 需要编辑的层名称
         * @param {events} events 需要编辑的层事件
         */
        oEditor: function (layerName, events) {
            if (typeof layerName === 'undefined') {
                console.error('edit layer is error!');
                return;
            }            
            var self = this;
            var map = self.getMap();
            var layer = self.getLayer(layerName);
            if(layer == null) return;
            
            if(self.selectSource.getLength()==0){
            	alert("please select feature first!");
            	return;
            }
            self.setDoubleClickZoomState(false);
            //设置编辑过程样式
            if(!self.tempEditLayer){
            	var tempEditSource = new ol.source.Vector({});	
            	self.tempEditLayer = new ol.layer.Vector({
           		   source: tempEditSource,
           		   projection:myprojection,
           		   name:"tmpEditLayer",
           		   style:new ol.style.Style({
           		        image:new ol.style.Circle({
           		          radius:5,
           		    	fill:new ol.style.Fill({
           		            color:'#2D9DEC'
           		          }),
           		          stroke:new ol.style.Stroke({
           		            color:'rgba(0, 255, 255, 0.6)'
           		          }),
           		          image: new ol.style.Circle({
           			            radius: 3,
           			            fill: new ol.style.Fill({
           			                color: '#FF0000'
           			            })
           			        })
           		        })
           		    })
           		 });
            }
            /*//初始化变量
            self.selectSource = new ol.Collection();   	
            self.currentFeature=null;
            
            self.closeEditor();
            self.editSelectFeature = new ol.interaction.Select({
    		    condition: ol.events.condition.singleClick,
    			layers:[layer],
    		    style:new ol.style.Style({
    		        
    		    	fill:new ol.style.Fill({
    		            color:'rgba(255, 255, 255, 0.6)'
    		          }),
    		          stroke:new ol.style.Stroke({
    		            color:'rgba(0, 255, 255, 0.6)'
    		          })
    		        })
    		});*/
    		
            self.editFeatureInteraction =new ol.interaction.Modify({
    	    features: self.selectSource,   
    	    style:new ol.style.Style({	        
    	        fill:new ol.style.Fill({
    	          color:'rgba(255, 255, 255, 0.6)'
    	        }),
    	        stroke:new ol.style.Stroke({
    	          color:'rgba(0, 255, 255, 0.6)'
    	        })
    	      })
    	  	});
    	
            self.editSnap = new ol.interaction.Snap({
            	source: layer.getSource(),
    			//features: self.selectSource,  
    			pixelTolerance:15   
    		 });
    		
    		
    		//置于顶层  ---可不要 		
    		if(layer){
    			map.removeLayer(layer);
    			map.addLayer(layer);  //置于顶层
    		}
    		if(self.tempEditLayer){
        		map.removeLayer(self.tempEditLayer);
        		map.addLayer(self.tempEditLayer);  //置于顶层
        	}
    	
/*    		if (self.editSelectFeature != null) {
    		map.addInteraction(self.editSelectFeature);
    		self.editSelectFeature.on('select', function(evt) {
    			
    			self.selectSource.forEach(function (feature){
    			if(!feature){
    				self.selectSource.remove(feature);	
    			}			
    			});
    		
    		if(evt.selected.length>0){
    			evt.selected.forEach(function (feature) {
    				if(feature){
    					self.selectSource.push(feature);
    		       }
    		    });
    		}
    		
    		if(evt.deselected.length>0){
    			evt.deselected.forEach(function (feature) {
    				if(feature){
    					self.selectSource.remove(feature);
    				}
    		    });
    		}
    		
    		if(self.selectSource.getLength()>0){
    			self.iniEditingStyle();
    		}else{
    			self.tempEditLayer.getSource().clear();
    		}
            });
    		}*/
    	
    		if(self.selectSource.getLength()>0){
    			self.iniEditingStyle();
    		}else{
    			self.tempEditLayer.getSource().clear();
    		}
    		
    	if (self.editFeatureInteraction != null) {
    		map.addInteraction(self.editFeatureInteraction);
    		map.addInteraction(self.editSnap);
    		
    		var originalCoordinates = {};
    		var isRectangle =false;
    		var oldCoordinates;
    		self.editFeatureInteraction.on('modifyend', function(evt) {
    			if(!evt.features) return;
    			ol.Observable.unByKey(listener);
    			
    		    evt.features.forEach(function (feature) {
    		        if (feature in originalCoordinates ) {  //&& Math.random() > 0.5
    		        	
    		            delete originalCoordinates[feature];
    		            if(feature.getGeometry().getType()=="Circle"){
    					originalCoordinates[feature] = feature.getGeometry().getCenter();
    					}else{    		            
    		            if(isRectangle){
    		            	if(feature.getGeometry().getCoordinates()[0].length==4){
    		            		//删除一个点
    		            		feature.getGeometry().setCoordinates([
    				            oldcoordinates
    				        	]);
    		            		originalCoordinates[feature] = feature.getGeometry().getCoordinates();		            		
    		            	}else{
    		            		var newcoordinates = feature.getGeometry().getCoordinates()[0];
    		            		var start;
    		            		var end;
    		            		if(newcoordinates[0][0]!=oldcoordinates[0][0] && newcoordinates[0][1]!=oldcoordinates[0][1] ){
    		            			start = newcoordinates[0];
    		            			end = newcoordinates[2];
    		            		}else if(newcoordinates[1][0]!=oldcoordinates[1][0] && newcoordinates[1][1]!=oldcoordinates[1][1] ){
    		            			start = [newcoordinates[1][0],newcoordinates[3][1]];
    		            			end = [newcoordinates[3][0],newcoordinates[1][1]];
    		            		}else if(newcoordinates[2][0]!=oldcoordinates[2][0] && newcoordinates[2][1]!=oldcoordinates[2][1] ){
    		            			start = newcoordinates[0];
    		            			end = newcoordinates[2];
    		            		}else if(newcoordinates[3][0]!=oldcoordinates[3][0] && newcoordinates[3][1]!=oldcoordinates[3][1] ){
    		            			start = [newcoordinates[1][0],newcoordinates[3][1]];
    		            			end = [newcoordinates[3][0],newcoordinates[1][1]];
    		            		}
    							if(start && end){								
    							
    		            		feature.getGeometry().setCoordinates([
    				            [start, [start[0], end[1]], end, [end[0], start[1]], start]
    				        	]);    		            		
    				        	originalCoordinates[feature] = feature.getGeometry().getCoordinates();
    				        	
    				        	}
    		            	}
    		            	isRectangle =false;
    						oldCoordinates = [];
    		            }else{
    		            	originalCoordinates[feature] = feature.getGeometry().getCoordinates();
    		            
    		            }
    		            }
    		            // remove and re-add the feature to make Modify reload it's geometry
    		            self.selectSource.remove(feature);
    		            self.selectSource.push(feature);
    		            
    		            self.iniEditingStyle();
    		        }
    		    });
    		});
      		var listener;
      		self.editFeatureInteraction.on('modifystart', function(evt) {
      			if(!evt.features) return;
      			
      			var sketch;
      			evt.features.forEach(function (feature) {
      				if(feature.getGeometry().getType()=="Circle"){
      					originalCoordinates[feature] = feature.getGeometry().getCenter();
      				}else{
      					originalCoordinates[feature] = feature.getGeometry().getCoordinates();
      					if(feature.getGeometry().getType()== "Polygon"){
      						var coordinates = self.currentFeature.getGeometry().getCoordinates()[0];
      						var bound = OpenMap.getExtentByCoordinates(coordinates);
      						if(bound.indexOf(coordinates[1][0])>-1 && bound.indexOf(coordinates[1][1])>-1
      						&& bound.indexOf(coordinates[3][0])>-1 && bound.indexOf(coordinates[3][1])>-1
      						){
      							if(!isRectangle){
      								isRectangle =true;
      								oldcoordinates = coordinates;
      							}
      						}
      					}
      				}		        
      		        sketch = feature;
      		   });	
      		        
      			listener = sketch.getGeometry().on('change', function(evt) {
      		          var geom = evt.target;		         
      		          self.iniEditingStyle();	
      		      });
      		});
        }
        },
        /*
         * 初始化编辑样式
         * @method iniEditingStyle
         */
        iniEditingStyle:function(){
        	var self =this;
          	self.tempEditLayer.getSource().clear();
          	
            if(self.selectSource.getLength()==1){
             self.currentFeature =self.selectSource.getArray()[0];
             var currentFeature = self.currentFeature;
        	 var cPnts =[];
        	 var features =[]
        	 var len;
        	 //面的获取方式
         	if(currentFeature.getGeometry().getType()=="Polygon"){
         		cPnts = currentFeature.getGeometry().getCoordinates()[0];
         		len = cPnts.length-1;
         	}else if(currentFeature.getGeometry().getType()=="LineString"){
         		cPnts = currentFeature.getGeometry().getCoordinates();
         		len = cPnts.length;
         	}else if(currentFeature.getGeometry().getType()=="Point"){
         		cPnts = currentFeature.getGeometry().getCoordinates();
         		len=0;
         		features[0] = new ol.Feature({geometry:new ol.geom.Point(cPnts),});		
         	}else if(currentFeature.getGeometry().getType()=="Circle"){
         		
         		len=2;
         		cPnts[0] = currentFeature.getGeometry().getCenter();
         		cPnts[1] = currentFeature.getGeometry().getLastCoordinate();
         		//features[1] = new ol.Feature({geometry:new ol.geom.Point(cPnts)});
         	}
            for(var i=0; i<len; i++){
            	//var id = 'p-helper-control-point-div' + '-' + i;	       
            	features[i] = new ol.Feature({geometry:new ol.geom.Point(cPnts[i]),});		
            }
            self.tempEditLayer.getSource().addFeatures(features);
            }
        },
        /**
         * 设置DoubleClickZoom的状态，绘图和编辑过程中都不需要激活
         * @method setDoubleClickZoomState
         * @param {boolean} isActive 状态
         */
        setDoubleClickZoomState:function(isActive){        	
        	var map = this.getMap();
        	var interactions = map.getInteractions();
      	    var length = interactions.getLength();
      	    for (var i = 0; i < length; i++) {
      	        var item = interactions.item(i);
      	        if (item instanceof ol.interaction.DoubleClickZoom) {    	            
      	            item.setActive(isActive);
      	            break;
      	        }
      	    }
        },
        
        /**
        * 添加路况图层
        * @method adminLayerVisibility
        * @param  {String} typeName 当前|5分钟|15分钟|1小时后，分别表示最新路况|预测5分钟|预测15分钟|预测1小时后
        * @param  {String} propertyName 路况需要获取的属性名（目前传空即可）
        * @param  {String} callbackName 全局异步回调的方法名（一般写callFn,假如一个页面有多个map则有区别即可）
        * @param  {Object} filter 需要过滤的属性
        * @param  {function} fn 回调执行方法
        */
        adminLayerVisibility: function (typeName, propertyName, callbackName, filter, fn) {
            var self = this;
	    			var status_key = 'STATUS';
            //是否需要
            var isNeedHttp = true;
            if(self.allRoadFeatures)
            {
               isNeedHttp = false;
            }
            if(typeName=='5分钟'||typeName=='15分钟'||typeName=='1小时后')
            {
                    if(typeName=='5分钟'){
                        status_key = 'PRE_5MIN_STATUS';
                    }else if(typeName=='15分钟'){
                        status_key = 'PRE_15MIN_STATUS';
                    }else if(typeName=='1小时后'){
                        status_key = 'PRE_1HOUR_STATUS';
                    }
            }
            //wfs回调方法
            window[callbackName] = function (res) {
            	  
                var myprojection = self.getProjection();
                var format = new ol.format.GeoJSON();
                self.allRoadFeatures = self.roadFeatures = format.readFeatures(res, { featureProjection: myprojection });
                
                 if(filter)
            	  {
            	  		var showFeatures = [];
            	  		for(var i =0; i<self.allRoadFeatures.length;i++)
            	  		{
            	  			for(var j=0 ; j<filter.length;j++)
            	  			{
            	  				if(self.allRoadFeatures[i].get(filter[j].propertyName) == filter[j].value)
            	  				{
            	  					showFeatures.push(self.allRoadFeatures[i]);
            	  					break;
            	  				}
            	  			}
            	  			
            	  		}
            	  	self.roadFeatures = showFeatures;
            	  	self.getLayer('roadLayer').getSource().addFeatures(showFeatures);
            	  }
            	  else
            	  {
            	  	self.getLayer('roadLayer').getSource().addFeatures(self.roadFeatures);
            	  }
                
                if (fn) fn();
            };
            function getFeature(options) {
                $.ajax('/xk_monitor/congest/getTrafficCache?functionName='+options.callback, {
                    type: 'GET',
                    dataType: 'json',
                    success:function(str){
                    	 eval('(' + str.data + ')'); 
                    }
                })
            }

            var wfcVectorSource = new ol.source.Vector();
            if(isNeedHttp){

                getFeature({
                    typename: 'xk:ROAD_STATUS',//'poi:POI_POINT',
                    propertyname: 'OBJECTID,NAME,GEOMETRY,STATUS,PRE_5MIN_STATUS,PRE_15MIN_STATUS,PRE_1HOUR_STATUS,TYPE_CODE', //'ID,NAMEC,GEOMETRY',
                    maxfeatures: 20000,
                    srid: 'EPSG:4326',
                    filter: filter,
                    //filter:ol.format.filter.equalTo('OWNER', '360300'),  无效，用xml格式，并且有命名空间
                    callback: callbackName
                });
            }

            var getText = function (feature, resolution) {
                var type = "normal";
                var maxResolution = 0.000005364418029785156;//6.705522537231445e-7;
                var text = feature.get('NAME');
                //style.getText().setText(resolution < 5000 ? feature.get('name') : '');
                if (resolution > maxResolution) {
                    text = '';
                } else if (type == 'hide') {
                    text = '';
                } else if (type == 'shorten') {
                    text = text.trunc(12);
                } else if (type == 'wrap') {
                    text = stringDivider(text, 16, '\n');
                }

                //console.info("zoom:"+ map.getView().getZoom() + "resolution:"+ resolution );
                return text;
            };
            var highlightStyleCache = {};
            var colorValue = 10;
            var createPolygonStyleFunction = function () {
                return function (feature, resolution) {
                    var mapZoom = self._map.getView().getZoom();
                    var name =resolution < 000005364418029785156 ? feature.get('NAME') : '';
                    var text = mapZoom + name;
                    //if (!highlightStyleCache[text]) {
                        var style =new ol.style.Style({
                        fill: new ol.style.Fill({
                            color: "rgba(255, 255, 255, 1)"
                        }),
                        stroke: new ol.style.Stroke({
                            color: "rgba(255, 255, 255, 0)",
                            width: 0
                        }),
                        text: createTextStyle(feature, resolution)
                    });
                    var fscale = parseInt(feature.get('TYPE_CODE'));
                    if(mapZoom >=fscale){
                        style = new ol.style.Style({
                            fill: new ol.style.Fill({
                                color: "rgba(255, 255, 255, 1)" //getAreaColor("",0,100,colorValue ) //****.parkFillColor   rgba(255, 255, 255, 1)
                            }),
                            stroke: new ol.style.Stroke({
                                color: roadColor(feature), //"rgba(0, 255, 255, 1)",//"#319FD3",//****.parkBorderColor,
                                width: 3
                            }),
                            text: createTextStyle(feature, resolution)
                        });
                    }
                    //highlightStyleCache[text] =style;
                   // }
                    return [style];
                }
            };

            var roadColor = function (feature) {
                var color = "#c5c3c8";
                if(feature.get(status_key)== 1){
                    color ='#17BF00'; //G
                }else if(feature.get(status_key)==4 ){
                    color ='#F33030';   //R
                }else if(feature.get(status_key)==3){
                    color ='#FF9E19';
                }else if(feature.get(status_key)==2){
                    color ='#ffff00';
                }

                return color;
            }
            var createTextStyle = function (feature, resolution) {
                var align = "center";  //center 'left', 'right', 'center', 'end' or 'start'. Default is 'start'.
                var baseline = "hanging";  // middle 'bottom', 'top', 'middle', 'alphabetic', 'hanging', 'ideographic'. Default is 'alphabetic'.
                var size = "10px";
                var offsetX = 0;
                var offsetY = 10;
                var weight = "100"; //normal  bold
                var rotation = "0";//feature.get('rotation');
                var font = weight + ' ' + size + ' ' + "Arial";  //
                var fillColor = 'black';
                var outlineColor = 'black';
                var outlineWidth = 1;

                return new ol.style.Text({
                    textAlign: align,
                    textBaseline: baseline,
                    font: font,
                    //text: getText(feature, resolution),
                    fill: new ol.style.Fill({ color: fillColor }),
                    stroke: new ol.style.Stroke({ color: outlineColor, width: outlineWidth }),
                    offsetX: offsetX,
                    offsetY: offsetY,
                    rotation: rotation
                });
            };

            var myprojection = this.getProjection();
            // 构建图层
            var adminWfsLayer = new ol.layer.Vector({
                source: wfcVectorSource,
                projection: myprojection,
                style: createPolygonStyleFunction()
            });

            //添加图层
            this.addLayer("roadLayer", adminWfsLayer);

            //如果读的缓存就直接添加路况
            if(!isNeedHttp){
            		//如果是获取过滤的
            	  if(filter)
            	  {
            	  		var showFeatures = [];
            	  		for(var i =0; i<this.allRoadFeatures.length;i++)
            	  		{
            	  			for(var j=0 ; j<filter.length;j++)
            	  			{
            	  				if(this.allRoadFeatures[i].get(filter[j].propertyName) == filter[j].value)
            	  				{
            	  					showFeatures.push(this.allRoadFeatures[i]);
            	  					break;
            	  				}
            	  			}
            	  			
            	  		}
            	  	this.roadFeatures = showFeatures;
            	  	self.getLayer('roadLayer').getSource().addFeatures(showFeatures);
            	  }
            	  else
            	  {
            	  		self.getLayer('roadLayer').getSource().addFeatures(this.allRoadFeatures);
            	  }
            	  if(fn)fn();
            }

            var getAreaColor = function (name, min, max, value) {
                value = parseFloat(value);
                colorValue += 10;
                if (value > 100) {
                    value = 100;
                }
                min = parseFloat(min);
                max = parseFloat(max);
                if (value < min) value = min;
                var colorRange = ['#ff3333', '#FFA500', '#FFFF00', '#00FF00'].reverse();
                var colorIndex = (value - min) * 1.0 / (max - min) * (colorRange.length - 1);
                colorIndex = Math.floor(colorIndex);
                if (colorIndex == colorRange.length - 1) colorIndex = colorRange.length - 2;

                var startColor = colorRange[colorIndex];
                var endColor = colorRange[colorIndex + 1];

                var step = (max - min) / (colorRange.length - 1);
                value = value - min - ((max - min) * (colorIndex) / (colorRange.length - 1));

                var startRGB = colorRgb(startColor);//转换为rgb数组模式
                var startR = startRGB[0];
                var startG = startRGB[1];
                var startB = startRGB[2];

                var endRGB = colorRgb(endColor);
                var endR = endRGB[0];
                var endG = endRGB[1];
                var endB = endRGB[2];

                var sR = (endR - startR) / step * value + startR;//总差值
                var sG = (endG - startG) / step * value + startG;
                var sB = (endB - startB) / step * value + startB;
                var result = 'rgba(' + parseInt(sR) + ',' + parseInt(sG) + ',' + parseInt(sB) + ',' + 0.3 + ')';
                return colorHex(result);
            }

            var colorRgb = function (sColor) {
                var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
                var sColor = sColor.toLowerCase();
                if (sColor && reg.test(sColor)) {
                    if (sColor.length === 4) {
                        var sColorNew = "#";
                        for (var i = 1; i < 4; i += 1) {
                            sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
                        }
                        sColor = sColorNew;
                    }
                    //处理六位的颜色值
                    var sColorChange = [];
                    for (var i = 1; i < 7; i += 2) {
                        sColorChange.push(parseInt("0x" + sColor.slice(i, i + 2)));
                    }
                    return sColorChange;
                } else {
                    return sColor;
                }
            };

            var colorHex = function (rgb) {
                var _this = rgb;
                var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
                if (/^(rgb|RGB)/.test(_this)) {
                    var aColor = _this.replace(/(?:(|)|rgb|RGB)*/g, "").split(",");
                    var strHex = "#";
                    for (var i = 0; i < aColor.length; i++) {
                        var hex = Number(aColor[i]).toString(16);
                        hex = hex < 10 ? 0 + '' + hex : hex;// 保证每个rgb的值为2位
                        if (hex === "0") {
                            hex += hex;
                        }
                        strHex += hex;
                    }
                    if (strHex.length !== 7) {
                        strHex = _this;
                    }
                    return strHex;
                } else if (reg.test(_this)) {
                    var aNum = _this.replace(/#/, "").split("");
                    if (aNum.length === 6) {
                        return _this;
                    } else if (aNum.length === 3) {
                        var numHex = "#";
                        for (var i = 0; i < aNum.length; i += 1) {
                            numHex += (aNum[i] + aNum[i]);
                        }
                        return numHex;
                    }
                } else {
                    return _this;
                }
            }

        },
        /**
         *  添加vector图层选择事件
         * @method addLayerSelectListener
         * @param  {String} layerName 需要添加事件的图层名称
         * @param  {Object} selectCondition 需要添加的事件对象
         * @param  {function} callback 回调执行方法
         */
        addLayerSelectListener: function (layerName,selectCondition,callback) {
            var layer = this.getLayer(layerName);
            var self = this;
            //单个选择要素
            var layerSelect = new ol.interaction.Select({
                condition: selectCondition,  //ol.events.condition.pointerMove, click,
                layers: [layer],
                style: function (features) {
                        var fea;
                        if(!features.get("extData")){
                            var featuresArray = features.get('features');
                            if(featuresArray.length == 1){
                                fea = featuresArray[0];
                            } else{
                                var size = featuresArray.length;
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
                                return new ol.style.Style({
                                      image: new ol.style.Icon({
                                          img: dcanvasCircle($('canvas.process').clone().show().get(0), {
                                              'centerX': '45',
                                              'centerY': '45',
                                              'radiusOutside': rO,
                                              'radiusInside': rI,
                                              'size': size
                                          }),
                                          imgSize: [90, 90]
                                      }),
                                  });
                            }
                        } else{
                            fea = features;
                        }
                        if(fea){
                            var extData = fea.get("extData");
                            if(extData.gpsState == 1){ //离线
                                var img = "views/key_vehicle/img/select_pic_map_car_lixian.png";
                            } else{
                                var img = "views/key_vehicle/img/select_pic_map_car_zaixian.png";
                            }
                            callback(extData);
                            return new ol.style.Style({
                                image: new ol.style.Icon({
    //                              rotation: fea.get('rotation') || 0,
                                    src: img
    //                              anchor: fea.get('anchor')
                                }),
                                text:self.createTextStyle(extData.hphm)
                            });
                        }
                    }
            });

            layerSelect.on('select', function (evt) {
                if (evt.selected.length > 0) {
                }
            });
            self._map.addInteraction(layerSelect);
            return layerSelect;
        },
        
        /*
        * 添加车辆号牌提示
        * @method createTextStyle
        * @param  {String} carno 车牌号码
        * @return {ol.style.Text} 文字提示样式
        */
        createTextStyle: function(carno){
            var self = this;
            var align = "center";  //center 'left', 'right', 'center', 'end' or 'start'. Default is 'start'.
           var baseline = "hanging";  // middle 'bottom', 'top', 'middle', 'alphabetic', 'hanging', 'ideographic'. Default is 'alphabetic'.
           var size = "12px";  
           var offsetX = 0;  
           var offsetY = 10;  
           var weight = "60"; //normal  bold  100
           var rotation = "0";//feature.get('rotation');  
           var font =  weight + ' ' + size + ' ' + "Arial";  //
           var fillColor = '#4293ee';  
           var outlineColor = '#4293ee';  
           var outlineWidth = 0;  
     
           return new ol.style.Text({  
               textAlign: align,  
               textBaseline: baseline,  
               font: font,  
               text: self._map.getView().getZoom() > 14 ?carno:'',  
               fill: new ol.style.Fill({color: fillColor}),  
               stroke: new ol.style.Stroke({color: outlineColor, width: outlineWidth}),  
               offsetX: offsetX,  
               offsetY: offsetY,  
               rotation: rotation  
           });
        },
        
        /*
        * 添加路网鼠标悬浮事件
        * @method addLayerMoveListener
        * @param  {String} layerName 需要添加事件的图层名
        * @return {ol.interaction.Select} 返回选中事件的对象
        */
        addLayerMoveListener: function (layerName) {
            var adminWfsLayer = this.getLayer(layerName);
            var self = this;
            //单个选择要素
            var adminLayerSelect = new ol.interaction.Select({
                condition: ol.events.condition.pointerMove,  //click,
                layers: [adminWfsLayer],
                style: new ol.style.Style({

                    fill: new ol.style.Fill({
                        color: 'rgba(0, 255, 255, 0.6)'
                    }),
                    stroke: new ol.style.Stroke({
                        color: 'rgba(00, 255, 255, 0.6)',
                        width: 5
                    })
                })
            });

            adminLayerSelect.on('select', function (evt) {
                var container = document.getElementById('popup');
                if (evt.selected.length > 0) {
                    self._map.getViewport().style.cursor = 'hand';
                    var coordinate = evt.mapBrowserEvent.coordinate;
                    /* evt.selected.forEach(function (feature) {

                    });  */
                    var content = document.getElementById('popup-content');
                    var title = document.getElementById('popup-title');

                    var overlay = self._map.getOverlayById("openOverlay");
                    /*  var hdms = ol.coordinate.toStringHDMS(ol.proj.transform(
                             coordinate, 'EPSG:4490', 'EPSG:4490'));  */
                    overlay.setPosition(coordinate);
                    content.innerHTML = '<p>You clicked here:</p><code>' + ' 路名称: ' + evt.selected[0].get("NAME") + '\n' + ' OBJECTID' + evt.selected[0].get("OBJECTID")   //feature.get("name")
                    '</code>';
                    container.style.display = 'block';
                    title.innerHTML = "提示信息";
                    title.style.display = 'block';
                } else {
                    container.style.display = 'none';
                    self._map.getViewport().style.cursor = 'default';
                }
            });
            self._map.addInteraction(adminLayerSelect);
            return adminLayerSelect;
        },
        
        /*
        * 选中某车辆
        * @method locateCar
        * @param  {Object} layerSelect 选中的事件对象
        * @param  {String} layerName 需要选中的图层名
        * @param  {String} plateName 车牌号码
        * @param  {function} callback 回调方法
        */
        locateCar: function(layerSelect, layerName, plateName,callback) {
            console.log(layerName);
            var czoom = this._map.getView().getZoom();
            var selectedFeatures = layerSelect.getFeatures();
            var layer = this.getLayer(layerName);
            var features = layer.getSource().getFeatures();
            if(features) {
                selectedFeatures.clear();
                var feature;
                var hasResult = true;
                for(var i = 0; i < features.length; i++) {
                    if(layerName=="carMarkerLayer"){
                        feature = features[i];
                    } else{
                        var currentFeature = features[i];
                        var subFeatures = currentFeature.get('features');
                        if(subFeatures.length == 1){
                            feature = subFeatures[0];
                        }
                    }
                    
                    var hphm = feature.get("extData").hphm;
                    if(hphm == plateName) {
                        selectedFeatures.push(feature);
                        hasResult = false;
                        break;
                    }
                }
                if(hasResult){
                    callback();
                } else{
                    this._map.getView().fit(feature.getGeometry());
                    this._map.getView().setZoom(czoom);
                }
            }
        },
         /*
        * 选中某道路
        * @method locateCar
        * @param  {Object} adminLayerSelect 选中的事件对象
        * @param  {Object} tempRoadlayer 需要选中的图层对象
        */
        locateRoad: function (adminLayerSelect,tempRoadlayer) {
            var selectedFeatures = adminLayerSelect.getFeatures();
            var roadFeature = this.roadFeatures;
            var pFeatures = [];
            var pCoordinates = [];
            var cnt = 0;
            if (roadFeature && roadFeature.length) {
                selectedFeatures.clear();
                var extent = [180, 90, 0, 0];

                for (var i = 0; i < roadFeature.length; i++) {
                    selectedFeatures.push(roadFeature[i]);
                    //添加路段的两个端点，若是重复则删除存放的同样的端点，不重复则增加  
                    //判断第一个点
                    var geo = roadFeature[i].getGeometry();
                    var coordinates = geo.getCoordinates();
                    if (pCoordinates.indexOf(coordinates[0]) == 1) {
                        for (var j = 0; j < pCoordinates.length; j++) {
                            if (pCoordinates[j] == coordinates[0]) {
                                arr.splice(j, 1);
                                cnt--;
                            }
                        }
                    } else {
                        pCoordinates[cnt] = coordinates[0];
                        cnt++;
                    }
                    //判断最后一个点
                    if (pCoordinates.indexOf(coordinates[coordinates.length - 1]) == 1) {
                        for (var j = 0; j < pCoordinates.length; j++) {
                            if (pCoordinates[j] == coordinates[coordinates.length - 1]) {
                                arr.splice(j, 1);
                                cnt--;
                            }
                        }
                    } else {
                        pCoordinates[cnt] = coordinates[coordinates.length - 1];
                        cnt++;
                    }
                }

                //计算最大距离
                var maxdis = 0;
                var cor1 = pCoordinates[0];
                var cor2 = pCoordinates[0];
                for (var m = 0; m < pCoordinates.length - 1; m++) {
                    for (var n = m + 1; n < pCoordinates.length; n++) {
                        var dis = Math.sqrt(Math.pow((pCoordinates[m][0] - pCoordinates[n][0]), 2) + Math.pow((pCoordinates[m][1] - pCoordinates[n][1]), 2));
                        if (dis > maxdis) {
                            maxdis = dis;
                            cor1 = pCoordinates[m];
                            cor2 = pCoordinates[n];
                        }
                    }
                }

                //添加起止点
                pFeatures[0] = new ol.Feature(new ol.geom.Point(cor1));
                pFeatures[1] = new ol.Feature(new ol.geom.Point(cor2));
                tempRoadlayer.getSource().clear();
                tempRoadlayer.getSource().addFeatures(pFeatures);

                //定位道路
                var lineGeo = new ol.geom.LineString([cor1, cor2]);
                this._map.getView().fit(lineGeo);
            } else {
                console.log('没有路段数据');
            }
        },
        /*
        * 构建路段查询
        * @method buildFilterBySigmentIds
        * @param  {String} sigmentIds 路段id数组
        * @return  {Object}  [{"propertyName":"OBJECTID","value":sigmentId}]
        */
        buildFilterBySigmentIds: function (sigmentIds) {
        		var temp = [];
        		 for (var i = 0; i < sigmentIds.length; i++) {
        		 	temp.push({"propertyName":"OBJECTID","value":sigmentIds[i]});
        		}
            /*var xml = '<Filter xmlns="http://www.opengis.net/ogc"><Or>';
            for (var i = 0; i < sigmentIds.length; i++) {
                xml += '<PropertyIsEqualTo><PropertyName>OBJECTID</PropertyName><Literal>' + sigmentIds[i] + '</Literal></PropertyIsEqualTo>';
            }
            xml += '</Or></Filter>';*/
            return temp;
        }
         /*
        * 构建道路查询
        * @method buildFilterByRoadIds
        * @param  {String} roadIds 道路id数组
        * @return  {Object}  [{"propertyName":"ROAD_ID","value":roadId}]
        */
        ,buildFilterByRoadIds: function (roadIds) {
        	var temp = [];
        		 for (var i = 0; i < roadIds.length; i++) {
        		 	temp.push({"propertyName":"ROAD_ID","value":roadIds[i]});
        		}
            /*var xml = '<Filter xmlns="http://www.opengis.net/ogc"><Or>';
            for (var i = 0; i < roadIds.length; i++) {
                xml += '<PropertyIsEqualTo><PropertyName>ROAD_ID</PropertyName><Literal>' + roadIds[i] + '</Literal></PropertyIsEqualTo>';
            }
            xml += '</Or></Filter>';*/
            return temp;
        }
    };
    return OpenMap;
}));
/**
 * 为聚合图层画canvas图
 * @method dcanvas
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

/**
 * 为聚合图层画canvas图
 * @method dcanvas
 * @param {*} ele
 * @param {*} data
 */
function dcanvasCircle(ele, data) {
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
        context.arc(x, y, rI, -Math.PI / 2, Math.PI * 2 - Math.PI / 2);
        context.stroke();
    }

    //在中间写字
    context.font = "9pt Arial";
    context.fillStyle = '#000';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.moveTo(x, y);
    context.fillText(data.size, x, y);
    return canvas;
}