import { Component, OnInit, Input } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { trigger, style, state, animate, transition, AnimationEvent } from '@angular/animations';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
})
export class SideMenuComponent implements OnInit {
  @Input() menuItems: MenuItem[] = [];

  constructor() {}

  ngOnInit(): void {}
}
