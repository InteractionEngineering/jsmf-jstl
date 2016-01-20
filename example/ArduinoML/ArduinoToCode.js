/**
 *   JavaScript Modelling Framework (JSMF)
 *
©2015 Luxembourg Institute of Science and Technology All Rights Reserved
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

Authors : Nicolas Biri
 */

'use strict';

// model imports
var JSTL = require('../../index'); var Transformation = JSTL.Transformation;
var NAV = require('jsmf-magellan');
var Model = require('jsmf-core').Model;

// other imports
var _ = require('lodash');
var inspect = require('eyes').inspector({
    maxLength: 50000
});

// Metamodels
var MMI = require('./MMArduinoML');
var MMO = require('./MMAbstractCode');

// input file
var input = require('./MArduinoML').switchExample;
var output = new Model('Out');

var module = new Transformation();

module.addRule({
    in: function(x) { return NAV.allInstancesFromModel(MMI.App, x)},
    out: function(i) {
        var app = MMO.App.newInstance();
        this.assign(app, 'structural', [i]);
        this.assign(app, 'behavioural', [i]);
        return [app];
    }
});

module.addRule({
    in: function(x) { return NAV.allInstancesFromModel(MMI.App, x)},
    out: function(i) {
        var s = MMO.StructuralConcerns.newInstance();
        this.assign(s, 'alias', i.brick);
        this.assign(s, 'pinMode', i.brick);
        return [s];
    }
});

module.addRule({
    in: function(x) { return NAV.allInstancesFromModel(MMI.Brick, x)},
    out: function(i) {
        return [MMO.BrickAlias.newInstance({name: i.name, pin: i.pin})];
    }
});

module.addRule({
    in: function(x) { return NAV.allInstancesFromModel(MMI.Sensor, x)},
    out: function(i) {
        return [MMO.PinMode.newInstance({name: i.name, mode: MMO.IO.INPUT})];
    }
});

module.addRule({
    in: function(x) { return NAV.allInstancesFromModel(MMI.Actuator, x)},
    out: function(i) {
        return [MMO.PinMode.newInstance({name: i.name, mode: MMO.IO.OUTPUT})];
    }
});

module.addRule({
    in: function(x) { return NAV.allInstancesFromModel(MMI.App, x)},
    out: function(i) {
        var b = MMO.BehaviouralConcerns.newInstance();
        b.setTimeConfig(MMO.TimeConfig.newInstance({initialTime: 0, debounce: 200}));
        this.assign(b, 'stateFunction', i.state);
        this.assign(b, 'mainLoop', i.initial);
        return [b];
    }
});

module.addRule({
    in: function(x) { return NAV.allInstancesFromModel(MMI.State, x)},
    out: function(i) {
        var t = i.transition[0];
        var s = MMO.StateFunction.newInstance({
            name: i.name,
            readOn: t.sensor[0].pin,
            read: t.value
        });
        this.assign(s, 'write', i.action);
        return [s];
    }
});

module.addRule({
    in: function(x) { return NAV.allInstancesFromModel(MMI.State, x)},
    out: function(i) {
        return [MMO.MainLoop.newInstance({ init: i.name })];
    }
});


module.addRule({
    in: function(x) { return NAV.allInstancesFromModel(MMI.Action, x)},
    out: function(i) {
        return [MMO.Write.newInstance({
            on: i.actuator[0].pin,
            value: i.value
        })];
    }
});


// launch transformation
module.apply(input, output);

_.forEach(NAV.allInstancesFromModel(MMO.App, output), function(x) {console.log(MMO.App.toCode(x))});
