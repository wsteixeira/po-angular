import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  Optional,
  ViewChild,
  forwardRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { ICONS_DICTIONARY, PhosphorIconDictionary } from '../../po-icon';
import { PoKeyCodeEnum } from './../../../enums/po-key-code.enum';

import { PoCheckboxBaseComponent } from './po-checkbox-base.component';

/**
 * @docsExtends PoCheckboxBaseComponent
 *
 * @example
 *
 * <example name="po-checkbox-basic" title="PO Checkbox Basic">
 *   <file name="sample-po-checkbox-basic/sample-po-checkbox-basic.component.html"> </file>
 *   <file name="sample-po-checkbox-basic/sample-po-checkbox-basic.component.ts"> </file>
 * </example>
 *
 * <example name="po-checkbox-labs" title="PO Checkbox Labs">
 *   <file name="sample-po-checkbox-labs/sample-po-checkbox-labs.component.html"> </file>
 *   <file name="sample-po-checkbox-labs/sample-po-checkbox-labs.component.ts"> </file>
 * </example>
 *
 * <example name="po-checkbox-acceptance-term" title="PO Checkbox - Acceptance Term">
 *   <file name="sample-po-checkbox-acceptance-term/sample-po-checkbox-acceptance-term.component.html"> </file>
 *   <file name="sample-po-checkbox-acceptance-term/sample-po-checkbox-acceptance-term.component.ts"> </file>
 * </example>
 */
@Component({
  selector: 'po-checkbox',
  templateUrl: './po-checkbox.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PoCheckboxComponent),
      multi: true
    }
  ]
})
export class PoCheckboxComponent extends PoCheckboxBaseComponent implements AfterViewInit {
  private _iconToken: { [key: string]: string };

  @ViewChild('checkboxLabel', { static: true }) checkboxLabel: ElementRef;

  constructor(
    @Optional() @Inject(ICONS_DICTIONARY) value: { [key: string]: string },
    private changeDetector: ChangeDetectorRef
  ) {
    super();

    this._iconToken = value ?? PhosphorIconDictionary;
  }

  /**
   * Função que atribui foco ao *checkbox*.
   *
   * Para utilizá-la é necessário capturar a referência do componente no DOM através do `ViewChild`, como por exemplo:
   *
   * ```
   * ...
   * import { ViewChild } from '@angular/core';
   * import { PoCheckboxComponent } from '@po-ui/ng-components';
   *
   * ...
   *
   * @ViewChild(PoCheckboxComponent, { static: true }) checkbox: PoCheckboxComponent;
   *
   * focusCheckbox() {
   *   this.checkbox.focus();
   * }
   * ```
   */
  focus(): void {
    if (this.checkboxLabel && !this.disabled) {
      this.checkboxLabel.nativeElement.focus();
    }
  }

  onBlur() {
    this.onTouched?.();
  }

  ngAfterViewInit() {
    if (this.autoFocus) {
      this.focus();
    }
  }

  onKeyDown(event: KeyboardEvent, value: boolean | string) {
    if (event.which === PoKeyCodeEnum.space || event.keyCode === PoKeyCodeEnum.space) {
      this.checkOption(value);

      event.preventDefault();
    }
  }

  protected changeModelValue(value: boolean | null | string) {
    if (value === null) {
      this.checkboxValue = 'mixed';
    } else {
      this.checkboxValue = typeof value === 'boolean' || value === null ? value : false;
    }
    this.changeDetector.detectChanges();
  }

  get iconNameLib() {
    return this._iconToken.NAME_LIB;
  }
}
