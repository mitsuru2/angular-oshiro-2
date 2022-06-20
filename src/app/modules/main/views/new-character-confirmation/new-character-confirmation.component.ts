import { Component, EventEmitter, Input, /*OnInit,*/ Output } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { NewCharacterFormResult } from '../new-character-form/new-character-form.interface';

@Component({
  selector: 'app-new-character-confirmation',
  templateUrl: './new-character-confirmation.component.html',
  styleUrls: ['./new-character-confirmation.component.scss'],
})
export class NewCharacterConfirmationComponent /*implements OnInit*/ {
  private className = 'NewCharacterConfirmationComponent';

  /** Appearance */
  @Input() maxWidth = 'auto';

  @Input() okLabel = 'OK';

  @Input() cancelLabel = 'Cancel';

  @Input() buttonStyleClass = '';

  textNotAvailable = '(n.a.)';

  /** Character data. */
  @Input() character!: NewCharacterFormResult;

  /** Result */
  @Output() confirmationResult = new EventEmitter<boolean>();

  //============================================================================
  // Class methods.
  //
  constructor(private logger: NGXLogger) {
    this.logger.trace(`new ${this.className}()`);
  }

  //ngOnInit(): void {}

  onOkClick() {
    const location = `${this.className}.onOkClick()`;
    this.logger.trace(location);
    this.confirmationResult.emit(true);
  }

  onCancelClick() {
    const location = `${this.className}.onCancelClick()`;
    this.logger.trace(location);
    this.confirmationResult.emit(false);
  }
}
