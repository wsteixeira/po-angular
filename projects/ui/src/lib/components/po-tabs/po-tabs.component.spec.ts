import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { PoTabsComponent } from './po-tabs.component';
import { PoTabsService } from './po-tabs.service';
import { PoTabComponent } from './po-tab/po-tab.component';
import { EventEmitter, QueryList } from '@angular/core';

describe('PoTabsComponent:', () => {
  let component: PoTabsComponent;
  let fixture: ComponentFixture<PoTabsComponent>;
  let tabsService: PoTabsService;

  let defaultTab;
  let activeTab;
  let disabledTab;
  let hiddenTab;
  let tabElements;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PoTabsComponent],
      providers: [PoTabsService]
    }).compileComponents();

    defaultTab = { id: '1', active: false, label: 'Tab 1' };
    activeTab = { id: '2', active: true, label: 'Tab 2' };
    disabledTab = { id: '3', disabled: true, label: 'Tab 3' };
    hiddenTab = { id: '4', hide: true, label: 'Tab 4' };

    tabElements = [document.createElement('div'), document.createElement('div'), document.createElement('div')];

    fixture = TestBed.createComponent(PoTabsComponent);
    component = fixture.componentInstance;
    tabsService = TestBed.inject(PoTabsService);
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  describe('Methods:', () => {
    it('ngOnInit: should call `handleKeyboardNavigationTab` if initializeComponent is true and tab has changed', () => {
      spyOn(component, 'handleKeyboardNavigationTab');
      component.initializeComponent = true;
      component.ngOnInit();

      component['tabsService'].triggerOnChanges();

      expect(component.handleKeyboardNavigationTab).toHaveBeenCalled();
    });

    it('ngOnInit: should call `onTabActiveByDropdown` if tab is active in tabsDropdown', () => {
      const tabMock = jasmine.createSpyObj('PoTabComponent', ['id'], { id: 'tab-id' });

      spyOn(component, 'onTabActiveByDropdown');

      component.tabsDropdown = [tabMock];
      component.ngOnInit();

      component['tabsService'].triggerActiveOnChanges(tabMock);

      expect(component.onTabActiveByDropdown).toHaveBeenCalledWith(tabMock, false);
    });

    it('ngOnInit: should unsubscribe', () => {
      spyOn(component['subscription'], 'unsubscribe');
      spyOn(component['subscriptionTabsService'], 'unsubscribe');
      spyOn(component['subscriptionTabActive'], 'unsubscribe');
      component.ngOnDestroy();

      expect(component['subscription'].unsubscribe).toHaveBeenCalled();
      expect(component['subscriptionTabsService'].unsubscribe).toHaveBeenCalled();
      expect(component['subscriptionTabActive'].unsubscribe).toHaveBeenCalled();
    });

    it('isVisibleTab: should return `false` if `visibleTabs` is greater than `maxNumberOfTabs`', () => {
      const resultTrue = component.isVisibleTab({ id: '1', hide: false, label: 'Tab 1' });
      expect(resultTrue).toBe(true);

      const resultFalse = component.isVisibleTab({ id: '1', hide: true, label: 'Tab 1' });
      expect(resultFalse).toBe(false);
    });

    it('onTabChangeState: shouldn`t call `activeDistinctTab`, `detectChanges` if `tab.active` is false', () => {
      const tab = defaultTab;

      spyOn(component, <any>'activeDistinctTab');
      spyOn(component['changeDetector'], 'detectChanges');

      component.onTabChangeState(tab);

      expect(component['activeDistinctTab']).not.toHaveBeenCalled();
      expect(component['changeDetector'].detectChanges).not.toHaveBeenCalled();
    });

    it('onTabChangeState: should set `tab.active` with false and call `activeDistinctTab`, `detectChanges` if `tab.active` is true', () => {
      const tab = activeTab;

      spyOn(component, <any>'activeDistinctTab');
      spyOn(component['changeDetector'], 'detectChanges');

      component.onTabChangeState(tab);

      expect(tab.active).toBe(false);
      expect(component['activeDistinctTab']).toHaveBeenCalled();
      expect(component['changeDetector'].detectChanges).toHaveBeenCalled();
    });

    it('onTabActive: should set `previousActiveTab` and call `deactivateTab`', () => {
      component['previousActiveTab'] = undefined;
      component.tabsChildren = <any>[defaultTab, activeTab];
      const tab = component.tabsChildren[0];

      spyOn(component, <any>'deactivateTab');

      component.onTabActive(tab);

      expect(component['previousActiveTab']).toBeDefined();
      expect(component['deactivateTab']).toHaveBeenCalled();
    });

    it('selectedTab: should set `tab.active` with true, call `detectChanges` and `tab.click` if exists', () => {
      const tab = defaultTab;
      tab.click = { emit: () => {} };

      spyOn(component['changeDetector'], 'detectChanges');
      spyOn(tab.click, 'emit');

      component.selectedTab(tab);

      expect(tab.active).toBe(true);
      expect(tab.click.emit).toHaveBeenCalledWith(tab);
      expect(component['changeDetector'].detectChanges).toHaveBeenCalled();
    });

    it('selectedTab: should set `tab.active` with true and call `detectChanges`', () => {
      const tab = defaultTab;

      spyOn(component['changeDetector'], 'detectChanges');

      component.selectedTab(tab);

      expect(tab.active).toBe(true);
      expect(component['changeDetector'].detectChanges).toHaveBeenCalled();
    });

    it('trackByFn: should return `tab.id`', () => {
      const tabId = '1';

      expect(component.trackByFn(0, defaultTab)).toBe(tabId);
    });

    it('activeFirstTab: should `active` first tab if it isn`t disabled or hide', () => {
      component.quantityTabsButton = 1;

      spyOnProperty(component, 'tabs').and.returnValue([defaultTab]);

      component['activeFirstTab']();
      const tab = component.tabs[0];

      expect(tab.active).toBeTruthy();
    });

    it('overflowedTabs: should return tabsChildren.lenght', () => {
      defaultTab = {
        _results: [
          { id: '1', active: false, label: 'Tab 1' },
          { id: '12', active: false, label: 'Tab 12' }
        ]
      };
      component.tabsChildren = defaultTab;
      component.quantityTabsButton = 0;

      expect(component.overflowedTabs.length).toBe(2);
    });

    it('isShowTabDropdown: should return the length of items with hide', () => {
      defaultTab = {
        _results: [
          { id: '1', active: false, hide: true, label: 'Tab 1' },
          { id: '12', active: false, hide: false, label: 'Tab 12' }
        ]
      };
      component.tabsChildren = defaultTab;
      component.quantityTabsButton = 0;

      expect(component.isShowTabDropdown).toBe(1);
    });

    it('activeFirstTab: shouldn`t `active` first tab if them are disabled or hide', () => {
      component.quantityTabsButton = 1;
      spyOnProperty(component, 'tabs').and.returnValue([disabledTab, hiddenTab]);
      component['activeFirstTab']();
      const tab = component.tabs[0];

      expect(tab.active).toBeFalsy();
    });

    it(`closeListbox: should call 'closeDropdown' if 'isDropdownOpen' is 'true'.`, () => {
      const fakeThis = {
        tabDropdown: {
          isDropdownOpen: true,
          closeDropdown: () => {}
        }
      };
      const spyOnCloseDropdown = spyOn(fakeThis.tabDropdown, 'closeDropdown');

      component.closeListbox.call(fakeThis);
      expect(spyOnCloseDropdown).toHaveBeenCalled();
    });

    it(`closeListbox: shouldn't call 'closeDropdown' if 'isDropdownOpen' is 'false'.`, () => {
      const fakeThis = {
        tabDropdown: {
          isDropdownOpen: false,
          closeDropdown: () => {}
        }
      };
      const spyOnCloseDropdown = spyOn(fakeThis.tabDropdown, 'closeDropdown');

      component.closeListbox.call(fakeThis);
      expect(spyOnCloseDropdown).not.toHaveBeenCalled();
    });

    it('deactivateTab: should deactive `previousActiveTab` if it`s truthy', () => {
      component['previousActiveTab'] = activeTab;

      spyOn(component['changeDetector'], 'detectChanges');

      component['deactivateTab']();

      expect(component['previousActiveTab'].active).toBeFalsy();
      expect(component['changeDetector'].detectChanges).toHaveBeenCalled();
    });

    it('deactivateTab: shouldn`t call `detectChanges` if `previousActiveTab` it`s falsy', () => {
      component['previousActiveTab'] = undefined;

      spyOn(component['changeDetector'], 'detectChanges');

      component['deactivateTab']();

      expect(component['previousActiveTab']).toBeFalsy();
      expect(component['changeDetector'].detectChanges).not.toHaveBeenCalled();
    });

    it('activeDistinctTab: shouldn`t call `activeFirstTab` when `previousActiveTab` is true', () => {
      component['previousActiveTab'] = defaultTab;

      spyOn(component, <any>'activeFirstTab');

      component['activeDistinctTab']();

      expect(component['previousActiveTab'].active).toBe(true);
      expect(component['activeFirstTab']).not.toHaveBeenCalled();
    });

    it('activeDistinctTab: should call `activeFirstTab` when `previousActiveTab` is false', () => {
      component['previousActiveTab'] = undefined;

      spyOn(component, <any>'activeFirstTab');

      component['activeDistinctTab']();

      expect(component['activeFirstTab']).toHaveBeenCalled();
    });

    it('handleArrowRight: should call setTabIndex in next tab if index is 1', () => {
      const indexArrow = 1;

      spyOn(component, 'setTabIndex' as any);
      spyOn(tabElements[indexArrow + 1], 'focus');

      component['handleArrowRight'](tabElements, indexArrow);

      expect(component['setTabIndex']).toHaveBeenCalledWith(tabElements[indexArrow], -1);
      expect(tabElements[indexArrow + 1].focus).toHaveBeenCalled();
      expect(component['setTabIndex']).toHaveBeenCalledWith(tabElements[indexArrow + 1], 0);
    });

    it('handleArrowRight: should call setTabIndex in the fisrt next tab if index is the last', () => {
      const indexArrow = tabElements.length - 1;

      spyOn(component, 'setTabIndex' as any);
      spyOn(tabElements[0], 'focus');

      component['handleArrowRight'](tabElements, indexArrow);

      expect(component['setTabIndex']).toHaveBeenCalledWith(tabElements[tabElements.length - 1], -1);
      expect(tabElements[0].focus).toHaveBeenCalled();
      expect(component['setTabIndex']).toHaveBeenCalledWith(tabElements[tabElements.length - 1], 0);
    });

    it('handleArrowLeft: should call setTabIndex in previous tab if index is 1', () => {
      const indexArrow = 1;

      spyOn(component, 'setTabIndex' as any);
      spyOn(tabElements[indexArrow - 1], 'focus');

      component['handleArrowLeft'](tabElements, indexArrow);

      expect(component['setTabIndex']).toHaveBeenCalledWith(tabElements[indexArrow], -1);
      expect(tabElements[indexArrow - 1].focus).toHaveBeenCalled();
      expect(component['setTabIndex']).toHaveBeenCalledWith(tabElements[indexArrow - 1], 0);
    });

    it('handleArrowLeft: should call setTabIndex in the last tab if index is 0', () => {
      const indexArrow = 0;

      spyOn(component, 'setTabIndex' as any);
      spyOn(tabElements[tabElements.length - 1], 'focus');

      component['handleArrowLeft'](tabElements, indexArrow);

      expect(component['setTabIndex']).toHaveBeenCalledWith(tabElements[0], -1);
      expect(tabElements[tabElements.length - 1].focus).toHaveBeenCalled();
      expect(component['setTabIndex']).toHaveBeenCalledWith(tabElements[tabElements.length - 1], 0);
    });

    it('handleArrowLeft: should call setTabIndex in the last tab if index is 0', () => {
      const indexArrow = 0;

      spyOn(component, 'setTabIndex' as any);
      spyOn(tabElements[tabElements.length - 1], 'focus');

      component['handleArrowLeft'](tabElements, indexArrow);

      expect(component['setTabIndex']).toHaveBeenCalledWith(tabElements[0], -1);
      expect(tabElements[tabElements.length - 1].focus).toHaveBeenCalled();
      expect(component['setTabIndex']).toHaveBeenCalledWith(tabElements[tabElements.length - 1], 0);
    });

    it('handleHomeKey: should focus in the first item', () => {
      const indexArrow = 1;

      spyOn(component, 'setTabIndex' as any);
      spyOn(tabElements[0], 'focus');

      component['handleHomeKey'](tabElements, indexArrow);

      expect(component['setTabIndex']).toHaveBeenCalledWith(tabElements[indexArrow], -1);
      expect(tabElements[0].focus).toHaveBeenCalled();
      expect(component['setTabIndex']).toHaveBeenCalledWith(tabElements[0], 0);
    });

    it('handleEndKey: should focus in the last item', () => {
      const indexArrow = 1;

      spyOn(component, 'setTabIndex' as any);
      spyOn(tabElements[tabElements.length - 1], 'focus');

      component['handleEndKey'](tabElements, indexArrow);

      expect(component['setTabIndex']).toHaveBeenCalledWith(tabElements[indexArrow], -1);
      expect(tabElements[tabElements.length - 1].focus).toHaveBeenCalled();
      expect(component['setTabIndex']).toHaveBeenCalledWith(tabElements[tabElements.length - 1], 0);
    });

    it('should handleKeyDown correctly for Home key', () => {
      const event = new KeyboardEvent('keydown', { code: 'Home', key: 'Home' });

      spyOn(event, 'preventDefault');
      spyOn(event, 'stopPropagation');
      spyOn(component as any, 'handleHomeKey');

      component['handleKeyDown'](event, [], 0);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
      expect(component['handleHomeKey']).toHaveBeenCalled();
    });

    it('should handleKeyDown correctly for End key', () => {
      const event = new KeyboardEvent('keydown', { code: 'End', key: 'End' });

      spyOn(event, 'preventDefault');
      spyOn(event, 'stopPropagation');
      spyOn(component as any, 'handleEndKey');

      component['handleKeyDown'](event, [], 0);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
      expect(component['handleEndKey']).toHaveBeenCalled();
    });

    it('should handleKeyDown correctly for Space key', () => {
      const event = new KeyboardEvent('keydown', { code: 'Space' });

      spyOn(event, 'preventDefault');
      spyOn(event, 'stopPropagation');

      component['handleKeyDown'](event, [], 0);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
    });

    it('should handleKeyDown correctly for ArrowLeft key', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      spyOn(component as any, 'handleArrowLeft');

      component['handleKeyDown'](event, [], 0);

      expect(component['handleArrowLeft']).toHaveBeenCalled();
    });

    it('should handleKeyDown correctly for ArrowRight key', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      spyOn(component as any, 'handleArrowRight');

      component['handleKeyDown'](event, [], 0);

      expect(component['handleArrowRight']).toHaveBeenCalled();
    });

    it('should focus in previous tab if has next tab ', () => {
      const initialIndex = 3;

      spyOn(component, 'setTabIndex' as any);

      component['initializeTabAccessibilityElements'](tabElements, initialIndex);

      expect(component['setTabIndex']).toHaveBeenCalledWith(tabElements[initialIndex - 1], 0);
    });

    it('should add keydown event listeners', () => {
      const tabRemoveElements = [document.createElement('div')];
      const initialIndex = 0;
      const fakeKeyboardEvent = new KeyboardEvent('keydown');

      spyOn(component as any, 'setTabIndex');
      spyOn(component as any, 'handleKeyDown');

      component['initializeTabAccessibilityElements'](tabRemoveElements, initialIndex);

      expect(component['setTabIndex']).toHaveBeenCalledWith(tabRemoveElements[0], 0);

      tabRemoveElements[0].dispatchEvent(fakeKeyboardEvent);

      expect(component['handleKeyDown']).toHaveBeenCalled();
    });

    it('should add blur event listeners and call setTabIndex', () => {
      const tabRemoveElements = [document.createElement('div'), document.createElement('div')];
      const initialIndex = 0;

      spyOn(component as any, 'setTabIndex');

      component['initializeTabAccessibilityElements'](tabRemoveElements, initialIndex);

      tabRemoveElements[0].focus();
      tabRemoveElements[0].dispatchEvent(new Event('blur'));

      expect(component['setTabIndex']).toHaveBeenCalledWith(tabRemoveElements[0], -1);
      expect(component['setTabIndex']).toHaveBeenCalledWith(tabRemoveElements[1], 0);
    });

    it('should call initializeTabAccessibilityElements if there is tabable focus', () => {
      const divElementChild = document.createElement('div');
      divElementChild.id = 'tab1';
      divElementChild.classList.add('po-tab-focusable');

      const divElement = {
        nativeElement: {
          children: [divElementChild]
        }
      };

      const tabsChildren = { _results: [{ id: 'tab1' }, { id: 'tab2' }, { id: 'tab3' }] };

      component.tabButton.reset([divElement]);
      component.tabsChildren = <any>tabsChildren;
      spyOn(component as any, 'initializeTabAccessibilityElements');

      component.handleKeyboardNavigationTab();

      expect(component['initializeTabAccessibilityElements']).toHaveBeenCalled();
    });

    it('should correctly set the tabindex attribute', () => {
      const element = document.createElement('div');

      component['setTabIndex'](element, 0);

      expect(element.getAttribute('tabindex')).toEqual('0');
    });

    it('should set the quantityTabsButton to the sum of the elements as long as it is less than the container', () => {
      component.containerTabs = {
        nativeElement: {
          offsetWidth: 500
        }
      };

      const elements = [
        { nativeElement: { offsetWidth: 100 } },
        { nativeElement: { offsetWidth: 200 } },
        { nativeElement: { offsetWidth: 150 } }
      ];
      component.tabButton = <any>elements;
      fixture.detectChanges();

      component.calculateTabs(true);
      expect(component.quantityTabsButton).toBe(2);
    });

    it('should set the quantityTabsButton', () => {
      component.setQuantityTabsButton(1);
      expect(component.quantityTabsButton).toBe(1);
    });

    it('onTabActiveByDropdown: should correctly call methods and update styles when called', () => {
      const tabMock = jasmine.createSpyObj('PoTabComponent', ['id'], { id: 'tab-id' });
      tabMock.click = { emit: () => {} };
      component.defaultLastTabWidth = 100;

      const nativeElementMock = { style: { width: '' }, getBoundingClientRect: () => ({ width: 100 }) };
      const queryListMock = jasmine.createSpyObj('QueryList', ['last'], { last: { nativeElement: nativeElementMock } });
      queryListMock.last = { nativeElement: nativeElementMock };
      component.tabButton = queryListMock;

      component.tabsChildren = new QueryList<PoTabComponent>();
      component.tabsChildren.reset([tabMock]);

      component.tabsDefault = [tabMock];
      component.tabsDropdown = [tabMock];

      spyOn(tabMock.click, 'emit');
      spyOn(component, 'handleKeyboardNavigationTab');

      component.onTabActiveByDropdown(tabMock);

      expect(tabMock.click.emit).toHaveBeenCalledWith(tabMock);
      expect(component.tabButton.last.nativeElement.style.width).toBe('100px');
      expect(component.handleKeyboardNavigationTab).toHaveBeenCalled();
      expect(component.tabsDefault.includes(tabMock)).toBe(true);
      expect(component.tabsDropdown.length).toBe(1);
    });

    it('reorderTabs: should reorder tabs if tabIndex is not -1', () => {
      const tabMock = jasmine.createSpyObj('PoTabComponent', ['id'], { id: 'tab4', widthButton: '130' });
      tabMock.click = { emit: () => {} };
      const tabsArrayMock = [
        jasmine.createSpyObj('PoTabComponent', ['id'], { id: 'tab1', widthButton: '100' }),
        jasmine.createSpyObj('PoTabComponent', ['id'], { id: 'tab2', widthButton: '110' }),
        jasmine.createSpyObj('PoTabComponent', ['id'], { id: 'tab3', widthButton: '120' }),
        tabMock
      ];

      const tabsChildrenMock = new QueryList<PoTabComponent>();
      tabsChildrenMock.reset(tabsArrayMock);
      Object.defineProperty(component, 'tabsChildren', { value: tabsChildrenMock });

      component.quantityTabsButton = 3;

      spyOn(tabMock.click, 'emit');
      spyOn(component, <any>'changeTabPositionByDropdown').and.callFake((tab: PoTabComponent) => {
        const tabIndex = component.tabsChildren.toArray().indexOf(tab);
        if (tabIndex !== -1) {
          const reorderedTabs = component.tabsChildren.toArray();
          reorderedTabs.splice(tabIndex, 1);
          reorderedTabs.splice(component.quantityTabsButton - 1, 0, tab);
          component.tabsChildren.reset(reorderedTabs);
        }
      });

      component.onTabActiveByDropdown(tabMock);

      fixture.detectChanges();

      const reorderedTabs = component.tabsChildren.toArray();

      expect(tabMock.click.emit).toHaveBeenCalledWith(tabMock);
      expect(reorderedTabs.map(tab => tab.id)).toEqual(['tab1', 'tab2', 'tab4', 'tab3']);
      expect(component.tabButton.last.nativeElement.style.width).toBe('130px');
    });

    it('updateTabsState: should update tabs state correctly', () => {
      const nativeElementMock = {
        getBoundingClientRect: () => ({ width: 100 })
      };
      component.quantityTabsButton = 2;

      const queryListMock = jasmine.createSpyObj('QueryList', [], { last: { nativeElement: nativeElementMock } });
      component.tabButton = queryListMock;

      const tabsArrayMock = [
        jasmine.createSpyObj('PoTabComponent', ['id'], { id: 'tab1', widthButton: 0 }),
        jasmine.createSpyObj('PoTabComponent', ['id'], { id: 'tab2', widthButton: 100 }),
        jasmine.createSpyObj('PoTabComponent', ['id'], { id: 'tab3', widthButton: 0 })
      ];

      const tabsChildrenMock = new QueryList<PoTabComponent>();
      tabsChildrenMock.reset(tabsArrayMock);
      Object.defineProperty(component, 'tabsChildrenArray', { value: tabsArrayMock });
      component.quantityTabsButton = 2;

      (component as any).updateTabsState();

      expect(component.defaultLastTabWidth).toBe(100);
      expect(tabsArrayMock[1].widthButton).toBe(100);
      expect(component.tabsDefault).toEqual(tabsArrayMock.slice(0, 2));
      expect(component.tabsDropdown).toEqual(tabsArrayMock.slice(2));
    });

    it('selectedTab: should correctly handle a tab in the dropdown', () => {
      const clickEventMock = new EventEmitter<any>();

      const tabMock1 = { id: 'tab1', active: false, click: clickEventMock };
      const tabMock2 = { id: 'tab2', active: false, click: clickEventMock };
      const tabMockInDropdown = { id: 'tab1', active: false, click: clickEventMock };

      component['tabsDefault'] = [tabMock1, tabMock2];
      component.tabsChildren['_results'] = [tabMockInDropdown];

      spyOn(component, 'onTabActiveByDropdown');
      const changeDetectorSpy = spyOn(component['changeDetector'], 'detectChanges');

      component.selectedTab(tabMockInDropdown);

      expect(tabMockInDropdown.active).toBeTrue();
      expect(changeDetectorSpy).toHaveBeenCalled();
      clickEventMock.subscribe(tab => {
        expect(tab).toBe(tabMockInDropdown);
      });
      clickEventMock.emit(tabMockInDropdown);
    });

    it('updateTabsState: should set defaultLastTabWidth to 0 if getBoundingClientRect().width is <= 0', () => {
      const nativeElementMock = {
        getBoundingClientRect: () => ({ width: 0 })
      };
      const queryListMock = jasmine.createSpyObj('QueryList', [], { last: { nativeElement: nativeElementMock } });
      component.tabButton = queryListMock;

      (component as any).updateTabsState();

      expect(component.defaultLastTabWidth).toBe(0);
    });
  });
});
