/*
 * Copyright 2015-2020 Ritense BV, the Netherlands.
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

import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Components} from '@formio/angular';

@Component({
  selector: 'valtimo-form-io-builder',
  templateUrl: './form-io-builder.component.html',
  styleUrls: ['./form-io-builder.component.css'],
})
export class FormioBuilderComponent implements OnInit {
  @Input() form: any;
  // eslint-disable-next-line @angular-eslint/no-output-native
  @Output() change: EventEmitter<any> = new EventEmitter();

  constructor() {}

  ngOnInit() {
    const originalEditForm = Components.baseEditForm;
    Components.baseEditForm = function (...extend) {
      const editForm = originalEditForm(...extend);
      const keyField = editForm.components
        .find(element => element.key === 'tabs')
        .components.find(element => element.key === 'api')
        .components.find(element => element.key === 'key');
      delete keyField.validate;
      return editForm;
    };
  }

  onChange(event) {
    this.change.emit(event);
  }
}
