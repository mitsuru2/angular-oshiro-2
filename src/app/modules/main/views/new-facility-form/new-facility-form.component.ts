import { Component, Input, OnInit } from '@angular/core';
import { NewFacilityFormMode } from './new-facility-form.interafce';

@Component({
  selector: 'app-new-facility-form',
  templateUrl: './new-facility-form.component.html',
  styleUrls: ['./new-facility-form.component.scss'],
})
export class NewFacilityFormComponent implements OnInit {
  //============================================================================
  // Class members.
  //
  private className = 'NewFacilityFormComponent';

  /** Appearance. */
  @Input() mode: NewFacilityFormMode = NewFacilityFormMode.normal;

  minimumMode = NewFacilityFormMode.minimum;

  normalMode = NewFacilityFormMode.normal;

  @Input() minWidth = 300; // pixel

  @Input() maxWidth = 800; // pixel

  /** Button label and style. */
  @Input() okLabel = 'Ok';

  @Input() cancelLabel = 'Cancel';

  @Input() buttonStyleClass = '';

  constructor() {}

  ngOnInit(): void {}

  onOkClick() {}

  onCancelClick() {}
}
