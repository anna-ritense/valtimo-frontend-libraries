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

import {
  Component,
  ComponentFactoryResolver,
  Input,
  OnInit,
  Type,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';

@Component({
  selector: 'valtimo-custom-form',
  templateUrl: './camunda-custom-form.component.html',
  styleUrls: ['./camunda-custom-form.component.css'],
})
export class CamundaCustomFormComponent implements OnInit {
  @Input() componentName: string;
  @ViewChild('customFormContainer', {read: ViewContainerRef, static: true}) viewContainerRef;

  constructor(private resolver: ComponentFactoryResolver) {}

  ngOnInit() {
    const factories = Array.from(this.resolver['_factories'].keys());
    const factoryClass = factories.find((x: any) => x.name === this.componentName) as any;
    const cmpFactory = this.resolver.resolveComponentFactory(factoryClass);
    this.viewContainerRef.createComponent(cmpFactory);
  }
}
