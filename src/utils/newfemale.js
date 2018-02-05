String.prototype.toNumber = function(){
	return Number(this.replace(/px/gi,""));
}
var nowday=0;
let helper = {
	$ : function(tagId){return document.getElementById(tagId);},
	$c : function(tagName){return document.createElement(tagName);},
	bind : function(eventObj,eventType,eventMethod){
		if(window.attachEvent){
			eventObj.attachEvent("on" + eventType,eventMethod);
		}else{
			eventObj.addEventListener(eventType,eventMethod,false);
		}
	},
	delbind : function(eventObj,eventType,eventMethod){
		//匿名函数好像无用
		if(window.detachEvent){
			eventObj.detachEvent("on" + eventType,eventMethod);
		}else{
			eventObj.removeEventListener(eventType,eventMethod,false);
		}
	},
	position : function(parentObj){
		var parentTop = parentObj.offsetTop;
		var parentLeft = parentObj.offsetLeft;
		while(parentObj = parentObj.offsetParent){
			parentTop += parentObj.offsetTop;
			parentLeft += parentObj.offsetLeft;
		}
		return {
			top : parentTop,
			left : parentLeft
		}
	}
}
window.helper = helper
let calendar = {
	args : {
		year : 0,
		month : 0,
		day : 0,
		minMensesPriod: 28,
		dayArray : [31,28,31,30,31,30,31,31,30,31,30,31],
		target : null,
		callback: ()=>{}
	},
	initYear : function(year){
		var leftYear = year;
		var yearLayer = helper.$c("DIV");
		yearLayer.id = "yearLayer";
		yearLayer.className = "yearLayer";
		yearLayer.style.display = 'none';
		var yearList = helper.$c("UL");
		var yearItems = [helper.$c("LI"),helper.$c("LI"),helper.$c("LI")];
		for(var i=0;i<3;i++){
			helper.bind(yearItems[i],"mouseover",function(evt){
				var evnt = evt || window.event;
				var target = evnt.srcElement || evnt.target;
				target.style.backgroundColor = "#fff";
				helper.bind(target,"mouseout",function(evt0){
					var evnt0 = evt0 || window.event;
					var target0 = evnt0.srcElement || evnt0.target;
					target0.style.backgroundColor = "#FFF";
				});
			});
			helper.bind(yearItems[i],"click",function(evt){
				var evnt = evt || window.event;
				var target = evnt.srcElement || evnt.target;
				target.style.backgroundColor = "#EEE";
				var str=target.innerHTML;
				var ss = str.match(/\d{4}/);
				target.innerHTML=ss[0];
				calendar.show(parseInt(target.innerHTML.replace(/&#24180;/,"")),parseInt(helper.$("leftMonth").innerHTML)-1);
			});
		}
		document.body.appendChild(yearLayer);
		$("#yearLink").bind("click", function(){
			
			try{
				document.body.removeChild(helper.$("monthLayer"));
			}catch(e){}
			calendar.showLayer(helper.$("yearLayer"),helper.$("yearLink"));
			helper.bind(helper.$("yearLayer"),"mouseover",function(){helper.$("yearLink").className='current';});
			helper.bind(helper.$("yearLayer"),"mouseout",function(){helper.$("yearLink").className='';});
			calendar.args.target = helper.$("yearLink");
		});
		$("#rYearLink").bind("click", function(){
			
			try{
				document.body.removeChild(helper.$("monthLayer"));
			}catch(e){}
			calendar.showLayer(helper.$("yearLayer"),helper.$("rYearLink"));
			helper.bind(helper.$("yearLayer"),"mouseover",function(){helper.$("rYearLink").className='current';});
			helper.bind(helper.$("yearLayer"),"mouseout",function(){helper.$("rYearLink").className='';});
			calendar.args.target = helper.$("rYearLink");
		});
		helper.bind(document,"click",function(evt){

			var evnt = evt || window.event;
			var target = evnt.srcElement || evnt.target;
			
			if(target.tagName.toLowerCase() == "a"  || ( typeof(target.name) != 'undefined' && target.name == 'cLL' ) ){
			}
		});
	},
	init : function(year,month){
		calendar.year = year
		calendar.month = month
		calendar.initYear(year);
		$("#monthLink").bind("click", function(){
			
			if(document.getElementById("monthLayer") != null ){
				try{
					document.body.removeChild(helper.$("monthLayer"));
				}catch(e){}
			} else{document.getElementById("nowElement").value = "monthLink";
			helper.$("yearLayer").style.display = "none";
			
			}
			return false;
		}); 
		$("#rMonthLink").bind("click", function(){
			document.getElementById("nowElement").value = "rMonthLink";
			helper.$("yearLayer").style.display = "none";
			calendar.showLayer(helper.$("monthLayer"),helper.$("rMonthLink"));
			helper.bind(helper.$("monthLayer"),"mouseover",function(){helper.$("rMonthLink").className='current';});
			helper.bind(helper.$("monthLayer"),"mouseout",function(){helper.$("rMonthLink").className='';});
			
			calendar.args.target = helper.$("rMonthLink");

		});

	},
	showLayer : function(layer,target){
		target = target || calendar.args.target;
		layer.style.display = "block";
		var pos = helper.position(target);
		layer.style.left = pos.left - layer.clientWidth + 25 + "px";
		layer.style.top = pos.top + 22 + "px";
	},
	show : function(year,month,day){
		female.args.day = day
		calendar.args.dayArray[1] = (calendar.isLeapYear(year) ? 29 : 28);
		var firstDayOfLeftMonth = new Date(year,month,1).getDay();
		var maxDayOfLeftMonth = calendar.args.dayArray[month];
		
		var nextMonth = ((month + 1 > 11) ? 0 : (month + 1));
		var nextYear = ((month + 1 > 11) ? year+1 : year );
		calendar.args.dayArray[1] = (calendar.isLeapYear(nextYear) ? 29 : 28);
		var firstDayOfRightMonth = new Date(nextYear,nextMonth,1).getDay();
		var maxDayOfRightMonth = calendar.args.dayArray[nextMonth];

		var year = Number(calendar.year);
		var month = Number(calendar.month);

		calendar.fill(helper.$("leftTable"),firstDayOfLeftMonth,maxDayOfLeftMonth);
	},
	fill : function(calendarTable,dayCount,maxDay){
		console.error(calendar.args.callback)
		var now = new Date().getTime();
		var minDay = 1;
		var list =calendarTable.getElementsByTagName("li");
		var starti=7;
		for(var i=1;i<7;i++){
			for(var j=0;j<7;j++){
				if(dayCount > 0 || minDay > maxDay){
					list[starti].innerHTML = "<a href='javascript:void(0);'>&nbsp;</a>";
					dayCount--;
				}else{
					list[starti].innerHTML = "<a href='javascript:void(0);'>"+minDay+"</a>";
					list[starti].onclick = function(){
						female.args.day = parseInt(this.getElementsByTagName('a')[0].innerHTML);
						let txt=this.getElementsByTagName('a')[0].innerHTML;
						calendar.args.callback(txt)
						female.calculate(calendar.args.year, calendar.args.month, calendar.args.minMensesPriod);

						// this.getElementsByTagName('a')[0].className = 'aBlue';
						calendar.trans();
					};
					minDay++;
				}
				starti++;
			}
		}
	},
	trans : function(){
		if($("#rightCal").css('display') == "none")
		{
			$("#womensafeDateCon .safe_calendar").eq(0).attr('style','margin-left:0;');
			$("#womensafeDateCon .safe_calendar").eq(1).attr('style','margin-left:0;');
			$("#womensafeDateCon .safe_calendar").eq(0).hide();
			$("#womensafeDateCon .safe_calendar").eq(0).animate({
			   left: 38, opacity: 'show'
			 }, 1000); 
			$("#womensafeDateCon .safe_calendar").eq(1).animate({
			   left: 388, opacity: 'show'
			 }, 1000);
			$("#monthLink").unbind();
			$("#yearLink").unbind();
			$("#rYearLink").unbind();
			$("#rMonthLink").unbind();
			if(nowday != 0)
			{
				$('#acrest').show();
			}
			$('#chosecal').addClass('safe_calendar_left');
		}
		
	},
	clear : function(){
		var leftTable = helper.$("leftTable");
		var listLT =leftTable.getElementsByTagName("li");
		var starti=7;
		for(var i=1;i<7;i++){
			for(var j=0;j<7;j++){
				listLT[starti].getElementsByTagName("a")[0].className='';
				listLT[starti].getElementsByTagName("a")[0].removeAttribute("className"); 
				$("#leftTable li:eq("+starti+") a em").remove();
				
				if(typeof(listLT[starti].getElementsByTagName("a")[0].getElementsByTagName("em")[0]) !="undefined")
				{
					$("#leftTable li:eq("+starti+") a:eq(0) em").remove();
				}
				
				starti++;
			}
		}
	},
	isLeapYear : function(year){
		if((year % 4 == 0 && year % 100 != 0) || year % 400 == 0){
			return true;
		}
		return false;
	}
}
window.calendar = calendar
let female = {
	args : {
		day : 1
	},
	check : function(){

			// var minMensesPriod = helper.$("minMensesPriod").value;
			// //var minMensesing = helper.$("minMensesing").value;
			// // check priod
			// if(isNaN(minMensesPriod) || (Number(minMensesPriod) > 40 || Number(minMensesPriod) < 24)){
			// 	alert("&#35831;&#36755;&#20837;&#25968;&#23383;&#24182;&#20171;&#20110;24&#19982;40&#20043;&#38388;");
			// 	return false;
			// }
			// helper.$("aZlue").innerHTML = "<em class='aBlue'></em>间隔:  :" + minMensesPriod;
			return true;

	},
	calculate : function(year,month){

		var minMensesing = helper.$("minMensesing").value;
		// console.log('行经天数：'+minMensesing)
		// var year = Number(calendar.year);
		// var month = Number(calendar.month);
		var day = female.args.day;
		console.log('female的day：'+day)
		var lastTime = new Date(Date.UTC(year,month-1,day)).getTime();
		female.show(helper.$("leftTable"),year,month,lastTime);

	},
	show : function(table,year,month,lastTime){
		
		var minMensesPriod = calendar.args.minMensesPriod;
		var minMensesing = helper.$("minMensesing").value;
		
		minMensesPriod = Number(minMensesPriod);
		minMensesing = Number(minMensesing);
		var secondUnit = 24 * 60 * 60 * 1000;
		var k = 0;
		var list = table.getElementsByTagName("li");
		var starti=7;
		for(var i=1;i<7;i++){
			for(var j=0;j<7;j++){

				var calDayItem = list[starti].getElementsByTagName("a")[0];
				if(calDayItem.innerHTML == ""){
					continue;
				}else{
					var calDay = Number(parseInt(calDayItem.innerHTML));
					var calTime = new Date(Date.UTC(year,month-1,calDay)).getTime();
					var dayDiff = Math.floor((calTime - lastTime) / secondUnit);
					var result = (dayDiff % minMensesPriod + minMensesPriod) % minMensesPriod;
					if(result >= 0 && result <= 4){
						var txt=calDayItem.innerHTML;
						calDayItem.className='aYellow '+txt;
						// calDayItem.add('type', '月经期')
					}else if(result >= 5 && result <= (minMensesPriod - 20)){//20
						var txt=calDayItem.innerHTML;
						// calDayItem.innerHTML = txt+ "<em class='emTipGreen'>安全期</em>";
						calDayItem.className='aGreen '+txt;
					}else if(result >= (minMensesPriod - 19) && result <= (minMensesPriod - 10)){//19 10
						var txt=calDayItem.innerHTML;
						// calDayItem.innerHTML = txt+ "<em class='emTipRed'>危险期</em>";
						calDayItem.className='aRed '+txt;
					}else if(result >= (minMensesPriod - 9) && result <= (minMensesPriod - 1)){//9 1
						var txt=calDayItem.innerHTML;
						// calDayItem.innerHTML = txt+ "<em class='emTipGreen'>安全期</em>";
						calDayItem.className='aGreen '+txt;
					}
				}
				starti++;
			}
			
		}
	},
	increase : function(){
		var minMensesPriod = calendar.args.minMensesPriod;
		if(parseInt(minMensesPriod) >= 40){
			return false;
		}else{
			calendar.args.minMensesPriod = parseInt(minMensesPriod) + 1;
		}
	},
	fallOff : function(){
		var minMensesPriod = calendar.args.minMensesPriod;
		if(parseInt(minMensesPriod) <= 24){
			return false;
		}else{
			calendar.args.minMensesPriod = parseInt(minMensesPriod) - 1;
		}
	},
	creset : function(){
		// calendar.clear();
		nowday=0;
		if($("#rightCal").css('display') != "none")
		{
			$("#womensafeDateCon .safe_calendar").eq(0).attr('style','');
			$("#womensafeDateCon .safe_calendar").eq(1).attr('style','');
			$("#womensafeDateCon .safe_calendar").eq(1).hide();
			$('#acrest').hide();
		}
		$('#chosecal').removeClass('safe_calendar_left');
		var nowDate = new Date();
		calendar.init(nowDate.getFullYear(),nowDate.getMonth());
	},
	increase2 : function(){
		var minMensesing = helper.$("minMensesing").value;
		if(parseInt(minMensesing) >= 7){
			return false;
		}else{
			helper.$("minMensesing").value = parseInt(minMensesing) + 1;
		}
	},
	fallOff2 : function(){
		var minMensesing = helper.$("minMensesing").value;
		if(parseInt(minMensesing) <= 3){
			return false;
		}else{
			helper.$("minMensesing").value = parseInt(minMensesing) - 1;
		}
	}
}
window.female = female
// helper.bind(window,"load",function(){

// 	console.log('初始化1')
// 	var nowDate = new Date();

// 	// Number(nowDate.getMonth())
// 	// Number(nowDate.getFullYear())
	
// 	var year = (Number(nowDate.getFullYear()))
// 	var month = (Number(nowDate.getMonth()))
// 	calendar.show(year,month,nowDate.getDate());
// 	calendar.init(year,month);

// });
helper.bind(window,"resize",function(){

	console.log('初始化执行2')

	var yl = helper.$("yearLayer");
	var ml = helper.$("monthLayer");
	if(yl){
		if(yl.style.display == "block"){
			calendar.showLayer(yl);
		}
	}
	if(ml){
		if(ml.style.display == "block"){
			calendar.showLayer(ml);
			ml.style.left = ml.style.left.toNumber() - 155 + "px"
		}
	}
});

export const controlData = (year, month, day, minMensesPriod, callback)=>{

	calendar.args.year = year
	calendar.args.month = month
	calendar.args.minMensesPriod = minMensesPriod
	console.error(callback)
	calendar.args.callback = callback
	console.error(calendar.args.callback)
	calendar.show(year, month, day);
	calendar.init(year, month);
	female.calculate(year, month, minMensesPriod);

}
