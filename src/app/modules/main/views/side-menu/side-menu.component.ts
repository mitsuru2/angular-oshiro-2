import { Component, OnInit, Input } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
})
export class SideMenuComponent implements OnInit {
  //@Input() isOpen!: boolean;

  items!: MenuItem[];

  constructor() {}

  ngOnInit(): void {
    this.items = [{ label: 'New' }, { label: 'List' }];
  }
}
