(function(){"use strict";var e={2245:function(e,t,a){var r=a(5130),s=a(6768);const o={class:"p-5 dark:bg-gray-900 antialiased"};function n(e,t,a,r,n,i){const c=(0,s.g2)("ToggleLightDarkMode"),l=(0,s.g2)("SecondaryComp");return(0,s.uX)(),(0,s.CE)("div",o,[(0,s.bF)(c),(0,s.bF)(l)])}a(4603),a(7566),a(8721);var i=a(4232),c=a(144);a(4114);let l,d=null==localStorage.getItem("apiVersion")?"60.0":localStorage.getItem("apiVersion"),u={async getSession(e){e=p(e);const t="access_token",a=window.location.href.includes(t),r=localStorage.getItem(e+"_"+t);if(this.instanceHostname=e,a){if(window.location.href.includes(t)){const a=new URL(window.location.href),r=new URLSearchParams(a.hash.substring(1)),s=decodeURI(r.get(t));e=decodeURI(r.get("instance_url")).replace(/^https?:\/\//i,""),this.sessionId=s,localStorage.setItem(e+"_"+t,s)}}else if(r)this.sessionId=r;else{let t=await new Promise((t=>chrome.runtime.sendMessage({message:"getSession",sfHost:e},t)));t&&(this.instanceHostname=p(t.hostname),this.sessionId=t.key)}const s="isSandbox";null==localStorage.getItem(e+"_"+s)&&u.rest("/services/data/v"+d+"/query/?q=SELECT+IsSandbox,+InstanceName+FROM+Organization").then((t=>{localStorage.setItem(e+"_"+s,t.records[0].IsSandbox),localStorage.setItem(e+"_orgInstance",t.records[0].InstanceName)}))},async rest(e,{logErrors:t=!0,method:a="GET",api:r="normal",body:s,bodyType:o="json",responseType:n="json",headers:i={},progressHandler:c=null}={}){if(!this.instanceHostname)throw new Error("Instance Hostname not found");let d=new XMLHttpRequest;e+=(e.includes("?")?"&":"?")+"cache="+Math.random();const u="https://"+this.instanceHostname;if(d.open(a,u+e,!0),d.setRequestHeader("Accept","application/json; charset=UTF-8"),"bulk"==r)d.setRequestHeader("X-SFDC-Session",this.sessionId);else{if("normal"!=r)throw new Error("Unknown api");d.setRequestHeader("Authorization","Bearer "+this.sessionId)}if(void 0!==s)if("json"==o)s=JSON.stringify(s),d.setRequestHeader("Content-Type","application/json; charset=UTF-8");else if("raw"!=o)throw new Error("Unknown bodyType");for(let[l,p]of Object.entries(i))d.setRequestHeader(l,p);if(d.responseType=n,await new Promise(((e,t)=>{c&&(c.abort=()=>{let e=new Error("The request was aborted.");e.name="AbortError",t(e),d.abort()}),d.onreadystatechange=()=>{4==d.readyState&&e()},d.send(s)})),d.status>=200&&d.status<300)return d.response;if(0==d.status){t||console.error("Received no response from Salesforce REST API",d);let e=new Error;throw e.name="SalesforceRestError",e.message="Network error, offline or timeout",e}if(401==d.status){let e=d.response.length>0?d.response[0].message:"New access token needed";localStorage.getItem(this.instanceHostname+"_access_token")&&(l=e,f());let t=new Error;throw t.name="Unauthorized",t.message=e,t}{t||console.error("Received error response from Salesforce REST API",d);let e=new Error;e.name="SalesforceRestError",e.detail=d.response;try{e.message=e.detail.map((e=>`${e.errorCode}: ${e.message}${e.fields&&e.fields.length>0?` [${e.fields.join(", ")}]`:""}`)).join("\n")}catch(m){e.message=JSON.stringify(d.response)}throw e.message||(e.message="HTTP error "+d.status+" "+d.statusText),e}},wsdl(e,t){let a={Enterprise:{servicePortAddress:"/services/Soap/c/"+e,targetNamespaces:' xmlns="urn:enterprise.soap.sforce.com" xmlns:sf="urn:sobject.enterprise.soap.sforce.com"',apiName:"Enterprise"},Partner:{servicePortAddress:"/services/Soap/u/"+e,targetNamespaces:' xmlns="urn:partner.soap.sforce.com" xmlns:sf="urn:sobject.partner.soap.sforce.com"',apiName:"Partner"},Apex:{servicePortAddress:"/services/Soap/s/"+e,targetNamespaces:' xmlns="http://soap.sforce.com/2006/08/apex"',apiName:"Apex"},Metadata:{servicePortAddress:"/services/Soap/m/"+e,targetNamespaces:' xmlns="http://soap.sforce.com/2006/04/metadata"',apiName:"Metadata"},Tooling:{servicePortAddress:"/services/Soap/T/"+e,targetNamespaces:' xmlns="urn:tooling.soap.sforce.com" xmlns:sf="urn:sobject.tooling.soap.sforce.com" xmlns:mns="urn:metadata.tooling.soap.sforce.com"',apiName:"Tooling"}};return t&&(a=a[t]),a},async soap(e,t,a,{headers:r}={}){if(!this.instanceHostname||!this.sessionId)throw new Error("Session not found");let s=new XMLHttpRequest;s.open("POST","https://"+this.instanceHostname+e.servicePortAddress+"?cache="+Math.random(),!0),s.setRequestHeader("Content-Type","text/xml"),s.setRequestHeader("SOAPAction",'""');let o="Metadata"==e.apiName?"met:SessionHeader":"SessionHeader",n="Metadata"==e.apiName?"met:sessionId":"sessionId",i="Metadata"==e.apiName?`met:${t}`:t,c=['xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"','xmlns:xsd="http://www.w3.org/2001/XMLSchema"','xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"'];"Metadata"==e.apiName&&c.push('xmlns:met="http://soap.sforce.com/2006/04/metadata"');let l=m.stringify({name:"soapenv:Envelope",attributes:` ${c.join(" ")}${e.targetNamespaces}`,value:{"soapenv:Header":Object.assign({},{[o]:{[n]:this.sessionId}},r),"soapenv:Body":{[i]:a}}});if(s.responseType="document",await new Promise((e=>{s.onreadystatechange=()=>{4==s.readyState&&e(s)},s.send(l)})),200==s.status){let e=s.response.querySelector(t+"Response"),a=m.parse(e).result;return a}{console.error("Received error response from Salesforce SOAP API",s);let e=new Error;e.name="SalesforceSoapError",e.detail=s.response;try{e.message=s.response.querySelector("faultstring").textContent}catch(d){e.message="HTTP error "+s.status+" "+s.statusText}throw e}},asArray(e){return e?e instanceof Array?e:[e]:[]}};class m{static stringify({name:e,attributes:t,value:a}){function r(e,t){if(null==t)e.setAttribute("xsi:nil","true");else if("object"==typeof t)for(let[a,o]of Object.entries(t))if("_"==a)null==o?e.setAttribute("xsi:nil","true"):e.textContent=o;else if("$xsi:type"==a)e.setAttribute("xsi:type",o);else if(void 0===o);else if(Array.isArray(o))for(let t of o){let o=s.createElement(a);r(o,t),e.appendChild(o)}else{let t=s.createElement(a);r(t,o),e.appendChild(t)}else e.textContent=t}let s=(new DOMParser).parseFromString("<"+e+t+"/>","text/xml");return r(s.documentElement,a),'<?xml version="1.0" encoding="UTF-8"?>'+(new XMLSerializer).serializeToString(s).replace(/ xmlns=""/g,"")}static parse(e){function t(e){let a="",r=null;if("true"==e.getAttribute("xsi:nil"))return null;let s=e.getAttribute("xsi:type");s&&(r={"$xsi:type":s});for(let o=e.firstChild;null!=o;o=o.nextSibling)if(o instanceof CharacterData)a+=o.data;else{if(!(o instanceof Element))throw new Error("Unknown child node type");{null==r&&(r={});let e=o.localName,a=t(o);e in r?r[e]instanceof Array?r[e].push(a):r[e]=[r[e],a]:r[e]=a}}return r||a}return t(e)}}function p(e){if(e){const t=e.replace(/\.lightning\.force\./,".my.salesforce.").replace(/\.mcas\.ms$/,"");return t}return e}function f(){const e=document.getElementById("invalidTokenBanner");e&&e.classList.remove("hide");const t=document.getElementById("mainTabs");t&&t.classList.add("mask")}const g=e=>{const t=new Date(e),a={day:"2-digit",month:"2-digit",year:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!0};return t.toLocaleString("en-IN",a)},v=["type"];var h={__name:"PrimaryButton",props:{type:{type:String,default:"submit"},isRed:Boolean},setup(e){return(t,a)=>((0,s.uX)(),(0,s.CE)("button",{type:e.type,class:(0,i.C4)({"bg-gray-800 dark:text-gray-800 dark:hover:bg-white":!e.isRed,"bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 dark:text-gray-100 focus:bg-red-700 focus:ring-red-500":e.isRed,"inline-flex items-center px-4 py-2 dark:bg-gray-200 border border-transparent rounded-2xl font-semibold text-xs text-white  uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 dark:active:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition ease-in-out duration-150":!0})},[(0,s.RG)(t.$slots,"default")],10,v))}};const y=h;var _=y;const b=["value"];var x={__name:"TextInput",props:{modelValue:String},emits:["update:modelValue"],setup(e,{expose:t}){const a=(0,c.KR)(null);return(0,s.sV)((()=>{a.value.hasAttribute("autofocus")&&a.value.focus()})),t({focus:()=>a.value.focus()}),(t,r)=>((0,s.uX)(),(0,s.CE)("input",{ref_key:"input",ref:a,class:"text-base border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm py-1 px-2 border outline-indigo-500 dark:outline-none",value:e.modelValue,onInput:r[0]||(r[0]=e=>t.$emit("update:modelValue",e.target.value))},null,40,b))}};const w=x;var k=w;const S=(0,s.Lk)("circle",{class:"opacity-25",cx:"12",cy:"12",r:"10",stroke:"currentColor","stroke-width":"4"},null,-1),E=(0,s.Lk)("path",{class:"opacity-75",fill:"currentColor",d:"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"},null,-1),R=[S,E];var L={__name:"LoadingCircle",props:{cssStyle:{type:String}},setup(e){return(t,a)=>((0,s.uX)(),(0,s.CE)(s.FK,null,[((0,s.uX)(),(0,s.CE)("svg",{class:(0,i.C4)(["animate-spin",e.cssStyle]),xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24"},R,2)),(0,s.RG)(t.$slots,"default")],64))}};const C=L;var I=C;const M={class:"block font-normal text-sm text-gray-600 dark:text-gray-300"};var A={__name:"TextDesc",props:{},setup(e){return(e,t)=>((0,s.uX)(),(0,s.CE)("p",M,[(0,s.RG)(e.$slots,"default")]))}};const T=A;var N=T;const D={class:"block font-semibold text-xl text-gray-600 dark:text-gray-300"};var O={__name:"PrimaryHeading",props:{},setup(e){return(e,t)=>((0,s.uX)(),(0,s.CE)("p",D,[(0,s.RG)(e.$slots,"default")]))}};const P=O;var F=P,$=a(772);const H={key:1},j={key:2},V={key:0,class:"mt-4 mb-2"},q={key:1},X={class:"text-left ml-2"},B={class:"text-center my-1.5"},K=["href"],U={name:"indexComp"};var W=Object.assign(U,{setup(e){const t=(0,c.KR)([]),a=(0,c.KR)(["Name","LastModifiedBy.Name","LastModifiedDate"]),r=(0,c.KR)(""),o=(0,c.KR)("LastModifiedDate"),n="desc",l=(0,c.KR)([{text:"Id",value:"Id"},{text:"Name",value:"Name",sortable:!0},{text:"Version",value:"vlocity_cmt__Version__c"},{text:"LastModified By",value:"LastModifiedBy.Name"},{text:"LastModified Date",value:"LastModifiedDateNew",sortable:!0},{text:"Actions",value:"Actions",width:200}]),m=(0,c.KR)(""),p=(0,c.KR)(!1),f=(0,c.KR)(""),v=(0,c.KR)(""),h=(0,c.KR)(""),y=(0,c.KR)("OmniScripts Loaded"),b=(0,c.KR)("FlexCards Loaded"),x=(0,c.KR)("Integration Procedures Loaded"),w=(0,c.KR)("DataRaptors Loaded"),S=e=>new Promise(((t,a)=>{u.getSession(f.value).then((()=>{console.log("getSession inside");let r=u.rest(e);r.then((e=>{t(e)})).catch((e=>{console.error("Error fetching limits: ",e),a(e)}))})).catch((e=>{console.error("Error getting session: ",e),a(e)}))})),E=async e=>{p.value=!0,v.value="OmniScript";let a="";e&&(v.value="IntegrationProcedure",a="+AND+vlocity_cmt__OmniProcessType__c='Integration Procedure'");let r="/services/data/v"+d+`/query/?q=SELECT+Id,Name,vlocity_cmt__Version__c,LastModifiedBy.Name,LastModifiedDate+FROM+vlocity_cmt__OmniScript__c+WHERE+vlocity_cmt__IsActive__c=TRUE${a}+ORDER+BY+LastModifiedDate+DESC`;try{const a=await S(r);a?.records.forEach((e=>{e.LastModifiedDateNew=g(e.LastModifiedDate)})),t.value=a?.records,m.value=e?x.value:y.value}catch(s){console.error("Error fetching OmniScript list: ",s)}p.value=!1,document.title=e?x.value:y.value},R=async()=>{p.value=!0,v.value="FlexCard";let e="/services/data/v"+d+"/query/?q=SELECT+Id,Name,vlocity_cmt__Version__c,LastModifiedBy.Name,LastModifiedDate+FROM+vlocity_cmt__VlocityCard__c+WHERE+vlocity_cmt__Active__c=TRUE+ORDER+BY+LastModifiedDate+DESC";try{const a=await S(e);a?.records.forEach((e=>{e.LastModifiedDateNew=g(e.LastModifiedDate)})),t.value=a?.records,m.value=b.value}catch(a){console.error("Error fetching getFlexCardList: ",a)}p.value=!1,document.title=b.value},L=async()=>{p.value=!0,v.value="DataRaptor";let e="/services/data/v"+d+"/query/?q=SELECT+Id,Name,vlocity_cmt__Type__c,LastModifiedBy.Name,LastModifiedDate+FROM+vlocity_cmt__DRBundle__c+ORDER+BY+LastModifiedDate";try{const a=await S(e);a?.records.forEach((e=>{e.LastModifiedDateNew=g(e.LastModifiedDate)})),t.value=a?.records,m.value=w.value,l.value=l.value.filter((e=>"vlocity_cmt__Version__c"!==e.value))}catch(a){console.error("Error fetching getDataRaptorList: ",a)}p.value=!1,document.title=w.value};function C(e){const t=/https:\/\/([^.]+)\.(lightning\.force\.com|my\.salesforce\.com|vf\.force\.com|my\.site\.com)$/,a=e.match(t);if(a)return a[1];const r=/https:\/\/([^.]+)\.sandbox\.(lightning\.force\.com|my\.salesforce\.com|vf\.force\.com|my\.site\.com)$/,s=e.match(r);if(s)return s[1];const o=/https:\/\/([^.]+)\.develop\.(lightning\.force\.com|my\.salesforce\.com|vf\.force\.com|my\.site\.com)$/,n=e.match(o);if(n)return n[1];const i=/https:\/\/([^-]+)-([^.]+)\.trailblaze\.(lightning\.force\.com|my\.salesforce\.com|vf\.force\.com|my\.site\.com)$/,c=e.match(i);return c?c[2]:null}const M=(e,t)=>{switch(t){case"DataRaptor":return`https://${h.value}--vlocity-cmt.vf.force.com/apex/vlocity_cmt__drmapper?id=${e}`;case"IntegrationProcedure":return`https://${h.value}--vlocity-cmt.vf.force.com/apex/vlocity_cmt__integrationproceduredesigner?id=${e}`;default:return null}},A=(e,t)=>{const a=`https://${f.value}/lightning`;switch(t){case"OmniScript":return`${a}/cmp/vlocity_cmt__OmniDesignerAuraWrapper?c__recordId=${e}`;case"FlexCard":return`${a}/r/vlocity_cmt__VlocityCard__c/${e}/view`;case"IntegrationProcedure":case"DataRaptor":return M(e,t);default:return null}};return(0,s.sV)((()=>{let e=new URLSearchParams(location.search.slice(1)),t=e.get("host");f.value=t,h.value=C(`https://${f.value}`)})),(e,d)=>((0,s.uX)(),(0,s.CE)(s.FK,null,[f.value?((0,s.uX)(),(0,s.Wv)(N,{key:0,class:"my-2"},{default:(0,s.k6)((()=>[(0,s.eW)("Current Org : "+(0,i.v_)(f.value),1)])),_:1})):(0,s.Q3)("",!0),(0,s.Lk)("button",{onClick:d[0]||(d[0]=e=>E(!1)),class:"bg-blue-700 hover:bg-blue-800 text-white py-2 px-4 rounded-md mr-2 my-2"}," Load OmniScript "),(0,s.Lk)("button",{onClick:R,class:"bg-blue-700 hover:bg-blue-800 text-white py-2 px-4 rounded-md mr-2 my-2"}," Load FlexCard "),(0,s.Lk)("button",{onClick:d[1]||(d[1]=e=>E(!0)),class:"bg-blue-700 hover:bg-blue-800 text-white py-2 px-4 rounded-md mr-2 my-2"}," Load Integration Procedure "),(0,s.Lk)("button",{onClick:L,class:"bg-blue-700 hover:bg-blue-800 text-white py-2 px-4 rounded-md mr-2 my-2"}," Load DataRaptor "),p.value?((0,s.uX)(),(0,s.CE)("div",H,[(0,s.bF)(_,null,{default:(0,s.k6)((()=>[(0,s.bF)(I,{cssStyle:"h-4 w-4 mr-2"},{default:(0,s.k6)((()=>[(0,s.eW)("Data is loading...")])),_:1})])),_:1})])):((0,s.uX)(),(0,s.CE)("div",j,[m.value?((0,s.uX)(),(0,s.CE)("div",V,[(0,s.bF)(F,null,{default:(0,s.k6)((()=>[(0,s.eW)((0,i.v_)(m.value),1)])),_:1}),(0,s.bF)(N,null,{default:(0,s.k6)((()=>[(0,s.eW)("All records are active records")])),_:1})])):(0,s.Q3)("",!0),t.value.length>0?((0,s.uX)(),(0,s.CE)("div",q,[(0,s.bF)(k,{modelValue:r.value,"onUpdate:modelValue":d[2]||(d[2]=e=>r.value=e),type:"text",class:"!px-2 !py-1 my-2",placeholder:"Filter records.."},null,8,["modelValue"]),(0,s.bF)((0,c.R1)($.A),{headers:l.value,items:t.value,"search-field":a.value,"rows-per-page":10,"header-text-direction":"center","body-text-direction":"center","search-value":r.value,"sort-by":o.value,"sort-type":n,"no-hover":!0,"theme-color":"#312e3d","table-class-name":"tableCSS mt-4 mb-8 rounded-lg border dark:border-gray-600 shadow-md"},{loading:(0,s.k6)((()=>[(0,s.bF)(N,{class:"font-semibold my-4"},{default:(0,s.k6)((()=>[(0,s.eW)("Data loading, please wait...")])),_:1})])),"item-Name":(0,s.k6)((({Name:e})=>[(0,s.Lk)("p",X,(0,i.v_)(e),1)])),"item-Actions":(0,s.k6)((({Id:e})=>[(0,s.Lk)("div",B,[(0,s.Lk)("a",{href:A(e,v.value),target:"_blank"},[(0,s.bF)(_,null,{default:(0,s.k6)((()=>[(0,s.eW)("Open in SF")])),_:1})],8,K)])])),_:1},8,["headers","items","search-field","search-value","sort-by"])])):(0,s.Q3)("",!0)]))],64))}});const z=W;var G=z;const Q={for:"theme",class:"theme md:top-6 md:right-6 z-40 rounded-2xl dark:shadow-xl absolute top-1 right-1"},Y={class:"theme__toggle-wrap"},J=(0,s.Fv)('<span class="theme__icon" data-v-76a18a32><span class="theme__icon-part" data-v-76a18a32></span><span class="theme__icon-part" data-v-76a18a32></span><span class="theme__icon-part" data-v-76a18a32></span><span class="theme__icon-part" data-v-76a18a32></span><span class="theme__icon-part" data-v-76a18a32></span><span class="theme__icon-part" data-v-76a18a32></span><span class="theme__icon-part" data-v-76a18a32></span><span class="theme__icon-part" data-v-76a18a32></span><span class="theme__icon-part" data-v-76a18a32></span></span>',1);var Z={__name:"ToggleLightDarkMode",setup(e){const t=(0,c.KR)(!1);(0,s.sV)((()=>{const e=localStorage.getItem("color-theme");("dark"===e||!e&&window.matchMedia("(prefers-color-scheme: dark)").matches)&&(t.value=!0,document.documentElement.classList.add("dark"))}));const a=()=>{t.value=!t.value,t.value?(document.documentElement.classList.add("dark"),localStorage.setItem("color-theme","dark")):(document.documentElement.classList.remove("dark"),localStorage.setItem("color-theme","light"))};return(e,o)=>((0,s.uX)(),(0,s.CE)("label",Q,[(0,s.Lk)("span",Y,[(0,s.bo)((0,s.Lk)("input",{id:"theme",class:"theme__toggle",type:"checkbox",role:"switch",name:"theme",value:"dark",onClick:a,"onUpdate:modelValue":o[0]||(o[0]=e=>t.value=e)},null,512),[[r.lH,t.value]]),J])]))}},ee=a(1241);const te=(0,ee.A)(Z,[["__scopeId","data-v-76a18a32"]]);var ae=te,re={name:"App",components:{SecondaryComp:G,ToggleLightDarkMode:ae}};const se=(0,ee.A)(re,[["render",n]]);var oe=se;(0,r.Ef)(oe).mount("#secondaryApp")}},t={};function a(r){var s=t[r];if(void 0!==s)return s.exports;var o=t[r]={exports:{}};return e[r].call(o.exports,o,o.exports,a),o.exports}a.m=e,function(){var e=[];a.O=function(t,r,s,o){if(!r){var n=1/0;for(d=0;d<e.length;d++){r=e[d][0],s=e[d][1],o=e[d][2];for(var i=!0,c=0;c<r.length;c++)(!1&o||n>=o)&&Object.keys(a.O).every((function(e){return a.O[e](r[c])}))?r.splice(c--,1):(i=!1,o<n&&(n=o));if(i){e.splice(d--,1);var l=s();void 0!==l&&(t=l)}}return t}o=o||0;for(var d=e.length;d>0&&e[d-1][2]>o;d--)e[d]=e[d-1];e[d]=[r,s,o]}}(),function(){a.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return a.d(t,{a:t}),t}}(),function(){a.d=function(e,t){for(var r in t)a.o(t,r)&&!a.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})}}(),function(){a.g=function(){if("object"===typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"===typeof window)return window}}()}(),function(){a.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)}}(),function(){var e={524:0,996:0};a.O.j=function(t){return 0===e[t]};var t=function(t,r){var s,o,n=r[0],i=r[1],c=r[2],l=0;if(n.some((function(t){return 0!==e[t]}))){for(s in i)a.o(i,s)&&(a.m[s]=i[s]);if(c)var d=c(a)}for(t&&t(r);l<n.length;l++)o=n[l],a.o(e,o)&&e[o]&&e[o][0](),e[o]=0;return a.O(d)},r=self["webpackChunkmy_chrome_extension"]=self["webpackChunkmy_chrome_extension"]||[];r.forEach(t.bind(null,0)),r.push=t.bind(null,r.push.bind(r))}();var r=a.O(void 0,[504,996],(function(){return a(2245)}));r=a.O(r)})();
//# sourceMappingURL=app.98ba8fa1.js.map