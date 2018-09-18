import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { BrowseSubstanceComponent } from './browse-substance.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { ActivatedRouteStub } from '../../testing/activated-route-stub';
import { SubstanceService } from '../substance/substance.service';
import { ConfigService } from '../config/config.service';
import { LoadingService } from '../loading/loading.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SubstanceListData } from '../../testing/substance-list-test-data';
import { of, throwError } from 'rxjs';
import { asyncData, asyncError } from '../../testing/async-observable-helpers';

describe('BrowseSubstanceComponent', () => {
  let component: BrowseSubstanceComponent;
  let fixture: ComponentFixture<BrowseSubstanceComponent>;
  let activatedRouteStub: Partial<ActivatedRoute>;
  let getSubtanceDetailsSpy: jasmine.Spy;

  beforeEach(async(() => {

    activatedRouteStub = new ActivatedRouteStub({ 'search_term': '' });

    const substanceServiceSpy = jasmine.createSpyObj('SubstanceService', ['getSubtanceDetails']);
    getSubtanceDetailsSpy = substanceServiceSpy.getSubtanceDetails.and.returnValue(asyncData(SubstanceListData));

    const configServiceSpy = jasmine.createSpyObj('ConfigService', ['configData']);
    const loadingServiceSpy = jasmine.createSpyObj('LoadingService', ['setLoading']);

    TestBed.configureTestingModule({
      imports: [
        MatExpansionModule,
        MatCheckboxModule,
        MatSidenavModule,
        MatCardModule,
        MatChipsModule,
        MatBadgeModule,
        HttpClientTestingModule,
        BrowserAnimationsModule
      ],
      declarations: [
        BrowseSubstanceComponent
      ],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: SubstanceService, useValue: substanceServiceSpy },
        { provide: ConfigService, useValue: configServiceSpy },
        { provide: LoadingService, useValue: loadingServiceSpy }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrowseSubstanceComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('before OnInit, component properties should not contain a value', () => {
    expect(component.substances).toBeUndefined('substances should not be initialized');
    expect(component.facets).toBeUndefined('facets should not be initialized');
    expect(component.searchTerm).toBeUndefined('searchTerm should not be initialized');
    expect(component.facetParams).toEqual({}, 'facetParams should be an empty object');
  });

  it('OnInit, searchTerm should be initialized and getSubstanceDetails should be called', () => {
    fixture.detectChanges();
    expect(component.searchTerm).toBeDefined('searchTerm should be initialized');
    expect(getSubtanceDetailsSpy.calls.any()).toBe(true, 'getSubtanceDetails called');
  });

  describe('after OnInit called', () => {

    beforeEach(() => {
      fixture.detectChanges(); // ngOnInit()
    });

    it('should initialize substances and facets after getSubstanceDetails (async)', async(() => {
      fixture.whenStable().then(() => { // wait for async getSubstanceDetails
        fixture.detectChanges();
        expect(component.substances).toBeDefined('substances should be initialized');
        expect(component.facets).toBeDefined('facets should be initialized');
      });
    }));

    it('if facets returned from API, only the top 10 should be displayed ordered by total count in a descending order', async(() => {
      fixture.whenStable().then(() => { // wait for async getSubstanceDetails
        fixture.detectChanges();
        const facetElements: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('mat-expansion-panel');
        if (component.facets && component.facets.length > 0) {
          expect(facetElements.length).toBeGreaterThan(0, 'facets should be displayed');
          expect(facetElements.length).toBeLessThanOrEqual(10, 'up to 10 facets should be displayed');
          let isInOrder = true;
          const valueTotals = [];
          Array.from(facetElements).forEach((facetElement: HTMLElement, index: number) => {
            valueTotals[index] = 0;
            const valuesElements = facetElement.querySelectorAll('.facet-value-count');
            Array.from(valuesElements).forEach((valueElement: HTMLElement) => {
              valueTotals[index] += Number(valueElement.innerHTML);
            });
            if (index > 0 && valueTotals[index] > valueTotals[index - 1]) {
              isInOrder = false;
            }
          });
          expect(isInOrder).toBe(true, 'facets should be in order');
        } else {
          expect(facetElements.length).toEqual(0, 'facets should not be displayed');
        }
      });
    }));

    it('if substances returned from API, they should be displayed along with properties in the main section of page', async(() => {
      fixture.whenStable().then(() => { // wait for async getSubstanceDetails
        fixture.detectChanges();

        const substanceElements: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('mat-card');

        if (component.substances && component.substances.length > 0) {

          expect(substanceElements.length).toBeGreaterThan(0, 'substances should be displayed');

          Array.from(substanceElements).forEach((substanceElement: HTMLElement, index: number) => {

            const substanceName: string = substanceElement.querySelector('.substance-name').innerHTML;
            expect(substanceName).toBeTruthy('structure name should exist');

            const substanceApprovalId: string = substanceElement.querySelector('.approval-id').innerHTML;
            expect(substanceApprovalId).toBeTruthy('structure name should exist');

            if (component.substances[index].structure != null) {
              const structureElement: HTMLElement = substanceElement.querySelector('.structure-container');
              expect(structureElement).toBeTruthy('substance structure area should exist');
              const structureStereochemistry: string = structureElement.querySelector('mat-chip').innerHTML;
              expect(structureStereochemistry).toBeTruthy('substance structure steriochemistry should exist');
            }

            if (component.substances[index].names != null && component.substances[index].names.length) {

              const substanceNamesElement: HTMLElement = substanceElement.querySelector('.substance-names');
              expect(substanceNamesElement).toBeTruthy('substance names area should exist');

              const substanceNamesValuesElements: NodeListOf<HTMLElement> = substanceNamesElement.querySelectorAll('.value');
              expect(substanceNamesValuesElements.length)
                .toBe(
                  component.substances[index].names.length,
                  'substance should have ' + component.substances[index].names.length.toString() + 'names'
                );
              Array.from(substanceNamesValuesElements).forEach((substanceNameValueElement: HTMLElement) => {
                expect(substanceNameValueElement.innerHTML).toBeTruthy('substance name should have a value');
              });
            }

            if (component.substances[index].codeSystems != null && component.substances[index].codeSystems.length) {

              const substanceCodeSystemsElement: HTMLElement = substanceElement.querySelector('.substance-codesystems');
              expect(substanceCodeSystemsElement).toBeTruthy('substance names area should exist');

              const substanceNamesValuesElements: NodeListOf<HTMLElement> = substanceCodeSystemsElement.querySelectorAll('.value');
              expect(substanceNamesValuesElements.length)
                .toBe(
                  component.substances[index].names.length,
                  'substance should have ' + component.substances[index].names.length.toString() + 'names'
                );
              Array.from(substanceNamesValuesElements).forEach((substanceNameValueElement: HTMLElement) => {
                expect(substanceNameValueElement.innerHTML).toBeTruthy('substance name should have a value');
              });
            }
          });
        } else {
          expect(substanceElements.length).toEqual(0, 'substances should not be displayed');
        }
      });
    }));
  });
});
