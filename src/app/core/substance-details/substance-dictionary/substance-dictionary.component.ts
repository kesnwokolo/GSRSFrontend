import { Component, OnInit, Input, Output, EventEmitter, ComponentFactoryResolver, Inject, ViewChild } from '@angular/core';
import {
  SubstanceDetail,
  SubstanceBase,
  SubstanceName,
  SubstanceSummary,
  SubstanceCode,
  SubstanceRelationship,
  Subunit
} from '../../substance/substance.model';
import { DYNAMIC_COMPONENT_MANIFESTS, DynamicComponentManifest } from '@gsrs-core/dynamic-component-loader';
import { CardDynamicSectionDirective } from '../../substances-browse/card-dynamic-section/card-dynamic-section.directive';
import { UtilsService } from '../../utils/utils.service';
import { SafeUrl } from '@angular/platform-browser';
import { GoogleAnalyticsService } from '@gsrs-core/google-analytics';
import { AuthService } from '@gsrs-core/auth';
import { SubstanceService } from '@gsrs-core/substance/substance.service';
import { StructureService } from '@gsrs-core/structure';
import { SubstanceSummaryDynamicContent } from '../../substances-browse/substance-summary-card/substance-summary-dynamic-content.component';
import {Router} from '@angular/router';
import {Alignment} from '@gsrs-core/utils';
import { take } from 'rxjs/operators';
import {Subject} from 'rxjs';
import { SubstanceCardBaseFilteredList } from '../substance-card-base-filtered-list';
import { GeneralService } from 'src/app/fda/service/general.service';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';


@Component({
  selector: 'substance-dictionary-component',
  templateUrl: './substance-dictionary.component.html',
  styleUrls: ['./substance-dictionary.component.scss']
})
export class SubstanceDictionaryComponent extends SubstanceCardBaseFilteredList<SubstanceDetail> implements OnInit {
  private privateSubstance: SubstanceDetail;
  @Output() openImage = new EventEmitter<SubstanceSummary>();
  @Input() showAudit: boolean;
  isAdmin = false;
  subunits?: Array<Subunit>;
  @ViewChild(CardDynamicSectionDirective, {static: true}) dynamicContentContainer: CardDynamicSectionDirective;
  @Input() names?: Array<SubstanceName>;
  @Input() codeSystemNames?: Array<string>;
  @Input() codeSystems?: { [codeSystem: string]: Array<SubstanceCode> };
  alignments?: Array<Alignment>;
  inxightLink = false;
  inxightUrl: string;
  substanceUpdated = new Subject<SubstanceDetail>();
  innName: string;
  usanName: string;
  banName: string;
  pronName: string;

  constructor(
    public utilsService: UtilsService,
    public gaService: GoogleAnalyticsService,
    public authService: AuthService,
    private substanceService: SubstanceService,
    private structureService: StructureService,
    private componentFactoryResolver: ComponentFactoryResolver,
    private router: Router,
    @Inject(DYNAMIC_COMPONENT_MANIFESTS) private dynamicContentItems: DynamicComponentManifest<any>[]
  ) { 
    super(gaService);
  }

  ngOnInit() {
    console.log('ngOnInit');
    this.substanceUpdated.subscribe(substance => {
      console.log('subscribe.  substance:' + substance);
      this.substance = substance;
      this.finishiInit();
    });
    this.authService.hasAnyRolesAsync('Updater', 'SuperUpdater').pipe(take(1)).subscribe(response => {
      if (response) {
        this.isAdmin = response;
      }
    });
  }

