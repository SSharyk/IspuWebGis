﻿import { Injectable, ElementRef, NgZone } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { EsriLoaderService } from 'angular-esri-loader';
import { Observable } from "rxjs/Observable";
import { Observer } from "rxjs/Observer";

@Injectable()
export class EsriMapService {
    
    private readonly arcgisJSAPIUrl = 'https://js.arcgis.com/4.5/';
    private _mapView: __esri.MapView;
    public baseMap: __esri.Map;
    constructor(private esriLoaderService: EsriLoaderService, private _zone: NgZone) { }

    createMap(mapViewProperties: __esri.MapViewProperties): Promise<void> {
        return this.esriLoaderService.load({ url: this.arcgisJSAPIUrl }).then(() => {
            return this.esriLoaderService.loadModules([
                'esri/Map',
                'esri/views/MapView',
                "esri/Basemap",
            ]).then(([Map, MapView, Basemap]:
                [__esri.MapConstructor,
                __esri.MapViewConstructor,
                __esri.BasemapConstructor
            ]) => {    
                var mapProperties: __esri.MapProperties = {};
                let basemap: __esri.Basemap = Basemap.fromId('streets');
                mapProperties.basemap = basemap;          
                let createdMap = new Map(mapProperties);
                mapViewProperties.zoom = 16;
                mapViewProperties.map = createdMap;
                this.baseMap = createdMap;
                this._mapView = new MapView(mapViewProperties);
                return;
            });
        });
       
    }

    getCenter(): Promise<__esri.Point> {
        return new Promise<__esri.Point>((resolve, reject) => {
            resolve(this._mapView.center);
        });
    }

    subscribeToMapEvent<E>(eventName: string): Observable<E> {
        return Observable.create((observer: Observer<E>) => {
            this._mapView.on(eventName, (arg: E) => {
                this._zone.run(() => observer.next(arg));
            });
        });
    }
    
    addMarkers(x: number, y: number): number[] { // method creates three random markers within Ivanovo
        var arrayOfMarkers = new Array();
        this.esriLoaderService.load({ url: this.arcgisJSAPIUrl }).then(() => {
            this.esriLoaderService.loadModules([
                'esri/symbols/SimpleMarkerSymbol',
                "esri/Graphic",
            ]).then(([SimpleMarkerSymbol, Graphic]) => {
                this._mapView.graphics.removeAll();
                var new_x = x, new_y = y;
                for (var i = 0; i < 3; i++) {
                    new_x = Math.random() * ((x + 0.021) - (x - 0.027)) + (x - 0.027);
                    new_y = Math.random() * ((y + 0.021) - (y - 0.027)) + (y - 0.027);
                    var p = [new_x, new_y];
                    var point = {
                        type: "point", // autocasts as new Point()
                        longitude: new_x,
                        latitude: new_y,
                    };
                    var pointGraphic = new Graphic({
                        geometry: point,
                        symbol: {
                            type: "simple-marker",  // autocasts as new SimpleMarkerSymbol()
                            style: "circle",
                            color: "#D41F67",
                            size: 16,
                            xoffset: new_x,
                            yoffset: new_y,
                        }
                    });
                    this._mapView.graphics.add(pointGraphic);
                    arrayOfMarkers[i] = p;
                    new_x = x;
                    new_y = y;

                }               
            });
        });
        return arrayOfMarkers;
    }
}

