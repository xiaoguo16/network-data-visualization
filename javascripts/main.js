/**
 * Created by gly on 2017/4/26.
 */
var EventUtil={
    addHandler:function (element,type,handler) {
        if(element.addEventListener){
            element.addEventListener(type,handler,false);
        }
        else if(element.attachEvent){
            element.attachEvent("on"+type,handler);
        }
        else{
            element["on"+type]=handler;
        }
    },
    getEvent:function (event) {
        return event? event:window.event;
    },
    getTarget:function (event) {
        return event.target || event.srcElement;
    },
    preventDefault:function (event) {
        if(event.preventDefault){
            event.preventDefault();
        }
        else{
            event.returnValue=false;
        }
    }
};
//选择器
var ul=document.getElementsByTagName("ul")[0];
var HTTPDiv=document.getElementById("httpResult");
var DNSDiv=document.getElementById("dnsResult");
var IPDiv=document.getElementById("IPfiveResult");
var EmailDiv=document.getElementById("EmailResult");

var HTTPli=document.getElementById("HTTPli");
var DNSli=document.getElementById("DNSli");
var IPli=document.getElementById("IPli");
var Emailli=document.getElementById("Emailli");

var httpdataDiv=document.getElementsByClassName("dataDiv")[0];
var dnsdataDiv=document.getElementsByClassName("dataDiv")[1];
var ipdataDiv=document.getElementsByClassName("dataDiv")[2];
var emaildataDiv=document.getElementsByClassName("dataDiv")[3];
var visHttpDiv=HTTPDiv.getElementsByClassName("visDiv")[0];
var visDnsDiv=DNSDiv.getElementsByClassName("visDiv")[0];
var visIpDiv=IPDiv.getElementsByClassName("visDiv")[0];
var visEmailDiv=EmailDiv.getElementsByClassName("visDiv")[0];
var suggestDiv=document.getElementById("suggest");
var suggestButton=document.getElementById("suggestButton");
var suggestEmlBtn=document.getElementById("suggestButtonEmail");
var tableDiv=httpdataDiv.getElementsByClassName("tableDiv")[0];
var tableDiv2=dnsdataDiv.getElementsByClassName("tableDiv")[0];
var tableDiv3=ipdataDiv.getElementsByClassName("tableDiv")[0];
var tableDiv4=emaildataDiv.getElementsByClassName("tableDiv")[0];
var suggestUl=document.getElementById("suggestUl");
var suggestEmailUl=document.getElementById("suggestEmail");
var curForm=document.getElementsByClassName("curForm")[0];
var curBtn=document.getElementsByClassName("curBtn")[0];
//分页选择器
var pagesDiv=document.getElementsByClassName("pages")[0];
var pagesUlHttp=document.getElementsByClassName("pagination")[0];
var pagesUlDNS=document.getElementsByClassName("pagination")[1];
var pagesUlIP=document.getElementsByClassName("pagination")[2];
var pagesUlEml=document.getElementsByClassName("pagination")[3];

var width=httpdataDiv.offsetWidth;
//各个协议类型中的ECharts容器变量
var httplinechart,httpclientChart,httpServerChart,httpSportChart,httpDportChart;
var dnslinechart,dnsclientChart,dnsServerChart,dnsHostipChart,dnsBlackdomainChart;
var iplinechart,ipSipChart,ipDipChart,ipSportChart,ipDportChart;
var emaillinechart,emailSipChart,emailDipChart,emailFromChart,emailToChart;

//url中的参数
var hrefParameter=window.location.search;
//ajaxTableRequest中数据表格传递的参数以及可视化的参数
var hrefParaTable=hrefParameter;
var hrefParaVis=hrefParameter.split("&nowPages")[0];
var hrefParaSug=hrefParameter.split("&nowPages")[0].concat("&row=400");
//index页面主页面中搜索框中的内容
var searchContent=getParaValue(hrefParameter,"search_content");
searchContent=decodeURI(searchContent);
//推荐结果
var result=[],emailResult=[],flag=0,flagEml=0;
//当前页面的ID,目的：为了在结果中搜索时显示当前页面
var curID;
//curCon存放当前检索条件的数据，1为数据选中，0为未选中
var curCon={};
curCon[searchContent]=1;

//分页总页数与当前页面,是否是请求所有数据(包括可视化)
var pagesCounts,nowPage=[1,1,1,1];
//点击按钮切换展示的数据类型
EventUtil.addHandler(ul,"click",function (event) {
    event=EventUtil.getEvent(event);
    var target=EventUtil.getTarget(event);
    switch (target.id){
        case "HTTPli":
            HTTPli.style.background="#e7e7e7";
            DNSli.style.background="#f8f8f8";
            IPli.style.background="#f8f8f8";
            Emailli.style.background="#f8f8f8";
            HTTPDiv.style.display="block";
            DNSDiv.style.display="none";
            IPDiv.style.display="none";
            EmailDiv.style.display="none";
            curID="1";
            //推荐
            suggestUl.style.display="block";
            suggestEmailUl.style.display="none";
            try {
                httplinechart.resize();
                httpclientChart.resize();
                httpServerChart.resize();
                httpSportChart.resize();
                httpDportChart.resize();
            }catch (e){}
            break;
        case "DNSli":
            HTTPli.style.background="#f8f8f8";
            DNSli.style.background="#e7e7e7";
            IPli.style.background="#f8f8f8";
            Emailli.style.background="#f8f8f8";
            HTTPDiv.style.display="none";
            DNSDiv.style.display="block";
            IPDiv.style.display="none";
            EmailDiv.style.display="none";
            curID="2";
            //推荐
            suggestUl.style.display="block";
            suggestEmailUl.style.display="none";
            try {
                dnslinechart.resize();
                dnsclientChart.resize();
                dnsServerChart.resize();
                dnsHostipChart.resize();
                dnsBlackdomainChart.resize();
            }catch (e){}
            break;
        case "IPli":
            HTTPli.style.background="#f8f8f8";
            DNSli.style.background="#f8f8f8";
            IPli.style.background="#e7e7e7";
            Emailli.style.background="#f8f8f8";
            HTTPDiv.style.display="none";
            DNSDiv.style.display="none";
            IPDiv.style.display="block";
            EmailDiv.style.display="none";
            curID="3";
            //推荐
            suggestUl.style.display="block";
            suggestEmailUl.style.display="none";
            //由于resize经常报错所以放在try catch中防止报错，报错原因不明
            try{
                iplinechart.resize();
                ipSipChart.resize();
                ipDipChart.resize();
                ipSportChart.resize();
                ipDportChart.resize();
            }catch (e){}
            break;
        case "Emailli":
            HTTPli.style.background="#f8f8f8";
            DNSli.style.background="#f8f8f8";
            IPli.style.background="#f8f8f8";
            Emailli.style.background="#e7e7e7";
            HTTPDiv.style.display="none";
            DNSDiv.style.display="none";
            IPDiv.style.display="none";
            EmailDiv.style.display="block";
            curID="4";
            //推荐
            suggestUl.style.display="none";
            suggestEmailUl.style.display="block";
            //由于resize经常报错所以放在try catch中防止报错，报错原因不明
            try{
                emaillinechart.resize();
                emailSipChart.resize();
                emailDipChart.resize();
                emailFromChart.resize();
                emailToChart.resize();
            }catch (e){}
            break;
    }
});
        ajaxTblReq();
       // debugger
        ajaxVisReq();
        allType();


