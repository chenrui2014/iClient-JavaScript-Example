/* COPYRIGHT 2012 SUPERMAP
 * 本程序只能在有效的授权许可下使用。
 * 未经许可，不得以任何手段擅自使用或传播。*/

/**
 * @requires SuperMap.Layer.Vector.js
 */

/**
 * Class: SuperMap.Layer.ThemeLabel
 * 标签专题图层，该图层用于渲染标签要素。
 *
 * 标签要素是指geometry类型为 SuperMap.Geometry.GeoText 的矢量要素（SuperMap.Feature.Vector）。
 *
 * 注：
 *
 * 1.此图层限定使用标签要素，不支持添加其它类型的要素。
 *
 * 2.在创建标签要素时，无需指定style（即使指定也无效，与普通矢量要素不同，标签要素的style将完全由图层控制 ）。
 *
 * Inherits from:
 *  - <SuperMap.Layer.Vector>
 */
SuperMap.Layer.ThemeLabel = SuperMap.Class(SuperMap.Layer.Vector, {
    /**
     * APIProperty: geometryType
     * {String} 父类属性，此类中已废弃。
     */
    geometryType: null,

    /**
     * APIProperty: styleMap
     * {<SuperMap.StyleMap>} 父类属性，此类中不支持。
     */
    styleMap: null,

    /**
     * APIProperty: labelFeatures
     * {Array(<SuperMap.Feature.Vector>)} 添加到此图层的所有标签要素（标签要素是指geometry类型为 SuperMap.Geometry.GeoText 的矢量要素）。
     */
    labelFeatures: null,

    /**
     * APIProperty: features
     * {Array(<SuperMap.Feature.Vector>)} 当前视图中的标签列表，即标签要素数组 labelFeatures 经过滤（压盖判定）后，绘制在当前视图中的标签。
     */
    features: null,

    /**
     * APIProperty: style
     * {Object} 图层中标签的样式。此对象的可设属性可分为两类，第一类是标签文本样式，第二类是标签背景框样式。
     *
     * 标签文本样式支持的属性有：
     *
     * labelAlign - {String} 标签对齐，是由两个字符组成的字符串，如："lt", "cm", "rb"。
     * 其中第一个字符代表水平方向上的对齐，"l"=left, "c"=center, "r"=right。
     * 第二个字符代表垂直方向上的对齐，"t"=top, "m"=middle, "b"=bottom。
     *
     * labelXOffset - {Number} 标签在x轴方向的偏移量，默认值0。
     *
     * labelYOffset - {Number} 标签在y轴方向的偏移量，默认值0。
     *
     * fontColor - {String} 标签字体颜色，默认值"#000000"。
     *
     * fontOpacity - {Number} 标签透明度 (0-1)，默认值为1。
     *
     * fontFamily - {String} 标签的字体类型。默认值“sans-serif”。
     *
     * fontSize - {String} 标签的字体大小。默认值“12px”,最小为12px。
     *
     * fontStyle - {String} 标签的字体样式。可设值有：normal（标准的字体）、italic（斜体）、oblique（倾斜体）。默认值“normal”。
     *
     * fontWeight - {String} 标签的字体粗细，可设值有：lighter（细字符）、normal（标准字符）、bold（粗体字符）、bolder（更粗的字符）。默认值“normal”。
     *
     * rotation - {Number} 旋转角度，单位是度，不支持VML渲染器,，默认值为0。
     *
     * 标签背景框样式支持的属性有：
     *
     * fill - {Boolean} 是否使用背景色填充，默认值为false。
     *
     * fillColor - {String} 填充背景色，默认为"#ee9900"。
     *
     * fillOpacity - {Number} 背景填充不透明度(0-1),默认为: 0.4。
     *
     * stroke - {Boolean} 是否使用背景框，默认值为false。
     *
     * strokeColor - {String} 背景框描边颜色。
     *
     * strokeOpacity - {Number} 背景框的不透明度(0-1),默认为1。
     *
     * strokeWidth - {Number} 背景框像素宽度，默认为1。
     *
     * strokeLinecap - {String} strokeLinecap有三种类型butt，round，square，默认为"round"。
     *
     * strokeDashstyle - {String} 有dot,dash,dashot,longdash,longdashdot,solid几种样式，默认为"solid"。
     **/
    style: null,

    /**
     * Property: defaultStyle
     * {Boolean} 标签的默认style。
     */
    defaultStyle:  {
        //默认文本样式
        fontColor: "#000000",
        fontOpacity: 1,
        fontFamily: "sans-serif",
        fontSize: "12px",
        fontStyle: "normal",
        fontWeight: "normal",
        labelAlign: "cm",
        labelXOffset: 0,
        labelYOffset: 0,
        rotation:0,

        //默认背景框样式
        fill: false,
        fillColor: "#ee9900",
        fillOpacity: 0.4,
        stroke: false,
        strokeColor: "#ee9900",
        strokeOpacity: 1,
        strokeWidth: 1,
        strokeLinecap: "round",
        strokeDashstyle: "solid",

        //对用户隐藏但必须保持此值的属性
        //cursor: "pointer",
        labelSelect: true

    },

    /**
     * APIProperty: isOverLap
     * {Boolean} 是否进行压盖处理，如果设为true，将隐藏压盖标签，默认为true。
     */
    isOverLap: true,

    /**
     * APIProperty: isAvoid
     * {Boolean} 是否进行地图边缘的避让处理，如果设为true，将把与地图边缘相交的标签移到地图范围内，默认为true，在地图边缘处做避让处理。
     */
    isAvoid: true,

    /**
     * APIProperty: groupField
     * {String} 指定标签风格分组的属性字段名称。此属性字段是标签要素attributes中包含的字段，且字段对应的值的类型必须是数值型。
     * 使用标签分组显示还需要设置styleGroups属性。
     */
    groupField: null,

    /**
     * APIProperty: styleGroups
     * {Array} 标签风格分组数组，此数组用于将标签分组显示，每一组标签有一种显示风格。使用此属性需要设置 groupField 属性。
     *
     * 标签分组显示有如下情况：
     *
     * 1.没有同时设置 groupField 和styleGroups，则所有标签都使用本图层（ThemeLabel）的style；
     *
     * 2.同时设置 groupField 和styleGroups，则按照 groupField 指定的字段名称获取标签要素attributes中对应的属性值（Number型）；
     *
     *      a.如果属性值所对应的范围在styleGroups数组里，则此标签取数组里与该范围对应的style。
     *
     *      b.如果属性值所对应的范围没有在styleGroups数组里，则此标签按照本图层（ThemeLabel）的style渲染。
     *
     * 此数组的每一个子对象必须有三个属性：
     *
     * start : 与字段 groupField 相对应的属性值下限（包含）;
     * end：与字段 groupField 相对应的属性值上限（不包含）;
     * style：要赋值标签的style。
     * (start code)
     *
     * styleGroups数组形如：
     * [
     *   {
     *      start:200000,
     *      end:500000,
     *      style:{
     *           fontColor:"#00CD00",
     *           fontWeight:"bolder",
     *           fontSize:"18px"
     *       }
     *   },
     *   {
     *      start:500000,
     *      end:1000000,
     *      style:{
     *           fontColor:"#00EE00",
     *           fontWeight:"bolder",
     *           fontSize:"24px"
     *       }
     *   },
     *   {
     *      start:1000000,
     *      end:2000000,
     *      style:{
     *           fontColor:"#00FF7F",
     *           fontWeight:"bolder",
     *           fontSize:"30px"
     *       }
     *   },
     *   {
     *      start:2000000,
     *      end:100000000,
     *      style:{
     *           fontColor:"#00FF00",
     *           fontWeight:"bolder",
     *           fontSize:"36px"
     *       }
     *   }
     * ]
     *
     * (end)
     */
    styleGroups: null,

    /**
     * Property: getPxBoundsMode
     * {number} 获取标签像素bounds的方式。0 - 表示通过文本类容和文本风格计算获取像素范围，现在支持中文、英文; 1 - 表示通过绘制的文本标签获取像素范围，支持各个语种的文字范围获取，但性能消耗较大（尤其是采用SVG渲染）。默认值为0。
     */
    getPxBoundsMode: 0,

    /**
     * Constructor: SuperMap.Layer.ThemeLabel
     * 创建一个标签专题图层。
     * (start code)
     * //创建一个名为“ThemeLabelLayer" 的标签专题图层。
     *  var themeLabelLayer = new SuperMap.Layer.ThemeLabel("ThemeLabelLayer");
     * (end)
     *
     * Parameters:
     * name - {String}  图层名称。
     * options - {Object} (附加到图层属性上的可选项，父类与此类开放的属性。
     *
     * Returns:
     * {<Constructor: SuperMap.Layer.ThemeLabel>} 新的标签专题图层。
     */
    initialize:function(name,options){
        this.EVENT_TYPES = SuperMap.Layer.ThemeLabel.prototype.EVENT_TYPES.concat(
            SuperMap.Layer.Vector.prototype.EVENT_TYPES
        );

        SuperMap.Layer.Vector.prototype.initialize.apply(this, arguments);

        this.events = new SuperMap.Events(this, this.div,
            this.EVENT_TYPES);
        if(this.eventListeners instanceof Object) {
            this.events.on(this.eventListeners);
        }

        this.labelFeatures = [];
    },

    /**
     * APIMethod: destroy
     * 销毁ThemeLabel图层，释放资源。
     */
    destroy: function() {
        this.style = null;
        this.isOverLap = true;
        this.isAvoid = false;
        this.groupField = null;
        this.styleGroups = null;
        this.getPxBoundsMode = 0;

        this.destroyLabelFeatures();
        this.labelFeatures = null;

        SuperMap.Layer.Vector.prototype.destroy.apply(this, arguments);
    },

    /**
     * Method: destroyLabelFeatures
     * Erase and destroy labelFeatures on the layer.
     *
     * Parameters:
     * labelFeatures - {Array(<SuperMap.Feature.Vector>)} An optional array of
     *     labelFeatures to destroy.  If not supplied, all features on the layer
     *     will be destroyed.
     * options - {Object}
     */
    destroyLabelFeatures: function(labelFeatures, options) {
        var all = (labelFeatures == undefined); // evaluates to true if
        // features is null
        if(all) {
            labelFeatures = this.labelFeatures;
        }
        if(labelFeatures) {
            this.removeFeatures(labelFeatures, options);
            for(var i=labelFeatures.length-1; i>=0; i--) {
                labelFeatures[i].destroy();
            }
        }
    },

    //toTest
    /**
     * Method: clone
     * 创建这个图层的副本。
     *
     * 注意: 这个图层上的  labelFeatures (和 features )一样会被克隆。
     *
     * Returns:
     * {<SuperMap.Layer.Vector>} 图层对象的副本。
     */
    clone: function (obj) {

        if (obj == null) {
            obj = new SuperMap.Layer.ThemeLabel(this.name, this.getOptions());
        }

        obj = SuperMap.Layer.Vector.prototype.clone.apply(this, [obj]);

        var labelFeatures = this.labelFeatures;
        var len2 = labelFeatures.length;
        var clonedLabelFeatures = new Array(len2);
        for(var i=0; i<len2; ++i) {
            clonedLabelFeatures[i] = labelFeatures[i].clone();
        }
        obj.labelFeatures = clonedLabelFeatures;

        return obj;
    },

    /**
     * Method: setStyle
     * 设置标签要素的Style
     * Parameters:
     *
     * fea - {<SuperMap.Feature.Vector>}  需要赋予style的要素。
     *
     */
    setStyle: function(fea){
        var feature = fea;
        feature.style = SuperMap.Util.copyAttributes(feature.style, this.defaultStyle);
        //先将图层的style赋给标签+
        if(this.style && this.style.fontSize && parseFloat(this.style.fontSize) < 12) this.style.fontSize = "12px";
        feature.style = SuperMap.Util.copyAttributes(feature.style, this.style);

        if(this.groupField && this.styleGroups && feature.attributes){
            var Sf = this.groupField;
            var Attrs =  feature.attributes;
            var Gro = this.styleGroups;
            var isSfInAttrs = false; //指定的 groupField 是否是geotext的属性字段之一
            var attr = null; //属性值

            for (var property in Attrs) {
                if(Sf == property)  {
                    isSfInAttrs = true;
                    attr = Attrs[property];
                    break;
                }
            }

            //判断属性值是否属于styleGroups的某一个范围，以便对标签分组
            if(isSfInAttrs){
                for(var i = 0,len = Gro.length; i < len; i++ ){
                    if((attr >= Gro[i].start) && (attr < Gro[i].end)){
                        //feature.style = SuperMap.Util.copyAttributes(feature.style, this.defaultStyle);
                        var sty1 = Gro[i].style;
                        if( sty1 &&  sty1.fontSize && parseFloat( sty1.fontSize) < 12)  sty1.fontSize = "12px";
                        feature.style = SuperMap.Util.copyAttributes(feature.style,  sty1);
                    }
                };
            }
        }

        if(feature.isLabelRotationWithLine && feature.isLabelRotationWithLine == true) {
            this.setLabelRotationByLine(feature);
        }

        //将文本内容赋到标签要素的style上
        feature.style.label = feature.geometry.text;

        return feature;
    },

    /**
     * Method: setLabelRotationByLine
     * 通过几何线修改标签的旋转角度 ,实现沿线标签。
     * Parameters:
     * labelFea - {<SuperMap.Feature.Vector>}  要修改style.rotation的标签要素。
     */
    setLabelRotationByLine: function(labelFea){
        //沿线标记的旋转角度
        if(labelFea.isLabelRotationWithLine && labelFea.isLabelRotationWithLine == true) {
            var lineGeoComp = labelFea.relevanceGeometry.components;
            var cenIndex = labelFea.centerPointIndex;

            //地理坐标转为像素坐标
            var cenLocGeo = new SuperMap.LonLat(lineGeoComp[cenIndex].x, lineGeoComp[cenIndex].y);
            var cenLoc = this.getViewPortPxFromLonLat(cenLocGeo);

            //求线倾角的两个参考节点索引
            var indexA = -1, indexB = -1;

            //参考圆半径
            var  radius = 50;

            var cn1 = radius;
            if(cenIndex == 0){
                indexA = cenIndex;
            }
            else{
                for(var i = cenIndex - 1; i >= 0; i--){
                    var poi = new SuperMap.LonLat(lineGeoComp[i].x, lineGeoComp[i].y);
                    var loc = this.getViewPortPxFromLonLat(poi);
                    var distmp =  this.calculatePoisDistance(cenLoc.x, cenLoc.y, loc.x, loc.y);
                    var distance =  radius - distmp;

                    //寻找线上距离参考圆环距离最近节点的索引
                    if(Math.abs(distance) < cn1){
                        cn1 =  Math.abs(distance);
                        indexA = i;
                    }
                }
            }
            if(indexA == -1){
                indexA = cenIndex;
            }

            var cn2 = radius;
            for(var j = cenIndex + 1,len = lineGeoComp.length; j < len; j++){
                var poi = new SuperMap.LonLat(lineGeoComp[j].x, lineGeoComp[j].y);
                var loc = this.getViewPortPxFromLonLat(poi);
                var distmp =   this.calculatePoisDistance(cenLoc.x, cenLoc.y, loc.x, loc.y);
                var distance =  radius - distmp;

                //寻找线上距离参考圆环距离最近节点的索引
                if(Math.abs(distance) < cn2){
                    cn2 =  Math.abs(distance);
                    indexB = j;
                }
            }
            if(indexB == -1){
                indexB = cenIndex + 1;
            }

            labelFea.style.rotation = this.getAngleByPoisWithX(lineGeoComp[indexA].x, lineGeoComp[indexA].y, lineGeoComp[indexB].x, lineGeoComp[indexB].y);
        }
    },

    /**
     * Method: calculatePoisDistance
     * 计算两点间的距离
     *
     * Parameters:
     * x1 - {Number}  第一个点横坐标。
     * y1 - {Number}  第一个点纵坐标。
     * x2 - {Number}  第二个点横坐标。
     * y2 - {Number}  第二个点纵坐标。
     *
     * Returns:
     * {Number} 两点间的距离
     */
    calculatePoisDistance: function (x1, y1 ,x2 ,y2) {
        var xdiff = x2 - x1;
        var ydiff = y2 - y1;
        return Math.pow((xdiff * xdiff + ydiff * ydiff), 0.5);
    },

    /**
     * Method: getDrawnFeatures
     * 获取经（压盖）处理后将要绘制在图层上的标签要素
     * Parameters:
     * userfeas - {Array<SuperMap.Feature.Vector>}  所有标签要素的数组。
     *
     * Returns:
     * {Array<SuperMap.Feature.Vector>}  最终要绘制的标签要素数组。
     */
    getDrawnFeatures: function(userfeas) {
        //公共变量 -start
        var feas = [], //最终要绘制的标签要素集
            fea,    //最终要绘制的标签要素
            fi, //临时标签要素，用户的第i个标签
            labelsB = [], //不产生压盖的标签要素范围集
            styTmp, //用于临时存储要素style的变量
            feaSty,  //标签要素最终的style
        // styleTemp用于屏蔽文本style中带有偏移性质style属性，偏移已经在计算bounds的过程中参与了运算，
        // 所以在最终按照bounds来绘制标签时，需屏蔽style中带有偏移性质属性，否则文本的骗了量将扩大一倍。
            styleTemp = {
                labelAlign: "cm",
                labelXOffset: 0,
                labelYOffset: 0
            };
        //公共变量 -end

        //对用户的每个标签要素进行处理与判断
        for (var i = 0, len = userfeas.length; i < len; i++) {
            fi  = userfeas[i];

            //检查fi的style在避让中是否被改变，如果改变，重新设置要素的style
            if(fi.isStyleChange){
                fi = this.setStyle(fi);
            }

            //标签最终的中心点像素位置 （偏移）后的位置
            var loc = this.getLabelPxLocation(fi);

            //过滤掉地图范围外的标签  （偏移后）
            if((loc.x >= 0 && loc.x <=  this.map.size.w ) && (loc.y >= 0 && loc.y <= this.map.size.h) )
            {
                //根据当前地图缩放级别过滤标签
                if(fi.style.minZoomLevel > -1)
                {
                    if(this.map.getZoom() < fi.style.minZoomLevel)
                    {
                        continue;
                    }
                }
                if(fi.style.maxZoomLevel > -1)
                {
                    if(this.map.getZoom() > fi.style.maxZoomLevel)
                    {
                        continue;
                    }
                }

                //计算标签bounds
                var boundsQuad = null;
                if(fi.isStyleChange){
                    fi.isStyleChange = null;
                    boundsQuad  =  this.calculateLabelBounds(fi, loc);
                }
                else
                {
                    if( fi.geometry.bsInfo.w && fi.geometry.bsInfo.h )
                    {
                        //使用calculateLabelBounds2可以提高bounds的计算效率，尤其是在getPxBoundsMode = 1时
                        boundsQuad  =  this.calculateLabelBounds2(fi, loc);
                    }
                    else
                    {
                        boundsQuad  =  this.calculateLabelBounds(fi, loc);
                    }
                }

                // var boundsQuad  =  this.calculateLabelBounds(fi, loc);
                // if(fi.isStyleChange){
                //     fi.isStyleChange = null;
                // }

                //避让处理 -start
                var mapViewBounds = new SuperMap.Bounds(0, this.map.size.h, this.map.size.w, 0),        //地图像素范围
                    quadlen = boundsQuad.length;

                if(this.isAvoid){
                    var avoidInfo = this.getAvoidInfo(mapViewBounds , boundsQuad);       //避让信息

                    if(avoidInfo){
                        //横向（x方向）上的避让
                        if(avoidInfo.aspectW ==  "left") {
                            fi.style.labelXOffset += avoidInfo.offsetX;

                            for(var j = 0;  j < quadlen; j++){
                                boundsQuad[j].x += avoidInfo.offsetX;
                            }
                        }
                        else if(avoidInfo.aspectW ==  "right"){
                            fi.style.labelXOffset +=  (-avoidInfo.offsetX);

                            for(var j = 0;  j < quadlen; j++){
                                boundsQuad[j].x +=  (-avoidInfo.offsetX);
                            }
                        }

                        //纵向（y方向）上的避让
                        if(avoidInfo.aspectH ==  "top") {
                            fi.style.labelYOffset += avoidInfo.offsetY;

                            for(var j = 0;  j < quadlen; j++){
                                boundsQuad[j].y += avoidInfo.offsetY;
                            }
                        }
                        else if(avoidInfo.aspectH ==  "bottom"){
                            fi.style.labelYOffset += (-avoidInfo.offsetY);

                            for(var j = 0;  j < quadlen; j++){
                                boundsQuad[j].y +=  (-avoidInfo.offsetY);
                            }
                        }

                        //如果style发生变化，记录下来
                        fi.isStyleChange = true;
                    }
                }
                //避让处理 -end

                //压盖处理 -start
                if(this.isOverLap){
                    //是否压盖
                    var isOL = false;

                    if (i != 0) {
                        for (var j = 0; j < labelsB.length; j++) {
                            //压盖判断
                            if (this.isQuadrilateralOverLap(boundsQuad, labelsB[j])) {
                                isOL = true;
                                break;
                            }
                        }
                    }

                    if(isOL){
                        continue;
                    }
                    else{
                        labelsB.push(boundsQuad);
                    }
                }
                //压盖处理 -end

                //背景（事件）-start

                //将标签像素范围转为地理范围
                var geoBs = [];
                for(var j = 0; j < quadlen -1; j++){
                    geoBs.push(this.getLonLatFromViewPortPx(boundsQuad[j]));
                }

                var points =[
                        new SuperMap.Geometry.Point(geoBs[0].lon,geoBs[0].lat),
                        new SuperMap.Geometry.Point(geoBs[1].lon,geoBs[1].lat),
                        new SuperMap.Geometry.Point(geoBs[2].lon,geoBs[2].lat),
                        new SuperMap.Geometry.Point(geoBs[3].lon,geoBs[3].lat)
                    ],
                    linearRings = new SuperMap.Geometry.LinearRing(points),
                    labelBgGeo = new SuperMap.Geometry.Polygon([linearRings]);

                //屏蔽有偏移性质的style属性,偏移量在算bounds时已经加入计算
                styTmp = SuperMap.Util.cloneObject(fi.style);
                feaSty = SuperMap.Util.cloneObject(SuperMap.Util.copyAttributes(styTmp, styleTemp));
                fea = new SuperMap.Feature.Vector(labelBgGeo, fi.attributes, feaSty);
                fea.id = fi.id;
                fea.fid = fi.fid;
                feas.push(fea);
                //背景（事件）-end
            }
            else{
                continue;
            }
        }

        //返回最终要绘制的标签要素
        return feas;
    },

    /**
     * Method: calculateLabelBounds
     * 获得标签要素的最终范围
     *
     * Parameters:
     * feature - {SuperMap.Feature.Vector>} - 需要计算bounds的标签要素数。
     * loc - {SuperMap.Pixel} 标签位置
     *
     * Returns:
     * {Array(Objecy)}  四边形节点数组。例如：[{"x":1,"y":1},{"x":3,"y":1},{"x":6,"y":4},{"x":2,"y":10},{"x":1,"y":1}]。
     */
    calculateLabelBounds: function(feature, loc) {
        var geoText = feature.geometry;

        //标签范围（未旋转前）
        var labB = null;

        //获取bounds的方式
        if(this.getPxBoundsMode == 0){
            labB = geoText.getLabelPxBoundsByText(loc, feature.style);
        }
        else if(this.getPxBoundsMode == 1)
        {
            this.addTmpFuncForRenderer();
            if ((this.renderer.CLASS_NAME == "SuperMap.Renderer.SVG") || (this.renderer.CLASS_NAME == "SuperMap.Renderer.VML")) {
                var labelInfo = this.renderer.getLabelInfo(feature.id, feature.style, feature.geometry.getCentroid());
                labB = geoText.getLabelPxBoundsByLabel(loc, labelInfo.w, labelInfo.h, feature.style);
            }
            else{//canvas
                var labelInfo = this.renderer.getLabelInfo(feature.geometry.getCentroid(), feature.style);
                labB = geoText.getLabelPxBoundsByLabel(loc, labelInfo.w, labelInfo.h, feature.style);
            }
        }
        else{
            return null;
        }

        //旋转Bounds
        var boundsQuad = [];
        if((feature.style.rotation % 180) == 0){
            boundsQuad = [
                {"x": labB.left, "y": labB.top},
                {"x": labB.right, "y": labB.top},
                {"x": labB.right, "y": labB.bottom},
                {"x": labB.left, "y": labB.bottom},
                {"x": labB.left, "y": labB.top}
            ];
        }
        else{
            boundsQuad = this.rotationBounds(labB, loc, feature.style.rotation);
        }

        return boundsQuad;
    },

    /**
     * Method: calculateLabelBounds2
     * 获得标签要素的最终范围的另一种算法（通过记录下的标签宽高），提高计算bounds的效率。
     *
     * Parameters:
     * feature - {SuperMap.Feature.Vector>} - 需要计算bounds的标签要素数。
     * loc - {SuperMap.Pixel} 标签位置
     *
     * Returns:
     * {Array(Objecy)}  四边形节点数组。例如：[{"x":1,"y":1},{"x":3,"y":1},{"x":6,"y":4},{"x":2,"y":10},{"x":1,"y":1}]。
     */
    calculateLabelBounds2: function (feature, loc){
        var labB, left, bottom, top, right;
        var labelSize = feature.geometry.bsInfo;
        var style = feature.style;
        var locationPx = SuperMap.Util.cloneObject(loc);

        //处理文字对齐
        if (style.labelAlign && style.labelAlign != "cm") {
            switch (style.labelAlign) {
                case "lt":
                    locationPx.x += labelSize.w / 2;
                    locationPx.y += labelSize.h / 2;
                    break;
                case "lm":
                    locationPx.x += labelSize.w / 2;
                    break;
                case "lb":
                    locationPx.x += labelSize.w / 2;
                    locationPx.y -= labelSize.h / 2;
                    break;
                case "ct":
                    locationPx.y += labelSize.h / 2;
                    break;
                case "cb":
                    locationPx.y -= labelSize.h / 2;
                    break;
                case "rt":
                    locationPx.x -= labelSize.w / 2;
                    locationPx.y += labelSize.h / 2;
                    break;
                case "rm":
                    locationPx.x -= labelSize.w / 2;
                    break;
                case "rb":
                    locationPx.x -= labelSize.w / 2;
                    locationPx.y -= labelSize.h / 2;
                    break;
                default:
                    break;
            }
        }

        left = locationPx.x - labelSize.w / 2;
        bottom = locationPx.y + labelSize.h / 2;
        //处理斜体字
        if (style.fontStyle && style.fontStyle && style.fontStyle == "italic") {
            right = locationPx.x + labelSize.w / 2 + parseInt(parseFloat(style.fontSize) / 2);
        } else {
            right = locationPx.x + labelSize.w / 2;
        }
        top = locationPx.y - labelSize.h / 2;

        labB = new SuperMap.Bounds(left, bottom, right, top);

        //旋转Bounds
        var boundsQuad = [];
        if((style.rotation % 180) == 0){
            boundsQuad = [
                {"x": labB.left, "y": labB.top},
                {"x": labB.right, "y": labB.top},
                {"x": labB.right, "y": labB.bottom},
                {"x": labB.left, "y": labB.bottom},
                {"x": labB.left, "y": labB.top}
            ];
        }
        else{
            boundsQuad = this.rotationBounds(labB, loc, style.rotation);
        }

        return boundsQuad;
    },

    /**
     * Method: getLabelPxLocation
     * 获取标签要素的像素坐标
     * Parameters:
     * feature - {<SuperMap.Feature.Vector>}  标签要素。
     *
     * Returns:
     * {<SuperMap.Pixel>} 标签位置
     */
    getLabelPxLocation: function(feature){
        var localtion = new SuperMap.Pixel();
        var geoText = feature.geometry;
        var styleTmp = feature.style;

        //将标签的地理位置转为像素位置
        var locationTmp = geoText.getCentroid();
        var locTmep = new SuperMap.LonLat(locationTmp.x, locationTmp.y);
        var locTmp = this.getViewPortPxFromLonLat(locTmep);
        var loc = new SuperMap.Geometry.Point(locTmp.x, locTmp.y);

        //偏移处理
        if (styleTmp.labelXOffset  || styleTmp.labelYOffset ) {
            var xOffset = isNaN(styleTmp.labelXOffset) ? 0 : styleTmp.labelXOffset;
            var yOffset = isNaN(styleTmp.labelYOffset) ? 0 : styleTmp.labelYOffset;
            loc.move(xOffset, -yOffset);
            localtion.x = loc.x;
            localtion.y = loc.y;
            return localtion;
        }
        else{
            localtion.x = loc.x;
            localtion.y = loc.y;
            return localtion;
        }
    },

    /**
     * Method: getAvoidInfo
     * 获取避让的信息。
     *
     * Parameters:
     * bounds - {<SuperMap.Bounds>}  地图像素范围。
     * quadrilateral - {Array{Objecy)}  四边形节点数组。例如：[{"x":1,"y":1},{"x":3,"y":1},{"x":6,"y":4},{"x":2,"y":10},{"x":1,"y":1}]。
     *
     * Returns:
     * {Object} 避让的信息
     */
    getAvoidInfo: function(bounds, quadrilateral) {
        if(quadrilateral.length !=5) return null;//不是四边形

        //将bound序列化为点数组形式
        var bounddQuad = [
            {"x":bounds.left,"y":bounds.top},
            {"x":bounds.right,"y":bounds.top},
            {"x":bounds.right,"y":bounds.bottom},
            {"x":bounds.left,"y":bounds.bottom},
            {"x":bounds.left,"y":bounds.top}
        ];

        var isIntersection = false, bqLen = bounddQuad.length, quadLen = quadrilateral.length;

        var offsetX = 0, offsetY = 0, aspectH = "", aspectW = "";
        for(var i = 0; i <bqLen -1 ; i++){
            for(var j = 0 ; j < quadLen -1; j++){
                var isLineIn = SuperMap.Util.lineIntersection(bounddQuad[i], bounddQuad[i+1], quadrilateral[j], quadrilateral[j+1]);
                if(isLineIn.CLASS_NAME == "SuperMap.Geometry.Point"){
                    //设置避让信息
                    setInfo(quadrilateral[j]);
                    setInfo( quadrilateral[j+1]);
                    isIntersection = true;
                }
            }
        }

        if(isIntersection){
            //组织避让操作所需的信息
            var avoidInfo = {
                "aspectW": aspectW,
                "aspectH": aspectH,
                "offsetX": offsetX,
                "offsetY": offsetY
            };
            return avoidInfo;
        }
        else{
            return null;
        }


        //内部函数：设置避让信息
        //参数：vec-{Objecy}  quadrilateral四边形单个节点。如：{"x":1,"y":1}。
        function setInfo(vec){
            //四边形不在bounds内的节点
            if(!bounds.contains(vec.x, vec.y)){
                //bounds的Top边
                if(vec.y < bounds.top){
                    var oY = Math.abs(bounds.top - vec.y);
                    if(oY > offsetY) {
                        offsetY = oY;
                        aspectH = "top";
                    }
                }

                //bounds的Bottom边
                if(vec.y > bounds.bottom){
                    var oY =Math.abs(vec.y - bounds.bottom);
                    if(oY > offsetY) {
                        offsetY = oY;
                        aspectH = "bottom";
                    }
                }

                //bounds的left边
                if(vec.x < bounds.left){
                    var oX =Math.abs(bounds.left - vec.x);
                    if(oX > offsetX) {
                        offsetX = oX;
                        aspectW = "left";
                    }
                }

                //bounds的right边
                if(vec.x > bounds.right){
                    var oX = Math.abs(vec.x - bounds.right);
                    if(oX > offsetX) {
                        offsetX = oX;
                        aspectW = "right";
                    }
                }
            }
        }

    },

    /**
     * Method: rotationBounds
     * 旋转bounds。
     *
     * Parameters:
     * bounds - {<SuperMap.Bounds>}  要旋转的bounds。
     * rotationCenterPoi - {Object}  旋转中心点对象，此对象含有属性x(横坐标)，属性y(纵坐标)。
     * angle - {Number}  旋转角度（顺时针）。
     *
     * Returns:
     * {Array(Object)}  bounds旋转后形成的多边形节点数组。是一个四边形，形如：[{"x":1,"y":1},{"x":3,"y":1},{"x":6,"y":4},{"x":2,"y":10},{"x":1,"y":1}]
     */
    rotationBounds: function(bounds, rotationCenterPoi, angle){
        var ltPoi = new SuperMap.Geometry.Point(bounds.left, bounds.top);
        var rtPoi = new SuperMap.Geometry.Point(bounds.right, bounds.top);
        var rbPoi = new SuperMap.Geometry.Point(bounds.right, bounds.bottom);
        var lbPoi = new SuperMap.Geometry.Point(bounds.left, bounds.bottom);

        var ver = [];
        ver.push(this.getRotatedLocation(ltPoi.x, ltPoi.y, rotationCenterPoi.x, rotationCenterPoi.y, angle));
        ver.push(this.getRotatedLocation(rtPoi.x, rtPoi.y, rotationCenterPoi.x, rotationCenterPoi.y, angle));
        ver.push(this.getRotatedLocation(rbPoi.x, rbPoi.y, rotationCenterPoi.x, rotationCenterPoi.y, angle));
        ver.push(this.getRotatedLocation(lbPoi.x, lbPoi.y, rotationCenterPoi.x, rotationCenterPoi.y, angle));

        //bounds旋转后形成的多边形节点数组
        var quad = [];

        for(var i = 0; i < ver.length; i++)
        {
            quad.push({"x": ver[i].x, "y": ver[i].y});
        }
        quad.push({"x": ver[0].x, "y": ver[0].y});
        return quad;
    },

    /**
     * Method: getRotatedLocation
     * 获取一个点绕旋转中心顺时针旋转后的位置。（此方法用于屏幕坐标）
     *
     * Parameters:
     * x - {Number}  旋转点横坐标。
     * y - {Number}  旋转点纵坐标。
     * rx - {Number}  旋转中心点横坐标。
     * ry - {Number}  旋转中心点纵坐标。
     * angle - {Number} 旋转角度
     * Returns:
     * {Object} 旋转后的坐标位置对象，该对象含有属性x(横坐标)，属性y(纵坐标)。
     */
    getRotatedLocation: function (x, y, rx, ry, angle) {
        var loc = new Object(), x0, y0;

        y = -y;
        ry = -ry;
        angle = -angle;//顺时针旋转
        x0 = (x - rx)*Math.cos((angle/180)*Math.PI) - (y - ry)*Math.sin((angle/180)*Math.PI) + rx;
        y0 = (x - rx)*Math.sin((angle/180)*Math.PI) + (y - ry)*Math.cos((angle/180)*Math.PI) + ry;

        loc.x =x0;
        loc.y = -y0;

        return loc;
    },

    /**
     * Method: isQuadrilateralOverLap
     * 判断两个四边形是否有压盖
     *
     * Parameters:
     * quadrilateral - {Array<Objecy>}  四边形节点数组。例如：[{"x":1,"y":1},{"x":3,"y":1},{"x":6,"y":4},{"x":2,"y":10},{"x":1,"y":1}]。
     * quadrilateral2 - {Array<Object>}  第二个四边形节点数组。
     *
     * Returns:
     * {Boolean} 是否压盖，true表示压盖
     */
    isQuadrilateralOverLap: function (quadrilateral, quadrilateral2) {
        var quadLen = quadrilateral.length,
            quad2Len = quadrilateral2.length;
        if(quadLen !=5 || quad2Len != 5) return null;//不是四边形

        var OverLap = false;
        //如果两四边形互不包含对方的节点，则两个四边形不相交
        for(var i = 0; i <quadLen; i++){
            if(this.isPointInPoly(quadrilateral[i], quadrilateral2)){
                OverLap = true;
                break;
            }
        }
        for(var i = 0; i <quad2Len; i++){
            if(this.isPointInPoly(quadrilateral2[i], quadrilateral)){
                OverLap = true;
                break;
            }
        }
        //加上两矩形十字相交的情况
        for(var i = 0; i < quadLen - 1; i++){
            if(OverLap){
                break;
            }
            for(var j = 0; j < quad2Len -1; j++){
                var isLineIn = SuperMap.Util.lineIntersection(quadrilateral[i], quadrilateral[i+1], quadrilateral2[j], quadrilateral2[j+1]);
                if(isLineIn.CLASS_NAME == "SuperMap.Geometry.Point"){
                    OverLap = true;
                    break;
                }
            }
        }

        return OverLap;
    },

    /**
     * Method: PointInPoly
     * 判断一个点是否在多边形里面。(射线法)
     *
     * Parameters:
     * pt - {Object} 需要判定的点对象，该对象含有属性x(横坐标)，属性y(纵坐标)。
     * poly - {Array(Objecy)}  多边形节点数组。例如一个四边形：[{"x":1,"y":1},{"x":3,"y":1},{"x":6,"y":4},{"x":2,"y":10},{"x":1,"y":1}]
     * Returns:
     * {Boolean} 点是否在多边形内
     */
    isPointInPoly: function(pt, poly) {
        for (var isIn = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
            ((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y))
                && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)
            && (isIn = !isIn);
        return isIn;
    },

    /**
     * Method: addTmpFuncForRenderer
     * 给当前的renderer添加临时的方法getLabelInfo()，用于获取绘制后的标签信息，包括标签的宽，高和行数
     */
    addTmpFuncForRenderer: function(){
        if(this.renderer.getLabelInfo) return;
        if ((this.renderer.CLASS_NAME == "SuperMap.Renderer.SVG") || (this.renderer.CLASS_NAME == "SuperMap.Renderer.VML")) {
            //获取一个标签的信息，包括标签宽、高及标签内的文本行数
            this.renderer.getLabelInfo = function (featureId, style, location) {
                var resolution = this.getResolution();
                var labelWidth = 0;
                var subLabels = [];

                var x = (location.x / resolution + this.left);
                var y = (location.y / resolution - this.top);

                var label = this.nodeFactory(featureId + this.LABEL_ID_SUFFIX, "text");

                label.setAttributeNS(null, "x", x);
                label.setAttributeNS(null, "y", -y);

                if (style.rotation) {
                    label.setAttributeNS(null, "transform", "rotate(" + style.rotation + " " + x + "," + (-y) + ")");
                }

                if (style.fontColor) {
                    label.setAttributeNS(null, "fill", style.fontColor);
                }
                if (style.fontOpacity) {
                    // label.setAttributeNS(null, "opacity", style.fontOpacity);
                    label.setAttributeNS(null, "opacity", 0);
                }
                if (style.fontFamily) {
                    label.setAttributeNS(null, "font-family", style.fontFamily);
                }
                if (style.fontSize) {
                    label.setAttributeNS(null, "font-size", style.fontSize);
                }
                if (style.fontWeight) {
                    label.setAttributeNS(null, "font-weight", style.fontWeight);
                }
                if (style.fontStyle) {
                    label.setAttributeNS(null, "font-style", style.fontStyle);
                }
                if (style.labelSelect === true) {
                    label.setAttributeNS(null, "pointer-events", "visible");
                    label._featureId = featureId;
                } else {
                    label.setAttributeNS(null, "pointer-events", "none");
                }
                var align = style.labelAlign || "cm";
                label.setAttributeNS(null, "text-anchor",
                    SuperMap.Renderer.SVG.LABEL_ALIGN[align[0]] || "middle");

                if (SuperMap.IS_GECKO === true) {
                    label.setAttributeNS(null, "dominant-baseline",
                        SuperMap.Renderer.SVG.LABEL_ALIGN[align[1]] || "central");
                }

                var labelRows = style.label.split('\n');
                var numRows = labelRows.length;
                while (label.childNodes.length > numRows) {
                    label.removeChild(label.lastChild);
                }
                for (var i = 0; i < numRows; i++) {
                    var tspan = this.nodeFactory(featureId + this.LABEL_ID_SUFFIX + "_tspan_" + i, "tspan");
                    if (style.labelSelect === true) {
                        tspan._featureId = featureId;
                        tspan._geometry = location;
                        tspan._geometryClass = location.CLASS_NAME;
                    }
                    if (SuperMap.IS_GECKO === false) {
                        tspan.setAttributeNS(null, "baseline-shift",
                            SuperMap.Renderer.SVG.LABEL_VSHIFT[align[1]] || "-35%");
                    }
                    tspan.setAttribute("x", x);
                    if (i == 0) {
                        var vfactor = SuperMap.Renderer.SVG.LABEL_VFACTOR[align[1]];
                        if (vfactor == null) {
                            vfactor = -.5;
                        }
                        tspan.setAttribute("dy", (vfactor * (numRows - 1)) + "em");
                    } else {
                        tspan.setAttribute("dy", "1em");
                    }
                    tspan.textContent = (labelRows[i] === '') ? ' ' : labelRows[i];
                    if (!tspan.parentNode) {
                        label.appendChild(tspan);
                    }

                    subLabels.push(tspan);
                }

                if (!label.parentNode) {
                    this.textRoot.appendChild(label);
                }

                for (var i = 0; i < subLabels.length; i++) {
                    var subLabel = subLabels[i];
                    var labelWidthTmp = subLabel.getComputedTextLength();
                    if (labelWidth < labelWidthTmp) {
                        labelWidth = labelWidthTmp;
                    }
                }

                var labelInfo = new Object();//标签信息
                if(labelWidth)  {
                    labelInfo.w = labelWidth;//标签的宽
                }
                else{
                    return null;
                }

                labelInfo.h = style.fontSize;//一行标签的高
                labelInfo.rows = numRows;//标签的行数

                return labelInfo;
            }

        }
        else {
            //获取一个标签的信息，包括标签宽、高及标签内的文本行数
            this.renderer.getLabelInfo = function(location, style){
                style = SuperMap.Util.extend({
                    fontColor: "#000000",
                    labelAlign: "cm"
                }, style);
                var pt = this.getLocalXY(location);
                var labelWidth = 0;

                if (style.labelXOffset  || style.labelYOffset ) {
                    var xOffset = isNaN(style.labelXOffset) ? 0 : style.labelXOffset;
                    var yOffset = isNaN(style.labelYOffset) ? 0 : style.labelYOffset;
                    pt[0] += xOffset;
                    pt[1] -= yOffset;
                }

                this.setCanvasStyle("reset");
                this.canvas.fillStyle = style.fontColor;
                this.canvas.globalAlpha = style.fontOpacity || 1.0;
                var fontStyle = [style.fontStyle ? style.fontStyle : "normal",
                    "normal", // "font-variant" not supported
                    style.fontWeight ? style.fontWeight : "normal",
                    style.fontSize ? style.fontSize : "1em",
                    style.fontFamily ? style.fontFamily : "sans-serif"].join(" ");
                var labelRows = style.label.split('\n');
                var numRows = labelRows.length;
                if (this.canvas.fillText) {
                    // HTML5
                    this.canvas.font = fontStyle;
                    this.canvas.textAlign =
                        SuperMap.Renderer.Canvas.LABEL_ALIGN[style.labelAlign[0]] ||
                            "center";
                    this.canvas.textBaseline =
                        SuperMap.Renderer.Canvas.LABEL_ALIGN[style.labelAlign[1]] ||
                            "middle";
                    var vfactor =
                        SuperMap.Renderer.Canvas.LABEL_FACTOR[style.labelAlign[1]];
                    if (vfactor == null) {
                        vfactor = -.5;
                    }
                    var lineHeight =
                        this.canvas.measureText('Mg').height ||
                            this.canvas.measureText('xx').width;
                    pt[1] += lineHeight*vfactor*(numRows-1);
                    for (var i = 0; i < numRows; i++) {
                        var labelWidthTmp = this.canvas.measureText(labelRows[i]).width;
                        if(labelWidth < labelWidthTmp){
                            labelWidth = labelWidthTmp;
                        }
                    }
                } else if (this.canvas.mozDrawText) {
                    // Mozilla pre-Gecko1.9.1 (<FF3.1)
                    this.canvas.mozTextStyle = fontStyle;
                    // No built-in text alignment, so we measure and adjust the position
                    var hfactor =
                        SuperMap.Renderer.Canvas.LABEL_FACTOR[style.labelAlign[0]];
                    if (hfactor == null) {
                        hfactor = -.5;
                    }
                    var vfactor =
                        SuperMap.Renderer.Canvas.LABEL_FACTOR[style.labelAlign[1]];
                    if (vfactor == null) {
                        vfactor = -.5;
                    }
                    var lineHeight = this.canvas.mozMeasureText('xx');
                    pt[1] += lineHeight*(1 + (vfactor*numRows));
                    for (var i = 0; i < numRows; i++) {
                        var labelWidthTmp = this.canvas.measureText(labelRows[i]).width;
                        if(labelWidth < labelWidthTmp){
                            labelWidth = labelWidthTmp;
                        }
                    }
                }
                this.setCanvasStyle("reset");
                var labelInfo = new Object();//标签信息
                if(labelWidth)  {
                    labelInfo.w = labelWidth;//标签的宽
                }
                else{
                    return null;
                }

                labelInfo.h = style.fontSize;//一行标签的高
                labelInfo.rows = labelRows.length;//标签的行数

                return labelInfo;
            }
        }
    },

    /**
     * APIMethod: addFeatures
     * 给图层添加标签要素。（注：标签要素是指geometry类型为 SuperMap.Geometry.GeoText 的矢量要素。）
     *
     * Parameters:
     * labelFeatures - {Array(<SuperMap.Feature.Vector>)}需要添加到图层的标签要素数组。
     *
     * 如果使用压盖处理（isOverLap = true），labelFeatures数组元素的顺序将决定标签的优先级，数组中靠前的要素将被优先显示。
     * 示例场景：
     *
     * 图层启用压盖判断（isOverLap = true），labelFeatures有标签元素A和B，即 labelFeatures = [A, B];
     * 现图层调用函数 addFeatures(labelFeatures) 将A、B标签添加到图层。
     *
     * 1.如果A、B标签范围不相交，那么A、B标签将在图层中同时被渲染出来，且A、B标签同时关联到features列表。
     *
     * 2.如果A、B标签范围相交，由于A标签在labelFeatures数组中的顺序先与B标签，所以A标签将在图层中被渲染出来且关联到features列表，B标签将不被渲染出来也不会被关联到features列表。
     */
    addFeatures: function(labelFeatures){
        if (!(SuperMap.Util.isArray(labelFeatures))) {
            labelFeatures = [labelFeatures];
        }

        var fea, lfi;
        //根据GeoText数组生成标签要素（LabelFeature）
        for(var i = 0, len = labelFeatures.length; i < len; i++) {
            lfi = labelFeatures[i];
            //过滤掉非标签要素
            if(lfi.geometry.CLASS_NAME == "SuperMap.Geometry.GeoText"){
                //设置标签的Style
                fea = this.setStyle(lfi);
                //为标签要素指定图层
                fea.layer = this;
                this.labelFeatures.push(fea);
            }
        }

        //清除
        this.removeDrawnFeatures();
        this.addOrReAddFeas(this.getDrawnFeatures(this.labelFeatures));
        //SuperMap.Layer.Vector.prototype.addFeatures.call(this, this.getDrawnFeatures(this.labelFeatures));
    },

    /**
     * Method: addOrReAddFeas
     * 给图层添加标签要素。重复调用此函数也不改变labelFeatures列表，用于图层重绘。
     * addFeatures会向labelFeatures末尾添加标签要素，此方法给用户以便多次添加标签要素，此类内部慎用。
     *
     * Parameters:
     * labelFeatures - {Array(<SuperMap.Feature.Vector>)}需要添加的标签要素数组。
     */
    addOrReAddFeas: function(features, options) {
        if (!(SuperMap.Util.isArray(features))) {
            features = [features];
        }

        var notify = !options || !options.silent;
        if(notify) {
            var event = {features: features};
            var ret = this.events.triggerEvent("beforefeaturesadded", event);
            if(ret === false) {
                return;
            }
            features = event.features;
        }

        var featuresFailAdded = [];
        this.renderer.locked = true;
        for (var i=0, len=features.length; i<len; i++) {
            if (i == (len - 1)) {
                this.renderer.locked = false;
            }
            var feature = features[i];

            if(feature.geometry.CLASS_NAME != "SuperMap.Geometry.Polygon"){
                continue;
            }

            feature.layer = this;
            this.features.push(feature);
            var drawn = this.drawFeature(feature, undefined, {isNewAdd: true});

            if(!drawn) {
                featuresFailAdded.push(feature);
            }
        }

        var succeed = featuresFailAdded.length == 0 ? true : false;
        this.events.triggerEvent("featuresadded", {features: featuresFailAdded, succeed: succeed});
    },

    /**
     * APIMethod: drawFeature
     * 父类方法，此类中已经废弃。
     */
    drawFeature: function(feature, style, option) {
        if (!this.drawn) {
            return;
        }
        if (typeof style != "object") {
            if(!style && feature.state === SuperMap.State.DELETE) {
                style = "delete";
            }
            var renderIntent = style || feature.renderIntent;
            style = feature.style || this.style;
            if (!style) {
                style = this.styleMap.createSymbolizer(feature, renderIntent);
            }
        }

        var drawn = this.renderer.drawFeature(feature, style, option);

        //设置图层手势
        if ((this.renderer.CLASS_NAME == "SuperMap.Renderer.SVG") || (this.renderer.CLASS_NAME == "SuperMap.Renderer.VML")) {
            this.renderer.vectorRoot.style.cursor="pointer";
            this.renderer.textRoot.style.cursor="pointer";
        }
        else{//canvas
            this.renderer.container.style.cursor="pointer";
        }

        if (drawn === false || drawn === null) {
            this.unrenderedFeatures[feature.id] = feature;
        } else {
            delete this.unrenderedFeatures[feature.id];
        }

        return drawn;
    },

    /**
     * Method: drawFeatures
     * （重写的父类方法）
     * 遍历所有features，并绘制，
     */
    drawFeatures: function(bounds) {
        //清除上一次的绘制
        this.removeDrawnFeatures();

        //沿线标记的旋转角度
        for(var i = 0, len = this.labelFeatures.length; i < len; i++) {
            var feature = this.labelFeatures[i];

            //动态修改沿线标签的旋转角度
            if(feature.isLabelRotationWithLine && feature.isLabelRotationWithLine == true) {
                this.setLabelRotationByLine(feature);
            }
        }

        //重新添加标签
        this.addOrReAddFeas(this.getDrawnFeatures(this.labelFeatures));
        // SuperMap.Layer.Vector.prototype.addFeatures.call(this, this.getDrawnFeatures(this.labelFeatures));
    },

    /**
     * APIMethod: removeAllFeatures
     * 移除所有标签要素。
     */
    removeAllFeatures: function() {
        this.labelFeatures = [];
        SuperMap.Layer.Vector.prototype.removeAllFeatures.apply(this, arguments);
    },

    /**
     * Method: removeDrawnFeatures
     * 清除已绘制在当前视图中的标签。不清除（修改）labelFeatures列表。
     */
    removeDrawnFeatures: function() {
        SuperMap.Layer.Vector.prototype.removeAllFeatures.apply(this, arguments);
        this.refresh();
    },

    /**
     * APIMethod: removeFeatures
     * 从当前图层中删除指定的标签要素数组。这个函数擦除所有传递进来的标签要素。
     * 参数 features 数组中的每一项，必须是已经添加到当前图层 labelFeatures 中的标签要素，
     * 如果无法确定参数 features 数组，则可以调用 removeAllFeatures 来删除所有标签要素。
     * 如果要删除的 features 数组中的元素特别多，推荐使用 removeAllFeatures 删除所有 feature 后再重新添加，这样效率会更高。
     *
     * Parameters:
     * features - {Array(<SuperMap.Feature.Vector>)} 要从 labelFeatures 中删除的标签要素数组。
     */
    removeFeatures: function(features) {
        if(!features || features.length === 0) {
            return;
        }
        if (features === this.labelFeatures) {
            return this.removeAllFeatures();
        }
        if (!(SuperMap.Util.isArray(features))) {
            features = [features];
        }
        if (features === this.selectedFeatures) {
            features = features.slice();
        }

        var featuresFailRemoved = [];
        for (var i = features.length - 1; i >= 0; i--) {
            var feature = features[i];

            delete this.unrenderedFeatures[feature.id];

            //如果我们传入的feature在labelFeatures数组中没有的话，则不进行删除，
            //并将其放入未删除的数组中。
            var findex = SuperMap.Util.indexOf(this.labelFeatures, feature);
            if(findex === -1) {
                featuresFailRemoved.push(feature);
                continue;
            }

            this.labelFeatures.splice(findex, 1);
            if (SuperMap.Util.indexOf(this.selectedFeatures, feature) != -1){
                SuperMap.Util.removeItem(this.selectedFeatures, feature);
            }
            //这里移除了feature之后将它的layer也移除掉，避免内存泄露
            feature.layer = null;
        }

        //先清除再重绘。
        this.renderer.clear();

        var drawFeatures = [];
        for(var hex = 0, len = this.labelFeatures.length; hex < len; hex++){
            feature = this.labelFeatures[hex];
            drawFeatures.push(feature);
        }

        this.addOrReAddFeas(this.getDrawnFeatures(drawFeatures));
        //this.addFeatures(drawFeatures);

        var succeed = featuresFailRemoved.length == 0 ? true : false;
        this.events.triggerEvent("featuresremoved", {features: featuresFailRemoved, succeed: succeed});

        SuperMap.Layer.Vector.prototype.removeFeatures.apply(this, arguments);
    },

    /**
     * APIMethod: getFeatureBy
     * 在标签要素数组 labelFeatures 里面遍历每一个标签要素 feature，当feature[property]==value时，
     * 返回此标签要素 feature（并且只返回第一个）。
     *
     * Parameters:
     * property - {String}feature的某个属性名称。
     * value - {String}property所对应的值。
     *
     * Returns:
     * {<SuperMap.Feature.Vector>} 第一个匹配属性和值的标签要素。
     */
    getFeatureBy: function(property, value) {
        var feature = null;
        for(var id in this.labelFeatures) {
            if(this.labelFeatures[id][property] == value) {
                feature = this.labelFeatures[id];
                break;
            }
        }
        return feature;
    },

    /**
     * APIMethod: getFeatureById
     * 通过给定一个id，从标签要素数组 labelFeatures 中返回对应的标签要素。
     *
     * Parameters:
     * featureId - {String}标签要素的属性id。
     *
     * Returns:
     * {<SuperMap.Feature.Vector>} 对应id的标签要素，如果不存在则返回null。
     */
    getFeatureById: function(featureId) {
        return this.getFeatureBy('id', featureId);
    },

    /**
     * APIMethod: getFeaturesByAttribute
     * 通过给定一个属性的key值和value值，从标签要素数组 labelFeatures 中返回所有匹配的标签要素数组。
     *
     * Parameters:
     * attrName - {String}属性的key。
     * attrValue - {Mixed}属性对应的value值。
     *
     * Returns:
     * Array(<SuperMap.Feature.Vector>) 一个匹配的标签要素数组。
     */
    getFeaturesByAttribute: function(attrName, attrValue) {
        var feature,
            foundFeatures = [];
        for(var id in this.labelFeatures) {
            feature = this.labelFeatures[id];
            if(feature && feature.attributes) {
                if (feature.attributes[attrName] === attrValue) {
                    foundFeatures.push(feature);
                }
            }
        }
        return foundFeatures;
    },

    /**
     * APIMethod: getDataExtent
     * 父类方法，此类中已经废弃。
     */
    getDataExtent: function () {
        return SuperMap.Layer.Vector.prototype.getDataExtent.apply(this, arguments);
    },

    /**
     * Method: convertFeaturesToLabelFeatures
     * 将矢量要素数组转为标签要素数组。
     *
     * Parameters:
     * features - {Array(<SuperMap.Feature.Vector>)} 要素数组。
     * labelExpression - {String} 指定标签要显示的要素（features）属性(attributes)字段名称。
     * options - {Object} 矢量要素数组转标签要素数组过程中的一些可设属性，有效的选项取决于特定的几何类型。
     *
     * Valid options:
     * isLabelRotationWithLine - {Boolean} 标签是否沿线旋转。
     *
     * Returns:
     * {Array(<SuperMap.Feature.Vector>)}  标签要素数组。 对几何类型 SuperMap.Geometry.LineString 和 SuperMap.Geometry.MultiLineString 有效。
     */
    /*
     convertFeaturesToLabelFeatures: function (features, labelExpression, option) {
     if(!features || !labelExpression || features.length === 0) return null;

     if (!(SuperMap.Util.isArray(features))) {
     features = [features];
     }

     var labelFea, labelFeas = [];

     var fea, text, geoText;
     for (var k = 0; k < features.length; k++) {
     fea =  features[k];
     //设用户指定的字段为标签内容
     text = fea.attributes[labelExpression];

     switch (fea.geometry.CLASS_NAME) {
     case "SuperMap.Geometry.LineString":
     var gtInfo_l = this.getLineCenter(fea.geometry);
     geoText = new SuperMap.Geometry.GeoText(gtInfo_l.x, gtInfo_l.y, text);
     labelFea = new SuperMap.Feature.Vector(geoText, fea.attributes);
     //存储标签沿线旋转所需的信息
     if(option && option.isLabelRotationWithLine) {
     labelFea.isLabelRotationWithLine = option.isLabelRotationWithLine;
     labelFea.relevanceGeometry = fea.geometry;
     labelFea.centerPointIndex = gtInfo_l.cenPoiIndex;
     }
     labelFeas.push(labelFea);
     break;
     case "SuperMap.Geometry.Polygon":
     for (var i = 0; i < fea.geometry.components.length; i++) {
     var gtInfo_p = this.getPolygonLabelLocation(fea.geometry.components[i]);
     geoText = new SuperMap.Geometry.GeoText(gtInfo_p.x, gtInfo_p.y, text);
     labelFea = new SuperMap.Feature.Vector(geoText, fea.attributes);
     labelFeas.push(labelFea);
     }
     break;
     case "SuperMap.Geometry.MultiPoint":
     for (var i = 0; i < fea.geometry.components.length; i++) {
     geoText = new SuperMap.Geometry.GeoText(fea.geometry.components[i].getCentroid().x, fea.geometry.components[i].getCentroid().y, text);
     labelFea = new SuperMap.Feature.Vector(geoText, fea.attributes);
     labelFeas.push(labelFea);
     }
     break;
     case "SuperMap.Geometry.MultiLineString":
     for (var i = 0; i < fea.geometry.components.length; i++) {
     var gtInfo = this.getLineCenter(fea.geometry.components[i]);
     geoText = new SuperMap.Geometry.GeoText(gtInfo.x, gtInfo.y, text);
     labelFea = new SuperMap.Feature.Vector(geoText, fea.attributes);
     //存储标签沿线旋转的
     if(option && option.isLabelRotationWithLine) {
     labelFea.isLabelRotationWithLine = option.isLabelRotationWithLine;
     labelFea.relevanceGeometry = fea.geometry.components[i];
     labelFea.centerPointIndex = gtInfo.cenPoiIndex;
     }
     labelFeas.push(labelFea);
     }
     break;
     case "SuperMap.Geometry.MultiPolygon":
     for (var j = 0; j < fea.geometry.components.length; j++) {
     var feaGeoC = fea.geometry.components[j];
     for (var i = 0; i < feaGeoC.components.length; i++) {
     var gtInfo_p = this.getPolygonLabelLocation(feaGeoC.components[i]);
     geoText = new SuperMap.Geometry.GeoText(gtInfo_p.x, gtInfo_p.y, text);
     labelFea = new SuperMap.Feature.Vector(geoText, fea.attributes);
     labelFeas.push(labelFea);
     }
     }
     break;
     //case "SuperMap.Geometry.LinearRing":
     //case "SuperMap.Geometry.Polygon":
     //case "SuperMap.Geometry.Collection":
     //case "SuperMap.Geometry.Curve":
     default:
     geoText = new SuperMap.Geometry.GeoText(fea.geometry.getCentroid().x, fea.geometry.getCentroid().y, text);
     labelFea = new SuperMap.Feature.Vector(geoText, fea.attributes);
     labelFeas.push(labelFea);
     break;
     }

     }
     return labelFeas;
     },
     */

    /**
     * Method: getLineCenter
     * 获取线的中点位置
     *
     * Parameters:
     * geometry - {Array(<SuperMap.Geometry>)} 线性的geometry。
     *
     * Returns:
     * {Object}  该对象包含3个属性，x为线中的的横坐标，y为线中点的纵坐标，cenPoiIndex为线中点所在线段的第一个端点的索引 。
     */
    /*
     getLineCenter: function(geometry){
     var length = 0.0;
     var lenArr = [];

     //计算线的长度并将线的每个线段长度存入数组
     if ( geometry.components && (geometry.components.length > 1)) {
     for(var i=1, len=geometry.components.length; i<len; i++) {
     length += geometry.components[i-1].distanceTo(geometry.components[i]);
     lenArr.push(length);
     }
     }

     var cenPoiLen = lenArr[lenArr.length - 1]/2;
     var geoCompIndex = -1;
     var subLen = -1;
     //获取线中点所在线段的第一个端点的索引及线中点与此端点的距离
     for(var i = 0, len = lenArr.length; i < len; i++){
     if(lenArr[i] > cenPoiLen){
     geoCompIndex = i;
     if(i == 0){
     subLen = cenPoiLen;
     }else{
     subLen = cenPoiLen - lenArr[i -1];
     }
     break;
     }
     else if(lenArr[i] == cenPoiLen){
     geoCompIndex = i + 1;
     break;
     }
     }

     var geoComp = geometry.components[geoCompIndex];
     var geoCompNext = geometry.components[geoCompIndex + 1];

     //返回线中点位置及角度。
     var cenPoi = {};
     //线中点所在线段的第一个端点的索引
     cenPoi.cenPoiIndex = geoCompIndex;

     if( (geoCompIndex > -1) && (subLen == -1) ) {
     //var geoCompPre = geometry.components[geoCompIndex - 1];
     cenPoi.x = geoComp.x;
     cenPoi.y = geoComp.y;
     //cenPoi.angle = this.getAngleByPoisWithX(geoCompPre.x, geoCompPre.y, geoCompNext.x, geoCompNext.y)
     return cenPoi;
     }
     else if( (geoCompIndex > -1) && (subLen > -1) ){
     var cenLoc = this.getPoiFromLineBylength(geoComp.x, geoComp.y, geoCompNext.x, geoCompNext.y, subLen);
     cenPoi.x =  cenLoc[0];
     cenPoi.y =  cenLoc[1];
     //cenPoi.angle = this.getAngleByPoisWithX(geoComp.x, geoComp.y, geoCompNext.x, geoCompNext.y)
     return cenPoi;
     }
     else{
     return null;
     }
     },
     */

    /**
     * Method: getPoiFromLineBylength
     * 获线段上取距离线段一个端点为length的点坐标。
     *
     * Parameters:
     * x - {Number}  线段第一个端点横坐标。
     * y - {Number}  线段第一个端点纵坐标。
     * rx - {Number}  线段第二个端点横坐标。
     * ry - {Number}  线段第二个端点纵坐标。
     * length - {Number} 距离线段第一个端点的距离
     * Returns:
     * {Array} 点坐标，数组的第一个元素为x坐标，第二个元素为y坐标,。
     */
    /*
     getPoiFromLineBylength: function(x1, y1, x2, y2, length){
     var xd= x2 - x1;
     var yd = y2 - y1;
     var d =  Math.pow((xd * xd + yd * yd), 0.5);

     if(d < length) return null;

     var x = xd*(length/d) + x1;
     var y = yd*(length/d) + y1;

     return [x, y];
     },*/

    /**
     * Method: getPoiFromLineBylength
     * 获取两个点连线与想轴的倾角。
     *
     * Parameters:
     * x - {Number}  线段第一个端点横坐标。
     * y - {Number}  线段第一个端点纵坐标。
     * rx - {Number}  线段第二个端点横坐标。
     * ry - {Number}  线段第二个端点纵坐标。
     *
     * Returns:
     * {Array} 线段倾斜角度，范围[-90, 90]。
     */
    /*
     getAngleByPoisWithX: function(x1, y1, x2, y2){
     var xd= x2 - x1;
     var yd = y2 - y1;

     var angle = null;
     var angleArc = null;

     if(xd == 0){
     if(yd > 0){
     angle = -90;
     }else{
     angle = 90;
     }

     }
     else if(yd == 0){
     angle = 0;
     }
     else{
     angleArc = Math.atan2(Math.abs(xd), Math.abs(yd));

     if(xd > 0 && yd > 0){
     angle =  (angleArc/(Math.PI))*180 - 90;
     }
     else if(xd < 0 && yd > 0){
     angle = 90 - (angleArc/(Math.PI))*180;
     }
     else if(xd < 0 && yd < 0){
     angle = (angleArc/(Math.PI))*180 - 90;
     }
     else if(xd > 0 && yd < 0){
     angle =  90 - (angleArc/(Math.PI))*180;
     }
     }

     return angle;
     },
     */

    /**
     * Method: getPolygonLabelLocation
     * 获取面要素的标签位置
     *
     * Parameters:
     * geometry - {Array(<SuperMap.Geometry>)} 几何面geometry。
     *
     * Returns:
     * {Array}
     */
    /*
     getPolygonLabelLocation: function(geometry){
     //标签位置
     var labelLoction = new Object();

     var geoComp = geometry.components;
     var len =   geoComp.length;
     //几何面
     var poly = [];
     for(var i =0; i < len; i++) {
     var poitmp = new Object();
     poitmp.x = geoComp[i].x;
     poitmp.y = geoComp[i].y;
     poly.push(poitmp);
     }

     //面的质心
     var centroid = geometry.getCentroid();
     //如果质心在几何面内，用质心表示标签位置
     if( this.isPointInPoly(centroid, poly) ){
     labelLoction.x = centroid.x;
     labelLoction.y = centroid.y;
     return labelLoction;
     }
     else{
     if ( geometry.components && (geometry.components.length > 4)) {
     //一个对角线信息相关数组
     var pts = [];

     for(var i=0, len = geoComp.length; i < len -1; i++) {
     for(var j = i + 2; j<len - 2; j++) {
     //对角线中点
     var pt = {};
     pt.x =  (geoComp[i].x + geoComp[j].x)/2;
     pt.y =  (geoComp[i].y + geoComp[j].y)/2;
     //如果对角线中点在几何面内，保持这条对角线信息到数组 pts
     if(this.isPointInPoly(pt, poly)){
     pt.distance = this.calculatePoisDistance(geoComp[i].x, geoComp[i].y, geoComp[j].x, geoComp[j].y);
     pts.push(pt);
     }
     }
     if(pts.length > 0)  break;
     }

     if(pts.length == 0) {
     labelLoction.x = centroid.x;
     labelLoction.y = centroid.y;
     return labelLoction;
     };

     var maxLen = 0;
     var index = -1;
     //找到长度最大的对角线索引
     for(var i = 0, lentmp = pts.length; i < lentmp; i++) {
     if(pts[i].distance > maxLen){
     maxLen = pts[i].distance;
     index = i;
     }
     }

     labelLoction.x = pts[index].x;
     labelLoction.y = pts[index].y;
     return labelLoction;
     }
     else{
     labelLoction.x = centroid.x;
     labelLoction.y = centroid.y;
     return labelLoction;
     }
     }
     },
     */
    /**
     * Method: getLabelsFromJson
     * 从Json获取标签数组。
     *
     * Parameters:
     * featureLabelsJson - {String/Array} 表示GeoText的json字符串(或数组)。形如：
     * (start code)
     * {
     *       featureLabels: [
     *          {"x":"35","y":"35","text":"SUMPER MAP"},
     *          {"x":"25","y":"25","text":"THEMELABEL"},
     *      ];
     * }
     * (end)
     * Returns:
     * {Array(<SuperMap.Feature.Vector>)}  标签要素数组。
     */
    /*
     getFeatureLabelsFromJson: function (featureLabelsJson) {
     if(!featureLabelsJson) return null;
     var labelFea, labelFeas = [];

     if(featureLabelsJson){
     if(featureLabelsJson.featureLabels){
     var feaLabs = featureLabelsJson.featureLabels;
     for (var i = 0, len = feaLabs.length; i < len; i++) {
     var fli = feaLabs[i];
     labelFea = new SuperMap.Feature.Vector(this.jsonToGeoText(fli));
     if(fli.attributes){
     labelFea.attributes = fli.attributes;
     }
     labelFeas.push(labelFea);
     }
     }else if(SuperMap.Util.isArray(featureLabelsJson) && featureLabelsJson.length && featureLabelsJson.length > 0){
     for (var i = 0, len = featureLabelsJson.length; i < len; i++) {
     var fli =  featureLabelsJson[i];
     labelFea = new SuperMap.Feature.Vector(this.jsonToGeoText(fli));
     if(fli.attributes){
     labelFea.attributes = fli.attributes;
     }
     labelFeas.push(labelFea);
     }
     }else if(featureLabelsJson && featureLabelsJson.x && featureLabelsJson.y && featureLabelsJson.text){
     labelFea = new SuperMap.Feature.Vector(this.jsonToGeoText(featureLabelsJson));
     if(featureLabelsJson.attributes){
     labelFea.attributes = featureLabelsJson.attributes;
     }
     labelFeas.push(labelFea);
     }
     }

     return labelFeas;
     },
     */

    /**
     * Method: jsonToGeoText
     * 将表示GeoText的Json转为GeoText对象（单个）。
     *
     * Parameters:
     * geoTextJson - {String}  表示GeoText的Json字符串。
     *
     * Returns:
     * {<SuperMap.Geometry.GeoText>}  GeoText对象。
     */
    /*
     jsonToGeoText: function (geoTextJson) {
     if(!geoTextJson || !geoTextJson.x || !geoTextJson.y || !geoTextJson.text) return null;

     var geoText;
     if(parseInt(geoTextJson.x) && parseInt(geoTextJson.y) && geoTextJson.text)
     {
     geoText = new SuperMap.Geometry.GeoText(parseInt(geoTextJson.x), parseInt(geoTextJson.y), geoTextJson.text);
     }
     return geoText;
     },
     */

    CLASS_NAME: "SuperMap.Layer.ThemeLabel"
});
