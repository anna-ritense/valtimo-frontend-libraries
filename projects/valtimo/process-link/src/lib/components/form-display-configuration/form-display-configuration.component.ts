import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {ConfigService} from '@valtimo/config';
import {ListItem} from 'carbon-components-angular';
import {BehaviorSubject, combineLatest, Observable, Subscription} from 'rxjs';
import {map} from 'rxjs/operators';
import {FormDefinitionListItem, FormDisplayType, FormSize} from '../../models';
import {ProcessLinkButtonService, ProcessLinkStateService} from '../../services';
import {MultiInputValues} from '@valtimo/components';

@Component({
  selector: 'valtimo-form-display-configuration',
  templateUrl: './form-display-configuration.component.html',
})
export class FormDisplayConfigurationComponent implements OnInit, OnDestroy {
  @Input() public selectedFormDefinition: FormDefinitionListItem;

  @Output() public formDisplayValue = new EventEmitter<string>();
  @Output() public formSizeValue = new EventEmitter<string>();
  @Output() public subtitlesValue = new EventEmitter<string[]>();

  public readonly formDisplayValue$ = new BehaviorSubject<FormDisplayType | null>(null);
  public readonly formSizeValue$ = new BehaviorSubject<FormSize | null>(null);
  private readonly _subtitles$ = new BehaviorSubject<string[]>([]);
  public subtitles$: Observable<MultiInputValues> = this._subtitles$.pipe(
    map(subtitles => subtitles.map(subtitle => ({value: subtitle})))
  );
  public readonly disableFormSizeInput$ = new BehaviorSubject<boolean>(true);
  public readonly saving$ = this.stateService.saving$;
  public readonly taskPanelEnabled$ = new BehaviorSubject<boolean>(false);
  public readonly isUserTask$ = new BehaviorSubject<boolean>(false);

  private readonly _DISPLAY_TYPE_OPTIONS: FormDisplayType[] = ['modal', 'panel'];
  private readonly _FORM_SIZE_OPTIONS: FormSize[] = ['extraSmall', 'small', 'medium', 'large'];
  private readonly _subscriptions = new Subscription();

  public readonly formDisplayTypeListItems$: Observable<ListItem[]> = combineLatest([
    this.formDisplayValue$,
    this.translateService.stream('key'),
  ]).pipe(
    map(([formDisplayValue]) =>
      this._DISPLAY_TYPE_OPTIONS.map((key: string) => ({
        content: this.translateService.instant(`processLinkSteps.displayType.options.${key}`),
        key: key,
        selected: this.formDisplayValue$.getValue() === key,
      }))
    )
  );

  public readonly formSizeListItems$: Observable<ListItem[]> = combineLatest([
    this.formSizeValue$,
    this.translateService.stream('key'),
  ]).pipe(
    map(([formSizeValue]) =>
      this._FORM_SIZE_OPTIONS.map((key: string) => ({
        content: this.translateService.instant(`processLinkSteps.formSize.options.${key}`),
        key: key,
        selected: this.formSizeValue$.getValue() === key,
      }))
    )
  );

  constructor(
    private readonly buttonService: ProcessLinkButtonService,
    private readonly configService: ConfigService,
    private readonly stateService: ProcessLinkStateService,
    private readonly translateService: TranslateService
  ) {
    this.taskPanelEnabled$.next(!!this.configService.featureToggles?.enableTaskPanel);
  }

  public ngOnInit(): void {
    this._subscriptions.add(
      combineLatest([
        this.stateService.modalParams$,
        this.stateService.selectedProcessLink$,
      ]).subscribe(([modalParams, selectedProcessLink]) => {
        this.isUserTask$.next(modalParams?.element?.type === 'bpmn:UserTask');

        if (selectedProcessLink) {
          if (selectedProcessLink.formDisplayType) this.disableFormSizeInput$.next(false);
          if (selectedProcessLink.activityType.includes('bpmn:UserTask'))
            this.isUserTask$.next(true);
          this.formDisplayValue$.next(selectedProcessLink.formDisplayType ?? null);
          this.formSizeValue$.next(selectedProcessLink.formSize ?? null);
          this._subtitles$.next(selectedProcessLink.subtitles ?? []);
        }
      })
    );
  }

  public ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  public selectFormDisplayType(event: ListItem): void {
    this.updateFormDisplayType(event?.key);
    this.enableSaveButtonWhenValid();
  }

  public selectFormSize(event: ListItem): void {
    this.updateFormSize(event?.key);
    this.enableSaveButtonWhenValid();
  }

  public onSubtitlesChange(subtitles: string[]): void {
    this.subtitlesValue.emit(subtitles);
  }

  private updateFormDisplayType(formDisplayType): void {
    formDisplayType ? this.disableFormSizeInput$.next(false) : this.resetFormSize();
    this.formDisplayValue$.next(formDisplayType);
    this.formDisplayValue.emit(formDisplayType);
  }

  private updateFormSize(formSize): void {
    this.formSizeValue$.next(formSize);
    this.formSizeValue.emit(formSize);
  }

  private resetFormSize(): void {
    this.disableFormSizeInput$.next(true);
    this.updateFormSize(null);
  }

  private enableSaveButtonWhenValid(): void {
    if (
      this.selectedFormDefinition &&
      this.formDisplayValue$.getValue() &&
      this.formSizeValue$.getValue()
    ) {
      this.buttonService.enableSaveButton();
    } else {
      this.buttonService.disableSaveButton();
    }
  }
}
