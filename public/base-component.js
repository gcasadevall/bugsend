import {config} from './config.js';

export default class BaseComponent extends HTMLElement {

    constructor() {
        super();
    
        this.attachShadow({mode: 'open'});

        this.repaint();
    }

    get template() {
        throw Error("MyLib: la clase debe implementar el método get template().");
    }

    get globalcss() {
        return ` <link rel="stylesheet" href="mylib.css"> `;
    }

    repaint() {
        this.shadowRoot.innerHTML = this.globalcss + this.template;
    }
    
}