//请求表格数据
function ajaxTblReq() {
    $.ajax({
        type:'get',
        async: false,
        dataType:'json',
        url:'../data/tableData.json',
        // dataType:'jsonp',
        // url:'http://192.168.1.166:8888/nanjing/search/page'+hrefParaTable,
        // jsonp:'callback',
        // jsonpCallback:"foo",
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            console.log(XMLHttpRequest,textStatus,errorThrown);
            alert("请求表格数据失败，请输入正确的搜索条件");
        },
        success:function (data) {
            // console.log(data,hrefParaTable);
            // console.log(data)
            tableDiv.innerHTML = "";
            tableDiv2.innerHTML = "";
            tableDiv3.innerHTML = "";
            tableDiv4.innerHTML = "";
            //当前页面ID
            curID=getParaValue(hrefParaTable,"curPage");
            //分页参数
            var now=getParaValue(hrefParaTable,"nowPages");
            //四种类型的当前页
            nowPage[0]=parseInt(now.split("[")[1].split(",")[0]);
            nowPage[1]=parseInt(now.split("[")[1].split(",")[1]);
            nowPage[2]=parseInt(now.split("[")[1].split(",")[2]);
            nowPage[3]=parseInt(now.split("[")[1].split(",")[3].split("]")[0]);
            //改变分页中的表格数据
                //清空分页部分画分页
                //         pagesUlHttp.innerHTML="";
                //         appendPages(data.pageCountsHTTP,nowPage[0],pagesUlHttp);
                //         setClass(pagesUlHttp,nowPage[0]);
                //
                //         pagesUlDNS.innerHTML="";
                //         appendPages(data.pageCountsDNS,nowPage[1],pagesUlDNS);
                //         setClass(pagesUlDNS,nowPage[1]);
                //
                //         pagesUlIP.innerHTML="";
                //         appendPages(data.pageCountsIP,nowPage[2],pagesUlIP);
                //         setClass(pagesUlIP,nowPage[2]);
                //
                //         pagesUlEml.innerHTML="";
                //         appendPages(data.pageCountsEmile,nowPage[3],pagesUlEml);
                //         setClass(pagesUlEml,nowPage[3]);

            if(data.httpResult.length!=0){
                pagesUlHttp.innerHTML="";
                appendPages(data.pageCountsHTTP,nowPage[0],pagesUlHttp);
                setClass(pagesUlHttp,nowPage[0]);
                appendHTTPTable(data);
            }
            else{
                pagesUlHttp.innerHTML="";
                // httpDataP=tableDiv.appendChild(document.createElement("p"));
                // httpDataP.appendChild(document.createTextNode("无数据"));
            }
            if(data.dnsResult.length!=0){
                pagesUlDNS.innerHTML="";
                appendPages(data.pageCountsDNS,nowPage[1],pagesUlDNS);
                setClass(pagesUlDNS,nowPage[1]);
                appendDNSTable(data);
            }
            else{
                pagesUlDNS.innerHTML="";
                // dnsDataP=tableDiv2.appendChild(document.createElement("p"));
                // dnsDataP.appendChild(document.createTextNode("无数据"));
            }
            if(data.ipResult.length!=0){
                pagesUlIP.innerHTML="";
                appendPages(data.pageCountsIP,nowPage[2],pagesUlIP);
                setClass(pagesUlIP,nowPage[2]);
                appendIPTable(data);
            }
            else{
                pagesUlIP.innerHTML="";
                // ipDataP=tableDiv3.appendChild(document.createElement("p"));
                // ipDataP.appendChild(document.createTextNode("无数据"));
            }
            if(data.emlResult.length!=0){
                pagesUlEml.innerHTML="";
                appendPages(data.pageCountsEmile,nowPage[3],pagesUlEml);
                setClass(pagesUlEml,nowPage[3]);
                appendEmailTable(data);
            }
            else{
                pagesUlEml.innerHTML="";
                // emailDataP=tableDiv4.appendChild(document.createElement("p"));
                // emailDataP.appendChild(document.createTextNode("无数据"));
            }
        }
    });
}
//请求可视化数据
function ajaxVisReq() {
    $.ajax({
        type:'get',
        async: false,
        dataType:'json',
        url:'../data/visData.json',
        // dataType:'jsonp',
        // url:'http://192.168.1.166:8888/nanjing/search/all'+hrefParaVis,
        // jsonp:'callback',
        // jsonpCallback:"foo",
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            console.log(XMLHttpRequest,textStatus,errorThrown);
            alert("请求可视化数据失败，请输入正确的搜索条件");
        },
        success:function (data) {
            // console.log(data,hrefParaVis);
            console.log(data);
            //清空所有DIV
            visHttpDiv.innerHTML = "";
            visDnsDiv.innerHTML = "";
            visIpDiv.innerHTML = "";
            visEmailDiv.innerHTML = "";

            //当前页面ID
            curID=getParaValue(hrefParaVis,"curPage");

                //清空并添加检索条件
                curForm.innerHTML="";
                var conditionAll="";
                for(var condition in curCon){
                    if(curCon[condition]==1){
                        conditionAll+=condition+'<input type="checkbox" value="'+condition+'">';
                    }else{ conditionAll+=condition+'<input type="checkbox" value="'+condition+'">'}
                }
                curForm.innerHTML=conditionAll;
                //循环检索条件对象，如果对象值为1，将其checkbox的checked值设为true
                for(var condition in curCon){
                    if(curCon[condition]==1){
                        for(var j=0;j<curForm.length;j++){
                            if(curForm[j].value==condition){
                                curForm[j].checked="true";
                            }
                        }
                    }
                }

                switch (curID){
                    case "1" :
                        HTTPli.style.background="#e7e7e7";
                        DNSli.style.background="#f8f8f8";
                        IPli.style.background="#f8f8f8";
                        Emailli.style.background="#f8f8f8";
                        HTTPDiv.style.display="block";
                        DNSDiv.style.display="none";
                        IPDiv.style.display="none";
                        EmailDiv.style.display="none";
                        //推荐
                        suggestUl.style.display="block";
                        suggestEmailUl.style.display="none";
                        break;
                    case "2":
                        HTTPli.style.background="#f8f8f8";
                        DNSli.style.background="#e7e7e7";
                        IPli.style.background="#f8f8f8";
                        Emailli.style.background="#f8f8f8";
                        HTTPDiv.style.display="none";
                        DNSDiv.style.display="block";
                        IPDiv.style.display="none";
                        EmailDiv.style.display="none";
                        //推荐
                        suggestUl.style.display="block";
                        suggestEmailUl.style.display="none";
                        break;
                    case "3":
                        HTTPli.style.background="#f8f8f8";
                        DNSli.style.background="#f8f8f8";
                        IPli.style.background="#e7e7e7";
                        Emailli.style.background="#f8f8f8";
                        HTTPDiv.style.display="none";
                        DNSDiv.style.display="none";
                        IPDiv.style.display="block";
                        EmailDiv.style.display="none";
                        //推荐
                        suggestUl.style.display="block";
                        suggestEmailUl.style.display="none";
                        break;
                    case "4":
                        HTTPli.style.background="#f8f8f8";
                        DNSli.style.background="#f8f8f8";
                        IPli.style.background="#f8f8f8";
                        Emailli.style.background="#e7e7e7";
                        HTTPDiv.style.display="none";
                        DNSDiv.style.display="none";
                        IPDiv.style.display="none";
                        EmailDiv.style.display="block";
                        //推荐
                        suggestUl.style.display="none";
                        suggestEmailUl.style.display="block";
                        break;
                    default:
                        HTTPli.style.background="#e7e7e7";
                        DNSli.style.background="#f8f8f8";
                        IPli.style.background="#f8f8f8";
                        Emailli.style.background="#f8f8f8";
                        HTTPDiv.style.display="block";
                        DNSDiv.style.display="none";
                        IPDiv.style.display="none";
                        EmailDiv.style.display="none";
                        //推荐
                        suggestUl.style.display="block";
                        suggestEmailUl.style.display="none";
                        break;

                }
                //清空推荐部分
                for (var s1 = suggestUl.childNodes.length - 1; s1 >= 0; s1--) {
                    var child = suggestUl.childNodes[s1];
                    if (child.className) {
                        if (child.className == "suggestLI") {
                            suggestUl.removeChild(suggestUl.childNodes[s1]);
                        }
                    }
                }
                for (var s2 = suggestEmailUl.childNodes.length - 1; s2 >= 0; s2--) {
                    var childEml = suggestEmailUl.childNodes[s2];
                    if (childEml.className) {
                        if (childEml.className == "suggestLI") {
                            suggestEmailUl.removeChild(suggestEmailUl.childNodes[s2]);
                        }
                    }
                }
                //数据可视化
                if(data.httptimeChart.timeLineX.length!=0){
                    appendHTTPVis(data);
                }
                else{
                    var httpVisP=document.createElement("p");
                    httpVisP.style.textAlign="center";
                    httpVisP.appendChild(document.createTextNode("该类型无数据"));
                    visHttpDiv.appendChild(httpVisP);
                    // var httpVisP=visHttpDiv.appendChild(document.createElement("p"));
                    // httpVisP.appendChild(document.createTextNode("该类型无数据"));
                }
                if(data.dnstimeChart.timeLineX.length!=0){
                    appendDNSVis(data);
                }
                else{
                    var dnsVisP=document.createElement("p");
                    dnsVisP.style.textAlign="center";
                    dnsVisP.appendChild(document.createTextNode("该类型无数据"));
                    visDnsDiv.appendChild(dnsVisP);
                    // var dnsVisP=visDnsDiv.appendChild(document.createElement("p"));
                    // dnsVisP.appendChild(document.createTextNode("该类型无数据"));
                }
                if(data.iptimeChart.timeLineX.length!=0){
                    appendIPVis(data);
                }
                else{
                    var ipVisP=document.createElement("p");
                    ipVisP.style.textAlign="center";
                    ipVisP.appendChild(document.createTextNode("该类型无数据"));
                    visIpDiv.appendChild(ipVisP);
                    // var ipVisP=visIpDiv.appendChild(document.createElement("p"));
                    // ipVisP.appendChild(document.createTextNode("该类型无数据"));
                }
                if(data.emailtimeChart.timeLineX.length!=0){
                    appendEmailVis(data);
                }
                else {
                    var emailVisP=document.createElement("p");
                    emailVisP.style.textAlign="center";
                    emailVisP.appendChild(document.createTextNode("该类型无数据"));
                    visEmailDiv.appendChild(emailVisP);
                    // var emailVisP = visEmailDiv.appendChild(document.createElement("p"));
                    // emailVisP.appendChild(document.createTextNode("该类型无数据"));
                }
        }
    });
}
//以下四个事件类似，为不同类型的分页事件
//点击分页HTTP事件(更改当前页面值以及清空DIV并重写hrefPrameter重新请求数据)
EventUtil.addHandler(pagesUlHttp,"click",function (event) {
    event=EventUtil.getEvent(event);
    var target=EventUtil.getTarget(event);
    var clickValue=target.innerText;
    if(clickValue=="上一页"){
        if(nowPage[0]!=1){
            nowPage[0]--;
            tableDiv.innerHTML = "";
            hrefParaTable=hrefParaTable.split("curPage=")[0].concat("curPage=1").concat("&nowPages="+"["+nowPage+"]");
            ajaxTblReq();
        }
    }
    else if(clickValue=="下一页"){
        if(nowPage[0]!=pagesCounts){
            nowPage[0]++;
            tableDiv.innerHTML = "";
            hrefParaTable=hrefParaTable.split("curPage=")[0].concat("curPage=1").concat("&nowPages="+"["+nowPage+"]");
            ajaxTblReq();
        }
    }
    else if(clickValue=="..."){

    }
    else{
        nowPage[0]=parseInt(clickValue);
        tableDiv.innerHTML = "";
        hrefParaTable=hrefParaTable.split("curPage=")[0].concat("curPage=1").concat("&nowPages="+"["+nowPage+"]");
        ajaxTblReq();
    }
});
//点击分页DNS事件(更改当前页面值以及清空DIV并重写hrefPrameter重新请求数据)
EventUtil.addHandler(pagesUlDNS,"click",function (event) {
    event=EventUtil.getEvent(event);
    var target=EventUtil.getTarget(event);
    var clickValue=target.innerText;
    if(clickValue=="上一页"){
        if(nowPage[1]!=1){
            nowPage[1]--;
            tableDiv2.innerHTML = "";
            hrefParaTable=hrefParaTable.split("curPage=")[0].concat("curPage=2").concat("&nowPages="+"["+nowPage+"]");
            ajaxTblReq();
        }
    }
    else if(clickValue=="下一页"){
        if(nowPage[1]!=pagesCounts){
            nowPage[1]++;
            tableDiv2.innerHTML = "";
            hrefParaTable=hrefParaTable.split("curPage=")[0].concat("curPage=2").concat("&nowPages="+"["+nowPage+"]");
            ajaxTblReq();
        }
    }
    else if(clickValue=="..."){

    }
    else{
        nowPage[1]=parseInt(clickValue);
        tableDiv2.innerHTML = "";
        hrefParaTable=hrefParaTable.split("curPage=")[0].concat("curPage=2").concat("&nowPages="+"["+nowPage+"]");
        ajaxTblReq();
    }
});
//点击分页IP事件(更改当前页面值以及清空DIV并重写hrefPrameter重新请求数据)
EventUtil.addHandler(pagesUlIP,"click",function (event) {
    event=EventUtil.getEvent(event);
    var target=EventUtil.getTarget(event);
    var clickValue=target.innerText;
    if(clickValue=="上一页"){
        if(nowPage[2]!=1){
            nowPage[2]--;
            tableDiv3.innerHTML = "";
            hrefParaTable=hrefParaTable.split("curPage=")[0].concat("curPage=3").concat("&nowPages="+"["+nowPage+"]");
            ajaxTblReq();
        }
    }
    else if(clickValue=="下一页"){
        if(nowPage[2]!=pagesCounts){
            nowPage[2]++;
            tableDiv3.innerHTML = "";
            hrefParaTable=hrefParaTable.split("curPage=")[0].concat("curPage=3").concat("&nowPages="+"["+nowPage+"]");
            ajaxTblReq();
        }
    }
    else if(clickValue=="..."){

    }
    else{
        nowPage[2]=parseInt(clickValue);
        tableDiv3.innerHTML = "";
        hrefParaTable=hrefParaTable.split("curPage=")[0].concat("curPage=3").concat("&nowPages="+"["+nowPage+"]");
        ajaxTblReq();
    }
});
//点击分页Emaile事件(更改当前页面值以及清空DIV并重写hrefPrameter重新请求数据)
EventUtil.addHandler(pagesUlEml,"click",function (event) {
    event=EventUtil.getEvent(event);
    var target=EventUtil.getTarget(event);
    var clickValue=target.innerText;
    if(clickValue=="上一页"){
        if(nowPage[3]!=1){
            nowPage[3]--;
            tableDiv4.innerHTML = "";
            hrefParaTable=hrefParaTable.split("curPage=")[0].concat("curPage=4").concat("&nowPages="+"["+nowPage+"]");
            ajaxTblReq();
        }
    }
    else if(clickValue=="下一页"){
        if(nowPage[3]!=pagesCounts){
            nowPage[3]++;
            tableDiv4.innerHTML = "";
            hrefParaTable=hrefParaTable.split("curPage=")[0].concat("curPage=4").concat("&nowPages="+"["+nowPage+"]");
            ajaxTblReq();
        }
    }
    else if(clickValue=="..."){

    }
    else{
        nowPage[3]=parseInt(clickValue);
        tableDiv4.innerHTML = "";
        hrefParaTable=hrefParaTable.split("curPage=")[0].concat("curPage=4").concat("&nowPages="+"["+nowPage+"]");
        ajaxTblReq();
    }
});

