var LocaLinks =document.getElementById("search_location").getElementsByTagName("a");
//var infoLinks = document.getElementById("selectType").getElementsByTagName("a");
var infoShows= document.getElementsByClassName("info");
window.onload = function () {
    // LocaLinks[0].onclick();
   // infoLinks[0].onclick();
};
//选择结构化数据或者非结构化数据时改变其class以使用不同的样式
function changeClass(link) {
    for(var i=0;i<LocaLinks.length;i++){
        LocaLinks[i].className="loca_link";
    }
    link.className="active loca_link";
    document.getElementsByName("location")[0].setAttribute("value", link.innerText);
}
//对于页面下方的信息统计，点击链接显示对应的div
function changeSelectClass(link) {
    for(var i=0;i<infoLinks.length;i++){
        infoLinks[i].className="info_link";
        infoLinks[i].index = i;
    }
    link.className="active info_link";

    for (var i = 0; i < infoShows.length; i++) {
        if (i == link.index) {
            infoShows[i].style.display = "block";
        } else {
            infoShows[i].style.display = "none";
        }
    }
}
function hideCalendar() {
    var option = document.getElementById("time_select");
    var calendar = document.getElementById("start_end");
    if(option.selectedIndex == 5){
        calendar.style.display = "block";
    }else {
        calendar.style.display = "none";
    }
}

//事件对象
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
    }
};
var button=document.getElementsByClassName("button")[1];

//点击按钮
EventUtil.addHandler(button,"click",function (event) {
        var search_content = document.getElementsByName("search_content")[0].value;
        var search_time=document.getElementsByName("search_time")[0].value;
        var location=document.getElementsByName("location")[0].value;

        var hrefParameter="?location="+location+"&search_content="+search_content+"&protocol_type=全部&data_node=全部&data_container=全部&search_time="+search_time+"&start_time=&end_time="+"&curPage=1"+"&nowPages=[1,1,1,1]";
        var href="result.html"+hrefParameter;
        window.open(href);
        // window.location=href;
    });

