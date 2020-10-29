/**
 * Componente base 
 */
export default class BaseComponent extends HTMLElement {

    constructor() {
        super();
    
        let shadowRoot = this.attachShadow({mode: 'open'});
  
        shadowRoot.innerHTML = this.template;
    }

    get template() {
        throw Error("MyLib: la clase debe implementar el método get template().");
    }

    get globalcss() {
        return ` <link rel="style" href="./mylib.css" /> `;
    }
    
}