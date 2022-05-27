import { Component, Input, OnInit } from '@angular/core';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.scss'],
})
export class SplashComponent implements OnInit {
  @Input() title: string = '';

  @Input() message: string = '';

  constructor(private logger: NGXLogger) {
    this.logger.trace('new SplashComponent()');
  }

  ngOnInit(): void {}
}
