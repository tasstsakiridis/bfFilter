import { LightningElement, api } from 'lwc';

import LABEL_AVAILABLE from '@salesforce/label/c.Available';
import LABEL_FILTER_BY from '@salesforce/label/c.Filter_By';
import LABEL_NO from '@salesforce/label/c.No';
import LABEL_SELECTED from '@salesforce/label/c.Selected';
import LABEL_YES from '@salesforce/label/c.Yes';

const optionsYesNo = [
    { label: LABEL_YES, value: 'yes' },
    { label: LABEL_NO, value: 'no' }   
];

export default class BfFilter extends LightningElement {
    labels = {
        available: { label: LABEL_AVAILABLE },
        filterBy: { label: LABEL_FILTER_BY },
        no: { label: LABEL_NO },
        selected: { label: LABEL_SELECTED },
        yes: { label: LABEL_YES }
    };

    optionsYesNo = optionsYesNo;

    /**
     * Public Properties
     */
    _filterConfigs;
    @api 
    get filterConfigs() {
        return this._filterConfigs;
    }
    set filterConfigs(value) {
        console.log('[bfFilter] filterConfigs', JSON.parse(JSON.stringify(value)));
        this._filterConfigs = value;
        if (value != undefined) {
            this.filterByOptions = value.map(f => {
                return { label: f.label, value: f.name };
            });
        }
    }

    _filter;
    @api 
    get filter() {
        return this._filter;
    }
    set filter(value) {
        try {
            console.log('[bfFilter.setFilter] filter', value);
            this._filter = value;   
            this.isList = false;
            this.isBoolean = false;  
            this.isMultiSelect = false;   
            if (value == undefined || value.type == 'text') {
                this.filterType = 'search';
            } else if (value.type == 'list') {
                this.filterType = 'list';
                this.isList = true;
                this.isMultiSelect = value.multiple;
            } else if (value.type == 'boolean') {
                this.filterType = 'boolean';
                this.isBoolean = true;
            } else {
                this.filterType = value.type;
            }
        }catch(ex) {
            console.log('[bfFilter.setFilter] exception', ex);
        }
    }

    @api 
    refreshOnSelection = false;

    _selectedValue;
    @api 
    get selectedValue() {
        return this._selectedValue;
    }
    set selectedValue(value) {
        this._selectedValue = value;
    }

    /**
     * Public Methods
     */
    @api 
    clear() {
        console.log('[bfFilter.clear]',JSON.parse(JSON.stringify(this.selectedValue)));
        this.selectedValue = undefined;
    }

    @api 
    getSelectedValue() {
        return { filterName: this.filter.name, value: this.selectedValue };
    }

    /**
     * Private variables and properties
     */
    get filterSelected() {
        return this.filter != undefined && this.filter.name.length > 0;
    }

    filterType = 'search';
    filterByOptions = [];    

    isBoolean = false;
    isList = false;
    isMultiSelect = false;

    configureFilter(event) {
        console.log('[bfFilter.configureFilter] filter selected', event.detail.value);
        try {
            const config = {...this.filterConfigs.find(fc => fc.name == event.detail.value)};                
            console.log('[bfFilter.configureFilter] config', config);

            config.key = this.filter.key;
            this.filter = {...config};
            console.log('[bfFilter.configureFilter] update filter',JSON.parse(JSON.stringify(this.filter)));            
        }catch(ex) {
            console.log('[bfFilter.configureFilter] exception', ex);
        }
    }

    removeFilter() {
        console.log('[bfFilter.removeFilter] filter',JSON.parse(JSON.stringify(this.filter)));
        this.dispatchEvent(new CustomEvent('remove', { 
            detail: { key: this.filter.key }
        }));
    }

    handleFilterValueChange(event) {
        try {
            this.selectedValue = event.detail.value;
            if (this.refreshOnSelection) {
                this.dispatchEvent(new CustomEvent('bffilterupdate', {
                    detail: {
                        filterName: this.filter.name,
                        value: this.selectedValue
                    }
                }));
            }
        }catch(ex) {
            console.log('[bfFilter.handleValueUpdates] exception',JSON.parse(JSON.stringify(ex)));            
        }
    }    
}