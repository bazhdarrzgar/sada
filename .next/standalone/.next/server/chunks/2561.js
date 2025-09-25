"use strict";exports.id=2561,exports.ids=[2561],exports.modules={71467:(e,t,a)=>{a.d(t,{o:()=>u});var o=a(10326),n=a(17577),r=a(18729),s=a(40773),i=a(31540),l=a(36283),d=a(99102),c=a(25880),m=a(54104),p=a(25960),f=a(3262);function u({data:e,filename:t="data",className:a="",variant:u="outline",size:h="default",language:x}){let[g,b]=(0,n.useState)(!1),{language:y}=(0,p.Z)(),w=x||y,v=async a=>{if(!e||0===e.length){alert((0,f.t)("common.noDataToDownload",w));return}b(!0);try{switch(a){case"csv":(0,m.GS)(e,t);break;case"xlsx":await (0,m.pq)(e,t);break;case"json":(0,m.cs)(e,t);break;default:console.error("Unsupported format:",a)}}catch(e){console.error("Export error:",e),alert((0,f.t)("common.downloadError",w))}finally{b(!1)}};return(0,o.jsxs)(s.h_,{children:[o.jsx(s.$F,{asChild:!0,children:(0,o.jsxs)(r.z,{variant:u,size:h,className:`flex items-center gap-2 ${a}`,disabled:g||!e||0===e.length,children:[o.jsx(i.Z,{className:"h-4 w-4"}),g?(0,f.t)("common.downloading",w):(0,f.t)("common.downloadData",w)]})}),(0,o.jsxs)(s.AW,{align:"end",className:"w-48",children:[(0,o.jsxs)(s.Xi,{onClick:()=>v("csv"),className:"flex items-center gap-2 cursor-pointer",children:[o.jsx(l.Z,{className:"h-4 w-4"}),o.jsx("span",{children:(0,f.t)("common.csvFile",w)})]}),(0,o.jsxs)(s.Xi,{onClick:()=>v("xlsx"),className:"flex items-center gap-2 cursor-pointer",children:[o.jsx(d.Z,{className:"h-4 w-4"}),o.jsx("span",{children:(0,f.t)("common.excelFile",w)})]}),(0,o.jsxs)(s.Xi,{onClick:()=>v("json"),className:"flex items-center gap-2 cursor-pointer",children:[o.jsx(c.Z,{className:"h-4 w-4"}),o.jsx("span",{children:(0,f.t)("common.jsonFile",w)})]})]})]})}},40773:(e,t,a)=>{a.d(t,{$F:()=>m,AW:()=>p,Xi:()=>f,h_:()=>c});var o=a(10326),n=a(17577),r=a(79313),s=a(39183),i=a(32933),l=a(53982),d=a(46084);let c=r.fC,m=r.xz;r.ZA,r.Uv,r.Tr,r.Ee,n.forwardRef(({className:e,inset:t,children:a,...n},i)=>(0,o.jsxs)(r.fF,{ref:i,className:(0,d.cn)("flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",t&&"pl-8",e),...n,children:[a,o.jsx(s.Z,{className:"ml-auto"})]})).displayName=r.fF.displayName,n.forwardRef(({className:e,...t},a)=>o.jsx(r.tu,{ref:a,className:(0,d.cn)("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-dropdown-menu-content-transform-origin]",e),...t})).displayName=r.tu.displayName;let p=n.forwardRef(({className:e,sideOffset:t=4,...a},n)=>o.jsx(r.Uv,{children:o.jsx(r.VY,{ref:n,sideOffset:t,className:(0,d.cn)("z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md","data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-dropdown-menu-content-transform-origin]",e),...a})}));p.displayName=r.VY.displayName;let f=n.forwardRef(({className:e,inset:t,...a},n)=>o.jsx(r.ck,{ref:n,className:(0,d.cn)("relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0",t&&"pl-8",e),...a}));f.displayName=r.ck.displayName,n.forwardRef(({className:e,children:t,checked:a,...n},s)=>(0,o.jsxs)(r.oC,{ref:s,className:(0,d.cn)("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",e),checked:a,...n,children:[o.jsx("span",{className:"absolute left-2 flex h-3.5 w-3.5 items-center justify-center",children:o.jsx(r.wU,{children:o.jsx(i.Z,{className:"h-4 w-4"})})}),t]})).displayName=r.oC.displayName,n.forwardRef(({className:e,children:t,...a},n)=>(0,o.jsxs)(r.Rk,{ref:n,className:(0,d.cn)("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",e),...a,children:[o.jsx("span",{className:"absolute left-2 flex h-3.5 w-3.5 items-center justify-center",children:o.jsx(r.wU,{children:o.jsx(l.Z,{className:"h-2 w-2 fill-current"})})}),t]})).displayName=r.Rk.displayName,n.forwardRef(({className:e,inset:t,...a},n)=>o.jsx(r.__,{ref:n,className:(0,d.cn)("px-2 py-1.5 text-sm font-semibold",t&&"pl-8",e),...a})).displayName=r.__.displayName,n.forwardRef(({className:e,...t},a)=>o.jsx(r.Z0,{ref:a,className:(0,d.cn)("-mx-1 my-1 h-px bg-muted",e),...t})).displayName=r.Z0.displayName},5487:(e,t,a)=>{a.d(t,{g:()=>d});var o=a(10326),n=a(17577),r=a(18729),s=a(3869),i=a(25960),l=a(3262);function d({data:e,filename:t="table-data",title:a="Table Data",titleKu:d="",columns:c=[],className:m="",variant:p="outline",size:f="default",language:u}){let[h,x]=(0,n.useState)(!1),{language:g}=(0,i.Z)(),b=u||g;return(0,o.jsxs)(r.z,{variant:p,size:f,className:`flex items-center gap-2 ${m}`,disabled:h||!e||0===e.length,onClick:()=>{if(!e||0===e.length){alert((0,l.t)("common.noDataToPrint",b));return}x(!0);try{let o,n;if(c.length>0)o=c.map(e=>e.header||e.key),n=e.map(e=>c.map(t=>{let a=e[t.key];if(t.render&&"function"==typeof t.render){let o=t.render(a,e);return"number"==typeof o?o.toLocaleString():o||""}return a||""}));else if(e.length>0){let t=Object.keys(e[0]);o=t.map(e=>e.charAt(0).toUpperCase()+e.slice(1)),n=e.map(e=>t.map(t=>e[t]||""))}else o=[],n=[];let r=new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"}),s=`
        <!DOCTYPE html>
        <html dir="rtl" lang="ku">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${t}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Arial', 'Tahoma', sans-serif;
              font-size: 12px;
              line-height: 1.4;
              color: #333;
              padding: 20px;
              direction: rtl;
            }
            
            .print-header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #2563eb;
              padding-bottom: 15px;
            }
            
            .title-ku {
              font-size: 18px;
              font-weight: bold;
              color: #2563eb;
              margin-bottom: 5px;
            }
            
            .title-en {
              font-size: 16px;
              font-weight: bold;
              color: #4b5563;
              margin-bottom: 10px;
            }
            
            .date {
              font-size: 11px;
              color: #6b7280;
            }
            
            .table-container {
              width: 100%;
              overflow-x: auto;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 11px;
              margin-top: 10px;
            }
            
            th, td {
              border: 1px solid #d1d5db;
              padding: 8px 6px;
              text-align: center;
              vertical-align: middle;
            }
            
            th {
              background-color: #2563eb;
              color: white;
              font-weight: bold;
              font-size: 12px;
            }
            
            tr:nth-child(even) {
              background-color: #f8fafc;
            }
            
            tr:nth-child(odd) {
              background-color: #ffffff;
            }
            
            .number {
              font-family: 'Arial', monospace;
              text-align: right;
              direction: ltr;
            }
            
            @media print {
              body {
                padding: 10px;
              }
              
              .print-header {
                margin-bottom: 20px;
              }
              
              table {
                font-size: 10px;
              }
              
              th, td {
                padding: 6px 4px;
              }
              
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            ${d?`<div class="title-ku">${d}</div>`:""}
            <div class="title-en">${a}</div>
            <div class="date">Generated on: ${r}</div>
          </div>
          
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  ${o.map(e=>`<th>${e}</th>`).join("")}
                </tr>
              </thead>
              <tbody>
                ${n.map(e=>`<tr>
                    ${e.map((e,t)=>{let a=!isNaN(parseFloat(e.toString().replace(/,/g,"")))&&e.toString().match(/[\d,]+/);return`<td class="${a?"number":""}">${e}</td>`}).join("")}
                  </tr>`).join("")}
              </tbody>
            </table>
          </div>
        </body>
        </html>
      `,i=window.open("","_blank","width=800,height=600,scrollbars=yes");i?(i.document.write(s),i.document.close(),i.addEventListener("load",()=>{setTimeout(()=>{i.print(),i.addEventListener("afterprint",()=>{i.close()})},500)})):alert((0,l.t)("common.popupBlockerWarning",b))}catch(e){console.error("Print generation error:",e),alert((0,l.t)("common.printError",b))}finally{x(!1)}},children:[o.jsx(s.Z,{className:"h-4 w-4"}),h?(0,l.t)("common.printing",b):(0,l.t)("common.print",b)]})}},91214:(e,t,a)=>{a.d(t,{d:()=>n});var o=a(17577);function n(){let[e,t]=o.useState(void 0);return o.useEffect(()=>{let e=window.matchMedia("(max-width: 767px)"),a=()=>{t(window.innerWidth<768)};return e.addEventListener("change",a),t(window.innerWidth<768),()=>e.removeEventListener("change",a)},[]),!!e}},54104:(e,t,a)=>{a.d(t,{GS:()=>n,cs:()=>r,pq:()=>o});let o=async(e,t)=>{try{console.warn("Excel export only works on client side");return}catch(e){console.error("Error exporting to Excel:",e),alert("خەطا لە دروستکردنی فایلی Excel")}},n=(e,t)=>{try{if(!e||0===e.length){alert("هیچ داتایەک بۆ هەناردن نییە");return}let a=[...new Set(e.flatMap(e=>Object.keys(e)))].filter(e=>"id"!==e&&"_id"!==e&&"created_at"!==e&&"updated_at"!==e),o=a.join(","),n=e.map(e=>a.map(t=>{let a=e[t]||"";return"string"==typeof a&&(a.includes(",")||a.includes('"'))?`"${a.replace(/"/g,'""')}"`:a}).join(",")),r=[o,...n].join("\n"),s=new Blob([r],{type:"text/csv;charset=utf-8;"}),i=URL.createObjectURL(s),l=document.createElement("a");l.href=i,l.download=`${t}.csv`,document.body.appendChild(l),l.click(),document.body.removeChild(l),URL.revokeObjectURL(i),console.log("CSV file exported successfully")}catch(e){console.error("Error exporting to CSV:",e),alert("خەطا لە دروستکردنی فایلی CSV")}},r=(e,t)=>{try{if(!e||0===e.length){alert("هیچ داتایەک بۆ هەناردن نییە");return}let a=e.map(e=>{let{id:t,_id:a,created_at:o,updated_at:n,...r}=e;return r}),o=JSON.stringify(a,null,2),n=new Blob([o],{type:"application/json"}),r=URL.createObjectURL(n),s=document.createElement("a");s.href=r,s.download=`${t}.json`,document.body.appendChild(s),s.click(),document.body.removeChild(s),URL.revokeObjectURL(r),console.log("JSON file exported successfully")}catch(e){console.error("Error exporting to JSON:",e),alert("خەطا لە دروستکردنی فایلی JSON")}}}};