//按回车
EventUtil.addHandler(document,"keydown",function (event) {
    event=EventUtil.getEvent(event);
    var code = event.keyCode || event.which;
    if(code==13){
        var search_content = document.getElementsByName("search_content")[0].value;
        var search_time=document.getElementsByName("search_time")[0].value;
        var location=document.getElementsByName("location")[0].value;

        var hrefParameter="?location="+location+"&search_content="+search_content+"&protocol_type=全部&data_node=全部&data_container=全部&search_time="+search_time+"&start_time=&end_time="+"&curPage=1"+"&nowPages=[1,1,1,1]";
        var href="result.html"+hrefParameter;
        window.open(href);
        // window.location=href;
    }
});
var allDiv=document.getElementById("allInfo");
var httpDiv=document.getElementById("HttpInfo");
var dnsDiv=document.getElementById("DnsInfo");
var ipDiv=document.getElementById("IpInfo");
var emlDiv=document.getElementById("emlInfo");
// $.ajax({
//     type: 'get',
//     async: false,
//     dataType: 'jsonp',
//      url:urlIp+"home'",
//    // url: 'http://192.168.1.166:8888/nanjing/home',
//     // url: 'http://192.168.1.110:8080/nanjing/home',
//     //jsonp: 'callback',
//    // jsonpCallback: "foo",
//     error: function (XMLHttpRequest, textStatus, errorThrown) {
//         console.log(XMLHttpRequest, textStatus, errorThrown);
//     },
//     success: function (data) {
//         console.log(data);
//         addAllInfo(data);
//         addHttpInfo(data);
//         addDnsInfo(data);
//         addIpInfo(data);
//         addEmlInfo(data);
//     }
// });
function addAllInfo(data) {
    var countdom=allDiv.getElementsByClassName("count")[0];
    var div1=document.createElement("div");
    var text1=document.createTextNode("今天的数据量："+data.all.dailyCounts[0]);
    div1.appendChild(text1);
    countdom.appendChild(div1);
    var div2=document.createElement("div");
    var text2=document.createTextNode("昨天的数据量："+data.all.dailyCounts[1]);
    div2.appendChild(text2);
    countdom.appendChild(div2);
    var div3=document.createElement("div");
    var text3=document.createTextNode("前天的数据量："+data.all.dailyCounts[2]);
    div3.appendChild(text3);
    countdom.appendChild(div3);
    //dom
    var visdomIp=allDiv.getElementsByClassName("visIp")[0];
    var visdomLoc=allDiv.getElementsByClassName("visLoc")[0];
    // 基于准备好的dom，初始化echarts实例
    var allChartIp = echarts.init(visdomIp);
    var allChartLoc = echarts.init(visdomLoc);
    // 指定图表的配置项和数据:ip
    var optionIp = {
        color:['#169BD5'],
        title:{
            subtext:'热门IP:Top5'
        },
        tooltip:{
            trigger:'axis',
            axisPointer : {
                type: 'shadow'
            }
        },
        calculable:true,
        xAxis:[
            {
                type:'category',
                data:data.all.ips,
                axisLabel:{
                    interval:0,
                    rotate:30
                },
                axisTick:{
                    alignWithLabel:true
                }
            }
        ],
        yAxis:[
            {
                type:'value',
                axisLabel:{
                    formatter:'{value}次'
                }
            }
        ],
        series:[
            {
                name:'数据量',
                type:'bar',
                data:data.all.ipCounts,
                barWidth:50,
                label:{
                    normal:{
                        show:true,
                        position:'top'
                    }
                }
            }
        ]
    };
    // 指定图表的配置项和数据:location
    var optionLoc = {
        color:['#169BD5'],
        title:{
            subtext:'热门国家:Top5'
        },
        tooltip:{
            trigger:'axis',
            axisPointer : {
                type: 'shadow'
            }
        },
        calculable:true,
        xAxis:[
            {
                type:'category',
                data:data.all.locations,
                axisLabel:{
                    interval:0
                },
                axisTick:{
                    alignWithLabel:true
                }
            }
        ],
        yAxis:[
            {
                type:'value',
                axisLabel:{
                    formatter:'{value}次'
                }
            }
        ],
        series:[
            {
                name:'数据量',
                type:'bar',
                data:data.all.locationCounts,
                barWidth:50,
                label:{
                    normal:{
                        show:true,
                        position:'top'
                    }
                }
            }
        ]
    };
    allChartIp.setOption(optionIp);
    allChartLoc.setOption(optionLoc);
}
function addHttpInfo(data) {
    var countdom=httpDiv.getElementsByClassName("count")[0];
    var div1=document.createElement("div");
    var text1=document.createTextNode("今天的数据量："+data.http.dailyCounts[0]);
    div1.appendChild(text1);
    countdom.appendChild(div1);
    var div2=document.createElement("div");
    var text2=document.createTextNode("昨天的数据量："+data.http.dailyCounts[1]);
    div2.appendChild(text2);
    countdom.appendChild(div2);
    var div3=document.createElement("div");
    var text3=document.createTextNode("前天的数据量："+data.http.dailyCounts[2]);
    div3.appendChild(text3);
    countdom.appendChild(div3);
    var visdomIp=httpDiv.getElementsByClassName("visIp")[0];
    var visdomLoc=httpDiv.getElementsByClassName("visLoc")[0];
    // 基于准备好的dom，初始化echarts实例
    var httpChartIp = echarts.init(visdomIp);
    var httpChartLoc = echarts.init(visdomLoc);
    // 指定图表的配置项和数据
    var optionIp = {
        color:['#169BD5'],
        title:{
            subtext:'热门IP:Top5'
        },
        tooltip:{
            trigger:'axis',
            axisPointer : {
                type: 'shadow'
            }
        },
        calculable:true,
        xAxis:[
            {
                type:'category',
                data:data.http.ips,
                axisLabel:{
                    interval:0,
                    rotate:30
                },
                axisTick:{
                    alignWithLabel:true
                }
            }
        ],
        yAxis:[
            {
                type:'value',
                axisLabel:{
                    formatter:'{value}次'
                }
            }
        ],
        series:[
            {
                name:'数据量',
                type:'bar',
                data:data.http.ipCounts,
                barWidth:50,
                label:{
                    normal:{
                        show:true,
                        position:'top'
                    }
                }
            }
        ]
    };
    // 指定图表的配置项和数据:location
    var optionLoc = {
        color:['#169BD5'],
        title:{
            subtext:'热门国家:Top5'
        },
        tooltip:{
            trigger:'axis',
            axisPointer : {
                type: 'shadow'
            }
        },
        calculable:true,
        xAxis:[
            {
                type:'category',
                data:data.http.locations,
                axisLabel:{
                    interval:0
                },
                axisTick:{
                    alignWithLabel:true
                }
            }
        ],
        yAxis:[
            {
                type:'value',
                axisLabel:{
                    formatter:'{value}次'
                }
            }
        ],
        series:[
            {
                name:'数据量',
                type:'bar',
                data:data.http.locationCounts,
                barWidth:50,
                label:{
                    normal:{
                        show:true,
                        position:'top'
                    }
                }
            }
        ]
    };
    httpChartIp.setOption(optionIp);
    httpChartLoc.setOption(optionLoc);
}
function addDnsInfo(data) {
    var countdom=dnsDiv.getElementsByClassName("count")[0];
    var div1=document.createElement("div");
    var text1=document.createTextNode("今天的数据量："+data.dns.dailyCounts[0]);
    div1.appendChild(text1);
    countdom.appendChild(div1);
    var div2=document.createElement("div");
    var text2=document.createTextNode("昨天的数据量："+data.dns.dailyCounts[1]);
    div2.appendChild(text2);
    countdom.appendChild(div2);
    var div3=document.createElement("div");
    var text3=document.createTextNode("前天的数据量："+data.dns.dailyCounts[2]);
    div3.appendChild(text3);
    countdom.appendChild(div3);
    var visdomIp=dnsDiv.getElementsByClassName("visIp")[0];
    var visdomLoc=dnsDiv.getElementsByClassName("visLoc")[0];
    // 基于准备好的dom，初始化echarts实例
    var dnsChartIp = echarts.init(visdomIp);
    var dnsChartLoc = echarts.init(visdomLoc);
    // 指定图表的配置项和数据
    var optionIp = {
        color:['#169BD5'],
        title:{
            subtext:'热门IP:Top5'
        },
        tooltip:{
            trigger:'axis',
            axisPointer : {
                type: 'shadow'
            }
        },
        calculable:true,
        xAxis:[
            {
                type:'category',
                data:data.dns.ips,
                axisLabel:{
                    interval:0,
                    rotate:30
                },
                axisTick:{
                    alignWithLabel:true
                }
            }
        ],
        yAxis:[
            {
                type:'value',
                axisLabel:{
                    formatter:'{value}次'
                }
            }
        ],
        series:[
            {
                name:'数据量',
                type:'bar',
                data:data.dns.ipCounts,
                barWidth:50,
                label:{
                    normal:{
                        show:true,
                        position:'top'
                    }
                }
            }
        ]
    };
    // 指定图表的配置项和数据:location
    var optionLoc = {
        color:['#169BD5'],
        title:{
            subtext:'热门国家:Top5'
        },
        tooltip:{
            trigger:'axis',
            axisPointer : {
                type: 'shadow'
            }
        },
        calculable:true,
        xAxis:[
            {
                type:'category',
                data:data.dns.locations,
                axisLabel:{
                    interval:0
                },
                axisTick:{
                    alignWithLabel:true
                }
            }
        ],
        yAxis:[
            {
                type:'value',
                axisLabel:{
                    formatter:'{value}次'
                }
            }
        ],
        series:[
            {
                name:'数据量',
                type:'bar',
                data:data.dns.locationCounts,
                barWidth:50,
                label:{
                    normal:{
                        show:true,
                        position:'top'
                    }
                }
            }
        ]
    };
    dnsChartIp.setOption(optionIp);
    dnsChartLoc.setOption(optionLoc);
}
function addIpInfo(data) {
    var countdom=ipDiv.getElementsByClassName("count")[0];
    var div1=document.createElement("div");
    var text1=document.createTextNode("今天的数据量："+data.ip.dailyCounts[0]);
    div1.appendChild(text1);
    countdom.appendChild(div1);
    var div2=document.createElement("div");
    var text2=document.createTextNode("昨天的数据量："+data.ip.dailyCounts[1]);
    div2.appendChild(text2);
    countdom.appendChild(div2);
    var div3=document.createElement("div");
    var text3=document.createTextNode("前天的数据量："+data.ip.dailyCounts[2]);
    div3.appendChild(text3);
    countdom.appendChild(div3);
    var visdomIp=ipDiv.getElementsByClassName("visIp")[0];
    var visdomLoc=ipDiv.getElementsByClassName("visLoc")[0];
    // 基于准备好的dom，初始化echarts实例
    var ipChartIp = echarts.init(visdomIp);
    var ipChartLoc = echarts.init(visdomLoc);
    // 指定图表的配置项和数据
    var optionIp = {
        color:['#169BD5'],
        title:{
            subtext:'热门IP:Top5'
        },
        tooltip:{
            trigger:'axis',
            axisPointer : {
                type: 'shadow'
            }
        },
        calculable:true,
        xAxis:[
            {
                type:'category',
                data:data.ip.ips,
                axisLabel:{
                    interval:0,
                    rotate:30
                },
                axisTick:{
                    alignWithLabel:true
                }
            }
        ],
        yAxis:[
            {
                type:'value',
                axisLabel:{
                    formatter:'{value}次'
                }
            }
        ],
        series:[
            {
                name:'数据量',
                type:'bar',
                data:data.ip.ipCounts,
                barWidth:50,
                label:{
                    normal:{
                        show:true,
                        position:'top'
                    }
                }
            }
        ]
    };
    // 指定图表的配置项和数据:location
    var optionLoc = {
        color:['#169BD5'],
        title:{
            subtext:'热门国家:Top5'
        },
        tooltip:{
            trigger:'axis',
            axisPointer : {
                type: 'shadow'
            }
        },
        calculable:true,
        xAxis:[
            {
                type:'category',
                data:data.ip.locations,
                axisLabel:{
                    interval:0
                },
                axisTick:{
                    alignWithLabel:true
                }
            }
        ],
        yAxis:[
            {
                type:'value',
                axisLabel:{
                    formatter:'{value}次'
                }
            }
        ],
        series:[
            {
                name:'数据量',
                type:'bar',
                data:data.ip.locationCounts,
                barWidth:50,
                label:{
                    normal:{
                        show:true,
                        position:'top'
                    }
                }
            }
        ]
    };
    ipChartIp.setOption(optionIp);
    ipChartLoc.setOption(optionLoc);
}
function addEmlInfo(data) {
    var countdom=emlDiv.getElementsByClassName("count")[0];
    var div1=document.createElement("div");
    var text1=document.createTextNode("今天的数据量："+data.eml.dailyCounts[0]);
    div1.appendChild(text1);
    countdom.appendChild(div1);
    var div2=document.createElement("div");
    var text2=document.createTextNode("昨天的数据量："+data.eml.dailyCounts[1]);
    div2.appendChild(text2);
    countdom.appendChild(div2);
    var div3=document.createElement("div");
    var text3=document.createTextNode("前天的数据量："+data.eml.dailyCounts[2]);
    div3.appendChild(text3);
    countdom.appendChild(div3);
    var visdomIp=emlDiv.getElementsByClassName("visIp")[0];
    var visdomLoc=emlDiv.getElementsByClassName("visLoc")[0];
    // 基于准备好的dom，初始化echarts实例
    var emlChartIp = echarts.init(visdomIp);
    var emlChartLoc = echarts.init(visdomLoc);
    // 指定图表的配置项和数据
    var optionIp = {
        color:['#169BD5'],
        title:{
            subtext:'热门IP:Top5'
        },
        tooltip:{
            trigger:'axis',
            axisPointer : {
                type: 'shadow'
            }
        },
        calculable:true,
        xAxis:[
            {
                type:'category',
                data:data.eml.ips,
                axisLabel:{
                    interval:0,
                    rotate:30
                },
                axisTick:{
                    alignWithLabel:true
                }
            }
        ],
        yAxis:[
            {
                type:'value',
                axisLabel:{
                    formatter:'{value}次'
                }
            }
        ],
        series:[
            {
                name:'数据量',
                type:'bar',
                data:data.eml.ipCounts,
                barWidth:50,
                label:{
                    normal:{
                        show:true,
                        position:'top'
                    }
                }
            }
        ]
    };
    // 指定图表的配置项和数据:location
    var optionLoc = {
        color:['#169BD5'],
        title:{
            subtext:'热门国家:Top5'
        },
        tooltip:{
            trigger:'axis',
            axisPointer : {
                type: 'shadow'
            }
        },
        calculable:true,
        xAxis:[
            {
                type:'category',
                data:data.eml.locations,
                axisLabel:{
                    interval:0
                },
                axisTick:{
                    alignWithLabel:true
                }
            }
        ],
        yAxis:[
            {
                type:'value',
                axisLabel:{
                    formatter:'{value}次'
                }
            }
        ],
        series:[
            {
                name:'数据量',
                type:'bar',
                data:data.eml.locationCounts,
                barWidth:50,
                label:{
                    normal:{
                        show:true,
                        position:'top'
                    }
                }
            }
        ]
    };
    emlChartIp.setOption(optionIp);
    emlChartLoc.setOption(optionLoc);
}
