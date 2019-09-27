import { Component, OnInit } from '@angular/core';
import { ClinicalTrialService } from '../clinical-trial/clinical-trial.service';
import { ClinicalTrial } from '../clinical-trial/clinical-trial.model';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ConfigService } from '@gsrs-core/config';
import * as _ from 'lodash';
import { LoadingService } from '@gsrs-core/loading';
import { MainNotificationService } from '@gsrs-core/main-notification';
import { AppNotification, NotificationType } from '@gsrs-core/main-notification';
import {AuthService} from '@gsrs-core/auth/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-clinical-add',
  templateUrl: './clinical-trial-add.component.html',
  styleUrls: ['./clinical-trial-add.component.scss']
})
export class ClinicalTrialAddComponent implements OnInit {
  public clinicalTrials: Array<ClinicalTrial>;
  // public facets: Array<Facet> = [];
  // private _facetParams: { [facetName: string]: { [facetValueLabel: string]: boolean } } = {};
  isTesting: Boolean = false;
  isLoading = true;
  isError = false;
  canEdit: boolean;
  json: String = '';

  constructor(
    private clinicalTrialService: ClinicalTrialService,
    private sanitizer: DomSanitizer,
    public configService: ConfigService,
    private loadingService: LoadingService,
    private notificationService: MainNotificationService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    const _roles = ['admin'];
    // this.authService.hasRolesAsync(..._roles).subscribe(response => {
    this.authService.hasRolesAsync('Admin').subscribe(response => {
      this.canEdit = response;
      console.log('clinical-trial-add canEdit: ' + this.canEdit);
    });
  }

 addClinicalTrial() {
    this.loadingService.setLoading(true);
    // console.log("xyz");
    // console.log(this.json);

    this.clinicalTrialService.addClinicalTrial(this.json)
      .subscribe(result => {
        this.isError = false;
        const notification: AppNotification = {
          message: 'You added a clinical trial record.',
          type: NotificationType.success,
          milisecondsToShow: 6000
        };
        this.isError = false;
        this.isLoading = false;
        this.loadingService.setLoading(this.isLoading);
        this.notificationService.setNotification(notification);
        // this.searchClinicalTrials();

      }, error => {
        const notification: AppNotification = {
          message: 'There was an error trying to add a clinical trial.',
          type: NotificationType.error,
          milisecondsToShow: 6000
        };
        this.isError = true;
        this.isLoading = false;
        this.loadingService.setLoading(this.isLoading);
        this.notificationService.setNotification(notification);
      }, () => {
        this.isLoading = false;
        this.loadingService.setLoading(this.isLoading);
      });
  }
  updateClinicalTrial() {
    this.loadingService.setLoading(true);
    if (this.isTesting) {
      console.log('xyz');
      console.log(this.json);
    }
    this.clinicalTrialService.updateClinicalTrial(this.json)
      .subscribe(result => {
        this.isError = false;
        const i = 0;
        const notification: AppNotification = {
          message: 'You updated a clinical trial record.',
          type: NotificationType.success,
          milisecondsToShow: 6000
        };
        this.isError = false;
        this.isLoading = false;
        this.loadingService.setLoading(this.isLoading);
        this.notificationService.setNotification(notification);
        // this.searchClinicalTrials();

      }, error => {
        const notification: AppNotification = {
          message: 'There was an error trying to update a clinical trial.',
          type: NotificationType.error,
          milisecondsToShow: 6000
        };
        this.isError = true;
        this.isLoading = false;
        this.loadingService.setLoading(this.isLoading);
        this.notificationService.setNotification(notification);
      }, () => {
        this.isLoading = false;
        this.loadingService.setLoading(this.isLoading);
      });
  }
}
