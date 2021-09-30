import { Component } from '@angular/core';
import { PoMultiselectOption } from '../../../ui/src/lib';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  lookup;
  lookupSingle;

  advancedFilters = [
    {
      property: 'nickname',
      divider: 'Hero Informations',
      optional: true,
      gridColumns: 6,
      label: 'Hero'
    },
    {
      property: 'name',
      optional: true,
      gridColumns: 6
    }
  ];
}
