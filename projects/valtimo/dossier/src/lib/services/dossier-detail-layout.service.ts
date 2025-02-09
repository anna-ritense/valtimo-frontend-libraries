import {Injectable} from '@angular/core';
import {FormDisplayType, FormSize, TaskWithProcessLink} from '@valtimo/process-link';
import {BehaviorSubject, combineLatest, filter, map, Observable, startWith} from 'rxjs';
import {
  DOSSIER_DETAIL_DEFAULT_DISPLAY_SIZE,
  DOSSIER_DETAIL_DEFAULT_DISPLAY_TYPE,
  DOSSIER_DETAIL_GUTTER_SIZE,
  DOSSIER_DETAIL_LEFT_PANEL_MIN_WIDTH,
  DOSSIER_DETAIL_RIGHT_PANEL_MIN_WIDTHS,
  DOSSIER_DETAIL_TASK_LIST_WIDTH,
} from '../constants';
import {DossierDetailLayout} from '../models';
import {DossierTabService} from './dossier-tab.service';

@Injectable()
export class DossierDetailLayoutService {
  private readonly _tabContentContainerWidth$ = new BehaviorSubject<number | null>(null);
  private readonly _showTaskList$ = this.dossierTabService.showTaskList$;
  private readonly _taskAndProcessLinkOpenedInPanel$ =
    new BehaviorSubject<TaskWithProcessLink | null>(null);
  private readonly _formDisplayType$ = new BehaviorSubject<FormDisplayType>(
    DOSSIER_DETAIL_DEFAULT_DISPLAY_TYPE
  );
  private readonly _formDisplaySize$ = new BehaviorSubject<FormSize>(
    DOSSIER_DETAIL_DEFAULT_DISPLAY_SIZE
  );

  public get tabContentContainerWidth$(): Observable<number> {
    return this._tabContentContainerWidth$.pipe(filter(width => typeof width === 'number'));
  }

  public get taskAndProcessLinkOpenedInPanel$(): Observable<TaskWithProcessLink | null> {
    return this._taskAndProcessLinkOpenedInPanel$.asObservable();
  }

  public get formDisplaySize$(): Observable<FormSize> {
    return this._formDisplaySize$.asObservable();
  }

  constructor(private readonly dossierTabService: DossierTabService) {}

  public readonly dossierDetailLayout$: Observable<DossierDetailLayout | any> = combineLatest([
    this.tabContentContainerWidth$,
    this._showTaskList$,
    this._taskAndProcessLinkOpenedInPanel$,
    this._formDisplayType$,
    this._formDisplaySize$,
  ]).pipe(
    map(
      ([
        tabContentContainerWidth,
        showTaskList,
        taskAndProcessLinkOpenedInPanel,
        formDisplayType,
        formDisplaySize,
      ]) => {
        if (!showTaskList) {
          return this.getInitialLayout();
        }

        if (!taskAndProcessLinkOpenedInPanel) {
          return this.getTaskListLayout();
        }

        if (taskAndProcessLinkOpenedInPanel && formDisplayType === 'panel') {
          return this.getPanelLayout(tabContentContainerWidth, formDisplaySize);
        }

        return {} as DossierDetailLayout;
      }
    ),
    startWith({})
  );

  public setTabContentContainerWidth(width: number): void {
    this._tabContentContainerWidth$.next(width);
  }

  public setTaskAndProcessLinkOpenedInPanel(value: TaskWithProcessLink | null): void {
    this._taskAndProcessLinkOpenedInPanel$.next(value);
  }

  public setFormDisplayType(type: FormDisplayType): void {
    this._formDisplayType$.next(type);
  }

  public setFormDisplaySize(size: FormSize): void {
    this._formDisplaySize$.next(size);
  }

  private getInitialLayout(): DossierDetailLayout {
    return {
      showRightPanel: false,
      widthAdjustable: false,
      unit: 'percent',
      leftPanelWidth: '*',
    };
  }

  private getTaskListLayout(): DossierDetailLayout {
    return {
      unit: 'pixel',
      showRightPanel: true,
      widthAdjustable: false,
      rightPanelMaxWidth: DOSSIER_DETAIL_TASK_LIST_WIDTH,
      rightPanelMinWidth: DOSSIER_DETAIL_TASK_LIST_WIDTH,
      rightPanelWidth: DOSSIER_DETAIL_TASK_LIST_WIDTH,
      leftPanelWidth: '*',
    };
  }

  private getPanelLayout(
    tabContentContainerWidth: number,
    formDisplaySize: FormSize
  ): DossierDetailLayout {
    const rightPanelMaxWidth =
      tabContentContainerWidth - DOSSIER_DETAIL_GUTTER_SIZE - DOSSIER_DETAIL_LEFT_PANEL_MIN_WIDTH;
    const rightPanelMinWidth = DOSSIER_DETAIL_RIGHT_PANEL_MIN_WIDTHS[formDisplaySize];
    const rightPanelMinWidthToUse =
      rightPanelMinWidth < rightPanelMaxWidth ? rightPanelMinWidth : rightPanelMaxWidth;

    return {
      unit: 'pixel',
      showRightPanel: true,
      widthAdjustable: true,
      rightPanelMinWidth: rightPanelMinWidthToUse,
      rightPanelWidth: rightPanelMinWidthToUse,
      rightPanelMaxWidth,
      leftPanelWidth: '*',
    };
  }
}
