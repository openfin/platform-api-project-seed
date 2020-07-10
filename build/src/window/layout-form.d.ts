export class LayoutForm extends HTMLElement {
    templateStorageKey: string;
    saveAsTemplate: () => Promise<void>;
    hideElement: () => void;
    showElement: () => void;
    toggleVisibility: () => void;
    cancel: () => void;
    render: () => any;
}
