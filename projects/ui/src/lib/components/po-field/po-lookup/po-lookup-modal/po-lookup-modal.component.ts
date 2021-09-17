import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  ElementRef,
  OnInit,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { fromEvent, Observable } from 'rxjs';
import { debounceTime, filter, switchMap, tap } from 'rxjs/operators';
import { PoTableColumnSort } from '../../../po-table/interfaces/po-table-column-sort.interface';
import { PoLookupModalBaseComponent } from '../po-lookup-modal/po-lookup-modal-base.component';
import { PoLanguageService } from './../../../../services/po-language/po-language.service';
import { PoDynamicFormComponent } from './../../../po-dynamic/po-dynamic-form/po-dynamic-form.component';
import { PoTableComponent } from './../../../po-table/po-table.component';

/**
 * @docsPrivate
 *
 * @docsExtends PoLookupModalBaseComponent
 */
@Component({
  selector: 'po-lookup-modal',
  templateUrl: './po-lookup-modal.component.html'
})
export class PoLookupModalComponent extends PoLookupModalBaseComponent implements OnInit, AfterViewInit {
  @ViewChild(PoTableComponent, { static: true }) poTable: PoTableComponent;
  @ViewChild('inpsearch') inputSearchEl: ElementRef;
  @ViewChild('container', { read: ViewContainerRef }) container: ViewContainerRef;

  keyUpObservable: Observable<any> = null;

  containerHeight: number = 375;
  tableHeight: number;

  componentRef: ComponentRef<PoDynamicFormComponent>;
  dynamicForm: NgForm;

  constructor(
    private componentFactory: ComponentFactoryResolver,
    poLanguage: PoLanguageService,
    changeDetector: ChangeDetectorRef
  ) {
    super(poLanguage, changeDetector);
  }

  ngOnInit() {
    super.ngOnInit();
    this.setTableHeight();
  }

  ngAfterViewInit() {
    this.initializeEventInput();
  }

  onSelect(item) {
    this.selecteds = [...this.selecteds, item];
    this.setTableHeight();
  }

  onUnselect(item) {
    this.poTable.unselectRowItem(item.removedDisclaimer?.value);
    this.selecteds = this.selecteds.filter(itemSelected => itemSelected !== item);
    this.setTableHeight();
  }

  onAllSelected(items) {
    this.selecteds = items;
    this.setTableHeight();
  }

  onAllUnselected(items) {
    this.poTable.unselectRows();
    items.forEach(item => {
      this.selecteds = this.selecteds.filter(itemSelected => itemSelected !== item);
    });
    this.setTableHeight();
  }

  initializeEventInput(): void {
    this.keyUpObservable = fromEvent(this.inputSearchEl.nativeElement, 'keyup').pipe(
      filter((e: any) => this.validateEnterPressed(e)),
      debounceTime(400)
    );

    this.keyUpObservable.subscribe(() => {
      this.search();
    });
  }

  openModal() {
    this.poModal.open();
  }

  sortBy(sort: PoTableColumnSort) {
    this.sort = sort;
  }

  destroyDynamicForm() {
    if (this.componentRef) {
      this.componentRef.destroy();
    }
  }

  onAdvancedFilter() {
    this.setupModalAdvancedFilter();
    this.createDynamicForm();
  }

  private setTableHeight() {
    if (this.multiple) {
      if (this.selecteds?.length !== 0) {
        this.tableHeight = 300;
      } else {
        this.tableHeight = 370;
        this.containerHeight = 375;
      }
    }

    // precisa ser 315 por as linhas terem altura de 32px (quando tela menor que 1366px).
    // O retorno padrão é 10 itens fazendo com que gere scroll caso houver paginação, 370 não gerava.
    this.tableHeight = this.infiniteScroll ? 315 : 370;
    if (window.innerHeight < 615) {
      this.tableHeight -= 50;
      this.containerHeight -= 50;
    }
  }

  private validateEnterPressed(e: any) {
    return e.keyCode === 13;
  }

  private setupModalAdvancedFilter() {
    this.dynamicFormValue = {};
    this.isAdvancedFilter = true;
  }

  private createDynamicForm() {
    const component = this.componentFactory.resolveComponentFactory(PoDynamicFormComponent);

    this.componentRef = this.container.createComponent<PoDynamicFormComponent>(component);
    this.componentRef.instance.fields = this.advancedFilters;
    this.componentRef.instance.value = this.dynamicFormValue;

    this.componentRef.instance.formOutput
      .pipe(
        tap(form => {
          this.dynamicForm = form;
          this.primaryActionAdvancedFilter.disabled = this.dynamicForm.invalid;
        }),
        switchMap(form => form.valueChanges)
      )
      .subscribe(() => {
        this.primaryActionAdvancedFilter.disabled = this.dynamicForm.invalid;
      });
  }
}
