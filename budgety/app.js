var budgetController = (function(){

	var Expense=function(id,description,value){
		this.id=id;
		this.description=description;
		this.value=value;
		this.percentage=-1;
	};

	Expense.prototype.calcPercentage = function(totalIncome) {
		if(totalIncome>0){
			this.percentage=Math.round((this.value/totalIncome)*100);
		}else{
			this.percentage=-1;
		}
		
	};

	Expense.prototype.getPercentage = function(){
		return this.percentage;
	};
	var Income=function(id,description,value){
		this.id=id;
		this.description=description;
		this.value=value;
	};

	var calculateTotal=function(type){
		var sum=0;
		data.allItems[type].forEach(function(current){
			sum=sum+current.value;
		});
		data.totals[type]=sum;
	};

	var data={
		allItems:{
			exp:[],
			inc:[]
		},
		totals:{
			exp:0,
			inc:0
		},
		budget:0,

		percentage:-1
	};

	return {
		addItem:function(type,des,val){
			var newItem,ID;

			if(data.allItems[type].length>0){
				ID=data.allItems[type][data.allItems[type].length-1].id+1;
			}else{
				ID=0;
			}		

			if(type === 'exp'){
				newItem = new Expense(ID,des,val);
			}else if(type=='inc'){
				newItem=new Income(ID,des,val);
			}
			data.allItems[type].push(newItem);
			return newItem;
		},

		DeleteItem:function(type,id){
			var ids,index;
			ids =data.allItems[type].map(function(current){
				return current.id;
			});

			index =ids.indexOf(id);
			if(index!==-1){
				data.allItems[type].splice(index,1);
			}
		},


		calculateBudget:function(){
			calculateTotal('exp');
			calculateTotal('inc');

			data.budget=data.totals.inc-data.totals.exp;
			if(data.totals.inc>0){
				data.percentage=Math.round((data.totals.exp/data.totals.inc)*100);
			}else{
				data.percentage=-1;
			}
		},


		calculatePercentage:function(){
			data.allItems.exp.forEach(function(current){
				current.calcPercentage(data.totals.inc);
			});
		},

		getPercentage:function(){
			var allperc=data.allItems.exp.map(function(cur){
				return cur.getPercentage();
			});
			return allperc;
		},

		getBudget:function(){
			return {
				budget:data.budget,
				totalInc:data.totals.inc,
				totalExp:data.totals.exp,
				percentage:data.percentage
			}
		},
		testing:function(){
			console.log(data);
		}
	};


})();


