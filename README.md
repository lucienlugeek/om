# om

Simple framework based on openlayers v4.0.1 and jQuery.

## 1. Prerequisite

You need to include [openlayers](https://github.com/openlayers/openlayers) library and [jQuery](https://github.com/jquery/jquery) first.This repo is just a simple package for easily using openlayers.

## 2. Use it

```javascript
var proj = new ol.proj.Projection({
            code: 'EPSG:4490',
            units: 'degrees',
        });
var mapOptions = {
    center: [121.84059516385024, 29.902349218390047],//lontitude and latitude
    layers: layerObject,
    zoom: 15,
    projection: proj
};
//mapId represents map container div's id
var map = new OpenMap('mapId',mapOptions);
```
