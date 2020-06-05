import { Component, OnInit, Input, OnDestroy, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { QueryableSubstanceDictionary, CommandInput, Command } from '../queryable-substance-dictionary.model';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { typeCommandOptions, inputTypes } from './type-command-options.constant';
import { OverlayContainer } from '@angular/cdk/overlay';
import { ControlledVocabularyService, VocabularyTerm } from '@gsrs-core/controlled-vocabulary';
import { QueryStatement } from './query-statement.model';

@Component({
  selector: 'app-query-statement',
  templateUrl: './query-statement.component.html',
  styleUrls: ['./query-statement.component.scss']
})
export class QueryStatementComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() queryStatementHash?: number;
  private _index = 0;
  private _queryableDictionary: QueryableSubstanceDictionary;
  @Output() queryUpdated = new EventEmitter<QueryStatement>();
  private allOptions: Array<string>;
  options: Array<string>;
  queryablePropertiesControl = new FormControl();
  commandControl = new FormControl();
  private subscriptions: Array<Subscription> = [];
  conditionOptions = [
    'AND',
    'OR',
    'NOT'
  ];
  conditionControl = new FormControl();
  selectedCondition = '';
  selectedQueryableProperty: string;
  selectedQueryablePropertyType: string;
  selectedLucenePath: string;
  commandOptions: Array<string>;
  selectedCommandOption: string;
  commandInputs: Array<CommandInput>;
  queryParts: Array<string> = [];
  private typeCommandOptions = typeCommandOptions;
  commandInputValueDict: {[queryablePropertyType: string]: Array<string | Date | number> } = {};
  private overlayContainer: HTMLElement;
  cvOptions: Array<VocabularyTerm>;

  constructor(
    private overlayContainerService: OverlayContainer,
    public cvService: ControlledVocabularyService
  ) {}

  ngOnInit() {
    this.overlayContainer = this.overlayContainerService.getContainerElement();

    inputTypes.forEach(key => {
      this.commandInputValueDict[key] = [];
    });

    const subscription = this.queryablePropertiesControl.valueChanges.subscribe(value => {
      this.queryablePropertySelected(value);
      // this.options = this.allOptions.filter(option => {
      //   return option.toLowerCase().indexOf(value.toLowerCase()) > -1;
      // });
    });
    this.subscriptions.push(subscription);

    const commandSubscription = this.commandControl.valueChanges.subscribe((command: string) => {
      this.setCommand(command);
    });
    this.subscriptions.push(commandSubscription);

    // const types = Object.keys(this.typeCommandOptions);
    // this.setQueryablePropertyType(types[0] as any);

    if (this._index > 0) {
      this.conditionControl.setValue('AND');
      this.selectedCondition = 'AND ';
      const conditionSubscription = this.conditionControl.valueChanges.subscribe((condition: string) => {
        this.selectedCondition = `${condition} `;
      });
      this.subscriptions.push(conditionSubscription);
    }

    let queryStatement: QueryStatement;

    if (this.queryStatementHash) {
      const queryStatementString = localStorage.getItem(this.queryStatementHash.toString());
      if (queryStatementString) {
        queryStatement = JSON.parse(queryStatementString);
      }
    }

    if (queryStatement != null) {
      console.log(queryStatement.queryableProperty);
      const queryablePropertyType = this._queryableDictionary[queryStatement.queryableProperty].type;
      let inputType: string;
      const commandObject = typeCommandOptions[queryablePropertyType][queryStatement.command] as Command;
      if (commandObject.commandInputs) {
        inputType = commandObject.commandInputs[0].type;
        this.commandInputValueDict[inputType] = queryStatement.commandInputValues;
      }
      this.queryParts = queryStatement.queryParts;
      this.conditionControl.setValue(queryStatement.condition.trim(), { emitEvent: false });
      this.selectedCondition = queryStatement.condition;
      this.queryablePropertiesControl.setValue(queryStatement.queryableProperty, { emitEvent: false });
      this.processQueriablePropertyChange(queryStatement.queryableProperty);
      this.commandControl.setValue(queryStatement.command);
    } else {
      this.queryablePropertiesControl.setValue('All');
    }
  }

  ngAfterViewInit() {
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
  }

  @Input()
  set queryableDictionary(queryableSubstanceDictionary: QueryableSubstanceDictionary) {
    if (queryableSubstanceDictionary != null) {
      this._queryableDictionary  = queryableSubstanceDictionary;
    }
  }

  @Input()
  set index(index: number) {
    if (index != null) {
      this._index = index;
      if (this._index === 0 && this.commandInputs) {
        this.selectedCondition = '';
        this.refreshQuery();
      }
    }
  }

  get index(): number {
    return this._index;
  }

  @Input()
  set queryableOptions(options: Array<string>) {
    this.allOptions = options;
    this.options = options;
  }

  private setCommand(command: string): void {
    this.selectedCommandOption = command;
    const commandObj = this.typeCommandOptions[this.selectedQueryablePropertyType][command] as any;
    if (commandObj.commandInputs) {
      this.commandInputs = commandObj.commandInputs;
      this.refreshQuery();
    } else if (commandObj.constructQuery) {
      this.commandInputs = [];
      commandObj.constructQuery(
        command,
        this.selectedCondition,
        this.selectedQueryableProperty,
        this.selectedLucenePath,
        this.queryUpdated,
        this.queryParts
      );
    }
  }

  queryablePropertySelected(queryableProperty: string): void {
    this.processQueriablePropertyChange(queryableProperty);
    this.commandControl.setValue(this.commandOptions[0]);
  }

  private processQueriablePropertyChange(queryableProperty: string): void {
    this.selectedQueryableProperty = queryableProperty;

    if (this._queryableDictionary[queryableProperty].cvDomain) {
      this.setCvOptions(this._queryableDictionary[queryableProperty].cvDomain);
    }
    this.selectedLucenePath = this._queryableDictionary[queryableProperty].lucenePath;
    if (this.selectedLucenePath) {
      this.selectedLucenePath = this.selectedLucenePath + ':';
    }
    this.selectedQueryablePropertyType = this._queryableDictionary[queryableProperty].type;
    this.commandOptions = Object.keys(
      this.typeCommandOptions[this._queryableDictionary[queryableProperty].type]
    ).filter(option => {
      return this._queryableDictionary[queryableProperty].cvDomain || option !== 'the following exact default values';
    }).sort((a, b) => {
      if (a.toLowerCase() < b.toLowerCase()) {
        return -1;
      }
      if (a.toLowerCase() > b.toLowerCase()) {
        return 1;
      }
      return 0;
    });
  }

  setCvOptions(cvDomain: string): void {
    this.cvService.getDomainVocabulary(cvDomain).subscribe(response => {
      this.cvOptions = response[cvDomain].list;
    });
  }

  refreshQuery(): void {
    this.queryParts = [];
    this.commandInputs.forEach((commandInput, index) => {
      if (this.commandInputValueDict[commandInput.type] && this.commandInputValueDict[commandInput.type][index] != null) {
        commandInput.constructQuery(
          this.commandInputValueDict[commandInput.type][index],
          this.selectedCondition,
          this.selectedQueryableProperty,
          this.selectedLucenePath,
          this.queryUpdated,
          this.queryParts
        );
      }
    });
  }

  increaseOverlayZindex(): void {
    this.overlayContainer.style.zIndex = '1002';
  }

  decreaseOverlayZindex(): void {
    this.overlayContainer.style.zIndex = null;
  }
}
