interface FormField {
    type: string;
    label: string;
    options?: string[];
    required?: boolean;
}

class FormBuilder {
    private fields: FormField[] = [];
    private responses: any[] = [];

    constructor() {
        this.loadForms();
        this.bindEvents();
    }

    private bindEvents() {
        const addFieldButton = document.getElementById('addField') as HTMLButtonElement;
        addFieldButton.addEventListener('click', () => this.addField());

        const submitButton = document.getElementById('submitForm') as HTMLButtonElement;
        submitButton.addEventListener('click', () => this.submitForm());

        const exportButton = document.getElementById('exportData') as HTMLButtonElement;
        exportButton.addEventListener('click', () => this.exportData());
    }

    private addField() {
        const fieldType = (document.getElementById('fieldType') as HTMLSelectElement).value;
        const fieldLabel = (document.getElementById('fieldLabel') as HTMLInputElement).value;
        const fieldRequired = (document.getElementById('fieldRequired') as HTMLInputElement).checked;

        let options: string[] = [];
        if (fieldType === 'multiple-choice' || fieldType === 'checkbox') {
            const optionsInput = (document.getElementById('fieldOptions') as HTMLInputElement).value;
            options = optionsInput.split(',').map(option => option.trim());
        }

        if (fieldLabel) {
            const newField: FormField = { type: fieldType, label: fieldLabel, options, required: fieldRequired };
            this.fields.push(newField);
            this.saveForms();
            this.renderFormPreview();
            this.renderFormList();
        } else {
            alert('Field label cannot be empty');
        }
    }

    private renderFormPreview() {
        const formPreview = document.getElementById('formPreview')!;
        formPreview.innerHTML = '';

        this.fields.forEach((field, index) => {
            const fieldDiv = document.createElement('div');
            fieldDiv.className = 'field';
            fieldDiv.innerHTML = this.getFieldHTML(field, index);
            formPreview.appendChild(fieldDiv);
        });
    }

    private getFieldHTML(field: FormField, index: number): string {
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

    private renderFormList() {
        const formList = document.getElementById('formList')!;
        formList.innerHTML = '<h2>Form Fields</h2>';
        this.fields.forEach((field, index) => {
            const fieldDiv = document.createElement('div');
            fieldDiv.innerHTML = `${field.label} <button class="delete-field" data-index="${index}">Delete</button>`;
            formList.appendChild(fieldDiv);
        });
    
        // Add event listener for delete buttons
        const deleteButtons = document.querySelectorAll('.delete-field');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const index = (event.currentTarget as HTMLButtonElement).dataset.index;
                this.deleteField(parseInt(index!));
            });
        });
    }

    public deleteField(index: number) {
        this.fields.splice(index, 1);
        this.saveForms();
        this.renderFormPreview();
        this.renderFormList();
    }

    private saveForms() {
        localStorage.setItem('formFields', JSON.stringify(this.fields));
    }

    private loadForms() {
        const savedFields = localStorage.getItem('formFields');
        if (savedFields) {
            this.fields = JSON.parse(savedFields);
            this.renderFormPreview();
            this.renderFormList();
        }
    }

    private submitForm() {
        const formData: any = {};
        let allFieldsValid = true; // Flag to check if all required fields are filled
    
        this.fields.forEach((field, index) => {
            let inputValue: any;
    
            if (field.type === 'text') {
                const input = document.querySelector(`input[type="text"]:nth-of-type(${index + 1})`) as HTMLInputElement;
                inputValue = input ? input.value : null;
            } else if (field.type === 'multiple-choice' || field.type === 'checkbox') {
                const checkedOptions = Array.from(document.querySelectorAll(`input[name="field${index}"]:checked`)) as HTMLInputElement[];
                inputValue = checkedOptions.map(option => option.nextSibling?.nodeValue?.trim());
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
            this.renderFormPreview();
        }
    }
    
    private resetFormFields() {
        // Reset text inputs
        const textInputs = document.querySelectorAll('input[type="text"]');
        textInputs.forEach(input => {
            (input as HTMLInputElement).value = '';
        });
    
        // Reset checkboxes
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            (checkbox as HTMLInputElement).checked = false;
        });
    
        // Reset radio buttons
        const radioButtons = document.querySelectorAll('input[type="radio"]');
        radioButtons.forEach(radio => {
            (radio as HTMLInputElement).checked = false;
        });
    }

    private exportData() {
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
(window as any).formBuilder = formBuilder; 
