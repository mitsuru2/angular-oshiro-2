import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import {
  FsWeapon,
  FsWeaponRarerityMax,
  FsWeaponType,
} from 'src/app/services/firestore-data/firestore-document.interface';
import { NewWeaponFormMode, NewWeaponFormResult } from './new-weapon-form.interface';

@Component({
  selector: 'app-new-weapon-form',
  templateUrl: './new-weapon-form.component.html',
  styleUrls: ['./new-weapon-form.component.scss'],
})
export class NewWeaponFormComponent implements OnInit {
  //============================================================================
  // Class members.
  //
  private className = 'NewWeaponFormComponent';

  /** Appearance. */
  @Input() mode: NewWeaponFormMode = NewWeaponFormMode.normal;

  minimumMode = NewWeaponFormMode.minimum;

  normalMode = NewWeaponFormMode.normal;

  @Input() minWidth = 300; // pixel

  @Input() maxWidth = 800; // pixel

  /** Button label and style. */
  @Input() okLabel = 'Ok';

  @Input() cancelLabel = 'Cancel';

  @Input() buttonStyleClass = '';

  /** Weapon type */
  @Input() weaponTypes!: FsWeaponType[];

  selectedType?: FsWeaponType;

  /** Weapon name */
  inputName = '';

  @Input() weapons!: FsWeapon[];

  errorMessage = '';

  /** Rarerity */
  rarerityItems: number[] = [];

  selectedRarerity?: number;

  /** Attack */
  inputAttack = 0;

  inputAttack_kai = 0;

  /** Description */
  inputDescriptions: string[] = [''];

  /** Effect */
  inputEffects: string[] = ['', '', ''];

  inputEffects_kai: string[] = ['', '', ''];

  /** Result weapon info. */
  @Output() formResult = new EventEmitter<NewWeaponFormResult>();

  //============================================================================
  // Class methods.
  //
  constructor(private logger: NGXLogger) {
    this.logger.trace(`new ${this.className}()`);

    // Initialize rarerity list.
    for (let i = 0; i < FsWeaponRarerityMax; ++i) {
      this.rarerityItems.push(i + 1);
    }
  }

  ngOnInit(): void {
    // Sort input weapon types.
    this.weaponTypes.sort((a, b) => {
      return a.code < b.code ? -1 : 1;
    });
  }

  /**
   * Track function which is used by *ngFor directive.
   * *ngFor cannot calculate index number when it's used with [(ngModel)].
   * So, this function help *ngFor to calculate index.
   * @param index Item index.
   * @param obj List object. Not used.
   * @returns Item index.
   */
  trackByItem(index: number, obj: any): any { // eslint-disable-line
    return index;
  }

  onNameInputChange() {
    const location = `${this.className}.onNameInputChange()`;

    this.logger.debug(location, this.inputName);

    for (let weapon of this.weapons) {
      this.logger.debug(location, weapon.name);
      if (weapon.name === this.inputName) {
        this.logger.warn(location, 'Existing weapon name.', { name: this.inputName });
        this.errorMessage = '既に登録済の名前です。';
        return;
      }
    }

    this.errorMessage = '';
  }

  onOkClick() {
    this.formResult.emit(this.makeWeaponInfo(false));
    this.clearInputs();
  }

  onCancelClick() {
    this.formResult.emit(this.makeWeaponInfo(true));
    this.clearInputs();
  }

  private clearInputs() {
    this.selectedType = undefined;
    this.inputName = '';
    this.selectedRarerity = undefined;
    this.inputAttack = 0;
    this.inputAttack_kai = 0;
    this.inputDescriptions = [''];
    this.inputEffects = ['', '', ''];
    this.inputEffects_kai = ['', '', ''];
  }

  private makeWeaponInfo(canceled: boolean) {
    const location = `${this.className}.makeWeaponInfo()`;
    const result: NewWeaponFormResult = <NewWeaponFormResult>{};

    // When the form is canceled, it returns canceled flag only.
    if (canceled) {
      result.canceled = true;
    }

    // When the form is input, it returns input weapon data.
    else {
      // The mandatory input fields must not be null or undefined.
      // Input value validation shall be implemented at template.
      if (!this.selectedType || this.inputName === '' || !this.selectedRarerity) {
        this.logger.error(location, 'Necessary field is not input.', {
          type: this.selectedType,
          name: this.inputName,
          rarerity: this.selectedRarerity,
        });
        throw Error(`${location} Necessary field is not input.`);
      }

      // Make weapon data to be returned.
      result.canceled = false;
      result.type = this.selectedType;
      result.name = this.inputName;
      result.rarerity = this.selectedRarerity;
      result.attack = this.inputAttack;
      result.attack_kai = this.inputAttack_kai;
      result.descriptions = this.inputDescriptions.filter((text) => text.length > 0);
      result.effects = this.inputEffects.filter((text) => text.length > 0);
      result.effects_kai = this.inputEffects_kai.filter((text) => text.length > 0);
    }

    return result;
  }
}