//在结果中搜索
EventUtil.addHandler(suggestDiv,"click",function (event) {
    event=EventUtil.getEvent(event);
    var target=EventUtil.getTarget(event);
    //搜索条件
    var content1=document.getElementsByName("suggestContent")[0].value;
    var contentEml=document.getElementsByName("suggestContent")[1].value;
    //再次检索输入框中的内容
    var searchInput=[];
    //输入的条件不为空时处理
    if(contentEml!=""||content1!="") {
        //点击搜索符号
        if (target.tagName.toLowerCase() == "span") {
            //清空推荐部分
            for (var i = suggestUl.childNodes.length - 1; i >= 0; i--) {
                var child = suggestUl.childNodes[i];
                if (child.className) {
                    if (child.className == "suggestLI") {
                        suggestUl.removeChild(suggestUl.childNodes[i]);
                    }
                }
            }
            for (var j = suggestEmailUl.childNodes.length - 1; j >= 0; j--) {
                var childEml = suggestEmailUl.childNodes[j];
                if (childEml.className) {
                    if (childEml.className == "suggestLI") {
                        suggestEmailUl.removeChild(suggestEmailUl.childNodes[j]);
                    }
                }
            }
            //根据输入框内容确定searchInput
            if (content1 != "" && contentEml == "") {
                searchInput.push(content1);
            }
            else if (contentEml != "" && content1 == "") {
                searchInput.push(contentEml);
            }
            else if (content1 != "" && contentEml != "") {
                searchInput.push(content1);
                searchInput.push(contentEml);
            }
            //将searchInput放入当前条件curCon中
            for(var k=0;k<searchInput.length;k++){
                var curInput=searchInput[k];
                curCon[curInput]=1;
            }
            //确定最终的搜索条件
            searchContent="";
            var n=0;
            for(var m in curCon){
                if(curCon[m]==1 && n==0){
                    searchContent=searchContent.concat(m);
                    n++;
                }else if(curCon[m]==1 && n!=0){
                    searchContent=searchContent.concat(","+m);
                }
            }
            console.log("检索条件");
            console.log(searchContent);
            var hrefSplit = hrefParaVis.split("search_content=");
            //当前页面的参数
            var hrefSplit2 = hrefSplit[1].split("curPage=");
            //重写hrefParaVis和hrefParaTable参数
            hrefParaVis=hrefSplit[0].concat("search_content=" + searchContent).concat("&protocol_type=" + hrefSplit2[0].split("&protocol_type=")[1]).concat("curPage=" + curID);
            hrefParaTable=hrefParaVis.concat("&nowPages="+"["+nowPage+"]");
            //清空input中的值
            document.getElementsByName("suggestContent")[0].value="";
            document.getElementsByName("suggestContent")[1].value="";
            //再次请求
            ajaxTblReq();
            ajaxVisReq();
            allType();
        }
    }
});

