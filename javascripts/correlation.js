/**
 * Created by gly on 2017/5/15.
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
var protocolDiv=document.getElementsByClassName("protocolWeight")[0];
var ul=document.getElementsByClassName("tenContentul")[0];
var form=document.forms[0];
var inputFst=form.elements["inputFir"];
var btnAppend=form.elements["btnAppend"];
var btnClear=form.elements["btnClear"];
var CircleDiv=document.getElementsByClassName("selectCircle")[0];
var corVisDiv=document.getElementsByClassName("corVis")[0];
var buddleDiv=document.getElementsByClassName("buddleLay")[0];
var visTitleDiv=document.getElementsByClassName("VisTitle")[0];
var selectDiv=document.getElementsByClassName("selectLayout")[0];
var forceBtn=document.getElementsByName("forceButton")[0];
var bundBtn=document.getElementsByName("buddleButton")[0];
var curConditionDiv=document.getElementsByClassName("curCondition")[0];
//IP热点分布转到该页面时的初始条件
var correlationPara=window.location.search;
if(correlationPara!="" && correlationPara.split("curIP=")[1]){
    var curIp=correlationPara.split("curIP=")[1];
    inputFst.value=curIp;
}
// ip="ip_".concat(ip.replace(/\./g,"_"));
var curConditions=[],conditionFlag=0;//历史检索条件集合,conditionFlag为一个判别符，0为当前条件未在curConditions中出现过
var conditions=[];//检索条件集合
var clickType;//节点类型
//开始分析时将所有的输入框中的节点放入StartVis中
var StartVis={
    "nodes":[],
    "links":[]
};
var plus=0;
//中间得DIV的宽高
var widthVis=corVisDiv.offsetWidth;
var heightVis=corVisDiv.offsetHeight;
var minWidth=Math.min(widthVis,heightVis);
//通过阈值比例尺根据连接次数确定线条宽度。
var color=["black","#ff7f0e","#1f77b4","#aec7e8","#2ca02c","#ffbb78","#9467bd"];
var colorRange=d3.range(4).map(function(i) { return "q" + i + "-4"; });
var threshold=d3.scaleThreshold()//阈值比例尺
    .domain([1000,10000,20000])
    .range(colorRange);

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }))//连接作用力
    .force("charge", d3.forceManyBody())//节点间的作用力
    .force("center", d3.forceCenter(0, 0));

var visTitleHeight=visTitleDiv.offsetHeight;
//点击的节点值，需要传送给服务器的ip值
var nodeValue;
//左侧按钮事件(start 删除 添加)
EventUtil.addHandler(form,"click",function (event) {
    event=EventUtil.getEvent(event);
    var target=EventUtil.getTarget(event);
    var formLen=form.length;

    //添加条件按钮
    if(target.className=="btnClear") {//删除按钮
        for (var i = 0; i < formLen; i++) {
            if (form[i] == target) {
                form.removeChild(target);
                form.removeChild(form[i - 1]);
                return;
            }
        }
    }

    //删除条件按钮
    else if(target.className=="btnAppend"){
        var inputNew=document.createElement("input");
        inputNew.className="form-control";
        inputNew.type="text";
        var btnNew=document.createElement("input");
        btnNew.className="btnClear";
        btnNew.type="button";
        btnNew.value="删除";
        form.insertBefore(inputNew,btnAppend);
        form.insertBefore(btnNew,btnAppend);
    }

    //开始可视化按钮
    else if(target.className=="btnStart"){
        protocolDiv.innerHTML="";
        ul.innerHTML="";
        selectDiv.style.display="none";
        visTitleDiv.style.display="none";
        //初始化
        conditions=[];
        plus=0;
        for(var j=0;j<formLen;j++){
            if(form[j].className=="form-control"){
                if(form[j].value!=""){
                    var curValue=form[j].value;
                    conditions.push(curValue);
                    StartVis.nodes[plus]={"id":curValue,"groupId":1};
                    plus++;
                }
            }
        }
        VisStart();
    }
});

//点击节点显示选择圈事件
EventUtil.addHandler(corVisDiv,"click",function (event) {
    event=EventUtil.getEvent(event);
    var target=EventUtil.getTarget(event);
    if(target.nodeName=="circle") {
        var targetId=target.id;
        targetId=targetId.replace("ip_","");
        nodeValue=targetId.replace(/_/g,".");//节点的值
        var nodeX = event.clientX;
        var nodeY = event.clientY;
        CircleDiv.style.top = nodeY - 90 + "px";
        CircleDiv.style.left = nodeX - 90 + "px";
        CircleDiv.style.display = "block";
        selectCircle();
    }
    else {
        CircleDiv.style.display = "none";
    }
});
//选择布局按钮事件
EventUtil.addHandler(selectDiv,"click",function (event) {
    event=EventUtil.getEvent(event);
    var target=EventUtil.getTarget(event);
    if(target.name=="forceButton"){
        forceBtn.setAttribute("class","buttonSelected");
        bundBtn.setAttribute("class","buttonBefore");
        corVisDiv.style.display="block";
        visTitleDiv.style.display="block";
        buddleDiv.style.display="none";
    }
    else if(target.name=="buddleButton"){
        forceBtn.setAttribute("class","buttonBefore");
        bundBtn.setAttribute("class","buttonSelected");
        buddleDiv.style.display="block";
        visTitleDiv.style.display="none";
        corVisDiv.style.display="none";
    }
});
//画选择圈并添加选择圈的事件
function selectCircle() {
    CircleDiv.innerHTML="";
    var CircleWidth=CircleDiv.offsetWidth;
    var CircleHeight=CircleDiv.offsetHeight;
    var outerRadius=CircleWidth/2-10;
    var innerRadius=CircleWidth/2-60;
    var circleData=[["HTTP",1],["DNS",1],["IP五元组",1],["全部",1]];
    var svgCircle=d3.select(CircleDiv)
        .append("svg")
        .attr("width",CircleWidth)
        .attr("height",CircleHeight);
    var arc=d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);
    var pie=d3.pie().value(function (d) {
        return d[1];
    });
    var arcs = svgCircle.selectAll("g")
        .data(pie(circleData))
        .enter()
        .append("g")
        .attr("class", "arc")
        .attr("transform", "translate(" + outerRadius + "," + outerRadius + ")");
    arcs.append("path")
    //.attr("fill", "#474747")
        .attr("fill", "#000000")
        .style("stroke","#000000")
        .style("opacity",0.6)
        .attr("d", arc);
    arcs.append("text")
        .attr("class","circleText")
        .attr("transform", function(d) {
            return "translate(" + arc.centroid(d) + ")";
        })
        .attr("text-anchor", "middle")
        .text(function(d) {
            return d.data[0];
        });

    arcs.on("click",function (event) {
        clickType=event.data[0];
        if(clickType=="IP五元组"){clickType="IP"}
        if(clickType=="全部"){clickType="All"}
        CircleDiv.style.display="none";
        ajax();
    });
}
//由于多处需要请求，所以将其设定为函数，不需要重新写代码
function ajax() {
    $.ajax({
        type:'get',
        async: false,
        dataType:'json',
        url:'../data/count.json',
        // dataType:'jsonp',
        // url:'http://192.168.1.166:8888/nanjing/analysis?ip='+nodeValue+"&click_type="+clickType,
        // jsonp:'callback',
        // jsonpCallback:"foo",
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            console.log(XMLHttpRequest,textStatus,errorThrown);
            alert("请求失败，请输入正确的搜索条件");
        },
        success:function (data) {
            console.log(data);
            //拼接当前IP以及类型
            var curCon=nodeValue.concat("("+clickType+")");
            //检索当前IP以及类型是否在历史条件中出现过
            for(var i=0;i<curConditions.length;i++){
                if(curConditions[i]==curCon){
                    conditionFlag=1;
                    break;
                }
            }
            //未出现过则添加a标签
            if(conditionFlag==0){
                curConditions.push(curCon);
                var a=document.createElement("a");
                a.innerHTML = curCon;
                curConditionDiv.appendChild(a);
            }else {conditionFlag=0;}
            forceBtn.setAttribute("class","buttonSelected");
            bundBtn.setAttribute("class","buttonBefore");
            selectDiv.style.display="block";
            visTitleDiv.style.display="block";
            VisAll(data);
            titleCircle();
            buddleVis(data.bundle);
            statics(data);
        }
    });
}
//添加a标签的事件，历史分析节点的点击
EventUtil.addHandler(curConditionDiv,"click",function (event) {
    event=EventUtil.getEvent(event);
    var target=EventUtil.getTarget(event);
    if(target.nodeName.toLowerCase()=="a"){
        //获取节点值以及需要分析的类型
        nodeValue=target.innerHTML.split("(")[0];
        clickType=target.innerHTML.split("(")[1].split(")")[0];
        ajax();
    }
});


//力导图函数
function VisAll(data) {
    corVisDiv.innerHTML="";
    var svg=d3.select(corVisDiv)
        .append("svg")
        .attr("width",widthVis)
        .attr("height",heightVis)
        .append("g")
        .attr("transform","translate("+widthVis/2+","+heightVis/2+")");

    var link=svg.append("g")
        .attr("class","links")
        .selectAll("line")
        .data(data.links)
        .enter().append("line")
        .attr("marker-end","url(#arrow)")
        .attr("class",function (d) {
            return threshold(d.count)
        });
    var node=svg.append("g")
        .attr("class","nodes")
        .selectAll("circle")
        .data(data.nodes)
        .enter().append("circle")
        .attr("r",5)
        .attr("fill",function (d) {
            if(conditions.indexOf(d.id)!=-1){
                return color[0];
            }
            else {
                return color[d.groupId]
            }
        })
        .call(d3.drag()
            .on("start",dragstarted)
            .on("drag",dragged)
            .on("end",dragended));

    simulation.nodes(data.nodes)
        .on("tick",ticked);
    simulation.force("link")
        .distance(minWidth/3)
        .links(data.links);
    //定义箭头标识
    var defs = svg.append("defs");

    var arrowMarker = defs.append("marker")
        .attr("id","arrow")
        .attr("markerUnits","strokeWidth")
        .attr("markerWidth","8")
        .attr("markerHeight","8")
        .attr("viewBox","0 0 12 12")
        .attr("refX","13")
        .attr("refY","6")
        .attr("orient","auto");

    var arrow_path = "M2,2 L10,6 L2,10 L6,6 L2,2";

    arrowMarker.append("path")
        .attr("d",arrow_path)
        .attr("fill","#999");
    //提示框
    var tooltip=d3.select("body")
        .append("div")
        .attr("class","tooltip")
        .style("opacity",0.0);
    node.on("mouseover",function (d) {
        var currIP=d.id;
        currIP=currIP.replace("ip_","");
        currIP=currIP.replace(/_/g,".");
        tooltip
            .html("IP: "+currIP)
            .style("left",(d3.event.pageX) +"px")
            .style("top",(d3.event.pageY +20)+"px")
            .style("opacity",1.0)
    })
        .on("mouseout",function (d) {
            tooltip.style("opacity",0.0);
        });
    node.attr("id",function (d) {
        return d.id;
    });

    link.on("mouseover",function (d) {
        var currIP=d.target.id;
        currIP=currIP.replace("ip_","");
        currIP=currIP.replace(/_/g,".");
        tooltip
            .html("IP: "+currIP+"\n"+"<br>连接次数："+d.count)
            .style("left",(d3.event.pageX) +"px")
            .style("top",(d3.event.pageY +20)+"px")
            .style("opacity",1.0)
    })
        .on("mouseout",function (d) {
            tooltip.style("opacity",0.0);
        });
    function ticked() {
        link
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        node
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
    }
}
//捆图函数
function buddleVis(data) {
    buddleDiv.innerHTML="";
    var diameter = minWidth/1.1,
        radius = diameter / 2,
        innerRadius = radius - 120;

    var cluster = d3.cluster()
        .size([360, innerRadius]);

    var line = d3.radialLine()
        .curve(d3.curveBundle.beta(0.85))
        .radius(function(d) { return d.y; })
        .angle(function(d) { return d.x / 180 * Math.PI; });

    var svg = d3.select(buddleDiv).append("svg")
        .attr("width", widthVis)
        .attr("height", heightVis)
        .append("g")
        .attr("transform", "translate(" + widthVis/2 + "," + heightVis/2 + ")");

    var link = svg.append("g").selectAll(".link"),
        node = svg.append("g").selectAll(".node");


    var root = packageHierarchy(data)
        .sum(function(d) { return d.size; });

    cluster(root);

    link = link
        .data(packageImports(root.leaves()))
        .enter().append("path")
        .each(function(d) { d.source = d[0], d.target = d[d.length - 1]; })
        .attr("class", "link")
        .attr("d", line);

    node = node
        .data(root.leaves())
        .enter().append("text")
        .attr("class", "node")
        .attr("dy", "0.31em")
        .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 8) + ",0)" + (d.x < 180 ? "" : "rotate(180)"); })
        .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
        .text(function(d) { return d.data.key.replace(/_/g,".").split("ip.")[1]; });


// Lazily construct the package hierarchy from class names.
    function packageHierarchy(data) {
        var map = {};

        function find(name, data) {
            var node = map[name], i;
            if (!node) {
                node = map[name] = data || {name: name, children: []};
                if (name.length) {
                    node.parent = find(name.substring(0, i = name.lastIndexOf(".")));
                    node.parent.children.push(node);
                    node.key = name.substring(i + 1);
                }
            }
            return node;
        }

        data.forEach(function(d) {
            find(d.name, d);
        });

        return d3.hierarchy(map[""]);
    }

// Return a list of imports for the given array of nodes.
    function packageImports(nodes) {
        var map = {},
            imports = [];

        // Compute a map from name to node.
        nodes.forEach(function(d) {
            map[d.data.name] = d;
        });

        // For each import, construct a link from the source to target node.
        nodes.forEach(function(d) {
            if (d.data.imports) d.data.imports.forEach(function(i) {
                imports.push(map[d.data.name].path(map[i]));
            });
        });

        return imports;
    }
}
//条件可视化初始界面
function VisStart() {
    //svg.selectAll("*").remove();

    corVisDiv.innerHTML="";
    var svg=d3.select(corVisDiv)
        .append("svg")
        .attr("width",widthVis)
        .attr("height",heightVis)
        .append("g")
        .attr("transform","translate("+widthVis/2+","+heightVis/2+")");
    var link=svg.append("g")
        .attr("class","links")
        .selectAll("line")
        .data(StartVis.links)
        .enter().append("line");
    var node=svg.append("g")
        .attr("class","nodes")
        .selectAll("circle")
        .data(StartVis.nodes)
        .enter().append("circle")
        .attr("r",5)
        .attr("class","circleStart")
        .call(d3.drag()
            .on("start",dragstarted)
            .on("drag",dragged)
            .on("end",dragended));
    node.append("title")
        .text(function(d) { return d.id; });
    node.attr("id",function (d) {
        return d.id;
    });
    simulation.nodes(StartVis.nodes)
        .on("tick",ticked);
    simulation.force("link")
        .links(StartVis.links);
    function ticked() {
        link
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        node
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
    }
}
//最顶端标注
function titleCircle() {
    visTitleDiv.innerHTML="";
    var titleSvg=d3.select(visTitleDiv)
        .append("svg")
        .attr("width",widthVis)
        .attr("height",visTitleHeight);
    var cicleHeight=25,textHeight=30;
    titleSvg.append("g")
        .attr("transform","translate(30,"+cicleHeight+")")
        .append("circle")
        .attr("class","titleCircle")
        .attr("fill",color[0]);
    titleSvg.append("g")
        .attr("transform","translate(40,"+textHeight+")")
        .append("text")
        .text("初始节点");
    titleSvg.append("g")
        .attr("transform","translate(125,"+cicleHeight+")")
        .append("circle")
        .attr("class","titleCircle")
        .attr("fill",color[1]);
    titleSvg.append("g")
        .attr("transform","translate(135,"+textHeight+")")
        .append("text")
        .text("IP五元组");
    titleSvg.append("g")
        .attr("transform","translate(220,"+cicleHeight+")")
        .append("circle")
        .attr("class","titleCircle")
        .attr("fill",color[2]);
    titleSvg.append("g")
        .attr("transform","translate(230,"+textHeight+")")
        .append("text")
        .text("DNS");
    titleSvg.append("g")
        .attr("transform","translate(290,"+cicleHeight+")")
        .append("circle")
        .attr("class","titleCircle")
        .attr("fill",color[3]);
    titleSvg.append("g")
        .attr("transform","translate(300,"+textHeight+")")
        .append("text")
        .text("HTTP");
    // titleSvg.append("g")
    //     .attr("transform","translate(360,"+cicleHeight+")")
    //     .append("circle")
    //     .attr("class","titleCircle")
    //     .attr("fill",color[3]);
    // titleSvg.append("g")
    //     .attr("transform","translate(370,"+textHeight+")")
    //     .append("text")
    //     .text("邮件");
}

//最右侧的统计结果
function statics(data) {
    protocolDiv.innerHTML="";
    ul.innerHTML="";
    for(var i in data.staticsProtocol){
        var p=document.createElement("p");
        var text=document.createTextNode(i+":"+data.staticsProtocol[i]);
            protocolDiv.appendChild(p).appendChild(text);
    }
    for(var j=0;j<data.staticsIPTen.length;j++){
        var li=document.createElement("li");
        var litext=document.createTextNode(data.staticsIPTen[j]);
        ul.appendChild(li).appendChild(litext);
        var liNum=document.createElement("li");
        var litextNum=document.createTextNode("("+data.staticsIPNum[j]+")");
        ul.appendChild(liNum).appendChild(litextNum);
    }
}




//力导图拖拽函数
function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}
