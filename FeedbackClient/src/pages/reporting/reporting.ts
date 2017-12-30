import { Component } from '@angular/core';
import { AlertController , NavController} from 'ionic-angular';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map'

@Component({
  selector: 'page-reporting',
  templateUrl: 'reporting.html'
})
export class ReportingPage {

  Feedback = {};
  orgList: string[];
  restUri = 'http://localhost:3000/';//'http://52.91.203.160:3000/'; 

  constructor(private navCtrl:NavController, private http: Http, private alertCtrl: AlertController) {
    (this.Feedback as any).Org = "UAE Gov";
    (this.Feedback as any).IsAnonymous = true;
    (this.Feedback as any).Sentiment = 'Negative';

    this.orgList = [
      "UAE Gov",
      "Dubai Police",
      "Dubai Ministers",
      "Abu Dhabi Police"
    ];
  }

  createIncident() {
    //console.log(this.Incident);
    let headers = new Headers();
    headers.append('Content-Type', 'application/json; charset=UTF-8');
    
    var data = {
      IsAnonymous: (this.Feedback as any).IsAnonymous,
      Description: (this.Feedback as any).Description,
      Org: (this.Feedback as any).Org
    };
    
    this.http.post(this.restUri + 'createFeedback', this.Feedback, {headers: headers})
    .subscribe(
      data => {
        let alert = this.alertCtrl.create({
          title: 'Feedback Received',
          subTitle: 'Thank you for providing your feedback, \n We will look into this.',
          buttons: [
            {
              text: 'Ok',
              handler: () => {
                this.navCtrl.setRoot(this.navCtrl.getActive().component);
              }
            }
          ]
        });
        alert.present();
        console.log('success');
      },
      err => {
        let alert = this.alertCtrl.create({
          title: 'Failed',
          subTitle: 'Please try after sometime!!',
          buttons: [
            {
              text: 'Ok',
              handler: () => {
                this.navCtrl.setRoot(this.navCtrl.getActive().component);
              }
            }
          ]
        });
        alert.present();
        console.log('errrrrr');
      });
  }

  clearForm() {
    this.navCtrl.setRoot(this.navCtrl.getActive().component);
  }
}
