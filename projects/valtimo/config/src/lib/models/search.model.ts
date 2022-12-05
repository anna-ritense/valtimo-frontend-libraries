type SearchFieldDataType = 'text' | 'number' | 'date' | 'datetime' | 'boolean';

type SearchFieldFieldType = 'single' | 'multiple' | 'range';

type SearchFieldMatchType = 'exact' | 'like';

type SearchFieldBoolean = 'booleanPositive' | 'booleanNegative';

type BooleanValueSingle = boolean;

type TextValueSingle = string;
type TextValueMultiple = Array<TextValueSingle>;

type NumberValueSingle = number;

interface NumberValueRange {
  start: NumberValueSingle;
  end: NumberValueSingle;
}

type SearchFieldValue = BooleanValueSingle | TextValueSingle | NumberValueSingle | NumberValueRange;

interface SearchField {
  title?: string;
  key: string;
  path?: string;
  dataType: SearchFieldDataType;
  fieldType: SearchFieldFieldType;
  matchType: SearchFieldMatchType;
}

interface SearchFieldWithValue extends SearchField {
  value: SearchFieldValue;
}

interface SearchFieldValues {
  [searchFieldKey: string]: SearchFieldValue;
}

type SearchOperator = 'AND' | 'OR';

interface SearchFilter {
  key: string;
  values: Array<string>;
}

interface SearchFilterRange {
  key: string;
  rangeFrom: string;
  rangeTo: string;
}

type AssigneeFilter = 'OPEN' | 'MINE' | 'ALL';

export {
  SearchFieldDataType,
  SearchFieldFieldType,
  SearchFieldMatchType,
  SearchFieldBoolean,
  SearchField,
  SearchFieldValue,
  SearchFieldWithValue,
  SearchFieldValues,
  SearchOperator,
  SearchFilter,
  SearchFilterRange,
  AssigneeFilter,
};
