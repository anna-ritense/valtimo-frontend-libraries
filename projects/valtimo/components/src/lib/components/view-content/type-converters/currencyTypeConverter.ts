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
import {inject} from '@angular/core';
import {TypeConverter} from './type-converters.model';
import moment from 'moment';
import {CurrencyPipe, registerLocaleData} from '@angular/common';
import localeNl from '@angular/common/locales/nl';
import localeDe from '@angular/common/locales/nl';
import {TranslateService} from '@ngx-translate/core';

registerLocaleData(localeNl, 'nl');
registerLocaleData(localeDe, 'de');

export class CurrencyTypeConverter implements TypeConverter {
  private readonly _currencyPipe = inject(CurrencyPipe);
  private readonly _translateService = inject(TranslateService);

  public getTypeString(): string {
    return 'currency';
  }

  public convert(value: any, definition: any): string {
    if (!value) return '-';

    try {
      return (
        this._currencyPipe.transform(
          value,
          definition.currencyCode ?? 'EUR',
          definition.display,
          definition.digitsInfo,
          moment.locale(localStorage.getItem('langKey') ?? 'nl')
        ) ?? '-'
      );
    } catch {
      return this._translateService.instant('viewTypeConverter.errors.number');
    }
  }
}
