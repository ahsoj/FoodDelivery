import React, { useState } from 'react';
import { AutoComplete, Input } from 'antd';
import type { SelectProps } from 'antd/es/select';
import axios from 'axios';

const searchResult = async (query: string) => {
  const response = await fetch(`http://127.0.0.1:8888/api/v1/search/menuitems/?query=${query}`)
  const data = response.json()
      data.map((data: any, _idx: number | null) => {
        const category = `${data}`;
        return {
          value: category,
          label: (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <a href={'#'} rel="noopener noreferrer">
                {category}
              </a>
            </div>
          ),
        };
      });
}
const SearchBar: React.FC = () => {
  const [options, setOptions] = useState<SelectProps<object>['options']>([]);

  const handleSearch = (value: string) => {
    setOptions(value ? searchResult(value) : []);
  };

  const onSelect = (value: string) => {
    console.log('onSelect', value);
  };

  return (
    <AutoComplete
      style={{ width: 'inherit' }}
      options={options}
      onSelect={onSelect}
      onSearch={handleSearch}
    >
      <Input.Search
        width={'100%'}
        allowClear
        placeholder="Search menu, restaurants, address ..."
        enterButton
      />
    </AutoComplete>
  );
};

export default SearchBar;
