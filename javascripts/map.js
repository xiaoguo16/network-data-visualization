/**
 * Created by gly on 2017/6/29.
 */
//选择器
var mapDiv=document.getElementsByClassName("map")[0];
var markDiv=document.getElementById("mark");
var width=mapDiv.offsetWidth;
var height=mapDiv.offsetHeight;
//地图投影函数，将经纬度投影到svg中
var projection=d3.geo.mercator()
    .center([54,38])
    .scale(260)
    .translate([width/2,height/2]);

var path=d3.geo.path()
    .projection(projection);
//创建svg
var svg=d3.select(mapDiv).append("svg").attr("width",width).attr("height",height);
svg.append("g").attr("class","map").attr("width",width).attr("height",height);
//提示框
var tooltip=d3.select("body")
    .append("div")
    .attr("class","tooltip")
    .style("opacity",0.0);
//节点颜色映射
var color=[ "#F0FF79","#A4FF8C","#9ABBFF","#5a7ff7","#EE53F7","#FF0000"];
var colorRange=d3.range(6).map(function(i) { return color[i]; });
var threshold=d3.scale.threshold()//阈值比例尺
    .domain([100,1000,5000,10000,100000])
    .range(colorRange);
//标注，最顶端markDiv中的内容绘制函数
titleMark();

d3.json("../mapJson/worldNew.json",function (error,mapData) {
    //世界地图
    if(error)
        return console.error(error);
    var world=d3.select("g.map")
        .selectAll("path")
        .data(mapData.features)
        .enter()
        .append("path")
        .attr("stroke","#019fd4")
        .attr("stroke-width",1)
        .attr("d", path)
        .attr("fill", "#004881");
    //投影初始平移量和缩放量
    var initTran = projection.translate();
    var initScale = projection.scale();
    d3.json("../mapJson/china.json",function (error,chinaData) {
        if(error)
            return console.error(error);
        //中国地图
       var china= d3.select("g.map")
            .selectAll("g.path2")
            .data(chinaData.features)
            .enter()
            .append("path")
            .attr("stroke","#019fd4")
            .attr("stroke-width",1)
            .attr("d", path)
            .attr("fill", "#004881");
        //做点
        $.ajax({
            type:'get',
            async: false,
            dataType:'json',
            url:'../data/map.json',
            // dataType:'jsonp',
            // url:'http://192.168.1.166:8888/nanjing/map',
            // jsonp:'callback',
            // jsonpCallback:"foo",
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                console.log(XMLHttpRequest,textStatus,errorThrown);
                alert("请求失败，请输入正确的搜索条件");
            },
            success:function (data) {
                console.log(data);
                var circle=d3.select("g.map")
                    .selectAll("g.circle")
                    .data(data.scatterData)
                    .enter()
                    .append("circle")
                    .attr("class","circle")
                    .attr("r",5)
                    .attr("fill",function (d) {
                        return threshold(d.count)
                    })
                    .attr("cx",function(d){return projection(d.location)[0]})
                    .attr("cy",function(d){return projection(d.location)[1]})
                    .on("mouseover",function (d) {
                        tooltip.html("ip:"+d.ip+"count:"+d.count)
                            .style("left",(d3.event.pageX-30) +"px")
                            .style("top",(d3.event.pageY +20) +"px")
                            .style("opacity",1.0)
                    })
                    .on("mouseout",function (d) {
                        tooltip.style("opacity",0.0);
                    })
                    .on("click",function (d) {
                        var href=d.ip;
                        window.open("correlation.html?"+"curIP="+href);
                    });
                //缩放以及拖拽
                var zoom=d3.behavior.zoom()
                    .scaleExtent([0.5,20])
                    .on("zoom",function (d) {
                        //更新投影函数的平移量
                        projection.translate([ initTran[0] + d3.event.translate[0],
                            initTran[1] + d3.event.translate[1] ]);
                        //更新投影函数的缩放量
                        projection.scale( initScale * d3.event.scale );

                        //重绘世界地图
                        world.attr("d",path);
                        //重绘中国地图
                        china.attr("d",path);
                        //重绘圆
                        circle.attr("cx",function(d){return projection(d.location)[0]})
                            .attr("cy",function(d){return projection(d.location)[1]});
                    });
                svg.call(zoom);
            }
        });

    })

});

//最顶端标注
function titleMark() {
    markDiv.innerHTML="";
    var titleSvg=d3.select(markDiv)
        .append("svg")
        .attr("width",width)
        .attr("height",50);
    var cicleHeight=25,textHeight=30;
    titleSvg.append("g")
        .attr("transform","translate(30,"+cicleHeight+")")
        .append("circle")
        .attr("class","titleCircle")
        .attr("fill",color[0]);
    titleSvg.append("g")
        .attr("transform","translate(40,"+textHeight+")")
        .append("text")
        .text("<100");
    titleSvg.append("g")
        .attr("transform","translate(110,"+cicleHeight+")")
        .append("circle")
        .attr("class","titleCircle")
        .attr("fill",color[1]);
    titleSvg.append("g")
        .attr("transform","translate(120,"+textHeight+")")
        .append("text")
        .text("100-1000");
    titleSvg.append("g")
        .attr("transform","translate(220,"+cicleHeight+")")
        .append("circle")
        .attr("class","titleCircle")
        .attr("fill",color[2]);
    titleSvg.append("g")
        .attr("transform","translate(230,"+textHeight+")")
        .append("text")
        .text("1000-5000");
    titleSvg.append("g")
        .attr("transform","translate(350,"+cicleHeight+")")
        .append("circle")
        .attr("class","titleCircle")
        .attr("fill",color[3]);
    titleSvg.append("g")
        .attr("transform","translate(360,"+textHeight+")")
        .append("text")
        .text("5000-10000");
    titleSvg.append("g")
        .attr("transform","translate(480,"+cicleHeight+")")
        .append("circle")
        .attr("class","titleCircle")
        .attr("fill",color[4]);
    titleSvg.append("g")
        .attr("transform","translate(490,"+textHeight+")")
        .append("text")
        .text("10000-100000");
    titleSvg.append("g")
        .attr("transform","translate(620,"+cicleHeight+")")
        .append("circle")
        .attr("class","titleCircle")
        .attr("fill",color[5]);
    titleSvg.append("g")
        .attr("transform","translate(630,"+textHeight+")")
        .append("text")
        .text(">100000");
}