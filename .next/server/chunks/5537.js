"use strict";exports.id=5537,exports.ids=[5537],exports.modules={65537:(e,t,a)=>{a.d(t,{du:()=>p,hR:()=>l,jC:()=>u,ki:()=>c,sendDailyTaskNotification:()=>m});var o=a(55245),r=a(73191);let s={A:"Regis Name",B:"Media",C:"HR Staff Records",D:"E.parwarda records",E:"Bus Records",F:"Monitoring R",G:"S License Records",H:"Teacher Evaluation Records",I:"Student Absent",J:"Salary Records",K:"Pen Records",L:"Daily Manager Records",M:"Teacher Attendance",N:"Report Records",O:"Observed Student Records",P:"Class Record",Q:"Activities Records",R:"Future Plan Records",S:"Subject Records",T:"CoCar BM Records",U:"Parent Rec",V:"Security Records",W:"Clean Records",X:"Student Profile Record",Y:"Meeting & Discussion",Z:"Time Table",A1:"Progress",B1:"Orders",C1:"Student Pay",D1:"Exam Records",E1:"First Day of CoCar",F1:"CourseWare Record",G1:"Material",TB:"Daily Monitor Records"};async function n(){try{let e=(await r.Z).db(process.env.DB_NAME||"berdoz_management"),t=await e.collection("email_settings").findOne({type:"notification"});if(t)return{senderEmail:t.senderEmail,senderPassword:t.senderPassword,targetEmail:t.targetEmail}}catch(e){console.log("Using environment variables for email settings")}return{senderEmail:process.env.EMAIL_USER||"swyanswartz@gmail.com",senderPassword:process.env.EMAIL_PASS||"moiy tvnm emmq jlks",targetEmail:process.env.NOTIFICATION_EMAIL||"soyansoon9@gmail.com"}}async function i(e=null,t=null){let a=await n();return o.createTransport({service:"gmail",auth:{user:e||a.senderEmail,pass:t||a.senderPassword}})}function d(e){return e.toISOString().split("T")[0]}async function l(e){return c(e,new Date(new Date().getTime()+108e5))}async function c(e,t){let a=d(t);try{let o=new Date(t);o.setHours(0,0,0,0);let r=new Date(t);r.setHours(23,59,59,999),console.log(`Searching for tasks between ${o.toISOString()} and ${r.toISOString()}`);let s=await e.collection("email_tasks").find({date:{$gte:o,$lte:r}}).toArray();if(console.log(`Found ${s.length} email tasks for date ${a}`),s.length>0){let e=[];for(let t of s)t.codes&&Array.isArray(t.codes)&&e.push(...t.codes);return{hasTasksToday:(e=[...new Set(e)].sort()).length>0,codes:e,date:t.toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric",timeZone:"Asia/Baghdad"}),emailTasks:s,method:"enhanced"}}return g(e,t)}catch(e){return console.error("Error getting tasks for date:",e),{hasTasksToday:!1,codes:[],date:t.toLocaleDateString("en-US"),emailTasks:[],error:e.message}}}async function g(e,t){let a=d(t),o=t.getFullYear();try{let r=await e.collection("calendar_entries").find({$or:[{year:o},{year:{$exists:!1}},{year:null}]}).sort({year:-1,updated_at:-1}).toArray();console.log(`Found ${r.length} legacy calendar entries for year ${o}`);let n=[],i=[];for(let e of r){let t=e.year||o;for(let o of function(e,t){let a=[];if(!e)return a;let o={January:0,February:1,March:2,April:3,May:4,June:5,July:6,August:7,September:8,October:9,November:10,December:11,Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11},r=0,s=1;if(e.includes("-")){let a=e.split("-");if(2===a.length){let e=a[0],n=a[1];if(!isNaN(e)&&isNaN(n)){for(let[t,a]of(s=parseInt(e),Object.entries(o)))if(n.includes(t)){r=a;break}}else if(isNaN(e)&&!isNaN(n)){for(let[a,s]of(t=parseInt(n),Object.entries(o)))if(e.includes(a)){r=s;break}}}}else for(let[t,a]of Object.entries(o))if(e.includes(t)){r=a;break}let n=new Date(t,r,s);for(let e=0;e<4;e++)for(let t=0;t<4;t++){let o=new Date(n);o.setDate(n.getDate()+7*e+t),a.push({date:o,weekIndex:e,dayIndex:t,weekName:`week${e+1}`,dayName:["Sunday","Monday","Tuesday","Wednesday"][t]})}return a}(e.month,t))if(d(o.date)===a){i.push({entry:e,matchedDate:o.date,weekIndex:o.weekIndex,dayIndex:o.dayIndex});let t=`week${o.weekIndex+1}`,a=e[t]&&e[t][o.dayIndex];if(a){let e=a&&""!==a.trim()?[...new Set(a.split(/[,\s]+/).map(e=>e.trim().toUpperCase()).filter(e=>e&&s[e]))]:[];n.push(...e)}}}return{hasTasksToday:(n=[...new Set(n)].sort()).length>0,codes:n,date:t.toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric",timeZone:"Asia/Baghdad"}),matchingEntries:i,method:"legacy"}}catch(e){return console.error("Error getting legacy tasks for date:",e),{hasTasksToday:!1,codes:[],date:t.toLocaleDateString("en-US"),matchingEntries:[],error:e.message,method:"legacy"}}}async function m(e,t=null){let a=await n(),o=t||a.targetEmail;if(!e.hasTasksToday)return console.log("No tasks for today, skipping email notification"),{success:!0,message:"No tasks for today"};try{let t=await i(),r=`
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
    <h1 style="margin: 0; font-size: 24px;">📅 Daily Task Notification</h1>
    <p style="margin: 10px 0 0 0; opacity: 0.9;">${e.date}</p>
    ${e.method?`<p style="margin: 5px 0 0 0; opacity: 0.7; font-size: 12px;">Method: ${e.method}</p>`:""}
  </div>
  
  <div style="padding: 30px; background-color: #f8f9fa;">
    <h2 style="color: #495057; margin-bottom: 20px;">📋 Today's Scheduled Tasks</h2>
    
    <div style="background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      <p style="margin-bottom: 15px; color: #6c757d;">The following codes have been scheduled for today:</p>
      
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #e9ecef;">
            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6; font-weight: 600; color: #495057;">Code</th>
            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6; font-weight: 600; color: #495057;">Description</th>
          </tr>
        </thead>
        <tbody>`;for(let t of e.codes){let e=s[t]||"Unknown task";r+=`
          <tr style="border-bottom: 1px solid #dee2e6;">
            <td style="padding: 12px; font-family: monospace; font-weight: bold; color: #007bff;">${t}</td>
            <td style="padding: 12px; color: #495057;">${e}</td>
          </tr>`}if(r+=`
        </tbody>
      </table>
    </div>`,e.emailTasks&&e.emailTasks.length>0){for(let t of(r+=`
    <div style="margin-top: 20px; background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      <h3 style="color: #495057; margin-bottom: 15px;">📝 Task Details</h3>`,e.emailTasks))t.description&&(r+=`
        <div style="margin-bottom: 10px; padding: 10px; background-color: #f8f9fa; border-radius: 4px;">
          <p style="margin: 0; color: #495057;"><strong>Task:</strong> ${t.description}</p>
          <p style="margin: 5px 0 0 0; color: #6c757d; font-size: 12px;">Codes: ${t.codes.join(", ")}</p>
        </div>`);r+=`
    </div>`}r+=`
    <div style="margin-top: 30px; padding: 15px; background-color: #d1ecf1; border: 1px solid #bee5eb; border-radius: 6px;">
      <p style="margin: 0; color: #0c5460; font-size: 14px;">
        <strong>📌 Note:</strong> This is an automated reminder from the Berdoz Management System. 
        Please complete the scheduled tasks for today.
      </p>
    </div>
    
    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
      <p style="color: #6c757d; font-size: 12px; margin: 0;">
        Generated at ${new Date().toLocaleString("en-US",{timeZone:"Asia/Baghdad"})} (Baghdad Time)
      </p>
    </div>
  </div>
</div>`;let n={from:{name:"Berdoz Management System",address:a.senderEmail},to:o,subject:`Daily Task Notification – ${e.date}`,html:r},d=await t.sendMail(n);return console.log("Daily task notification sent successfully:",d.messageId),{success:!0,messageId:d.messageId,codesCount:e.codes.length,codes:e.codes,sentTo:o,method:e.method||"unknown"}}catch(e){return console.error("Error sending daily task notification:",e),{success:!1,error:e.message}}}async function p(e=null,t=null){try{let a=await i(e,t);return await a.verify(),console.log("Email configuration is valid"),{success:!0,message:"Email configuration is valid"}}catch(e){return console.error("Email configuration error:",e),{success:!1,error:e.message}}}async function u(e,t=null,a=null){try{let o=await i(t,a),r=await n(),s={from:{name:"Berdoz Management System - Test",address:t||r.senderEmail},to:e,subject:"Test Email - Berdoz Management System",html:`
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #007bff;">✅ Email Test Successful!</h2>
          <p>This is a test email from the Berdoz Management System.</p>
          <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>From:</strong> ${t||r.senderEmail}</p>
          <p><strong>To:</strong> ${e}</p>
          <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
            <p style="margin: 0; color: #6c757d; font-size: 14px;">
              If you received this email, your notification system is working correctly!
            </p>
          </div>
        </div>
      `},d=await o.sendMail(s);return{success:!0,messageId:d.messageId,message:`Test email sent successfully to ${e}`}}catch(e){return console.error("Error sending test email:",e),{success:!1,error:e.message}}}},73191:(e,t,a)=>{a.d(t,{Z:()=>s});var o=a(38013);let r=process.env.MONGODB_URI||process.env.MONGO_URL||"mongodb://localhost:27017";if(!r)throw Error("Add MONGODB_URI to .env.local");let s=new o.MongoClient(r,{}).connect()}};