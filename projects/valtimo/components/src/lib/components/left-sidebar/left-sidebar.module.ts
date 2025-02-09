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
import {LeftSidebarComponent} from './left-sidebar.component';
import {PageTitleModule} from '../page-title/page-title.module';
import {MenuModule} from '../menu/menu.module';
import {IconModule, UIShellModule} from 'carbon-components-angular';
import {CaseCountPipe, ComponentsPipesModule} from '../../pipes';
import {CommandClickDirectiveModule} from '../../directives/command-click/command-click-directive.module';

@NgModule({
  declarations: [LeftSidebarComponent, CaseCountPipe],
  imports: [
    CommonModule,
    MenuModule,
    PageTitleModule,
    IconModule,
    UIShellModule,
    ComponentsPipesModule,
    CommandClickDirectiveModule,
  ],
  exports: [LeftSidebarComponent],
})
export class LeftSidebarModule {}
