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

import {ProcessInstanceTask} from '@valtimo/process';

interface ProcessLink {
  id: string;
  processDefinitionId: string;
  activityId: string;
  activityType: string;
  processLinkType: string;
  pluginConfigurationId?: string;
  pluginActionDefinitionKey?: string;
  actionProperties?: {
    [key: string]: any;
  };
  formDefinitionId?: string;
  formFlowDefinitionId?: string;
  viewModelEnabled?: boolean;
  url?: string;
  formDisplayType?: FormDisplayType;
  formSize?: FormSize;
  subtitles?: string[];
}

type GetProcessLinkResponse = Array<ProcessLink>;

interface GetProcessLinkRequest {
  activityId: string;
  processDefinitionId: string;
}

interface ProcessLinkType {
  enabled: boolean;
  processLinkType: string;
}

type ProcessLinkConfigurationStep =
  | 'chooseProcessLinkType'
  | 'choosePluginConfiguration'
  | 'choosePluginAction'
  | 'configurePluginAction'
  | 'selectForm'
  | 'selectFormFlow'
  | 'empty';

interface FormProcessLinkCreateRequestDto {
  processDefinitionId: string;
  activityId: string;
  activityType: string;
  processLinkType: string;
  formDefinitionId: string;
  viewModelEnabled: boolean;
  formDisplayType?: string;
  formSize?: string;
  subtitles?: string[];
}

interface FormFlowProcessLinkCreateRequestDto {
  processDefinitionId: string;
  activityId: string;
  activityType: string;
  processLinkType: string;
  formFlowDefinitionId: string;
  subtitles: string[];
}

interface PluginProcessLinkCreateDto {
  processDefinitionId: string;
  activityId: string;
  activityType: string;
  processLinkType: string;
  pluginConfigurationId: string;
  pluginActionDefinitionKey: string;
  actionProperties: object;
}

interface PluginProcessLinkUpdateDto {
  id: string;
  pluginConfigurationId: string;
  pluginActionDefinitionKey: string;
  actionProperties: {
    [key: string]: any;
  };
}

interface FormFlowProcessLinkUpdateRequestDto {
  id: string;
  formFlowDefinitionId: string;
  formDisplayType?: string;
  formSize?: string;
}

interface FormProcessLinkUpdateRequestDto {
  id: string;
  formDefinitionId: string;
  viewModelEnabled: boolean;
  formDisplayType?: string;
  formSize?: string;
  subtitles?: string[];
}

type FormDisplayType = 'modal' | 'panel';

type FormSize = 'extraSmall' | 'small' | 'medium' | 'large';

interface URLProcessLinkCreateDto {
  url: string;
  activityId: string;
  activityType: string;
  processLinkType: string;
}

interface URLProcessLinkUpdateRequestDto {
  url: string;
  id: string;
}

type TaskProcessLinkType = 'form' | 'form-flow' | 'form-view-model' | 'url';

interface TaskProcessLinkResult {
  processLinkId: string;
  type: TaskProcessLinkType;
  properties: {
    formFlowInstanceId?: string;
    formDefinitionId?: string;
    prefilledForm?: any;
    formDefinition?: any;
    formName?: string;
    url?: string;
    formDisplayType?: FormDisplayType;
    formSize?: FormSize;
  };
}

interface TaskWithProcessLink {
  task: ProcessInstanceTask;
  processLinkActivityResult: TaskProcessLinkResult;
}

export {
  GetProcessLinkRequest,
  ProcessLink,
  GetProcessLinkResponse,
  PluginProcessLinkUpdateDto,
  ProcessLinkType,
  ProcessLinkConfigurationStep,
  FormProcessLinkCreateRequestDto,
  FormFlowProcessLinkCreateRequestDto,
  PluginProcessLinkCreateDto,
  FormFlowProcessLinkUpdateRequestDto,
  FormProcessLinkUpdateRequestDto,
  URLProcessLinkCreateDto,
  URLProcessLinkUpdateRequestDto,
  FormDisplayType,
  FormSize,
  TaskProcessLinkType,
  TaskProcessLinkResult,
  TaskWithProcessLink,
};
