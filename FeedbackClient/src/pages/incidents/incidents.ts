import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map'
import { IncidentPage } from '../incident/incident';


@Component({
  selector: 'page-incidents',
  templateUrl: 'incidents.html'
})
export class IncidentsPage {
  Feedbacks = [];
  restUri = 'http://localhost:3000/';//'http://52.91.203.160:3000/';//;

  constructor(private navCtrl: NavController,private http: Http) {
    
  }

  // Runs when the page is about to enter and become the active page.
  ionViewWillEnter(){
    this.http.get(this.restUri + 'allFbForAllOrg')
    .map(res => res.json())
    .subscribe(
      (data) => {
      this.Feedbacks = data;
      console.log(this.Feedbacks);
    },(err) => {
      console.log('Error in get request ' + err.message );
    }); 
  }

  showIncidentDetails(Feedback){
   console.log('showing ' + Feedback);
   this.navCtrl.push(IncidentPage, Feedback); 
  }
}
