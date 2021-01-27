import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { ConfigService } from '@gsrs-core/config';
import { BaseHttpService } from '@gsrs-core/base';
import { PagingResponse } from '@gsrs-core/utils';
import { Impurities, ImpuritiesUnspecified, ImpuritiesTotal, ValidationResults, IdentityCriteria } from '../model/impurities.model';
import { map, switchMap } from 'rxjs/operators';
import { FacetParam, FacetHttpParams, FacetQueryResponse } from '@gsrs-core/facets-manager';
import { Facet } from '@gsrs-core/facets-manager';

@Injectable(
  {
    providedIn: 'root',
  }
)

export class ImpuritiesService extends BaseHttpService {

  totalRecords: 0;
  impurities: Impurities;

  constructor(
    public http: HttpClient,
    public configService: ConfigService
  ) {
    super(configService);
  }

  loadImpurities(impurities?: Impurities): void {
    // if Update/Exist Impurity
    if (impurities != null) {
      this.impurities = impurities;
    } else {
      this.impurities = {
        impuritiesDetailsList: [],
        impuritiesUnspecifiedList: [],
        impuritiesTotal: {}
      };
    }
  }

  getSubstanceImpurities(
    substanceUuid: string, page: number, pageSize: number
  ): Observable<Array<any>> {

    const func = this.baseUrl + 'impuritiesListBySubstanceUuid?substanceUuid=';
    const url = func + substanceUuid + '&page=' + (page + 1) + '&pageSize=' + pageSize;

    return this.http.get<Array<any>>(url).pipe(
      map(results => {
        this.totalRecords = results['totalRecords'];
        return results['data'];
      })
    );
  }

  getImpuritiesListExportUrl(substanceId: string): string {
    return this.baseUrl + 'impuritiesListExport?substanceId=' + substanceId;
  }

  getImpurities(id: string): Observable<any> {
    const url = this.apiBaseUrl + `impurities(${id})`;
  
    return this.http.get<Impurities>(url)
      .pipe(
        map(result => {
          return result;
        })
      );
  }

  saveImpurities(): Observable<Impurities> {
    const url = this.apiBaseUrl + `impurities`;
    const params = new HttpParams();
    const options = {
      params: params,
      type: 'JSON',
      headers: {
        'Content-type': 'application/json'
      }
    };
    //  console.log('APP: ' + this.application);

    // Update Impurity
    if ((this.impurities != null) && (this.impurities.id)) {
      return this.http.put<Impurities>(url, this.impurities, options);
    } else {
      // Save New Impurities
      return this.http.post<Impurities>(url, this.impurities, options);
    }
  }

  validateImpurities(): Observable<ValidationResults> {
    return new Observable(observer => {
      this.validateImpur().subscribe(results => {
        observer.next(results);
        observer.complete();
      }, error => {
        observer.error();
        observer.complete();
      });
    });
  }

  validateImpur(): Observable<ValidationResults> {
    const url = `${this.configService.configData.apiBaseUrl}api/v1/impurities/@validate`;
    return this.http.post(url, this.impurities);
  }

  deleteApplication(): Observable<any> {
    const url = this.apiBaseUrl + 'impurities(' + this.impurities.id + ')';
    const params = new HttpParams();
    const options = {
      params: params
    };
    const x = this.http.delete<Impurities>(url, options);
    return x;
  }

  getJson() {
    return this.impurities;
  }

  addNewTest(): void {
  //  const newTest: ImpurityTest = {};
   // this.impurity.impurityTestList.unshift(newTest);
  }

  addNewImpurities(): void {
  //  const newImpurities: Impurities = {};
  //  this.impurities.impuritiesList.unshift(newImpurities);
  }
  
  addNewImpuritiesUnspecified(): void {
    const newImpuritiesUnspec: ImpuritiesUnspecified = {identityCriteriaList: []};
    this.impurities.impuritiesUnspecifiedList.unshift(newImpuritiesUnspec);
  }
  
  addNewIdentityCriteriaUnspecified(impuritiesUnspecifiedIndex: number) {
    const newIdentityCriteria: IdentityCriteria = {};
    this.impurities.impuritiesUnspecifiedList[impuritiesUnspecifiedIndex].identityCriteriaList.unshift(newIdentityCriteria);
  }

  addNewImpuritiesTotal(): void {
    const newImpuritiesTotal: ImpuritiesTotal = {limit: 'test'};
  //  this.impurities.impuritiesTotalList.unshift(newImpuritiesTotal);
  }
  
  deleteImpuritiesDetails(impuritiesDetailsIndex: number): void {
    this.impurities.impuritiesDetailsList.splice(impuritiesDetailsIndex, 1);
  }

  deleteIdentityCriteria(impuritiesDetailsIndex: number, identityCriteriaIndex: number): void {
    this.impurities.impuritiesDetailsList[impuritiesDetailsIndex].identityCriteriaList.splice(identityCriteriaIndex, 1);
  }

  deleteIdentityCriteriaUnspecified(impuritiesUnspecifiedIndex: number, identityCriteriaIndex: number): void {
    this.impurities.impuritiesUnspecifiedList[impuritiesUnspecifiedIndex].identityCriteriaList.splice(identityCriteriaIndex, 1);
  }

  deleteImpuritiesUnspecified(impuritiesUnspecifiedIndex: number): void {
    this.impurities.impuritiesUnspecifiedList.splice(impuritiesUnspecifiedIndex, 1);
  }

  getRelationshipImpurity(
    substanceId: string
  ): Observable<any> {
    const url = this.baseUrl + 'getRelationshipImpurity?substanceId=' + substanceId;
    return this.http.get<any>(url).pipe(
      map(results => {
        return results;
      })
    );
  }

  getSubstanceDetailsBySubstanceId(
    substanceId: string
  ): Observable<any> {
    const url = this.baseUrl + 'getSubstanceDetailsBySubstanceId?substanceId=' + substanceId;
    return this.http.get<any>(url).pipe(
      map(results => {
        return results;
      })
    );
  }

} // class
