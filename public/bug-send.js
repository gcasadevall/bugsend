
import MyError from './error.js';
import BaseComponent from './base-component.js';

export default class BugSend extends BaseComponent {
    
    connectedCallback() {
        
        this.loadUserData();
        
        this.shadowRoot.querySelector("#edit").addEventListener('click', this.toggle.bind(this));  
        this.shadowRoot.querySelector("#capture").addEventListener('click', this.capture.bind(this));  
        this.shadowRoot.querySelector("#close").addEventListener('click', this.toggle.bind(this)); 
        this.shadowRoot.querySelector("#send").addEventListener('click', this.send.bind(this)); 
    }

    disconnectedCallback() {
        this.shadowRoot.querySelector("#edit").removeEventListener('click', this.toggle);
        this.shadowRoot.querySelector("#capture").removeEventListener('click', this.capture);
        this.shadowRoot.querySelector("#close").removeEventListener('click', this.toggle);        
        this.shadowRoot.querySelector("#send").removeEventListener('click', this.send); 
    }

    toggle(){
        this.shadowRoot.querySelector('#edit').classList.toggle('active');
        this.shadowRoot.querySelector('#feedback-form').classList.toggle('active');
        this.shadowRoot.querySelector('#feedback-form').classList.remove('send');
    }
      
    validate() {        
        // que no se este capturando datos
        // que se haya ingresado un detalle del error.
        let shortDesc = this.shadowRoot.querySelector('#shortDesc');
        if (!shortDesc.value) {
            throw new MyError("Write a short descripcion of the bug.");
        }      
    }

    clear() {
        console.log("vacío los datos del form y video etc.");
        let shortDesc = this.shadowRoot.querySelector('#shortDesc').value="";
        this.msg("");
    }

    msg(error) {
        let msg = this.shadowRoot.querySelector("#msg").textContent = error; 
    }

    async capture() {
        try {

            let mediaStreamObj = await navigator.mediaDevices.getDisplayMedia({video: true});

            let videoCapture = this.shadowRoot.querySelector("#videoCapture");
            let videoSave    = this.shadowRoot.querySelector("#videoSave");
            

            if ("srcObject" in videoCapture) {
                videoCapture.srcObject = mediaStreamObj;
            } else {                
                videoCapture.src = window.URL.createObjectURL(mediaStreamObj);
            }
            
            let mediaRecorder = new MediaRecorder(mediaStreamObj);
            let chunks = [];
            
            mediaRecorder.start();
            
            mediaRecorder.onstart = (ev)=>{
                console.log("onstart mediaRecorder: "+mediaRecorder.state);
            }

            mediaRecorder.ondataavailable = (ev)=> {
                console.log("ondataavaiable mediaRecorder.state: "+mediaRecorder.state);            
                chunks.push(ev.data);
            }

            mediaRecorder.onstop = (ev)=>{
                console.log("onstop mediaRecorder.state: "+mediaRecorder.state);
                let blob = new Blob(chunks, { 'type' : 'video/mp4;' });
                chunks = [];              
                videoSave.src = window.URL.createObjectURL(blob);       
            }

        } catch (e) {            
            console.log('No se habilitó captura: ' + e);
        }
    }

    async loadUserData() {

        /*this.userAgent = navigator.userAgent; 

        
        try {
            const response = await fetch('https://jsonip.com', { mode: 'cors' });            
            const retval = await response.json();                
            
            this.data.userIp = retval.ip;

        } catch(err) {
            this.data.userIP = "No se pudo obtener IP.";           
        } 
          */         
   }

   async send(datos){
        try {

            // Validate form fields
            this.validate();
            
            // Call api
            console.log("enviando a la api...")

            let senddata = { method: 'POST', headers: {'Content-Type': 'application/octet-stream'}, body: datos };

            const response = await fetch('http://localhost/bug', senddata);
            
            // evualuate result and close
            console.log("result: "+response);

            // Hide form.
            this.shadowRoot.querySelector('#feedback-form').classList.add('send'); 
            setTimeout(this.toggle.bind(this),500);

            // Clear form.
            this.clear();

        } catch (err) {
            if (err instanceof MyError) {
                this.msg(err.msg);       
                console.log("myerr: "+err.msg);                
            } else {   
                console.log("error al enviar datos a api "+err);     
            }
        }
   }

