import { Component, OnInit, Input } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { trigger, style, state, animate, transition, AnimationEvent } from '@angular/animations';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
  animations: [
    // animation triggers.
    trigger('openClose', [
      state('open', style({ width: '15rem' })),
      state('close', style({ width: 0 })),
      transition('open <=> close', [animate('200ms ease-in-out')]),
    ]),
  ],
})
export class SideMenuComponent implements OnInit {
  @Input() isOpen: boolean = false;

  @Input() items: MenuItem[] = [];

  isMenuVisible!: boolean;

  constructor() {}

  ngOnInit(): void {
    this.isMenuVisible = this.isOpen; // It shall be initialized here. (After @Input() parameters has been updated.)
  }

  animationStart(event: AnimationEvent) {
    if (event.toState === 'close') {
      this.isMenuVisible = false;
    }
  }

  animationDone(event: AnimationEvent) {
    if (event.toState === 'open') {
      this.isMenuVisible = true;
    }
  }
}
