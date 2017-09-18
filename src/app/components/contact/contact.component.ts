import { Component, OnInit } from '@angular/core';

declare var google: any;

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})

export class ContactComponent implements OnInit {
  lat: Number = 43.636782;
  lng: Number = -79.428294;
  zoom: Number = 15;

  stylers: any[] = [
    { hue: '#FFAC6E' },
    { visibility: 'simplified' },
    { gamma: 0.5 },
    { weight: 0.5 }
  ];

  constructor() { }

  ngOnInit() {
    this.initMap();
  }

  initMap() {
    var customMapType = new google.maps.StyledMapType([
      {
        stylers: this.stylers
      },
      {
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      },
      {
        featureType: 'water',
        stylers: [{ color: '#FFAC6E' }]
      }
    ], {
        name: 'Custom Style'
      });
    var customMapTypeId = 'custom_style';

    var map = new google.maps.Map(document.getElementById('map__google'), {
      center: { lat: this.lat, lng: this.lng },
      zoom: this.zoom,
      mapTypeControlOptions: {
        mapTypeIds: [google.maps.MapTypeId.ROADMAP, customMapTypeId]
      },
      disableDefaultUI: true
    });

    map.mapTypes.set(customMapTypeId, customMapType);
    map.setMapTypeId(customMapTypeId);

    var marker = new google.maps.Marker({
      position: { lat: 43.636782, lng: -79.428294 },
      map: map
    });
  }
}