   get template() {
    return `
        <style>
        * {
            box-sizing:border-box;
            margin:0px;
            padding:0px;
            font-family: 'Roboto Condensed', sans-serif;
        }

        body {
            height:100vh;
            display:flex;
            justify-content:center;
            align-items:center;
            overflow:hidden;
        }

        #feedback-form {
            position:fixed;
            right: 15px;                 
            width:50px;
            height:50px;
            border-radius:50%;
            opacity:0;
            z-index:2;
            background:#fff;
            box-shadow:0px 4px 5px 1px rgba(100,100,100,0.6);
        }

        #feedback-form.send {
            animation:sendIt 800ms ease forwards !important;
        }
        
        #feedback-form #close {
            position:absolute;
            top:-10px;
            right:-10px;
            background:rgba(0,0,0,0.5);
            color:#e7e7e7;
            width:22px;
            height:22px;
            text-align:center;
            line-height:22px;
            border-radius:50%;
            z-index:3;
            cursor:pointer;

        }

        #feedback-form .title {
            padding:12px 15px;
            font-size:18px;
            color:#fff;
            background:#55acee;                                
        }

        #feedback-form .row {
            display:flex;
            width:100%;
            border-bottom:1px solid rgba(100,100,100,0.5);
        }

        #feedback-form .msg {  
            width:100%;            
            color:red;
            height:20px;
            text-align: center;
            font-size:12px;
        }

        #feedback-form .row > *{
            flex:1;
            width:100%;
            border-top:none;
            border-bottom:none;
            border-right:1px solid #eee;
            border-left:1px solid #eee;
            outline:none;
            outline:none;
        }
        #feedback-form .row > input {
            padding:5px;
        }
        #feedback-form .row > textarea {
            padding:5px;
            height:60px;
            resize:none;
        }
        #feedback-form .submit-btn-row{
            display:flex;
            flex-direction:row-reverse;
            height:35px;
        }
        #feedback-form .submit-btn-row >* {
            height:100%;
            width:100px;                
            border:none;                
        }

        #feedback-form.active {
            opacity:1;                
            width:350px;
            height:340px;
            border-radius:5px;    
        }

        .video {
            margin: 5px;
            opacity: 0.7;
        }
       
        #feedback-form .button {
            margin-left: 5px;
            background-color: #3183d7;
            border-radius: 35px;             
            margin-right: 5px;
            margin-top: 5px;
            color: black;
            inline-size: auto;
        }

        .edit-btn {
            position:fixed;
            bottom:30px;
            right:30px;
            display:inline-block;
            font: normal normal normal 14px/1 FontAwesome;
            font-size: inherit;
            text-rendering: auto;
            -webkit-font-smoothing: antialiased;  
            width:45px;
            height:45px; 
            background:#3183d7;
            color:#eee;
            text-align:center;
            line-height:50px;
            font-size:22px;
            border-radius:50%;
            transition:all 500ms linear;
            opacity:0.85;
            z-index:1;
        }
       

        .edit-btn.active {   
            opacity: 0;
        }

        @keyframes sendIt {
            0% {
                transform:translateY(0px);
            }
            20%{
                transform:translateY(20px);
            }
            100%{
                transform:translateY(-500px);
            }
        }     
        
        </style>
    
        <div id="feedback-form">

            <div id="close">
                &times;
            </div>

            <div class="title">
                Bug Feedback 
            </div>
            
            <div class="row">
                <textarea placeholder="Write your feedback here" id="shortDesc"></textarea>   
            </div>
            
            <div class="row">
                <video autoplay poster id="videoCapture" width="300" height="150" style="display:none"></video>                                            
                <video autoplay poster controls id="videoSave" class="video" width="300" height="150"></video>
            </div>
               
            <div class="msg">
                <i id="msg"></i>
            </div>

            <div class="submit-btn-row">

                    <img alt="send" id="send" class="button" width="20" height="20" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAABGdBTUEAALGPC/xhBQAAAAFzUkdC
                    AK7OHOkAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAASZQTFRF
                    AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
                    AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
                    AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
                    AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
                    AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
                    AAAAAAAA////BmjS4wAAAGB0Uk5TAAIkbKrT8zGP2/z66uEuARSA5uipbkcqHiur43y4/YYtBQYw
                    ijLOtjQ3lRYstwy0E7W6eeU1OGQKiyUvyPlf6dr+x78prGZvvid3oEj0aMPEza9lKA8OPLt4s5Y6
                    dqHUYkVF6AAAAAFiS0dEYbKwTIYAAAAJcEhZcwAACxMAAAsTAQCanBgAAAGnSURBVDjLdZNpX4JA
                    EMYHvHU9AjXNUrxLLa3soEsptcuyO83K+f6fomULYgXnzQ6//8DOMM8DYIQgutweL6LX43aJAsyH
                    4PMHghgi4TAJYTDgj0R5HluSUI4nksupVDqZWCGYWY1ZeWQtK+WUvPFYKJbk7Frkn5crWF3nrhU2
                    qlgpm+9XgrX6fFP1WrDS+Lt/E2tbtq5hq4bNlp5El3C7Dg5R38Fd1kBb2gPH2JfaPnr4MWdnxYND
                    +m0VVYCjgHxs48rJ6Rk9jjtdEVxaPG/j53jRo2e+rw0gjpcO/OqaZTd4C57QcCGHYcgDdyS9kEOa
                    3AGGU3p6eK/YOaTCaBTcn46WbZwVeAn748oD6hU8hwbxmk2mRzjqNXjOmjTHpBUnjzxnY7q0lYJZ
                    MccLT9oziF3iM4babr5wE/sI/dV0WSVDoK9vHKfLKukbycj7zut+72SYLlex6iyYMU5YslhyH63f
                    lIp2ahft1BQtk/14g5f959giezpgMyupEYtxVFlrcltu7bZR7n/9Wu/riVpv0uKvFIqq1bwlxcHf
                    4uB7ptt/djuw2P8HZ6ZIM6mwcrkAAAAldEVYdGRhdGU6Y3JlYXRlADIwMTctMDQtMjFUMTM6MTY6
                    MTArMDI6MDAGaocRAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDE3LTA0LTIxVDEzOjE2OjEwKzAyOjAw
                    dzc/rQAAAEZ0RVh0c29mdHdhcmUASW1hZ2VNYWdpY2sgNi43LjgtOSAyMDE2LTA2LTE2IFExNiBo
                    dHRwOi8vd3d3LmltYWdlbWFnaWNrLm9yZ+a/NLYAAAAYdEVYdFRodW1iOjpEb2N1bWVudDo6UGFn
                    ZXMAMaf/uy8AAAAYdEVYdFRodW1iOjpJbWFnZTo6aGVpZ2h0ADUxMsDQUFEAAAAXdEVYdFRodW1i
                    OjpJbWFnZTo6V2lkdGgANTEyHHwD3AAAABl0RVh0VGh1bWI6Ok1pbWV0eXBlAGltYWdlL3BuZz+y
                    Vk4AAAAXdEVYdFRodW1iOjpNVGltZQAxNDkyNzczMzcwVL42PwAAABN0RVh0VGh1bWI6OlNpemUA
                    MTQuOEtCQsxIoEAAAABQdEVYdFRodW1iOjpVUkkAZmlsZTovLy4vdXBsb2Fkcy9jYXJsb3NwcmV2
                    aS9ZYjNaMzluLzEyNDQvMTQ5Mjc5MDg2MC04Y2hlY2tfODQxNjQucG5nCHtDygAAAABJRU5ErkJg
                    gg==
                    "/>
               
                <img id="capture" class="button" alt="capture" width="20" height="20" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABGdBTUEAALGPC/xhBQAAAAFzUkdC
                AK7OHOkAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAAlwSFlz
                AAAOxAAADsQBlSsOGwAAAAFiS0dEYbKwTIYAAAAldEVYdGRhdGU6Y3JlYXRlADIwMTctMDQtMjFU
                MTM6MTY6MTArMDI6MDAGaocRAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDE3LTA0LTIxVDEzOjE2OjEw
                KzAyOjAwdzc/rQAAAEZ0RVh0c29mdHdhcmUASW1hZ2VNYWdpY2sgNi43LjgtOSAyMDE2LTA2LTE2
                IFExNiBodHRwOi8vd3d3LmltYWdlbWFnaWNrLm9yZ+a/NLYAAAAYdEVYdFRodW1iOjpEb2N1bWVu
                dDo6UGFnZXMAMaf/uy8AAAAYdEVYdFRodW1iOjpJbWFnZTo6aGVpZ2h0ADUxMsDQUFEAAAAXdEVY
                dFRodW1iOjpJbWFnZTo6V2lkdGgANTEyHHwD3AAAABl0RVh0VGh1bWI6Ok1pbWV0eXBlAGltYWdl
                L3BuZz+yVk4AAAAXdEVYdFRodW1iOjpNVGltZQAxNDkyNzczMzcwVL42PwAAABN0RVh0VGh1bWI6
                OlNpemUAMTQuOEtCQsxIoEAAAABQdEVYdFRodW1iOjpVUkkAZmlsZTovLy4vdXBsb2Fkcy9jYXJs
                b3NwcmV2aS9ZYjNaMzluLzEyNDQvMTQ5Mjc5MDg2MC04Y2hlY2tfODQxNjQucG5nCHtDygAABRdJ
                REFUWEe1V1sopm8QHx/WBbnBSg67icSFM8nKRuRcG3LpVHK8kAillC0u3GzZG27c4cLFKiJCjkty
                PmW3ZCWSYyghnv/zG+/r/x197N//V2/v987MMzPfPPPMzGMhJMgMHh4eaHt7mwYGBmh8fJw2Nzdp
                Z2eHrq6umG9nZ0cfP34kX19fio6OpsTERPL09CSNRsP8ZwEHTOH+/l4sLCyI8vJy4eXlJSwtLeGs
                sLa2Fk5OTsLDw4Mf/AYNPMhAFmuWl5eFdF7RZhwmI3B8fEzfv3+ntrY2Ojg4IGdnZ/r8+TN9+vSJ
                fHx8yN3dnf85cHl5SXt7e7S1tUUTExM0NjZGR0dH5ObmRoWFhVRUVESOjo4sawB2Qw/wPCEhQcgQ
                ChcXF1FbWytWVlbE7e2tImEaNzc3YnFxUVRVVQnpNOuALug0BgMH5ufnRVBQEIczKSlJzM3N8Va8
                FlgzMzPDOqALOqFbHzoOwEsIYh9LSkrE4eGhwvl7QAd0QSd0r66uKpxHPDkg90zI7GVvseCtAZ3Q
                nZKSImR+KVTFAWRqfX09CyQnJ7/JP9cHdMbHx7ONxsZGhaqcAnnUKC0tDc5QT08PhYWFSTldgBcS
                EkKZmZkKxRDd3d0EXaYgc4LS09PJwsKCent7SW4JK+YzK/mc7dpYX18XsvDwU1dXJ37//q1wjAN8
                VR4P1msDka6srGRbeAP069cvLhw4MktLS0wEcIwgqD42NjYK53lor8EDPXhUwMb79++Ft7c3O0wt
                LS1ChkRkZWXpnHMslqVX+XrExcWFyMvLY/nw8HDR0NDAb3yDDr42sF51RAVsZGRk8JrW1lahQeWS
                dIqMjCRZTqWsLmRhIVlI+Dfq/OjoKA0ODtLs7CznDd5DQ0NMB98cYAM5BpvT09Ok2djYYCLKqzGc
                np7S1NQUL4AzMIgSjAQKDg7mt62tLdPBfwkCAgLYpixMhMXcTNbW1hChJ0g5nS2QJ0CcnZ2xbFlZ
                mUJ9BL5BB18bxrYAgC3IwzYc4o72588fhf0IfQeQhDExMaK6ulqh6AJ08OUxViimHYAt2AT9BQ37
                ETJ5uAPKzFUougAd3c/BwUGhvAwa7Of19TXJDFZIxmFlZUWpqanU39/PrVcb+AYdSYn9NQfYgk3Y
                1mCSOT8/N1CqD0QgPz+fK5i9vT3V1NSQbNX8xjfo4KszwnOALdiEbY2fnx/d3d3xMGEOOTk5fCS/
                fv1KFRUVPKjgjW/Qs7OzFcnnIbsu20RpfypEssbzMKFCyukkoYquri7x4cMHHsFk7eA3vkHXh7Ek
                hI0vX76wTTltCSQPl0UcC8x/Kkw58BoYcwA2YEstxVayD5Ds0fTt2zfq7OykwMBA7laurq7U3t5O
                u7u7cv3fYXh4mPWokPapo6OD58Xc3FyCbW7H2BNkOPblx48fFBERwaVVdiw6OTlRlr8eOJLNzc38
                OzY2liYnJ0n2AXr37h319fWRv7//v7GRicShwgz3fw0kcXFxbKOpqUmhypAob4ORTI7aCue/A7rU
                kUxG2nAkU6E9lBYXF79JJKADuswOpSq0x3KEDKP1347lsos+hR06zY7lKtCtML2qFxOMT4jOay4m
                WIMpC+cduvS7rQqTVzNkP65luJ7t7+/z1SwqKorkBMT13tjVDKfp58+fPD+oV7PS0lIqKCgw3aTY
                DRNAGNV/89rLKeZAXOfMbd+rrucjIyP87zDJyJ6ucz2X5ZhCQ0N5tMOZf9n1nOgfC0XvfH+ORJ0A
                AAAASUVORK5CYII=
                "/>          
            </div>
            
    
        </div>

        <div class="edit-btn" id="edit">            
        <img alt="Logo" width="20" height="20" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAADhUlEQVR42sWXSWxNURjHv6ZYmIpS
        FBUxxZSSoGi0NlioocRUgpCIVAxhwUKDsGBBihAbNcQsVKtsbLRiliBFzWIuVbSGhSHx/+d8V67j
        3tvX3rZO8st7757zzvufbzwvSv7ziAr5/db6+r6+BUwBq0Fv/VwC1oCj9SFgMdgCDoCD+iwDzABL
        wNa6FBAPnoAr4BSI0+fvwFgwBHQBr+tCQC+QDUbp5zfgrb5vC9rr+7NqiZLaFECf7wVPwWaQB8qs
        NW3AeLBMrTBbIogJR0Bf8Am89FjTE9wC+0Am+FnFng3ADjALJIL7Hms6gRhw2xFAsz0GCzwWbwLp
        oDv4FaHFosFDkAuWe8zvBF3BSEfALjEpNdRjMTf5CmZG+OPO2A+aqHh7XAJ3wTxHwBgxUT0cXHAt
        ZMqt1Wdp1RRQAAaDheCY63kyOC8ma067g5Bu6KNiboD5aqqrYjKAgfUhwh9vJSZgmY6MoXEqaAB/
        FNyh+bnQLaC5TiaBHDBaRa1Ucz0Di1RQ0OCpt4HOYty6W8VfBHPF1BAestIWwMHgyVTTd9OFZ3Qj
        Vr1EPRVPUAp+6PcagnZqQRYrZk2GCp8sJh0fiamSzJA/wexXB5iWxWr6e5b/UkAPMXmfpM95KtaF
        B6BI/o6j/upSe69AAangHOgIXgWYO1df0wPWJKj7ktUN1RLQAlSEFMCCwyI3AhR6CWgpJgDdg03l
        cC0LmAYuW3OVUToZ4/PlDhLc2SIRwKD0c2MFBTA44qwJdrZDYlLqWkgBg8Sk7nQxHdQ9yvxigA3l
        i5iUzAkpgLnP1GsqHo0sqB0zYF5IcA+IRAB7ArtfqteknwCWT1YzNif68HMNBTQTE0NsPqyi/7Rm
        WwAzYruYiGWlY3BuAOtqKCBLTClnJrFSMrPYnD56CYgVUyiYkrzVHNENVoCBYspqdQSwfF8HG/UA
        U8XcptgDhoFyW8AJMVHPGuDcjBqJKau0DH1op5OfAKZvoZ6UFfC7PmdlZS1gVkx0C3DqNe90+dZm
        8boZG9UkXRckgC33uJiGQ9F2HWFrztN1Nx0BNBEvkQk+vqT/eKlg88lWs5ZbAmLVXUvFNCd2wVKf
        /Z6LueRmOQIK1DcZ4j+idfNV6pqToJ/OsXNOUFOvV5FB90e2dsZamiMgRf1VLFUPptYcMZnibseM
        8D3in7LuQeGMq6Kwf04b6+u3mm4QVkDo8Rv3pctM3M7B6wAAAABJRU5ErkJggg==" />
        </div>        
    `;
}


}

customElements.define('bug-send', BugSend);

