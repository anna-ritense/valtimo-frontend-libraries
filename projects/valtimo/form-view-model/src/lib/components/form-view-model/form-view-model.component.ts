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
import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import moment from 'moment';
import {BehaviorSubject, catchError, combineLatest, debounceTime, EMPTY, Observable, of, switchMap, take, tap,} from 'rxjs';
import {FormioComponent, FormioModule, FormioOptions, FormioSubmission, FormioSubmissionCallback,} from '@formio/angular';
import {ViewModelService} from '../../services';
import {distinctUntilChanged, map} from 'rxjs/operators';
import {deepmerge} from 'deepmerge-ts';
import {FormIoStateService, ValtimoFormioOptions} from '@valtimo/components';
import {TranslateService} from '@ngx-translate/core';
import {HttpErrorResponse} from '@angular/common/http';
import {CommonModule} from '@angular/common';

moment.defaultFormat = 'DD MMM YYYY HH:mm';

@Component({
  selector: 'valtimo-form-view-model',
  templateUrl: './form-view-model.component.html',
  styleUrls: ['./form-view-model.component.css'],
  standalone: true,
  imports: [CommonModule, FormioModule],
})
export class FormViewModelComponent implements OnInit {
  @ViewChild('formio') formio: FormioComponent;

  @Input() set options(optionsValue: any) {
    this.options$.next(optionsValue);
  }

  @Input() set submission(submissionValue: FormioSubmission) {
    this.submission$.next(submissionValue);
  }

  @Input() set form(formValue: object) {
    const instance = this;
    const form = {
      loadInitialViewModel: () => instance.loadInitialViewModel(),
      updateViewModel: () => instance.updateViewModel(),
      ...formValue,
    };
    this.form$.next(form);
  }

  @Input() set formName(formName: string) {
    this.formName$.next(formName);
  }

  @Input() set taskInstanceId(taskInstanceId: string) {
    this.taskInstanceId$.next(taskInstanceId);
  }

  @Input() set isStartForm(isStartFormValue: boolean) {
    this.isStartForm$.next(isStartFormValue);
  }

  @Input() set processDefinitionKey(processDefinitionKeyValue: string) {
    this.processDefinitionKey$.next(processDefinitionKeyValue);
  }

  @Input() set documentDefinitionName(documentDefinitionNameValue: string) {
    this.documentDefinitionName$.next(documentDefinitionNameValue);
  }

  @Output() formSubmit = new EventEmitter<any>();

  public errors: string[] = [];

  private _preventNextPage = false;
  private _preventPreviousPage = false;
  private _isWizard: boolean = false;

  public readonly submission$ = new BehaviorSubject<any>({});
  public readonly form$ = new BehaviorSubject<object>(undefined);
  public readonly formName$ = new BehaviorSubject<string>(undefined);
  public readonly options$ = new BehaviorSubject<ValtimoFormioOptions>(undefined);
  public readonly taskInstanceId$ = new BehaviorSubject<string>(undefined);
  public readonly tokenSetInLocalStorage$ = new BehaviorSubject<boolean>(false);
  public readonly change$ = new BehaviorSubject<any>(null);
  public readonly blur$ = new BehaviorSubject<FocusEvent>(null);
  public readonly loading$ = new BehaviorSubject<boolean>(true);
  public readonly isStartForm$ = new BehaviorSubject<boolean>(false);
  public readonly processDefinitionKey$ = new BehaviorSubject<string>(undefined);
  public readonly documentDefinitionName$ = new BehaviorSubject<string>(undefined);

  public readonly currentLanguage$ = this.translateService.stream('key').pipe(
    map(() => this.translateService.currentLang),
    distinctUntilChanged()
  );

  private readonly _overrideOptions$ = new BehaviorSubject<FormioOptions>({
    hooks: {
      beforeSubmit: this.beforeSubmitHook(this),
    },
  });

  public readonly formioOptions$: Observable<ValtimoFormioOptions | FormioOptions> = combineLatest([
    this.currentLanguage$,
    this.options$,
    this._overrideOptions$,
  ]).pipe(
    map(([language, options, overrideOptions]) => {
      const formioTranslations = this.translateService.instant('formioTranslations');

      const defaultOptions = {
        ...options,
        language,
        ...(formioTranslations === 'object' && {
          i18n: {
            [language]: this.stateService.flattenTranslationsObject(formioTranslations),
          },
        }),
      };

      return deepmerge(defaultOptions, overrideOptions);
    })
  );

  constructor(
    private readonly viewModelService: ViewModelService,
    private readonly translateService: TranslateService,
    private readonly stateService: FormIoStateService
  ) {}

  public ngOnInit(): void {
    if (this.isStartForm$.value) {
      this.loadInitialViewModelForStartForm();
    } else {
      this.loadInitialViewModel();
    }
  }

  public beforeSubmitHook(instance: FormViewModelComponent): (submission, callback) => void {
    return (submission, callback) => instance.beforeSubmit(submission, callback);
  }

