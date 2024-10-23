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
import {PortaaltaakConfigurationComponent} from './components/portaaltaak-configuration/portaaltaak-configuration.component';
import {PluginTranslatePipeModule} from '../../pipes';
import {CommonModule} from '@angular/common';
import {
  CarbonMultiInputModule,
  ComponentsPipesModule,
  FormModule,
  InputModule,
  SelectModule,
} from '@valtimo/components';
import {CreatePortalTaskComponent} from './components/create-portal-task/create-portal-task.component';
import {CompletePortalTaskComponent} from './components/complete-portal-task/complete-portal-task.component';
import {PortalTaskV1FormComponent} from './components/create-portal-task/components/portal-task-v1-form/portal-task-v1-form.component';
import {PortalTaskV2FormComponent} from './components/create-portal-task/components/portal-task-v2-form/portal-task-v2-form.component';
import {DatePickerModule, LoadingModule, ToggleModule} from 'carbon-components-angular';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
  declarations: [
    PortaaltaakConfigurationComponent,
    CreatePortalTaskComponent,
    PortalTaskV1FormComponent,
    PortalTaskV2FormComponent,
    CompletePortalTaskComponent,
  ],
  imports: [
    CommonModule,
    PluginTranslatePipeModule,
    ComponentsPipesModule,
    FormModule,
    InputModule,
    SelectModule,
    CarbonMultiInputModule,
    FormsModule,
    LoadingModule,
    TranslateModule,
    DatePickerModule,
    ReactiveFormsModule,
    ToggleModule,
  ],
  exports: [
    PortaaltaakConfigurationComponent,
    CreatePortalTaskComponent,
    PortalTaskV1FormComponent,
    PortalTaskV2FormComponent,
    CompletePortalTaskComponent,
  ],
})
export class PortaaltaakPluginModule {}
