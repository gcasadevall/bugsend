import BaseComponent from './base-component.js';

export default class BotonStatus extends BaseComponent {

    constructor() {
      super();
  
      let currentStatus = this.getAttribute('status');

      if(currentStatus) {
        this.status = currentStatus;
      } else {
        this.status = 'neutral';
      }

    }
  
    static get observedAttributes() {
      return ['status'];
    }
  
    attributeChangedCallback(attr, oldVal, newVal) {
      console.log('attributeChangedCallback');
      if(attr == 'status' && oldVal != newVal) {
        this.status = newVal;
        console.log(this.status);
        this.shadowRoot.innerHTML = this.template;
      }
    }

    get status() {
      return this.getAttribute("status");
    }

    set status(status) {
      this.setAttribute("status",status);
    }
  
    
    get template() {
      return `
        <style>
          div {
            display: inline-block;
            color: #fff;
            border-radius: 3px;
            padding: 10px;
            cursor:pointer;
            outline:none;
            animation-duration: 0.3s; 
            animation-timing-function: ease-in;
            background-color: #000;
          }
          div:active{ 
            animation-name: anim; 
          }
          @keyframes anim { 
            0% {transform: scale(1);} 
            10%, 40% {transform: scale(0.7) rotate(-1.5deg);}  
            100% {transform: scale(1) rotate(0);} 
          } 
          /*.neutral {
            background-color: #888;
          }*/
          .danger {
            background-color: #d66;
          }
          .success {
            background-color: #3a6;
          }
        </style>

        <div class="${this.status}"><slot></slot></div>
      `;
    }
  
  }
  
  window.customElements.define('boton-status', BotonStatus);