  public beforeSubmit(submission: any, callback: FormioSubmissionCallback): void {
    combineLatest([
      this.formName$,
      this.taskInstanceId$,
      this.processDefinitionKey$,
      this.documentDefinitionName$,
      this.isStartForm$,
    ])
      .pipe(
        take(1),
        switchMap(
          ([
            formName,
            taskInstanceId,
            processDefinitionKey,
            documentDefinitionName,
            isStartForm,
          ]) =>
            isStartForm
              ? this.viewModelService
                  .submitViewModelForStartForm(
                    formName,
                    processDefinitionKey,
                    documentDefinitionName,
                    submission.data
                  )
                  .pipe(
                    take(1),
                    switchMap(response => {
                      callback(null, submission);
                      return of(response);
                    }),
                    catchError(error => {
                      this.handleFormError(error);
                      callback({message: " ", component: null}, null);
                      return EMPTY; // return an empty observable to complete the stream
                    })
                  )
              : this.viewModelService
                  .submitViewModel(formName, taskInstanceId, submission.data)
                  .pipe(
                    take(1),
                    switchMap(response => {
                      callback(null, submission);
                      return of(response);
                    }),
                    catchError(error => {
                      this.handleFormError(error);
                      callback({message: " ", component: null}, null);
                      return EMPTY; // return an empty observable to complete the stream
                    })
                  )
        )
      )
      .subscribe();
  }

  private handleFormError(error: HttpErrorResponse): void {
    const formInstance = this.formio.formio;
    this.errors = [];
    if (error.error.componentErrors) {
      error.error.componentErrors.forEach(componentError => {
        const component = formInstance.getComponent(componentError.component);
        if (component == null) {
          this.errors.push(componentError.message);
        } else {
          component?.setCustomValidity(componentError.message);
        }
      });
    } else {
      const component = formInstance.getComponent(error.error?.component);
      if (component == null) {
        this.errors.push(error.error.error);
      } else {
        component?.setCustomValidity(error.error.error);
      }
    }
  }

  public onSubmit(submission: FormioSubmission): void {
    this.formSubmit.next(submission);
  }

  public onBlur(blurEvent: FocusEvent): void {
    this.blur$.next(blurEvent);
    this.handleChanges();
  }

  public onChange(object: any): void {
    if (object.data) {
      this.change$.next(object);
    }
  }

  public onNextPage(): void {
    this._preventNextPage = true;
    this.formio.formio.setPage(this.formio.formio.page - 1);
    this.handleChanges();
  }

  public onPreviousPage(): void {
    this._preventPreviousPage = true;
    this.formio.formio.setPage(this.formio.formio.page + 1);
    this.handleChanges();
  }

  private handlePageChange(): void {
    if (this._preventNextPage) {
      this._preventNextPage = false;
      this.formio.formio.setPage(this.formio.formio.page + 1);
    } else if (this._preventPreviousPage) {
        this._preventPreviousPage = false;
        this.formio.formio.setPage(this.formio.formio.page - 1);
    }
  }

  public loadInitialViewModel(): void {
    combineLatest([this.formName$, this.taskInstanceId$])
      .pipe(
        take(1),
        switchMap(([formName, taskInstanceId]) =>
          this.viewModelService.getViewModel(formName, taskInstanceId).pipe(
            tap(viewModel => {
              this.submission$.next({data: viewModel});
              this.change$.pipe(take(1)).subscribe(() => {
                this.loading$.next(false);
              });
              this._isWizard = this.formio.form.display === 'wizard';
            })
          )
        )
      )
      .subscribe();
  }

  public updateViewModel(): void {
    this.loading$
      .pipe(
        take(1),
        switchMap(updating => {
          if (!updating) {
            this.loading$.next(true);
            return combineLatest([this.formName$, this.taskInstanceId$, this.change$]).pipe(
              take(1),
              switchMap(([formName, taskInstanceId, change]) =>
                this.viewModelService.updateViewModel(formName, taskInstanceId, change.data, this.formio.formio.page, this._isWizard).pipe(
                  tap({
                    next: viewModel => {
                      const submission = this.submission$.value;
                      submission.data = viewModel;
                      this.submission$.next(submission);
                      this.handlePageChange();
                      this.loading$.next(false);
                      this.errors = [];
                    },
                    error: error => {
                      this.loading$.next(false);
                      this.handleFormError(error);
                    },
                  })
                )
              )
            );
          }
          return of(null); // Fallback to return an observable if updating is true
        })
      )
      .subscribe();
  }

  public loadInitialViewModelForStartForm(): void {
    combineLatest([this.formName$, this.processDefinitionKey$])
      .pipe(
        take(1),
        switchMap(([formName, processDefinitionKey]) =>
          this.viewModelService.getViewModelForStartForm(formName, processDefinitionKey).pipe(
            tap(viewModel => {
              this.submission$.next({data: viewModel});
              this.change$.pipe(take(1)).subscribe(() => {
                this.loading$.next(false);
              });
              this._isWizard = this.formio.form.display === 'wizard';
            })
          )
        )
      )
      .subscribe();
  }

  public updateViewModelForStartForm(): void {
    this.loading$
      .pipe(
        take(1),
        switchMap(updating => {
          if (!updating) {
            this.loading$.next(true);
            return combineLatest([this.formName$, this.processDefinitionKey$, this.change$]).pipe(
              take(1),
              switchMap(([formName, processDefinitionKey, change]) =>
                this.viewModelService
                  .updateViewModelForStartForm(formName, processDefinitionKey, change.data, this.formio.formio.page, this._isWizard)
                  .pipe(
                    tap({
                      next: viewModel => {
                        const submission = this.submission$.value;
                        submission.data = viewModel;
                        this.submission$.next(submission);
                        this.handlePageChange();
                        this.loading$.next(false);
                        this.errors = [];
                      },
                      error: error => {
                        this.loading$.next(false);
                        this.handleFormError(error);
                      },
                    })
                  )
              )
            );
          }
          return of(null); // Fallback to return an observable if updating is true
        })
      )
      .subscribe();
  }

  private handleChanges(): void {
    this.blur$.pipe(debounceTime(500)).subscribe(() => {
      if (this.isStartForm$.value) {
        this.updateViewModelForStartForm();
      } else {
        this.updateViewModel();
      }
    });
  }
}
