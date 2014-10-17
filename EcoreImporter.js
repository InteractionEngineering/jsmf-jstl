var xpath = require('xpath')
  , dom = require('xmldom').DOMParser;
var fs = require('fs');
var JSMF = require('./JSMF_Prototype'); var Model = JSMF.Model; var Class = JSMF.Class;
var _ = require('underscore');
var inspect = require('eyes').inspector({maxLength: 9000});
var xml2js = require('xml2js');

var ModelImport = [];

var metaModelFile = __dirname + '/'+ '/TDA.ecore'

var parser = new xml2js.Parser();


var InjectModel = new Model("Injected");

fs.readFile(metaModelFile, {encoding: "UTF-8"}, 
function(err, data) {
	parser.parseString(data, function (err, domain) {
		_.each(domain,function(element,index,list) { 
			_.each(element.eClassifiers, function(el1,ind1,list1) {
				var Local = el1.$;
				//if(local.xsi:type=='Ecore:EClass') { // ECLass vs EEnum
				var MElem = new Class(Local.name);
				_.each(el1.eStructuralFeatures, function(att2,ind2,list2) {
					var sFeature = att2.$;
					//console.log(sFeature['xsi:type']);
					switch(sFeature['xsi:type']) {
					case 'ecore:EAttribute':
						var featureType = _.last(sFeature.eType.split('//'));
						var JSMFType="";
						switch(featureType) {
							case "EString": 
								JSMFType = String;
							break;
							case "EInt":
								JSMFType = Number;
							break;
							case "EBoolean":
								JSMFType = Boolean;
							break;
							//WARNING : no else cases
						}
						if(JSMFType =="") {
							JSMFType = String;
							//console.log("Warning: no type or not idenfied type");
						}
						MElem.setAttribute(sFeature.name, JSMFType);
					break;
					case 'ecore:EReference' :
						var referenceType = _.last(sFeature.eType.split('//'));
						var card = sFeature.upperBound; //=> TO number
						if(card==undefined) {card=1;}
						//resolve reference type after the creation of all classes?
						MElem.setReference(sFeature.name,referenceType,card); // TO BE set : eOpposite		
					break;	
					}
				});
				InjectModel.setModellingElement(MElem);
			});
		});
	});
	resolveReference(InjectModel);
	//resolveInheritance(InjectModel);
	//inspect(InjectModel);
	var TaskClass = InjectModel.modellingElements['Task'];
	console.log(TaskClass);
	var instanceTask = TaskClass.newInstance("T");
	instanceTask.setname("Steering");
	instanceTask.setfrequency(3);
	//inspect(instanceTask);
	//add an object containing all the settings of an instance.
	var OperatorClass = InjectModel.modellingElements['Operator'];
	console.log(OperatorClass);
	var instanceOperator = OperatorClass.newInstance("ZT");
	instanceOperator.setsuperTask(instanceTask);
	//inspect(instanceOperator);
	
});
//

//model
function resolveReference(model, refModels) {
	var listName= [];
	for(z in model.modellingElements) {
		listName.push(model.modellingElements[z].__name)
	}
	for(i in model.modellingElements) {
		var currentElement = model.modellingElements[i];
		for(e in currentElement.__references) {
			var currentRef = currentElement.__references[e]; //WARNING current Ref can be instance of Array
			// the element is present in the current Model
				var realType = _.find(model.modellingElements,function(current) {return current.__name ==currentRef.type;}); //warning find the first that match, by name
				if(realType == undefined) {
					// create a proxy element (the referenced model element is present in another model?)
					console.log("modelling element not present in loaded models");
				} else {
					// current element is only a reference to the real element in the model
					//console.log(e,currentRef);
					model.modellingElements[i].setReference(e,realType,currentRef.card); //currentRef.opposite
				}
		}
	}
}