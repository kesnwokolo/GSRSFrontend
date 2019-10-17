import {Component, Input, OnInit} from '@angular/core';
import {PhysicalModificationParameter, SubstanceAmount, SubstanceParameter} from '@gsrs-core/substance';
import {UtilsService} from '@gsrs-core/utils';

@Component({
  selector: 'app-physical-parameter-form',
  templateUrl: './physical-parameter-form.component.html',
  styleUrls: ['./physical-parameter-form.component.scss']
})
export class PhysicalParameterFormComponent implements OnInit {
  private privateParameter: PhysicalModificationParameter;
  constructor(
    private utilsService: UtilsService) { }

  ngOnInit() {
  }

  @Input()
  set parameter(parameter: PhysicalModificationParameter) {
    this.privateParameter = parameter;
  }

  get parameter(): PhysicalModificationParameter {
    console.log('returning param');
    console.log(this.privateParameter);
    return this.privateParameter;
  }
  get isValid(): boolean {
    return (this.privateParameter.parameterName != null || this.privateParameter.parameterName !== '');
  }

  displayAmount(amt: SubstanceAmount): string {
    return this.utilsService.displayAmount(amt);
  }
}
