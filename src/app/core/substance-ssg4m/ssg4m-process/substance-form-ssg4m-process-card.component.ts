import { Component, OnInit, AfterViewInit, OnDestroy, Input } from '@angular/core';
import { ScrollToService } from '../../scroll-to/scroll-to.service';
import { Subscription } from 'rxjs';
import { GoogleAnalyticsService } from '../../google-analytics/google-analytics.service';
import { SubstanceCardBaseFilteredList, SubstanceCardBaseList } from '../../substance-form/base-classes/substance-form-base-filtered-list';
import { SubstanceFormService } from '../../substance-form/substance-form.service';
import { SubstanceFormSsg4mProcessService } from './substance-form-ssg4m-process.service';
import { SpecifiedSubstanceG4mProcess } from '@gsrs-core/substance/substance.model';

@Component({
  selector: 'app-substance-form-ssg4m-process-card',
  templateUrl: './substance-form-ssg4m-process-card.component.html',
  styleUrls: ['./substance-form-ssg4m-process-card.component.scss']
})

export class SubstanceFormSsg4mProcessCardComponent extends SubstanceCardBaseFilteredList<SpecifiedSubstanceG4mProcess>
  implements OnInit, AfterViewInit, OnDestroy, SubstanceCardBaseList {

  process: Array<SpecifiedSubstanceG4mProcess>;
  private subscriptions: Array<Subscription> = [];
  showAdvancedSettings = false;

  constructor(
    private substanceFormSsg4mProcessService: SubstanceFormSsg4mProcessService,
    private scrollToService: ScrollToService,
    public gaService: GoogleAnalyticsService
  ) {
    super(gaService);
  //  this.analyticsEventCategory = 'substance form ssg4m process';
  }

  ngOnInit() {
    this.canAddItemUpdate.emit(true);
    this.menuLabelUpdate.emit('Process');
  }

  ngAfterViewInit() {
    const processSubscription = this.substanceFormSsg4mProcessService.specifiedSubstanceG4mProcess.subscribe(process => {
      this.process = process;
      this.filtered = process;
      /*
      const searchSubscription = this.searchControl.valueChanges.subscribe(value => {
        this.filterList(value, this.notes, this.analyticsEventCategory);
      }, error => {
        console.log(error);
      });
      */
   //   this.subscriptions.push(searchSubscription);
      this.page = 0;
      this.pageChange();
    });
    this.subscriptions.push(processSubscription);
  }

  ngOnDestroy() {
    this.componentDestroyed.emit();
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
  }

  addItem(): void {
    this.addProcess();
  }

  addProcess(): void {
    this.substanceFormSsg4mProcessService.addProcess();
    setTimeout(() => {
      this.scrollToService.scrollToElement(`substance-process-0`, 'center');
    });
  }

  deleteProcess(process: SpecifiedSubstanceG4mProcess): void {
    this.substanceFormSsg4mProcessService.deleteProcess(process);
  }

  updateProcess($event) {

  }

  updateAdvancedSettings(event): void {
    this.showAdvancedSettings = event.checked;
  }
}
