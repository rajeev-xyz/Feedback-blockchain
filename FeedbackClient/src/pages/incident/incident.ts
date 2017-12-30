import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';


@Component({
  selector: 'page-incident',
  templateUrl: 'incident.html',
})
export class IncidentPage {
  Feedback = {};
  orgList: string[];

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    console.log('getting navparams ' + JSON.stringify(this.Feedback));
    this.Feedback = this.navParams.data;

    this.orgList = [
      "UAE Gov",
      "Dubai Police",
      "Dubai Ministers",
      "Abu Dhabi Police"
    ];
  }
}
