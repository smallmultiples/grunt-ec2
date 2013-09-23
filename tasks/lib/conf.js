'use strict';

var _ = require('lodash');
var path = require('path');
var grunt = require('grunt');

function Config () {
}

Config.prototype.init = function (grunt) {
    if (this._ !== void 0) {
        return; // can't change after init
    }
    this._ = _.clone(process.env, true);

    grunt.config.requires('ec2');
    grunt.config.requires('pkg.version');

    var defaults = require('../../cfg/defaults.json');
    var user = grunt.config('ec2');

    if (typeof user === 'string') {
        user = grunt.file.readJSON(user);
    }

    _.assign(this._, defaults, user);

    this.resolve();

    Object.freeze(this._);
};

Config.prototype.resolve = function () {
    var _ = this._;

    d(_, 'PROJECT_ID', 'ec2');
    d(_, 'NODE_SCRIPT', 'app.js');

    df(_, 'SSH_KEYS_FOLDER', '../../private');
    df(_, 'RSYNC_IGNORE', '../../cfg/.rsyncignore');

    this._.SSH_KEYS_RELATIVE = path.relative(process.cwd(), this._.SSH_KEYS_FOLDER);
};

function d (_, key, value) {
    if (_[key] === void 0) {
        _[key] = value;
    }
}

function df (_, key, value) {
    if (_[key] === void 0) {
        _[key] = path.resolve(__dirname, value);
    } else {
        _[key] = path.join(process.cwd(), _[key]);
    }
}

Config.prototype.get = function (key) {
    if (this._ === void 0) {
        grunt.fatal('Attempted to get configuration value before initializing.');
    }

    if (key === void 0) {
        return this._;
    }

    return this._[key];
};

var config = new Config();

module.exports = Config.prototype.get.bind(config);
module.exports.init = Config.prototype.init.bind(config);