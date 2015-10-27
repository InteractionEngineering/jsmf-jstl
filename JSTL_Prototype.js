/**
 *   JavaScript Modelling Framework (JSMF)
 *
©2015 Luxembourg Institute of Science and Technology All Rights Reserved
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

Authors : J.S. Sottet, A Vagner
Contributors: G. Garcia-Frey

* ideas to be implemented : could extend JSMF model and class in order to support specific operation (such as filter on Class)
*                           could show transformation execution step by step, construct a model, etc.
*   todo : 
            - Rule extension (inheritance)
            - Multiple input/output models
            - Hide the complex object for input
            - Make a version that hide the "new Instance" - i.e., remove the require JSMF
*/

var JSMF = require('./JSMF_Prototype'); var Model = JSMF.Model; var Class = JSMF.Class;
//var _ = require('underscore');
var _ = require('lodash');
var hash = require('object-hash');
var inspect = require('eyes').inspector({
    maxLength: 9000
});

function TransformationModule(name, inputModel, outputModel) {
    this.name = name;
    this.inputModel = inputModel;
    this.outputModel = outputModel;
    this.rules = [];
    
    this.resolveRef = [];
    this.resolver =  {};
}

TransformationModule.prototype.addRule = function(rule) {
        //check first condition + rules
       this.rules.push(rule);
}

TransformationModule.prototype.apply = function(rule) {
    var self = this;
    
    //WARNING the input model is fixed and should be specified by the rule or for each rules (i.e., multiple input models).
    var i = rule.in(this.inputModel);
    
    //process output model elements
    _.each(i, function(id,index){
        var output = rule.out(id);  
      
        _.each(output, function(idx,index) { 
            if(idx.conformsTo==undefined) { //is resolve reference table (i.e. has no metamodel)
                self.resolveRef.push(output[index]);
            } else { //is outputelement (i.e. has a metamodel)
                var idHash = hash(id)
                //JSON.stringify(id)
                self.resolver[idHash]=output[index]; //WARNING STRINGIFY OBJECT AS KEY... should have other unique object id
                self.outputModel.setModellingElement(output[index]); //set the reference to created model element to outputModel
            }
        });
            
    });
}

TransformationModule.prototype.applyAllRules = function() {
    var self = this;
    _.each(self.rules, function(elem,index) {
            self.apply(elem); 
    });
    //inspect(self.resolveRef);
    _.each(self.resolveRef, 
       function(elem, index) {
        _.each(elem.target,  // get the type of the target(s) of the relation element in the input model in order to...
            function(elem2,index2) {  
                var target = self.resolver[hash(elem2)]; // ... resolve the target of the relation in the output model!
                var referenceFunctionName = 'set'+elem.relationname;
                elem.source[referenceFunctionName](target);
            }
        );
    });
}


module.exports = {

    TransformationModule: TransformationModule,

};
