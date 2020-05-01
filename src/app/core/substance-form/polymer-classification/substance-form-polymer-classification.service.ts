import { Injectable } from '@angular/core';
import { SubstanceFormServiceBase } from '../base-classes/substance-form-service-base';
import { SubstanceFormService } from '../substance-form.service';
import { ReplaySubject, Observable } from 'rxjs';
import { PolymerClassification } from '@gsrs-core/substance/substance.model';

@Injectable({
  providedIn: 'root'
})
export class SubstanceFormPolymerClassificationService extends SubstanceFormServiceBase {

  constructor(
    private substanceFormService: SubstanceFormService
  ) {
    super(substanceFormService);
    this.propertyEmitter = new ReplaySubject<Array<PolymerClassification>>();
    const subscription = this.substanceFormService.substance.subscribe(substance => {
      this.substance = substance;
      if (this.substance.polymer) {
        if (this.substance.polymer.classification == null) {
          this.substance.polymer.classification = {};
        }
        this.substanceFormService.resetState();
        this.propertyEmitter.next(this.substance.polymer.classification);
      }
    });
    this.subscriptions.push(subscription);
  }

  get substancePolymerClassification(): Observable<PolymerClassification> {
    return this.propertyEmitter.asObservable();
  }
}
