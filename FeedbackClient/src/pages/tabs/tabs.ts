import { Component } from '@angular/core';

import { ReportingPage } from '../reporting/reporting';
import { IncidentsPage } from '../incidents/incidents';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = ReportingPage;
  tab2Root = IncidentsPage;
  
  constructor() {

  }
}