//点击当前检索条件中的搜索按钮
EventUtil.addHandler(curBtn,"click",function (event) {
    for(var i=0;i<curForm.length;i++){
        var curName=curForm[i].value;
        if(curForm[i].checked){
           curCon[curName]=1;
        }else{
            curCon[curName]=0;
        }
    }
    //清空推荐部分
    for (var i = suggestUl.childNodes.length - 1; i >= 0; i--) {
        var child = suggestUl.childNodes[i];
        if (child.className) {
            if (child.className == "suggestLI") {
                suggestUl.removeChild(suggestUl.childNodes[i]);
            }
        }
    }
    for (var j = suggestEmailUl.childNodes.length - 1; j >= 0; j--) {
        var childEml = suggestEmailUl.childNodes[j];
        if (childEml.className) {
            if (childEml.className == "suggestLI") {
                suggestEmailUl.removeChild(suggestEmailUl.childNodes[j]);
            }
        }
    }
    //确定最终的搜索条件
    searchContent="";
    var n=0;
    for(var m in curCon){
        if(curCon[m]==1 && n==0){
            searchContent=searchContent.concat(m);
            n++;
        }else if(curCon[m]==1 && n!=0){
            searchContent=searchContent.concat(","+m);
        }
    }
    var hrefSplit = hrefParameter.split("search_content=");
    //当前页面的参数
    var hrefSplit2 = hrefSplit[1].split("curPage=");
    //重写hrefParaVis和hrefParaTable参数
    hrefParaVis=hrefSplit[0].concat("search_content=" + searchContent).concat("&protocol_type=" + hrefSplit2[0].split("&protocol_type=")[1]).concat("curPage=" + curID);
    hrefParaTable=hrefParaVis.concat("&nowPages="+"["+nowPage+"]");
    //清空input中的值
    document.getElementsByName("suggestContent")[0].value="";
    document.getElementsByName("suggestContent")[1].value="";
    ajaxTblReq();
    ajaxVisReq();
    allType();
});
//画分页的函数
function appendPages(pagesCounts,nowPage,pagesUl) {
    //页面总数<=10，显示全部页码
    if(pagesCounts<=10){
        var createLi=document.createElement("li");
        createLi.innerHTML="<a href='#'>上一页</a>";
        pagesUl.appendChild(createLi);
        for(var i=0;i<pagesCounts;i++){
            createLi=document.createElement("li");
            createLi.innerHTML="<a href='#'>"+(i+1)+"</a>";
            pagesUl.appendChild(createLi);
        }
        createLi=document.createElement("li");
        createLi.innerHTML="<a href='#'>下一页</a>";
        pagesUl.appendChild(createLi);
    }
    //页面总数>10
    else if(pagesCounts>10){
        //当前页码<=4  左侧显示所有 +  当前页码  +  右侧2个页码 + ... + 尾页
        if(nowPage<=4){
            createLi=document.createElement("li");
            createLi.innerHTML="<a href='#'>上一页</a>";
            pagesUl.appendChild(createLi);
            for(var j=0;j<nowPage+2;j++){
                createLi=document.createElement("li");
                createLi.innerHTML="<a href='#'>"+(j+1)+"</a>";
                pagesUl.appendChild(createLi);
            }
            createLi=document.createElement("li");
            createLi.innerHTML="<a href='#'>...</a>";
            pagesUl.appendChild(createLi);
            createLi=document.createElement("li");
            createLi.innerHTML="<a href='#'>"+pagesCounts+"</a>";
            pagesUl.appendChild(createLi);
            createLi=document.createElement("li");
            createLi.innerHTML="<a href='#'>下一页</a>";
            pagesUl.appendChild(createLi);
        }

        //4<当前页码<=pageCounts-3  首页  + ... + 左侧2个页码  + 当前页码  + 右侧2个页码  + ...  +  尾页
        if(nowPage>4 && nowPage<=pagesCounts-3){
            createLi=document.createElement("li");
            createLi.innerHTML="<a href='#'>上一页</a>";
            pagesUl.appendChild(createLi);
            createLi=document.createElement("li");
            createLi.innerHTML="<a href='#'>1</a>";
            pagesUl.appendChild(createLi);
            createLi=document.createElement("li");
            createLi.innerHTML="<a href='#'>...</a>";
            pagesUl.appendChild(createLi);
            for(var k=nowPage-2;k<=nowPage+2;k++){
                createLi=document.createElement("li");
                createLi.innerHTML="<a href='#'>"+k+"</a>";
                pagesUl.appendChild(createLi);
            }
            createLi=document.createElement("li");
            createLi.innerHTML="<a href='#'>...</a>";
            pagesUl.appendChild(createLi);
            createLi=document.createElement("li");
            createLi.innerHTML="<a href='#'>"+pagesCounts+"</a>";
            pagesUl.appendChild(createLi);
            createLi=document.createElement("li");
            createLi.innerHTML="<a href='#'>下一页</a>";
            pagesUl.appendChild(createLi);
        }

        //当前页码>pagesCounts-3  首页 + ... +  左侧2个页面 +  当前页码  +  右侧显示所有
        if(nowPage>pagesCounts-3){
            createLi=document.createElement("li");
            createLi.innerHTML="<a href='#'>上一页</a>";
            pagesUl.appendChild(createLi);
            createLi=document.createElement("li");
            createLi.innerHTML="<a href='#'>1</a>";
            pagesUl.appendChild(createLi);
            createLi=document.createElement("li");
            createLi.innerHTML="<a href='#'>...</a>";
            pagesUl.appendChild(createLi);
            for(var l=nowPage-2;l<=pagesCounts;l++){
                createLi=document.createElement("li");
                createLi.innerHTML="<a href='#'>"+l+"</a>";
                pagesUl.appendChild(createLi);
            }
            createLi=document.createElement("li");
            createLi.innerHTML="<a href='#'>下一页</a>";
            pagesUl.appendChild(createLi);
        }
    }
}
//填充表格
function appendHTTPTable(data) {
    //http表格行数列数
    var httprow=data.httpResult.length;
    var httpcol=data.httpHead.length;
    var httpcolWidth=width/httpcol;
    //创建表格
    var createhttptable=document.createElement("table");
    var appendhttptable=tableDiv.appendChild(createhttptable);
    var httptable=tableDiv.getElementsByTagName("table")[0];

    //为表头添加tr
    var createhttptabletr=document.createElement("tr");
    var appendhttptabletr=httptable.appendChild(createhttptabletr);
    var httptabletr=httpdataDiv.getElementsByTagName("tr")[0];

    //http添加表头
    for (var i = 0; i < httpcol; i++) {
        var httpthText = data.httpHead[i];
        var createhttptableth = document.createElement("th");
        var appendhttptableth = httptabletr.appendChild(createhttptableth);
        var httpth = httpdataDiv.getElementsByTagName("th")[i];
        var createhttpthText = document.createTextNode(httpthText);
        var appendhttpthText = httpth.appendChild(createhttpthText);
        httpth.style.width = httpcolWidth + "px";
    }

    //http添加数据
    for (var i = 0; i < httprow; i++) {
        //添加tr
        var createhttptr = document.createElement("tr");
        var appendhttptr = httptable.appendChild(createhttptr);
        var newhttptr = httpdataDiv.getElementsByTagName("tr")[i + 1];
        //添加td和数据
        for (var j = 0; j < httpcol; j++) {
            var curhttpData = data.httpResult[i][j];
            var createhttptd = document.createElement("td");
            var appendhttptd = newhttptr.appendChild(createhttptd);
            var newhttptd = newhttptr.childNodes[j];

            var createhttptdText = document.createTextNode(curhttpData);
            var appendhttptdText = newhttptd.appendChild(createhttptdText);
            newhttptd.style.width = httpcolWidth + "px";
        }
    }

}
function appendDNSTable(data) {
    //dns表格行数列数
    var dnsrow = data.dnsResult.length;
    var dnscol = data.dnsHead.length;
    var dnscolWidth = width / dnscol;
    //创建表格
    var creatednstable = document.createElement("table");
    var appenddnstable = tableDiv2.appendChild(creatednstable);
    var dnstable = tableDiv2.getElementsByTagName("table")[0];
    //为表头添加tr
    var creatednstabletr = document.createElement("tr");
    var appenddnstabletr = dnstable.appendChild(creatednstabletr);
    var dnstabletr = dnsdataDiv.getElementsByTagName("tr")[0];


    //dns添加表头
    for (var i = 0; i < dnscol; i++) {
        var dnsthText = data.dnsHead[i];
        var creatednstableth = document.createElement("th");
        var appenddnstableth = dnstabletr.appendChild(creatednstableth);
        var dnsth = dnsdataDiv.getElementsByTagName("th")[i];
        var creatednsthText = document.createTextNode(dnsthText);
        var appenddnsthText = dnsth.appendChild(creatednsthText);
        dnsth.style.width = dnscolWidth + "px";
    }

    //dns添加数据
    for (var i = 0; i < dnsrow; i++) {
        //添加tr
        var creatednstr = document.createElement("tr");
        var appenddnstr = dnstable.appendChild(creatednstr);
        var newdnstr = dnsdataDiv.getElementsByTagName("tr")[i + 1];
        //添加td和数据
        for (var j = 0; j < dnscol; j++) {
            var curdnsData = data.dnsResult[i][j];
            var creatednstd = document.createElement("td");
            var appenddnstd = newdnstr.appendChild(creatednstd);
            var newdnstd = newdnstr.childNodes[j];

            var creatednstdText = document.createTextNode(curdnsData);
            var appenddnstdText = newdnstd.appendChild(creatednstdText);
            newdnstd.style.width = dnscolWidth + "px";
        }
    }
}
function appendIPTable(data) {

    //ip五元组表格行数列数
    var iprow = data.ipResult.length;
    var ipcol = data.ipHead.length;
    var ipcolWidth = width / ipcol;
    //创建表格
    var createiptable = document.createElement("table");
    var appendiptable = tableDiv3.appendChild(createiptable);
    var iptable = tableDiv3.getElementsByTagName("table")[0];

    //为表头添加tr
    var createiptabletr = document.createElement("tr");
    var appendiptabletr = iptable.appendChild(createiptabletr);
    var iptabletr = ipdataDiv.getElementsByTagName("tr")[0];

    //ip添加表头
    for (var i = 0; i < ipcol; i++) {
        var ipthText = data.ipHead[i];
        var createiptableth = document.createElement("th");
        var appendiptableth = iptabletr.appendChild(createiptableth);
        var ipth = ipdataDiv.getElementsByTagName("th")[i];
        var createipthText = document.createTextNode(ipthText);
        var appendipthText = ipth.appendChild(createipthText);
        ipth.style.width = ipcolWidth + "px";
    }

    //ip添加数据
    for (var i = 0; i < iprow; i++) {
        //添加tr
        var createiptr = document.createElement("tr");
        var appendiptr = iptable.appendChild(createiptr);
        var newiptr = ipdataDiv.getElementsByTagName("tr")[i + 1];
        //添加td和数据
        for (var j = 0; j < ipcol; j++) {
            var curipData = data.ipResult[i][j];
            var createiptd = document.createElement("td");
            var appendiptd = newiptr.appendChild(createiptd);
            var newiptd = newiptr.childNodes[j];

            var createiptdText = document.createTextNode(curipData);
            var appendiptdText = newiptd.appendChild(createiptdText);
            newiptd.style.width = ipcolWidth + "px";
        }
    }
}
function appendEmailTable(data) {

    //邮件表格行数列数
    var emailrow = data.emlResult.length;
    var emailcol = data.emlHead.length;
    var emailcolWidth = width / emailcol;
    //创建表格
    var createemailtable = document.createElement("table");
    var appendemailtable = tableDiv4.appendChild(createemailtable);
    var emailtable = tableDiv4.getElementsByTagName("table")[0];

    //为表头添加tr
    var createemailtabletr = document.createElement("tr");
    var appendemailtabletr = emailtable.appendChild(createemailtabletr);
    var emailtabletr = emaildataDiv.getElementsByTagName("tr")[0];

    //邮件添加表头
    for (var i = 0; i < emailcol; i++) {
        var emailthText = data.emlHead[i];
        var createemailtableth = document.createElement("th");
        var appendemailtableth = emailtabletr.appendChild(createemailtableth);
        var emailth = emaildataDiv.getElementsByTagName("th")[i];
        var createemailthText = document.createTextNode(emailthText);
        var appendemailthText = emailth.appendChild(createemailthText);
        emailth.style.width = emailcolWidth + "px";
    }

    //邮件添加数据
    for (var i = 0; i < emailrow; i++) {
        //添加tr
        var createemailtr = document.createElement("tr");
        var appendemailtr = emailtable.appendChild(createemailtr);
        var newemailtr = emaildataDiv.getElementsByTagName("tr")[i + 1];
        //添加td和数据
        for (var j = 0; j < emailcol; j++) {
            var curemailData = data.emlResult[i][j];
            // //仅对邮件内容的长度进行控制，因为邮件内容过多，导致表格过于高。
            // if(j==8 && curemailData.length>20){
            //     curemailData=curemailData.substring(0,20).concat("...");
            // }
            var createemailtd = document.createElement("td");
            var appendemailtd = newemailtr.appendChild(createemailtd);
            var newemailtd = newemailtr.childNodes[j];
            var createemailtdText=document.createTextNode(curemailData);
            var appendemailtdText = newemailtd.appendChild(createemailtdText);
            newemailtd.style.width = emailcolWidth + "px";
        }
    }
}
//填充可视化
function appendHTTPVis(data) {
    //创建可视化图形div
    var createHttpLine=document.createElement("div");
    var appendHttpLine=visHttpDiv.appendChild(createHttpLine);
    var HttplineDiv=visHttpDiv.getElementsByTagName("div")[0];
    HttplineDiv.setAttribute("id","httplineDiv");

    var createHttpBar=document.createElement("div");
    var appendHttpBar=visHttpDiv.appendChild(createHttpBar);
    var HttpBarDiv=visHttpDiv.getElementsByTagName("div")[1];
    HttpBarDiv.setAttribute("id","httpClientDiv");

    var createHttpBar2=document.createElement("div");
    var appendHttpBar2=visHttpDiv.appendChild(createHttpBar2);
    var HttpBarDiv2=visHttpDiv.getElementsByTagName("div")[2];
    HttpBarDiv2.setAttribute("id","httpServerDiv");

    var createHttpPie=document.createElement("div");
    var appendHttpPie=visHttpDiv.appendChild(createHttpPie);
    var HttpPieDiv=visHttpDiv.getElementsByTagName("div")[3];
    HttpPieDiv.setAttribute("id","httpsPortDiv");

    var createHttpPie2=document.createElement("div");
    var appendHttpPie2=visHttpDiv.appendChild(createHttpPie2);
    var HttpPieDiv2=visHttpDiv.getElementsByTagName("div")[4];
    HttpPieDiv2.setAttribute("id","httpdPortDiv");

    // 基于准备好的dom，初始化echarts实例
    httplinechart = echarts.init(document.getElementById('httplineDiv'));
    httpclientChart=echarts.init(document.getElementById("httpClientDiv"));
    httpServerChart=echarts.init(document.getElementById("httpServerDiv"));
    httpSportChart=echarts.init(document.getElementById("httpsPortDiv"));
    httpDportChart=echarts.init(document.getElementById("httpdPortDiv"));
    // 指定图表的配置项和数据
    var httptimeoption = {
        title:{
            text:'请求时间规律'
            // x:'center'
        },
        tooltip : {
            trigger: 'axis',
            axisPointer : {
                type: 'shadow'
            }
        },


        toolbox: {
            show : true,
            // orient : 'vertical',
            // y : 'center',
            feature : {
                mark : {show: true},
                dataView:{show:true,readOnly:false},
                magicType : {show: true, type: ['line', 'bar']},
                restore : {show: true},
                saveAsImage : {show: true}
            }
        },
        calculable : true,
        xAxis : [
            {
                type : 'category',
                data :data.httptimeChart.timeLineX
            }
        ],
        yAxis : [
            {
                type : 'value',
                splitArea : {show : true},
                axisLabel:{
                    formatter:'{value}次'
                }
            }
        ],
        grid: {
            x2:40
        },
        series : [
            {
                name:'请求量',
                type:'line',
                data:data.httptimeChart.timeLineY,
                markPoint:{
                    data:[
                        {type:'max',name:'最大请求量'},
                        {type:'min',name:'平均请求量'}
                    ]
                },
                markLine : {
                    data : [
                        {type : 'average', name: '平均值'}
                    ]
                }
            }

        ]
    };
    var httpclientOption={
        title : {
            text: '客户端IP',
            subtext: '前十位'
        },
        tooltip : {
            trigger: 'axis'
        },
        toolbox: {
            show : true,
            feature : {
                dataView : {show: true, readOnly: false},
                magicType : {show: true, type: ['line', 'bar']},
                restore : {show: true},
                saveAsImage : {show: true}
            }
        },
        calculable : true,
        xAxis : [
            {
                type : 'category',
                data : data.httpclientChart.ipTen
            }
        ],
        yAxis : [
            {
                type : 'value'
            }
        ],
        series : [
            {
                name:'IP数量',
                type:'bar',
                data:data.httpclientChart.count,
                markPoint : {
                    data : [
                        {type : 'max', name: '最大值'},
                        {type : 'min', name: '最小值'}
                    ]
                },
                markLine : {
                    data : [
                        {type : 'average', name: '平均值'}
                    ]
                }
            }
        ]
    };
    var httpServerOption={
        title : {
            text: '服务器IP',
            subtext: '前十位'
        },
        tooltip : {
            trigger: 'axis'
        },
        toolbox: {
            show : true,
            feature : {
                dataView : {show: true, readOnly: false},
                magicType : {show: true, type: ['line', 'bar']},
                restore : {show: true},
                saveAsImage : {show: true}
            }
        },
        calculable : true,
        xAxis : [
            {
                type : 'category',
                data : data.httpserverChart.ipTen

            }
        ],
        yAxis : [
            {
                type : 'value'
            }
        ],
        series : [
            {
                name:'IP数量',
                type:'bar',
                data:data.httpserverChart.count,
                markPoint : {
                    data : [
                        {type : 'max', name: '最大值'},
                        {type : 'min', name: '最小值'}
                    ]
                },
                markLine : {
                    data : [
                        {type : 'average', name: '平均值'}
                    ]
                }
            }
        ]
    };
    var httpSportOption={
        title : {
            text: '源端口',
            subtext:'前五位及其他',
            x:'center'
        },
        tooltip : {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        legend: {
            orient : 'vertical',
            x : 'left',
            data:data.httpsportChart.nameSix
        },
        toolbox: {
            show : true,
            orient : 'vertical',
            feature : {
                mark : {show: true},
                dataView : {show: true, readOnly: false},

                //restore : {show: true},
                saveAsImage : {show: true}
            }
        },
        calculable : true,
        series : [
            {
                name:'源端口号',
                type:'pie',
                radius : ['15%', '55%'],
                center: ['50%', '60%'],
                roseType : 'radius',
                //width: '40%',       // for funnel
                //max: 35,            // for funnel
                itemStyle : {
                    normal : {
                        label : {
                            show : false
                        },
                        labelLine : {
                            show : false
                        }
                    },
                    emphasis : {
                        label : {
                            show : true
                        },
                        labelLine : {
                            show : true
                        }
                    }
                },
                data:data.httpsportChart.count
            }
        ]
    };
    var httpDportOption={
        title : {
            text: '目的端口',
            subtext:'前五位及其他',
            x:'center'
        },
        tooltip : {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        legend: {
            orient : 'vertical',
            x : 'left',
            data:data.httpdportChart.nameSix
        },
        toolbox: {
            show : true,
            orient : 'vertical',
            feature : {
                mark : {show: true},
                dataView : {show: true, readOnly: false},

                //restore : {show: true},
                saveAsImage : {show: true}
            }
        },
        calculable : true,
        series : [
            {
                name:'目的端口号',
                type:'pie',
                radius : ['15%', '55%'],
                center: ['50%', '60%'],
                roseType : 'radius',
                //width: '40%',       // for funnel
                //max: 35,            // for funnel
                itemStyle : {
                    normal : {
                        label : {
                            show : false
                        },
                        labelLine : {
                            show : false
                        }
                    },
                    emphasis : {
                        label : {
                            show : true
                        },
                        labelLine : {
                            show : true
                        }
                    }
                },
                data:data.httpdportChart.count
            }
        ]
    };

    // 使用刚指定的配置项和数据显示图表。
    httplinechart.setOption(httptimeoption);
    httpclientChart.setOption(httpclientOption);
    httpServerChart.setOption(httpServerOption);
    httpSportChart.setOption(httpSportOption);
    httpDportChart.setOption(httpDportOption);
}
function appendDNSVis(data) {
    var createDnsLine=document.createElement("div");
    var appendDnsLine=visDnsDiv.appendChild(createDnsLine);
    var DnslineDiv=visDnsDiv.getElementsByTagName("div")[0];
    DnslineDiv.setAttribute("id","dnslineDiv");

    var createDnsBar=document.createElement("div");
    var appendDnsBar=visDnsDiv.appendChild(createDnsBar);
    var DnsBarDiv=visDnsDiv.getElementsByTagName("div")[1];
    DnsBarDiv.setAttribute("id","dnsClientDiv");

    var createDnsBar2=document.createElement("div");
    var appendDnsBar2=visDnsDiv.appendChild(createDnsBar2);
    var DnsBarDiv2=visDnsDiv.getElementsByTagName("div")[2];
    DnsBarDiv2.setAttribute("id","dnsServerDiv");

    var createDnsPie=document.createElement("div");
    var appendDnsPie=visDnsDiv.appendChild(createDnsPie);
    var DnsPieDiv=visDnsDiv.getElementsByTagName("div")[3];
    DnsPieDiv.setAttribute("id","dnsHostipDiv");

    var createDnsPie2=document.createElement("div");
    var appendDnsPie2=visDnsDiv.appendChild(createDnsPie2);
    var DnsPieDiv2=visDnsDiv.getElementsByTagName("div")[4];
    DnsPieDiv2.setAttribute("id","dnsBlackdomainDiv");

    dnslinechart=echarts.init(document.getElementById('dnslineDiv'));
    dnsclientChart=echarts.init(document.getElementById("dnsClientDiv"));
    dnsServerChart=echarts.init(document.getElementById("dnsServerDiv"));
    dnsHostipChart=echarts.init(document.getElementById("dnsHostipDiv"));
    dnsBlackdomainChart=echarts.init(document.getElementById("dnsBlackdomainDiv"));

    var dnstimeoption = {
        title:{
            text:'请求时间规律'
            // x:'center'
        },
        tooltip : {
            trigger: 'axis',
            axisPointer : {
                type: 'shadow'
            }
        },


        toolbox: {
            show : true,
            // orient : 'vertical',
            // y : 'center',
            feature : {
                mark : {show: true},
                dataView:{show:true,readOnly:false},
                magicType : {show: true, type: ['line', 'bar']},
                restore : {show: true},
                saveAsImage : {show: true}
            }
        },
        calculable : true,
        xAxis : [
            {
                type : 'category',
                data : data.dnstimeChart.timeLineX
            }
        ],
        yAxis : [
            {
                type : 'value',
                splitArea : {show : true},
                axisLabel:{
                    formatter:'{value}次'
                }
            }
        ],
        grid: {
            x2:40
        },
        series : [
            {
                name:'请求量',
                type:'line',
                data:data.dnstimeChart.timeLineY,
                markPoint:{
                    data:[
                        {type:'max',name:'最大请求量'},
                        {type:'min',name:'最小请求量'}
                        //{type:'average',name:'平均请求量'}
                    ]
                },
                markLine : {
                    data : [
                        {type : 'average', name: '平均值'}
                    ]
                }
            }

        ]
    };
    var dnsclientOption={
        width:'auto',
        height:'auto',
        title : {
            text: '客户端IP',
            subtext: '前十位'
        },
        tooltip : {
            trigger: 'axis'
        },
        toolbox: {
            show : true,
            feature : {
                dataView : {show: true, readOnly: false},
                magicType : {show: true, type: ['line', 'bar']},
                restore : {show: true},
                saveAsImage : {show: true}
            }
        },
        calculable : true,
        xAxis : [
            {
                type : 'category',
                data : data.dnsclientChart.ipTen

            }
        ],
        yAxis : [
            {
                type : 'value'
            }
        ],
        series : [
            {
                name:'IP数量',
                type:'bar',
                data:data.dnsclientChart.count,
                markPoint : {
                    data : [
                        {type : 'max', name: '最大值'},
                        {type : 'min', name: '最小值'}
                    ]
                },
                markLine : {
                    data : [
                        {type : 'average', name: '平均值'}
                    ]
                }
            }
        ]
    };
    var dnsServerOption={
        title : {
            text: '服务器IP',
            subtext: '前十位'
        },
        tooltip : {
            trigger: 'axis'
        },
        toolbox: {
            show : true,
            feature : {
                dataView : {show: true, readOnly: false},
                magicType : {show: true, type: ['line', 'bar']},
                restore : {show: true},
                saveAsImage : {show: true}
            }
        },
        calculable : true,
        xAxis : [
            {
                type : 'category',
                data : data.dnsserverChart.ipTen

            }
        ],
        yAxis : [
            {
                type : 'value'
            }
        ],
        series : [
            {
                name:'IP数量',
                type:'bar',
                data:data.dnsserverChart.count,
                markPoint : {
                    data : [
                        {type : 'max', name: '最大值'},
                        {type : 'min', name: '最小值'}
                    ]
                },
                markLine : {
                    data : [
                        {type : 'average', name: '平均值'}
                    ]
                }
            }
        ]
    };
    var dnsHostipOption={
        title : {
            text: 'hostIP',
            x:'center'
        },
        tooltip : {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        legend: {
            orient : 'vertical',
            x : 'left',
            data:data.dnshostipChart.nameSix
        },
        toolbox: {
            show : true,
            orient : 'vertical',
            feature : {
                mark : {show: true},
                dataView : {show: true, readOnly: false},

                //restore : {show: true},
                saveAsImage : {show: true}
            }
        },
        calculable : true,
        series : [
            {
                name:'hostIP',
                type:'pie',
                radius : ['15%', '55%'],
                center: ['50%', '60%'],
                roseType : 'radius',
                //width: '40%',       // for funnel
                //max: 35,            // for funnel
                itemStyle : {
                    normal : {
                        label : {
                            show : false
                        },
                        labelLine : {
                            show : false
                        }
                    },
                    emphasis : {
                        label : {
                            show : true
                        },
                        labelLine : {
                            show : true
                        }
                    }
                },
                data:data.dnshostipChart.count
            }
        ]
    };
    var dnsBlackdomainOption={
        title : {
            text: '黑域名',
            x:'center'
        },
        tooltip : {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        legend: {
            orient : 'vertical',
            x : 'left',
            data:data.dnsblackdomainChart.blackdomain
        },
        toolbox: {
            show : true,
            orient : 'vertical',
            feature : {
                mark : {show: true},
                dataView : {show: true, readOnly: false},

                //restore : {show: true},
                saveAsImage : {show: true}
            }
        },
        calculable : true,
        series : [
            {
                name:'是否为黑域名',
                type:'pie',
                radius : ['15%', '55%'],
                center: ['50%', '60%'],
                roseType : 'radius',
                //width: '40%',       // for funnel
                //max: 35,            // for funnel
                itemStyle : {
                    normal : {
                        label : {
                            show : false
                        },
                        labelLine : {
                            show : false
                        }
                    },
                    emphasis : {
                        label : {
                            show : true
                        },
                        labelLine : {
                            show : true
                        }
                    }
                },
                data:data.dnsblackdomainChart.count
            }
        ]
    };


    dnslinechart.setOption(dnstimeoption);
    dnsclientChart.setOption(dnsclientOption);
    dnsServerChart.setOption(dnsServerOption);
    dnsHostipChart.setOption(dnsHostipOption);
    dnsBlackdomainChart.setOption(dnsBlackdomainOption);


}
function appendIPVis(data) {
    var createIpLine=document.createElement("div");
    var appendIpLine=visIpDiv.appendChild(createIpLine);
    var IplineDiv=visIpDiv.getElementsByTagName("div")[0];
    IplineDiv.setAttribute("id","iplineDiv");

    var createIpBar=document.createElement("div");
    var appendIpBar=visIpDiv.appendChild(createIpBar);
    var IpBarDiv=visIpDiv.getElementsByTagName("div")[1];
    IpBarDiv.setAttribute("id","ipSipDiv");

    var createIpBar2=document.createElement("div");
    var appendIpBar2=visIpDiv.appendChild(createIpBar2);
    var IpBarDiv2=visIpDiv.getElementsByTagName("div")[2];
    IpBarDiv2.setAttribute("id","ipDipDiv");

    var createIpPie=document.createElement("div");
    var appendIpPie=visIpDiv.appendChild(createIpPie);
    var IpPieDiv=visIpDiv.getElementsByTagName("div")[3];
    IpPieDiv.setAttribute("id","ipSportDiv");

    var createIpPie2=document.createElement("div");
    var appendIpPie2=visIpDiv.appendChild(createIpPie2);
    var IpPieDiv2=visIpDiv.getElementsByTagName("div")[4];
    IpPieDiv2.setAttribute("id","ipDportDiv");

    iplinechart=echarts.init(document.getElementById('iplineDiv'));
    ipSipChart=echarts.init(document.getElementById("ipSipDiv"));
    ipDipChart=echarts.init(document.getElementById("ipDipDiv"));
    ipSportChart=echarts.init(document.getElementById("ipSportDiv"));
    ipDportChart=echarts.init(document.getElementById("ipDportDiv"));

    var iptimeoption = {
        title:{
            text:'请求时间规律'
            // x:'center'
        },
        tooltip : {
            trigger: 'axis',
            axisPointer : {
                type: 'shadow'
            }
        },


        toolbox: {
            show : true,
            // orient : 'vertical',
            // y : 'center',
            feature : {
                mark : {show: true},
                dataView:{show:true,readOnly:false},
                magicType : {show: true, type: ['line', 'bar']},
                restore : {show: true},
                saveAsImage : {show: true}
            }
        },
        calculable : true,
        xAxis : [
            {
                type : 'category',
                data : data.iptimeChart.timeLineX
            }
        ],
        yAxis : [
            {
                type : 'value',
                splitArea : {show : true},
                axisLabel:{
                    formatter:'{value}次'
                }
            }
        ],
        grid: {
            x2:40
        },
        series : [
            {
                name:'请求量',
                type:'line',
                data:data.iptimeChart.timeLineY,
                markPoint:{
                    data:[
                        {type:'max',name:'最大请求量'},
                        {type:'min',name:'最小请求量'}
                        //{type:'average',name:'平均请求量'}
                    ]
                },
                markLine : {
                    data : [
                        {type : 'average', name: '平均值'}
                    ]
                }
            }

        ]
    };
    var ipSipOption={
        title : {
            text: '源IP',
            subtext: '前十位'
        },
        tooltip : {
            trigger: 'axis'
        },
        toolbox: {
            show : true,
            feature : {
                dataView : {show: true, readOnly: false},
                magicType : {show: true, type: ['line', 'bar']},
                restore : {show: true},
                saveAsImage : {show: true}
            }
        },
        calculable : true,
        xAxis : [
            {
                type : 'category',
                data : data.ipSipChart.ipTen

            }
        ],
        yAxis : [
            {
                type : 'value'
            }
        ],
        series : [
            {
                name:'IP数量',
                type:'bar',
                data:data.ipSipChart.count,
                markPoint : {
                    data : [
                        {type : 'max', name: '最大值'},
                        {type : 'min', name: '最小值'}
                    ]
                },
                markLine : {
                    data : [
                        {type : 'average', name: '平均值'}
                    ]
                }
            }
        ]
    };
    var ipDipOption={
        title : {
            text: '目的IP',
            subtext: '前十位'
        },
        tooltip : {
            trigger: 'axis'
        },
        toolbox: {
            show : true,
            feature : {
                dataView : {show: true, readOnly: false},
                magicType : {show: true, type: ['line', 'bar']},
                restore : {show: true},
                saveAsImage : {show: true}
            }
        },
        calculable : true,
        xAxis : [
            {
                type : 'category',
                data : data.ipDipChart.ipTen

            }
        ],
        yAxis : [
            {
                type : 'value'
            }
        ],
        series : [
            {
                name:'IP数量',
                type:'bar',
                data:data.ipDipChart.count,
                markPoint : {
                    data : [
                        {type : 'max', name: '最大值'},
                        {type : 'min', name: '最小值'}
                    ]
                },
                markLine : {
                    data : [
                        {type : 'average', name: '平均值'}
                    ]
                }
            }
        ]
    };
    var ipSportOption={
        title : {
            text: '源端口',
            subtext:'前五位及其他',
            x:'center'
        },
        tooltip : {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        legend: {
            orient : 'vertical',
            x : 'left',
            data:data.ipsportChart.nameSix
        },
        toolbox: {
            show : true,
            orient : 'vertical',
            feature : {
                mark : {show: true},
                dataView : {show: true, readOnly: false},

                //restore : {show: true},
                saveAsImage : {show: true}
            }
        },
        calculable : true,
        series : [
            {
                name:'源端口',
                type:'pie',
                radius : ['15%', '55%'],
                center: ['50%', '60%'],
                roseType : 'radius',
                //width: '40%',       // for funnel
                //max: 35,            // for funnel
                itemStyle : {
                    normal : {
                        label : {
                            show : false
                        },
                        labelLine : {
                            show : false
                        }
                    },
                    emphasis : {
                        label : {
                            show : true
                        },
                        labelLine : {
                            show : true
                        }
                    }
                },
                data:data.ipsportChart.count
            }
        ]
    };
    var ipDportOption={
        title : {
            text: '目的端口',
            subtext:'前五位及其他',
            x:'center'
        },
        tooltip : {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        legend: {
            orient : 'vertical',
            x : 'left',
            data:data.ipdportChart.nameSix
        },
        toolbox: {
            show : true,
            orient : 'vertical',
            feature : {
                mark : {show: true},
                dataView : {show: true, readOnly: false},

                //restore : {show: true},
                saveAsImage : {show: true}
            }
        },
        calculable : true,
        series : [
            {
                name:'目的端口',
                type:'pie',
                radius : ['15%', '55%'],
                center: ['50%', '60%'],
                roseType : 'radius',
                //width: '40%',       // for funnel
                //max: 35,            // for funnel
                itemStyle : {
                    normal : {
                        label : {
                            show : false
                        },
                        labelLine : {
                            show : false
                        }
                    },
                    emphasis : {
                        label : {
                            show : true
                        },
                        labelLine : {
                            show : true
                        }
                    }
                },
                data:data.ipdportChart.count
            }
        ]
    };


    iplinechart.setOption(iptimeoption);
    ipSipChart.setOption(ipSipOption);
    ipDipChart.setOption(ipDipOption);
    ipSportChart.setOption(ipSportOption);
    ipDportChart.setOption(ipDportOption);


}
function appendEmailVis(data) {
    var createEmailLine=document.createElement("div");
    var appendEmailLine=visEmailDiv.appendChild(createEmailLine);
    var EmaillineDiv=visEmailDiv.getElementsByTagName("div")[0];
    EmaillineDiv.setAttribute("id","EmailLineDiv");

    var createEmaillBar=document.createElement("div");
    var appendEmaillBar=visEmailDiv.appendChild(createEmaillBar);
    var EmaillBarDiv=visEmailDiv.getElementsByTagName("div")[1];
    EmaillBarDiv.setAttribute("id","EmailSipDiv");

    var createEmaillBar2=document.createElement("div");
    var appendEmaillBar2=visEmailDiv.appendChild(createEmaillBar2);
    var EmaillBarDiv2=visEmailDiv.getElementsByTagName("div")[2];
    EmaillBarDiv2.setAttribute("id","EmailDipDiv");

    var createEmaillPie=document.createElement("div");
    var appendEmaillPie=visEmailDiv.appendChild(createEmaillPie);
    var EmaillPieDiv=visEmailDiv.getElementsByTagName("div")[3];
    EmaillPieDiv.setAttribute("id","EmailFromDiv");

    var createEmaillPie2=document.createElement("div");
    var appendEmaillPie2=visEmailDiv.appendChild(createEmaillPie2);
    var EmaillPieDiv2=visEmailDiv.getElementsByTagName("div")[4];
    EmaillPieDiv2.setAttribute("id","EmailToDiv");

    emaillinechart=echarts.init(document.getElementById('EmailLineDiv'));
    emailSipChart=echarts.init(document.getElementById("EmailSipDiv"));
    emailDipChart=echarts.init(document.getElementById("EmailDipDiv"));
    emailFromChart=echarts.init(document.getElementById("EmailFromDiv"));
    emailToChart=echarts.init(document.getElementById("EmailToDiv"));

    var emailtimeoption = {
        title:{
            text:'邮件时间规律'
            // x:'center'
        },
        tooltip : {
            trigger: 'axis',
            axisPointer : {
                type: 'shadow'
            }
        },


        toolbox: {
            show : true,
            // orient : 'vertical',
            // y : 'center',
            feature : {
                mark : {show: true},
                dataView:{show:true,readOnly:false},
                magicType : {show: true, type: ['line', 'bar']},
                restore : {show: true},
                saveAsImage : {show: true}
            }
        },
        calculable : true,
        xAxis : [
            {
                type : 'category',
                data : data.emailtimeChart.timeLineX
            }
        ],
        yAxis : [
            {
                type : 'value',
                splitArea : {show : true},
                axisLabel:{
                    formatter:'{value}次'
                }
            }
        ],
        grid: {
            x2:40
        },
        series : [
            {
                name:'请求量',
                type:'line',
                data:data.emailtimeChart.timeLineY,
                markPoint:{
                    data:[
                        {type:'max',name:'最大请求量'},
                        {type:'min',name:'最小请求量'}
                        //{type:'average',name:'平均请求量'}
                    ]
                },
                markLine : {
                    data : [
                        {type : 'average', name: '平均值'}
                    ]
                }
            }

        ]
    };
    var emailSipOption={
        title : {
            text: '源IP',
            subtext: '前十位'
        },
        tooltip : {
            trigger: 'axis'
        },
        toolbox: {
            show : true,
            feature : {
                dataView : {show: true, readOnly: false},
                magicType : {show: true, type: ['line', 'bar']},
                restore : {show: true},
                saveAsImage : {show: true}
            }
        },
        calculable : true,
        xAxis : [
            {
                type : 'category',
                data : data.emailSipChart.ipTen

            }
        ],
        yAxis : [
            {
                type : 'value'
            }
        ],
        series : [
            {
                name:'IP数量',
                type:'bar',
                data:data.emailSipChart.count,
                markPoint : {
                    data : [
                        {type : 'max', name: '最大值'},
                        {type : 'min', name: '最小值'}
                    ]
                },
                markLine : {
                    data : [
                        {type : 'average', name: '平均值'}
                    ]
                }
            }
        ]
    };
    var emailDipOption={
        title : {
            text: '目的IP',
            subtext: '前十位'
        },
        tooltip : {
            trigger: 'axis'
        },
        toolbox: {
            show : true,
            feature : {
                dataView : {show: true, readOnly: false},
                magicType : {show: true, type: ['line', 'bar']},
                restore : {show: true},
                saveAsImage : {show: true}
            }
        },
        calculable : true,
        xAxis : [
            {
                type : 'category',
                data : data.emailDipChart.ipTen

            }
        ],
        yAxis : [
            {
                type : 'value'
            }
        ],
        series : [
            {
                name:'IP数量',
                type:'bar',
                data:data.emailDipChart.count,
                markPoint : {
                    data : [
                        {type : 'max', name: '最大值'},
                        {type : 'min', name: '最小值'}
                    ]
                },
                markLine : {
                    data : [
                        {type : 'average', name: '平均值'}
                    ]
                }
            }
        ]
    };
    var emailFromOption={
        title : {
            text: '发件人',
            subtext:'前五位及其他',
            x:'center'
        },
        tooltip : {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        legend: {
            orient : 'vertical',
            x : 'left',
            data:data.emailFrom.nameSix
        },
        toolbox: {
            show : true,
            orient : 'vertical',
            feature : {
                mark : {show: true},
                dataView : {show: true, readOnly: false},

                //restore : {show: true},
                saveAsImage : {show: true}
            }
        },
        calculable : true,
        series : [
            {
                name:'发件人',
                type:'pie',
                radius : ['15%', '55%'],
                center: ['50%', '60%'],
                roseType : 'radius',
                //width: '40%',       // for funnel
                //max: 35,            // for funnel
                itemStyle : {
                    normal : {
                        label : {
                            show : false
                        },
                        labelLine : {
                            show : false
                        }
                    },
                    emphasis : {
                        label : {
                            show : true
                        },
                        labelLine : {
                            show : true
                        }
                    }
                },
                data:data.emailFrom.count
            }
        ]
    };
    var emailToOption={
        title : {
            text: '收件人',
            subtext:'前五位及其他',
            x:'center'
        },
        tooltip : {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        legend: {
            orient : 'vertical',
            x : 'left',
            data:data.emailTo.nameSix
        },
        toolbox: {
            show : true,
            orient : 'vertical',
            feature : {
                mark : {show: true},
                dataView : {show: true, readOnly: false},

                //restore : {show: true},
                saveAsImage : {show: true}
            }
        },
        calculable : true,
        series : [
            {
                name:'收件人',
                type:'pie',
                radius : ['15%', '55%'],
                center: ['50%', '60%'],
                roseType : 'radius',
                //width: '40%',       // for funnel
                //max: 35,            // for funnel
                itemStyle : {
                    normal : {
                        label : {
                            show : false
                        },
                        labelLine : {
                            show : false
                        }
                    },
                    emphasis : {
                        label : {
                            show : true
                        },
                        labelLine : {
                            show : true
                        }
                    }
                },
                data:data.emailTo.count
            }
        ]
    };


    emaillinechart.setOption(emailtimeoption);
    emailSipChart.setOption(emailSipOption);
    emailDipChart.setOption(emailDipOption);
    emailFromChart.setOption(emailFromOption);
    emailToChart.setOption(emailToOption);


}
//allType与getMax为推荐函数
function allType() {
    result = [];
    emailResult = [];
    $.ajax({
        type:'get',
        async: false,
        dataType:'json',
        url:'../data/tableData.json',

        // dataType:'jsonp',
        // url:'http://192.168.1.166:8888/nanjing/search/page'+hrefParaSug,
        // jsonp:'callback',
        // jsonpCallback:"foo",
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            console.log(XMLHttpRequest,textStatus,errorThrown);
            alert("请求表格数据失败，请输入正确的搜索条件");
        },
        success:function (data) {
            console.log(data);
            var search_content=[];
            search_content=searchContent.split(",");
            var byIp=[],byPort=[],byTime=[],byLoc=[];
            //dns
            // console.log(data.dnsResult,data.dnsResult.length);
            if(data.dnsResult.length>0) {
                for (var i = 0; i < data.dnsResult.length; i++) {
                    //因为结果中搜索之后，search_content中搜索内容有多个，所以要用$.inArray(value,array)进行判断,值为-1说明不在数组中
                    if ($.inArray(data.dnsResult[i][0],search_content) == -1 ){//ClientIp
                        byIp.push(data.dnsResult[i][0]);
                    }
                    if ($.inArray(data.dnsResult[i][1],search_content) == -1) {   //ServerIp
                        byIp.push(data.dnsResult[i][1]);
                    }
                    var indexDns=[2,3,4,5,6,7];//客户端位置:国家,省份,城市;客户端位置:国家,省份,城市;的下标
                    for(var j=0;j<indexDns.length;j++){
                        if((data.dnsResult[i][indexDns[j]] != "null")&&(data.dnsResult[i][indexDns[j]] != null)){
                            if(search_content.length==0){//加上此条件判断是因为如果搜索内容为空的话，byloc数组会为空
                                byLoc.push(data.dnsResult[i][indexDns[j]]);
                            }
                            else {//如果搜索内容是江苏，那么不能推荐江苏省
                                if(judge(data.dnsResult[i][indexDns[j]],search_content)){
                                    byLoc.push(data.dnsResult[i][indexDns[j]]);
                                }
                            }
                        }
                    }
                }
            }
            // http
            var httpSPort=[],hspRes;
            if(data.httpResult.length>0){
                for (var i = 0; i < data.httpResult.length; i++) {
                    if ($.inArray(data.httpResult[i][2],search_content) == -1) {   //ClientIp
                        byIp.push(data.httpResult[i][2]);
                    }
                    if ($.inArray(data.httpResult[i][3],search_content) == -1) {    //ServerIp
                        byIp.push(data.httpResult[i][3]);
                    }
                    var indexHttp=[4,5,6,7,8,9];//客户端位置:国家,省份,城市;客户端位置:国家,省份,城市;的下标
                    for(var j=0;j<indexHttp.length;j++){
                        if((data.httpResult[i][indexHttp[j]] != "null")&&(data.httpResult[i][indexHttp[j]] != null)){
                            if(search_content.length==0){//加上此条件判断是因为如果搜索内容为空的话，byloc数组会为空
                                byLoc.push(data.httpResult[i][indexHttp[j]]);
                            }
                            else {//如果搜索内容是江苏，那么不能推荐江苏省
                                if(judge(data.httpResult[i][indexHttp[j]],search_content)){
                                    byLoc.push(data.httpResult[i][indexHttp[j]]);
                                }
                            }
                        }
                    }
                    httpSPort.push(data.httpResult[i][10]);   //SourcePort
                }
                if(httpSPort.length>0){   //根据SourcePort的最大值获得对应ip
                    hspRes=getMax(httpSPort);
                    for(var j = 0; j < data.httpResult.length; j++){
                        if(($.inArray(data.httpResult[j][2],search_content) == -1)&&(data.httpResult[j][10] == hspRes)){//根据sPort找Cip
                            byPort.push(data.httpResult[j][2]);
                        }
                        if(($.inArray(data.httpResult[j][3],search_content) == -1)&&(data.httpResult[j][10] == hspRes)){//根据sPort找Sip
                            byPort.push(data.httpResult[j][3]);
                        }
                    }
                }
            }
            //ip五元组
            var ipPort=[],ipRes,ipTimeInterval=[];
            var ipArr=[];
            if(data.ipResult.length>0){
                for(var i=0;i<data.ipResult.length;i++) {
                    ipArr[i]=new Array();//ipArr中的数据有cIp、sIp、时间间隔
                    ipArr[i].push(data.ipResult[i][0]);  //cip
                    ipArr[i].push(data.ipResult[i][1]);//sip
                    ipArr[i].push(data.ipResult[i][11].split(" ")[0] - data.ipResult[i][10].split(" ")[0]);//时间间隔
                    if ($.inArray(data.ipResult[i][0],search_content) == -1) { //ClientIp
                        byIp.push(data.ipResult[i][0]);
                    }
                    if ($.inArray(data.ipResult[i][1],search_content) == -1) {   //ServerIp
                        byIp.push(data.ipResult[i][1]);
                    }
                    var indexIp=[2,3,4,5,6,7];//客户端位置:国家,省份,城市;客户端位置:国家,省份,城市;的下标
                    for(var j=0;j<indexIp.length;j++){
                        if((data.ipResult[i][indexIp[j]] != "null")&&(data.ipResult[i][indexIp[j]] != null)){
                            if(search_content.length==0){//加上此条件判断是因为如果搜索内容为空的话，byloc数组会为空
                                byLoc.push(data.ipResult[i][indexIp[j]]);
                            }
                            else {//如果搜索内容是江苏，那么不能推荐江苏省
                                if(judge(data.ipResult[i][indexIp[j]],search_content)){
                                    byLoc.push(data.ipResult[i][indexIp[j]]);
                                }
                            }
                        }
                    }
                    ipPort.push(data.ipResult[i][8]);    //源端口和目的端口
                    ipPort.push(data.ipResult[i][9]);
                    ipTimeInterval.push(data.ipResult[i][11].split(" ")[0] - data.ipResult[i][10].split(" ")[0]);//时间间隔
                }
                if(ipPort.length>0){   //根据源端口和目的端口的最大值获得对应ip
                    ipRes=getMax(ipPort);
                    for(var j = 0; j < data.ipResult.length; j++){
                        if(($.inArray(data.ipResult[j][0],search_content) == -1)&&((data.ipResult[j][8] == ipRes)||(data.ipResult[j][9] == ipRes))){//cIp
                            byPort.push(data.ipResult[j][0]);
                        }
                        if(($.inArray(data.ipResult[j][1],search_content) == -1)&&((data.ipResult[j][8] == ipRes)||(data.ipResult[j][9] == ipRes))){//sIp
                            byPort.push(data.ipResult[j][1]);
                        }
                    }
                }
                if(ipTimeInterval.length>0){   //根据时间间隔的最大值获得对应ip
                    ipRes=getMax(ipTimeInterval);
                    for(var j = 0; j < ipArr.length; j++){
                        if(($.inArray(ipArr[j][0],search_content)==-1)&&(ipArr[j][2] == ipRes)){//cIp
                            byTime.push(ipArr[j][0]);
                        }
                        if(($.inArray(ipArr[j][1],search_content)==-1)&&(ipArr[j][2] == ipRes)){//sIp
                            byTime.push(ipArr[j][1]);
                        }
                    }
                }
            }
            //email
            var emlIp=[],emlLoc=[],emlFromTo=[],emlSubject=[];
            if (data.emlResult.length>0) {
                console.log(search_content)
                for (var i = 0; i < data.emlResult.length; i++) {
                    if ($.inArray(data.emlResult[i][0],search_content)==-1) {//源ip
                        emlIp.push(data.emlResult[i][0]);
                    }
                    if ($.inArray(data.emlResult[i][1],search_content)==-1) {//目的ip
                        emlIp.push(data.emlResult[i][1]);
                    }
                    var indexEml=[2,3,4,5,6,7];//客户端位置:国家,省份,城市;客户端位置:国家,省份,城市;的下标
                    for(var j=0;j<indexEml.length;j++){
                        if((data.emlResult[i][indexEml[j]] != "null")&&(data.emlResult[i][indexEml[j]] != null)){
                            if(search_content.length==0){//加上此条件判断是因为如果搜索内容为空的话，byloc数组会为空
                                emlLoc.push(data.emlResult[i][indexEml[j]]);
                            }
                            else {//如果搜索内容是江苏，那么不能推荐江苏省
                                if(judge(data.emlResult[i][indexEml[j]],search_content)){
                                    emlLoc.push(data.emlResult[i][indexEml[j]]);
                                }
                            }
                        }
                    }
                    if (($.inArray(data.emlResult[i][9],search_content) == -1)&&(data.emlResult[i][9] != "null")&&(data.emlResult[i][9] != null)) {//发件人
                        emlFromTo.push(data.emlResult[i][9]);
                    }
                    if (($.inArray(data.emlResult[i][10],search_content) == -1)&&(data.emlResult[i][10] != "null")&&(data.emlResult[i][10] != null)) {//收件人
                        emlFromTo.push(data.emlResult[i][10]);
                    }
                    if((data.emlResult[i][11] != "null")&&(data.emlResult[i][11] != null)){//主题
                        if(search_content.length==0){
                            emlSubject.push(data.emlResult[i][11]);
                        }
                        else {
                            if (judge(data.emlResult[i][11], search_content)) {
                                emlSubject.push(data.emlResult[i][11]);
                            }
                        }
                    }
                }
            }
            console.log(byIp);
            console.log(byLoc);
            console.log(byTime);
            console.log(byPort);

            console.log(emlLoc);
            console.log(emlFromTo);
            console.log(emlSubject);
            console.log(emlIp);
            if((byIp.length>0)&&($.inArray(getMax(byIp),result)==-1)){
                result.push(getMax(byIp));
            }
            if((byPort.length>0)&&($.inArray(getMax(byPort),result)==-1)){
                result.push(getMax(byPort));
            }
            if((byTime.length>0)&&($.inArray(getMax(byTime),result)==-1)){
                result.push(getMax(byTime));
            }
            if((byLoc.length>0)&&($.inArray(getMax(byLoc),result)==-1)){
                result.push(getMax(byLoc));
            }
            if((emlIp.length>0)&&($.inArray(getMax(emlIp),result)==-1)){
                emailResult.push(getMax(emlIp));
            }
            if((emlFromTo.length>0)&&($.inArray(getMax(emlFromTo),result)==-1)){
                emailResult.push(getMax(emlFromTo));
            }
            if((emlSubject.length>0)&&($.inArray(getMax(emlSubject),result)==-1)){
                emailResult.push(getMax(emlSubject));
            }
            if ((emlLoc.length>0)&&($.inArray(getMax(emlLoc),result)==-1)){
                emailResult.push(getMax(emlLoc));
            }
            console.log(result);
            console.log(emailResult);
            try {
                // 推荐的东西
                //HTTP,DNS,IP五元组推荐
                // console.log(result,result.length);
                // console.log(result);
                var suggestLen = result.length;
                if (flag == 0) {
                    var suggestli1 = document.createElement("li");
                    var suggesttext1 = document.createTextNode("推荐：");
                    suggestUl.appendChild(suggestli1);
                    suggestli1.appendChild(suggesttext1);
                    flag = 1;
                }
                if (suggestLen == 0) {
                    var suggestli2 = document.createElement("li");
                    var suggesttext2 = document.createTextNode("无");
                    suggestUl.appendChild(suggestli2);
                    suggestli2.appendChild(suggesttext2);
                    suggestli2.setAttribute("class", "suggestLI");
                }
                else {
                    for (var i = 0; i < result.length; i++) {
                        var text = result[i];
                        var suggestLi = document.createElement("li");
                        var suggestText = document.createTextNode(text);
                        suggestUl.appendChild(suggestLi);
                        suggestLi.appendChild(suggestText);
                        suggestLi.setAttribute("class", "suggestLI");
                    }
                }
                //邮件推荐
                // console.log(emailResult);
                var suggestEmlLen = emailResult.length;
                if (flagEml == 0) {
                    var suggestEmlli1 = document.createElement("li");
                    var suggestEmltext1 = document.createTextNode("推荐：");
                    suggestEmailUl.appendChild(suggestEmlli1);
                    suggestEmlli1.appendChild(suggestEmltext1);
                    flagEml = 1;
                }
                if (suggestEmlLen == 0) {
                    var suggestEmlli2 = document.createElement("li");
                    var suggestEmltext2 = document.createTextNode("无");
                    suggestEmailUl.appendChild(suggestEmlli2);
                    suggestEmlli2.appendChild(suggestEmltext2);
                    suggestEmlli2.setAttribute("class", "suggestLI");
                }
                else {
                    for (var i = 0; i < emailResult.length; i++) {
                        var textEml = emailResult[i];
                        var suggestEmlLi = document.createElement("li");
                        var suggestEmlText = document.createTextNode(textEml);
                        suggestEmailUl.appendChild(suggestEmlLi);
                        suggestEmlLi.appendChild(suggestEmlText);
                        suggestEmlLi.setAttribute("class", "suggestLI");
                    }
                }
            }catch (e){}
        }
    });

}
//该函数用于判断搜索内容中有没有元素是结果元素的子串，在判断国家、主题的时候用，例子：搜索内容是江苏，返回的结果里面有江苏省，要加以判断
function judge(str,arr) {
    for(var i=0;i<arr.length;i++){
        if(str.indexOf(arr[i]) != -1){
            return false;
        }
    }
    return true;
}
function getMax(arr) {
    var obj = {},objReturn={}, key = [], value = [];
    for (var i = 0; i < arr.length; i++) {
        !obj[arr[i]] ? obj[arr[i]] = 1 : obj[arr[i]] += 1;
    }
    // console.log(obj);
    for (i in obj) {
        key.push(i);
        value.push(obj[i]);
    }
    //取得val中的最大值
    var max = Math.max.apply("", value);
    var pos = (function () {
        var j;
        for (j = 0; j < value.length; j++) {
            if (max == value[j]) {
                return j;
            }
        }
    })();
    // console.log("值为"+key[pos]+"出现的次数为"+value[pos]);
    return key[pos];
}

//设置分页Li的class
function setClass(pagesUl,nowPage){
    for(var liList=0;liList<pagesUl.children.length;liList++){
        var curLi=pagesUl.children[liList];
        var LiText=curLi.children[0].innerText;
        if(LiText==nowPage){
            curLi.setAttribute("class","active");
        }
        else if(LiText=="..."){
            curLi.setAttribute("class","disabled");
        }
    }
}

//获取href中的参数值,hrefParameter为参数串，name为参数名
function getParaValue(hrefParameter,name) {
    var valueLater=hrefParameter.split(name+"=")[1];
    if(valueLater.split("&")){
        return valueLater.split("&")[0];
    }
    else{
        return valueLater
    }
}


