# OpenMap(om)

Simple package based on openlayers v4.0.1.

## 1. Prerequisite

You need to include [openlayers](https://github.com/openlayers/openlayers) first.This repo is just a simple package for easier to use openlayers.

## 2. Use it

```javascript
var proj = new ol.proj.Projection({
    code: 'EPSG:4490',
    units: 'degrees',
});
var mapOptions = {
    layers: layerObject,
    zoom: 15,
    projection: proj
};
//mapId represents map container div's id
var map = new OpenMap('mapId',mapOptions);
```
