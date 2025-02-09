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

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DISPLAY_TYPE_TOKEN} from '../../constants';
import {donutSpecification} from './donut.specification';
import {ReactiveFormsModule} from '@angular/forms';
import {WidgetTranslatePipeModule} from '../../pipes';
import {CheckboxModule, InputModule} from 'carbon-components-angular';
import {DonutConfigurationComponent, DonutDisplayComponent} from './components';
import {ChartsModule} from '@carbon/charts-angular';
import {CarbonListModule} from '@valtimo/components';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
  declarations: [DonutDisplayComponent, DonutConfigurationComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    WidgetTranslatePipeModule,
    InputModule,
    CheckboxModule,
    CommonModule,
    ChartsModule,
    CarbonListModule,
    TranslateModule,
  ],
  exports: [DonutDisplayComponent],
  providers: [{provide: DISPLAY_TYPE_TOKEN, useValue: donutSpecification, multi: true}],
})
export class DonutModule {}
