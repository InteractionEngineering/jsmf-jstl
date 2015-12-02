/**
 *   JavaScript Modelling Framework (JSMF)
 *
©2015 Luxembourg Institute of Science and Technology All Rights Reserved
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

Authors : J.S. Sottet
 */

var JSTL = require('../index.js'); var TransformationModule= JSTL.TransformationModule;
var JSMF = require('jsmf'); var Model = JSMF.Model; var Class = JSMF.Class;

//Load the metamodels (in one file for the example)
var MMI = require('./MMFamily.js');
var MMO = require('./MMPerson.js');

//Load the model (in one file for the example)
var Mi = require('./MFamily.js');

//Create the outputModel
var Mo = new Model('Out');

var inspect = require('eyes').inspector({
    maxLength: 9000
});

// <=> to the underscore library.
var _ = require('lodash');

// ************************
//Helper
function isFemale(member) {
    //Warning writting the function name... checking empty table
    return (member.familyMother.length!=0 || member.familyDaughter.length!=0);
}

//Give the FamilyName the Meta way
/*
function familyName(member) {
    var result = '';
    var keys = [];

    _.each((member.conformsTo().__references), function(n,key){ //should also work chaining select and each
       if(n.type.__name=='Family') {
            keys.push(key);
        }
    });
    //console.log(keys);
    _.each(keys, function(id,el){
        if(member[id].length==0) {
            // do nothing
        } else {
            result = member[id][0].lastName;
        }
    });
    return result;
}
*/

function familyName(member) {
 var result = '' ;
    if(member.familyFather[0] != undefined) {
      result = member.familyFather[0].lastName;
    }
    if(member.familyMother.length!=0) {
       result = member.familyMother[0].lastName;
    }
    if(member.familySon.length!=0) {
       result = member.familySon[0].lastName;
    }
     if(member.familyDaughter.length!=0) {
       result = member.familyDaughter[0].lastName;
    }

return result;
}



//Rule
var Member2Male = {

    in : function(inputModel) {
        return  _.reject(inputModel.Filter(MMI.Member),
                    function(elem){
                      return isFemale(elem);
                    });
    },

    out : function(inp) {
        var d = MMO.Male.newInstance('');
        d.setfullName(inp.firstName+' '+familyName(inp));
        return [d];
    }
}

var Member2FeMale = {

    in : function(inputModel) {
        return  _.select(inputModel.Filter(MMI.Member),
                    function(elem){
                        return isFemale(elem);
                    });
    },

    out : function(inp) {
        var d = MMO.Female.newInstance('');
        console.log(familyName(inp));
        familyName(inp);
        d.setfullName(inp.firstName+' '+familyName(inp));
        return [d];
    }
}

// ***********************
var module = new TransformationModule('test', Mi.ma, Mo); //multiple
module.addRule(Member2Male);
module.addRule(Member2FeMale);

//Apply rule by rule...
//module.apply(t);
//module.apply(trule2);

//inspect(Mi.ma.Filter(MMI.Member));

//Apply all rules in the models and resolve references, actual transformation execution
module.applyAllRules();

inspect(Mo);

Mo.save();
