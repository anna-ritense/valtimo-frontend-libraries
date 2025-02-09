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

interface LoggingEvent {
  timestamp: string;
  formattedMessage: string;
  level: string;
  properties: Array<LoggingEventProperty>;
  stacktrace: string;
}

interface LoggingEventProperty {
  key: string;
  value: string;
}

interface LoggingEventSearchRequest {
  afterTimestamp?: string;
  beforeTimestamp?: string;
  level?: string;
  likeFormattedMessage?: string;
  properties?: Array<LoggingEventProperty>;
  size?: number;
  page?: number;
}

enum LogLevel {
  DEBUG = 'DEBUG',
  ERROR = 'ERROR',
  INFO = 'INFO',
  TRACE = 'TRACE',
  WARN = 'WARN',
}

const LOG_LEVEL_TAG = {
  [LogLevel.DEBUG]: 'teal',
  [LogLevel.ERROR]: 'red',
  [LogLevel.INFO]: 'blue',
  [LogLevel.TRACE]: 'grey',
  [LogLevel.WARN]: 'purple',
};

const LOG_ELLIPSIS_LIMIT = 128;

export {
  LOG_ELLIPSIS_LIMIT,
  LOG_LEVEL_TAG,
  LoggingEvent,
  LoggingEventProperty,
  LoggingEventSearchRequest,
  LogLevel,
};
