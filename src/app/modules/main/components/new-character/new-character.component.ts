import { Component, OnInit } from '@angular/core';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-new-character',
  templateUrl: './new-character.component.html',
  styleUrls: ['./new-character.component.scss'],
})
export class NewCharacterComponent implements OnInit {
  constructor(private logger: NGXLogger) {
    this.logger.trace('new NewCharacterComponent()');
  }

  ngOnInit(): void {}
}