  finishiInit() {
    if (this.substance.protein) {
      this.subunits = this.substance.protein.subunits;
      this.getAlignments();
    }
    if (this.substance.nucleicAcid) {
      this.subunits = this.substance.nucleicAcid.subunits;
      this.getAlignments();
    }

    if (this.substance.structure && this.substance.structure.formula) {
      this.substance.structure.formula = this.structureService.formatFormula(this.substance.structure);
    }
    if (this.substance.approvalID) {
      this.substanceService.hasInxightLink(this.substance.approvalID).subscribe(response => {
        if (response.total && response.total > 0) {
          this.inxightLink = true;
          this.inxightUrl = 'https://drugs.ncats.io/drug/' + this.substance.approvalID;
        }
      }, error => {});
    } else {
      this.getApprovalID();
    }
    this.innName = '';
    this.pronName='';
    this.banName='';
    this.usanName='';

    this.substance.names.forEach(name => {
      //console.log('name.name: ' + name.name);
      if (name.name.toUpperCase().endsWith('[INN]') ) {
        console.log('found our innName');
        this.innName = name.name;
      } else if(name.name.toUpperCase().endsWith('[USAN]')){
        this.usanName=name.name;
      } else if(name.name.toUpperCase().endsWith('[BAN]')){
        this.banName=name.name;
      } else if(name.type.toUpperCase()==='PRON'){
        this.pronName=name.name;
      }
    });

  }
  getApprovalID() {
    if (!this.substance.approvalID) {
      if (this.substance._approvalIDDisplay &&
         this.substance._approvalIDDisplay.length === 10 &&
        this.substance._approvalIDDisplay.indexOf(' ') < 0) {
          this.substance.approvalID = this.substance._approvalIDDisplay;
      }
    }
  }

/*  @Input()
  set substance(substance: SubstanceDetail) {
    if (substance != null) {
      this.privateSubstance = substance;
      this.substance=substance;
      this.loadDynamicContent();
    }
  }*/

  getSubstanceDetails(id: string, version?: string) {
    this.substanceService.getSubstanceDetails(id, version).subscribe(response => {
      if (response) {
        //this.substance = response;
        this.substanceUpdated.next(response);
        
      } else {
        //this.handleSubstanceRetrivalError();
      }
      //this.loadingService.setLoading(false);
    }, error => {
      this.gaService.sendException('getSubstanceDetails: error from API call');
//      this.loadingService.setLoading(false);
//      this.handleSubstanceRetrivalError();
    });
  }


  /*get substance(): SubstanceDetail {
    return this.privateSubstance;
  }*/

  openImageModal(): void {
    this.openImage.emit(this.substance);
  }

  editForm(): void {
    this.router.navigate(['/substances/' + this.substance.uuid + '/edit']);
  }
  getFasta(id: string, filename: string): void {
    this.substanceService.getFasta(id).subscribe(response => {
      this.downloadFile(response, filename);
    });
  }

  getMol(id: string, filename: string): void {
    this.structureService.downloadMolfile(id).subscribe(response => {
      this.downloadFile(response, filename);
    });
  }

  downloadFile(response: any, filename: string): void {
    const dataType = response.type;
    const binaryData = [];
    binaryData.push(response);
    const downloadLink = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(new Blob(binaryData, { type: dataType }));
    downloadLink.setAttribute('download', filename);
    document.body.appendChild(downloadLink);
    downloadLink.click();
  }

  loadDynamicContent(): void {
    const viewContainerRef = this.dynamicContentContainer.viewContainerRef;
    viewContainerRef.clear();
    const dynamicContentItemsFlat =  this.dynamicContentItems.reduce((acc, val) => acc.concat(val), [])
    .filter(item => item.componentType === 'summary');
    dynamicContentItemsFlat.forEach(dynamicContentItem => {
      const componentFactory = this.componentFactoryResolver.resolveComponentFactory(dynamicContentItem.component);
      const componentRef = viewContainerRef.createComponent(componentFactory);
      (<SubstanceSummaryDynamicContent>componentRef.instance).substance = this.privateSubstance;
    });
  }

  getAlignments(): void {
    if (this.substance._matchContext) {
      if (this.substance._matchContext.alignments) {
        this.alignments = this.substance._matchContext.alignments;
        this.alignments.forEach(alignment => {
          this.subunits.forEach(subunit => {
            if (subunit.uuid === alignment.id) {
              alignment.subunitIndex = subunit.subunitIndex;
            }
          });
        });
      }
    }
  }
}
