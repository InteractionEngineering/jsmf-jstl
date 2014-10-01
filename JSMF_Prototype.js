//DEF: Check Type Strict, Partial, None | Check Cardinality Strict, Partial, None, ...
//Natural => Formal

function Model(name) {
    this.__name = name;
    this.modellingElements={};   
}

Model.prototype.setModellingElements = function(Class) {
    this.modellingElements[Class.__name] = Class;
};

//
//M2
function Class(name) {
    this.__name = name;
    this.__attributes = {};
    this.__references = {};
// name = string, type = string
}

Class.prototype.setAttribute = function (name, type) {
    // verifier si le nom n'est pas d�j� pris, -> exception
    this.__attributes[name] = type;
};

//WARNING
Class.prototype.conformsTo = function() {
    var result = new Class();
    result = this;
    //console.log(Class.prototype);
    return Class.prototype;
};

//Relation nature: Composition? Inheritance? etc...
Class.prototype.setReference = function (name, type, cardinality, opposite) {
    // verifier si le nom n'est pas d�j� pris, -> exception
    this.__references[name] = {
        "type": type,
         "card": cardinality
    };
	//To be TESTED
    if (opposite !== undefined) {
        var tmp = this.__references[name];
        tmp.opposite = opposite;
    }
};

function makeAssignation(ob,index, attype) {
	//if attype = primitive JS type else ...
	var type = new attype;
    return function(param) {
		if(param.__proto__ == type.__proto__) {
			ob[index]=param;
        } else {
            console.log("Assigning wrong type: "+param.__proto__+" expected "+type.__proto__);
        }
    };
}

//WARNING To be Checked for type checking
function makeReference(ob,index, type, card) {
    return function(param) { 
        //checkType
      //console.log(type, param.conformsTo()); 
        if(type==param.conformsTo()) {
           // console.log("correct type assignation");
        } else {
            console.log("assigning wrong type: "+param.conformsTo().__name+" to current reference."+" Type "+type.__name+" was expected");
        }
        
        //CheckCardinality
        var elementsinrelation = ob[index].length; //Check number of elements
        if(card==1 && elementsinrelation >= 1) {
            console.log("error trying to multiple elements to a single reference");
        } else {
            ob[index].push(param);
        }
    };
}

Class.prototype.newInstance = function (name) {
    var result =  {};//new Class(name); //=> see promotion
    var self = this;
    
    // Assign the "type" to which M1 class is conform to.
    result.conformsTo = function() {
        return self; 
    };
    //create setter for attributes
    for (var i in this.__attributes) {
        result[i] = new this.__attributes[i]();
		var attype = this.__attributes[i];
        result["set"+i] = makeAssignation(result,i, attype);	
    }
    //create setter for references
    for (var j in this.__references) {
        result[j] = [];
        var type = this.__references[j].type;
        var card = this.__references[j].card;
        result["set"+j] = makeReference(result,j, type, card);
    }
    return result;
};

// M1 -- TESTS
var State = new Class("State"); //other instanciaitons ? create...
var Transition = new Class("Transition");

State.setAttribute("name", String);
State.setAttribute("id", String);
State.setReference("transition", Transition, -1);
State.setReference("SuperClass", Class.prototype, 1);
Transition.setReference("source", State, 1);
Transition.setReference("dest", State, 1);

var s = State.newInstance("actorDetails");
var s2 = State.newInstance("ActorSearch");
var transit = Transition.newInstance("transit");
var transitbis = Transition.newInstance("transitbis");
s.setname("t");
s.settransition(transit);
//s.settransition(s2); // will return an error wrong assignation 
console.log(State.__proto__);
console.log(State.prototype);
//s.setSuperClass(State);

//s.setSuperClass(Transition); // will return an error
//s.settransition(transit);
//console.log(s);

//Create Meta-class
/*var Entity = new Class("entity");
Entity.setAttribute("attribute", {});

var e = Entity.newInstance("e");
e.setattribute({"name":String}); */