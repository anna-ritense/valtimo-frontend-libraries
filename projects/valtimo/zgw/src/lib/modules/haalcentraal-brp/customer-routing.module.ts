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
import {RouterModule, Routes} from '@angular/router';
import {CommonModule} from '@angular/common';
import {AuthGuardService} from '@valtimo/security';
import {ROLE_USER} from '@valtimo/config';
import {CustomerListComponent} from './components/customer-list/customer-list.component';
import {CasesListComponent} from './components/cases-list/cases-list.component';

const routes: Routes = [
  {
    path: 'klanten',
    component: CustomerListComponent,
    canActivate: [AuthGuardService],
    data: {title: 'Customers', roles: [ROLE_USER]},
  },
  {
    path: 'klanten/klant/:bsn',
    component: CasesListComponent,
    canActivate: [AuthGuardService],
    data: {title: 'customerCases', roles: [ROLE_USER]},
  },
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomerRoutingModule {}
