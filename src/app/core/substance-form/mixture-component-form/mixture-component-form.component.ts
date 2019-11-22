import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MixtureComponents, SubstanceRelated, SubstanceSummary} from '@gsrs-core/substance';
import {ControlledVocabularyService, VocabularyTerm} from '@gsrs-core/controlled-vocabulary';
import {Subscription} from 'rxjs';
import {MatDialog} from '@angular/material/dialog';
import {UtilsService} from '@gsrs-core/utils';
import {OverlayContainer} from '@angular/cdk/overlay';
import {SubstanceFormService} from '@gsrs-core/substance-form/substance-form.service';
import {AmountFormDialogComponent} from '@gsrs-core/substance-form/amount-form-dialog/amount-form-dialog.component';

@Component({
  selector: 'app-mixture-component-form',
  templateUrl: './mixture-component-form.component.html',
  styleUrls: ['./mixture-component-form.component.scss']
})
export class MixtureComponentFormComponent implements OnInit {
  private privateComp: MixtureComponents;
  @Output() componentDeleted = new EventEmitter<MixtureComponents>();
  deleteTimer: any;
  relatedSubstanceUuid: string;
  private subscriptions: Array<Subscription> = [];
  private overlayContainer: HTMLElement;
  siteDisplay: string;

  constructor(
    private cvService: ControlledVocabularyService,
    private dialog: MatDialog,
    private utilsService: UtilsService,
    private overlayContainerService: OverlayContainer
  ) { }
  ngOnInit() {
    this.overlayContainer = this.overlayContainerService.getContainerElement();
  }

  @Input()
  set component(component: MixtureComponents) {
    this.privateComp = component;
    if(this.privateComp.substance){
      this.relatedSubstanceUuid = this.privateComp.substance.refuuid;
    }

  }

  get component(): MixtureComponents {
    return this.privateComp;
  }

  updateType(event: any): void {
    this.privateComp.type = event;
  }


  deleteComponent(): void {
    this.privateComp.$$deletedCode = this.utilsService.newUUID();
    if (!this.privateComp
    ) {
      this.deleteTimer = setTimeout(() => {
        this.componentDeleted.emit(this.privateComp);
      }, 2000);
    }
  }

  undoDelete(): void {
    clearTimeout(this.deleteTimer);
    delete this.privateComp.$$deletedCode;
  }

  componentUpdated(substance: SubstanceSummary): void {
    const relatedSubstance: SubstanceRelated = {
      refPname: substance._name,
      name: substance._name,
      refuuid: substance.uuid,
      substanceClass: 'reference',
      approvalID: substance.approvalID
    };
    this.component.substance = relatedSubstance;
    this.relatedSubstanceUuid = this.component.substance.refuuid;
  }

}