var UIController = (function(){

	var DOMstring={
		inputType:'.add__type',
		inputDescription:'.add__description',
		inputValue:'.add__value',
		inputBtn:'.add__btn',
		incomeContainer:'.income__list',
		expenseContainer:'.expenses__list',
		budgetLabel: '.budget__value',
		incomeLabel:'.budget__income--value',
		expenseLabel:'.budget__expenses--value',
		percentageLabel:'.budget__expenses--percentage',
		Container:'.container',
		expPerLabel:'.item__percentage',
		dateLabel:'.budget__title--month'
	};
	var formatNumber=function(num,type){
			var numSplit,int,dec,sign;
			num=Math.abs(num);
			num=num.toFixed(2);

			numSplit=num.split('.');

			int=numSplit[0];
			if(int.length>3){
				int=int.substr(0,int.length-3)+','+int.substr(int.length-3,int.length);
			}
			dec=numSplit[1];

			type==='exp'?sign='-':sign='+';
			return sign+' '+int+'.'+dec; 
		} ;

	return{
		getinput:function(){
			return{
			type : document.querySelector(DOMstring.inputType).value,
			description : document.querySelector(DOMstring.inputDescription).value,
			value :parseFloat(document.querySelector(DOMstring.inputValue).value),
			};
		},

		addListItem:function(obj,type){
			var html,newHtml,element;
			if(type==='inc'){
				element=DOMstring.incomeContainer;
				html='<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
			}else if(type==='exp'){
				element=DOMstring.expenseContainer;
				html='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
			}
			newHtml=html.replace('%id%',obj.id);
			newHtml=newHtml.replace('%description%',obj.description);
			newHtml=newHtml.replace('%value%',formatNumber(obj.value,type));

			document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
		},

		deleteListItem: function(selectorID) {
            
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
            
        },
		clearFields: function(){
			var fields,fieldsArr;
			fields= document.querySelectorAll(DOMstring.inputDescription +', '+DOMstring.inputValue);

			fieldsArr=Array.prototype.slice.call(fields);
			fieldsArr.forEach(function(current,index,array){
				current.value="";
			});
			fieldsArr[0].focus();
		},


		displayBudget:function(obj){
			var type;
			obj.budget>0?type='inc':type='exp';

			document.querySelector(DOMstring.budgetLabel).textContent=formatNumber(obj.budget,type);
			document.querySelector(DOMstring.incomeLabel).textContent=formatNumber(obj.totalInc,'inc');
			document.querySelector(DOMstring.expenseLabel).textContent=formatNumber(obj.totalExp,'exp');
			if(obj.percentage>0){
				document.querySelector(DOMstring.percentageLabel).textContent=obj.percentage;
			}else{
				document.querySelector(DOMstring.percentageLabel).textContent='--';
			}

		},

		displayPercentage: function(percentages){
			var fields=document.querySelectorAll(DOMstring.expPerLabel);
			var nodeListforEach=function(list,callback){
				for(var i=0;i<list.length;i++){
					callback(list[i],i);
				}
			};
			nodeListforEach(fields,function(current,index){
				if(percentages[index]>0){
					current.textContent=percentages[index]+'%';
				}else{
					current.textContent='--';	
				}
			});
		},

		displayMouth:function(){
			var now=new Date();
			var year=now.getFullYear();
			var months =["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul","Aug", "Sep", "Oct", "Nov", "Dec"];
			var month=now.getMonth(); 
			document.querySelector(DOMstring.dateLabel).textContent=months[month]+ ','+ year;
		},
		getDOMstring: function(){
			return DOMstring;
		}
	};
	
})();


var Controller = (function(budgetCtrl,UIctrl){

	var setupEventListeners=function(){
		var DOM=UIctrl.getDOMstring();
		document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);

		document.addEventListener('keypress',function(event){
			if(event.keyCode === 13 || event.which=== 13){
				ctrlAddItem();
			}
		});

		document.querySelector(DOM.Container).addEventListener('click',ctrlDeleteItem);
	};

	var updataBudget=function(){
		budgetCtrl.calculateBudget();

		var budget=budgetCtrl.getBudget();
		
		UIctrl.displayBudget(budget);
	};

	var updataPercentage=function(){
		budgetCtrl.calculatePercentage();
		var percentage=budgetCtrl.getPercentage();
		UIctrl.displayPercentage(percentage);

	}
	
	var ctrlAddItem = function(){
		var input,newItem;
		input =UIctrl.getinput();
		if(input.description!=="" && input.value !== NaN && input.value>0){
			newItem=budgetCtrl.addItem(input.type,input.description,input.value);
			UIctrl.addListItem(newItem,input.type);
			UIctrl.clearFields();
			updataBudget();
			updataPercentage();
		}
	};


	var ctrlDeleteItem=function(event){
		var itemID,splitId,type,ID;
		itemID= event.target.parentNode.parentNode.parentNode.parentNode.id;
		if(itemID){
			splitId=itemID.split('-');
			type=splitId[0];
			ID=parseFloat(splitId[1]);

			budgetCtrl.DeleteItem(type,ID);
			UIctrl.deleteListItem(itemID);
			updataBudget();
			updataPercentage();
		}
	};

	return{
		init:function(){
			UIctrl.displayBudget({
				budget:0,
				totalInc:0,
				totalExp:0,
				percentage:-1
			});
			setupEventListeners();
			UIctrl.displayMouth();
		}
	};
})(budgetController,UIController);

Controller.init();