import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  lookup;
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

  options = [
    { value: 'poMultiselect0', label: 'PO Multiselect 0' },
    { value: 'poMultiselect1', label: 'PO Multiselect 1' },
    { value: 'poMultiselect2', label: 'PO Multiselect 2' },
    { value: 'poMultiselect3', label: 'PO Multiselect 3' },
    { value: 'poMultiselect4', label: 'PO Multiselect 4' },
    { value: 'poMultiselect5', label: 'PO Multiselect 5' },
    { value: 'poMultiselect6', label: 'PO Multiselect 6' },
    { value: 'poMultiselect7', label: 'PO Multiselect 7' },
    { value: 'poMultiselect8', label: 'PO Multiselect 8' },
    { value: 'poMultiselect9', label: 'PO Multiselect 9' },
    { value: 'poMultiselect10', label: 'PO Multiselect 10' }
  ];
}
