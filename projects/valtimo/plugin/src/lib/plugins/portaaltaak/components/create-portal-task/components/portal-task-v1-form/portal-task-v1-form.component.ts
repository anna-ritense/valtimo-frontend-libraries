/*!
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
import {Component, EventEmitter, Input, Output} from '@angular/core';
import {
  CreatePortalTaskConfig,
  CreateTaskV1Config,
  FormType,
  OtherReceiver,
  Receiver,
} from '../../../../models';
import {BehaviorSubject, map, Observable} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {PluginTranslationService} from '../../../../../../services';
import {SelectItem} from '@valtimo/components';

@Component({
  selector: 'valtimo-portal-task-v1-form',
  templateUrl: './portal-task-v1-form.component.html',
  styleUrl: './portal-task-v1-form.component.scss',
})
export class PortalTaskV1FormComponent {
  @Input({required: true}) disabled$: Observable<boolean>;
  @Input({required: true}) pluginId: string;
  @Input() prefillConfiguration$: Observable<CreatePortalTaskConfig>;
  @Output() valid: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() readonly formValue$ = new BehaviorSubject<CreateTaskV1Config | null>(null);
  private readonly valid$ = new BehaviorSubject<boolean>(false);
  readonly FORM_TYPE_ITEMS: Array<FormType> = ['id', 'url'];
  readonly formTypeSelectItems$ = this.selectItemsToTranslatedItems(this.FORM_TYPE_ITEMS);

  readonly RECEIVER_ITEMS: Array<Receiver> = ['zaakInitiator', 'other'];
  readonly receiverSelectItems$ = this.selectItemsToTranslatedItems(this.RECEIVER_ITEMS);

  readonly OTHER_RECEIVER_ITEMS: Array<OtherReceiver> = ['kvk', 'bsn'];
  readonly otherReceiverSelectItems$ = this.selectItemsToTranslatedItems(this.OTHER_RECEIVER_ITEMS);

  readonly formTypeIsUrl$: Observable<boolean> = this.formValue$.pipe(
    map(value => value?.formType === 'url')
  );
  readonly receiverIsOther$: Observable<boolean> = this.formValue$.pipe(
    map(value => value?.receiver === 'other')
  );

  constructor(
    private readonly translateService: TranslateService,
    private readonly pluginTranslationService: PluginTranslationService
  ) {}

  formValueChange(formValue: CreateTaskV1Config): void {
    this.formValue$.next(formValue);
    this.validateFormValue(formValue);
  }

  private validateFormValue(formValue: CreateTaskV1Config): void {
    const valid =
      !!formValue.formType &&
      (!!(formValue.formType === 'url' && formValue.formTypeUrl) ||
        !!(formValue.formType === 'id' && formValue.formTypeId)) &&
      !!formValue?.receiver &&
      (formValue.receiver === 'other'
        ? !!(formValue.identificationValue && formValue.identificationKey)
        : true);

    if (valid) {
      this.formValue$.next(formValue);
    }
    this.valid$.next(valid);
    this.valid.emit(valid);
  }

  private selectItemsToTranslatedItems(selectItems: Array<string>): Observable<Array<SelectItem>> {
    return this.translateService.stream('key').pipe(
      map(() =>
        selectItems.map(item => ({
          id: item,
          text: this.pluginTranslationService.instant(item, this.pluginId),
        }))
      )
    );
  }
}
