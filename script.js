"use strict";
class FormBuilder {
    constructor() {
        this.fields = [];
        this.responses = [];
        this.loadForms();
        this.bindEvents();
    }
    bindEvents() {
        const addFieldButton = document.getElementById('addField');
        addFieldButton.addEventListener('click', () => this.addField());
        const submitButton = document.getElementById('submitForm');
        submitButton.addEventListener('click', () => this.submitForm());
        const exportButton = document.getElementById('exportData');
        exportButton.addEventListener('click', () => this.exportData());
    }
    addField() {
        const fieldType = document.getElementById('fieldType').value;
        const fieldLabel = document.getElementById('fieldLabel').value;
        const fieldRequired = document.getElementById('fieldRequired').checked;
        let options = [];
        if (fieldType === 'multiple-choice' || fieldType === 'checkbox') {
            const optionsInput = document.getElementById('fieldOptions').value;
            options = optionsInput.split(',').map(option => option.trim());
        }
        if (fieldLabel) {
            const newField = { type: fieldType, label: fieldLabel, options, required: fieldRequired };
            this.fields.push(newField);
            this.saveForms();
            this.renderFormPreview();
            this.renderFormList();
        }
        else {
            alert('Field label cannot be empty');
        }
    }
    renderFormPreview() {
        const formPreview = document.getElementById('formPreview');
        formPreview.innerHTML = '';
        this.fields.forEach((field, index) => {
            const fieldDiv = document.createElement('div');
            fieldDiv.className = 'field';
            fieldDiv.innerHTML = this.getFieldHTML(field, index);
            formPreview.appendChild(fieldDiv);
        });
    }
    getFieldHTML(field, index) {
        let optionsHTML = '';
        if (field.options) {
            optionsHTML = field.options.map(option => `<label><input type="${field.type === 'multiple-choice' ? 'radio' : 'checkbox'}" name="field${index}" /> ${option}</label>`).join('');
        }
        switch (field.type) {
            case 'text':
                return `<label>${field.label}: <input type="text" required="${field.required}" /></label>`;
            case 'multiple-choice':
                return `<label>${field.label}: ${optionsHTML}</label>`;
            case 'checkbox':
                return `<label>${field.label}: ${optionsHTML}</label>`;
            default:
                return '';
        }
    }
    renderFormList() {
        const formList = document.getElementById('formList');
        formList.innerHTML = '<h2>Form Fields</h2>';
        this.fields.forEach((field, index) => {
            const fieldDiv = document.createElement('div');
            fieldDiv.innerHTML = `${field.label} <button onclick="formBuilder.deleteField(${index})">Delete</button>`;
            formList.appendChild(fieldDiv);
        });
    }
    deleteField(index) {
        this.fields.splice(index, 1);
        this.saveForms();
        this.renderFormPreview();
        this.renderFormList();
    }
    saveForms() {
        localStorage.setItem('formFields', JSON.stringify(this.fields));
    }
    loadForms() {
        const savedFields = localStorage.getItem('formFields');
        if (savedFields) {
            this.fields = JSON.parse(savedFields);
            this.renderFormPreview();
            this.renderFormList();
        }
    }
    submitForm() {
        const formData = {};
        let allFieldsValid = true; // Flag to check if all required fields are filled
        this.fields.forEach((field, index) => {
            let inputValue;
            if (field.type === 'text') {
                const input = document.querySelector(`input[type="text"]:nth-of-type(${index + 1})`);
                inputValue = input ? input.value : null;
            }
            else if (field.type === 'multiple-choice' || field.type === 'checkbox') {
                const checkedOptions = Array.from(document.querySelectorAll(`input[name="field${index}"]:checked`));
                inputValue = checkedOptions.map(option => { var _a, _b; return (_b = (_a = option.nextSibling) === null || _a === void 0 ? void 0 : _a.nodeValue) === null || _b === void 0 ? void 0 : _b.trim(); });
            }
            // Check if the field is required and if it has a value
            if (field.required && !inputValue) {
                alert(`Please fill out the required field: ${field.label}`);
                allFieldsValid = false; // Set the flag to false if a required field is empty
                return; // Exit the loop early
            }
            formData[field.label] = inputValue;
        });
        if (allFieldsValid) {
            this.responses.push(formData);
            localStorage.setItem('formResponses', JSON.stringify(this.responses));
            alert('Form submitted successfully!');
            // Reset the form fields
            this.resetFormFields();
        }
    }
    resetFormFields() {
        // Reset text inputs
        const textInputs = document.querySelectorAll('input[type="text"]');
        textInputs.forEach(input => {
            input.value = '';
        });
        // Reset checkboxes
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        // Reset radio buttons
        const radioButtons = document.querySelectorAll('input[type="radio"]');
        radioButtons.forEach(radio => {
            radio.checked = false;
        });
    }
    exportData() {
        const formData = {
            fields: this.fields,
            responses: this.responses
        };
        const blob = new Blob([JSON.stringify(formData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'form_data.json';
        a.click();
        URL.revokeObjectURL(url);
    }
}
const formBuilder = new FormBuilder();
