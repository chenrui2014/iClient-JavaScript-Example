(function(){
    /*-----------要加入一个新项，只需在对应的地方加上一个项，-----------*/
    /*-----------并补上其相对于根目录的相对地址，以及其名称-----------*/
    var nav=[
        {href:"index.html",text:"首页"},
        {href:"examples/intro.html",text:"产品介绍"},
        {href:"examples/developGuide.html",text:"开发指南"},
        {href:"examples/examples.html",text:"示范程序"},
        {href:"examples/UML.pdf",text:"类结构图"},
        {href:"apidoc/index.html",text:"类参考"},
        {href:"",text:"技术专题",dropdown:[
            {href:"examples/dyncSegmentationTopic.html",text:"动态分段专题"},
            {href:"examples/rendererTopic.html",text:"动画渲染专题"},
            {href:"examples/mobileTopic.html",text:"离线缓存与 APP 专题"},
            {href:"examples/Win8AppTopic.html",text:"面向 Win8 应用商店开发专题"},
            {href:"examples/VisualTopic.html",text:"可视化专题",dropdown:[
                {href:"examples/HeatMapLayerTopic.html",text:"热点图专题"},
                {href:"examples/ClusterLayerTopic.html",text:"聚合图专题"},
                {href:"examples/HeatGridLayerTopic.html",text:"热点格网图专题"},
                {href:"examples/UTFGridLayerTopic.html",text:"属性图专题"},
                {href:"examples/GOISTopic.html",text:"麻点图专题"},
                {href:"examples/ElementsTopic.html",text:"扩展图专题"}
            ]}
        ]
        }
    ];

//所打开文档的地址
    var path=document.location.toString();

    var regExpExam=/\S+\/examples\/\S+\.html/;       //用于匹配在examples目录下的文档的正则表达式
    var regExpApidoc= /\S+\/apidoc\/\S+\.html/;       //用于匹配在apidoc目录下的文档的正则表达式

    var commonPath="";

//查看文档相对于包地址的起始位置
    if(path.match(regExpExam))
    {
        var pos=path.search(/\/examples\/\S+\.html/);
    }
    else if(path.match(regExpApidoc))
    {
        var pos=path.search(/\/apidoc\/\S+\.html/);
    }
    else
    {
        var pos=path.search(/\/index\.html/);
    }
//根目录地址
    commonPath=path.substring(0,pos);


    var outer_head='<div class="navbar-inner">'+
        '<div class="container">'+
        '<a class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">'+
        '<span class="icon-bar"></span>'+
        '<span class="icon-bar"></span>'+
        '<span class="icon-bar"></span>'+
        '</a>'+
        '<a class="brand" href="'+commonPath+(commonPath==""?"":"/")+nav[0]["href"]+'">JavaScript API</a> '+
        '<div class="nav-collapse"> '+
        '<ul class="nav" id="titleContent"> ';
    var outer_foot='</ul>'+
        '</div>'+
        '</div>'+
        '</div> ';
    var inner="";
    for(var i=0;i<nav.length;i++)
    {
        var li=nav[i];
        if(li.dropdown==undefined)
        {
            inner+='<li class=""><a href="'+commonPath+(commonPath==""?"":"/")+li["href"]+'">'+li["text"]+'</a></li>';
        }
        else
        {
            var h= '<li class="dropdown"> '+
                '<a class="dropdown-toggle" data-toggle="dropdown" href="">'+li["text"]+' <b class="caret"></b></a> '+
                '<ul class="dropdown-menu"> ';
            var f= '</ul>'+
                '</li>';
            var dropDown="";
            var d_li=li["dropdown"];
            for(var j=0;j<d_li.length;j++)
            {
                if(d_li[j].dropdown==undefined)
                {
                    dropDown+='<li class=""><a href="'+commonPath+(commonPath==""?"":"/")+d_li[j]["href"]+'">'+d_li[j]["text"]+'</a></li>';
                }
                else
                {
                    var h2= '<li class=""><a href="'+commonPath+(commonPath==""?"":"/")+d_li[j]["href"]+'">'+d_li[j]["text"]+'</a>'+
                        '<ul > ';
                    var f2= '</ul>'+
                        '</li>';
                    var dropDown2="";
                    var d_li2=d_li[j]["dropdown"];
                    for(var k=0;k<d_li2.length;k++)
                    {
                        dropDown2+='<li class=""><a href="'+commonPath+(commonPath==""?"":"/")+d_li2[k]["href"]+'">'+d_li2[k]["text"]+'</a></li>';
                    }
                    dropDown+=h2+dropDown2+f2;
                }
            }
            inner+=h+dropDown+f;
        }
    }


    var navHtml=outer_head +inner+outer_foot;
    var navElement=document.getElementById("navbar");
    navElement.innerHTML=navHtml;

    /*查找导航条中与打开的文档地址一致的文件，并将其对应的li标签的className改为active，以利用样式*/
    var all_li=navElement.getElementsByTagName("li");
    for(var i=0;i<all_li.length;i++)
    {
        var a=all_li[i].childNodes[0];
        if(a.href==path|| (path.match(/-js\.html/)&& a.href==(commonPath+(commonPath==""?"":"/")+"apidoc/index.html")))
        {
            all_li[i].className="active";
        }
    }
})();
