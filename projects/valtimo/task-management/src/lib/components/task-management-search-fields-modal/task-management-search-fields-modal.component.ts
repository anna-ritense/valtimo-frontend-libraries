/*
 * Copyright 2015-2024 Ritense BV, the Netherlands.
 *
 * Licensed under EUPL, Version 1.2 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {CommonModule} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import {InformationFilled16, TrashCan16} from '@carbon/icons';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {
  CARBON_CONSTANTS,
  CarbonListModule,
  ColumnConfig,
  InputLabelModule,
  ValuePathSelectorComponent,
  ValuePathSelectorPrefix,
  ViewType,
} from '@valtimo/components';
import {DocumentService} from '@valtimo/document';
import {
  TaskListSearchDropdownDataProvider,
  TaskListSearchDropdownValue,
  TaskListSearchField,
  TaskListSearchFieldDataType,
  TaskListSearchFieldFieldType,
  TaskListSearchFieldMatchType,
} from '@valtimo/task';
import {
  ButtonModule,
  DropdownModule,
  IconModule,
  IconService,
  InputModule,
  ListItem,
  ModalModule,
} from 'carbon-components-angular';
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  filter,
  map,
  Observable,
  startWith,
  switchMap,
} from 'rxjs';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'valtimo-task-management-search-fields-modal',
  templateUrl: './task-management-search-fields-modal.component.html',
  styleUrl: './task-management-search-fields-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ButtonModule,
    DropdownModule,
    InputModule,
    ModalModule,
    ReactiveFormsModule,
    IconModule,
    CarbonListModule,
    InputLabelModule,
    ValuePathSelectorComponent,
  ],
})
export class TaskManagementSearchFieldsModalComponent implements OnInit {
  @Input({required: true}) open: boolean;
  @Input({required: true}) documentDefinitionName: string;

  private _prefillData: TaskListSearchField | null;
  @Input() public set prefillData(value: TaskListSearchField | null) {
    this._prefillData = value;
    this.setPrefilledForm(value);
  }
  public get prefillData(): TaskListSearchField | null {
    return this._prefillData;
  }
  @Output() closeEvent = new EventEmitter<Partial<TaskListSearchField> | null>();

  public readonly form = this.fb.group({
    key: this.fb.control<string>('', Validators.required),
    title: this.fb.control<string>('', Validators.required),
    path: this.fb.control<string>('', Validators.required),
    dataType: this.fb.control<ListItem | null>(null, Validators.required),
    matchType: this.fb.control<ListItem | null>(null, this.matchTypeValidator),
    fieldType: this.fb.control<ListItem | null>(null, Validators.required),
    dropdownDataProvider: this.fb.control<ListItem | null>(null),
    dropdownValues: this.fb.array<{key: string; value: string}>([]),
  });

  public get dataType(): AbstractControl<ListItem | null> {
    return this.form.get('dataType');
  }
  public get dataTypeValue$(): Observable<ListItem | null> {
    return this.dataType.valueChanges.pipe(startWith(this.dataType.value));
  }

  public get matchType(): AbstractControl<ListItem | null> {
    return this.form.get('matchType');
  }
  public get matchTypeValue$(): Observable<ListItem | null> {
    return this.matchType.valueChanges.pipe(startWith(this.matchType.value));
  }

  public get dropdownDataProvider(): AbstractControl<ListItem | null> {
    return this.form.get('dropdownDataProvider');
  }
  public get dropdownDataProviderValue$(): Observable<ListItem | null> {
    return this.dropdownDataProvider.valueChanges.pipe(startWith(this.dropdownDataProvider.value));
  }

  public get fieldType(): AbstractControl<ListItem | null> {
    return this.form.get('fieldType');
  }
  public get fieldTypeValue$(): Observable<ListItem | null> {
    return this.fieldType.valueChanges.pipe(startWith(this.fieldType.value));
  }

  public readonly TaskListSearchFieldDataType = TaskListSearchFieldDataType;
  public readonly TaskListSearchFieldFieldType = TaskListSearchFieldFieldType;
  public readonly TaskListSearchDropdownDataProvider = TaskListSearchDropdownDataProvider;

  public get keyValue(): string | null {
    const controlValue = this.form.get('key')?.value;

    return !controlValue ? null : controlValue;
  }

  public get dataTypeValue(): string | null {
    const controlValue = this.form.get('dataType')?.value;
    this._dataTypeValue$.next(controlValue?.id);

    return !controlValue ? null : controlValue.id;
  }

  public get fieldTypeValue(): string | null {
    const controlValue = this.form.get('fieldType')?.value;

    return !controlValue ? null : controlValue.id;
  }

  public get dropdownDataProviderValue(): string | null {
    const controlValue = this.form.get('dropdownDataProvider')?.value;
    this._dropdownProviderValue$.next(controlValue?.id);

    return !controlValue ? null : controlValue.id;
  }

  public get dropdownValuesArray(): FormArray | null {
    const formArray = this.form.get('dropdownValues');

    return !formArray ? null : (formArray as FormArray);
  }

  public readonly DROPDOWN_FIELDS: ColumnConfig[] = [
    {
      key: 'key',
      label: 'searchFieldsOverview.key',
      viewType: ViewType.TEXT,
    },
    {
      key: 'value',
      label: 'searchFieldsOverview.text',
      viewType: ViewType.TEXT,
    },
  ];

  private readonly _dataTypeValue$ = new BehaviorSubject<
    TaskListSearchFieldDataType | null | undefined
  >(null);

  private readonly _dropdownProviderValue$ = new BehaviorSubject<
    TaskListSearchDropdownDataProvider | null | undefined
  >(null);
  public readonly dropdownReadonlyItems$ = this._dropdownProviderValue$.pipe(
    distinctUntilChanged(),
    filter(val => !!val && val === TaskListSearchDropdownDataProvider.JSON),
    switchMap((provider: TaskListSearchDropdownDataProvider | null | undefined) =>
      this.documentService.getDropdownData(
        provider ?? '',
        this.documentDefinitionName ?? '',
        this.keyValue ?? ''
      )
    ),
    map(dropdownData =>
      dropdownData ? Object.entries(dropdownData).map(([key, value]) => ({key, value})) : []
    )
  );

  public readonly dataTypeItems$: Observable<ListItem[]> = combineLatest([
    this.dataTypeValue$,
    this.translateService.stream('key'),
  ]).pipe(
    map(([dataTypeValue]) =>
      [
        {
          content: this.translateService.instant('searchFields.text'),
          id: TaskListSearchFieldDataType.TEXT,
        },
        {
          content: this.translateService.instant('searchFields.boolean'),
          id: TaskListSearchFieldDataType.BOOLEAN,
        },
        {
          content: this.translateService.instant('searchFields.date'),
          id: TaskListSearchFieldDataType.DATE,
        },
        {
          content: this.translateService.instant('searchFields.datetime'),
          id: TaskListSearchFieldDataType.DATETIME,
        },
        {
          content: this.translateService.instant('searchFields.number'),
          id: TaskListSearchFieldDataType.NUMBER,
        },
        {
          content: this.translateService.instant('searchFields.time'),
          id: TaskListSearchFieldDataType.TIME,
        },
      ].map(item => ({...item, selected: item.id === dataTypeValue?.id}))
    )
  );

  public readonly fieldTypeItems$: Observable<ListItem[]> = combineLatest([
    this._dataTypeValue$.pipe(distinctUntilChanged()),
    this.fieldTypeValue$,
    this.translateService.stream('key'),
  ]).pipe(
    map(([dataTypeValue, fieldTypeValue]) =>
      [
        {
          content: this.translateService.instant('searchFieldsOverview.single'),
          id: TaskListSearchFieldFieldType.SINGLE,
        },
        {
          content: this.translateService.instant('searchFieldsOverview.range'),
          id: TaskListSearchFieldFieldType.RANGE,
        },
        ...(dataTypeValue === TaskListSearchFieldDataType.TEXT
          ? [
              {
                content: this.translateService.instant(
                  'searchFieldsOverview.single-select-dropdown'
                ),
                id: TaskListSearchFieldFieldType.SINGLE_SELECT_DROPDOWN,
              },
              {
                content: this.translateService.instant(
                  'searchFieldsOverview.multi-select-dropdown'
                ),
                id: TaskListSearchFieldFieldType.MULTI_SELECT_DROPDOWN,
              },
            ]
          : []),
      ].map(item => ({...item, selected: item.id === fieldTypeValue?.id}))
    )
  );

  public readonly dataProviderItems$: Observable<ListItem[]> = this.translateService
    .stream('key')
    .pipe(
      switchMap(() => this.dropdownDataProviderValue$),
      map(dataProviderValue =>
        [
          {
            content: this.translateService.instant(
              'searchFieldsOverview.dropdownDatabaseDataProvider'
            ),
            id: TaskListSearchDropdownDataProvider.DATABASE,
          },
          {
            content: this.translateService.instant(
              'searchFieldsOverview.dropdownJsonFileDataProvider'
            ),
            id: TaskListSearchDropdownDataProvider.JSON,
          },
        ].map(item => ({...item, selected: item.id === dataProviderValue?.id}))
      )
    );

  public readonly matchTypeItems$: Observable<ListItem[]> = this.translateService
    .stream('key')
    .pipe(
      switchMap(() => this.matchTypeValue$),
      map(matchTypeValue =>
        [
          {
            content: this.translateService.instant('searchFieldsOverview.like'),
            id: TaskListSearchFieldMatchType.LIKE,
          },
          {
            content: this.translateService.instant('searchFieldsOverview.exact'),
            id: TaskListSearchFieldMatchType.EXACT,
          },
        ].map(item => ({...item, selected: item.id === matchTypeValue?.id}))
      )
    );

  public readonly documentDefinitionName$: Observable<string> = this.route.params.pipe(
    map(params => params.name || ''),
    filter(docDefName => !!docDefName)
  );

  public readonly ValuePathSelectorPrefix = ValuePathSelectorPrefix;

  constructor(
    private readonly documentService: DocumentService,
    private readonly iconService: IconService,
    private readonly fb: FormBuilder,
    private readonly translateService: TranslateService,
    private readonly route: ActivatedRoute
  ) {
    this.iconService.registerAll([TrashCan16, InformationFilled16]);
  }

  public ngOnInit(): void {
    this.form.setValidators([this.dropdownDataProviderValidator, this.dropdownValuesValidator]);
  }

  public addDropdownValue(prefillValue?: {key: string; value: string}): void {
    if (!this.dropdownValuesArray) return;

    this.dropdownValuesArray.push(
      this.fb.group({
        key: this.fb.control(prefillValue?.key ?? '', Validators.required),
        value: this.fb.control(prefillValue?.value ?? '', Validators.required),
      })
    );
  }

  public removeDropdownValue(index: number): void {
    if (!this.dropdownValuesArray) return;

    this.dropdownValuesArray.removeAt(index);
  }

  public onCancel(): void {
    this.closeEvent.emit(null);
    this.resetForm();
  }

  public onSave(): void {
    const groupValue = this.form.getRawValue();
    this.closeEvent.emit({
      ...(groupValue.title && {title: groupValue.title}),
      ...(groupValue.key && {key: groupValue.key}),
      ...(groupValue.path && {path: groupValue.path}),
      ...(groupValue.dataType?.content && {dataType: groupValue.dataType.id}),
      ...(groupValue.matchType?.content && {matchType: groupValue.matchType.id}),
      ...(groupValue.fieldType?.content && {fieldType: groupValue.fieldType.id}),
      ...(groupValue.dropdownDataProvider?.content && {
        dropdownDataProvider: groupValue.dropdownDataProvider.id,
      }),
      ...(groupValue.dropdownValues && {
        dropdownValues: groupValue.dropdownValues.reduce(
          (acc, curr) => ({...acc, ...(!!curr?.key && {[curr.key]: curr.value})}),
          {}
        ),
      }),
    });

    this.resetForm();
  }

  private setPrefilledForm(prefillData: TaskListSearchField | null): void {
    if (!prefillData) return;

    this.form.patchValue({
      ...prefillData,
      dataType: !prefillData.dataType
        ? null
        : {
            content: prefillData.dataType,
            id: prefillData.dataType,
            selected: true,
          },
      matchType: !prefillData.matchType
        ? null
        : {
            content: prefillData.matchType,
            id: prefillData.matchType,
            selected: true,
          },
      fieldType: !prefillData.fieldType
        ? null
        : {
            content: prefillData.fieldType,
            id: prefillData.fieldType,
            selected: true,
          },
      dropdownDataProvider: !prefillData.dropdownDataProvider
        ? null
        : {
            content: prefillData.dropdownDataProvider,
            id: prefillData.dropdownDataProvider,
            selected: true,
          },
      dropdownValues: [],
    });

    if (prefillData.dropdownDataProvider && prefillData.dropdownValues)
      this.setPrefilledDropdownValues(prefillData.dropdownValues);
    this.form.get('key')?.disable();
  }

  private setPrefilledDropdownValues(dropdownValue: TaskListSearchDropdownValue): void {
    if (!this.dropdownValuesArray || !this.dropdownDataProviderValue) return;

    Object.entries(dropdownValue).forEach(([key, value]) => {
      this.addDropdownValue({key, value});
    });
  }

  private matchTypeValidator(control: AbstractControl): null | {[key: string]: string} {
    const controlValue: ListItem | undefined = control.value;
    const dataTypeControlValue: ListItem | null | undefined =
      control.parent?.get('dataType')?.value;

    if (
      dataTypeControlValue?.id === TaskListSearchFieldDataType.TEXT &&
      (!controlValue || !controlValue.selected)
    )
      return {error: 'Match type not selected'};

    return null;
  }

  private dropdownDataProviderValidator(group: typeof this.form): ValidationErrors {
    const controlValue: ListItem | undefined = group.get('dropdownDataProvider')?.value;
    const fieldTypeControlValue: ListItem | null | undefined = group.get('fieldType')?.value;

    if (
      [
        TaskListSearchFieldFieldType.SINGLE_SELECT_DROPDOWN,
        TaskListSearchFieldFieldType.MULTI_SELECT_DROPDOWN,
      ].includes(fieldTypeControlValue?.id) &&
      !controlValue
    )
      return {error: 'Dropdown source provider is not specified'};

    return null;
  }

  private dropdownValuesValidator(group: typeof this.form): ValidationErrors {
    const controlValue: {key: string; value: string}[] | undefined =
      group.get('dropdownValues')?.value;
    const fieldTypeControlValue = group.get('fieldType')?.value?.id;
    const dropdownProviderValue = group.get('dropdownDataProvider')?.value?.id;

    if (
      [
        TaskListSearchFieldFieldType.SINGLE_SELECT_DROPDOWN,
        TaskListSearchFieldFieldType.MULTI_SELECT_DROPDOWN,
      ].includes(fieldTypeControlValue) &&
      (!controlValue || controlValue?.length === 0) &&
      dropdownProviderValue === TaskListSearchDropdownDataProvider.DATABASE
    )
      return {error: 'Dropdown source provider is not specified or is empty'};

    return null;
  }

  private resetForm(): void {
    setTimeout(() => {
      while (!!this.dropdownValuesArray?.length) {
        this.dropdownValuesArray.removeAt(0);
      }
      this.form.reset();
      this.form.enable();
    }, CARBON_CONSTANTS.modalAnimationMs);
  }
}
